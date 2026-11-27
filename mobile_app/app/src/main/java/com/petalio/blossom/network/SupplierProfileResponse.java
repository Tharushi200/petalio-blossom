package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;

public class SupplierProfileResponse {
    private boolean success;
    private SupplierProfileDto profile;

    public boolean isSuccess() { return success; }
    public SupplierProfileDto getProfile() { return profile; }

    public static class SupplierProfileDto {
        @SerializedName("user_id")
        private int userId;

        @SerializedName("supplier_id")
        private int supplierId;

        @SerializedName("supplier_code")
        private String supplierCode;

        @SerializedName("supplier_name")
        private String supplierName;

        @SerializedName("contact_person")
        private String contactPerson;

        @SerializedName("email")
        private String email;

        @SerializedName("phone")
        private String phone;

        @SerializedName("city")
        private String city;

        @SerializedName("address")
        private String address;

        @SerializedName("is_approved")
        private boolean isApproved;

        @SerializedName("status")
        private String status;

        @SerializedName("monthly_capacity")
        private int monthlyCapacity;

        @SerializedName("total_payouts")
        private double totalPayouts;

        @SerializedName("total_payouts_formatted")
        private String totalPayoutsFormatted;

        @SerializedName("active_orders")
        private int activeOrders;

        @SerializedName("supplied_varieties")
        private int suppliedVarieties;

        public int getUserId() { return userId; }
        public int getSupplierId() { return supplierId; }
        public String getSupplierCode() { return supplierCode != null ? supplierCode : ""; }
        public String getSupplierName() { return supplierName != null ? supplierName : ""; }
        public String getContactPerson() { return contactPerson != null ? contactPerson : ""; }
        public String getEmail() { return email != null ? email : ""; }
        public String getPhone() { return phone != null ? phone : ""; }
        public String getCity() { return city != null ? city : ""; }
        public String getAddress() { return address != null ? address : ""; }
        public boolean isApproved() { return isApproved; }
        public String getStatus() { return status != null ? status : (isApproved ? "Approved" : "Pending"); }
        public int getMonthlyCapacity() { return monthlyCapacity; }
        public double getTotalPayouts() { return totalPayouts; }
        public String getTotalPayoutsFormatted() { return totalPayoutsFormatted != null ? totalPayoutsFormatted : "Rs. " + (int) totalPayouts; }
        public int getActiveOrders() { return activeOrders; }
        public int getSuppliedVarieties() { return suppliedVarieties; }
    }
}
