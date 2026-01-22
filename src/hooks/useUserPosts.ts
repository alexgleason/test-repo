import { useInfiniteQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrFilter } from '@nostrify/nostrify';

export function useUserPosts(pubkey: string | undefined, limit: number = 20) {
  const { nostr } = useNostr();

  return useInfiniteQuery({
    queryKey: ['user-posts', pubkey],
    queryFn: async ({ pageParam, signal: cancelSignal }) => {
      if (!pubkey) return [];

      const signal = AbortSignal.any([cancelSignal, AbortSignal.timeout(5000)]);
      
      const filters: NostrFilter[] = [{
        kinds: [1],
        authors: [pubkey],
        limit,
        ...(pageParam ? { until: pageParam } : {}),
      }];

      const events = await nostr.query(filters, { signal });
      
      return events.sort((a, b) => b.created_at - a.created_at);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) return undefined;
      const oldestEvent = lastPage[lastPage.length - 1];
      return oldestEvent.created_at;
    },
    initialPageParam: undefined as number | undefined,
    enabled: !!pubkey,
  });
}
