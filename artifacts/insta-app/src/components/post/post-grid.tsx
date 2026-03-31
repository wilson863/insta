import { Link } from "wouter";
import { Heart, MessageCircle } from "lucide-react";
import type { Post } from "@workspace/api-client-react";

export function PostGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-4">
      {posts.map((post) => (
        <Link key={post.id} href={`/post/${post.id}`}>
          <div className="relative aspect-square cursor-pointer group bg-muted overflow-hidden">
            <img 
              src={post.imageUrl} 
              alt={post.caption || "Post"} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
              <div className="flex items-center gap-2 font-bold text-lg">
                <Heart className="w-6 h-6 fill-white" />
                <span>{post.likeCount}</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-lg">
                <MessageCircle className="w-6 h-6 fill-white" />
                <span>{post.commentCount}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
