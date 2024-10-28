import { useState } from 'react';

const TestEvents = () => {
  const [counter, setCounter] = useState(0);
  return (
    <>
      <h1>{counter}</h1>
      <button aria-label="up" type="button" onClick={() => setCounter(counter + 1)}>
        Up
      </button>
      <button aria-label="down" type="button" onClick={() => setCounter(counter - 1)}>
        Down
      </button>
    </>
  );
};

export default TestEvents;
