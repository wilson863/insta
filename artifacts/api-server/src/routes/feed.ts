import { Router, type IRouter } from "express";
import { db, postsTable, usersTable, followsTable, likesTable, commentsTable } from "@workspace/db";
import { eq, and, sql, inArray } from "drizzle-orm";
import { requireAuth, getSessionUser } from "../middlewares/auth";

const router: IRouter = Router();

async function formatPost(post: { id: number; imageUrl: string; caption: string | null; createdAt: Date; authorId: number; authorUsername: string; authorFullName: string; authorAvatarUrl: string | null }, sessionUser?: { id: number }) {
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
}

router.get("/feed", requireAuth, async (req, res): Promise<void> => {
  const sessionUser = getSessionUser(req)!;

  const following = await db
    .select({ followingId: followsTable.followingId })
    .from(followsTable)
    .where(eq(followsTable.followerId, sessionUser.id));

  const followingIds = following.map((f) => f.followingId);
  followingIds.push(sessionUser.id);

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
    .where(inArray(postsTable.userId, followingIds))
    .orderBy(sql`${postsTable.createdAt} desc`)
    .limit(50);

  const result = await Promise.all(posts.map((p) => formatPost(p, sessionUser)));
  res.json(result);
});

router.get("/feed/suggested", requireAuth, async (req, res): Promise<void> => {
  const sessionUser = getSessionUser(req)!;

  const following = await db
    .select({ followingId: followsTable.followingId })
    .from(followsTable)
    .where(eq(followsTable.followerId, sessionUser.id));

  const followingIds = following.map((f) => f.followingId);
  followingIds.push(sessionUser.id);

  const allUsers = await db.select().from(usersTable);
  const suggested = allUsers
    .filter((u) => !followingIds.includes(u.id))
    .slice(0, 5)
    .map(({ passwordHash: _ph, ...u }) => u);

  res.json(suggested);
});

router.get("/feed/stats", requireAuth, async (req, res): Promise<void> => {
  const sessionUser = getSessionUser(req)!;

  const [{ totalPosts }] = await db
    .select({ totalPosts: sql<number>`count(*)::int` })
    .from(postsTable)
    .where(eq(postsTable.userId, sessionUser.id));

  const [{ totalFollowers }] = await db
    .select({ totalFollowers: sql<number>`count(*)::int` })
    .from(followsTable)
    .where(eq(followsTable.followingId, sessionUser.id));

  const [{ totalFollowing }] = await db
    .select({ totalFollowing: sql<number>`count(*)::int` })
    .from(followsTable)
    .where(eq(followsTable.followerId, sessionUser.id));

  const myPosts = await db
    .select({ id: postsTable.id })
    .from(postsTable)
    .where(eq(postsTable.userId, sessionUser.id));

  let totalLikes = 0;
  if (myPosts.length > 0) {
    const postIds = myPosts.map((p) => p.id);
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(likesTable)
      .where(inArray(likesTable.postId, postIds));
    totalLikes = count;
  }

  res.json({ totalPosts, totalFollowers, totalFollowing, totalLikes });
});

export default router;
