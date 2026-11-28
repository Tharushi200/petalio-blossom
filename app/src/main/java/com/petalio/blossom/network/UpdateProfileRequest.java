package com.petalio.blossom.network;

public class UpdateProfileRequest {
    private String name;
    private String phone;
    private String address;
    private String city;

    public UpdateProfileRequest(String name, String phone, String address, String city) {
        this.name = name;
        this.phone = phone;
        this.address = address;
        this.city = city;
    }

    public String getName() { return name; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public String getCity() { return city; }
}
