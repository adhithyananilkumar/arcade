import ProtectedLayout from '@/components/ProtectedLayout';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import DashboardSidebar from '@/components/layout/DashboardSidebar';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout>
      <div className="flex h-screen w-full overflow-hidden bg-slate-50">
        {/* Sidebar */}
        <div className="hidden md:block w-[280px] shrink-0 border-r border-slate-200/60 bg-white">
          <DashboardSidebar />
        </div>
        
        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardNavbar />
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="mx-auto max-w-[1440px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
