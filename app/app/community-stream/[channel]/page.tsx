import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ channel: string }>;
}

export default async function ChannelPage({ params }: Props) {
  const { channel } = await params;
  const today = new Date().toISOString().slice(0, 10);
  redirect(`/community-stream/${channel}/${today}`);
}
