import constants from '@constants';

const {
  company: { name: companyName, alternateName: companyAlternateName },
} = constants;

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-6">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} {companyAlternateName}. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-1">{companyName} Inc.</p>
        </div>
      </div>
    </footer>
  );
}
