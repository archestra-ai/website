import React from 'react';

import { replaceEmojiShortcodes } from '../lib/emoji';

function parseInline(raw: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = replaceEmojiShortcodes(raw);
  let key = 0;

  while (remaining.length > 0) {
    // Inline code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      nodes.push(
        <code
          key={key++}
          className="bg-[#F0F4F8] border border-gray-200 rounded-[3px] px-1 py-0.5 text-[13px] text-[#E01E5A] font-mono"
        >
          {codeMatch[1]}
        </code>,
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Bold: *text*
    const boldMatch = remaining.match(/^\*([^*]+)\*/);
    if (boldMatch) {
      nodes.push(
        <strong key={key++} className="font-bold">
          {parseInline(boldMatch[1])}
        </strong>,
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic: _text_
    const italicMatch = remaining.match(/^_([^_]+)_/);
    if (italicMatch) {
      nodes.push(<em key={key++}>{parseInline(italicMatch[1])}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Strikethrough: ~text~
    const strikeMatch = remaining.match(/^~([^~]+)~/);
    if (strikeMatch) {
      nodes.push(<del key={key++}>{parseInline(strikeMatch[1])}</del>);
      remaining = remaining.slice(strikeMatch[0].length);
      continue;
    }

    // Links: <url|text> or <url>
    const linkMatch = remaining.match(/^<(https?:\/\/[^|>]+)\|([^>]+)>/);
    if (linkMatch) {
      nodes.push(
        <a
          key={key++}
          href={linkMatch[1]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1264A3] hover:underline"
        >
          {linkMatch[2]}
        </a>,
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    const linkOnlyMatch = remaining.match(/^<(https?:\/\/[^>]+)>/);
    if (linkOnlyMatch) {
      nodes.push(
        <a
          key={key++}
          href={linkOnlyMatch[1]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1264A3] hover:underline"
        >
          {linkOnlyMatch[1]}
        </a>,
      );
      remaining = remaining.slice(linkOnlyMatch[0].length);
      continue;
    }

    // User mentions: <@U12345> or <@U12345|name>
    const mentionMatch = remaining.match(/^<@([A-Z0-9]+)(?:\|([^>]+))?>/);
    if (mentionMatch) {
      const display = mentionMatch[2] || 'user';
      nodes.push(
        <span key={key++} className="bg-[#E8F5FA] text-[#1264A3] rounded px-0.5">
          @{display}
        </span>,
      );
      remaining = remaining.slice(mentionMatch[0].length);
      continue;
    }

    // Channel references: <#C12345|name>
    const channelMatch = remaining.match(/^<#([A-Z0-9]+)(?:\|([^>]+))?>/);
    if (channelMatch) {
      const display = channelMatch[2] || 'channel';
      nodes.push(
        <span key={key++} className="bg-[#E8F5FA] text-[#1264A3] rounded px-0.5">
          #{display}
        </span>,
      );
      remaining = remaining.slice(channelMatch[0].length);
      continue;
    }

    // Plain text until next special character
    const plainMatch = remaining.match(/^[^`*_~<\n]+/);
    if (plainMatch) {
      nodes.push(plainMatch[0]);
      remaining = remaining.slice(plainMatch[0].length);
      continue;
    }

    // If nothing matches, consume one character
    nodes.push(remaining[0]);
    remaining = remaining.slice(1);
  }

  return nodes;
}

interface SlackMarkdownProps {
  text: string;
}

export default function SlackMarkdown({ text }: SlackMarkdownProps) {
  // Decode Slack HTML entities
  const decoded = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

  // Split into blocks: code blocks, blockquotes, bullet lists, paragraphs
  const blocks: React.ReactNode[] = [];
  const lines = decoded.split('\n');
  let i = 0;
  let blockKey = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block: ```...```
    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      blocks.push(
        <pre
          key={blockKey++}
          className="bg-[#F8F8F8] border border-gray-200 rounded-md p-3 my-1 overflow-x-auto text-[13px] font-mono text-[#1D1C1D] leading-relaxed"
        >
          <code>{codeLines.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    // Blockquote: > text
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push(
        <blockquote
          key={blockKey++}
          className="border-l-4 border-gray-300 pl-3 my-1 text-[#616061]"
        >
          {quoteLines.map((ql, qi) => (
            <div key={qi}>{parseInline(ql)}</div>
          ))}
        </blockquote>,
      );
      continue;
    }

    // Bullet list: - item or * item
    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s/, ''));
        i++;
      }
      blocks.push(
        <ul key={blockKey++} className="list-disc list-inside my-1 space-y-0.5">
          {items.map((item, idx) => (
            <li key={idx}>{parseInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Regular line
    blocks.push(
      <div key={blockKey++} className="my-0.5">
        {parseInline(line)}
      </div>,
    );
    i++;
  }

  return <div className="text-[15px] leading-[1.46668] text-[#1D1C1D]">{blocks}</div>;
}
