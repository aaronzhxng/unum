// app/utils/billCongressCache.ts
const cache = new Map<string, number>();

export const billCongressCache = {
  set: (billId: string, congress: number) => cache.set(billId, congress),
  get: (billId: string) => cache.get(billId) ?? 119,
};
