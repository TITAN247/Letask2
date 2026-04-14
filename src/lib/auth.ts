import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'a_very_secure_secret_key_for_letask';

// Define custom JWT payload type
export interface CustomJwtPayload extends JwtPayload {
  id: string;
  role: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export function signToken(payload: Omit<CustomJwtPayload, 'iat' | 'exp'>) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): CustomJwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getUserFromSession(): Promise<CustomJwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (token) {
    return verifyToken(token);
  }

  // Fallback to NextAuth Google OAuth session
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/authOptions");
  const session = await getServerSession(authOptions);
  
  if (session?.user) {
    return { 
      id: (session.user as any).id, 
      role: (session.user as any).role, 
      email: session.user.email || undefined
    };
  }

  return null;
}
