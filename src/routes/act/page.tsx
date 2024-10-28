import Counter from './Counter';
import { SimpleCounter } from './SimpleCounter';

export default function ActPage() {
  return (
    <>
      <h3>Counter</h3>
      <Counter />
      <h3>SimpleCounter</h3>
      <SimpleCounter />
    </>
  );
}
