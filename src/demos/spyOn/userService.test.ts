import { userService } from './userService';

global.fetch = jest.fn();

describe('userService', () => {
  afterEach(() => {
    jest.restoreAllMocks(); // 确保每个测试后恢复所有间谍
  });

  test('fetchUser successfully fetches user data', async () => {
    const mockUser = { id: 1, name: 'John Doe' };

    // 创建间谍并模拟成功的响应
    const res = {
      ok: true,
      json: jest.fn().mockResolvedValue(mockUser),
    };

    // @ts-ignore
    const spy = jest.spyOn(global, 'fetch').mockResolvedValue(res);

    const user = await userService.fetchUser(1);

    expect(spy).toHaveBeenCalledWith('/api/users/1');
    expect(user).toEqual(mockUser);
  });

  test('fetchUser throws an error when response is not ok', async () => {
    // 创建间谍并模拟失败的响应

    const res = { ok: false };

    // @ts-ignore
    jest.spyOn(global, 'fetch').mockResolvedValue(res);

    await expect(userService.fetchUser(1)).rejects.toThrow('Network response was not ok');
  });
});
