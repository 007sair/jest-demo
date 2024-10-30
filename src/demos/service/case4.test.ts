import { getUser } from './request';

jest.mock('./request'); // 这里会全量模拟 request 下的所有导出

// 使用真实的 getSpace 函数
const { getSpace } = jest.requireActual('./request');

test('getUser 测试', () => {
  (getUser as jest.Mock).mockResolvedValue('case3');
  return getUser().then(res => {
    expect(res).toEqual('case3');
  });
});

test('getSpace 测试', () => {
  expect(getSpace()).toBe('space');
});
