import fs from 'fs';
import path from 'path';

export type ImageSize = {
  height: number;
  width: number;
};

const imageSizeCache = new Map<string, ImageSize | undefined>();

function readJpegSize(buffer: Buffer): ImageSize | undefined {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return undefined;
  }

  let offset = 2;

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];

    if (marker === undefined) {
      return undefined;
    }

    if (marker === 0xd9 || marker === 0xda) {
      return undefined;
    }

    const segmentLength = buffer.readUInt16BE(offset + 2);

    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker) && offset + 8 < buffer.length) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + segmentLength;
  }

  return undefined;
}

function readPngSize(buffer: Buffer): ImageSize | undefined {
  if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') {
    return undefined;
  }

  return {
    height: buffer.readUInt32BE(20),
    width: buffer.readUInt32BE(16),
  };
}

function readGifSize(buffer: Buffer): ImageSize | undefined {
  if (buffer.length < 10 || !buffer.toString('ascii', 0, 6).startsWith('GIF')) {
    return undefined;
  }

  return {
    height: buffer.readUInt16LE(8),
    width: buffer.readUInt16LE(6),
  };
}

function readWebpSize(buffer: Buffer): ImageSize | undefined {
  if (buffer.length < 30 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    return undefined;
  }

  const chunkType = buffer.toString('ascii', 12, 16);

  if (chunkType === 'VP8X' && buffer.length >= 30) {
    return {
      height: 1 + buffer.readUIntLE(27, 3),
      width: 1 + buffer.readUIntLE(24, 3),
    };
  }

  if (chunkType === 'VP8 ' && buffer.length >= 30) {
    return {
      height: buffer.readUInt16LE(28) & 0x3fff,
      width: buffer.readUInt16LE(26) & 0x3fff,
    };
  }

  if (chunkType === 'VP8L' && buffer.length >= 25) {
    const bits = buffer.readUInt32LE(21);
    return {
      height: ((bits >> 14) & 0x3fff) + 1,
      width: (bits & 0x3fff) + 1,
    };
  }

  return undefined;
}

function getImageSizeFromBuffer(buffer: Buffer): ImageSize | undefined {
  return readPngSize(buffer) ?? readJpegSize(buffer) ?? readGifSize(buffer) ?? readWebpSize(buffer);
}

export function getPublicImageSize(publicSrc?: string): ImageSize | undefined {
  if (!publicSrc?.startsWith('/')) {
    return undefined;
  }

  if (imageSizeCache.has(publicSrc)) {
    return imageSizeCache.get(publicSrc);
  }

  const absolutePath = path.join(process.cwd(), 'public', publicSrc.replace(/^\//, ''));

  if (!fs.existsSync(absolutePath)) {
    imageSizeCache.set(publicSrc, undefined);
    return undefined;
  }

  const buffer = fs.readFileSync(absolutePath);
  const size = getImageSizeFromBuffer(buffer);
  imageSizeCache.set(publicSrc, size);
  return size;
}
