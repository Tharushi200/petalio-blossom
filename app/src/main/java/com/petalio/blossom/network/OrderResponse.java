package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;

public class OrderResponse {
    private boolean success;
    private String message;
    private int order_id;
    private String order_code;
    private double total_amount;
    private String status;

    @SerializedName("tracking")
    private TrackingData tracking;

    public static class TrackingData {
        public String delivery_code;
        public String status;
        public String delivery_date;
        public String driver_name;
        public String driver_phone;
        public String vehicle_number;
    }

    public boolean isSuccess() { return success; }
    public String getMessage() { return message != null ? message : ""; }
    public int getOrderId() { return order_id; }
    public String getOrderCode() { return order_code != null ? order_code : ""; }
    public double getTotalAmount() { return total_amount; }
    public String getStatus() { return status != null ? status : "PENDING"; }
    public TrackingData getTracking() { return tracking; }
}
