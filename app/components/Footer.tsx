import constants from '@constants';
import Image from 'next/image';

const {
  company: { name: companyName, alternateName: companyAlternateName },
} = constants;

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-6">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} {companyAlternateName}. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 mt-1">{companyName} Inc.</p>
          </div>
          <div className="flex items-center gap-6">
            <Image
              src="/cncf.png"
              alt="CNCF Logo"
              width={150}
              height={60}
            />
            <Image
              src="/Linux_Foundation_logo.png"
              alt="Linux Foundation Logo"
              width={120}
              height={48}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
