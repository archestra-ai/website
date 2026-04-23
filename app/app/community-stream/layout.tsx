import Header from '@components/Header';

export default function CommunityStreamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      {children}
    </div>
  );
}
