'use client';

import { useState } from 'react';

import { Channel, MessagePage, ThreadData } from '../data/types';

import ChannelSidebar from './ChannelSidebar';
import MessageArea from './MessageArea';
import ThreadPanel from './ThreadPanel';

interface CommunityStreamClientProps {
  channels: Channel[];
  channelId: string;
  messageTs?: string;
  hasThread?: boolean;
  initialMessages?: MessagePage;
  initialThread?: ThreadData;
  currentDate?: string;
  prevDate?: string | null;
  nextDate?: string | null;
}

export default function CommunityStreamClient({
  channels,
  channelId,
  messageTs,
  hasThread,
  initialMessages,
  initialThread,
  currentDate,
  prevDate,
  nextDate,
}: CommunityStreamClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const selectedChannel = channels.find((c) => c.id === channelId) || channels[0];

  return (
    <div className="flex-1 flex overflow-hidden">
      <ChannelSidebar
        channels={channels}
        selectedChannelId={channelId}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <MessageArea
        channel={selectedChannel}
        focusedMessageTs={messageTs}
        onToggleSidebar={() => setIsMobileSidebarOpen(true)}
        initialData={initialMessages}
        currentDate={currentDate}
        prevDate={prevDate}
        nextDate={nextDate}
      />

      {hasThread && messageTs && (
        <ThreadPanel
          channelId={channelId}
          channelName={selectedChannel.name}
          threadTs={messageTs}
          initialData={initialThread}
        />
      )}
    </div>
  );
}
