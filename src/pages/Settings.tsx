import { useSeoMeta } from '@unhead/react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { RelayListManager } from '@/components/RelayListManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();

  useSeoMeta({
    title: 'Settings / Nostr',
    description: 'Manage your Nostr settings',
  });

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
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
        </div>

        <div className="p-4 space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Relays</CardTitle>
              <CardDescription>
                Manage your Nostr relay connections. Relays are servers that store and distribute your posts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RelayListManager />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
