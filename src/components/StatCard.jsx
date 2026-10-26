export function StatCard({ icon, label, value, detail, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <i className={`stat-icon ${accent}`}>{icon}</i>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">{detail}</div>
    </div>
  );
}
