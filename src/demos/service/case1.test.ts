/**
 * 通过 jest.fn 模拟 getUser 的返回值
 */

import { getUser } from './request';

// 仅模拟 getUser，如果此时需要测试 getSpace，就会报错。
// 参考 case2 如何解决这个问题
jest.mock('./request', () => {
  return {
    getUser: jest.fn(() => Promise.resolve('case1')),
  };
});

test('request 测试', () => {
  return getUser().then(res => {
    expect(res).toEqual('case1');
  });
});
