package com.petalio.blossom.network;

public class CustomerRegisterRequest {
    private String name;
    private String email;
    private String password;
    private String phone;
    private String address;
    private String city;

    public CustomerRegisterRequest(String name, String email, String password, String phone, String address, String city) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.address = address;
        this.city = city;
    }
}

