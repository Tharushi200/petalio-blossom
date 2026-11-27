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

    public SupplierRegisterRequest(String farmName, String contactPerson, String password, String phone, String farmLocation, String email, String supplierId) {
        this.farmName = farmName;
        this.contactPerson = contactPerson;
        this.password = password;
        this.phone = phone;
        this.farmLocation = farmLocation;
        this.email = email;
        this.supplierId = supplierId;
        this.role = "SUPPLIER";
    }

    public String getFarmName() { return farmName; }
    public String getContactPerson() { return contactPerson; }
    public String getPhone() { return phone; }
    public String getFarmLocation() { return farmLocation; }
    public String getEmail() { return email; }
    public String getSupplierId() { return supplierId; }
    public String getRole() { return role; }
}

