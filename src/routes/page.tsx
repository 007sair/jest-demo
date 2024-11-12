import { Link } from '@modern-js/runtime/router';

const Li = ({ children }: { children: string }) => (
  <li>
    <Link to={children}>{children}</Link>
  </li>
);

export default function Index() {
  return (
    <>
      <h2>Demo</h2>
      <ul>
        <Li>/act</Li>
        <Li>/global-style</Li>
        <Li>/wait-for</Li>
      </ul>
    </>
  );
}
