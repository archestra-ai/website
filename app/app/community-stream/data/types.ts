export interface User {
  id: string;
  displayName: string;
  realName?: string | null;
  avatarUrl?: string | null;
  avatarColor: string;
  isBot?: number;
}

export interface Reaction {
  name: string;
  count: number;
  users: string[];
}

export interface SlackMessage {
  id: string;
  channelId: string;
  userId: string | null;
  ts: string;
  threadTs: string | null;
  text: string;
  replyCount: number;
  replyUsersCount: number;
  reactions: Reaction[] | null;
  files: { name: string; mimetype: string; url: string }[] | null;
  slackUrl: string | null;
  createdAt: string;
}

export interface Channel {
  id: string;
  name: string;
  topic: string | null;
  purpose: string | null;
  memberCount: number | null;
  updatedAt?: Date | null;
}

export interface MessagePage {
  messages: SlackMessage[];
  users: Record<string, User>;
  hasOlder: boolean;
  hasNewer: boolean;
}

export interface ThreadData {
  parentMessage: SlackMessage;
  replies: SlackMessage[];
  users: Record<string, User>;
}

export interface CommunityStats {
  totalTodayMessages: number;
  memberCount: number;
  newMembersToday: number;
  channels: Record<string, { today: number; month: number; memberCount: number }>;
}
