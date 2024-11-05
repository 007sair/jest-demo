# waitFor 完整指南

## 1. 基本定义

`waitFor` 是 `@testing-library/react` 提供的异步工具函数，用于等待某个期望的断言变为真。

官方定义（来源：[@testing-library/dom 文档](https://testing-library-docs-cn.netlify.app/zh-Hans/docs/dom-testing-library/api-async#waitfor)）：

```typescript
function waitFor<T>(
  callback: () => T | Promise<T>,
  options?: {
    container?: HTMLElement
    timeout?: number
    interval?: number
    onTimeout?: (error: Error) => Error
    mutationObserverOptions?: MutationObserverInit
  }
): Promise<T>
```

## 2. 核心特性

### 2.1 默认配置

（来源：[testing-library 源码](https://github.com/testing-library/dom-testing-library/blob/main/src/wait-for.js)）

```javascript
// src/config.ts
let config = {
  asyncUtilTimeout: 1000
}

// src/wait-for.js
function waitFor(callback, {
  timeout = getConfig().asyncUtilTimeout,
  interval = 50,
})
```

### 2.2 重试机制

waitFor 使用了固定间隔的重试机制：

1. 固定间隔：默认是 50ms (`interval`  参数)
2. 总体超时：默认是 1000ms (`timeout`  参数)
3. 不同的定时器处理：
    - Jest fake timers 环境下：使用  `jest.advanceTimersByTime(interval)`
    - 真实环境：使用  `setInterval(checkCallback, interval)`

主要功能：

1. 定期检查回调是否成功
2. 支持总体超时控制
3. 区分 Jest fake timers 和真实环境
4. 支持 DOM 观察（通过 MutationObserver）

## 3. 使用场景

### 3.1 等待异步状态更新

```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

### 3.2 等待元素消失

```typescript
await waitFor(() => {
  expect(screen.queryByText('Loading')).not.toBeInTheDocument()
})
```

### 3.3 等待属性变化

```typescript
await waitFor(() => {
  expect(screen.getByRole('button')).toBeEnabled()
})
```

## 4. 配置选项详解

### 4.1 timeout

- 默认值：1000ms
- 用途：指定等待的最长时间
- 示例：

```typescript
await waitFor(() => {}, { timeout: 2000 })
```

### 4.2 interval

- 默认值：50ms
- 用途：指定重试间隔
- 示例：

```typescript
await waitFor(() => {}, { interval: 100 })
```

### 4.3 mutationObserverOptions

- 用途：配置 DOM 变化的观察选项
- 默认值：

```javascript
{
  subtree: true,
  childList: true,
  attributes: true,
  characterData: true
}
```

## 5. 与其他异步工具的比较

### 5.1 waitFor vs findBy

（来源：[testing-library 文档](https://testing-library-docs-cn.netlify.app/zh-Hans/docs/dom-testing-library/api-async#findby-%E6%9F%A5%E8%AF%A2)）

```typescript
// findBy 实际上是 waitFor 的语法糖
const findByText = async (text) => {
  return waitFor(() => getByText(text))
}
```

### 5.2 `waitFor` vs `waitForElementToBeRemoved`

```typescript
// waitForElementToBeRemoved 专门用于等待元素移除
await waitForElementToBeRemoved(() => screen.queryByText('Loading'))
```

## 6. 最佳实践

### 6.1 定时器处理

```typescript
beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

test('async test', async () => {
  render(<Component />)
  jest.advanceTimersByTime(1000)
  await waitFor(() => {})
})
```

### 6.2 错误处理

```typescript
await waitFor(
  () => {
    expect(screen.getByText('Success')).toBeInTheDocument()
  },
  {
    onTimeout: (error) => {
      console.error('Timeout waiting for element')
      return error
    }
  }
)
```

## 7. 常见陷阱和解决方案

### 7.1 超时问题

```typescript
// 问题
test('可能超时的测试', async () => {
  render(<SlowComponent />)
  await waitFor(() => {}) // 可能超时
})

// 解决方案
test('正确处理超时的测试', async () => {
  render(<SlowComponent />)
  await waitFor(
    () => {},
    { timeout: 5000 }
  )
})
```

### 7.2 状态更新问题

```typescript
// 问题
await waitFor(() => {
  fireEvent.click(button)
  expect(something).toBeTruthy()
})

// 正确方式
fireEvent.click(button)
await waitFor(() => {
  expect(something).toBeTruthy()
})
```

## 8. 性能考虑

### 8.1 间隔设置

- 较小的间隔（如 50ms）适用于快速响应的场景
- 较大的间隔（如 100ms+）适用于需要减少 CPU 使用的场景

### 8.2 超时设置

- 开发环境：可以使用较长的超时时间
- CI 环境：建议使用较短的超时时间以快速发现问题

## 9. 调试技巧

### 9.1 使用 debug

```typescript
await waitFor(() => {
  screen.debug()
  expect(element).toBeInTheDocument()
})
```

### 9.2 错误信息增强

```typescript
await waitFor(
  () => {
    const element = screen.getByText('Loading')
    expect(element).toBeInTheDocument()
  },
  {
    onTimeout: (error) => {
      screen.debug()
      return new Error(`${error.message}\n当前 DOM: ${document.body.innerHTML}`)
    }
  }
)
```

## 10. 版本兼容性

- React 16.9+：完全支持
- React 16.8：部分支持（需要额外配置）
- React 16.8 以下：建议使用 wait（已废弃）

## 参考资料

1. [Testing Library 官方文档](https://testing-library.com/docs/dom-testing-library/api-async)
2. [Jest 官方文档](https://jestjs.io/docs/timer-mocks)
3. [React Testing Library GitHub](https://github.com/testing-library/react-testing-library)
4. [DOM Testing Library GitHub](https://github.com/testing-library/dom-testing-library)
