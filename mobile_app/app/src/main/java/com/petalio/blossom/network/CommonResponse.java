package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;

public class CommonResponse {
    private boolean success;
    private String message;

    @SerializedName(value = "user_id", alternate = {"userId"})
    private Integer userId;

    @SerializedName(value = "customer_id", alternate = {"customerId"})
    private Integer customerId;

    @SerializedName(value = "supplier_id", alternate = {"supplierId"})
    private String supplierId;

    public boolean isSuccess() { return success; }
    public String getMessage() { return message != null ? message : ""; }
    public Integer getUserId() { return userId; }
    public Integer getCustomerId() { return customerId; }
    public String getSupplierId() { return supplierId; }
}

