# jest.mock 用法

## case1

演示了通过 mock 实现 getUser 方法，以及 使用 jest.fn 模拟 Promise。

注意：如果在这个 case 里编写 getSpace 是会报错的。可以参考 case2 解决。

## case2

在 case1 的基础上增加了 `jest.requireActual`，这样就实现了 request 的全量导入以及局部模拟。

## case3

演示 mockResolvedValue 的用法

## case4

演示了在全量 mock request 时，如果通过 jest.requireActual 引入局部真实的函数。

## case5

演示了通过 `__mocks__` 方式手动模拟 request 模块

## case6

解决前 5 个 case 无法覆盖 getUser 中 fetch 语句的问题。
