package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;

public class SupplierProfileUpdateRequest {
    @SerializedName("supplier_name")
    private String supplierName;

    @SerializedName("contact_person")
    private String contactPerson;

    @SerializedName("phone")
    private String phone;

    @SerializedName("city")
    private String city;

    @SerializedName("address")
    private String address;

    @SerializedName("monthly_capacity")
    private Integer monthlyCapacity;

    public SupplierProfileUpdateRequest(String supplierName, String contactPerson, String phone, String city, String address, Integer monthlyCapacity) {
        this.supplierName = supplierName;
        this.contactPerson = contactPerson;
        this.phone = phone;
        this.city = city;
        this.address = address;
        this.monthlyCapacity = monthlyCapacity;
    }
}
