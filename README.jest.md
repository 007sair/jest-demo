# Jest 记录

## 安装 Jest

```bash
# 安装相关依赖
pnpm install -D jest jest-environment-jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom
```

```bash
# 初始化 Jets，并生成一个基础的 jest.config.[jt]s 配置
pnpm create jest@latest
```

```bash
# 执行 create 命令后依次安装
(base) ➜  jeet-demo git:(main) ✗ pnpm create jest@latest
 WARN  2 deprecated subdependencies found: glob@7.2.3, inflight@1.0.6
.../Library/pnpm/store/v3/tmp/dlx-10202  | +224 ++++++++++++++++++++++
.../Library/pnpm/store/v3/tmp/dlx-10202  | Progress: resolved 224, reused 223, downloaded 1, added 224, done

The following questions will help Jest to create a suitable configuration for your project

✔ Would you like to use Jest when running "test" script in "package.json"? … yes
✔ Would you like to use Typescript for the configuration file? … yes
✔ Choose the test environment that will be used for testing › jsdom (browser-like)
✔ Do you want Jest to add coverage reports? … yes
✔ Which provider should be used to instrument code for coverage? › v8
✔ Automatically clear mock calls, instances, contexts and results before every test? … yes

✏️  Modified /Users/longchan/Desktop/sair/jeet-demo/package.json

📝  Configuration file created at /Users/longchan/Desktop/sair/jeet-demo/jest.config.ts
(base) ➜  jeet-demo git:(main) ✗
```

```bash
# 安装额外的依赖
pnpm install -D babel-jest @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript
```

出现报错：

```bash
(base) ➜  jeet-demo git:(main) ✗ pnpm install -D babel-jest @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript
 ERR_PNPM_NO_MATCHING_VERSION  No matching version found for @babel/plugin-syntax-import-assertions@^7.26.0

This error happened while installing the dependencies of @babel/preset-env@7.26.0

The latest release of @babel/plugin-syntax-import-assertions is "7.25.9".

Other releases are:
  * esm: 7.21.4-esm.4
  * next: 8.0.0-alpha.12

If you need the full list of all 35 published versions run "$ pnpm view @babel/plugin-syntax-import-assertions versions".
Progress: resolved 424, reused 409, downloaded 1, added 0
(base) ➜  jeet-demo git:(main) ✗
```

降低版本重新安装：

```bash
pnpm install -D babel-jest @babel/{core,preset-env,preset-react,preset-typescript}@7.25.9
```

## 问题

### 1、下载好项目后，保存代码时无法自动格式化

需要安装 vscode 插件：Biome

### 2、运行 test 失败

```bash
 FAIL  src/demos/snapshot/page.test.tsx
  ● Test suite failed to run

    Cannot find module '@/routes/page' from 'src/demos/snapshot/page.test.tsx'

      1 | import '@testing-library/jest-dom';
    > 2 | import Page from '@/routes/page';
        | ^
      3 | import { BrowserRouter as Router } from '@modern-js/runtime/router';
      4 | import { render, screen } from '@testing-library/react';
      5 |

      at Resolver._throwModNotFoundError (node_modules/.pnpm/jest-resolve@29.7.0/node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.<anonymous> (src/demos/snapshot/page.test.tsx:2:1)

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        1.881 s
```

原因是 jest.config.ts 中确实 moduleNameMapper 配置：

```
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/src/$1',
  },
```

### 3、Jest encountered an unexpected token

```bash

 FAIL  src/demos/snapshot/page.test.tsx
  ● Test suite failed to run

    Jest encountered an unexpected token

 Details:

    /Users/longchan/Desktop/sair/jeet-demo/src/routes/index.css:2
    body {
         ^

    SyntaxError: Unexpected token '{'

      1 | import { Helmet } from '@modern-js/runtime/head';
    > 2 | import './index.css';
        | ^
      3 |
      4 | const Index = () => (
      5 |   <div className="container-box">

      at Runtime.createScriptFromCode (node_modules/.pnpm/jest-runtime@29.7.0/node_modules/jest-runtime/build/index.js:1505:14)
      at Object.<anonymous> (src/routes/page.tsx:2:1)
      at Object.<anonymous> (src/demos/snapshot/page.test.tsx:1:1)

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        2.388 s
```

解决办法：

1. 安装 `identity-obj-proxy` 依赖包
2. 在 `jest.config.ts` 的 `moduleNameMapper` 配置 `'\\.(scss|sass|css)$': 'identity-obj-proxy'`
