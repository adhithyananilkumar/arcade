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
      className="premium-shimmer"
      style={{
        width: w,
        height: h,
        borderRadius: r,
      }}
    />
  );
}

function PostCardSkeleton() {
  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.45)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxShadow: 'var(--shadow-premium)',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
