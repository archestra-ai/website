'use client';

import { Check, LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { SlackMessage, User } from '../data/types';
import Avatar from './Avatar';
import FileAttachments from './FileAttachments';
import ReactionComponent from './Reaction';
import SlackMarkdown from './SlackMarkdown';

interface MessageProps {
  message: SlackMessage;
  user: User | null;
  channelName?: string;
  compact?: boolean;
  highlighted?: boolean;
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getInitials(user: User | null): string {
  if (!user) return '?';
  return user.displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function CopyLinkButton({ permalink }: { permalink: string }) {
  const [copied, setCopied] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}${permalink}`;
    window.history.replaceState(null, '', permalink);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-0.5 text-[11px] text-[#616061] hover:text-[#1264A3] hover:underline"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" />
          Copied
        </>
      ) : (
        <>
          <LinkIcon className="w-3 h-3" />
          Link
        </>
      )}
    </button>
  );
}

function TimeLink({ permalink, messageTs, className, children }: { permalink: string; messageTs: string; className?: string; children: React.ReactNode }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.replaceState(null, '', permalink);
    // Flash highlight on the message
    const el = document.getElementById(`msg-${messageTs}`);
    if (el) {
      el.classList.add('bg-[#FFF8E7]');
      setTimeout(() => el.classList.remove('bg-[#FFF8E7]'), 2000);
    }
  };

  return (
    <a href={permalink} onClick={handleClick} className={className || 'hover:underline'}>
      {children}
    </a>
  );
}

function MessageLinks({ permalink, slackUrl }: { permalink?: string; slackUrl?: string | null }) {
  if (!permalink && !slackUrl) return null;
  return (
    <span className="inline-flex items-center gap-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {permalink && <CopyLinkButton permalink={permalink} />}
      {slackUrl && (
        <a
          href={slackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-[#616061] hover:text-[#1264A3] hover:underline"
        >
          Open in Slack
        </a>
      )}
    </span>
  );
}

export default function Message({ message, user, channelName, compact = false, highlighted = false }: MessageProps) {
  const hasThread = message.replyCount > 0;
  const permalink = channelName ? `/community-stream/${channelName}/${message.ts}` : undefined;
  const highlightClass = highlighted ? 'bg-[#FFF8E7]' : '';
  const initials = getInitials(user);
  const color = user?.avatarColor || '#607D8B';
  const displayName = user?.displayName || 'Unknown';
  const reactions = message.reactions || [];

  const threadLink =
    channelName && hasThread ? (
      <Link
        href={`/community-stream/${channelName}/${message.ts}`}
        className="flex items-center gap-1.5 mt-1 py-1 px-1 -mx-1 rounded-md hover:bg-gray-100 transition-colors group/thread"
      >
        <span className="text-[13px] font-bold text-[#1264A3] group-hover/thread:underline">
          {message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}
        </span>
      </Link>
    ) : null;

  if (compact) {
    return (
      <div
        id={`msg-${message.ts}`}
        className={`flex gap-2 px-5 py-0.5 hover:bg-[#F8F8F8] group relative ${highlightClass}`}
      >
        <div className="w-9 flex-shrink-0 flex items-start justify-center pt-0.5">
          <span className="text-[12px] text-[#616061] opacity-0 group-hover:opacity-100 transition-opacity">
            {permalink ? (
              <TimeLink permalink={permalink} messageTs={message.ts}>{formatTime(message.createdAt)}</TimeLink>
            ) : (
              formatTime(message.createdAt)
            )}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <SlackMarkdown text={message.text} />
          <FileAttachments files={message.files} />
          {reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {reactions.map((r, i) => (
                <ReactionComponent key={i} reaction={r} />
              ))}
            </div>
          )}
          {threadLink}
        </div>
      </div>
    );
  }

  return (
    <div id={`msg-${message.ts}`} className={`flex gap-2 px-5 pt-2 pb-0.5 hover:bg-[#F8F8F8] group ${highlightClass}`}>
      <Avatar initials={initials} color={color} avatarUrl={user?.avatarUrl} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
          <span className="font-bold text-[15px] text-[#1D1C1D]">{displayName}</span>
          {permalink ? (
            <TimeLink permalink={permalink} messageTs={message.ts} className="text-[12px] text-[#616061] hover:underline">
              {formatTime(message.createdAt)}
            </TimeLink>
          ) : (
            <span className="text-[12px] text-[#616061]">{formatTime(message.createdAt)}</span>
          )}
          <MessageLinks permalink={permalink} slackUrl={message.slackUrl} />
        </div>
        <SlackMarkdown text={message.text} />
        <FileAttachments files={message.files} />
        {reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {reactions.map((r, i) => (
              <ReactionComponent key={i} reaction={r} />
            ))}
          </div>
        )}
        {threadLink}
      </div>
    </div>
  );
}
