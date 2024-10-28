import React from 'react';

// 模拟的主题数据
const mockTheme = {
  colorPrimary: '#1677ff',
  fontSize: 14,
  colorBgContainer: '#ffffff',
};

// 获取实际的 antd 模块
const actualAntd = jest.requireActual('antd');

// 创建模拟的主题 hook
const theme = {
  useToken: () => ({ token: mockTheme }),
  // 如果需要，可以添加其他主题相关的方法
};

// 模拟 ColorPicker
const ColorPicker = ({ value, onChangeComplete, showText }) => (
  <div data-testid="antd-color-picker">
    <input
      type="color"
      value={value}
      data-testid="color-input"
      onChange={e => onChangeComplete({ toHexString: () => e.target.value })}
    />
    {showText && <span data-testid="color-text">{value}</span>}
  </div>
);

// 导出模拟的模块
module.exports = {
  ...actualAntd, // 保留其他实际的 antd 功能
  theme,
  ColorPicker,
};

// 为了 TypeScript 类型检查，添加默认导出
export default module.exports;
