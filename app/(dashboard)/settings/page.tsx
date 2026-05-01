import { Organization } from '@/models';
import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { InventorySettingsForm } from '@/components/settings/InventorySettingsForm';

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  const org = await Organization.findByPk(session.organizationId) as any;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Organization Details</h2>
        <div className="mb-4">
          <label className="block text-sm text-gray-500 mb-1">Organization Name</label>
          <input 
            type="text" disabled className="w-full p-2 border rounded bg-gray-50" 
            value={org?.name || ''} 
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Inventory Rules</h2>
        <InventorySettingsForm
          initialDefaultLowStock={org?.defaultLowStock ?? 5}
        />
      </div>
    </div>
  );
}