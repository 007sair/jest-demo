console.log('测试文件开始执行');

// 先导入模块
import { someFunction } from './moduleToMock';

console.log('导入之后');

// 尝试 mock
jest.mock('./moduleToMock', () => {
  console.log('mock 被执行');
  return {
    someFunction: () => console.log('mock 函数被调用'),
  };
});

describe.skip('测试 mock 提升', () => {
  it('should use mocked function', () => {
    someFunction();
  });
});
