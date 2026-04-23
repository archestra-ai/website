'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { Channel, MessagePage, SlackMessage, User } from '../data/types';
import { useCommunityStats } from '../data/use-stats';
import DateSeparator from './DateSeparator';
import Message from './Message';

interface MessageAreaProps {
  channel: Channel;
  focusedMessageTs?: string;
  onToggleSidebar: () => void;
  initialData?: MessagePage;
  currentDate?: string;
  prevDate?: string | null;
  nextDate?: string | null;
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateNav(date: string): string {
  const d = new Date(date + 'T00:00:00.000Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function formatDateNavFull(date: string): string {
  const d = new Date(date + 'T00:00:00.000Z');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function getDateKey(timestamp: string): string {
  return new Date(timestamp).toDateString();
}

function getISODateKey(timestamp: string): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function isCompactMsg(current: SlackMessage, previous: SlackMessage | undefined): boolean {
  if (!previous) return false;
  if (current.userId !== previous.userId) return false;
  const diff = new Date(current.createdAt).getTime() - new Date(previous.createdAt).getTime();
  return diff < 5 * 60 * 1000;
}

export default function MessageArea({
  channel,
  focusedMessageTs,
  onToggleSidebar,
  initialData,
  currentDate,
  prevDate,
  nextDate,
}: MessageAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages] = useState<SlackMessage[]>(initialData?.messages ?? []);
  const [users] = useState<Record<string, User>>(initialData?.users ?? {});
  const initialScrollDone = useRef(false);

  // Scroll to focused message or top after initial load
  useEffect(() => {
    if (messages.length === 0 || initialScrollDone.current) return;
    initialScrollDone.current = true;

    function doScroll() {
      if (focusedMessageTs) {
        const el = document.getElementById(`msg-${focusedMessageTs}`);
        if (el) {
          const container = el.closest<HTMLElement>('[class*="overflow-y-auto"]');
          if (container) {
            const elTop = el.offsetTop;
            const elHeight = el.offsetHeight;
            const containerHeight = container.clientHeight;
            container.scrollTop = elTop - containerHeight / 2 + elHeight / 2;
          }
        }
      } else if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }

    if (focusedMessageTs) {
      let attempts = 0;
      const poll = setInterval(() => {
        attempts++;
        const el = document.getElementById(`msg-${focusedMessageTs}`);
        if (el || attempts > 20) {
          clearInterval(poll);
          doScroll();
        }
      }, 50);
      return () => clearInterval(poll);
    } else {
      requestAnimationFrame(() => requestAnimationFrame(doScroll));
    }
  }, [messages, focusedMessageTs]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white relative">
      {/* Channel header */}
      <div className="flex items-center gap-3 px-4 h-[49px] border-b border-gray-200 flex-shrink-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1 hover:bg-gray-100 rounded"
          aria-label="Toggle sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="#1D1C1D" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div className="min-w-0">
          <h2 className="font-bold text-[15px] text-[#1D1C1D] truncate">#{channel.name}</h2>
        </div>
        {channel.topic && (
          <>
            <div className="hidden sm:block w-px h-5 bg-gray-300" />
            <span className="hidden sm:block text-[13px] text-[#616061] truncate">{channel.topic}</span>
          </>
        )}
      </div>

      {/* Date navigation bar */}
      {currentDate && (
        <div className="flex items-center justify-center gap-2 px-4 h-[40px] border-b border-gray-200 flex-shrink-0 bg-gray-50">
          {prevDate ? (
            <Link
              href={`/community-stream/${channel.name}/${prevDate}`}
              className="flex items-center gap-1 text-[13px] text-blue-600 hover:text-blue-800 font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              {formatDateNav(prevDate)}
            </Link>
          ) : (
            <span className="w-20" />
          )}
          <span className="text-[13px] font-bold text-[#1D1C1D] px-3">{formatDateNavFull(currentDate)}</span>
          {nextDate ? (
            <Link
              href={`/community-stream/${channel.name}/${nextDate}`}
              className="flex items-center gap-1 text-[13px] text-blue-600 hover:text-blue-800 font-medium"
            >
              {formatDateNav(nextDate)}
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <span className="w-20" />
          )}
          {nextDate && (
            <Link
              href={`/community-stream/${channel.name}`}
              className="text-[13px] text-blue-600 hover:text-blue-800 font-medium ml-2"
            >
              Latest
            </Link>
          )}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-[13px] text-[#616061]">No messages on this day</div>
        ) : (
          <div className="py-2">
            {messages.map((msg, idx) => {
              const prev = idx > 0 ? messages[idx - 1] : undefined;
              const showDate = !prev || getDateKey(msg.createdAt) !== getDateKey(prev.createdAt);
              const compact = isCompactMsg(msg, prev) && !showDate;
              const msgDate = getISODateKey(msg.createdAt);

              return (
                <div key={msg.id} data-msg-date={msgDate}>
                  {showDate && (
                    <DateSeparator date={formatDate(msg.createdAt)} channelName={channel.name} isoDate={msgDate} />
                  )}
                  <Message
                    message={msg}
                    user={users[msg.userId || ''] || null}
                    channelName={channel.name}
                    compact={compact}
                    highlighted={msg.ts === focusedMessageTs}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <JoinSlackBar />
    </div>
  );
}

function JoinSlackBar() {
  const stats = useCommunityStats();

  return (
    <div className="flex-shrink-0 border-t border-gray-200 bg-white">
      <div className="px-8 pt-12 pb-24 flex flex-col items-center gap-6 text-center relative overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-violet-400/10 rounded-full blur-3xl" />

        <p className="text-gray-400 text-[13px] uppercase tracking-widest font-medium relative">
          Read-only live mirror of Archestra.AI Slack
        </p>

        <a
          href="/join-slack"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex items-center gap-3 text-[17px] font-bold text-white rounded-full px-10 py-4 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.03] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500"
        >
          <span className="text-2xl group-hover:animate-[wave_0.5s_ease-in-out] inline-block origin-[70%_70%]">👋</span>
          Join the discussion with
          {stats.memberCount > 0 && (
            <span className="bg-white/20 rounded-md px-2 py-0.5 mx-1 tabular-nums">
              {stats.memberCount.toLocaleString()}
            </span>
          )}
          AI enthusiasts!
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="opacity-70 group-hover:translate-x-0.5 transition-transform"
          >
            <path
              d="M3 8h8.5M8 4.5 11.5 8 8 11.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
