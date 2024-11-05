import { notification } from 'antd';
import fetch from 'jest-fetch-mock';
import np from 'nprogress';
import queryString from 'query-string';
import request from '../request';

jest.mock('query-string', () => ({ stringifyUrl: jest.fn() }));
jest.mock('nprogress', () => ({ start: jest.fn(), done: jest.fn() }));

fetch.enableMocks();

const baseURL = 'https://api.example.com';

describe('request function', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    fetch.resetMocks();
    (queryString.stringifyUrl as jest.Mock).mockImplementation(({ url, query }) => {
      const searchParams = new URLSearchParams(query).toString();
      return `${url}${searchParams ? `?${searchParams}` : ''}`;
    });
    process.env = { ...originalEnv, SC_LOGIN_URL: 'https://login.example.com' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // 基本功能测试
  describe('Basic Functionality', () => {
    it('should make a GET request with correct parameters', async () => {
      fetch.mockResponseOnce(JSON.stringify({ code: 200, data: { result: 'success' } }));
      (queryString.stringifyUrl as jest.Mock).mockReturnValue('https://api.example.com/test-endpoint?key=value');

      const result = await request('/test-endpoint', {
        baseURL,
        params: { key: 'value' },
      });

      expect(queryString.stringifyUrl).toHaveBeenCalledWith({
        url: 'https://api.example.com/test-endpoint',
        query: { key: 'value' },
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/test-endpoint?key=value',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          }),
        }),
      );

      expect(result).toEqual({ result: 'success' });
    });

    it('should make a GET request without parameters', async () => {
      fetch.mockResponseOnce(JSON.stringify({ code: 200, data: { result: 'success' } }));
      (queryString.stringifyUrl as jest.Mock).mockReturnValue('https://api.example.com/test-endpoint?key=value');

      const result = await request('/test-endpoint', {
        baseURL,
        // @ts-ignore
        params: null,
      });

      expect(queryString.stringifyUrl).toHaveBeenCalledWith({
        url: 'https://api.example.com/test-endpoint',
        query: {},
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/test-endpoint?key=value',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          }),
        }),
      );

      expect(result).toEqual({ result: 'success' });
    });

    it('should make a POST request with correct body', async () => {
      fetch.mockResponseOnce(JSON.stringify({ code: 200, data: { result: 'success' } }));

      const body = { key: 'value' };
      await request('/test-endpoint', { baseURL, method: 'POST', body });

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/test-endpoint',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should handle FormData correctly by removing headers', async () => {
      fetch.mockResponseOnce(JSON.stringify({ code: 200, data: { result: 'success' } }));
      const mockFormData = new FormData();
      mockFormData.append('file', new Blob(['test']), 'test.txt');
      mockFormData.append('name', 'test');

      await request('/test-endpoint', { baseURL, method: 'POST', body: mockFormData });

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/test-endpoint',
        expect.objectContaining({
          method: 'POST',
          body: mockFormData,
        }),
      );
    });
  });

  // 错误处理测试
  describe('Error Handling', () => {
    it('should handle 401 error and redirect', async () => {
      fetch.mockResponseOnce('', { status: 401 }); // 模拟一个 401 响应，不包含任何响应体
      const originalLocation = window.location; // 保存原始的 window.location
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      // biome-ignore lint/performance/noDelete: <explanation>
      delete (window as any).location; // 模拟 window.location
      const returnUrl = 'https://app.example.com';

      window.location = {
        ...originalLocation,
        href: returnUrl,
      };

      // 由于重定向会改变 window.location，我们期望这个调用会抛出错误
      await expect(request('/test-endpoint')).rejects.toThrow();

      // 验证重定向 URL
      expect(window.location.href).toBe(`${process.env.SC_LOGIN_URL}?ReturnUrl=${returnUrl}`);

      // 恢复原始的 window.location
      window.location = originalLocation;
    });

    it('should show error notification for non-200 responses', async () => {
      fetch.mockResponseOnce('', { status: 500, statusText: 'Internal Server Error' });

      await expect(request('/test-endpoint')).rejects.toThrow('Internal Server Error (500)');

      expect(notification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          key: expect.any(Number),
          message: expect.any(String),
          description: expect.any(String),
        }),
      );
    });

    it('should throw an error for non-object JSON response', async () => {
      fetch.mockResponseOnce(JSON.stringify('not an object'));
      await expect(request('/test-endpoint')).rejects.toThrow('接口返回的数据格式错误');
    });

    it('should throw an error for JSON response without numeric code', async () => {
      fetch.mockResponseOnce(JSON.stringify({ code: '200', data: {} }));
      await expect(request('/test-endpoint')).rejects.toThrow('接口返回的数据格式错误');
    });
  });

  // 响应类型处理测试
  describe('Response Type Handling', () => {
    it('should handle different response types', async () => {
      // 测试文本响应
      fetch.mockResponseOnce('text response');
      const textResult = await request('/test-endpoint', { responseType: 'text' });
      expect(textResult).toBe('text response');

      // 测试 Blob 响应
      const blobData = new Blob(['blob data'], { type: 'application/octet-stream' });
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (fetch as any).mockResponseOnce(async () => ({
        body: blobData,
        init: { status: 200, headers: { 'Content-Type': 'application/octet-stream' } },
      }));
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const blobResult: any = await request('/test-endpoint', { responseType: 'blob' });
      expect(new Blob([blobResult])).toBeInstanceOf(Blob);

      // 测试 JSON 响应（默认行为）
      fetch.mockResponseOnce(JSON.stringify({ code: 200, data: { key: 'value' } }));
      const jsonResult = await request('/test-endpoint');
      expect(jsonResult).toEqual({ key: 'value' });

      // 测试 ArrayBuffer 响应
      const arrayBufferData = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]).buffer;
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      fetch.mockResponseOnce(arrayBufferData as any);
      const arrayBufferResult = (await request('/test-endpoint', { responseType: 'arrayBuffer' })) as ArrayBuffer;
      expect(arrayBufferResult.toString()).toBe('[object ArrayBuffer]');
      expect(new Uint8Array(arrayBufferResult)).toEqual(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]));
    });

    it('should handle JSON response type explicitly', async () => {
      const mockResponse = { code: 200, data: { key: 'value' }, message: 'Success' };
      fetch.mockResponseOnce(JSON.stringify(mockResponse));
      const result = await request('/test-endpoint', { responseType: 'json' });
      expect(result).toEqual(mockResponse.data);
    });
  });

  // 特殊选项测试
  describe('Special Options', () => {
    it('should abort previous request when useSignal is true', async () => {
      const mockAbort = jest.fn();
      const mockController = { abort: mockAbort, signal: {} };
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (window as any).AbortController = jest.fn(() => mockController);

      fetch
        .mockResponseOnce(
          () =>
            new Promise(resolve =>
              // eslint-disable-next-line max-nested-callbacks
              setTimeout(() => {
                resolve(JSON.stringify({ code: 200, data: { result: 'success' } }));
              }, 100),
            ),
        )
        .mockResponseOnce(JSON.stringify({ code: 200, data: { result: 'success' } }));

      const promise1 = request('/test-endpoint', { useSignal: true });
      const promise2 = request('/test-endpoint', { useSignal: true });

      await Promise.all([promise1, promise2]);

      expect(mockAbort).toHaveBeenCalledTimes(1);
    });

    it('should start and complete nprogress', async () => {
      fetch.mockResponseOnce(JSON.stringify({ code: 200, data: { result: 'success' } }));
      await request('/test-endpoint');
      expect(np.start).toHaveBeenCalled();
      expect(np.done).toHaveBeenCalled();
    });
  });

  // 结果处理测试
  describe('Result Handling', () => {
    it('should return full result when outside is true', async () => {
      const mockResponse = { code: 200, data: { key: 'value' }, message: 'Success' };
      fetch.mockResponseOnce(JSON.stringify(mockResponse));
      const result = await request('/test-endpoint', {}, true);
      expect(result).toEqual(mockResponse);
    });

    it('should return only data when outside is false', async () => {
      const mockResponse = { code: 200, data: { key: 'value' }, message: 'Success' };
      fetch.mockResponseOnce(JSON.stringify(mockResponse));
      const result = await request('/test-endpoint');
      expect(result).toEqual(mockResponse.data);
    });
  });

  // 错误通知测试
  describe('Error Notification', () => {
    it('should show error notification and throw error for non-200 code', async () => {
      const mockResponse = { code: 400, data: null, message: 'Bad Request' };
      fetch.mockResponseOnce(JSON.stringify(mockResponse));
      await expect(request('/test-endpoint')).rejects.toThrow('Bad Request (400)');
      expect(notification.error).toHaveBeenCalledWith({
        key: expect.any(Number),
        message: '获取数据失败（400）',
        description: 'Bad Request',
      });
    });

    it('should not show error notification when showErrorUI is false', async () => {
      const mockResponse = { code: 400, data: null, message: 'Bad Request' };
      fetch.mockResponseOnce(JSON.stringify(mockResponse));
      await expect(request('/test-endpoint', { showErrorUI: false })).rejects.toThrow('Bad Request (400)');
      expect(notification.error).not.toHaveBeenCalled();
    });
  });

  // URL 处理测试
  describe('URL Handling', () => {
    it('should not use baseURL for absolute http URLs', async () => {
      fetch.mockResponseOnce(JSON.stringify({ code: 200, data: { result: 'success' } }));
      await request('http://other-api.example.com/test-endpoint', { baseURL });
      expect(fetch.mock.calls[0][0]).toBe('http://other-api.example.com/test-endpoint');
    });

    it('should not use baseURL for absolute https URLs', async () => {
      fetch.mockResponseOnce(JSON.stringify({ code: 200, data: { result: 'success' } }));
      await request('https://other-api.example.com/test-endpoint', { baseURL });
      expect(fetch.mock.calls[0][0]).toBe('https://other-api.example.com/test-endpoint');
    });
  });

  describe('other case', () => {
    it('should return full result for JSON response type when outside is true', async () => {
      const mockResponse = { code: 200, data: { key: 'value' }, message: 'Success' };
      fetch.mockResponseOnce(JSON.stringify(mockResponse));
      const result = await request('/test-endpoint', { responseType: 'json' }, true);
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error for non-object JSON response with explicit responseType', async () => {
      fetch.mockResponseOnce(JSON.stringify('not an object'));
      await expect(request('/test-endpoint', { responseType: 'json' })).rejects.toThrow('接口返回的数据格式错误');
    });

    it('should throw an error for JSON response without numeric code with explicit responseType', async () => {
      fetch.mockResponseOnce(JSON.stringify({ code: '200', data: {} }));
      await expect(request('/test-endpoint', { responseType: 'json' })).rejects.toThrow('接口返回的数据格式错误');
    });

    it('should handle error for non-200 code with explicit JSON responseType', async () => {
      const mockResponse = { code: 400, data: null, message: 'Bad Request' };
      fetch.mockResponseOnce(JSON.stringify(mockResponse));

      await expect(request('/test-endpoint', { responseType: 'json' })).rejects.toThrow('Bad Request (400)');

      expect(notification.error).toHaveBeenCalledWith({
        key: expect.any(Number),
        message: '获取数据失败（400）',
        description: 'Bad Request',
      });
    });

    it('should not show error notification for non-200 code when showErrorUI is false with JSON responseType', async () => {
      const mockResponse = { code: 400, data: null, message: 'Bad Request' };
      fetch.mockResponseOnce(JSON.stringify(mockResponse));

      await expect(request('/test-endpoint', { responseType: 'json', showErrorUI: false })).rejects.toThrow(
        'Bad Request (400)',
      );

      expect(notification.error).not.toHaveBeenCalled();
    });

    it('should handle various non-200 status codes with explicit JSON responseType', async () => {
      const testCases = [
        { code: 400, message: 'Bad Request' },
        { code: 403, message: 'Forbidden' },
        { code: 404, message: 'Not Found' },
        { code: 500, message: 'Internal Server Error' },
      ];

      for (const testCase of testCases) {
        fetch.mockResponseOnce(JSON.stringify(testCase));

        await expect(request('/test-endpoint', { responseType: 'json' })).rejects.toThrow(
          `${testCase.message} (${testCase.code})`,
        );

        expect(notification.error).toHaveBeenCalledWith({
          key: expect.any(Number),
          message: `获取数据失败（${testCase.code}）`,
          description: testCase.message,
        });

        jest.clearAllMocks();
      }
    });
  });
});
