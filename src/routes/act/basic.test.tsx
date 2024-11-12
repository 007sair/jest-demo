import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { act, useEffect, useState } from 'react';

describe.skip('test act', () => {
  // ❌ 可能导致警告或测试不稳定
  test('未使用act', () => {
    const { result } = renderHook(() => useState(0));
    result.current[1](1); // 更新状态
    expect(result.current[0]).toBe(1); // 可能失败
  });

  // ✅ 正确使用act
  test('使用act', () => {
    const { result } = renderHook(() => useState(0));
    act(() => {
      result.current[1](1);
    });
    expect(result.current[0]).toBe(1); // 总是正确
  });
});

test('基础状态更新', () => {
  const TestComponent = () => {
    const [count, setCount] = useState(0);
    return (
      <button type="button" onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    );
  };

  const { getByText } = render(<TestComponent />);

  fireEvent.click(getByText(/Count: 0/));

  expect(getByText(/Count: 1/)).toBeInTheDocument();
});

describe('不同类型更新的处理方法', () => {
  // Promise, queueMicrotask 等微任务
  test('微任务更新', async () => {
    const { result } = renderHook(() => {
      const [state, setState] = useState(0);

      useEffect(() => {
        Promise.resolve().then(() => setState(1));
      }, []);

      return state;
    });

    // 等待微任务队列清空
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toBe(1);
  });

  // setTimeout, setInterval 等宏任务
  test('宏任务更新', async () => {
    jest.useFakeTimers();

    const { result } = renderHook(() => {
      const [state, setState] = useState(0);

      useEffect(() => {
        setTimeout(() => setState(1), 1000);
      }, []);

      return state;
    });

    // 处理宏任务
    await act(async () => {
      jest.runAllTimers();
    });

    expect(result.current).toBe(1);
    jest.useRealTimers();
  });
});

test('定时器操作', () => {
  jest.useFakeTimers();

  const TimerComponent = () => {
    const [text, setText] = useState('Initial');
    useEffect(() => {
      const timer = setTimeout(() => {
        setText('Updated');
      }, 1000);
      return () => clearTimeout(timer);
    }, []);
    return <div>{text}</div>;
  };

  const { getByText } = render(<TimerComponent />);

  act(() => {
    jest.runAllTimers();
  });

  expect(getByText('Updated')).toBeInTheDocument();
  jest.useRealTimers();
});

test('异步数据获取', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ message: 'Success' }),
    } as Response),
  ) as jest.Mock;

  const AsyncComponent = () => {
    const [data, setData] = useState<{ message: string }>();
    const fetchData = async () => {
      const response = await global.fetch('/api');
      const result = await response.json();
      setData(result);
    };
    return (
      <button type="button" onClick={fetchData}>
        {data ? data.message : 'Load Data'}
      </button>
    );
  };

  const { getByText } = render(<AsyncComponent />);

  // 需要显式 act 处理异步更新
  await act(async () => {
    fireEvent.click(getByText('Load Data'));
    // 等待异步操作完成
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  expect(getByText('Success')).toBeInTheDocument();
});

describe('act警告', () => {
  // 问题：act警告
  const AsyncWarning = () => {
    const [data, setData] = useState<{ message: string }>();
    useEffect(() => {
      fetch('/api')
        .then(r => r.json())
        .then(setData);
    }, []);
    return data ? <div>{data.message}</div> : null;
  };

  // ✅ 解决方案
  test('处理act警告', async () => {
    await act(async () => {
      render(<AsyncWarning />);
      // 等待所有更新完成
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});

test('多重更新', async () => {
  const TestComponent = () => {
    const [count, setCount] = useState(0);
    const [message, setMessage] = useState('');

    const handleClick = () => {
      setCount(c => c + 1);
      // 异步更新
      setTimeout(() => {
        setMessage(`Count is ${count + 1}`);
      }, 0);
    };

    return (
      <button type="button" onClick={handleClick}>
        {message || count}
      </button>
    );
  };

  const { getByText } = render(<TestComponent />);

  // 需要显式 act 处理定时器
  await act(async () => {
    fireEvent.click(getByText('0'));
    // 等待定时器
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  expect(getByText('Count is 1')).toBeInTheDocument();
});

test('嵌套更新', async () => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const ChildComponent = ({ onUpdate }: any) => {
    useEffect(() => {
      // 子组件中的异步更新
      setTimeout(() => {
        onUpdate('Updated');
      }, 0);
    }, [onUpdate]);
    return null;
  };

  const ParentComponent = () => {
    const [message, setMessage] = useState('Initial');
    return (
      <>
        <div>{message}</div>
        <ChildComponent onUpdate={setMessage} />
      </>
    );
  };

  const { getByText } = render(<ParentComponent />);

  // 需要显式 act 处理子组件的异步更新
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  expect(getByText('Updated')).toBeInTheDocument();
});

test('自定义Hook测试', () => {
  const useCustomHook = (initial: number) => {
    const [value, setValue] = useState(initial);
    const increment = () => setValue(v => v + 1);
    return { value, increment };
  };

  const { result } = renderHook(() => useCustomHook(0));

  act(() => {
    result.current.increment();
  });

  expect(result.current.value).toBe(1);
});
