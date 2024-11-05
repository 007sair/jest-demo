# React act 完整指南

> React 官方文档：[act - React 中文官方文档](https://reactjs.ac.cn/reference/react/act)

## 1. 基本定义

`act` 是 React 测试工具中的一个核心函数，用于包装需要触发状态更新的代码块，确保在断言之前所有更新都已完成。

官方定义（来源：[React 测试工具文档](https://reactjs.org/docs/test-utils.html#act)）：

```typescript
function act(callback: () => void | Promise<void>): Promise<undefined> | void
```

## 2. 核心特性

### 2.1 工作原理

（来源：[React 源码](https://github.com/facebook/react/blob/main/packages/react-dom/src/test-utils/ReactTestUtils.js)）

act 会：

1. 调度并执行任何待处理的副作用（useEffect）
2. 刷新所有同步工作
3. 确保 DOM 更新已应用

### 2.2 自动包装

从 React 18 开始，很多测试工具已经自动包装了 act：

- render
- fireEvent
- user-event

## 3. 使用场景

### 3.1 状态更新

```typescript
test('状态更新', () => {
  act(() => {
    render(<Component />)
  })

  act(() => {
    fireEvent.click(button)
  })
})
```

### 3.2 异步操作

```typescript
test('异步操作', async () => {
  await act(async () => {
    await userEvent.click(button)
    // 等待异步操作完成
  })
})
```

### 3.3 定时器操作

```typescript
test('定时器', () => {
  act(() => {
    jest.runAllTimers()
  })
})
```

## 4. 不同版本的行为

### 4.1 React 16

```typescript
// 需要显式使用 act
act(() => {
  render(<Component />)
})
```

### 4.2 React 17

```typescript
// 增加了更多警告来帮助发现未包装的更新
render(<Component />) // 可能显示 act 警告
```

### 4.3 React 18

```typescript
// 大多数操作都自动包装了 act
render(<Component />) // 自动包装
```

## 5. 常见用例

### 5.1 异步效果测试

```typescript
test('异步效果', async () => {
  await act(async () => {
    render(<AsyncComponent />)
  })

  await act(async () => {
    await Promise.resolve() // 等待效果完成
  })
})
```

### 5.2 多个更新

```typescript
test('多个更新', () => {
  act(() => {
    setState(1)
    setState(2)
    setState(3)
  }) // 批处理所有更新
})
```

## 6. 最佳实践

### 6.1 异步操作处理

```typescript
// 推荐
test('async operations', async () => {
  render(<Component />)

  await act(async () => {
    await someAsyncOperation()
  })

  expect(screen.getByText('Updated')).toBeInTheDocument()
})
```

### 6.2 定时器处理

```typescript
test('timer operations', () => {
  jest.useFakeTimers()

  render(<Component />)

  act(() => {
    jest.runAllTimers()
  })

  jest.useRealTimers()
})
```

## 7. 常见问题和解决方案

### 7.1 act 警告

```typescript
// 问题
test('会产生警告', async () => {
  render(<Component />)
  await someAsyncOperation() // act 警告
})

// 解决方案
test('正确处理', async () => {
  render(<Component />)
  await act(async () => {
    await someAsyncOperation()
  })
})
```

### 7.2 嵌套 act

```typescript
// 避免
act(() => {
  act(() => {
    // 操作
  })
})

// 推荐
act(() => {
  // 所有操作
})
```

## 8. 性能考虑

### 8.1 批处理更新

```typescript
// 低效
act(() => setState(1))
act(() => setState(2))

// 高效
act(() => {
  setState(1)
  setState(2)
})
```

### 8.2 异步操作优化

```typescript
// 使用 Promise.all 处理多个异步操作
await act(async () => {
  await Promise.all([
    operation1(),
    operation2()
  ])
})
```

## 9. 调试技巧

### 9.1 使用 debug

```typescript
test('debugging', async () => {
  render(<Component />)

  await act(async () => {
    screen.debug()
    await someOperation()
    screen.debug()
  })
})
```

### 9.2 错误追踪

```typescript
test('error tracking', async () => {
  try {
    await act(async () => {
      throw new Error('Test error')
    })
  } catch (error) {
    expect(error.message).toBe('Test error')
  }
})
```

## 10. 与其他工具的集成

### 10.1 与 waitFor 配合

```typescript
test('combining tools', async () => {
  render(<Component />)

  await act(async () => {
    await waitFor(() => {
      expect(screen.getByText('Done')).toBeInTheDocument()
    })
  })
})
```

### 10.2 与 user-event 配合

```typescript
test('user interactions', async () => {
  const user = userEvent.setup()

  render(<Component />)

  await user.click(button) // 自动包装在 act 中
})
```

## 11. 版本兼容性

- React 16.8+：完全支持
- React 16.7 及以下：部分支持
- React 18：大多数操作自动包装

## 参考资料

1. [React 官方文档 - Test Utilities](https://reactjs.org/docs/test-utils.html)
2. [React Testing Library 文档](https://testing-library.com/docs/react-testing-library/api)
3. [React GitHub Issues - act() 相关讨论](https://github.com/facebook/react/issues/15379)
4. [Testing Library - 关于 act](https://testing-library.com/docs/preact-testing-library/api/#act)
5. [Kent C. Dodds - Fix the "not wrapped in act(...)" warning](https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning)

- [How does act() work internally in React?](https://jser.dev/react/2022/05/15/how-act-works/)

## 补充说明

act 的使用在 React 18 中变得更加简单，因为许多操作都自动包装了 act。然而，理解 act 的工作原理仍然很重要，特别是在处理复杂的异步操作时。建议关注官方文档的更新，因为 React 团队一直在改进测试体验。
