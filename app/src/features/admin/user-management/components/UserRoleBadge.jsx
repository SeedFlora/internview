export function UserRoleBadge({ role }) {
  const isAdmin = role === "Admin";

  return (
    <span
      className={`inline-flex min-w-[76px] items-center justify-center rounded-full px-3 py-1 text-sm font-medium ${
        isAdmin ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
      }`}
    >
      {role}
    </span>
  );
}
