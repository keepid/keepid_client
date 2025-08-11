import getServerURL from '../../serverOverride';

export async function httpfetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  return new Promise((resolve, reject) => {
    fetch(`${getServerURL()}/${url}`, options)
      .then((res) => {
        if (res.status >= 400) return null;
        return res.json();
      })
      .then((data) => resolve(data))
      .catch((error) => {
        reject(error);
      });
  });
}
