package com.petalio.blossom.network;

public class SupplierRegisterRequest {
    private String farmName;
    private String contactPerson;
    private String password;
    private String phone;
    private String farmLocation;
    private String email;
    private String supplierId;
    private String role = "SUPPLIER";
    private String district;
    private String address;
    private Integer monthly_capacity;

    public SupplierRegisterRequest(String farmName, String contactPerson, String password, String phone, String farmLocation, String email, String supplierId) {
        this.farmName = farmName;
        this.contactPerson = contactPerson;
        this.password = password;
        this.phone = phone;
        this.farmLocation = farmLocation;
        this.email = email;
        this.supplierId = supplierId;
        this.role = "SUPPLIER";
        this.district = farmLocation;
        this.address = farmLocation;
        this.monthly_capacity = 0;
    }

    public SupplierRegisterRequest(String farmName, String contactPerson, String password, String phone, String farmLocation, String district, String address, Integer monthlyCapacity, String email, String supplierId) {
        this.farmName = farmName;
        this.contactPerson = contactPerson;
        this.password = password;
        this.phone = phone;
        this.farmLocation = farmLocation;
        this.district = district;
        this.address = address;
        this.monthly_capacity = monthlyCapacity;
        this.email = email;
        this.supplierId = supplierId;
        this.role = "SUPPLIER";
    }

    public String getFarmName() { return farmName; }
    public String getContactPerson() { return contactPerson; }
    public String getPhone() { return phone; }
    public String getFarmLocation() { return farmLocation; }
    public String getDistrict() { return district; }
    public String getAddress() { return address; }
    public Integer getMonthly_capacity() { return monthly_capacity; }
    public String getEmail() { return email; }
    public String getSupplierId() { return supplierId; }
    public String getRole() { return role; }
}
