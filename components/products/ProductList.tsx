"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  effectiveLowStockThreshold,
  hasProductLowStockOverride,
  isLowStock,
} from "@/lib/inventory";

export interface ProductData {
  id: string;
  organizationId: string;
  name: string;
  sku: string;
  description?: string | null;
  quantityOnHand: number;
  costPrice?: string | number | null;
  sellingPrice?: string | number | null;
  lowStockThreshold?: number | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface ProductListProps {
  products: ProductData[];
  globalLowStockDefault: number;
}

function formatMoney(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "—";
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  if (Number.isNaN(n)) return "—";
  return n.toFixed(2);
}

function formatDate(v: string | Date | undefined): string {
  if (v === undefined || v === null) return "—";
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="product-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 id="product-modal-title" className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-800 text-sm font-medium"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function ProductDetailRows({
  product,
  globalLowStockDefault,
}: {
  product: ProductData;
  globalLowStockDefault: number;
}) {
  const effective = effectiveLowStockThreshold(product, globalLowStockDefault);
  const usesOwn = hasProductLowStockOverride(product);
  return (
    <dl className="space-y-3 text-sm">
      <Row label="ID" value={product.id} />
      <Row label="Organization ID" value={product.organizationId} />
      <Row label="Name" value={product.name} />
      <Row label="SKU" value={product.sku} />
      <Row
        label="Description"
        value={
          product.description && String(product.description).trim() !== ""
            ? product.description
            : "—"
        }
      />
      <Row label="Quantity on Hand" value={String(product.quantityOnHand)} />
      <Row label="Cost Price" value={formatMoney(product.costPrice)} />
      <Row label="Selling Price" value={formatMoney(product.sellingPrice)} />
      <Row
        label="Low Stock Threshold"
        value={
          usesOwn
            ? `${effective} (this product)`
            : `${effective} (global default ${globalLowStockDefault})`
        }
      />
      <Row label="Created At" value={formatDate(product.createdAt)} />
      <Row label="Updated At" value={formatDate(product.updatedAt)} />
    </dl>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-2">
      <dt className="text-gray-500 shrink-0">{label}</dt>
      <dd className="text-gray-900 break-all">{value}</dd>
    </div>
  );
}

function ProductEditForm({
  product,
  globalLowStockDefault,
  onClose,
}: {
  product: ProductData;
  globalLowStockDefault: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(product.name);
  const [sku, setSku] = useState(product.sku);
  const [description, setDescription] = useState(
    product.description ?? ""
  );
  const [quantityOnHand, setQuantityOnHand] = useState(
    String(product.quantityOnHand)
  );
  const [costPrice, setCostPrice] = useState(
    product.costPrice != null && product.costPrice !== ""
      ? String(product.costPrice)
      : ""
  );
  const [sellingPrice, setSellingPrice] = useState(
    product.sellingPrice != null && product.sellingPrice !== ""
      ? String(product.sellingPrice)
      : ""
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    product.lowStockThreshold !== null && product.lowStockThreshold !== undefined
      ? String(product.lowStockThreshold)
      : ""
  );

  useEffect(() => {
    setName(product.name);
    setSku(product.sku);
    setDescription(product.description ?? "");
    setQuantityOnHand(String(product.quantityOnHand));
    setCostPrice(
      product.costPrice != null && product.costPrice !== ""
        ? String(product.costPrice)
        : ""
    );
    setSellingPrice(
      product.sellingPrice != null && product.sellingPrice !== ""
        ? String(product.sellingPrice)
        : ""
    );
    setLowStockThreshold(
      product.lowStockThreshold !== null &&
        product.lowStockThreshold !== undefined
        ? String(product.lowStockThreshold)
        : ""
    );
    setError("");
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        sku,
        description,
        quantityOnHand,
        costPrice,
        sellingPrice,
        lowStockThreshold,
      }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
      onClose();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to update product");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="grid gap-2 text-sm">
        <Row label="ID" value={product.id} />
        <Row label="Organization ID" value={product.organizationId} />
      </div>
      <Input
        id="edit-name"
        label="Name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        id="edit-sku"
        label="SKU *"
        value={sku}
        onChange={(e) => setSku(e.target.value)}
        required
      />
      <div className="flex flex-col space-y-1">
        <label htmlFor="edit-desc" className="text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="edit-desc"
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[72px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
        />
      </div>
      <Input
        id="edit-qty"
        label="Quantity on Hand"
        type="number"
        min={0}
        value={quantityOnHand}
        onChange={(e) => setQuantityOnHand(e.target.value)}
        required
      />
      <Input
        id="edit-cost"
        label="Cost Price (optional)"
        type="number"
        min={0}
        step="0.01"
        value={costPrice}
        onChange={(e) => setCostPrice(e.target.value)}
        placeholder="0.00"
      />
      <Input
        id="edit-sell"
        label="Selling Price (optional)"
        type="number"
        min={0}
        step="0.01"
        value={sellingPrice}
        onChange={(e) => setSellingPrice(e.target.value)}
        placeholder="0.00"
      />
      <Input
        id="edit-low"
        label={`Low Stock Threshold (optional, default ${globalLowStockDefault})`}
        type="number"
        min={0}
        value={lowStockThreshold}
        onChange={(e) => setLowStockThreshold(e.target.value)}
        placeholder="Leave empty for global default"
      />
      <div className="grid gap-2 text-sm text-gray-500 pt-2 border-t border-gray-100">
        <Row label="Created At" value={formatDate(product.createdAt)} />
        <Row label="Updated At" value={formatDate(product.updatedAt)} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

export function ProductList({ products, globalLowStockDefault }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState<"view" | "edit" | null>(null);
  const [active, setActive] = useState<ProductData | null>(null);

  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) || 
      product.sku.toLowerCase().includes(term)
    );
  });

  const closeModal = () => {
    setModal(null);
    setActive(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center">
        <div className="w-full max-w-md">
          <Input
            placeholder="Search by Name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="ml-4 text-sm text-gray-500">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-600 text-sm">Product Name</th>
              <th className="p-4 font-medium text-gray-600 text-sm">SKU</th>
              <th className="p-4 font-medium text-gray-600 text-sm">Stock Qty</th>
              <th className="p-4 font-medium text-gray-600 text-sm">Low stock at</th>
              <th className="p-4 font-medium text-gray-600 text-sm">Status</th>
              <th className="p-4 font-medium text-gray-600 text-sm w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  {searchTerm
                    ? "No products match your search."
                    : "No products found. Add one to get started."}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const alert = isLowStock(product, globalLowStockDefault);
                const effective = effectiveLowStockThreshold(
                  product,
                  globalLowStockDefault
                );
                const usesOwn = hasProductLowStockOverride(product);
                return (
                  <tr
                    key={product.id}
                    className={`border-b last:border-0 transition-colors ${
                      alert ? "bg-red-50 hover:bg-red-50/80" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="p-4 font-medium text-gray-900">{product.name}</td>
                    <td className="p-4 text-gray-500">{product.sku}</td>
                    <td className="p-4 font-semibold text-gray-700">
                      {product.quantityOnHand}
                    </td>
                    <td className="p-4 text-gray-600">
                      {effective}
                      {usesOwn ? (
                        <span className="ml-2 text-xs text-blue-600">(this product)</span>
                      ) : (
                        <span className="ml-2 text-xs text-gray-400">
                          (global {globalLowStockDefault})
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {alert ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          Low stock
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">OK</span>
                      )}
                    </td>
                    <td className="p-4 space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        className="text-blue-600 hover:underline font-medium text-xs"
                        onClick={() => {
                          setActive(product);
                          setModal("view");
                        }}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="text-blue-600 hover:underline font-medium text-xs"
                        onClick={() => {
                          setActive(product);
                          setModal("edit");
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {modal === "view" && active && (
        <Modal title="Product details" onClose={closeModal}>
          <ProductDetailRows
            product={active}
            globalLowStockDefault={globalLowStockDefault}
          />
        </Modal>
      )}

      {modal === "edit" && active && (
        <Modal title="Edit product" onClose={closeModal}>
          <ProductEditForm
            product={active}
            globalLowStockDefault={globalLowStockDefault}
            onClose={closeModal}
          />
        </Modal>
      )}
    </div>
  );
}