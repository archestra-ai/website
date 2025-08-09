import type { MetadataRoute } from 'next';

import constants from '@constants';

const {
  company: { name: companyName, alternateName: companyAlternateName, description: companyDescription },
} = constants;

/**
 * See https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: companyAlternateName,
    short_name: companyName,
    description: companyDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
