package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;

public class DeclareFlowerRequest {
    @SerializedName("supplier_id")
    private int supplierId;

    @SerializedName("flower_id")
    private Integer flowerId;

    @SerializedName("flower_name")
    private String flowerName;

    @SerializedName("supply_price")
    private Double supplyPrice;

    private Integer capacity;

    @SerializedName("supply_capacity")
    private Integer supplyCapacity;

    public DeclareFlowerRequest(int supplierId, String flowerName, Integer capacity, Double supplyPrice) {
        this.supplierId = supplierId;
        this.flowerName = flowerName;
        this.capacity = capacity;
        this.supplyCapacity = capacity;
        this.supplyPrice = supplyPrice;
    }

    public DeclareFlowerRequest(int supplierId, Integer flowerId, String flowerName, Integer capacity, Double supplyPrice) {
        this.supplierId = supplierId;
        this.flowerId = flowerId;
        this.flowerName = flowerName;
        this.capacity = capacity;
        this.supplyCapacity = capacity;
        this.supplyPrice = supplyPrice;
    }

    public int getSupplierId() { return supplierId; }
    public Integer getFlowerId() { return flowerId; }
    public String getFlowerName() { return flowerName; }
    public Double getSupplyPrice() { return supplyPrice; }
    public Integer getCapacity() { return capacity; }
    public Integer getSupplyCapacity() { return supplyCapacity; }
}
