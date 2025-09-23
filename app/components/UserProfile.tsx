'use client';

import { ChevronDown, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { Button } from '@components/ui/button';
import { authClient } from '@lib/auth-client';

interface UserProfileProps {
  isMobile?: boolean;
}

export function UserProfile({ isMobile = false }: UserProfileProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: sessionData } = authClient.useSession();
  const user = sessionData?.user;

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const userDisplayName = user.name || user.email.split('@')[0];
  const userInitials = userDisplayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const linkDesktopAppButton = (
    <Button
      onClick={() => { window.location.href = `archestra-ai://open-desktop-app?token=${sessionData?.session?.token}`; }}
      variant="outline"
      size="sm"
      className="w-full"
    >
      Link Desktop App
    </Button>
  );

  if (isMobile) {
    return (
      <div className="px-3 py-2">
        {linkDesktopAppButton}
        <Button onClick={handleSignOut} disabled={isLoading} variant="outline" size="sm" className="w-full mt-2">
          <LogOut className="mr-2 h-4 w-4" />
          {isLoading ? 'Signing out...' : 'Sign out'}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        {user.image ? (
          <Image src={user.image} alt={userDisplayName} width={32} height={32} className="rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-sm font-medium text-indigo-600">{userInitials}</span>
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 hidden sm:block">{userDisplayName}</span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-2">{linkDesktopAppButton}</div>

            <div className="p-2">
              <Button onClick={handleSignOut} disabled={isLoading} variant="outline" size="sm" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                {isLoading ? 'Signing out...' : 'Sign out'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
