import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Component from './Component';

describe('Component', () => {
  it('increments counter', () => {
    const { getByRole } = render(<Component />);
    fireEvent.click(getByRole('button', { name: 'up' }));
    expect(getByRole('heading', { level: 1 })).toHaveTextContent('1');
  });

  it('decrements counter', () => {
    const { getByRole } = render(<Component />);
    fireEvent.click(getByRole('button', { name: 'down' }));
    expect(getByRole('heading', { level: 1 })).toHaveTextContent('-1');
  });
});
