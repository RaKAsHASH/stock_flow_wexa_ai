import { NextResponse } from 'next/server';
import { Product } from '@/models';
import { getServerSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(req);
    if (!session?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (!body.name || !body.sku) {
      return NextResponse.json({ error: 'Name and SKU are required' }, { status: 400 });
    }

    const qtyRaw = body.quantityOnHand;
    const quantityOnHand =
      typeof qtyRaw === 'string' && qtyRaw !== ''
        ? parseInt(qtyRaw, 10)
        : Number(qtyRaw);
    const lowRaw = body.lowStockThreshold;
    const lowStockThreshold =
      lowRaw === '' || lowRaw === undefined || lowRaw === null
        ? null
        : typeof lowRaw === 'string'
          ? parseInt(lowRaw, 10)
          : Number(lowRaw);

    if (Number.isNaN(quantityOnHand) || quantityOnHand < 0) {
      return NextResponse.json(
        { error: 'Invalid quantity on hand' },
        { status: 400 }
      );
    }
    if (
      lowStockThreshold !== null &&
      (Number.isNaN(lowStockThreshold) || lowStockThreshold < 0)
    ) {
      return NextResponse.json(
        { error: 'Invalid low stock threshold' },
        { status: 400 }
      );
    }

    const description =
      body.description === undefined ||
      body.description === null ||
      body.description === ''
        ? null
        : String(body.description);

    const tryMoney = (raw: unknown): { ok: false } | { ok: true; value: number | null } => {
      if (raw === '' || raw === undefined || raw === null) return { ok: true, value: null };
      const n = typeof raw === 'string' ? parseFloat(raw) : Number(raw);
      if (Number.isNaN(n) || n < 0) return { ok: false };
      return { ok: true, value: n };
    };
    const c = tryMoney(body.costPrice);
    const s = tryMoney(body.sellingPrice);
    if (!c.ok || !s.ok) {
      return NextResponse.json({ error: 'Invalid price value' }, { status: 400 });
    }

    const product = await Product.create({
      organizationId: session.organizationId,
      name: body.name,
      sku: body.sku,
      description,
      quantityOnHand,
      lowStockThreshold,
      costPrice: c.value,
      sellingPrice: s.value,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json({ error: 'SKU must be unique within your organization.' }, { status: 400 });
    }
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}