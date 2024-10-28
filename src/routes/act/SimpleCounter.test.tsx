import { act, fireEvent, render, screen } from '@testing-library/react';
import { SimpleCounter } from './SimpleCounter';

describe('SimpleCounter', () => {
  // ❌ 错误的测试方式 - 没有使用 act
  test.skip('不使用 act 的错误示例', () => {
    render(<SimpleCounter />);
    const button = screen.getByTestId('counter-button');

    button.click();

    // 这里会失败，因为状态更新是异步的，需要 act
    expect(button).toHaveTextContent('Count: 1');
  });

  // ✅ 正确的测试方式 - 使用 act
  test('使用 act 的正确示例', () => {
    render(<SimpleCounter />);
    const button = screen.getByTestId('counter-button');

    // 使用 act 包裹异步操作
    act(() => {
      button.click();
    });

    expect(button).toHaveTextContent('Count: 1');
  });

  test('使用 fireEvent 的正确示例', async () => {
    render(<SimpleCounter />);
    const button = screen.getByTestId('counter-button');

    fireEvent.click(button);

    expect(button).toHaveTextContent('Count: 1');
  });
});
