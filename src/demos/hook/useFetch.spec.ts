import { renderHook, waitFor } from '@testing-library/react';
import { useFetch } from './useFetch';

global.fetch = jest.fn();

const mockFetch = global.fetch as jest.Mock;

describe('useApi', () => {
  beforeEach(() => {
    mockFetch.mockClear();
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
  });

  test('should handle errors gracefully', () => {
    // 使用 try-catch 捕获预期中的错误

    // 或者测试错误处理逻辑
    const { result } = renderHook(() => useFetch('invalid-url'));

    waitFor(() => {
      expect(result.current.error).not.toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });
});
