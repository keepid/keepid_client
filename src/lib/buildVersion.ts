const CHECK_INTERVAL_MS = 5 * 60 * 1000;

export const currentBuildSha = import.meta.env.VITE_BUILD_SHA || 'development';

export const buildVersionLabel = (sha: string) => (
  sha === 'development' ? 'development' : sha.slice(0, 8)
);

export const isDifferentBuild = (runningSha: string, deployedSha: string) => (
  runningSha !== 'development'
  && deployedSha.length > 0
  && runningSha !== deployedSha
);

const loadDeployedBuildSha = async (): Promise<string | null> => {
  const response = await fetch(`/version.json?checked=${Date.now()}`, {
    cache: 'no-store',
    credentials: 'same-origin',
  });
  if (!response.ok) return null;
  const version = await response.json() as { sha?: unknown };
  return typeof version.sha === 'string' ? version.sha : null;
};

/**
 * Reload an open tab when Cloud Run is serving a different Git commit.
 * The service worker does not cache the app shell, so a reload immediately
 * requests the current index and hashed assets.
 */
export const registerBuildVersionMonitor = () => {
  if (currentBuildSha === 'development') return () => undefined;

  let checking = false;
  let stopped = false;

  const check = async () => {
    if (checking || stopped) return;
    checking = true;
    try {
      const deployedSha = await loadDeployedBuildSha();
      if (deployedSha && isDifferentBuild(currentBuildSha, deployedSha)) {
        window.location.reload();
      }
    } catch (error) {
      console.warn('[Version] Could not check the deployed build.', error);
    } finally {
      checking = false;
    }
  };

  const checkWhenVisible = () => {
    if (document.visibilityState === 'visible') void check();
  };

  window.addEventListener('focus', check);
  document.addEventListener('visibilitychange', checkWhenVisible);
  const interval = window.setInterval(check, CHECK_INTERVAL_MS);
  void check();

  return () => {
    stopped = true;
    window.clearInterval(interval);
    window.removeEventListener('focus', check);
    document.removeEventListener('visibilitychange', checkWhenVisible);
  };
};
