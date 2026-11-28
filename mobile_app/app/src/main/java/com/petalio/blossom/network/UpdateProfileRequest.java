package com.petalio.blossom.network;

public class UpdateProfileRequest {
    private Integer user_id;
    private String name;
    private String phone;
    private String address;
    private String city;

    public UpdateProfileRequest(String name, String phone, String address, String city) {
        this(null, name, phone, address, city);
    }

    public UpdateProfileRequest(Integer userId, String name, String phone, String address, String city) {
        this.user_id = userId;
        this.name = name;
        this.phone = phone;
        this.address = address;
        this.city = city;
    }

    public Integer getUserId() { return user_id; }
    public String getName() { return name; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public String getCity() { return city; }
}
