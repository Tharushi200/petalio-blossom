package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;

public class ResetPasswordRequest {
    private String email;
    private String phone;
    private String token;

    @SerializedName("new_password")
    private String newPassword;

    public ResetPasswordRequest(String token, String newPassword) {
        this.token = token;
        this.newPassword = newPassword;
    }

    public ResetPasswordRequest(String email, String phone, String newPassword) {
        this.email = email;
        this.phone = phone;
        this.newPassword = newPassword;
    }

    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getToken() { return token; }
    public String getNewPassword() { return newPassword; }
}
