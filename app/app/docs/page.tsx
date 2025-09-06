import { redirect } from 'next/navigation';

import { getAllDocs } from './utils';

export default function DocsPage() {
  // Get the first document in the sorted list
  const docs = getAllDocs();

  if (docs.length > 0) {
    // Redirect to the first documentation page
    redirect(`/docs/${docs[0].slug}`);
  }

  // If no docs exist, show a message
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No Documentation Available</h1>
        <p className="text-gray-600">Please check back later.</p>
      </div>
    </div>
  );
}
