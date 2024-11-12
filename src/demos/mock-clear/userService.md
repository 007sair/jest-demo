# Mock清理知识

通过这个 demo 展示 clear、reset、restore 的区别：

- **`mockClear()` 的使用场景**

    - 主要用于清除函数调用的历史记录
    - 适用于需要精确追踪函数调用次数的场景
    - 实例中展示了如何在多次调用之间清除历史，确保计数准确

- **`mockReset()` 的使用场景**

    - 不仅清除调用历史，还会重置mock的实现为默认值（返回undefined）
    - 适用于需要重置mock行为到初始状态的场景
    - 示例中展示了如何从自定义实现重置到默认行为

- **`mockRestore()` 的使用场景**

    - 完全恢复原始函数的实现
    - 适用于需要在测试中临时mock，之后恢复原始行为的场景
    - 示例中展示了如何在mock后恢复真实的计算逻辑

**最佳实践：**

- 在 beforeEach 中设置mock，在 afterEach 中清理
- 使用 mockClear 当只需要清除调用历史时
- 使用 mockReset 当需要重置为默认行为时
- 使用 mockRestore 当需要恢复原始实现时
- 在实际项目中，建议在测试结束后总是使用 mockRestore 或 jest.restoreAllMocks() 确保不影响其他测试
