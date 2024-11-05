import { useState } from 'react';

export function useCounter(initialValue = 0) {
  if (typeof initialValue !== 'number' && initialValue !== undefined) {
    throw new Error('Initial value must be a number or undefined');
  }
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);

  return { count, increment, decrement };
}
