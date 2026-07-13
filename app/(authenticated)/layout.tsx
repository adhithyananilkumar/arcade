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
      <div className="relative flex h-screen w-full overflow-hidden bg-[#f8fafc] text-slate-900 font-sans">
        {/* Ambient background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-indigo-200/30 to-purple-200/30 blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-200/20 to-emerald-200/20 blur-3xl pointer-events-none z-0" />

        {/* Sidebar */}
        <div className="hidden md:block relative z-10 h-full">
          <DashboardSidebar />
        </div>
        
        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden relative z-10">
          <DashboardNavbar />
          <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
            {children}
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
