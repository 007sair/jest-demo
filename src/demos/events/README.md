# Event

> 原文链接：[Introduction | Testing Library](https://testing-library.com/docs/user-event/intro)

### fireEvent 与 user-event 的区别

fireEvent 触发的是 DOM 事件，而 user-event 模拟的是完整的用户交互，这可能会触发多个事件，并在此过程中进行额外的检查。

Testing Library 内置的 fireEvent 是浏览器底层 dispatchEvent API 的一个轻量封装，允许开发者在任意元素上触发任意事件。然而，浏览器通常不仅仅只是为一个交互触发一个事件。例如，当用户在文本框中输入内容时，元素需要先获取焦点，随后键盘事件和输入事件才会被触发，并且在输入过程中，元素的选中状态和值会发生变化。

user-event 允许你描述用户交互而不是具体的事件。它在此过程中增加了可见性和可交互性的检查，并像浏览器中的用户交互一样操纵 DOM。它会考虑到，例如，浏览器不会允许用户点击隐藏的元素或在禁用的文本框中输入内容。这就是为什么你应该使用 user-event 来测试组件的交互。

然而，目前某些用户交互或其某些方面尚未在 user-event 中实现，因此无法通过 user-event 描述。在这些情况下，你可以使用 fireEvent 来触发软件依赖的具体事件。

请注意，这会使你的组件和/或测试依赖于你对交互具体方面的正确假设。因此，如果你已经做了大量工作来指定这些交互的正确方面，请考虑为此项目做出贡献，以便 user-event 也能够涵盖这些情况。

### 使用 `userEvent` 编写测试

我们建议在组件渲染之前调用 userEvent.setup()。这可以在测试中完成，或者通过一个设置函数实现。我们不建议在测试之外——例如在 before/after 钩子中——渲染组件或使用任何 userEvent 函数，原因详见“[避免嵌套测试](https://kentcdodds.com/blog/avoid-nesting-when-youre-testing)”部分。

```javascript
import userEvent from '@testing-library/user-event'

// 直接使用
test('点击按钮触发某个很棒的功能', async () => {
  const user = userEvent.setup()
  // 从你选择的框架库中导入 `render` 和 `screen`。
  // 参见 https://testing-library.com/docs/dom-testing-library/install#wrappers
  render(<MyComponent />)

  await user.click(screen.getByRole('button', {name: /click me!/i}))

  // ...断言...
})
```

```javascript
import userEvent from '@testing-library/user-event'

// 设置函数
function setup(jsx) {
  return {
    user: userEvent.setup(),
    // 从你选择的框架库中导入 `render`。
    // 参见 https://testing-library.com/docs/dom-testing-library/install#wrappers
    ...render(jsx),
  }
}

test('通过设置函数进行渲染', async () => {
  const {user} = setup(<MyComponent />)
  // ...
})
```

请注意，虽然直接调用像 `userEvent.click()` 这样的方法（内部会自动调用 `setup`）在 v14 中仍然支持，但该选项是为方便从 v13 到 v14 的迁移以及简单测试而存在。我们推荐使用 `userEvent.setup()` 返回的实例上的方法。

**尽量使用 userEvent API 去替代 fireEvent，尽管 fireEvent 中的有些特性 userEvent 还未包含，但将来可能会得到改善。**
