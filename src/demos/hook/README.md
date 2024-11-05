# Jest 中如何测试 React Hooks

## 1. 概述

在 React、testing-library 中，有一个专门测试 Hooks 的包：[[jest 配置实践#1.1.5. `@testing-library/react-hooks`|@testing-library/react-hooks]]

使用方法：

```js
// useCounter.test.ts
import { renderHook } from '@testing-library/react-hooks'
// in React 18
// import { renderHook } from '@testing-library/react'

test('should initialize with default value', () => {
  const { result } = renderHook(() => useCounter());
  expect(result.current.count).toBe(0);
});
```

> [!quote] 关于 `@testing-library/react-hooks` vs `@testing-library/react`
> 如果使用的是 React 18，可以直接使用 `@testing-library/react` 替代 react-hooks，详见官方说明：[react-hooks-testing-library](https://github.com/testing-library/react-hooks-testing-library?tab=readme-ov-file#a-note-about-react-18-support)
>
> **注意**：需要 `@testing-library/react` 的版本大于 13.1：[Release v13.1.0 · testing-library/react-testing-library · GitHub](https://github.com/testing-library/react-testing-library/releases/tag/v13.1.0)

## 2. 为什么要引入新的包？

首先，我们需要理解一个重要的限制：**Hooks 只能在 React 组件或其他 Hooks 中调用**。这是 React 的规则之一。比如：

```ts
// ❌ 这样是错误的，会报错
describe("useCounter", () => {
  test("should work", () => {
    const [count, setCount] = useState(0) // 错误：Hooks 只能在 React 组件中调用
  })
})
```

这是因为 Hooks 需要 React 的上下文环境才能正常工作。那么我们该如何测试呢？

### 2.1. 最初的解决方案：测试组件

一种直观的解决方案是创建一个测试组件来使用这个 Hook：

```tsx
// useCounter.ts
import { useState } from "react"

export function useCounter(initialValue = 0) {
  if (typeof initialValue !== "number" && initialValue !== undefined) {
    throw new Error("Initial value must be a number or undefined")
  }
  const [count, setCount] = useState(initialValue ?? 0)

  const increment = () => setCount(count + 1)
  const decrement = () => setCount(count - 1)

  return { count, increment, decrement }
}

// useCounter.test.tsx
import { fireEvent, render } from '@testing-library/react';
import { useCounter } from './useCounter';

function TestComponent() {
  const { count, increment } = useCounter(0);
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button type="button" onClick={increment}>
        Increment
      </button>
    </div>
  );
}

// 旧的测试方式：创建一个组件再对该组件进行测试

test('should increment counter', () => {
  const { getByText, getByTestId } = render(<TestComponent />);
  expect(getByTestId('count')).toHaveTextContent('0');

  fireEvent.click(getByText('Increment'));
  expect(getByTestId('count')).toHaveTextContent('1');
});
```

这种方法的问题：

1. 需要创建额外的测试组件
2. 测试代码变得冗长
3. 可能需要处理额外的 DOM 交互
4. 难以测试 Hook 的所有返回值

### 2.2. renderHook 的引入

为了解决上述问题，@testing-library/react 提供了  `renderHook`  工具，它能让我们：

- 直接测试 Hook，无需创建测试组件
- 方便访问 Hook 的所有返回值
- 简化测试代码

基本用法：

```ts
import { renderHook } from '@testing-library/react'; // React 18
import { useCounter } from './useCounter';

test('should use counter', () => {
  const { result } = renderHook(() => useCounter(0));

  // result.current 包含 hook 返回的所有值
  expect(result.current.count).toBe(0);
});
```

基本概念：

- 用于渲染和测试 hooks [how-to-test-custom-hooks-in-react-using-jest-enzyme](https://stackoverflow.com/questions/65039773/how-to-test-custom-hooks-in-react-using-jest-enzyme)
- 返回一个包含  `result`  对象的包装器，可以通过  `result.current`  访问 hook 的返回值

### 2.3.  renderHook 的工作原理

renderHook 实际上是在内部创建了一个测试组件，但它帮我们处理了所有细节：

```ts
// renderHook 的简化实现原理
function TestComponent({ callback }) {
  const hook = callback()
  return null
}

function renderHook(callback) {
  let result
  render(
    <TestComponent
      callback={() => {
        result = callback()
        return result
      }}
    />
  )
  return { result }
}
```

## 3. 基础用法示例

让我们从简单到复杂，逐步学习如何使用 renderHook：

```javascript
// 1. 测试初始值
test("should initialize with default value", () => {
  const { result } = renderHook(() => useCounter())
  expect(result.current.count).toBe(0)
})

// 2. 测试自定义初始值
test("should initialize with custom value", () => {
  const { result } = renderHook(() => useCounter(10))
  expect(result.current.count).toBe(10)
})
```

### 3.1. 测试状态更新

当需要测试状态更新时，需要使用 `act`：

```javascript
import { renderHook, act } from "@testing-library/react"

test("should increment counter", () => {
  const { result } = renderHook(() => useCounter())

  // act 确保状态更新已完成
  act(() => {
    result.current.increment()
  })

  expect(result.current.count).toBe(1)
})
```

### 3.2. 为什么需要 act？

当我们更新 React 状态时，更新是异步的。`act` 确保：

1. 所有状态更新都已完成
2. 所有副作用都已执行
3. DOM 已经更新

```javascript
// ❌ 不使用 act 可能导致测试不可靠
test("without act", () => {
  const { result } = renderHook(() => useCounter())
  result.current.increment() // 状态更新可能还未完成
  expect(result.current.count).toBe(1) // 可能失败
})

// ✅ 使用 act 确保更新完成
test("with act", () => {
  const { result } = renderHook(() => useCounter())
  act(() => {
    result.current.increment()
  })
  expect(result.current.count).toBe(1) // 一定成功
})
```

### 3.3. 测试 Hook 的重渲染

```javascript
test("should update when props change", () => {
  const { result, rerender } = renderHook(
    ({ initialValue }) => useCounter(initialValue),
    {
      initialProps: { initialValue: 0 },
    }
  )

  expect(result.current.count).toBe(0)

  // 重渲染 Hook，传入新的 props
  rerender({ initialValue: 10 })

  expect(result.current.count).toBe(10)
})
```

### 3.4. 测试异步 Hook

```ts
// useFetch.ts
import { useEffect, useState } from 'react';

export const useFetch = (url: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        const json = await response.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};
```

测试用例：

```ts
// useFetch.test.ts
import { renderHook, waitFor } from "@testing-library/react"
import { useFetch } from "./useFetch"

global.fetch = jest.fn()

const mockFetch = global.fetch as jest.Mock

describe("useApi", () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  test("should handle successful API call", async () => {
    const mockData = { id: 1, name: "Test" }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const { result } = renderHook(() =>
      useFetch("https://api.example.com/data")
    )

    // 初始状态检查
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBe(null)

    // 等待异步操作完成
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBe(null)
  })

  test("should handle error in API call", async () => {
    const mockError = new Error("API Error")
    mockFetch.mockRejectedValueOnce(mockError)

    const { result } = renderHook(() =>
      useFetch("https://api.example.com/data")
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe(mockError)
    expect(result.current.data).toBe(null)
  })
})
```

## 4. 错误处理和调试技巧

```js
test("should handle errors gracefully", () => {
  // 使用 try-catch 捕获预期中的错误
  expect(() => {
    renderHook(() => useCounter("invalid" as any))
  }).toThrow()

  expect(() => {
    renderHook(() => useCounter(null as any))
  }).toThrow()

  // 或者测试错误处理逻辑
  const { result } = renderHook(() => useFetch("invalid-url"))

  waitFor(() => {
    expect(result.current.error).not.toBeNull()
    expect(result.current.loading).toBe(false)
  })
})
```

通过这种渐进式的学习方式，我们可以更好地理解如何使用 renderHook 测试 Hooks，从基础案例到复杂场景。记住，好的测试应该关注 Hook 的行为而不是实现细节。

---

[这篇文章](https://mp.weixin.qq.com/s?__biz=MzkzMDIyMjkxNQ==&mid=2247485528&idx=1&sn=2391010a2aeb6fe18b8e0813bb1a78ea&chksm=c27cce74f50b476256839371b1cc80d1c3a6d2f211f31dc9e5e6cf4e359e7c48f8e5935e48f1&scene=178&cur_album_id=2242755016438677508#rd) 讲了如何测试 react hooks，以及@testing-library/react 中的 renderHook 为何这样设计。

相关资源：[『译』结合源码读 React Hooks testing library 文档 - 掘金](https://juejin.cn/post/7193727245431603258#heading-17)
