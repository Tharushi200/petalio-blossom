package com.petalio.blossom.network;

public class OrderSummaryDto {
    private int order_id;
    private String order_code;
    private String order_date;
    private String delivery_address;
    private String status;
    private double total_amount;
    private String items_summary;
    private String delivery_code;
    private String delivery_status;
    private String vehicle_number;
    private String driver_name;
    private String driver_phone;
    private String delivery_date;
    private String fulfilment_status;

    public int getOrderId() { return order_id; }
    public String getOrderCode() { return order_code != null ? order_code : ""; }
    public String getOrderDate() { return order_date != null ? order_date : ""; }
    public String getDeliveryAddress() { return delivery_address != null ? delivery_address : ""; }
    public String getStatus() { return status != null ? status : "PENDING"; }
    public double getTotalAmount() { return total_amount; }
    public String getItemsSummary() { return items_summary != null ? items_summary : ""; }
    public String getDeliveryCode() { return delivery_code != null ? delivery_code : ""; }
    public String getDeliveryStatus() { return delivery_status != null ? delivery_status : "IN_TRANSIT"; }
    public String getVehicleNumber() { return vehicle_number != null ? vehicle_number : ""; }
    public String getDriverName() { return driver_name != null ? driver_name : ""; }
    public String getDriverPhone() { return driver_phone != null ? driver_phone : ""; }
    public String getDeliveryDate() { return delivery_date != null ? delivery_date : ""; }
    public String getFulfilmentStatus() { return fulfilment_status != null ? fulfilment_status : ""; }
}

