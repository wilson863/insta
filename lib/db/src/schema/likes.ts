import { pgTable, timestamp, integer, primaryKey } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { postsTable } from "./posts";

export const likesTable = pgTable("likes", {
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  postId: integer("post_id").notNull().references(() => postsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.userId, t.postId] }),
]);

export type Like = typeof likesTable.$inferSelect;
