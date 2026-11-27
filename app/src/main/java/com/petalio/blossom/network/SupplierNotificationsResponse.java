package com.petalio.blossom.network;

import java.util.List;

public class SupplierNotificationsResponse {
    private boolean success;
    private int count;
    private List<SupplierNotificationDto> notifications;

    public boolean isSuccess() { return success; }
    public int getCount() { return count; }
    public List<SupplierNotificationDto> getNotifications() { return notifications; }
}
