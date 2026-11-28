package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;

public class DeclaredFlowerDto {
    private int id;

    @SerializedName("supplier_user_id")
    private int supplierUserId;

    @SerializedName("flower_id")
    private int flowerId;

    @SerializedName("flower_name")
    private String flowerName;

    @SerializedName("supply_capacity")
    private int supplyCapacity;

    @SerializedName("unit_price")
    private double unitPrice;

    private String category;

    @SerializedName("updated_at")
    private String updatedAt;

    public int getId() {
        return id;
    }

    public int getSupplierUserId() {
        return supplierUserId;
    }

    public int getFlowerId() {
        return flowerId;
    }

    public String getFlowerName() {
        return flowerName != null ? flowerName : "";
    }

    public int getSupplyCapacity() {
        return Math.max(0, supplyCapacity);
    }

    public double getUnitPrice() {
        return unitPrice;
    }

    public String getCategory() {
        return category != null ? category : "";
    }

    public String getUpdatedAt() {
        return updatedAt != null ? updatedAt : "";
    }
}
