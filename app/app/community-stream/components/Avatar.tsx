interface AvatarProps {
  initials: string;
  color: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md';
}

export default function Avatar({ initials, color, avatarUrl, size = 'md' }: AvatarProps) {
  const sizeClasses = size === 'sm' ? 'w-5 h-5 text-[10px]' : 'w-9 h-9 text-sm';

  if (avatarUrl) {
    return <img src={avatarUrl} alt={initials} className={`${sizeClasses} rounded-md flex-shrink-0 object-cover`} />;
  }

  return (
    <div
      className={`${sizeClasses} rounded-md flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}
