export async function fetchDataWithAsync() {
  return 'peanut butter';
}

export type Callback = (val: string) => void;

export function fetchDataWithCallback(callback: Callback) {
  setTimeout(() => {
    callback('peanut butter');
  }, 1000);
}

export function fetchDataWithPromise() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('peanut butter');
    }, 1000);
  });
}

export function fetchDataWithError() {
  return Promise.reject('error');
}

export function fetchDataSuccess() {
  return Promise.resolve('peanut butter');
}
