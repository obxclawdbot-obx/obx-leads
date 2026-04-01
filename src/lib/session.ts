import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret");

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  plan: string;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session-token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, SECRET);
    const user = payload as unknown as SessionUser;
    // Default plan if not in token
    if (!user.plan) user.plan = "starter";
    return user;
  } catch {
    return null;
  }
}
