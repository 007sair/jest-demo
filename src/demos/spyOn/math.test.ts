import { math } from './math';

describe('spyOn demos', () => {
  test('adds two numbers', () => {
    // 创建一个间谍来监视 math.add 方法
    const spy = jest.spyOn(math, 'add');

    const result = math.add(2, 3);

    // 断言方法是否被调用
    expect(spy).toHaveBeenCalled();

    // 断言方法调用的参数
    expect(spy).toHaveBeenCalledWith(2, 3);

    // 断言返回值
    expect(result).toBe(5);

    // 恢复原始方法
    spy.mockRestore();
  });

  test('adds two numbers with mock implementation', () => {
    const spy = jest.spyOn(math, 'add').mockImplementation(() => 10);
    const result = math.add(2, 3);
    expect(result).toBe(10);
    spy.mockRestore();
  });

  test('adds two numbers and throws error', () => {
    const spy = jest.spyOn(math, 'add').mockImplementation(() => {
      throw new Error('Mocked error');
    });

    expect(() => math.add(2, 3)).toThrow('Mocked error');

    spy.mockRestore();
  });
});
