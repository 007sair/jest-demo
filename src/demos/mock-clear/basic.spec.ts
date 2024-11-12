describe('基础清理方法', () => {
  it('mockClear()', () => {
    const mock = jest.fn(() => 'test');
    mock();
    mock.mockClear(); // 清除调用记录
    expect(mock.mock.calls.length).toBe(0); // ✅
    expect(mock()).toBe('test'); // ✅ 实现仍在
  });

  it('mockReset()', () => {
    const mock = jest.fn(() => 'test');
    mock();
    mock.mockReset(); // 清除记录和实现
    expect(mock.mock.calls.length).toBe(0); // ✅
    expect(mock()).toBe(undefined); // ✅ 实现被重置
  });

  it('mockRestore()', () => {
    const obj = {
      method: () => 'original',
    };

    const spy = jest.spyOn(obj, 'method').mockImplementation(() => 'mocked');
    spy.mockRestore(); // 恢复原始实现
    expect(obj.method()).toBe('original'); // ✅
  });
});

describe.skip('测试 Mock状态泄漏', () => {
  const mock = jest.fn();

  describe('测试套件 A', () => {
    test('测试 1', () => {
      mock.mockImplementation(() => 'A');
    });
  });

  describe('测试套件 B', () => {
    test('测试 2', () => {
      // mock 可能还保留着套件 A 的实现
      expect(mock()).toBe(undefined); // 可能失败
    });
  });
});

describe('Mock 清理验证', () => {
  test('确保 mock 被正确清理', () => {
    const mock = jest.fn();

    mock('test');
    mock.mockClear();

    // 验证清理是否成功
    expect(mock.mock.calls.length).toBe(0);
    expect(mock.mock.results.length).toBe(0);
  });

  test('验证 Mock 清理', () => {
    const mock = jest.fn(() => 'test');

    mock();
    expect(mock).toHaveBeenCalled();

    mock.mockClear();
    expect(mock).not.toHaveBeenCalled(); // 验证调用记录已清理
    expect(mock()).toBe('test'); // 验证实现仍然存在

    mock.mockReset();
    expect(mock()).toBeUndefined(); // 验证实现已重置
  });
});
