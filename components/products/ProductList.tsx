"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { effectiveLowStockThreshold, hasProductLowStockOverride, isLowStock } from '@/lib/inventory';

interface ProductData {
  id: string;
  name: string;
  sku: string;
  quantityOnHand: number;
  lowStockThreshold?: number | null;
}

interface ProductListProps {
  products: ProductData[];
  globalLowStockDefault: number;
}

export function ProductList({ products, globalLowStockDefault }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) || 
      product.sku.toLowerCase().includes(term)
    );
  });

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
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  {searchTerm ? 'No products match your search.' : 'No products found. Add one to get started.'}
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
                    alert ? 'bg-red-50 hover:bg-red-50/80' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="p-4 font-medium text-gray-900">{product.name}</td>
                  <td className="p-4 text-gray-500">{product.sku}</td>
                  <td className="p-4 font-semibold text-gray-700">{product.quantityOnHand}</td>
                  <td className="p-4 text-gray-600">
                    {effective}
                    {usesOwn ? (
                      <span className="ml-2 text-xs text-blue-600">(this product)</span>
                    ) : (
                      <span className="ml-2 text-xs text-gray-400">(global {globalLowStockDefault})</span>
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
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}