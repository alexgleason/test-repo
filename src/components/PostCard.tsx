import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { NostrEvent } from '@nostrify/nostrify';
import { useAuthor } from '@/hooks/useAuthor';
import { useReactions } from '@/hooks/useReactions';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Repeat2 } from 'lucide-react';
import { genUserName } from '@/lib/genUserName';
import { NoteContent } from '@/components/NoteContent';
import { nip19 } from 'nostr-tools';
import { cn } from '@/lib/utils';

interface PostCardProps {
  event: NostrEvent;
  showReplyTo?: boolean;
  onReply?: () => void;
}

export function PostCard({ event, showReplyTo = true, onReply }: PostCardProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const author = useAuthor(event.pubkey);
  const { data: reactions } = useReactions(event.id);
  const { user } = useCurrentUser();
  const { mutate: publish } = useNostrPublish();

  const metadata = author.data?.metadata;
  const displayName = metadata?.display_name || metadata?.name || genUserName(event.pubkey);
  const username = metadata?.name || genUserName(event.pubkey);
  const avatarUrl = metadata?.picture;

  const npub = nip19.npubEncode(event.pubkey);
  const noteId = nip19.noteEncode(event.id);

  const userHasLiked = reactions?.likes.some((like) => like.pubkey === user?.pubkey);
  const userHasReposted = reactions?.reposts.some((repost) => repost.pubkey === user?.pubkey);

  const timestamp = new Date(event.created_at * 1000);
  const timeAgo = getTimeAgo(timestamp);

  const handleLike = () => {
    if (!user || isLiking) return;
    setIsLiking(true);

    publish(
      {
        kind: 7,
        content: '+',
        tags: [
          ['e', event.id],
          ['p', event.pubkey],
        ],
      },
      {
        onSettled: () => setIsLiking(false),
      }
    );
  };

  const handleRepost = () => {
    if (!user || isReposting) return;
    setIsReposting(true);

    publish(
      {
        kind: 6,
        content: '',
        tags: [
          ['e', event.id],
          ['p', event.pubkey],
        ],
      },
      {
        onSettled: () => setIsReposting(false),
      }
    );
  };

  return (
    <Card className="border-x-0 border-t-0 rounded-none hover:bg-muted/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Link to={`/${npub}`}>
            <Avatar className="h-12 w-12 hover:opacity-90 transition-opacity">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col min-w-0">
                <Link to={`/${npub}`} className="hover:underline">
                  <span className="font-bold text-foreground truncate">{displayName}</span>
                </Link>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span className="truncate">@{username}</span>
                  <span>·</span>
                  <Link to={`/${noteId}`} className="hover:underline">
                    <time dateTime={timestamp.toISOString()}>{timeAgo}</time>
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <NoteContent event={event} className="text-[15px] leading-normal whitespace-pre-wrap break-words" />
            </div>

            <div className="flex items-center gap-1 mt-3 -ml-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 px-2 gap-2"
                onClick={onReply}
              >
                <MessageCircle className="h-[18px] w-[18px]" />
                {reactions && reactions.replies.length > 0 && (
                  <span className="text-sm">{reactions.replies.length}</span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-muted-foreground hover:text-green-600 hover:bg-green-600/10 h-8 px-2 gap-2",
                  userHasReposted && "text-green-600"
                )}
                onClick={handleRepost}
                disabled={!user || isReposting}
              >
                <Repeat2 className="h-[18px] w-[18px]" />
                {reactions && reactions.reposts.length > 0 && (
                  <span className="text-sm">{reactions.reposts.length}</span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-muted-foreground hover:text-pink-600 hover:bg-pink-600/10 h-8 px-2 gap-2",
                  userHasLiked && "text-pink-600"
                )}
                onClick={handleLike}
                disabled={!user || isLiking}
              >
                <Heart className={cn("h-[18px] w-[18px]", userHasLiked && "fill-current")} />
                {reactions && reactions.likes.length > 0 && (
                  <span className="text-sm">{reactions.likes.length}</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
