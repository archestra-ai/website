'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { fetchThread } from '../data/api';
import { SlackMessage, ThreadData, User } from '../data/types';
import Message from './Message';

interface ThreadPanelProps {
  channelId: string;
  channelName: string;
  threadTs: string;
  initialData?: ThreadData;
}

export default function ThreadPanel({ channelId, channelName, threadTs, initialData }: ThreadPanelProps) {
  const [parentMessage, setParentMessage] = useState<SlackMessage | null>(initialData?.parentMessage ?? null);
  const [replies, setReplies] = useState<SlackMessage[]>(initialData?.replies ?? []);
  const [users, setUsers] = useState<Record<string, User>>(initialData?.users ?? {});
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;
    setLoading(true);
    fetchThread(channelId, threadTs)
      .then((data) => {
        setParentMessage(data.parentMessage);
        setReplies(data.replies);
        setUsers(data.users);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [channelId, threadTs]);

  return (
    <div className="w-full md:w-[400px] flex flex-col bg-white border-l border-gray-200 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[49px] border-b border-gray-200 flex-shrink-0">
        <h3 className="font-bold text-[15px] text-[#1D1C1D]">Thread</h3>
        <Link
          href={`/community-stream/${channelName}`}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label="Close thread"
        >
          <X className="w-5 h-5 text-[#616061]" />
        </Link>
      </div>

      {/* Thread messages */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-[13px] text-[#616061]">Loading thread...</div>
        ) : parentMessage ? (
          <div className="py-2">
            <Message message={parentMessage} user={users[parentMessage.userId || ''] || null} />

            <div className="flex items-center gap-3 px-5 my-2">
              <hr className="flex-1 border-gray-200" />
              <span className="text-[12px] text-[#616061] font-medium">
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </span>
              <hr className="flex-1 border-gray-200" />
            </div>

            {replies.map((reply) => (
              <Message key={reply.id} message={reply} user={users[reply.userId || ''] || null} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[13px] text-[#616061]">Thread not found</div>
        )}
      </div>
    </div>
  );
}
