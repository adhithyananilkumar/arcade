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
      <div className="flex h-screen w-full overflow-hidden bg-[#fafafa]">
        {/* Sidebar */}
        <div className="hidden md:block print:hidden">
          <DashboardSidebar />
        </div>
        
        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="print:hidden">
            <DashboardNavbar />
          </div>
          <main className="flex-1 overflow-y-auto p-6 md:p-8 print:p-0">
            {children}
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
