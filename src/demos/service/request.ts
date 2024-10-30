export const getUser = () => {
  return fetch('/user')
    .then(res => res.json())
    .then(res => res.data);
};

export const getSpace = () => {
  return 'space';
};
