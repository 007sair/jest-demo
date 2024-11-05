import { getUser } from './request';

global.fetch = jest.fn();

const mockFetch = global.fetch as jest.Mock;

/**
 * 如果没有这个case，request的覆盖率只有40%
 */
describe('提升 request 覆盖率', () => {
  it('should fetch user data successfully', async () => {
    const mockUserData = { data: { id: 1, name: 'John' } };

    // 注意：这里是不能使用 mockResolvedValue 的
    // mockFetch.mockResolvedValue(mockUserData)

    mockFetch.mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockUserData),
      }),
    );

    const result = await getUser();

    expect(fetch).toHaveBeenCalledWith('/user');
    expect(result).toEqual(mockUserData.data);
  });

  it('should handle fetch error', async () => {
    // 模拟 fetch 抛出错误
    const mockError = new Error('Fetch failed');
    mockFetch.mockImplementation(() => Promise.reject(mockError));

    // 验证是否正确抛出错误
    await expect(getUser()).rejects.toThrow('Fetch failed');
  });
});
