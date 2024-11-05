import { act, fireEvent, render, renderHook } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('使用组件（旧）的测试方式', () => {
  function TestComponent() {
    const { count, increment } = useCounter(0);
    return (
      <div>
        <span data-testid="count">{count}</span>
        <button type="button" onClick={increment}>
          Increment
        </button>
      </div>
    );
  }

  test('should increment counter', () => {
    const { getByText, getByTestId } = render(<TestComponent />);
    expect(getByTestId('count')).toHaveTextContent('0');

    fireEvent.click(getByText('Increment'));
    expect(getByTestId('count')).toHaveTextContent('1');
  });
});

describe('使用 renderHook 测试', () => {
  test('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  test('should initialize with provided value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  test('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
    act(() => {
      result.current.increment();
    });
    expect(result.current.count).toBe(1);
  });

  test('should decrement counter', () => {
    const { result } = renderHook(() => useCounter());
    act(() => {
      result.current.decrement();
    });
    expect(result.current.count).toBe(-1);
  });

  // 测试 errors 的用例时，禁用异常导致控制台出现 console.error 的报错信息
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('should handle errors gracefully', () => {
    // 使用 try-catch 捕获预期中的错误
    expect(() => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      renderHook(() => useCounter('invalid' as any));
    }).toThrowError('Initial value must be a number or undefined');

    expect(() => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      renderHook(() => useCounter(null as any));
    }).toThrowError('Initial value must be a number or undefined');
  });
});
