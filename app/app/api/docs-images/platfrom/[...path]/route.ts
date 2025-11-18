import { getAssetsDirectory } from '@/app/docs/lib/get-docs-path';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: pathSegments } = await params;
    const imagePath = pathSegments.join('/');

    // Get the assets directory based on environment
    const assetsDirectory = getAssetsDirectory();
    if (!assetsDirectory) {
      return new NextResponse('Docs not available', { status: 503 });
    }

    // Construct the full path to the image
    const fullPath = path.join(assetsDirectory, 'platfrom', imagePath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Read the image file
    const imageBuffer = fs.readFileSync(fullPath);

    // Determine content type based on file extension
    const ext = path.extname(imagePath).toLowerCase();
    const contentType =
      {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
      }[ext] || 'application/octet-stream';

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving docs image:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
