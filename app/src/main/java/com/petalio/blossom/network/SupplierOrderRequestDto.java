package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;

public class SupplierOrderRequestDto {
    @SerializedName("place_order_id")
    private int placeOrderId;

    @SerializedName("inventory_id")
    private int inventoryId;

    private int quantity;

    @SerializedName("unit_price")
    private double unitPrice;

    @SerializedName("order_date")
    private String orderDate;

    private String status;

    @SerializedName("flower_id")
    private int flowerId;

    @SerializedName("flower_name")
    private String flowerName;

    private String category;
    private String color;

    @SerializedName("image_url")
    private String imageUrl;

    public int getPlaceOrderId() { return placeOrderId; }
    public int getInventoryId() { return inventoryId; }
    public int getQuantity() { return quantity; }
    public double getUnitPrice() { return unitPrice; }
    public String getOrderDate() { return orderDate != null ? orderDate : ""; }
    public String getStatus() { return status != null ? status : "PENDING"; }
    public int getFlowerId() { return flowerId; }
    public String getFlowerName() { return flowerName != null ? flowerName : "Flower"; }
    public String getCategory() { return category != null ? category : ""; }
    public String getColor() { return color != null ? color : ""; }
    public String getImageUrl() { return imageUrl; }
}
