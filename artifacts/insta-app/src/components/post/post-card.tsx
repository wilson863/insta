import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Heart, MessageCircle, MoreHorizontal, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLikePost, useUnlikePost, getGetPostQueryKey, getGetFeedQueryKey, getListPostsQueryKey, getGetUserPostsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import type { Post } from "@workspace/api-client-react/src/generated/api.schemas";
import { cn } from "@/lib/utils";

export function PostCard({ post, isDetail = false }: { post: Post; isDetail?: boolean }) {
  const queryClient = useQueryClient();
  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  const handleLikeToggle = () => {
    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    // Optimistic update
    setIsLiked(!previousIsLiked);
    setLikeCount(previousIsLiked ? previousLikeCount - 1 : previousLikeCount + 1);

    if (!previousIsLiked) {
      likeMutation.mutate(
        { id: post.id },
        {
          onError: () => {
            setIsLiked(previousIsLiked);
            setLikeCount(previousLikeCount);
          },
          onSuccess: () => {
            invalidateRelatedQueries();
          }
        }
      );
    } else {
      unlikeMutation.mutate(
        { id: post.id },
        {
          onError: () => {
            setIsLiked(previousIsLiked);
            setLikeCount(previousLikeCount);
          },
          onSuccess: () => {
            invalidateRelatedQueries();
          }
        }
      );
    }
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      handleLikeToggle();
    }
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 1000);
  };

  const invalidateRelatedQueries = () => {
    queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(post.id) });
    queryClient.invalidateQueries({ queryKey: getGetFeedQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetUserPostsQueryKey(post.author.username) });
  };

  return (
    <div className={cn("bg-card border border-border sm:rounded-xl overflow-hidden w-full flex flex-col", isDetail ? "border-0 sm:border" : "mb-6")}>
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <Link href={`/profile/${post.author.username}`}>
          <div className="flex items-center gap-3 cursor-pointer group">
            <Avatar className="w-8 h-8 border border-border">
              <AvatarImage src={post.author.avatarUrl || undefined} />
              <AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-bold text-sm group-hover:text-muted-foreground transition-colors">{post.author.username}</span>
          </div>
        </Link>
        <button className="p-2 hover:text-muted-foreground">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Image */}
      <div 
        className="relative w-full aspect-square sm:aspect-[4/5] bg-muted flex items-center justify-center overflow-hidden cursor-pointer"
        onDoubleClick={handleDoubleTap}
      >
        <img 
          src={post.imageUrl} 
          alt={post.caption || "Post image"} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {showHeartAnim && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <Heart className="w-24 h-24 text-white fill-white animate-heartbeat drop-shadow-lg" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button onClick={handleLikeToggle} className="hover:opacity-60 transition-opacity">
              <Heart className={cn("w-6 h-6", isLiked ? "fill-primary text-primary" : "text-foreground")} />
            </button>
            <Link href={`/post/${post.id}`}>
              <button className="hover:opacity-60 transition-opacity">
                <MessageCircle className="w-6 h-6 text-foreground" />
              </button>
            </Link>
          </div>
          <button className="hover:opacity-60 transition-opacity">
            <Bookmark className="w-6 h-6 text-foreground" />
          </button>
        </div>

        <div className="font-bold text-sm mb-1">{likeCount} likes</div>

        {post.caption && (
          <div className="text-sm mb-2">
            <Link href={`/profile/${post.author.username}`}>
              <span className="font-bold mr-2 cursor-pointer hover:underline">{post.author.username}</span>
            </Link>
            <span>{post.caption}</span>
          </div>
        )}

        {!isDetail && post.commentCount > 0 && (
          <Link href={`/post/${post.id}`}>
            <div className="text-sm text-muted-foreground cursor-pointer mb-2">
              View all {post.commentCount} comments
            </div>
          </Link>
        )}

        <div className="text-[10px] uppercase text-muted-foreground mt-2 tracking-wide">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}
