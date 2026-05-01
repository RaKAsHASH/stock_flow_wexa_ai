import React from 'react';
import { effectiveLowStockThreshold, hasProductLowStockOverride } from '@/lib/inventory';

interface ProductData {
  id: string;
  name: string;
  sku: string;
  quantityOnHand: number;
  lowStockThreshold: number | null;
}

interface LowStockTableProps {
  items: ProductData[];
  globalThreshold: number;
}

export function LowStockTable({ items, globalThreshold }: LowStockTableProps) {
  if (!items || items.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 text-sm">
        All inventory levels are currently healthy.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto p-6">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-sm text-gray-600">
            <th className="pb-3 font-medium">Name</th>
            <th className="pb-3 font-medium">SKU</th>
            <th className="pb-3 font-medium">Qty on Hand</th>
            <th className="pb-3 font-medium">Threshold Used</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {items.map((item) => {
            const threshold = effectiveLowStockThreshold(item, globalThreshold);
            return (
              <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="py-3 font-medium text-gray-900">{item.name}</td>
                <td className="py-3 text-gray-500">{item.sku}</td>
                <td className="py-3 text-red-600 font-bold">{item.quantityOnHand}</td>
                <td className="py-3 text-gray-400">
                  {threshold}
                  {hasProductLowStockOverride(item) ? (
                    <span className="ml-2 text-xs text-blue-600">(product)</span>
                  ) : (
                    <span className="ml-2 text-xs text-gray-400">(global)</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}