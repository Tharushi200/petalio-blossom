package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;

public class HarvestFulfilmentRequest {
    @SerializedName("place_order_id")
    private int placeOrderId;

    @SerializedName("harvested_qty")
    private int harvestedQty;

    private String notes;
    private String status;

    public HarvestFulfilmentRequest(int placeOrderId, int harvestedQty, String notes, String status) {
        this.placeOrderId = placeOrderId;
        this.harvestedQty = harvestedQty;
        this.notes = notes;
        this.status = status;
    }

    public int getPlaceOrderId() { return placeOrderId; }
    public int getHarvestedQty() { return harvestedQty; }
    public String getNotes() { return notes; }
    public String getStatus() { return status; }
}
