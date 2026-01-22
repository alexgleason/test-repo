import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { nip19 } from 'nostr-tools';
import { useAuthor } from '@/hooks/useAuthor';
import { useUserPosts } from '@/hooks/useUserPosts';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { MainLayout } from '@/components/MainLayout';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Link2, Loader2, MapPin } from 'lucide-react';
import { genUserName } from '@/lib/genUserName';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PostComposer } from '@/components/PostComposer';
import { EditProfileForm } from '@/components/EditProfileForm';

const Profile = () => {
  const { npub } = useParams<{ npub: string }>();
  const navigate = useNavigate();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [replyToEvent, setReplyToEvent] = useState<string | null>(null);
  const { user } = useCurrentUser();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  let pubkey: string | undefined;
  try {
    if (npub?.startsWith('npub1')) {
      pubkey = nip19.decode(npub).data as string;
    } else if (npub?.startsWith('nprofile1')) {
      const decoded = nip19.decode(npub);
      pubkey = (decoded.data as { pubkey: string }).pubkey;
    }
  } catch (error) {
    console.error('Invalid npub:', error);
  }

  const author = useAuthor(pubkey);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useUserPosts(pubkey);

  const posts = data?.pages.flatMap((page) => page) ?? [];
  const metadata = author.data?.metadata;
  const displayName = metadata?.display_name || metadata?.name || (pubkey ? genUserName(pubkey) : 'Unknown');
  const username = metadata?.name || (pubkey ? genUserName(pubkey) : 'unknown');
  const bio = metadata?.about;
  const website = metadata?.website;
  const avatarUrl = metadata?.picture;
  const bannerUrl = metadata?.banner;
  
  const isOwnProfile = user?.pubkey === pubkey;

  useSeoMeta({
    title: `${displayName} (@${username}) / Nostr`,
    description: bio || `View ${displayName}'s profile on Nostr`,
  });

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

  if (!pubkey) {
    return (
      <MainLayout>
        <div className="border-x">
          <Card className="border-x-0 border-t-0 rounded-none">
            <CardContent className="py-12 px-8 text-center">
              <p className="text-muted-foreground">Invalid profile identifier</p>
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
            <div>
              <h1 className="text-xl font-bold">{displayName}</h1>
              {!isLoading && (
                <p className="text-xs text-muted-foreground">{posts.length} posts</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Header */}
        <div>
          {/* Banner */}
          <div className="h-48 bg-muted relative isolate">
            {bannerUrl && (
              <img
                src={bannerUrl}
                alt="Profile banner"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/10" />
          </div>

          {/* Profile Info */}
          <div className="px-4 pb-4">
            <div className="flex justify-between items-start -mt-16 mb-4">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="text-4xl">{displayName[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              
              {isOwnProfile && (
                <Button
                  variant="outline"
                  className="mt-3 rounded-full font-semibold"
                  onClick={() => setShowEditDialog(true)}
                >
                  Edit profile
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <h2 className="text-2xl font-bold">{displayName}</h2>
                <p className="text-muted-foreground">@{username}</p>
              </div>

              {bio && (
                <p className="whitespace-pre-wrap break-words">{bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {website && (
                  <a
                    href={website.startsWith('http') ? website : `https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Link2 className="h-4 w-4" />
                    <span>{website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="border-t">
          {isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="border-x-0 border-t-0 rounded-none">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card className="border-x-0 border-t-0 rounded-none">
              <CardContent className="py-12 px-8 text-center">
                <p className="text-muted-foreground">No posts yet</p>
              </CardContent>
            </Card>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>
          <EditProfileForm />
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
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

export default Profile;
