'use client';

import { ArchestraMcpServerManifest } from '@mcpCatalog/types';
import { useEffect, useMemo, useState } from 'react';

interface RotatingServerDisplayProps {
  servers: ArchestraMcpServerManifest[];
}

export default function RotatingServerDisplay({ servers }: RotatingServerDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  // Filter servers with badge and sort by stars - memoized to prevent recalculation
  const serversWithBadge = useMemo(() => {
    return servers
      .filter(server => server.readme && server.readme.toLowerCase().includes('archestra.ai'))
      .sort((a, b) => (b.github_info?.stars || 0) - (a.github_info?.stars || 0));
  }, [servers]);
  
  const count = serversWithBadge.length;
  
  useEffect(() => {
    if (count === 0) return;
    
    const currentServer = serversWithBadge[currentIndex];
    const stars = currentServer.github_info?.stars;
    const formattedStars = stars ? (stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars.toString()) : '0';
    const displayName = currentServer.display_name || currentServer.name;
    const fullText = `${displayName} (${formattedStars}⭐️)`;
    
    // If there's existing text, delete it first
    if (displayText && displayText.length > 0) {
      let deleteIndex = displayText.length;
      setIsTyping(true);
      
      const deleteInterval = setInterval(() => {
        if (deleteIndex > 0) {
          deleteIndex--;
          setDisplayText(displayText.slice(0, deleteIndex));
        } else {
          clearInterval(deleteInterval);
          
          // Start typing new text after deletion
          let charIndex = 0;
          const typingInterval = setInterval(() => {
            if (charIndex < fullText.length) {
              setDisplayText(fullText.slice(0, charIndex + 1));
              charIndex++;
            } else {
              clearInterval(typingInterval);
              setIsTyping(false);
              
              // Wait before moving to next server
              const nextTimeout = setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % count);
              }, 2000);
              
              return () => clearTimeout(nextTimeout);
            }
          }, 50); // Type one character every 50ms
        }
      }, 30); // Delete faster than typing
      
      return () => clearInterval(deleteInterval);
    } else {
      // First time, just type
      let charIndex = 0;
      setIsTyping(true);
      
      const typingInterval = setInterval(() => {
        if (charIndex < fullText.length) {
          setDisplayText(fullText.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          
          // Wait before moving to next server
          const nextTimeout = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % count);
          }, 2000);
          
          return () => clearTimeout(nextTimeout);
        }
      }, 50); // Type one character every 50ms
      
      return () => clearInterval(typingInterval);
    }
  }, [currentIndex, count]); // Only depend on currentIndex and count, not serversWithBadge
  
  if (count === 0) {
    return <span>0</span>;
  }
  
  const currentServer = serversWithBadge[currentIndex];
  
  return (
    <>
      <span className="text-purple-600 font-semibold">{count}</span> projects such as{' '}
      <span className="inline-block min-w-[280px]">
        <a 
          href={`/mcp-catalog/${currentServer.name}`}
          className="text-blue-600 hover:underline"
        >
          {displayText}
          {isTyping && <span className="animate-pulse">|</span>}
        </a>
      </span>
    </>
  );
}
