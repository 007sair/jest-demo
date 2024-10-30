/**
 * 通过 jest.fn 模拟 getUser 的返回值
 */

import { getSpace, getUser } from './request';

// 仅模拟 getUser，其余使用真实（Actual）导出
jest.mock('./request', () => {
  return {
    ...jest.requireActual('./request'),
    getUser: jest.fn(() => Promise.resolve('case1')),
  };
});

test('request 测试', () => {
  return getUser().then(res => {
    expect(res).toEqual('case1');
  });
});

test('getSpace 测试', () => {
  expect(getSpace()).toBe('space');
});
