import { Request, Response, NextFunction } from "express";
import { db, sessionsTable, usersTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sessionId = req.cookies?.["session_id"];
  if (!sessionId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(and(eq(sessionsTable.id, sessionId), gt(sessionsTable.expiresAt, new Date())));

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, parseInt(session.userId, 10)));

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  (req as any).user = user;
  next();
}

export function getSessionUser(req: Request) {
  return (req as any).user as typeof usersTable.$inferSelect | undefined;
}
