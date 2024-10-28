import { useEffect, useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setCount(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  return (
    <div>
      <div data-testid="count">{count}</div>
      <button type="button" onClick={() => setIsRunning(prev => !prev)} data-testid="toggle-button">
        {isRunning ? 'Stop' : 'Start'}
      </button>
    </div>
  );
};

export default Counter;
