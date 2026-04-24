import Link from 'next/link';

interface DateSeparatorProps {
  date: string;
  channelName?: string;
  isoDate?: string;
}

export default function DateSeparator({ date, channelName, isoDate }: DateSeparatorProps) {
  const content = (
    <span className="px-4 py-1 text-[13px] font-bold text-[#1D1C1D] border border-gray-300 rounded-full bg-white hover:bg-gray-50">
      {date}
    </span>
  );

  return (
    <div className="flex items-center my-2 px-5">
      <hr className="flex-1 border-gray-300" />
      {channelName && isoDate ? (
        <Link href={`/community-stream/${channelName}/${isoDate}`}>{content}</Link>
      ) : (
        <button className="px-4 py-1 text-[13px] font-bold text-[#1D1C1D] border border-gray-300 rounded-full bg-white hover:bg-gray-50">
          {date}
        </button>
      )}
      <hr className="flex-1 border-gray-300" />
    </div>
  );
}
