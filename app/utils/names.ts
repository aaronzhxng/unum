// Congress.gov writes a few members' nicknames into their names, like
// 'Fleischmann, Charles J. "Chuck"'. Most members' names have none, so the
// app leaves them out everywhere. Search still finds them by nickname
// (data/nicknames.json).
export const withoutNickname = (name: string): string =>
  name
    .replace(/\s*["“][^"”]+["”]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .trim();

// Fields that hold a member's name in the backend's responses. Only these,
// since bill titles can quote things too.
const NAME_FIELDS = new Set([
  "name",
  "fullName",
  "firstName",
  "directOrderName",
  "invertedOrderName",
]);

// A copy of an API response with nicknames taken out of every name in it
export function withoutNicknames<T>(value: T): T {
  if (Array.isArray(value)) return value.map(withoutNicknames) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value)) {
      out[key] =
        typeof v === "string" && NAME_FIELDS.has(key) && /["“]/.test(v)
          ? withoutNickname(v)
          : withoutNicknames(v);
    }
    return out as T;
  }
  return value;
}
