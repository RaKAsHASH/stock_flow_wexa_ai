import { NextResponse } from 'next/server';
import { Organization } from '@/models';
import { getServerSession } from '@/lib/auth';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(req);
    if (!session?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const raw = body.defaultLowStock;
    const defaultLowStock =
      typeof raw === 'string' ? parseInt(raw, 10) : Number(raw);

    if (
      Number.isNaN(defaultLowStock) ||
      defaultLowStock < 0 ||
      !Number.isFinite(defaultLowStock)
    ) {
      return NextResponse.json(
        { error: 'Invalid global low stock threshold' },
        { status: 400 }
      );
    }

    const [updated] = await Organization.update(
      { defaultLowStock },
      { where: { id: session.organizationId } }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, defaultLowStock });
  } catch (e) {
    console.error('Settings update failed:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
