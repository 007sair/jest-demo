import App from '@/routes/page';
import { BrowserRouter } from '@modern-js/runtime/router';
import { render, screen } from '@testing-library/react';

describe('Page.tsx', () => {
  it('should take a snapshot', () => {
    const { asFragment } = render(<App />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders a heading', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    /**
     * ByRole 特性：可以查询分隔的文本
     * @description 组件的 h1 标签内文本之间还有 img 标签
     */
    const heading = screen.getByRole('heading', { name: /Welcome to Modern.js/ });
    // or
    // const heading = screen.getByRole('heading', { level: 1 });

    expect(heading).toBeInTheDocument();
  });
});
