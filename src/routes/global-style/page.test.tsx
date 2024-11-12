import type { DefaultTheme } from '@modern-js/runtime/styled';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ButtonProps } from 'antd';
import { createContext, useContext } from 'react';
import GlobalStylePage, { GlobalStyle } from './page';

const MockThemeContext = createContext({ token: { colorPrimary: '#1677ff' } });

// 涉及到 jest.mock 提升，该函数不能使用箭头函数，否则会报错
function MockButton({ children }: ButtonProps) {
  const { token } = useContext(MockThemeContext);
  return (
    <button type="button" style={{ backgroundColor: token.colorPrimary }}>
      {children}
    </button>
  );
}

jest.mock('antd', () => {
  return {
    ...jest.requireActual('antd'),
    Button: MockButton,
    // @ts-expect-error
    ColorPicker: ({ value, onChangeComplete, showText }) => (
      <div data-testid="mock-color-picker">
        <input type="color" value={value} onChange={e => onChangeComplete({ toHexString: () => e.target.value })} />
        {showText && <span data-testid="color-text">{value}</span>}
      </div>
    ),
    // @ts-expect-error
    ConfigProvider: ({ theme, children }) => (
      <MockThemeContext.Provider value={theme}>{children}</MockThemeContext.Provider>
    ),
    theme: {
      useToken: () => ({
        token: {
          colorPrimary: '#1677ff',
        },
      }),
    },
  };
});

describe('GlobalStylePage', () => {
  it('should match snapshot in GlobalStyle.tsx', () => {
    const mockTheme: Partial<DefaultTheme> = {
      colorText: '#000',
      colorBorderSecondary: '#f2f2f2',
      colorPrimary: 'red',
    };
    const { baseElement } = render(<GlobalStyle theme={mockTheme as DefaultTheme} />);
    expect(baseElement).toMatchSnapshot();
  });

  it('should render all components correctly', () => {
    render(<GlobalStylePage />);
    expect(screen.getByRole('button', { name: /primary/i })).toBeInTheDocument();
    expect(screen.getByTestId('mock-color-picker')).toBeInTheDocument();

    const colorInput = screen.getByTestId('mock-color-picker').querySelector('input[type="color"]');
    expect(colorInput).toHaveValue('#1677ff');
  });

  it('should update color when ColorPicker value changes', async () => {
    render(<GlobalStylePage />);
    const colorInput = screen.getByTestId('mock-color-picker').querySelector('input[type="color"]');
    const newColor = '#ff0000';

    expect(colorInput).toBeInTheDocument();

    fireEvent.change(colorInput as Element, { target: { value: newColor } });

    const button = screen.getByRole('button', { name: /primary/i });
    expect(button).toHaveStyle({ backgroundColor: newColor });
  });
});
