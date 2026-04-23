'use client';

import { Hash, X } from 'lucide-react';
import Link from 'next/link';

import { Channel } from '../data/types';
import { useCommunityStats } from '../data/use-stats';

interface ChannelSidebarProps {
  channels: Channel[];
  selectedChannelId: string;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function ChannelSidebar({
  channels,
  selectedChannelId,
  isMobileOpen,
  onCloseMobile,
}: ChannelSidebarProps) {
  const stats = useCommunityStats();

  const sidebar = (
    <div className="w-[240px] h-full flex flex-col bg-[#3F0E40] text-white flex-shrink-0">
      {/* Mobile close button */}
      <div className="flex items-center justify-end px-4 h-[49px] border-b border-[#522653] lg:hidden">
        <button
          onClick={onCloseMobile}
          className="p-1 hover:bg-[#522653] rounded transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Channel list and info */}
      <div className="flex-1 overflow-y-auto pt-3">
        {channels.map((channel) => {
          const isActive = channel.id === selectedChannelId;
          const chStats = stats.channels[channel.name];
          return (
            <Link
              key={channel.id}
              href={`/community-stream/${channel.name}`}
              onClick={onCloseMobile}
              className={`block w-full text-left px-4 py-1.5 transition-colors ${
                isActive ? 'bg-[#1164A3] text-white' : 'text-[#CDB1CE] hover:bg-[#522653]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[15px] font-medium">
                <Hash className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{channel.name}</span>
              </div>
              {chStats && (
                <div className={`text-[11px] pl-[22px] ${isActive ? 'text-[#B4D5F1]' : 'text-[#9B7B9C]'}`}>
                  {chStats.month} this month, {chStats.today} today
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block h-full">{sidebar}</div>
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onCloseMobile} />
          <div className="relative h-full">{sidebar}</div>
        </div>
      )}
    </>
  );
}
