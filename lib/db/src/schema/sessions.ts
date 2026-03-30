import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export type Session = typeof sessionsTable.$inferSelect;
