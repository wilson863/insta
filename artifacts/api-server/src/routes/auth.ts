import { Router, type IRouter } from "express";
import { db, usersTable, sessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { requireAuth, getSessionUser } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const { username, email, password, fullName } = req.body;

  if (!username || !email || !password || !fullName) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const [existingEmail] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existingEmail) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const [existingUsername] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (existingUsername) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  const passwordHash = await bcryptjs.hash(password, 12);
  const [user] = await db
    .insert(usersTable)
    .values({ username, email, passwordHash, fullName })
    .returning();

  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.insert(sessionsTable).values({ id: sessionId, userId: String(user.id), expiresAt });

  res.cookie("session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  });

  const { passwordHash: _ph, ...safeUser } = user;
  res.status(201).json({ user: safeUser, message: "Registered successfully" });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcryptjs.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.insert(sessionsTable).values({ id: sessionId, userId: String(user.id), expiresAt });

  res.cookie("session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  });

  const { passwordHash: _ph, ...safeUser } = user;
  res.json({ user: safeUser, message: "Logged in successfully" });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  const sessionId = req.cookies?.["session_id"];
  if (sessionId) {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
  }
  res.clearCookie("session_id");
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const user = getSessionUser(req)!;
  const { passwordHash: _ph, ...safeUser } = user;
  res.json(safeUser);
});

export default router;
