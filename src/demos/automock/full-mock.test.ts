// jest.enableAutomock();

import { MyClass, add, fetchData } from './full-mock';

jest.mock('./full-mock');

describe('自动模拟行为', () => {
  test('函数被自动模拟', () => {
    // 所有函数变成了mock函数
    expect(jest.isMockFunction(add)).toBe(true);
    expect(jest.isMockFunction(fetchData)).toBe(true);

    // 默认返回undefined
    expect(add(1, 2)).toBeUndefined();
    expect(fetchData()).toBeUndefined();
  });

  test('类被自动模拟', () => {
    const instance = new MyClass();
    expect(jest.isMockFunction(MyClass)).toBe(true);
    expect(jest.isMockFunction(instance.method)).toBe(true);
    expect(instance.method()).toBeUndefined();
  });
});

describe('取消自动模拟，测试功能实现', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.unmock('./full-mock');
  });

  it('test add', () => {
    const { add } = require('./full-mock');
    /**
     * 如果没有 beforeEach 中的 unmock 和 重新 require
     * 这里就会失败，提示 toBe 里应该是 undefined
     */
    expect(add(1, 2)).toBe(3);
  });

  it('test fetchData', async () => {
    const { fetchData } = require('./full-mock');
    global.fetch = jest.fn(); // 如果要验证 fetch 返回值，这里就不能这么写这么简单
    await fetchData();
    expect(fetch).toHaveBeenCalledWith('api/data');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('test MyClass', () => {
    const { MyClass } = require('./full-mock');
    const inst = new MyClass();
    expect(inst.method()).toBe('original');
  });
});
