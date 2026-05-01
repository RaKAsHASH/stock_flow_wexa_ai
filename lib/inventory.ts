/** Products nested on an Organization instance (Sequelize uses `Products` by default). */
export function orgProductsFromInstance(org: unknown): unknown[] {
  if (!org || typeof org !== "object") return [];
  const o = org as Record<string, unknown>;
  const list = o.Products ?? o.products;
  return Array.isArray(list) ? list : [];
}

/**
 * Per-product low-stock limit overrides the org default when set (including `0`).
 * `null` / `undefined` / empty string → use org default.
 */
export function effectiveLowStockThreshold(
  product: { lowStockThreshold?: unknown },
  orgDefault: number
): number {
  const def = Number.isFinite(orgDefault) ? orgDefault : 5;
  const raw = product.lowStockThreshold;
  if (raw === null || raw === undefined || raw === "") return def;
  const n = typeof raw === "number" ? raw : parseInt(String(raw), 10);
  if (Number.isNaN(n) || n < 0) return def;
  return n;
}

/** True when the row has its own low-stock limit (including 0), not the org default. */
export function hasProductLowStockOverride(product: {
  lowStockThreshold?: unknown;
}): boolean {
  const raw = product.lowStockThreshold;
  return !(raw === null || raw === undefined || raw === "");
}
export function isLowStock(
  product: { quantityOnHand?: unknown; lowStockThreshold?: unknown },
  orgDefault: number
): boolean {
  const qtyRaw = product.quantityOnHand;
  const qty =
    typeof qtyRaw === "number" ? qtyRaw : parseInt(String(qtyRaw ?? ""), 10);
  if (Number.isNaN(qty)) return false;
  return qty <= effectiveLowStockThreshold(product, orgDefault);
}
