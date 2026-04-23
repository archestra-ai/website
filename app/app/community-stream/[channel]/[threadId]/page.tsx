import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import CommunityStreamClient from '../../components/CommunityStreamClient';
import ServerMessages from '../../components/ServerMessages';
import {
  cachedGetAvailableDates,
  cachedGetChannels,
  cachedGetMessage,
  cachedGetMessagesByDate,
  cachedGetThreadReplies,
  cachedGetUser,
  cachedGetUsers,
} from '../../db/cache';

interface Props {
  params: Promise<{ channel: string; threadId: string }>;
}

const BASE_URL = 'https://archestra.ai';

function isDateParam(param: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(param);
}

function formatDateForTitle(date: string): string {
  const d = new Date(date + 'T00:00:00.000Z');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

// --- Date page helpers ---

async function generateDateMetadata(channel: string, date: string): Promise<Metadata> {
  const channels = await cachedGetChannels();
  const ch = channels.find((c) => c.name === channel);
  if (!ch) return {};

  const title = `#${ch.name} - ${formatDateForTitle(date)} | Archestra Community`;
  const description = ch.purpose || ch.topic || `Discussion in #${ch.name} on ${formatDateForTitle(date)}`;
  const url = `${BASE_URL}/community-stream/${channel}/${date}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, siteName: 'Archestra Community', type: 'website' },
    twitter: { card: 'summary', title, description },
  };
}

async function generateThreadMetadata(channel: string, threadId: string): Promise<Metadata> {
  const channels = await cachedGetChannels();
  const ch = channels.find((c) => c.name === channel);
  if (!ch) return {};

  const msg = await cachedGetMessage(ch.id, threadId);
  if (!msg) return {};

  const user = msg.userId ? await cachedGetUser(msg.userId) : null;
  const displayName = user?.displayName || 'Someone';
  const bodyPreview = msg.text.replace(/[*_~`<>]/g, '').replace(/\|[^>]*/g, '').slice(0, 150);
  const replies = await cachedGetThreadReplies(ch.id, threadId);
  const replyCount = replies.length;

  const title = `${displayName} in #${ch.name}: "${bodyPreview}${msg.text.length > 150 ? '...' : ''}" | Archestra Community`;
  const description = `${displayName} posted in #${ch.name}${replyCount > 0 ? ` - ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}` : ''}. ${bodyPreview}`;
  const url = `${BASE_URL}/community-stream/${channel}/${threadId}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      siteName: 'Archestra Community',
      type: 'article',
      publishedTime: new Date(msg.createdAt).toISOString(),
      authors: [displayName],
    },
    twitter: { card: 'summary', title, description },
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { channel, threadId } = await params;
  if (isDateParam(threadId)) {
    return generateDateMetadata(channel, threadId);
  }
  return generateThreadMetadata(channel, threadId);
}

export default async function MessagePage({ params }: Props) {
  const { channel, threadId } = await params;
  const channels = await cachedGetChannels();
  const ch = channels.find((c) => c.name === channel);
  if (!ch) notFound();

  if (isDateParam(threadId)) {
    return renderDatePage(channel, threadId, channels, ch);
  }
  return renderThreadPage(channel, threadId, channels, ch);
}

async function renderDatePage(
  channel: string,
  date: string,
  channels: Awaited<ReturnType<typeof cachedGetChannels>>,
  ch: Awaited<ReturnType<typeof cachedGetChannels>>[number],
) {
  const rawMessages = await cachedGetMessagesByDate(ch.id, date);
  const rawUsers = await cachedGetUsers();
  const availableDates = await cachedGetAvailableDates(ch.id);

  const dateIdx = availableDates.indexOf(date);
  const prevDate = dateIdx > 0 ? availableDates[dateIdx - 1] : null;
  const nextDate = dateIdx >= 0 && dateIdx < availableDates.length - 1 ? availableDates[dateIdx + 1] : null;

  const messages = JSON.parse(JSON.stringify(rawMessages));
  const users = JSON.parse(JSON.stringify(rawUsers));

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForum',
    name: `#${ch.name} - ${formatDateForTitle(date)} - Archestra Community Stream`,
    description: ch.purpose || ch.topic || `Discussion in #${ch.name} on ${formatDateForTitle(date)}`,
    url: `${BASE_URL}/community-stream/${channel}/${date}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ServerMessages messages={rawMessages} users={rawUsers} channelName={channel} />
      <CommunityStreamClient
        channels={channels}
        channelId={ch.id}
        initialMessages={{ messages, users, hasOlder: false, hasNewer: false }}
        currentDate={date}
        prevDate={prevDate}
        nextDate={nextDate}
      />
    </>
  );
}

async function renderThreadPage(
  channel: string,
  threadId: string,
  channels: Awaited<ReturnType<typeof cachedGetChannels>>,
  ch: Awaited<ReturnType<typeof cachedGetChannels>>[number],
) {
  const msg = await cachedGetMessage(ch.id, threadId);
  if (!msg) notFound();

  const hasThread = (msg.replyCount || 0) > 0;
  const rawUsers = await cachedGetUsers();

  // Get messages for the same date as the focused message
  const msgDate = new Date(msg.createdAt).toISOString().slice(0, 10);
  const rawDateMessages = await cachedGetMessagesByDate(ch.id, msgDate);
  const availableDates = await cachedGetAvailableDates(ch.id);
  const dateIdx = availableDates.indexOf(msgDate);
  const prevDate = dateIdx > 0 ? availableDates[dateIdx - 1] : null;
  const nextDate = dateIdx >= 0 && dateIdx < availableDates.length - 1 ? availableDates[dateIdx + 1] : null;

  const rawReplies = hasThread ? await cachedGetThreadReplies(ch.id, threadId) : [];

  const users = JSON.parse(JSON.stringify(rawUsers));
  const dateMessages = JSON.parse(JSON.stringify(rawDateMessages));
  const replies = JSON.parse(JSON.stringify(rawReplies));
  const serializedMsg = JSON.parse(JSON.stringify(msg));

  const user = msg.userId ? users[msg.userId] : null;
  const displayName = user?.displayName || 'Someone';
  const bodyPreview = msg.text.replace(/[*_~`<>]/g, '').replace(/\|[^>]*/g, '').slice(0, 200);

  const structuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: bodyPreview,
    text: msg.text,
    author: { '@type': 'Person', name: displayName },
    datePublished: new Date(msg.createdAt).toISOString(),
    url: `${BASE_URL}/community-stream/${channel}/${threadId}`,
    isPartOf: {
      '@type': 'DiscussionForum',
      name: `#${ch.name} - Archestra Community`,
      url: `${BASE_URL}/community-stream/${channel}`,
    },
  };

  if (replies.length > 0) {
    structuredData.commentCount = replies.length;
    structuredData.comment = replies.slice(0, 20).map((r: { userId?: string; text: string; createdAt: string }) => {
      const replyUser = r.userId ? users[r.userId] : null;
      return {
        '@type': 'Comment',
        text: r.text.slice(0, 500),
        author: { '@type': 'Person', name: replyUser?.displayName || 'Someone' },
        datePublished: new Date(r.createdAt).toISOString(),
      };
    });
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ServerMessages messages={[msg, ...rawReplies]} users={rawUsers} channelName={channel} />
      <CommunityStreamClient
        channels={channels}
        channelId={ch.id}
        messageTs={threadId}
        hasThread={hasThread}
        initialMessages={{ messages: dateMessages, users, hasOlder: false, hasNewer: false }}
        initialThread={hasThread ? { parentMessage: serializedMsg, replies, users } : undefined}
        currentDate={msgDate}
        prevDate={prevDate}
        nextDate={nextDate}
      />
    </>
  );
}
