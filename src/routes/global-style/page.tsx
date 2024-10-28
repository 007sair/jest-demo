import { ThemeProvider, createGlobalStyle } from '@modern-js/runtime/styled';
import { Button, Card, ColorPicker, ConfigProvider, Flex, theme } from 'antd';
import { useState } from 'react';

export const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${props => props.theme.colorPrimary};
  }
`;

export default function GlobalStylePage() {
  const [color, setColor] = useState('#1677ff');
  const { token } = theme.useToken();

  return (
    <>
      <ConfigProvider theme={{ token: { colorPrimary: color } }}>
        <Card>
          <Flex gap={20}>
            <Button type="primary">Primary</Button>
            <ColorPicker value={color} onChangeComplete={c => setColor(c.toHexString())} showText />
          </Flex>
        </Card>
      </ConfigProvider>
      <ThemeProvider theme={{ ...token, colorPrimary: color }}>
        <GlobalStyle />
      </ThemeProvider>
    </>
  );
}
