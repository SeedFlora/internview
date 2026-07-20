package com.example.skripsi.interfaces;

import com.example.skripsi.models.*;
import com.example.skripsi.models.inbox.*;
public interface IInboxService {
    CursorPageResponse<InboxPreviewResponse> getUserInboxPreview(Long cursor, int limit);
    long getUnreadCount();
    void markRead(Long inboxId);
    int markAllRead();
}
