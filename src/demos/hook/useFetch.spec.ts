import { renderHook, waitFor } from '@testing-library/react';
import { useFetch } from './useFetch';

global.fetch = jest.fn();

const mockFetch = global.fetch as jest.Mock;

describe('useApi', () => {
  let consoleLogSpy: jest.SpyInstance<void, Parameters<typeof console.log>, typeof console>;

  beforeEach(() => {
    // 在每个测试前设置spy
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    mockFetch.mockClear();
  });

  afterEach(() => {
    // 在每个测试后恢复原始console.log
    consoleLogSpy.mockRestore();
  });

  test('should handle successful API call', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useFetch('https://api.example.com/data'));

    // 初始状态检查
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    // 等待异步操作完成
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });

  test('should handle error in API call', async () => {
    const mockError = new Error('API Error');
    mockFetch.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useFetch('https://api.example.com/data'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.data).toBe(null);
    expect(consoleLogSpy).toHaveBeenCalledWith(mockError);
  });

  test('should handle errors gracefully', async () => {
    const { result } = renderHook(() => useFetch('invalid-url'));

    await waitFor(() => {
      expect(result.current.error).not.toBeNull(); // 抛出了异常错误
      expect(result.current.loading).toBe(false);
      expect(consoleLogSpy).toHaveBeenCalledWith(result.current.error);
    });
  });
});
