/**
 * 使用 __mocks__ 手动模拟
 * 需要注意：import的路径必须为如下 `@` 开头的绝对路径
 */

import { getUser } from '@/demos/service/request';

test('request 测试', () => {
  return getUser().then(res => {
    expect(res).toEqual('case4');
  });
});
