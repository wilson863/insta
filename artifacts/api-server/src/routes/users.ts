import { Router, type IRouter } from "express";
import { db, usersTable, postsTable, followsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, getSessionUser } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/users/:username", async (req, res): Promise<void> => {
  const { username } = req.params;
  const sessionUser = getSessionUser(req);

  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [{ postCount }] = await db
    .select({ postCount: sql<number>`count(*)::int` })
    .from(postsTable)
    .where(eq(postsTable.userId, user.id));

  const [{ followerCount }] = await db
    .select({ followerCount: sql<number>`count(*)::int` })
    .from(followsTable)
    .where(eq(followsTable.followingId, user.id));

  const [{ followingCount }] = await db
    .select({ followingCount: sql<number>`count(*)::int` })
    .from(followsTable)
    .where(eq(followsTable.followerId, user.id));

  let isFollowing = false;
  if (sessionUser) {
    const [follow] = await db
      .select()
      .from(followsTable)
      .where(and(eq(followsTable.followerId, sessionUser.id), eq(followsTable.followingId, user.id)));
    isFollowing = !!follow;
  }

  const { passwordHash: _ph, ...safeUser } = user;
  res.json({
    ...safeUser,
    postCount,
    followerCount,
    followingCount,
    isFollowing,
  });
});

router.post("/users/:username/follow", requireAuth, async (req, res): Promise<void> => {
  const { username } = req.params;
  const sessionUser = getSessionUser(req)!;

  const [target] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  if (target.id === sessionUser.id) {
    res.status(400).json({ error: "Cannot follow yourself" });
    return;
  }

  await db
    .insert(followsTable)
    .values({ followerId: sessionUser.id, followingId: target.id })
    .onConflictDoNothing();

  res.json({ message: "Followed successfully" });
});

router.post("/users/:username/unfollow", requireAuth, async (req, res): Promise<void> => {
  const { username } = req.params;
  const sessionUser = getSessionUser(req)!;

  const [target] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  await db
    .delete(followsTable)
    .where(and(eq(followsTable.followerId, sessionUser.id), eq(followsTable.followingId, target.id)));

  res.json({ message: "Unfollowed successfully" });
});

router.get("/users/:username/posts", async (req, res): Promise<void> => {
  const { username } = req.params;
  const sessionUser = getSessionUser(req);

  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const posts = await db
    .select({
      id: postsTable.id,
      imageUrl: postsTable.imageUrl,
      caption: postsTable.caption,
      createdAt: postsTable.createdAt,
      authorId: usersTable.id,
      authorUsername: usersTable.username,
      authorFullName: usersTable.fullName,
      authorAvatarUrl: usersTable.avatarUrl,
    })
    .from(postsTable)
    .innerJoin(usersTable, eq(postsTable.userId, usersTable.id))
    .where(eq(postsTable.userId, user.id))
    .orderBy(sql`${postsTable.createdAt} desc`);

  const { likesTable, commentsTable } = await import("@workspace/db");

  const result = await Promise.all(
    posts.map(async (post) => {
      const [{ likeCount }] = await db
        .select({ likeCount: sql<number>`count(*)::int` })
        .from(likesTable)
        .where(eq(likesTable.postId, post.id));

      const [{ commentCount }] = await db
        .select({ commentCount: sql<number>`count(*)::int` })
        .from(commentsTable)
        .where(eq(commentsTable.postId, post.id));

      let isLiked = false;
      if (sessionUser) {
        const [like] = await db
          .select()
          .from(likesTable)
          .where(and(eq(likesTable.userId, sessionUser.id), eq(likesTable.postId, post.id)));
        isLiked = !!like;
      }

      return {
        id: post.id,
        imageUrl: post.imageUrl,
        caption: post.caption,
        likeCount,
        commentCount,
        isLiked,
        createdAt: post.createdAt.toISOString(),
        author: {
          id: post.authorId,
          username: post.authorUsername,
          fullName: post.authorFullName,
          avatarUrl: post.authorAvatarUrl,
        },
      };
    })
  );

  res.json(result);
});

export default router;
