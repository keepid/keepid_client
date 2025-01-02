import getServerURL from '../../serverOverride';

async function http<T>(url: string, options?: RequestInit): Promise<T | null> {
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

export async function httpget<T>(url: string, options?: RequestInit): Promise<T | null> {
  return http<T>(
    url,
    {
      ...options,
      method: 'GET',
      credentials: 'include',
    },
  );
}

export async function httppost<T>(url: string, body: BodyInit, options?: RequestInit): Promise<T | null> {
  return http<T>(
    url,
    {
      ...options,
      method: 'POST',
      credentials: 'include',
      body,
    },
  );
}
