import { userService } from './userService';
import type { Activity, UserProfile, UserService } from './userService';

describe('Fetch Mock Cleanup Examples', () => {
  describe('mockClear example - 追踪新的函数调用', () => {
    let fetchMock: jest.SpyInstance<Promise<UserProfile>, [userId: number], UserService>;

    beforeEach(() => {
      fetchMock = jest
        .spyOn(userService, 'fetchUserProfile')
        .mockImplementation(() => Promise.resolve({ id: 1, name: 'Test User' }));

      jest.spyOn(userService, 'notifyUser').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('应该正确跟踪异步调用历史', async () => {
      // 第一次调用
      await userService.fetchUserProfile(1);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(1);

      // 清除调用历史
      fetchMock.mockClear();

      // 第二次调用
      await userService.fetchUserProfile(2);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(2);

      // 验证mock返回值仍然保持不变
      const result = await userService.fetchUserProfile(3);
      expect(result).toEqual({ id: 1, name: 'Test User' });
    });

    test('应该正确跟踪每个测试中的通知次数', () => {
      const notifyMock = jest.spyOn(userService, 'notifyUser');

      // 第一次调用
      userService.notifyUser('Hello');
      expect(notifyMock).toHaveBeenCalledTimes(1);

      // 清除调用历史
      notifyMock.mockClear();

      // 新的调用应该重新从0开始计数
      userService.notifyUser('World');
      expect(notifyMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('mockReset example - 重置mock实现', () => {
    // 示例2：使用 mockReset 重置异步实现
    describe('fetchUserProfile with mockReset', () => {
      let fetchMock: jest.SpyInstance<Promise<UserProfile>, [userId: number], UserService>;

      beforeEach(() => {
        fetchMock = jest
          .spyOn(userService, 'fetchUserProfile')
          .mockImplementation(() => Promise.resolve({ id: 1, name: 'Test User' }));
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      test('应该能重置异步mock实现', async () => {
        // 使用初始mock实现
        const firstResult = await userService.fetchUserProfile(1);
        expect(firstResult).toEqual({ id: 1, name: 'Test User' });

        // 重置mock实现
        fetchMock.mockReset();

        // 验证重置后返回undefined
        const resetResult = await userService.fetchUserProfile(1);
        expect(resetResult).toBeUndefined();

        // 设置新的mock实现
        fetchMock.mockImplementation(() => Promise.resolve({ id: 2, name: 'New User' }));

        const newResult = await userService.fetchUserProfile(1);
        expect(newResult).toEqual({ id: 2, name: 'New User' });
      });

      test('应该能处理异步错误场景', async () => {
        // 模拟API错误
        fetchMock.mockImplementation(() => Promise.reject(new Error('API Error')));

        await expect(userService.fetchUserProfile(1)).rejects.toThrow('API Error');

        // 重置mock实现
        fetchMock.mockReset();

        // 验证重置后返回undefined而不是错误
        const result = await userService.fetchUserProfile(1);
        expect(result).toBeUndefined();
      });
    });

    test('应该能重置mock的实现为默认值', () => {
      const calculateMock = jest.spyOn(userService, 'calculateUserScore').mockImplementation(() => 100);

      // 使用自定义实现
      expect(userService.calculateUserScore([])).toBe(100);

      // 重置mock实现
      calculateMock.mockReset();

      // mock重置后返回undefined（默认行为）
      expect(userService.calculateUserScore([])).toBeUndefined();
    });
  });

  describe('mockRestore example - 恢复原始实现', () => {
    describe('fetchUserProfile with mockRestore', () => {
      test('应该能恢复异步原始实现', async () => {
        // 保存原始的fetch函数
        const originalFetch = global.fetch;

        // Mock global fetch
        global.fetch = jest.fn(() =>
          Promise.resolve({
            json: () => Promise.resolve({ id: 1, name: 'Mocked User' }),
          }),
        ) as jest.Mock;

        const fetchMock = jest.spyOn(userService, 'fetchUserProfile');

        // 使用mock实现
        fetchMock.mockImplementation(() => Promise.resolve({ id: 2, name: 'Test User' }));

        const mockResult = await userService.fetchUserProfile(1);
        expect(mockResult).toEqual({ id: 2, name: 'Test User' });

        // 恢复原始实现
        fetchMock.mockRestore();

        // 调用原始实现（会使用global.fetch）
        const realResult = await userService.fetchUserProfile(1);
        expect(realResult).toEqual({ id: 1, name: 'Mocked User' });

        // 清理global fetch mock
        global.fetch = originalFetch;
      });
    });

    test('应该能恢复原始的函数实现', () => {
      const calculateMock = jest.spyOn(userService, 'calculateUserScore');

      // Mock实现
      calculateMock.mockImplementation(() => 999);

      const mockResult = userService.calculateUserScore([]);
      expect(mockResult).toBe(999);

      // 恢复原始实现
      calculateMock.mockRestore();

      // 使用原始实现计算分数
      const activities = [{ points: 10 }, { points: 20 }];
      const realResult = userService.calculateUserScore(activities);
      expect(realResult).toBe(30);
    });

    describe('notifyUser with mockRestore', () => {
      let consoleLogSpy: jest.SpyInstance<void, Parameters<typeof console.log>, typeof console>;

      beforeEach(() => {
        // 在每个测试前设置spy
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      });

      afterEach(() => {
        // 在每个测试后恢复原始console.log
        consoleLogSpy.mockRestore();
      });

      test('应该正确记录通知消息', () => {
        userService.notifyUser('Hello World');

        // 验证console.log被调用
        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenCalledWith('Notification sent: Hello World');
      });

      test('应该能处理空消息', () => {
        userService.notifyUser('');

        expect(consoleLogSpy).toHaveBeenCalledWith('Notification sent: ');
      });
    });
  });
});
