import { NextResponse } from 'next/server';
import { Product } from '@/models';
import { getServerSession } from '@/lib/auth';

function parseQuantity(raw: unknown): number {
  const n =
    typeof raw === 'string' && raw !== ''
      ? parseInt(raw, 10)
      : Number(raw);
  return n;
}

function parseLowStock(raw: unknown): number | null {
  if (raw === '' || raw === undefined || raw === null) return null;
  return typeof raw === 'string' ? parseInt(raw, 10) : Number(raw);
}

function tryMoney(raw: unknown): { ok: false } | { ok: true; value: number | null } {
  if (raw === '' || raw === undefined || raw === null) return { ok: true, value: null };
  const n = typeof raw === 'string' ? parseFloat(raw) : Number(raw);
  if (Number.isNaN(n) || n < 0) return { ok: false };
  return { ok: true, value: n };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(req);
    if (!session?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const product = await Product.findOne({
      where: { id, organizationId: session.organizationId },
    });
    if (!product) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await req.json();

    if (!body.name || !body.sku) {
      return NextResponse.json(
        { error: 'Name and SKU are required' },
        { status: 400 }
      );
    }

    const quantityOnHand = parseQuantity(body.quantityOnHand);
    if (Number.isNaN(quantityOnHand) || quantityOnHand < 0) {
      return NextResponse.json(
        { error: 'Invalid quantity on hand' },
        { status: 400 }
      );
    }

    const lowStockThreshold = parseLowStock(body.lowStockThreshold);
    if (
      lowStockThreshold !== null &&
      (Number.isNaN(lowStockThreshold) || lowStockThreshold < 0)
    ) {
      return NextResponse.json(
        { error: 'Invalid low stock threshold' },
        { status: 400 }
      );
    }

    const c = tryMoney(body.costPrice);
    const s = tryMoney(body.sellingPrice);
    if (!c.ok || !s.ok) {
      return NextResponse.json(
        { error: 'Invalid price value' },
        { status: 400 }
      );
    }
    const costPrice = c.value;
    const sellingPrice = s.value;

    const description =
      body.description === undefined ||
      body.description === null ||
      body.description === ''
        ? null
        : String(body.description);

    await product.update({
      name: body.name,
      sku: body.sku,
      description,
      quantityOnHand,
      lowStockThreshold,
      costPrice,
      sellingPrice,
    });

    return NextResponse.json(product);
  } catch (error: unknown) {
    const err = error as { name?: string };
    if (err.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json(
        { error: 'SKU must be unique within your organization.' },
        { status: 400 }
      );
    }
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
