package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;

public class SupplierOrderDto {
    @SerializedName("order_id")
    private int orderId;

    @SerializedName("order_code")
    private String orderCode;

    @SerializedName("customer_id")
    private int customerId;

    @SerializedName("customer_name")
    private String customerName;

    @SerializedName("customer_phone")
    private String customerPhone;

    @SerializedName("delivery_address")
    private String deliveryAddress;

    @SerializedName("delivery_city")
    private String deliveryCity;

    private String status;

    @SerializedName("fulfilment_status")
    private String fulfilmentStatus;

    @SerializedName("created_at")
    private String createdAt;

    @SerializedName("total_quantity")
    private int totalQuantity;

    @SerializedName("total_amount")
    private double totalAmount;

    @SerializedName("flower_summary")
    private String flowerSummary;

    public int getOrderId() { return orderId; }
    public String getOrderCode() { return orderCode != null ? orderCode : ("#PB-" + orderId); }
    public int getCustomerId() { return customerId; }
    public String getCustomerName() { return customerName != null ? customerName : "Customer"; }
    public String getCustomerPhone() { return customerPhone != null ? customerPhone : ""; }
    public String getDeliveryAddress() { return deliveryAddress != null ? deliveryAddress : ""; }
    public String getDeliveryCity() { return deliveryCity != null ? deliveryCity : ""; }
    public String getStatus() { return status != null ? status : "PENDING"; }
    public String getFulfilmentStatus() { return fulfilmentStatus != null ? fulfilmentStatus : "Pending"; }
    public String getCreatedAt() { return createdAt != null ? createdAt : ""; }
    public int getTotalQuantity() { return Math.max(0, totalQuantity); }
    public double getTotalAmount() { return totalAmount; }
    public String getFlowerSummary() { return flowerSummary != null ? flowerSummary : ""; }
}
