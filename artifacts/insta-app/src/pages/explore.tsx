import { MainLayout } from "@/components/layout/main-layout";
import { useListPosts } from "@workspace/api-client-react";
import { PostGrid } from "@/components/post/post-grid";

export default function Explore() {
  const { data: posts, isLoading } = useListPosts();

  return (
    <MainLayout>
      <div className="w-full py-6 md:py-10 max-w-5xl mx-auto px-1 sm:px-4">
        <div className="mb-6 px-3 sm:px-0">
          <h1 className="text-2xl font-bold">Explore</h1>
          <p className="text-muted-foreground">Discover new content from the community.</p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-3 gap-1 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <PostGrid posts={posts} />
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            No posts found to explore.
          </div>
        )}
      </div>
    </MainLayout>
  );
}
