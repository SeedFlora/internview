import { Search } from "lucide-react";

export function UserManagementToolbar({ search, onSearchChange }) {
  return (
    <div className="border-b border-gray-100 p-5">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search users..."
          className="h-12 w-full rounded-xl border border-gray-300 bg-white py-2 pl-12 pr-4 text-base text-gray-700 outline-none placeholder:text-gray-400 focus:border-gray-400"
        />
      </div>
    </div>
  );
}
