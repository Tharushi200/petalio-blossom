package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;

public class SupplierStatusResponse {
    private boolean success;

    @SerializedName(value = "user_id", alternate = {"id"})
    private int userId;

    @SerializedName("supplier_id")
    private int supplierId;

    @SerializedName("supplier_code")
    private String supplierCode;

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
    public int getUserId() { return userId > 0 ? userId : supplierId; }
    public int getSupplierId() { return supplierId > 0 ? supplierId : userId; }
    public String getSupplierCode() { return supplierCode != null ? supplierCode : ""; }
    public String getSupplierName() { return supplierName != null ? supplierName : ""; }
    public String getFarmName() { return farmName != null ? farmName : ""; }
    public String getCity() { return city != null ? city : ""; }
    public int getMonthlyCapacity() { return monthlyCapacity; }
    public boolean isApproved() {
        if (isApproved == 1) return true;
        if (status != null) {
            String s = status.trim().toUpperCase();
            return "APPROVED".equals(s) || "ACTIVE".equals(s) || "1".equals(s);
        }
        return false;
    }
    public String getStatus() { return status != null ? status : (isApproved() ? "APPROVED" : "Pending"); }
}
