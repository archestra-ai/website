import Image from 'next/image';
import Link from 'next/link';

import CookieSettingsLink from '@components/CookieSettingsLink';
import constants from '@constants';

const {
  company: { name: companyName, alternateName: companyAlternateName },
} = constants;

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-6">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
          <div className="flex flex-col text-center sm:text-left">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} {companyAlternateName}. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 mt-1">{companyName} Inc.</p>
            <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs">
              <Link href="/privacy" className="text-gray-500 hover:text-gray-700 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-gray-700 transition-colors">
                Terms of Service
              </Link>
              <CookieSettingsLink />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Image src="/cncf.png" alt="CNCF Logo" width={150} height={60} />
            <Image src="/Linux_Foundation_logo.png" alt="Linux Foundation Logo" width={120} height={48} />
          </div>
        </div>
      </div>
    </footer>
  );
}
