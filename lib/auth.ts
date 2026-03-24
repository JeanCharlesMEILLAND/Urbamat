import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { randomBytes, createHash } from "crypto";

const COOKIE_NAME = "admin_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24h

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export async function login(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || password !== expected) return false;

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await prisma.adminSession.create({ data: { token, expiresAt } });

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return true;
}

export async function logout() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (token) {
    await prisma.adminSession.deleteMany({ where: { token } }).catch(() => {});
    cookies().delete(COOKIE_NAME);
  }
}

export async function getSession(): Promise<boolean> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return false;

  const session = await prisma.adminSession.findUnique({ where: { token } }).catch(() => null);
  if (!session) return false;

  if (session.expiresAt < new Date()) {
    await prisma.adminSession.delete({ where: { token } }).catch(() => {});
    cookies().delete(COOKIE_NAME);
    return false;
  }

  return true;
}

// Cleanup expired sessions
export async function cleanupSessions() {
  await prisma.adminSession.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  }).catch(() => {});
}
