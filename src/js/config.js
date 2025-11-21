// App configuration
// Auto-detect if we're in a subfolder or at root
const BASE_PATH = (() => {
  const path = window.location.pathname;
  if (path.includes('/trckr/')) return '/trckr';
  if (path.includes('/tracker/')) return '/tracker';
  return '';
})();

// Helper to build paths
function buildPath(path) {
  return BASE_PATH + path;
}
