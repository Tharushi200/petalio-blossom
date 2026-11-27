package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;

@SuppressWarnings("unused")
public class UserDto {
    private int user_id;
    @SerializedName(value = "name", alternate = {"full_name", "customer_name"})
    private String name;
    private String email;
    @SerializedName(value = "phone", alternate = {"contact_number"})
    private String phone;
    private String role;
    private String status;

    // Customer specific fields
    private Integer customer_id;
    private String address;
    private String city;
    @SerializedName(value = "saved_addresses_count")
    private Integer saved_addresses_count;

    // Supplier specific fields
    private Integer supplier_id;
    private String supplier_code;
    private String supplier_name;
    private Integer is_approved;
    private String approval_status;
    private Integer monthly_capacity;

    // Dynamic stats
    @SerializedName(value = "total_orders", alternate = {"order_count"})
    private Integer total_orders;

    @SerializedName(value = "total_spend", alternate = {"total_spent"})
    private Double total_spend;

    @SerializedName(value = "loyalty_points", alternate = {"points"})
    private Integer loyalty_points;

    @SerializedName(value = "wallet_credits", alternate = {"wallet_balance"})
    private Integer wallet_credits;

    public int getUserId() {
        return user_id;
    }

    public void setUserId(int user_id) {
        this.user_id = user_id;
    }

    public String getName() {
        return name != null ? name : "";
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email != null ? email : "";
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone != null ? phone : "";
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role != null ? role : "CUSTOMER";
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status != null ? status : "ACTIVE";
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAddress() {
        return address != null ? address : "";
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city != null ? city : "";
    }

    public void setCity(String city) {
        this.city = city;
    }

    public int getSavedAddressesCount() {
        if (saved_addresses_count != null) return saved_addresses_count;
        return getAddress().trim().isEmpty() ? 0 : 1;
    }

    public void setSavedAddressesCount(Integer saved_addresses_count) {
        this.saved_addresses_count = saved_addresses_count;
    }

    public Integer getCustomerId() {
        return customer_id;
    }

    public void setCustomerId(Integer customer_id) {
        this.customer_id = customer_id;
    }

    public Integer getSupplierId() {
        return supplier_id;
    }

    public void setSupplierId(Integer supplier_id) {
        this.supplier_id = supplier_id;
    }

    public String getSupplierCode() {
        return supplier_code != null ? supplier_code : "";
    }

    public void setSupplierCode(String supplier_code) {
        this.supplier_code = supplier_code;
    }

    public String getSupplierName() {
        return supplier_name;
    }

    public void setSupplierName(String supplier_name) {
        this.supplier_name = supplier_name;
    }

    public Integer getMonthlyCapacity() {
        return monthly_capacity;
    }

    public void setMonthlyCapacity(Integer monthly_capacity) {
        this.monthly_capacity = monthly_capacity;
    }

    public boolean isApproved() {
        return is_approved != null && is_approved == 1;
    }

    public void setIsApproved(Integer is_approved) {
        this.is_approved = is_approved;
    }

    public String getApprovalStatus() {
        if (approval_status != null && !approval_status.trim().isEmpty()) {
            return approval_status;
        }
        return isApproved() ? "Approved" : "Pending";
    }

    public void setApprovalStatus(String approval_status) {
        this.approval_status = approval_status;
    }

    public int getTotalOrders() {
        return total_orders != null ? total_orders : 0;
    }

    public void setTotalOrders(Integer total_orders) {
        this.total_orders = total_orders;
    }

    public double getTotalSpend() {
        return total_spend != null ? total_spend : 0.0;
    }

    public void setTotalSpend(Double total_spend) {
        this.total_spend = total_spend;
    }

    public int getLoyaltyPoints() {
        if (loyalty_points != null) return loyalty_points;
        return getTotalOrders() * 50;
    }

    public void setLoyaltyPoints(Integer loyalty_points) {
        this.loyalty_points = loyalty_points;
    }

    public int getWalletCredits() {
        return wallet_credits != null ? wallet_credits : 0;
    }

    public void setWalletCredits(Integer wallet_credits) {
        this.wallet_credits = wallet_credits;
    }
}
