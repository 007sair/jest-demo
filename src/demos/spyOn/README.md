# jest.spyOn()

`jest.spyOn` 是 Jest 测试框架中用于间谍（spy）或模拟（mock）对象方法的重要工具。它允许你监控函数的调用情况，并在需要时修改其实现。与 `jest.fn()` 类似，`jest.spyOn` 提供了一种简洁的语法来创建和管理模拟函数，因此有时被称为 `jest.fn()` 的语法糖。

下面详细介绍 `jest.spyOn` 的定义、使用方法、与 `jest.fn()` 的关系以及最佳实践。

## 什么是 `jest.spyOn`？

`jest.spyOn` 是 Jest 提供的一个函数，用于创建一个间谍函数，监视对象方法的调用情况。它不仅可以跟踪函数的调用次数、参数和返回值，还可以选择性地修改函数的实现（例如，返回特定值或抛出错误）。

### 主要特点

- **监视现有方法**：可以监视对象上的现有方法，而不需要重新定义整个方法
- **部分模拟**：允许在保留原始方法行为的同时，添加监控功能。
- **可控制的行为**：可以选择性地重写方法的实现，如返回特定值或模拟错误。

## 如何使用 `jest.spyOn`？

### 基础用法

假设你有一个对象 `math`，其中包含一个 `add` 方法，你希望在测试中监视 `add` 方法的调用情况：

```javascript
// math.js
export const math = {
  add: (a, b) => a + b,
};
```

### 创建间谍

使用 `jest.spyOn` 来监视 `math.add` 方法：

```javascript
// math.test.js
import { math } from './math';

test('adds two numbers', () => {
  // 创建一个间谍来监视 math.add 方法
  const spy = jest.spyOn(math, 'add');
  const result = math.add(2, 3);

  // 使用“间谍🕵”断言方法是否被调用、被调用的参数是什么
  expect(spy).toHaveBeenCalled();
  expect(spy).toHaveBeenCalledWith(2, 3);

  // 断言原函数的返回值
  expect(result).toBe(5);

  // 恢复原始方法
  spy.mockRestore();
});
```

### 修改方法实现

你可以使用间谍来修改方法的实现，例如返回一个固定值：

```javascript
test('adds two numbers with mock implementation', () => {
  const spy = jest.spyOn(math, 'add').mockImplementation(() => 10);
  const result = math.add(2, 3);
  expect(result).toBe(10);
  spy.mockRestore();
});
```

### 模拟方法抛出错误

你还可以模拟方法抛出错误：

```javascript
test('adds two numbers and throws error', () => {
  const spy = jest.spyOn(math, 'add').mockImplementation(() => {
    throw new Error('Mocked error');
  });

  expect(() => math.add(2, 3)).toThrow('Mocked error');

  spy.mockRestore();
});
```

### 清理与恢复

在测试结束后，确保调用 `spy.mockRestore()` 来恢复原始方法，避免对其他测试产生影响。

### 与 `jest.fn()` 的比较

`jest.spyOn` 内部实际上使用了 `jest.fn()` 来创建间谍函数，因此在某些情况下，`jest.spyOn` 可以看作是 `jest.fn()` 的语法糖。以下是两者的比较：

| 特性             | `jest.fn()`                  | `jest.spyOn`                                                   |
| ---------------- | ---------------------------- | -------------------------------------------------------------- |
| 用途             | 创建一个全新的模拟函数       | 监视（间谍）现有对象的方法                                     |
| 是否需要现有对象 | 否                           | 是                                                             |
| 原始方法调用     | 不调用原始方法，除非手动指定 | 可以选择性调用原始方法（默认情况下会调用原始方法，除非被模拟） |
| 用法             | 常用于替换任何函数进行模拟   | 常用于监视和局部模拟对象的方法                                 |

### 示例对比

#### 使用 `jest.fn()`

```javascript
const mockAdd = jest.fn((a, b) => a + b);

const result = mockAdd(2, 3);

expect(mockAdd).toHaveBeenCalledWith(2, 3);
expect(result).toBe(5);
```

#### 使用 `jest.spyOn`

```javascript
const spy = jest.spyOn(math, 'add');

const result = math.add(2, 3);

expect(spy).toHaveBeenCalledWith(2, 3);
expect(result).toBe(5);

spy.mockRestore();
```

从示例中可以看出，`jest.spyOn` 更适用于监视现有对象的方法，而 `jest.fn()` 更适用于创建独立的模拟函数。

## 为什么说 `jest.spyOn` 是 `jest.fn()` 的语法糖？

`jest.spyOn` 相当于在现有对象的方法基础上，自动创建了一个 `jest.fn()` 形式的间谍函数，并替换了原始方法。这样，你无需手动创建 `jest.fn()` 并替换方法，实现了更简洁和直观的监视方式。因此，`jest.spyOn` 可以被视为 `jest.fn()` 在监视现有方法场景下的语法糖。

### 内部机制

当调用 `jest.spyOn(object, 'method')` 时，Jest 执行以下操作：

1. **创建间谍函数**：内部使用 `jest.fn()` 创建一个新的模拟函数。
2. **替换原始方法**：将对象的 `method` 替换为新的间谍函数。
3. **保留原始实现**：默认情况下，间谍函数会调用原始方法，除非你通过 `mockImplementation` 或其他方法修改了它。

这种自动化的过程使得 `jest.spyOn` 成为监视和部分模拟现有方法的便捷工具，从而减少了手动使用 `jest.fn()` 的步骤，体现了其作为 `jest.fn()` 语法糖的特性。

## 何时使用 `jest.spyOn`？

- **需要监视现有对象方法的调用情况和参数**：例如，监视一个类的方法是否被正确调用。
- **部分模拟方法**：在保留部分或全部原始实现的同时，监视方法的行为。
- **测试依赖方法的调用次数**：确保某个方法在特定操作中被调用了预期次数。

## 何时直接使用 `jest.fn()`？

- **创建独立的模拟函数**：不依赖于现有对象的方法。
- **需要完全控制函数的行为**：不需要保留任何原始实现。
- **传递模拟函数作为回调或参数**：例如，模拟事件处理程序。

## 最佳实践

1. **保持测试的独立性**：每个测试应独立运行，避免测试之间的相互影响。使用 `spy.mockRestore()` 或 `jest.restoreAllMocks()` 在测试结束时恢复原始方法。

    ```javascript
    afterEach(() => {
      jest.restoreAllMocks();
    });
    ```

2. **只监视必要的方法**：仅对需要监视的关键方法使用间谍，避免过度模拟，保持测试的可维护性。

3. **结合 `jest.mock` 使用**：在需要时结合 `jest.mock` 和 `jest.spyOn` 来全面控制模块的行为。

4. **使用 TypeScript 时确保类型安全**：确保 `jest.spyOn` 的对象和方法类型正确，以获得类型检查和自动补全的好处。

5. **避免过度依赖实现细节**：尽量测试行为而非实现细节，减少对具体方法调用的依赖，提升测试的鲁棒性。

## 完整示例

以下是一个完整的示例，展示如何使用 `jest.spyOn` 来监视和部分模拟一个对象的方法：

```javascript
// userService.js
export const userService = {
  fetchUser: async (id) => {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  },
};
```

```javascript
// userService.test.js
import { userService } from './userService';

describe('userService', () => {
  afterEach(() => {
    jest.restoreAllMocks(); // 确保每个测试后恢复所有间谍
  });

  test('fetchUser successfully fetches user data', async () => {
    const mockUser = { id: 1, name: 'John Doe' };

    // 创建间谍并模拟成功的响应
    const spy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockUser),
    });

    const user = await userService.fetchUser(1);

    expect(spy).toHaveBeenCalledWith('/api/users/1');
    expect(user).toEqual(mockUser);
  });

  test('fetchUser throws an error when response is not ok', async () => {
    // 创建间谍并模拟失败的响应
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
    });

    await expect(userService.fetchUser(1)).rejects.toThrow('Network response was not ok');
  });
});
```

在上述示例中：

- **创建间谍**：使用 `jest.spyOn` 监视全局的 `fetch` 方法。
- **部分模拟**：在第一个测试中模拟了一个成功的响应，在第二个测试中模拟了一个失败的响应。
- **验证调用**：检查 `fetch` 方法是否被正确调用，并验证返回值或抛出的错误。
- **清理**：通过 `jest.restoreAllMocks()` 确保每个测试后恢复所有被间谍的方法，避免对其他测试产生影响。

## 总结

`jest.spyOn` 是一个强大且灵活的工具，用于监视和部分模拟现有对象的方法。它通过简化 `jest.fn()` 的使用，提供了一种更直观和高效的方式来管理模拟函数。因此，`jest.spyOn` 常被视为 `jest.fn()` 的语法糖，特别是在需要监视现有方法时。通过合理使用 `jest.spyOn`，可以显著提升测试的覆盖率和可靠性，同时保持测试代码的简洁和可维护性。
