import { getUser } from './request';

jest.mock('./request');

test('getUser 测试', () => {
  (getUser as jest.Mock).mockResolvedValue('case2');

  // or
  // (getUser as jest.Mock).mockImplementation(() => Promise.resolve('case2'));

  return getUser().then(res => {
    expect(res).toEqual('case2');
  });
});
