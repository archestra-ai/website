import { ImageResponse } from 'next/og';

import constants from '@constants';

import { getDocBySlug } from '../utils';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ slug: string }> };

const LogoMark = () => (
  <svg
    width="270"
    height="270"
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Archestra"
  >
    <rect x="0" y="0" width="26" height="26" fill="none" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.4384 17.0524C11.3272 17.0524 12.1228 16.5011 12.4349 15.6689L14.6487 9.76536C15.1714 8.37143 14.141 6.8845 12.6522 6.8845C11.7634 6.8845 10.9679 7.43583 10.6558 8.26803L8.44198 14.1716C7.91926 15.5655 8.94971 17.0524 10.4384 17.0524Z"
      fill="#FFFFFF"
    />
    <ellipse
      cx="2.11831"
      cy="1.95944"
      rx="2.11831"
      ry="1.95944"
      transform="matrix(-1 0 0 1 18.5356 12.9747)"
      fill="#FFFFFF"
    />
  </svg>
);

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  const title = doc?.title ?? `${constants.company.name} Docs`;

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'flex-start',
          background: '#000',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'flex-end',
          padding: '72px 72px 64px',
          position: 'relative',
          width: '100%',
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: 32,
            top: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LogoMark />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            maxWidth: '70%',
            alignItems: 'flex-start',
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              fontSize: 78,
              fontWeight: 'bolder',
              lineHeight: 1.05,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              textAlign: 'left',
            }}
          >
            {title}
          </div>
        </div>
      </div>
    ),
    size
  );
}
