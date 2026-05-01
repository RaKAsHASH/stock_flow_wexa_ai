import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET;
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, { algorithms: ['HS256'] });
  return payload;
}

function sessionTokenFromCookieHeader(header: string | null): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (name === 'session') {
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return null;
}

/** Pass `req` in Route Handlers so the session is read when `cookies()` is empty (e.g. some Turbopack runs). */
export async function getServerSession(req?: Request) {
  const cookieStore = await cookies();
  let token = cookieStore.get('session')?.value ?? null;
  if (!token && req) {
    token = sessionTokenFromCookieHeader(req.headers.get('cookie'));
  }
  if (!token) return null;
  try {
    return await decrypt(token);
  } catch {
    return null;
  }
}