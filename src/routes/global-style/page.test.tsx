import type { DefaultTheme } from '@modern-js/runtime/styled';
import { fireEvent, render, screen } from '@testing-library/react';
import GlobalStylePage, { GlobalStyle } from './page';

const mockTheme: Partial<DefaultTheme> = {
  colorText: '#000',
  colorBorderSecondary: '#f2f2f2',
  colorPrimary: 'red',
};

describe('GlobalStylePage', () => {
  it('should match snapshot in GlobalStyle.tsx', () => {
    const { baseElement } = render(<GlobalStyle theme={mockTheme as DefaultTheme} />);
    expect(baseElement).toMatchSnapshot();
  });

  it('should render all components correctly', () => {
    render(<GlobalStylePage />);
    expect(screen.getByText('Primary')).toBeInTheDocument();
  });

  it('should update color when ColorPicker value changes', () => {
    render(<GlobalStylePage />);
    const colorInput = screen.getByTestId('color-input');
    const newColor = 'rgb(0, 0, 0)';
    fireEvent.change(colorInput, { target: { value: newColor } });
    const button = screen.getByRole('button', { name: /primary/i });
    // 验证样式更新后的效果
    const styles = window.getComputedStyle(button);
    expect(styles.backgroundColor).toBe(newColor);
  });
});
