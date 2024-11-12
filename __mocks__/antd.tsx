import type { ColorPickerProps, ConfigProviderProps } from 'antd';
import React, { createContext } from 'react';

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

const notification = {
  success: jest.fn(),
  error: jest.fn(),
};

// 创建主题 Context
const MockThemeContext = createContext<ConfigProviderProps['theme']>({ token: { colorPrimary: '#1677ff' } });

const ConfigProvider = ({ theme, children }: ConfigProviderProps) => (
  <MockThemeContext.Provider value={theme}>{children}</MockThemeContext.Provider>
);

// 模拟 ColorPicker
// @ts-expect-error
const ColorPicker = ({ value, onChangeComplete, showText }) => (
  <div data-testid="mock-color-picker">
    <input type="color" value={value} onChange={e => onChangeComplete({ toHexString: () => e.target.value })} />
    {showText && <span data-testid="color-text">{value}</span>}
  </div>
);

// 导出模拟的模块
module.exports = {
  ...actualAntd, // 保留其他实际的 antd 功能
  theme,
  notification,
  ColorPicker,
  ConfigProvider,
};

// 为了 TypeScript 类型检查，添加默认导出
export default module.exports;
