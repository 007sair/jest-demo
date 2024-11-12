import App from '@/routes/page';
import { render, screen } from '@testing-library/react';

describe('Page.tsx', () => {
  it('should take a snapshot', () => {
    const { asFragment } = render(<App />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders a heading', () => {
    render(<App />);

    const heading = screen.getByRole('heading', { name: /demo/i });
    // or
    // const heading = screen.getByRole('heading', { level: 2 });

    expect(heading).toBeInTheDocument();
  });
});
