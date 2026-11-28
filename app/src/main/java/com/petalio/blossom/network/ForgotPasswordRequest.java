package com.petalio.blossom.network;

/**
 * Request body for POST /api/auth/forgot-password
 */
public class ForgotPasswordRequest {
    private String email;

    public ForgotPasswordRequest(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}
