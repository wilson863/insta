import { useRoute, Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetPost, useGetPostComments, useAddComment, getGetPostQueryKey, getGetPostCommentsQueryKey, useLikePost, useUnlikePost } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, MoreHorizontal, Bookmark, Send } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const commentSchema = z.object({
  content: z.string().min(1).max(500),
});

type CommentFormValues = z.infer<typeof commentSchema>;

export default function PostDetail() {
  const [, params] = useRoute("/post/:id");
  const postId = Number(params?.id);
  
  const queryClient = useQueryClient();
  const { data: post, isLoading: loadingPost } = useGetPost(postId, {
    query: { enabled: !!postId, queryKey: getGetPostQueryKey(postId) }
  });
  
  const { data: comments, isLoading: loadingComments } = useGetPostComments(postId, {
    query: { enabled: !!postId, queryKey: getGetPostCommentsQueryKey(postId) }
  });

  const commentMutation = useAddComment();
  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();
  
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });

  const onSubmitComment = (data: CommentFormValues) => {
    commentMutation.mutate(
      { id: postId, data },
      {
        onSuccess: () => {
          form.reset();
          queryClient.invalidateQueries({ queryKey: getGetPostCommentsQueryKey(postId) });
          queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) });
        }
      }
    );
  };

  const handleLikeToggle = () => {
    if (!post) return;
    
    if (post.isLiked) {
      unlikeMutation.mutate(
        { id: post.id },
        { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(post.id) }) }
      );
    } else {
      likeMutation.mutate(
        { id: post.id },
        { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(post.id) }) }
      );
    }
  };

  if (loadingPost) {
    return (
      <MainLayout>
        <div className="w-full max-w-5xl mx-auto py-8 px-4 flex justify-center">
          <div className="w-full aspect-square md:aspect-[4/3] max-w-[800px] bg-muted animate-pulse rounded-xl" />
        </div>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="text-center py-20 text-muted-foreground">Post not found</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full max-w-[900px] mx-auto py-4 md:py-8 px-0 sm:px-4">
        <div className="bg-card sm:border sm:border-border sm:rounded-xl overflow-hidden flex flex-col md:flex-row h-auto md:h-[600px] lg:h-[700px] shadow-sm">
          
          {/* Post Image */}
          <div className="w-full md:w-3/5 lg:w-[60%] bg-black flex items-center justify-center shrink-0">
            <img 
              src={post.imageUrl} 
              alt={post.caption || "Post image"} 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {/* Sidebar (Comments & Details) */}
          <div className="w-full md:w-2/5 lg:w-[40%] flex flex-col border-l border-border h-full">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <Link href={`/profile/${post.author.username}`}>
                <div className="flex items-center gap-3 cursor-pointer group">
                  <Avatar className="w-8 h-8 border border-border">
                    <AvatarImage src={post.author.avatarUrl || undefined} />
                    <AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-bold text-sm group-hover:underline">{post.author.username}</span>
                </div>
              </Link>
              <button className="p-1 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            
            {/* Scrollable Comments Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* Caption */}
              {post.caption && (
                <div className="flex items-start gap-3 mb-6">
                  <Link href={`/profile/${post.author.username}`}>
                    <Avatar className="w-8 h-8 shrink-0 cursor-pointer border border-border mt-1">
                      <AvatarImage src={post.author.avatarUrl || undefined} />
                      <AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="text-sm">
                    <Link href={`/profile/${post.author.username}`}>
                      <span className="font-bold mr-2 cursor-pointer hover:underline">{post.author.username}</span>
                    </Link>
                    <span className="whitespace-pre-wrap">{post.caption}</span>
                    <div className="text-[11px] text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Comments */}
              {loadingComments ? (
                <div className="space-y-4 py-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-4/5 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3 group">
                    <Link href={`/profile/${comment.author.username}`}>
                      <Avatar className="w-8 h-8 shrink-0 cursor-pointer border border-border">
                        <AvatarImage src={comment.author.avatarUrl || undefined} />
                        <AvatarFallback>{comment.author.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="text-sm flex-1">
                      <Link href={`/profile/${comment.author.username}`}>
                        <span className="font-bold mr-2 cursor-pointer hover:underline">{comment.author.username}</span>
                      </Link>
                      <span className="break-words">{comment.content}</span>
                      <div className="text-[11px] text-muted-foreground mt-1 flex gap-3">
                        <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                        <span className="font-semibold cursor-pointer hidden group-hover:block">Reply</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-sm text-muted-foreground flex flex-col items-center justify-center h-full">
                  <MessageCircle className="w-12 h-12 mb-3 opacity-20" />
                  No comments yet. Start the conversation!
                </div>
              )}
            </div>
            
            {/* Actions Bar */}
            <div className="p-4 border-t border-border shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <button onClick={handleLikeToggle} className="hover:opacity-60 transition-opacity">
                    <Heart className={cn("w-6 h-6", post.isLiked ? "fill-primary text-primary" : "text-foreground")} />
                  </button>
                  <button className="hover:opacity-60 transition-opacity">
                    <MessageCircle className="w-6 h-6 text-foreground" />
                  </button>
                  <button className="hover:opacity-60 transition-opacity">
                    <Send className="w-6 h-6 text-foreground" />
                  </button>
                </div>
                <button className="hover:opacity-60 transition-opacity">
                  <Bookmark className="w-6 h-6 text-foreground" />
                </button>
              </div>
              <div className="font-bold text-sm mb-1">{post.likeCount} likes</div>
              <div className="text-[10px] uppercase text-muted-foreground tracking-wide">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </div>
            </div>
            
            {/* Add Comment Input */}
            <div className="p-3 border-t border-border shrink-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitComment)} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="flex-1 m-0">
                        <FormControl>
                          <Input 
                            placeholder="Add a comment..." 
                            className="border-0 focus-visible:ring-0 shadow-none bg-transparent h-9 px-1 text-sm"
                            autoComplete="off"
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    variant="ghost" 
                    size="sm"
                    className="text-primary font-bold hover:text-primary hover:bg-primary/10"
                    disabled={!form.formState.isValid || commentMutation.isPending}
                  >
                    Post
                  </Button>
                </form>
              </Form>
            </div>
            
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
