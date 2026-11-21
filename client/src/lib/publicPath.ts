export function publicPath(path = "") {
  const base = import.meta.env.BASE_URL;
  const suffix = path.replace(/^\/+/, "");
  return `${base}${suffix}`;
}
