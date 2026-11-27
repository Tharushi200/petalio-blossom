package com.petalio.blossom.network;

public class NotificationDto {
    private int notification_id;
    private Integer order_id;
    private Integer user_id;
    private String title;
    private String message;
    private String status;
    private String created_at;

    public int getNotificationId() { return notification_id; }
    public Integer getOrderId() { return order_id; }
    public Integer getUserId() { return user_id; }
    public String getTitle() { return title != null ? title : "Notification"; }
    public String getMessage() { return message != null ? message : ""; }
    public String getStatus() { return status != null ? status : "READ"; }
    public String getCreatedAt() { return created_at != null ? created_at : ""; }
}
