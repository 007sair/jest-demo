import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import Page, { AsyncData, AsyncForm, DelayedShow } from './page';

describe('AsyncData', () => {
  // 1. 等待异步数据加载
  test('等待数据加载 - waitFor', async () => {
    render(<AsyncData />);

    // 初始状态
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // 等待数据加载完成
    await waitFor(() => {
      expect(screen.getByText('Loaded Data')).toBeInTheDocument();
    });
  });

  test('等待数据加载 - waitForElementToBeRemoved', async () => {
    render(<AsyncData />);

    // 初始状态
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitForElementToBeRemoved(() => expect(screen.getByText('Loading...')));

    expect(screen.getByText('Loaded Data')).toBeInTheDocument();
  });

  test('等待数据加载 - findBy', async () => {
    render(<AsyncData />);

    // 使用 findByText 等待元素出现
    const element = await screen.findByText('Loaded Data');

    expect(element).toBeInTheDocument();
  });

  // 2. 等待点击后的延迟显示
  test('等待内容显示', async () => {
    render(<DelayedShow />);

    // 点击按钮
    fireEvent.click(screen.getByText('Show Message'));

    // 等待消息显示
    await waitFor(() => {
      expect(screen.getByText('Hello World!')).toBeInTheDocument();
    });
  });

  // 3. 等待表单验证消息
  test('等待错误消息显示', async () => {
    render(<AsyncForm />);

    // 提交表单
    fireEvent.submit(screen.getByRole('form'));

    // 等待错误消息
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid input!');
    });
  });

  // 4. 使用 waitFor 的选项
  test('使用 waitFor 的高级选项', async () => {
    render(<AsyncData />);

    await waitFor(
      () => {
        expect(screen.getByText('Loaded Data')).toBeInTheDocument();
      },
      {
        timeout: 2000, // 最长等待时间
        interval: 100, // 重试间隔
        onTimeout: error => {
          console.error('Timeout waiting for element');
          throw error;
        },
      },
    );
  });

  // 5. 等待元素消失
  test('等待元素消失', async () => {
    render(<AsyncData />);

    // 等待 Loading 消失
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });
});

describe('Page.tsx', () => {
  test('should match snapshot', () => {
    const { asFragment } = render(<Page />);
    expect(asFragment()).toMatchSnapshot();
  });
});
