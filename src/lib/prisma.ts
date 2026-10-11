import { PrismaClient } from "@prisma/client";

function getCleanDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;

  let url = raw.trim();

  // Strip leading and trailing quotes if pasted with quotes in Vercel
  url = url.replace(/^["']/, "").replace(/["']$/, "").trim();

  // Fix unencoded '@' in password if present
  // e.g., postgresql://user:pass@word@host:5432/db -> postgresql://user:pass%40word@host:5432/db
  try {
    const protocolMatch = url.match(/^(postgres(?:ql)?:\/\/)(.*)$/);
    if (protocolMatch) {
      const rest = protocolMatch[2];
      const lastAtIndex = rest.lastIndexOf("@");
      if (lastAtIndex !== -1) {
        const userInfo = rest.substring(0, lastAtIndex);
        const hostAndRest = rest.substring(lastAtIndex + 1);
        const colonIndex = userInfo.indexOf(":");
        if (colonIndex !== -1) {
          const user = userInfo.substring(0, colonIndex);
          const pass = userInfo.substring(colonIndex + 1);
          const encodedPass = pass.replace(/@/g, "%40");
          url = `${protocolMatch[1]}${user}:${encodedPass}@${hostAndRest}`;
        }
      }
    }
  } catch {}

  return url;
}

const cleanUrl = getCleanDatabaseUrl();
if (cleanUrl) {
  process.env.DATABASE_URL = cleanUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(cleanUrl ? { datasourceUrl: cleanUrl } : {}),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
