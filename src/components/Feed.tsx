import { useEffect, useRef, useState } from 'react';
import { useFeed } from '@/hooks/useFeed';
import { PostCard } from '@/components/PostCard';
import { PostComposer } from '@/components/PostComposer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import type { NostrFilter } from '@nostrify/nostrify';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FeedProps {
  filter?: Partial<NostrFilter>;
  showComposer?: boolean;
  emptyMessage?: string;
}

export function Feed({ filter, showComposer = true, emptyMessage = 'No posts yet' }: FeedProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeed({ filter });
  const [replyToEvent, setReplyToEvent] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const posts = data?.pages.flatMap((page) => page) ?? [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-0">
        {showComposer && (
          <div className="border-b">
            <div className="p-4">
              <div className="flex gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-9 w-24 ml-auto" />
                </div>
              </div>
            </div>
          </div>
        )}
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="border-x-0 border-t-0 rounded-none">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="space-y-0">
        {showComposer && (
          <div className="border-b">
            <PostComposer />
          </div>
        )}
        <Card className="border-x-0 border-t-0 rounded-none">
          <CardContent className="py-12 px-8 text-center">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-0">
        {showComposer && (
          <div className="border-b">
            <PostComposer />
          </div>
        )}
        
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            event={post}
            onReply={() => setReplyToEvent(post.id)}
          />
        ))}

        {hasNextPage && (
          <div ref={loadMoreRef} className="py-8 flex justify-center">
            {isFetchingNextPage && (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            )}
          </div>
        )}

        {!hasNextPage && posts.length > 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">You've reached the end</p>
          </div>
        )}
      </div>

      <Dialog open={!!replyToEvent} onOpenChange={() => setReplyToEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to post</DialogTitle>
          </DialogHeader>
          <PostComposer 
            replyTo={replyToEvent || undefined}
            onSuccess={() => setReplyToEvent(null)}
            placeholder="Post your reply"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
