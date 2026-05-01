import { Organization, Product } from '@/models';
import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { isLowStock, orgProductsFromInstance } from '@/lib/inventory';
import { LowStockTable } from '@/components/products/LowStockTable';

export default async function DashboardPage() {
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

  const rawProducts = orgProductsFromInstance(org);
  const globalThreshold = Number(org?.defaultLowStock ?? 5);

  const goods = rawProducts.map((p: any) =>
    typeof p?.get === 'function' ? p.get({ plain: true }) : p
  );

  const totalProducts = goods.length;
  const totalStock = goods.reduce((sum: number, p: any) => {
    const q = Number(p.quantityOnHand);
    return sum + (Number.isFinite(q) ? q : 0);
  }, 0);
  const lowStock = goods.filter((p: any) => isLowStock(p, globalThreshold));

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Overview</h1>
      
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-gray-500">Total Products</p>
          <p className="text-4xl font-bold">{totalProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-gray-500">Total Stock Levels</p>
          <p className="text-4xl font-bold text-blue-600">{totalStock}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-red-100 p-6">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Low Stock Alerts</h2>
        <p className="text-sm text-gray-500 mb-4">
          Global threshold: {globalThreshold}. Per-product limits override this when set.
        </p>
        {lowStock.length === 0 ? (
          <p>Inventory healthy.</p>
        ) : (
          <LowStockTable items={lowStock} globalThreshold={globalThreshold} />
        )}
      </div>
    </div>
  );
}