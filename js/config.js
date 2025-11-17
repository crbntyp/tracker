// App configuration
// Auto-detect if we're in /tracker/ subfolder or at root
const BASE_PATH = window.location.pathname.includes('/tracker/') ? '/tracker' : '';

// Helper to build paths
function buildPath(path) {
  return BASE_PATH + path;
}
