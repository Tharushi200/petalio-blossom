package com.petalio.blossom.network;

public class LoginResponse {
    private boolean success;
    private String message;
    private UserDto user;

    public boolean isSuccess() { return success; }
    public String getMessage() { return message != null ? message : ""; }
    public UserDto getUser() { return user; }
}

