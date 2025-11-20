import fs from 'fs';
import path from 'path';

import { ImageResponse } from 'next/og';

import constants from '@constants';

import { getDocBySlug } from '../utils';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ slug: string }> };

const logoPath = path.join(process.cwd(), 'app', 'public', 'logo_archestra.svg');

function getLogoDataUrl() {
  if (!fs.existsSync(logoPath)) {
    return null;
  }

  const logoBuffer = fs.readFileSync(logoPath);
  const logoBase64 = Buffer.from(logoBuffer).toString('base64');
  return `data:image/svg+xml;base64,${logoBase64}`;
}

const logoDataUrl = getLogoDataUrl();

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  const title = doc?.title ?? `${constants.company.name} Docs`;
  const description = doc?.description ?? constants.company.tagline;

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'flex-end',
          background: '#000',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'flex-end',
          padding: '64px',
          position: 'relative',
          width: '100%',
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        {logoDataUrl ? (
          <img
            src={logoDataUrl}
            alt={`${constants.company.name} logo`}
            style={{ height: 96, position: 'absolute', right: 64, top: 64, width: 'auto' }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              right: 64,
              top: 64,
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            {constants.company.name}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: '80%' }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, wordBreak: 'break-word' }}>{title}</div>
          <div style={{ backgroundColor: '#fff', borderRadius: 9999, height: 4, width: 120 }} />
          <div style={{ color: '#cbd5e1', fontSize: 28, lineHeight: 1.5 }}>{description}</div>
        </div>
      </div>
    ),
    size,
  );
}
