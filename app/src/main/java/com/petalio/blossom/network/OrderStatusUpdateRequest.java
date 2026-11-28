package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;

public class OrderStatusUpdateRequest {
    private String status;

    @SerializedName("fulfilment_status")
    private String fulfilmentStatus;

    public OrderStatusUpdateRequest(String status) {
        this.status = status;
        this.fulfilmentStatus = status;
    }

    public OrderStatusUpdateRequest(String status, String fulfilmentStatus) {
        this.status = status;
        this.fulfilmentStatus = fulfilmentStatus;
    }

    public String getStatus() { return status; }
    public String getFulfilmentStatus() { return fulfilmentStatus; }
}
