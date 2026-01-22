import { nip19 } from 'nostr-tools';
import { useParams, Navigate } from 'react-router-dom';
import NotFound from './NotFound';
import Profile from './Profile';
import PostDetail from './PostDetail';

export function NIP19Page() {
  const { nip19: identifier } = useParams<{ nip19: string }>();

  if (!identifier) {
    return <NotFound />;
  }

  let decoded;
  try {
    decoded = nip19.decode(identifier);
  } catch {
    return <NotFound />;
  }

  const { type } = decoded;

  switch (type) {
    case 'npub':
    case 'nprofile':
      return <Profile />;

    case 'note':
    case 'nevent':
      return <PostDetail />;

    case 'naddr':
      return <NotFound />;

    default:
      return <NotFound />;
  }
} 