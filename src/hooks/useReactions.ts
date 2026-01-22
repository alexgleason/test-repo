import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

export function useReactions(eventId: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['reactions', eventId],
    queryFn: async ({ signal: cancelSignal }) => {
      if (!eventId) return { likes: [], reposts: [], replies: [] };

      const signal = AbortSignal.any([cancelSignal, AbortSignal.timeout(3000)]);
      
      const events = await nostr.query([
        {
          kinds: [1, 6, 7, 16],
          '#e': [eventId],
          limit: 150,
        }
      ], { signal });

      const likes = events.filter((e: NostrEvent) => e.kind === 7);
      const reposts = events.filter((e: NostrEvent) => e.kind === 6 || e.kind === 16);
      const replies = events.filter((e: NostrEvent) => e.kind === 1);

      return { likes, reposts, replies };
    },
    enabled: !!eventId,
  });
}
