package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;

public class SupplierNotificationDto {
    private String id;
    private String type;
    private String badge;
    private String title;
    private String subtitle;

    @SerializedName("action_hint")
    private String actionHint;

    @SerializedName("order_id")
    private Integer orderId;

    @SerializedName(value = "order_number", alternate = {"order_code"})
    private String orderNumber;

    @SerializedName("items_summary")
    private String itemsSummary;

    @SerializedName("total_quantity")
    private int totalQuantity;

    @SerializedName("total_amount")
    private double totalAmount;

    @SerializedName("amount_formatted")
    private String amountFormatted;

    @SerializedName("customer_name")
    private String customerName;

    @SerializedName("delivery_address")
    private String deliveryAddress;

    @SerializedName("delivery_date")
    private String deliveryDate;

    private String status;

    @SerializedName("flower_id")
    private Integer flowerId;

    @SerializedName("flower_name")
    private String flowerName;

    @SerializedName("stock_quantity")
    private Integer stockQuantity;

    @SerializedName("reorder_level")
    private Integer reorderLevel;

    @SerializedName("payment_method")
    private String paymentMethod;

    @SerializedName("payment_date")
    private String paymentDate;

    @SerializedName("created_at")
    private String createdAt;

    public String getId() { return id != null ? id : ""; }
    public String getType() { return type != null ? type : ""; }
    public String getBadge() { return badge != null ? badge : ""; }
    public String getTitle() { return title != null ? title : ""; }
    public String getSubtitle() { return subtitle != null ? subtitle : ""; }
    public String getActionHint() { return actionHint != null ? actionHint : ""; }
    public Integer getOrderId() { return orderId; }
    public String getOrderNumber() { return orderNumber != null ? orderNumber : ""; }
    public String getItemsSummary() { return itemsSummary != null ? itemsSummary : ""; }
    public int getTotalQuantity() { return Math.max(0, totalQuantity); }
    public double getTotalAmount() { return totalAmount; }
    public String getAmountFormatted() { return amountFormatted != null ? amountFormatted : ""; }
    public String getCustomerName() { return customerName != null ? customerName : ""; }
    public String getDeliveryAddress() { return deliveryAddress != null ? deliveryAddress : ""; }
    public String getDeliveryDate() { return deliveryDate != null ? deliveryDate : ""; }
    public String getStatus() { return status != null ? status : ""; }
    public Integer getFlowerId() { return flowerId; }
    public String getFlowerName() { return flowerName != null ? flowerName : ""; }
    public Integer getStockQuantity() { return stockQuantity; }
    public Integer getReorderLevel() { return reorderLevel; }
    public String getPaymentMethod() { return paymentMethod != null ? paymentMethod : ""; }
    public String getPaymentDate() { return paymentDate != null ? paymentDate : ""; }
    public String getCreatedAt() { return createdAt != null ? createdAt : ""; }
}
