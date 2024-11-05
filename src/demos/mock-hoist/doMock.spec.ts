/**
 * 测试 jest.doMock()
 */

console.log('2. 文件开始执行');

// biome-ignore lint/style/noVar: <explanation>
var mockImpl = 'A';
console.log('3. mockImpl 初始化为:', mockImpl);

jest.mock('./moduleToMock', () => {
  console.log('1. 执行 jest.mock, 当前 mockImpl:', mockImpl);
  return {
    someFunction: () => mockImpl,
  };
});

console.log('4. 设置新的 mockImpl 值');
mockImpl = 'B';
console.log('5. 现在 mockImpl 是:', mockImpl);

import { someFunction } from './moduleToMock';

test.skip('验证 jest.mock 的提升行为', () => {
  console.log('6. 测试执行时 mockImpl 是:', mockImpl);
  console.log('7. someFunction 返回值是:', someFunction());
  // 这会失败，因为 someFunction 返回 undefined
  expect(someFunction()).toBe('B');
});

// 使用 doMock 的正确方式
describe.skip('验证 jest.doMock 行为', () => {
  beforeEach(() => {
    // 清除模块缓存很重要
    jest.resetModules();
  });

  it('should use current mockImpl value', () => {
    mockImpl = 'C';
    console.log('8. doMock 之前 mockImpl 是:', mockImpl);

    jest.doMock('./moduleToMock', () => {
      console.log('9. 执行 doMock, 当前 mockImpl:', mockImpl);
      return {
        someFunction: () => mockImpl,
      };
    });

    // 必须在 doMock 之后重新导入
    const { someFunction } = require('./moduleToMock');

    console.log('10. doMock 测试中 someFunction 返回值:', someFunction());
    expect(someFunction()).toBe('C'); // 这会通过
  });
});
