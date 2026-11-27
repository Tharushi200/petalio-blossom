package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;

public class SupplierStatusResponse {
    private boolean success;

    @SerializedName("supplier_id")
    private int supplierId;

    @SerializedName("supplier_name")
    private String supplierName;

    @SerializedName("farm_name")
    private String farmName;

    private String city;

    @SerializedName("monthly_capacity")
    private int monthlyCapacity;

    @SerializedName("is_approved")
    private int isApproved;

    private String status;

    public boolean isSuccess() { return success; }
    public int getSupplierId() { return supplierId; }
    public String getSupplierName() { return supplierName != null ? supplierName : ""; }
    public String getFarmName() { return farmName != null ? farmName : ""; }
    public String getCity() { return city != null ? city : ""; }
    public int getMonthlyCapacity() { return monthlyCapacity; }
    public boolean isApproved() { return isApproved == 1; }
    public String getStatus() { return status != null ? status : "Pending"; }
}
