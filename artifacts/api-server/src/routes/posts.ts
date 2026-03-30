import { Router, type IRouter } from "express";
import { db, postsTable, usersTable, likesTable, commentsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
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

router.get("/posts", async (req, res): Promise<void> => {
  const sessionUser = getSessionUser(req);

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
    .orderBy(sql`${postsTable.createdAt} desc`);

  const result = await Promise.all(posts.map((p) => formatPost(p, sessionUser)));
  res.json(result);
});

router.post("/posts", requireAuth, async (req, res): Promise<void> => {
  const sessionUser = getSessionUser(req)!;
  const { imageUrl, caption } = req.body;

  if (!imageUrl) {
    res.status(400).json({ error: "imageUrl is required" });
    return;
  }

  const [post] = await db
    .insert(postsTable)
    .values({ userId: sessionUser.id, imageUrl, caption })
    .returning();

  const result = await formatPost({
    ...post,
    authorId: sessionUser.id,
    authorUsername: sessionUser.username,
    authorFullName: sessionUser.fullName,
    authorAvatarUrl: sessionUser.avatarUrl,
  }, sessionUser);

  res.status(201).json(result);
});

router.get("/posts/:id", async (req, res): Promise<void> => {
  const sessionUser = getSessionUser(req);
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [post] = await db
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
    .where(eq(postsTable.id, id));

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json(await formatPost(post, sessionUser));
});

router.delete("/posts/:id", requireAuth, async (req, res): Promise<void> => {
  const sessionUser = getSessionUser(req)!;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, id));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  if (post.userId !== sessionUser.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(postsTable).where(eq(postsTable.id, id));
  res.sendStatus(204);
});

router.post("/posts/:id/like", requireAuth, async (req, res): Promise<void> => {
  const sessionUser = getSessionUser(req)!;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  await db
    .insert(likesTable)
    .values({ userId: sessionUser.id, postId: id })
    .onConflictDoNothing();

  res.json({ message: "Liked" });
});

router.post("/posts/:id/unlike", requireAuth, async (req, res): Promise<void> => {
  const sessionUser = getSessionUser(req)!;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  await db
    .delete(likesTable)
    .where(and(eq(likesTable.userId, sessionUser.id), eq(likesTable.postId, id)));

  res.json({ message: "Unliked" });
});

router.get("/posts/:id/comments", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const comments = await db
    .select({
      id: commentsTable.id,
      content: commentsTable.content,
      createdAt: commentsTable.createdAt,
      authorId: usersTable.id,
      authorUsername: usersTable.username,
      authorFullName: usersTable.fullName,
      authorAvatarUrl: usersTable.avatarUrl,
    })
    .from(commentsTable)
    .innerJoin(usersTable, eq(commentsTable.userId, usersTable.id))
    .where(eq(commentsTable.postId, id))
    .orderBy(commentsTable.createdAt);

  res.json(
    comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      author: {
        id: c.authorId,
        username: c.authorUsername,
        fullName: c.authorFullName,
        avatarUrl: c.authorAvatarUrl,
      },
    }))
  );
});

router.post("/posts/:id/comments", requireAuth, async (req, res): Promise<void> => {
  const sessionUser = getSessionUser(req)!;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const { content } = req.body;
  if (!content) {
    res.status(400).json({ error: "content is required" });
    return;
  }

  const [comment] = await db
    .insert(commentsTable)
    .values({ postId: id, userId: sessionUser.id, content })
    .returning();

  res.status(201).json({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    author: {
      id: sessionUser.id,
      username: sessionUser.username,
      fullName: sessionUser.fullName,
      avatarUrl: sessionUser.avatarUrl,
    },
  });
});

export default router;
