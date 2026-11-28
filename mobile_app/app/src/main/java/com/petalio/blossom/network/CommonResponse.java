package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;

public class CommonResponse {
    private boolean success;
    private String message;

    @SerializedName(value = "user_id", alternate = {"userId", "id"})
    private Integer userId;

    @SerializedName(value = "customer_id", alternate = {"customerId"})
    private Integer customerId;

    @SerializedName(value = "supplier_id", alternate = {"supplierId"})
    private String supplierId;

    private String role;
    private String status;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String city;

    public boolean isSuccess() { return success; }
    public String getMessage() { return message != null ? message : ""; }
    public Integer getUserId() { return userId; }
    public Integer getCustomerId() { return customerId != null ? customerId : userId; }
    public String getSupplierId() { return supplierId; }
    public String getRole() { return role != null ? role : ""; }
    public String getStatus() { return status != null ? status : ""; }
    public String getName() { return name != null ? name : ""; }
    public String getEmail() { return email != null ? email : ""; }
    public String getPhone() { return phone != null ? phone : ""; }
    public String getAddress() { return address != null ? address : ""; }
    public String getCity() { return city != null ? city : ""; }
}

