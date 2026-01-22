import { useInfiniteQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent, NostrFilter } from '@nostrify/nostrify';

interface UseFeedOptions {
  filter?: Partial<NostrFilter>;
  limit?: number;
}

export function useFeed(options: UseFeedOptions = {}) {
  const { nostr } = useNostr();
  const { filter = {}, limit = 20 } = options;

  return useInfiniteQuery({
    queryKey: ['feed', filter],
    queryFn: async ({ pageParam, signal: cancelSignal }) => {
      const signal = AbortSignal.any([cancelSignal, AbortSignal.timeout(5000)]);
      
      const filters: NostrFilter[] = [{
        kinds: [1],
        limit,
        ...filter,
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
  });
}
