import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User, Organization, sequelize } from '@/models';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { action, email, password, orgName } = await req.json();

    if (action === 'signup') {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) return NextResponse.json({ error: 'Email exists' }, { status: 400 });

      const org = await Organization.create({ name: orgName });
      const hash = await bcrypt.hash(password, 10);
      const user = await User.create({ email, passwordHash: hash, organizationId: org.id });

      const session = await encrypt({ userId: user.id, organizationId: org.id });
      
      const cookieStore = await cookies();
      const sessionCookieOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 60 * 60 * 24,
      };
      cookieStore.set('session', session, sessionCookieOpts);
      
      return NextResponse.json({ success: true });
    }

    if (action === 'login') {
      const user = await User.findOne({ where: { email } });
      if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

      let organizationId = user.organizationId;
      if (!organizationId) {
        const local =
          typeof email === 'string' && email.includes('@')
            ? email.split('@')[0]
            : 'My';
        organizationId = await sequelize.transaction(async (t) => {
          const org = await Organization.create(
            { name: `${local}'s organization` },
            { transaction: t }
          );
          await user.update({ organizationId: org.id }, { transaction: t });
          return org.id;
        });
      }

      const session = await encrypt({ userId: user.id, organizationId });
      
      const cookieStore = await cookies();
      const sessionCookieOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 60 * 60 * 24,
      };
      cookieStore.set('session', session, sessionCookieOpts);
      
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}