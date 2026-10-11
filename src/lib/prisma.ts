import { PrismaClient } from "@prisma/client";

function getCleanDatabaseUrl(): string | undefined {
  let url = process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();

  // If DATABASE_URL is pointing to port 6543 (transaction pooler), prefer the stable port 5432
  if (process.env.DATABASE_URL) {
    const raw = process.env.DATABASE_URL.trim();
    if (raw.includes(":6543")) {
      url =
        process.env.DIRECT_URL?.trim() ||
        raw
          .replace(":6543", ":5432")
          .replace("?pgbouncer=true", "")
          .replace("&pgbouncer=true", "");
    } else {
      url = raw;
    }
  }

  if (!url) return undefined;

  // Strip leading and trailing quotes if pasted with quotes in Vercel
  url = url.replace(/^["']/, "").replace(/["']$/, "").trim();

  // Strip pgbouncer query parameter which causes 'arguments not supported' errors
  url = url.replace("?pgbouncer=true", "").replace("&pgbouncer=true", "");

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
