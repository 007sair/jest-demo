# Mock 清理 知识

通过这个 demo 展示 clear、reset、restore 的区别：

- **`mockClear()` 的使用场景**

    - 主要用于清除函数调用的历史记录
    - 适用于需要精确追踪函数调用次数的场景
    - 实例中展示了如何在多次调用之间清除历史，确保计数准确

- **`mockReset()` 的使用场景**

    - 不仅清除调用历史，还会重置mock的实现为默认值（返回undefined）
    - 适用于需要重置mock行为到初始状态的场景
    - 示例中展示了如何从自定义实现重置到默认行为

- **`mockRestore()` 的使用场景**

    - 完全恢复原始函数的实现
    - 适用于需要在测试中临时mock，之后恢复原始行为的场景
    - 示例中展示了如何在mock后恢复真实的计算逻辑

**最佳实践：**

- 在 beforeEach 中设置mock，在 afterEach 中清理
- 使用 mockClear 当只需要清除调用历史时
- 使用 mockReset 当需要重置为默认行为时
- 使用 mockRestore 当需要恢复原始实现时
- 在实际项目中，建议在测试结束后总是使用 mockRestore 或 jest.restoreAllMocks() 确保不影响其他测试

## jest.spyOn 的类型定义

让我们详细解析这段代码中的类型定义：

```typescript
let fetchMock: jest.SpyInstance<
  Promise<UserProfile>,
  [userId: number],
  UserService
>;
```

这里的 `jest.SpyInstance` 有三个泛型参数，让我们逐个解析：

1. 第一个 `Promise<UserProfile>`：

    - 这表示 mock 函数的返回类型
    - `UserProfile` 在这里表示 Promise 解析后的数据类型

2. 第二个 `[userId: number]`：

    - 这是一个元组类型，表示函数参数列表
    - 在这个例子中，表示函数接受一个 number 类型的 userId 参数

3. 第三个 `UserService`：
    - 表示函数的 `this` 上下文类型
    - 通常可以保持为 `any`，除非你需要特别指定函数执行时的 this 上下文
    - 这是一个可选参数，如果不关心 this 类型，可以省略

使用建议：

1. 在开发初期或快速原型时，使用 `any` 是可以接受的
2. 在正式项目中，建议使用具体的类型定义，因为这样可以：
    - 获得更好的类型提示
    - 在重构时及早发现类型错误
    - 提高代码的可维护性
3. 如果使用具体类型，确保定义相关的接口（如 UserProfile, Activity 等）

TypeScript 中 Jest 的 mock 类型速查表：

```typescript
// 基本的Mock函数类型
jest.Mock<ReturnType, Args extends any[]>

// Spy实例类型
jest.SpyInstance<ReturnType, Args extends any[], This = any>

// 常见用法示例
// 无参数无返回值的函数
jest.Mock<void, []>

// 带参数有返回值的函数
jest.Mock<string, [number, string]>

// Promise函数
jest.Mock<Promise<Result>, [Input]>
```
