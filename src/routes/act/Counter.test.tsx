import { act, fireEvent, render, screen } from '@testing-library/react';
import Counter from './Counter';

describe('Counter', () => {
  // 这个测试会失败或产生警告，因为没有使用 act
  test.skip('错误示例：不使用 act', async () => {
    jest.useFakeTimers();
    render(<Counter />);

    // 点击开始按钮
    fireEvent.click(screen.getByTestId('toggle-button'));

    // 等待计时器触发
    jest.advanceTimersByTime(2000);

    // 这里会失败或产生警告，因为状态更新没有被 act 包裹
    expect(screen.getByTestId('count')).toHaveTextContent('2');

    jest.useRealTimers();
  });

  // 正确的测试方式，使用 act
  test('正确示例：使用 act', () => {
    jest.useFakeTimers();
    render(<Counter />);

    // 使用 act 包裹可能导致状态更新的操作
    fireEvent.click(screen.getByTestId('toggle-button'));

    // 使用 act 包裹定时器相关的操作
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByTestId('count')).toHaveTextContent('2');

    // 停止计时器
    fireEvent.click(screen.getByTestId('toggle-button'));

    // 确认计时器停止后数值不再增加
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('count')).toHaveTextContent('2');

    jest.useRealTimers();
  });

  // 测试异步操作
  test('异步操作示例', async () => {
    jest.useFakeTimers();
    render(<Counter />);

    // 启动计时器
    fireEvent.click(screen.getByTestId('toggle-button'));

    // 等待多个时间间隔
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByTestId('count')).toHaveTextContent('3');

    jest.useRealTimers();
  });
});
