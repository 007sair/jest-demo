import { useState } from 'react';

export const SimpleCounter = () => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    // 直接更新状态
    setCount(prev => prev + 1);
  };

  return (
    <button type="button" onClick={handleClick} data-testid="counter-button">
      Count: {count}
    </button>
  );
};
