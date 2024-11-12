// 获取实际模块
const actualRouter = jest.requireActual('@modern-js/runtime/router');

const Link = ({ to, children }: { to: string; children: React.ReactNode }) => {
  return (
    <a href={to} data-testid="roter-link">
      {children}
    </a>
  );
};

module.exports = {
  ...actualRouter,
  Link,
};
