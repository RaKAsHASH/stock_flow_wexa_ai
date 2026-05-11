"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch('/api/products', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/products');
      router.refresh();
    } else {
      const result = await res.json();
      setError(result.error || 'Failed to create product');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      <div className="grid grid-cols-2 gap-4">
        <Input id="product-name" label="Product Name *" name="name" required />
        <Input id="product-sku" label="SKU *" name="sku" required />
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor="product-desc" className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="product-desc"
          name="description"
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[72px]"
          placeholder="Optional"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="product-qty"
          label="Quantity on Hand"
          name="quantityOnHand"
          type="number"
          min={0}
          defaultValue="0"
        />
        <Input
          id="product-low"
          label="Low Stock Threshold (optional)"
          name="lowStockThreshold"
          type="number"
          min={0}
          placeholder="Uses global default if empty"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input id="product-cost" label="Cost Price (optional)" name="costPrice" type="number" min={0} step="0.01" />
        <Input id="product-sell" label="Selling Price (optional)" name="sellingPrice" type="number" min={0} step="0.01" />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Product'}
        </Button>
      </div>
    </form>
  );
}