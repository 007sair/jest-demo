
# user.test.ts 记录

## global.fetch 的报错信息

```
不能将类型“Mock<Promise<{ ok: false; }>, [], any>”分配给类型“(input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>”。
  不能将类型“Promise<{ ok: false; }>”分配给类型“Promise<Response>”。
    类型“{ ok: false; }”缺少类型“Response”的以下属性: headers, redirected, status, statusText 及其他 10 项。ts(2322)
```

这个错误是因为模拟的 fetch 返回对象不完全符合 Response 接口的类型定义。有几种解决方案：

1. 最完整的解决方案 - 实现所有必要的 Response 属性：

```ts
test('成功获取用户数据', async () => {
  const mockResponse: Response = {
    ok: true,
    headers: new Headers(),
    redirected: false,
    status: 200,
    statusText: 'OK',
    type: 'basic',
    url: 'https://api.example.com/users/1',
    json: () => Promise.resolve({ id: 1, name: 'John Doe' }),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    bodyUsed: false,
    body: null,
    clone: () => mockResponse
  };

  global.fetch = jest.fn(() => Promise.resolve(mockResponse));

  const user = await getUser(1);
  expect(user).toEqual({ id: 1, name: 'John Doe' });
  expect(fetch).toHaveBeenCalledWith('https://api.example.com/users/1');
});
```
2. 使用类型断言（推荐，更简洁）：

```ts
test('成功获取用户数据', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'John Doe' }),
    } as Response)
  ) as jest.Mock;

  const user = await getUser(1);
  expect(user).toEqual({ id: 1, name: 'John Doe' });
  expect(fetch).toHaveBeenCalledWith('https://api.example.com/users/1');
});
```

3. 使用 jest-fetch-mock 库（推荐用于实际项目）：

```ts
import fetchMock from 'jest-fetch-mock';

// 在测试文件开头或 setupTests 文件中
fetchMock.enableMocks();

test('成功获取用户数据', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({ id: 1, name: 'John Doe' }));

  const user = await getUser(1);
  expect(user).toEqual({ id: 1, name: 'John Doe' });
  expect(fetch).toHaveBeenCalledWith('https://api.example.com/users/1');
});
```

4. 使用 partial mock（如果只关心部分属性）：

```ts
test('成功获取用户数据', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'John Doe' }),
    }) as unknown as Response
  );

  const user = await getUser(1);
  expect(user).toEqual({ id: 1, name: 'John Doe' });
  expect(fetch).toHaveBeenCalledWith('https://api.example.com/users/1');
});
```

推荐使用的方案：

1. 对于小型项目或简单测试，使用方案 2（类型断言）是最简洁的解决方案。

2. 对于较大的项目，推荐使用方案 3（jest-fetch-mock 库），因为：

  - 提供了更完整的 fetch mock 功能
  - 处理了所有类型问题
  - 提供了更多有用的辅助方法
  - 更容易维护

安装 jest-fetch-mock：

```bash
npm install --save-dev jest-fetch-mock
```

在 setupTests.ts 中配置：

```ts
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();
```

选择建议：

- 如果是简单测试：使用方案 2
- 如果是正式项目：使用方案 3
- 如果需要完整类型支持：使用方案 1
- 如果只关心特定属性：使用方案 4
