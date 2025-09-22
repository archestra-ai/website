'use client';

import { useTypewriter } from '@lib/hooks/useTypewriter';

interface TypewriterTextProps {
  words: string[];
  className?: string;
}

export default function TypewriterText({ words, className }: TypewriterTextProps) {
  const typedText = useTypewriter({
    words,
    typingSpeed: 100,
    deletingSpeed: 50,
    pauseDuration: 1500,
  });

  return (
    <h2 className={className}>
      For <span className="font-bold">{typedText}</span>
      <span className="animate-pulse">|</span>
    </h2>
  );
}
