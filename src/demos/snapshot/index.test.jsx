import { render } from '@testing-library/react';
import { App, defaultProps } from './index';

describe('snapshot', () => {
  /**
   * 测试快照在组件渲染时的使用场景
   * 如果需要更新快照，有以下几种方式：
   * 1. 删除快照文件，重新运行测试用例
   * 2. 在终端运行 test --watch，快照匹配失败时可以按 u 更新快
   * 3. 使用 vscode-jest 工具，直接更新快照
   */
  test('should match snapshot', () => {
    const { asFragment } = render(<App />);
    expect(asFragment()).toMatchSnapshot();
  });

  /**
   * 使用内联快照测试默认配置，在没有TS的情况下可能会有用处
   */
  test('should match inline snapshot', () => {
    expect(defaultProps).toMatchInlineSnapshot(
      {
        name: expect.any(String),
      },
      `
        {
          "name": Any<String>,
        }
      `,
    );
  });
});
