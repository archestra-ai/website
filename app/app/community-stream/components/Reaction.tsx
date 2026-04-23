import { Reaction as ReactionType } from '../data/types';
import { emojiFromName } from '../lib/emoji';

interface ReactionProps {
  reaction: ReactionType;
}

export default function Reaction({ reaction }: ReactionProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-[#F0F4F8] px-2 py-0.5 text-xs cursor-default hover:bg-[#DDE5ED] transition-colors">
      <span>{emojiFromName(reaction.name)}</span>
      <span className="text-[#1264A3] font-medium">{reaction.count}</span>
    </span>
  );
}
