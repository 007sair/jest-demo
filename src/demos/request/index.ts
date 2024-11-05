import { notification } from 'antd';
import np from 'nprogress';
/* eslint-disable no-param-reassign */
/**
 * 封装fetch请求
 */
import queryString from 'query-string';

const pendingRequests = new Map<string, AbortController>(); // 存储正在进行的请求的AbortController

/**
 * Determine if a value is a FormData
 */
function isFormData(val: unknown) {
  return typeof FormData !== 'undefined' && val instanceof FormData;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * 响应体（response body）
 */
interface Result<T> {
  code: number;
  message?: string;
  data?: T;
  traceId?: string;
  success: boolean;
  error: boolean;
}

export interface Config extends Omit<RequestInit, 'body'> {
  baseURL?: string;
  method?: HttpMethod;
  /** 参数将会拼接到 url 上，如: GET 请求时使用 */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  params?: Record<string, any>;
  /** 参数会传入 body 中，如: POST 请求时使用 */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  body?: any;
  /** 是否使用藏经阁mock数据 */
  mock?: boolean;
  /** 是否使用信号中断 */
  useSignal?: boolean;
  /** 接口报错时，是否显示 notification */
  showErrorUI?: boolean;
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer';
}

const defaultConfig: Config = {
  baseURL: process.env.SC_BASIC_API,
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    /**
     * @jd/sso-oidc-web 必须配置
     * @link https://joyspace.jd.com/pages/7M5XsKbnFL81ije4jzWg
     */
    'X-Requested-With': 'XMLHttpRequest',
  },
  showErrorUI: true,
  responseType: 'json',
};

function request<T>(url: string, config?: Config): Promise<T | undefined>;
function request<T>(url: string, config?: Config, resData?: boolean): Promise<Result<T>>;

/**
 * @param outside 为true时，request函数会返回带有code、message、data的数据体；false时仅返回data
 */
async function request<T>(url: string, config?: Config, outside?: boolean) {
  const _config = { ...defaultConfig, ...config };
  const { params, mock, useSignal, showErrorUI, responseType, baseURL, ...init } = _config;
  const uid = Date.now();

  const requestId = `${_config.method}:${url}`; // 生成请求唯一标识
  if (useSignal) {
    if (pendingRequests.has(requestId)) {
      pendingRequests.get(requestId)?.abort();
    }
    const controller = new AbortController();
    _config.signal = controller.signal;
    pendingRequests.set(requestId, controller);
  }

  try {
    np.start();

    if (!/^http(s?):\/\//i.test(url)) {
      // biome-ignore lint/style/noParameterAssign: off
      url = (baseURL as string) + url;
    }

    /**
     * 使用 params 或 body 生成接口入参
     * @description 放在 params 上的参数会被拼接到 url 中，放到 body 上的会作为 object 传递
     * [!Note]:
     *   为什么不用 method 区分是拼接 url 或 传递给 body ？
     *   因为不是只有 GET 请求会把参数拼接到 url 上，一些 DELETE 等请求也会有这种拼接
     */
    if ('params' in _config) {
      const params = _config.params ?? {};
      // biome-ignore lint/style/noParameterAssign: off
      url = queryString.stringifyUrl({
        url,
        query: params,
      });
    } else if (init.body) {
      if (isFormData(init.body)) {
        /**
         * `FormData`与`headers`的坑：
         * @link https://zhuanlan.zhihu.com/p/34291688
         * @link https://stackoverflow.com/questions/17415084/multipart-data-post-using-python-requests-no-multipart-boundary-was-found/17438575
         */

        // biome-ignore lint/performance/noDelete: <explanation>
        delete init.headers;
      } else {
        init.body = JSON.stringify(init.body);
      }
    }

    const response = await fetch(url, init);

    pendingRequests.delete(requestId); // 请求完成后，从pendingRequests中移除

    if (!response.ok) {
      if (response.status === 401) {
        const { href } = window.location;
        window.location.href = `${process.env.SC_LOGIN_URL}?ReturnUrl=${encodeURI(href)}`;
      } else {
        if (showErrorUI) {
          notification.error({
            key: uid,
            message: `接口请求出错（${response.status}）`,
            description: `${init.method} ${url} ${response.statusText}`,
          });
        }
        throw new Error(`${response.statusText} (${response.status})`);
      }
    }

    const processResponse = () => {
      switch (responseType) {
        case 'text':
          return response.text();
        case 'blob':
          return response.blob();
        case 'arrayBuffer':
          return response.arrayBuffer();
        default:
          return response.json();
      }
    };

    const result: Result<T> = await processResponse();

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    if (['text', 'blob', 'arrayBuffer'].includes(responseType as any)) {
      return result;
    }
    if (responseType === 'json') {
      if (typeof result !== 'object' || typeof result.code !== 'number') {
        throw new Error('接口返回的数据格式错误');
      }
      switch (result.code) {
        case 200:
          return outside ? result : result.data;
        default:
          if (showErrorUI) {
            notification.error({ key: uid, message: `获取数据失败（${result.code}）`, description: result.message });
          }
          throw new Error(`${result.message} (${result.code})`);
      }
    }
  } finally {
    pendingRequests.delete(requestId); // 请求失败或被取消也应当从pendingRequests中移除
    np.done();
  }
}

export default request;
