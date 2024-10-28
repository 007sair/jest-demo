/**
 * 使 styled-components 组件内的 props.theme 支持类型，
 * 类型来自 App.tsx 的 ThemeProvider 传递的 theme
 */

import type { GlobalToken } from 'antd/es/theme/interface';

declare module '@modern-js/runtime/styled' {
  export interface DefaultTheme extends GlobalToken {
    /**
     * 是否为紧凑模式
     * @description 可以在全局设置里开启紧凑模式
     */
    isCompact?: boolean;
  }
}
