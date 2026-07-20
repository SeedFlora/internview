export function DeleteConfirmModal({ target, nameKey = "name", title, description, deleting, onCancel, onConfirm }) {
  if (!target) return null;

  const resolvedTitle = title ?? "Delete Item";
  const resolvedDescription = description ?? (
    <>
      Are you sure you want to delete{" "}
      <span className="font-medium text-gray-900">{target[nameKey]}</span>? This action cannot be undone.
    </>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-base font-semibold text-gray-900">{resolvedTitle}</h2>
        <p className="mt-2 text-sm text-gray-600">{resolvedDescription}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
