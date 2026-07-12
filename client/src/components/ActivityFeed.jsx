const ActivityFeed = ({ initialPurchasers = [], liveActivity = [] }) => {
  // Merge live activity (newest first) with initial data; cap at 3
  const entries = [...liveActivity, ...initialPurchasers].slice(0, 3);

  if (entries.length === 0) return null;

  return (
    <div className="border-t border-gray-100 pt-3 mt-1">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Recent Buyers
      </p>
      <ul className="space-y-1.5">
        {entries.map((p, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
              {p.firstName[0].toUpperCase()}
            </span>
            <span className="font-medium text-gray-700 truncate">
              {p.firstName} {p.lastName}
            </span>
            <span className="text-gray-400 text-xs ml-auto whitespace-nowrap">
              {new Date(p.purchasedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;
