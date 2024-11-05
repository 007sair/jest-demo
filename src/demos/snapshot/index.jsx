export const defaultProps = {
  name: 'world',
};

export const App = props => {
  return <>hello {props?.name || defaultProps.name}</>;
};
