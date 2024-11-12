# Jest Mock 清理完整指南

## 基础清理方法

### 1. `mockClear()`

- 仅清理**调用记录**（`mock.calls` 和 `mock.results`）
- **保留** mock 的实现和返回值

```javascript
const mock = jest.fn(() => 'test');
mock();
mock.mockClear();       // 清除调用记录
expect(mock.mock.calls.length).toBe(0);  // ✅
expect(mock()).toBe('test');             // ✅ 实现仍在
```

### 2. `mockReset()`

- 清理**调用记录和实现**
- 返回值变为 `undefined`

```javascript
const mock = jest.fn(() => 'test');
mock();
mock.mockReset();       // 清除记录和实现
expect(mock.mock.calls.length).toBe(0);  // ✅
expect(mock()).toBe(undefined);          // ✅ 实现被重置
```

### 3. `mockRestore()`

- 清理**一切**并**恢复原始实现**
- 仅适用于 `jest.spyOn()` 创建的 spy

```javascript
const obj = {
  method: () => 'original'
};

const spy = jest.spyOn(obj, 'method').mockImplementation(() => 'mocked');
spy.mockRestore();      // 恢复原始实现
expect(obj.method()).toBe('original');   // ✅
```

### 方法对比表

| 方法            | 清除调用记录 | 清除 Mock 实现 | 恢复原始实现 | 适用场景                    |
| ------------- | ------ | ---------- | ------ | ----------------------- |
| mockClear()   | ✅      | ❌          | ❌      | 保留 mock 实现，只清除调用记录      |
| mockReset()   | ✅      | ✅          | ❌      | 完全重置 mock 状态            |
| mockRestore() | ✅      | ✅          | ✅      | 用于 jest.spyOn() 创建的 spy |

## 二、自动清理配置

## 自动清理配置

### 1. 全局配置（推荐）

```javascript
// jest.config.js
module.exports = {
  clearMocks: true,      // 每个测试后自动 mockClear
  resetMocks: true,      // 每个测试后自动 mockReset
  restoreMocks: true,    // 每个测试后自动 mockRestore
};
```

### 2. 测试文件中配置

```javascript
describe("测试套件", () => {
  // 方式1: beforeEach
  beforeEach(() => {
    jest.clearAllMocks() // 清除所有mock的调用记录
    // 或
    jest.resetAllMocks() // 重置所有mock
    // 或
    jest.restoreAllMocks() // 恢复所有spy的原始实现
  })

  // 方式2: 单次测试配置
  it("单个测试", () => {
    const mock = jest.fn()
    mock()

    // 仅在此测试中清理
    mock.mockClear()
  })
})
```

## 特殊场景处理

### 1. 模块级别的 Mock 清理

```js
// 清理特定模块
beforeEach(() => {
  jest.resetModules();           // 清理模块缓存
  jest.unmock('./someModule');   // 取消特定模块的mock
});

// 重新导入模块
const module = require('./someModule');
```

### 2. 部分清理与保留

```javascript
const mock = jest.fn(() => 'original');

test('选择性清理', () => {
  // 保存原始实现
  const originalImplementation = mock.getMockImplementation();

  // 临时修改实现
  mock.mockImplementation(() => 'temporary');

  // 测试后恢复
  mock.mockImplementation(originalImplementation);
});
```

### 3. 异步 Mock 清理

```javascript
const asyncMock = jest.fn().mockResolvedValue('result');

test('异步mock清理', async () => {
  await asyncMock();

  // 清理并设置新的异步返回值
  asyncMock.mockReset();
  asyncMock.mockResolvedValueOnce('new result');
});
```

## 最佳实践

### 1. 清理时机选择

```javascript
describe("Mock清理最佳实践", () => {
  const mock = jest.fn()

  // ✅ 推荐：每个测试前清理
  beforeEach(() => {
    mock.mockClear()
  })

  // ❌ 不推荐：测试后清理
  afterEach(() => {
    mock.mockClear()
  })

  // ✅ 特定场景：测试后清理
  afterEach(() => {
    // 例如：清理可能影响其他测试的副作用
    jest.restoreAllMocks()
  })
})

```

### 2. 按需选择清理方法

```javascript
// 场景 1: 只需清理调用记录
beforeEach(() => {
  mock.mockClear();  // ✅ 最小影响
});

// 场景 2: 需要完全重置
beforeEach(() => {
  mock.mockReset();  // ✅ 完全重置
});

// 场景 3: 使用了 spy 且需要恢复原始实现
beforeEach(() => {
  mock.mockRestore();  // ✅ 适用于 spy
});
```

### 3. 共享 Mock 的处理

```javascript
// 共享 mock 配置
const sharedMock = jest.fn();

describe('特性 A', () => {
  beforeEach(() => {
    sharedMock.mockImplementation(() => 'A');
  });

  afterEach(() => {
    sharedMock.mockClear();
  });
});

describe('特性 B', () => {
  beforeEach(() => {
    sharedMock.mockImplementation(() => 'B');
  });

  afterEach(() => {
    sharedMock.mockClear();
  });
});
```

## 常见问题解决

### 1. Mock 状态泄露

```javascript
// ❌ 可能导致状态泄露
const mock = jest.fn();

describe('测试套件 A', () => {
  test('测试 1', () => {
    mock.mockImplementation(() => 'A');
  });
});

describe('测试套件 B', () => {
  test('测试 2', () => {
    // mock 可能还保留着套件 A 的实现
    expect(mock()).toBe(undefined); // 可能失败
  });
});

// ✅ 正确做法：确保清理
beforeEach(() => {
  mock.mockReset();
});
```

### 2. 模块 Mock 的清理

```javascript
// ✅ 正确处理模块 mock
beforeAll(() => {
  jest.resetModules();
  jest.mock('./module');
});

afterAll(() => {
  jest.resetModules();
  jest.unmock('./module');
});
```

### 3. 清理验证

```javascript
test("确保 mock 被正确清理", () => {
  const mock = jest.fn()

  mock("test")
  mock.mockClear()

  // 验证清理是否成功
  expect(mock.mock.calls.length).toBe(0)
  expect(mock.mock.results.length).toBe(0)
})

test("验证 Mock 清理", () => {
  const mock = jest.fn(() => "test")

  mock()
  expect(mock).toHaveBeenCalled()

  mock.mockClear()
  expect(mock).not.toHaveBeenCalled() // 验证调用记录已清理
  expect(mock()).toBe("test") // 验证实现仍然存在

  mock.mockReset()
  expect(mock()).toBeUndefined() // 验证实现已重置
})
```

## 其他笔记

- [Mock清理知识](./userService.md)
- [jest.spyOn 的类型定义](./jest.spyOn%20type.md)
