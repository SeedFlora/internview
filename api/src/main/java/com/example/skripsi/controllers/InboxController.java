package com.example.skripsi.controllers;

import com.example.skripsi.interfaces.*;
import com.example.skripsi.models.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/inbox")
public class InboxController {

    private final IInboxService inboxService;

    public InboxController(IInboxService inboxService) {
        this.inboxService = inboxService;
    }

    @GetMapping("")
    @PreAuthorize("isAuthenticated()")
    public WebResponse<?> getInboxPreview(
            @RequestParam(value = "cursor", required = false) Long cursor,
            @RequestParam(value = "limit", defaultValue = "5") int limit) {
        var results = inboxService.getUserInboxPreview(cursor, limit);
        return WebResponse.builder()
                .success(true)
                .message("Inbox fetched")
                .meta(results.getMeta())
                .result(results.getResult())
                .build();
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public WebResponse<?> getUnreadCount() {
        return WebResponse.builder()
                .success(true)
                .message("Unread count fetched")
                .result(Map.of("count", inboxService.getUnreadCount()))
                .build();
    }

    @PatchMapping("/{inboxId}/read")
    @PreAuthorize("isAuthenticated()")
    public WebResponse<?> markRead(@PathVariable Long inboxId) {
        inboxService.markRead(inboxId);
        return WebResponse.builder()
                .success(true)
                .message("Notification marked as read")
                .build();
    }

    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public WebResponse<?> markAllRead() {
        int updated = inboxService.markAllRead();
        return WebResponse.builder()
                .success(true)
                .message("All notifications marked as read")
                .result(Map.of("updated", updated))
                .build();
    }
}

