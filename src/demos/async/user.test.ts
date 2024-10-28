import { getUser } from './user';

test('成功获取用户数据', async () => {
  // 模拟 fetch
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'John Doe' }),
    }),
  ) as jest.Mock; // 这里如果不加断言，会出现类型错误，有几种解决方法，见 user.test.md

  const user = await getUser(1);
  expect(user).toEqual({ id: 1, name: 'John Doe' });
  expect(fetch).toHaveBeenCalledWith('https://api.example.com/users/1');
});

test('处理网络错误', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: false,
    }),
  ) as jest.Mock;

  await expect(getUser(1)).rejects.toThrow('Network response was not ok');
});
