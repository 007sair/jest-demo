import {
  type Callback,
  fetchDataSuccess,
  fetchDataWithAsync,
  fetchDataWithCallback,
  fetchDataWithError,
  fetchDataWithPromise,
} from './async';

describe('测试异步', () => {
  test('async/await 接收到正确的数据', async () => {
    const data = await fetchDataWithAsync();
    expect(data).toBe('peanut butter');
  });

  test('callback 接收到正确的数据', done => {
    const callback: Callback = data => {
      try {
        expect(data).toBe('peanut butter');
        done(); // test success
      } catch (error) {
        done(error); // test error
      }
    };
    fetchDataWithCallback(callback);
  });

  test('promise 接收到正确的数据', () => {
    return fetchDataWithPromise().then(data => {
      expect(data).toBe('peanut butter');
    });
  });

  test('使用 .rejects 断言 Promise 被拒绝', () => {
    return expect(fetchDataWithError()).rejects.toBe('error');
  });

  test('使用 .resolves 断言 Promise 解析的值', () => {
    return expect(fetchDataSuccess()).resolves.toBe('peanut butter');
  });
});
