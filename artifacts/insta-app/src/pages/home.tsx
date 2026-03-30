import { MainLayout } from "@/components/layout/main-layout";
import { PostCard } from "@/components/post/post-card";
import { useGetFeed, getGetFeedQueryKey, useGetSuggestedUsers } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: posts, isLoading: loadingPosts } = useGetFeed();
  const { data: suggestedUsers, isLoading: loadingUsers } = useGetSuggestedUsers();

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row gap-8 py-8 w-full max-w-[900px] mx-auto px-4">
        {/* Feed Area */}
        <div className="flex-1 w-full max-w-[500px] mx-auto space-y-6">
          {loadingPosts ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full aspect-[4/5] bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="text-center py-20 border border-border rounded-2xl bg-card">
              <h2 className="text-2xl font-bold mb-2">Welcome to InstaClone!</h2>
              <p className="text-muted-foreground mb-6">Follow some people to see their posts in your feed.</p>
              <Link href="/explore">
                <Button className="font-bold">Explore Posts</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar Suggestions (Desktop Only) */}
        <div className="hidden lg:block w-[320px] pt-4">
          <p className="text-muted-foreground font-bold text-sm mb-4">Suggested for you</p>
          <div className="space-y-4">
            {loadingUsers ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : suggestedUsers && suggestedUsers.length > 0 ? (
              suggestedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <Link href={`/profile/${user.username}`}>
                    <div className="flex items-center gap-3 cursor-pointer group">
                      <Avatar className="w-10 h-10 border border-border group-hover:opacity-80 transition-opacity">
                        <AvatarImage src={user.avatarUrl || undefined} />
                        <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold group-hover:underline">{user.username}</span>
                        <span className="text-xs text-muted-foreground">{user.fullName}</span>
                      </div>
                    </div>
                  </Link>
                  <Link href={`/profile/${user.username}`}>
                    <Button variant="ghost" size="sm" className="text-primary font-bold text-xs h-auto py-1 px-2 hover:bg-primary/10">
                      View
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No suggestions right now.</p>
            )}
          </div>
          
          <div className="mt-8 text-xs text-muted-foreground opacity-60">
            <p>© {new Date().getFullYear()} INSTACLONE CLONE</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
