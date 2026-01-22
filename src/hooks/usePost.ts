import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';

export function usePost(eventId: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['post', eventId],
    queryFn: async ({ signal: cancelSignal }) => {
      if (!eventId) return null;

      const signal = AbortSignal.any([cancelSignal, AbortSignal.timeout(3000)]);
      const events = await nostr.query([{ ids: [eventId] }], { signal });
      
      return events[0] || null;
    },
    enabled: !!eventId,
  });
}
