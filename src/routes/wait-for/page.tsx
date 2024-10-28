import { useEffect, useState } from 'react';

// 1. 异步加载数据的组件
export const AsyncData = () => {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setData('Loaded Data');
    }, 100);
  }, []);

  return <div>{data || 'Loading...'}</div>;
};

// 2. 点击后延迟显示内容的组件
export const DelayedShow = () => {
  const [show, setShow] = useState(false);

  const handleClick = () => {
    setTimeout(() => {
      setShow(true);
    }, 100);
  };

  return (
    <div>
      <button type="button" onClick={handleClick}>
        Show Message
      </button>
      {show && <p>Hello World!</p>}
    </div>
  );
};

// 3. 异步验证消息的表单
export const AsyncForm = () => {
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setTimeout(() => {
      setError('Invalid input!');
    }, 100);
  };

  return (
    <form onSubmit={handleSubmit} role="form">
      <input type="text" />
      {error && <div role="alert">{error}</div>}
      <button type="submit">Submit</button>
    </form>
  );
};

export default function WaitFor() {
  return (
    <>
      <AsyncData />
      <DelayedShow />
      <AsyncForm />
    </>
  );
}
