/**
 * 手动模拟 `@modern-js/runtime/styled` 中的 createGlobalStyle 函数
 * @description 在写通过styled创建的全局样式的测试用例时，需要自行模拟createGlobalStyle函数，否则无法测试
 * @example
 * ```
 * // GlobalStyle.tsx
 * import { createGlobalStyle } from '@modern-js/runtime/styled'
 * export const GlobalStyle = createGlobalStyle`
 *   // 一些全局样式
 * `
 *
 * // GlobalStyle.test.tsx
 * jest.mock('@modern-js/runtime/styled') // 这里的代码与当前文件有直接关系
 * describe('@/components/common/GlobalStyle.tsx', () => {
 *  it('should match snapshot in GlobalStyle.tsx', () => {
 *    const { baseElement } = render(<GlobalStyle theme={theme as DefaultTheme} />)
 *    expect(baseElement).toMatchSnapshot()
 *  })
 *})
 * ```
 */
import React from 'react';

function interleave(strings, interpolations) {
  const result = [strings[0]];
  for (let i = 0, len = interpolations.length; i < len; i += 1) {
    result.push(interpolations[i].toString(), strings[i + 1]);
  }
  return result.join('');
}

const injectTheme = (css, { theme, fns }) =>
  interleave(
    css,
    fns.map(fn => fn({ theme })),
  );

const _createGlobalStyle = (css, ...fns) => {
  return ({ theme }) => injectTheme(css, { theme, fns });
};

export const createGlobalStyle = jest.fn(_createGlobalStyle);

export const ThemeProvider = ({ children, theme = { colorPrimary: 'red' } }) => {
  return React.cloneElement(children, { theme });
};
