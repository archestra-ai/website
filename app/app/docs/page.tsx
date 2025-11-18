import { redirect } from 'next/navigation';

import DeveloperNotice from './components/DeveloperNotice';
import { getAllDocs } from './utils';

export default function DocsPage() {
  // Get the first document in the sorted list
  const docs = getAllDocs();

  if (docs.length > 0) {
    // Try to redirect to platform-quickstart if it exists, otherwise use the first doc
    const platformQuickstart = docs.find((doc) => doc.slug === 'platform-quickstart');
    const targetDoc = platformQuickstart || docs[0];
    redirect(`/docs/${targetDoc.slug}`);
  }

  // Show developer notice in development, generic message in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    return <DeveloperNotice />;
  }

  // Production message
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No Documentation Available</h1>
        <p className="text-gray-600">Please check back later.</p>
      </div>
    </div>
  );
}
