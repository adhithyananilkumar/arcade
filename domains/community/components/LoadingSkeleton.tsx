'use client';

function SkeletonBlock({
  w = '100%',
  h = 14,
  r = 6,
}: {
  w?: string | number;
  h?: number;
  r?: number;
}) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        backgroundColor: '#e4e8f0',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  );
}

function PostCardSkeleton() {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <SkeletonBlock w={32} h={32} r={100} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SkeletonBlock w="40%" h={12} />
          <SkeletonBlock w="25%" h={10} />
        </div>
        <SkeletonBlock w={60} h={20} r={20} />
      </div>
      <SkeletonBlock h={18} />
      <SkeletonBlock w="80%" h={14} />
      <SkeletonBlock w="65%" h={14} />
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <SkeletonBlock w={50} h={22} r={20} />
        <SkeletonBlock w={60} h={22} r={20} />
        <SkeletonBlock w={45} h={22} r={20} />
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
        <SkeletonBlock w={40} h={14} />
        <SkeletonBlock w={55} h={14} />
      </div>
    </div>
  );
}

export function LoadingSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: count }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
