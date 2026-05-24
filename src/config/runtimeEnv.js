/**
 * Lee variables VITE_* desde window.__ENV__ (Docker) o import.meta.env (Vite).
 * @param {string} key
 * @returns {string}
 */
export function getRuntimeEnv(key) {
  if (typeof window !== "undefined" && window.__ENV__) {
    const runtime = window.__ENV__[key];
    if (typeof runtime === "string" && runtime.trim() !== "") {
      return runtime.trim();
    }
  }

  const build = import.meta.env[key];
  return typeof build === "string" ? build.trim() : "";
}
