import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function InboxDropdown({
  isOpen,
  onOpenChange,
  onTriggerHover,
  inboxLoading,
  inboxData,
  onItemClick,
}) {
  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          aria-label="Inbox notifications"
          onMouseEnter={onTriggerHover}
        >
          <Bell className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-w-[90vw]">
        <div className="px-2 py-1 border-b">
          <h3 className="text-xs font-semibold uppercase tracking-wide">Inbox</h3>
        </div>
        {inboxLoading ? (
          <div className="px-2 py-2 text-xs text-muted-foreground text-center">
            Loading...
          </div>
        ) : inboxData.length > 0 ? (
          <div className="max-h-72 overflow-y-auto">
            {inboxData.map((item) => (
              <DropdownMenuItem
                key={item.inboxId}
                onClick={() => onItemClick(item)}
                className={`flex flex-col items-start gap-1 cursor-pointer py-2 px-2 hover:bg-accent rounded transition-colors ${
                  !item.read ? "bg-muted/50" : ""
                }`}
              >
                <div className="flex w-full items-start gap-2">
                  <p
                    className={`min-w-0 flex-1 text-sm leading-snug line-clamp-1 ${
                      !item.read ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {item.activity}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-semibold whitespace-nowrap shrink-0 ${
                      item.action === "APPROVED"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : item.action === "REJECTED"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {item.action}
                  </span>
                </div>
                <div className="flex w-full items-center gap-2 text-xs text-muted-foreground">
                  {/* BUG FIX: backend sends `type` (e.g. COMPANY_REQUEST); this
                      read the nonexistent `requestType`, so the category chip
                      never rendered. */}
                  {item.type ? (
                    <span className="max-w-[60%] truncate rounded bg-secondary px-1.5 py-0.5 text-foreground/70">
                      {item.type.replaceAll("_", " ")}
                    </span>
                  ) : null}
                  <span className="ml-auto shrink-0">
                    {new Date(item.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <div className="px-2 py-2 text-xs text-muted-foreground text-center">
            No messages
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
