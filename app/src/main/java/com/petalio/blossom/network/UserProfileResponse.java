package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;

public class UserProfileResponse {
    private boolean success;
    private String message;
    @SerializedName(value = "user", alternate = {"profile"})
    private UserDto user;

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public UserDto getUser() { return user; }
}
