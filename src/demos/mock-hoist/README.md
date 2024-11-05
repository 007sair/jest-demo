# 验证 jest.mock 提升

`test.spec.ts` 中的运行结果如下：

```
    console.log
      mock 被执行

      at log (src/demos/test-mock/test.spec.ts:10:11)

    console.log
      测试文件开始执行

      at Object.log (src/demos/test-mock/test.spec.ts:1:9)

    console.log
      导入之后

      at Object.log (src/demos/test-mock/test.spec.ts:6:9)

    console.log
      mock 函数被调用

      at log (src/demos/test-mock/test.spec.ts:12:33)
```

