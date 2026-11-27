package com.petalio.blossom.network;

public class OrderResponse {
    private boolean success;
    private String message;
    private int order_id;
    private String order_code;
    private double total_amount;
    private String status;

    public boolean isSuccess() { return success; }
    public String getMessage() { return message != null ? message : ""; }
    public int getOrderId() { return order_id; }
    public String getOrderCode() { return order_code != null ? order_code : ""; }
    public double getTotalAmount() { return total_amount; }
    public String getStatus() { return status != null ? status : "PENDING"; }
}

