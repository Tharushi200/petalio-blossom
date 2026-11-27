package com.petalio.blossom.network;

public class CustomerRegisterRequest {
    private String name;
    private String email;
    private String password;
    private String phone;
    private String address;
    private String city;
    private String role = "CUSTOMER";

    public CustomerRegisterRequest(String name, String email, String password, String phone, String address, String city) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.address = address;
        this.city = city;
        this.role = "CUSTOMER";
    }

    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public String getCity() { return city; }
    public String getRole() { return role; }
}

