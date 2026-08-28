// Generic shimmer rectangle — the building block for every skeleton layout
// in the app (text lines, avatars, image blocks, buttons). Reuses the same
// `.skeleton` shimmer defined in portal.css, so color/animation stay in
// one place.
export function SkeletonBlock({ width = "100%", height = 16, radius = 8, style, className = "" }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius, flexShrink: 0, ...style }}
      aria-hidden="true"
    />
  );
}

// Dashboard.jsx — homepage "Our Doctors" grid card
export function DoctorCardSkeleton() {
  return (
    <div className="doc-card">
      <SkeletonBlock height={200} radius={0} />
      <div className="doc-body">
        <SkeletonBlock height={16} width="75%" />
        <SkeletonBlock height={22} width="45%" radius={999} />
        <SkeletonBlock height={13} width="55%" />
        <SkeletonBlock height={36} radius={10} style={{ marginTop: "auto" }} />
      </div>
    </div>
  );
}

// DoctorsList.jsx — full-width doctor row card
export function DoctorRowSkeleton() {
  return (
    <div className="doc-card">
      <SkeletonBlock width={6} height="auto" radius={0} style={{ alignSelf: "stretch" }} />
      <div className="doc-avatar-wrap">
        <SkeletonBlock width={72} height={72} radius={18} />
      </div>
      <div className="doc-body">
        <SkeletonBlock height={17} width="45%" />
        <SkeletonBlock height={20} width="35%" radius={999} />
        <SkeletonBlock height={13} width="90%" />
        <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
          <SkeletonBlock height={38} width={140} radius={11} />
          <SkeletonBlock height={38} width={120} radius={11} />
        </div>
      </div>
    </div>
  );
}

// MyAppointments.jsx — appointment row card
export function AppointmentCardSkeleton() {
  return (
    <div className="appt-card">
      <div className="appt-date-col">
        <SkeletonBlock height={10} width={30} />
        <SkeletonBlock height={28} width={34} style={{ marginTop: 6 }} />
        <SkeletonBlock height={10} width={26} style={{ marginTop: 6 }} />
      </div>
      <div className="appt-main">
        <SkeletonBlock height={20} width={90} radius={999} />
        <SkeletonBlock height={16} width="40%" />
        <SkeletonBlock height={13} width="60%" />
      </div>
      <div className="appt-action-col">
        <SkeletonBlock height={38} width={110} radius={11} />
      </div>
    </div>
  );
}

// AboutDoctor.jsx — hero band (photo + name + stat pills)
export function DoctorHeroSkeleton() {
  return (
    <div className="hero-profile">
      <SkeletonBlock width={180} height={200} radius={20} />
      <div className="hero-text" style={{ width: "100%" }}>
        <SkeletonBlock height={12} width={120} style={{ marginBottom: 14 }} />
        <SkeletonBlock height={36} width="70%" style={{ marginBottom: 12 }} />
        <SkeletonBlock height={22} width={160} radius={999} style={{ marginBottom: 22 }} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <SkeletonBlock height={54} width={140} radius={11} />
          <SkeletonBlock height={54} width={140} radius={11} />
          <SkeletonBlock height={54} width={140} radius={11} />
        </div>
      </div>
    </div>
  );
}

// AboutDoctor.jsx — body panels (about / details / availability / contact)
export function DoctorProfileBodySkeleton() {
  return (
    <div className="profile-grid">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="panel">
          <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SkeletonBlock height={14} />
            <SkeletonBlock height={14} width="90%" />
            <SkeletonBlock height={14} width="75%" />
          </div>
        </div>
        <div className="panel">
          <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SkeletonBlock height={18} />
            <SkeletonBlock height={18} />
            <SkeletonBlock height={18} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <SkeletonBlock height={220} radius={22} />
        <div className="panel">
          <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SkeletonBlock height={18} />
            <SkeletonBlock height={18} />
          </div>
        </div>
      </div>
    </div>
  );
}
