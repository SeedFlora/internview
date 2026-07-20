export function ReviewModal({ modal, reviewNote, onNoteChange, onClose, onSubmit, submitting, noteRef, entityLabel }) {
  if (!modal) return null;

  const isApprove = modal.action === "approve";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-base font-semibold text-gray-900">
          {isApprove ? "Approve" : "Reject"} {entityLabel}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isApprove
            ? "Optionally add a note before approving."
            : "Optionally explain why you are rejecting this request."}
        </p>
        <textarea
          ref={noteRef}
          value={reviewNote}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Review note (optional)..."
          rows={3}
          className="mt-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
              isApprove ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {submitting ? "Submitting..." : isApprove ? "Approve" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
