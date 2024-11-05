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
import type { DefaultTheme } from '@modern-js/runtime/styled';
import React from 'react';

interface ThemeProps {
  theme: Partial<DefaultTheme>;
  fns: Array<(props: { theme: Partial<DefaultTheme> }) => string | number>;
}

type GlobalStyleFunction = (props: { theme: ThemeProps['theme'] }) => string;

function interleave(strings: TemplateStringsArray, interpolations: Array<string | number>): string {
  const result = [strings[0]];

  for (let i = 0, len = interpolations.length; i < len; i += 1) {
    result.push(interpolations[i].toString(), strings[i + 1]);
  }

  return result.join('');
}

const injectTheme = (css: TemplateStringsArray, { theme, fns }: ThemeProps): string =>
  interleave(
    css,
    fns.map(fn => fn({ theme })),
  );

const _createGlobalStyle = (
  css: TemplateStringsArray,
  ...fns: Array<(props: { theme: ThemeProps['theme'] }) => string | number>
): GlobalStyleFunction => {
  return ({ theme }: { theme: ThemeProps['theme'] }) => injectTheme(css, { theme, fns });
};

const createGlobalStyle = jest.fn(_createGlobalStyle);

const ThemeProvider = ({
  children,
  theme = { colorPrimary: 'red' },
}: { children: JSX.Element; theme: Partial<DefaultTheme> }) => {
  return React.cloneElement(children, { theme });
};

// 获取实际模块
const actualStyled = jest.requireActual('@modern-js/runtime/styled');

module.exports = {
  __esModule: true,
  ...actualStyled,
  createGlobalStyle,
  ThemeProvider,
};
