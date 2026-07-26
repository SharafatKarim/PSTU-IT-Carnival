const Row = ({ label, value }) => (
  <div className="flex flex-col gap-0.5 border-b border-ink-600 py-2 last:border-b-0 sm:flex-row sm:items-center sm:gap-4">
    <span className="w-40 text-sm font-medium text-mist-400">{label}</span>
    <span className="flex-1 text-sm text-white">
      {value || <em className="text-mist-500">—</em>}
    </span>
  </div>
);

const ReviewSection = ({ data }) => {
  const { teamName, varsityName, coach, members = [] } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-base font-semibold text-mist-100">Team</h3>
        <Row label="Team Name" value={teamName} />
        <Row label="Varsity Name" value={varsityName} />
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-mist-100">Coach</h3>
        <Row label="Name" value={coach?.name} />
        <Row label="Email" value={coach?.email} />
        <Row label="Phone" value={coach?.phone} />
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-mist-100">Members</h3>
        {members.map((m, i) => (
          <div key={i} className="mb-3 rounded-lg border border-ink-600 bg-ink-950/40 p-3">
            <p className="mb-1 text-sm font-semibold text-mist-200">
              Member {i + 1}
            </p>
            <Row label="Name" value={m.name} />
            <Row label="Email" value={m.email} />
            <Row label="Phone" value={m.phone} />
            <Row label="Student ID" value={m.studentId} />
            <Row label="T-Shirt" value={m.tshirtSize} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;
