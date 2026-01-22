import { useSeoMeta } from '@unhead/react';
import { MainLayout } from '@/components/MainLayout';
import { Feed } from '@/components/Feed';

const Explore = () => {
  useSeoMeta({
    title: 'Explore / Nostr',
    description: 'Discover new posts and people on Nostr',
  });

  return (
    <MainLayout>
      <div className="border-x">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
          <div className="px-4 py-3">
            <h1 className="text-xl font-bold">Explore</h1>
          </div>
        </div>
        
        <Feed showComposer={false} emptyMessage="No posts found. Try checking your relay connections." />
      </div>
    </MainLayout>
  );
};

export default Explore;
