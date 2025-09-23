'use client';

import { ChevronDown, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { Button } from '@components/ui/button';
import { authClient } from '@lib/auth-client';

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  isMobile?: boolean;
}

export function UserProfile({ user, isMobile = false }: UserProfileProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  if (isMobile) {
    return (
      <div className="px-3 py-2">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
          <div className="flex-shrink-0">
            {user.image ? (
              <Image src={user.image} alt={userDisplayName} width={32} height={32} className="rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-sm font-medium text-indigo-600">{userInitials}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{userDisplayName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
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
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {user.image ? (
                  <Image src={user.image} alt={userDisplayName} width={40} height={40} className="rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-indigo-600">{userInitials}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{userDisplayName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>

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
