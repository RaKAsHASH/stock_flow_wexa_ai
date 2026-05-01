import { Organization, Product } from '@/models';
import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ProductList } from '@/components/products/ProductList';

export default async function ProductsPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  const org = await Organization.findByPk(session.organizationId, {
    include: [
      {
        model: Product,
        required: false,
        separate: true,
        order: [['createdAt', 'DESC']],
      },
    ],
  }) as any;

  const rawProducts = org?.Products || [];

  const plainProducts = rawProducts.map((p: any) => p.get({ plain: true }));

  const globalDefault = Number(org?.defaultLowStock ?? 5);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link
          href="/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block text-center"
        >
          + Add Product
        </Link>
      </div>

      {/* 3. Replace the entire hardcoded table with your interactive component */}
      <ProductList products={plainProducts} globalLowStockDefault={globalDefault} />
    </div>
  );
}