import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoginArea } from '@/components/auth/LoginArea';
import { Home, Search, User, Settings, Moon, Sun } from 'lucide-react';
import { genUserName } from '@/lib/genUserName';
import { nip19 } from 'nostr-tools';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const { user } = useCurrentUser();
  const author = useAuthor(user?.pubkey);
  const { theme, setTheme } = useTheme();

  const metadata = author.data?.metadata;
  const displayName = user ? (metadata?.display_name || metadata?.name || genUserName(user.pubkey)) : '';
  const avatarUrl = metadata?.picture;
  const npub = user ? nip19.npubEncode(user.pubkey) : '';

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: User, label: 'Profile', path: user ? `/${npub}` : '/profile', requiresAuth: true },
    { icon: Settings, label: 'Settings', path: '/settings', requiresAuth: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <div className="w-20 sm:w-64 flex flex-col border-r sticky top-0 h-screen">
          <div className="flex-1 flex flex-col p-2 sm:p-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 p-3 mb-4">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">N</span>
              </div>
              <span className="hidden sm:block text-xl font-bold">Nostr</span>
            </Link>

            {/* Navigation */}
            <nav className="space-y-1 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const isDisabled = item.requiresAuth && !user;

                if (isDisabled) return null;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-full transition-colors",
                      isActive 
                        ? "bg-primary/10 text-primary font-semibold" 
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="hidden sm:block text-lg">{item.label}</span>
                  </Link>
                );
              })}

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                className="flex items-center gap-4 px-4 py-3 rounded-full w-full justify-start text-foreground hover:bg-muted"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-6 w-6" />
                    <span className="hidden sm:block text-lg">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-6 w-6" />
                    <span className="hidden sm:block text-lg">Dark Mode</span>
                  </>
                )}
              </Button>
            </nav>

            {/* User Profile/Login */}
            <div className="mt-auto pt-4 border-t">
              {user ? (
                <Link
                  to={`/${npub}`}
                  className="flex items-center gap-3 p-3 rounded-full hover:bg-muted transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">@{metadata?.name || genUserName(user.pubkey)}</p>
                  </div>
                </Link>
              ) : (
                <div className="hidden sm:block">
                  <LoginArea className="w-full" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>

        {/* Right Sidebar - Trending/Who to Follow */}
        <div className="hidden lg:block w-80 border-l">
          <div className="sticky top-0 p-4">
            {!user && (
              <div className="mb-4">
                <LoginArea className="w-full" />
              </div>
            )}
            
            <div className="text-center py-8 px-4">
              <p className="text-sm text-muted-foreground">
                Vibed with{' '}
                <a 
                  href="https://shakespeare.diy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Shakespeare
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
