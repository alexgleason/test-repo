import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { nip19 } from 'nostr-tools';
import { usePost } from '@/hooks/usePost';
import { useReactions } from '@/hooks/useReactions';
import { MainLayout } from '@/components/MainLayout';
import { PostCard } from '@/components/PostCard';
import { PostComposer } from '@/components/PostComposer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const PostDetail = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const [replyToEvent, setReplyToEvent] = useState<string | null>(null);

  let eventId: string | undefined;
  try {
    if (noteId?.startsWith('note1')) {
      eventId = nip19.decode(noteId).data as string;
    } else if (noteId?.startsWith('nevent1')) {
      const decoded = nip19.decode(noteId);
      eventId = (decoded.data as { id: string }).id;
    }
  } catch (error) {
    console.error('Invalid note ID:', error);
  }

  const { data: post, isLoading: isLoadingPost } = usePost(eventId);
  const { data: reactions, isLoading: isLoadingReactions } = useReactions(eventId);

  useSeoMeta({
    title: post ? 'Post / Nostr' : 'Loading...',
    description: post?.content.slice(0, 160) || 'View this post on Nostr',
  });

  if (!eventId) {
    return (
      <MainLayout>
        <div className="border-x">
          <Card className="border-x-0 border-t-0 rounded-none">
            <CardContent className="py-12 px-8 text-center">
              <p className="text-muted-foreground">Invalid post identifier</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="border-x">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
          <div className="px-4 py-3 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Post</h1>
          </div>
        </div>

        {isLoadingPost ? (
          <Card className="border-x-0 border-t-0 rounded-none">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-20 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : !post ? (
          <Card className="border-x-0 border-t-0 rounded-none">
            <CardContent className="py-12 px-8 text-center">
              <p className="text-muted-foreground">Post not found</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <PostCard 
              event={post}
              onReply={() => setReplyToEvent(post.id)}
            />

            <div className="border-t p-4">
              <PostComposer 
                replyTo={post.id}
                placeholder="Post your reply"
              />
            </div>

            {reactions && reactions.replies.length > 0 && (
              <div className="border-t">
                <div className="px-4 py-3 border-b">
                  <h2 className="font-bold text-lg">Replies</h2>
                </div>
                {reactions.replies.map((reply) => (
                  <PostCard 
                    key={reply.id} 
                    event={reply}
                    onReply={() => setReplyToEvent(reply.id)}
                  />
                ))}
              </div>
            )}
          </>
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
    </MainLayout>
  );
};

export default PostDetail;
