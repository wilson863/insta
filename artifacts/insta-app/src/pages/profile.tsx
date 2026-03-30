import { MainLayout } from "@/components/layout/main-layout";
import { useRoute, Link } from "wouter";
import { useGetUserProfile, useGetUserPosts, useGetMe, useFollowUser, useUnfollowUser, getGetUserProfileQueryKey, getGetSuggestedUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PostGrid } from "@/components/post/post-grid";

export default function Profile() {
  const [, params] = useRoute("/profile/:username");
  const username = params?.username || "";
  
  const queryClient = useQueryClient();
  const { data: currentUser } = useGetMe();
  const { data: profile, isLoading: loadingProfile } = useGetUserProfile(username, {
    query: { enabled: !!username, queryKey: getGetUserProfileQueryKey(username) }
  });
  
  const { data: posts, isLoading: loadingPosts } = useGetUserPosts(username, {
    query: { enabled: !!username }
  });

  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const isOwnProfile = currentUser?.username === username;

  const handleFollowToggle = () => {
    if (!profile) return;
    
    if (profile.isFollowing) {
      unfollowMutation.mutate(
        { username: profile.username },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetUserProfileQueryKey(username) });
            queryClient.invalidateQueries({ queryKey: getGetSuggestedUsersQueryKey() });
          }
        }
      );
    } else {
      followMutation.mutate(
        { username: profile.username },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetUserProfileQueryKey(username) });
            queryClient.invalidateQueries({ queryKey: getGetSuggestedUsersQueryKey() });
          }
        }
      );
    }
  };

  if (loadingProfile) {
    return (
      <MainLayout>
        <div className="w-full max-w-4xl mx-auto p-4 animate-pulse">
          <div className="flex items-start gap-8 mb-10">
            <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-muted" />
            <div className="flex-1 space-y-4">
              <div className="h-8 w-40 bg-muted rounded" />
              <div className="h-4 w-60 bg-muted rounded" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="text-center py-20 text-muted-foreground">User not found</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full max-w-4xl mx-auto pt-6 md:pt-10 px-0 sm:px-4">
        {/* Profile Header */}
        <div className="flex items-center md:items-start gap-4 md:gap-10 px-4 mb-8 md:mb-12">
          <div className="shrink-0">
            <Avatar className="w-20 h-20 md:w-36 md:h-36 border border-border shadow-sm">
              <AvatarImage src={profile.avatarUrl || undefined} />
              <AvatarFallback className="text-2xl md:text-5xl bg-muted text-muted-foreground">
                {profile.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 min-w-0 flex flex-col gap-3 md:gap-5">
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
              <h1 className="text-xl md:text-2xl font-display truncate">{profile.username}</h1>
              {!isOwnProfile && (
                <Button 
                  onClick={handleFollowToggle} 
                  disabled={followMutation.isPending || unfollowMutation.isPending}
                  variant={profile.isFollowing ? "secondary" : "default"}
                  className={`h-8 md:h-9 font-bold px-6 ${!profile.isFollowing ? "instaclone-gradient text-white border-0" : ""}`}
                >
                  {profile.isFollowing ? "Following" : "Follow"}
                </Button>
              )}
              {isOwnProfile && (
                <Button variant="outline" className="h-8 md:h-9 font-bold px-6">Edit Profile</Button>
              )}
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-base">
              <div><span className="font-bold">{profile.postCount}</span> posts</div>
              <div className="cursor-pointer"><span className="font-bold">{profile.followerCount}</span> followers</div>
              <div className="cursor-pointer"><span className="font-bold">{profile.followingCount}</span> following</div>
            </div>
            
            <div className="hidden md:block">
              <div className="font-bold text-sm">{profile.fullName}</div>
              {profile.bio && <div className="text-sm whitespace-pre-wrap">{profile.bio}</div>}
            </div>
          </div>
        </div>

        {/* Mobile Stats & Bio */}
        <div className="md:hidden px-4 mb-6 space-y-4">
          <div>
            <div className="font-bold text-sm">{profile.fullName}</div>
            {profile.bio && <div className="text-sm whitespace-pre-wrap">{profile.bio}</div>}
          </div>
          
          <div className="flex items-center justify-around text-center py-3 border-y border-border">
            <div className="flex flex-col">
              <span className="font-bold">{profile.postCount}</span>
              <span className="text-xs text-muted-foreground">posts</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold">{profile.followerCount}</span>
              <span className="text-xs text-muted-foreground">followers</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold">{profile.followingCount}</span>
              <span className="text-xs text-muted-foreground">following</span>
            </div>
          </div>
        </div>

        {/* Grid Tabs */}
        <div className="flex justify-center border-t border-border">
          <div className="flex items-center gap-2 border-t border-foreground py-4 text-sm font-bold uppercase tracking-widest text-foreground">
            <svg aria-label="" className="w-3 h-3" fill="currentColor" height="12" role="img" viewBox="0 0 24 24" width="12"><rect fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="18" x="3" y="3"></rect><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="9.015" x2="9.015" y1="3" y2="21"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="14.985" x2="14.985" y1="3" y2="21"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="9.015" y2="9.015"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="14.985" y2="14.985"></line></svg>
            POSTS
          </div>
        </div>

        {/* Posts Grid */}
        <div className="px-1 sm:px-0">
          {loadingPosts ? (
            <div className="grid grid-cols-3 gap-1 sm:gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-muted animate-pulse rounded-sm" />
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <PostGrid posts={posts} />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <div className="w-16 h-16 border-2 border-foreground rounded-full flex items-center justify-center mb-4">
                <svg aria-label="" className="w-8 h-8 text-foreground" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" fillRule="evenodd"></path><path d="M12 6c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z" fillRule="evenodd"></path><circle cx="12" cy="12" r="2"></circle></svg>
              </div>
              <h2 className="text-xl font-bold text-foreground">No Posts Yet</h2>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
