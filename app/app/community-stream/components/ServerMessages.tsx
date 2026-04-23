import { replaceEmojiShortcodes } from '../lib/emoji';

interface ServerUser {
  displayName: string;
}

interface ServerMessage {
  ts: string;
  userId: string | null;
  text: string;
  replyCount: number;
  createdAt: Date | string;
}

interface ServerMessagesProps {
  messages: ServerMessage[];
  users: Record<string, ServerUser>;
  channelName: string;
}

function cleanText(text: string): string {
  return replaceEmojiShortcodes(
    text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/<https?:\/\/[^|>]+\|([^>]+)>/g, '$1')
      .replace(/<https?:\/\/([^>]+)>/g, '$1')
      .replace(/<@[A-Z0-9]+(?:\|([^>]+))?>/g, (_, name) => `@${name || 'user'}`)
      .replace(/<#[A-Z0-9]+(?:\|([^>]+))?>/g, (_, name) => `#${name || 'channel'}`)
  );
}

function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Server-rendered message content for SEO.
 * Hidden visually but present in initial HTML for search engine crawlers.
 */
export default function ServerMessages({ messages, users, channelName }: ServerMessagesProps) {
  if (messages.length === 0) return null;

  return (
    <div
      className="sr-only"
      aria-hidden="true"
      suppressHydrationWarning
    >
      <h2>Messages in #{channelName}</h2>
      {messages.map((msg) => {
        const author = msg.userId ? users[msg.userId]?.displayName || 'Someone' : 'Someone';
        return (
          <article key={msg.ts} data-ts={msg.ts}>
            <p>
              <strong>{author}</strong> — <time dateTime={new Date(msg.createdAt).toISOString()}>{formatDate(msg.createdAt)}</time>
            </p>
            <p>{cleanText(msg.text)}</p>
            {msg.replyCount > 0 && (
              <p>
                <a href={`/community-stream/${channelName}/${msg.ts}`}>
                  {msg.replyCount} {msg.replyCount === 1 ? 'reply' : 'replies'}
                </a>
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
