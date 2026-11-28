package com.petalio.blossom.network;

import java.util.List;

public class NotificationsResponse {
    private boolean success;
    private List<NotificationDto> notifications;

    public boolean isSuccess() { return success; }
    public List<NotificationDto> getNotifications() { return notifications; }
}
