package com.petalio.blossom.network;

public class LoginRequest {
    private String email;
    private String identifier;
    private String username;
    private String password;
    private String role;

    public LoginRequest(String email, String role) {
        this.email = email;
        this.identifier = email;
        this.username = email;
        this.password = "";
        this.role = role;
    }

    public LoginRequest(String email, String password, String role) {
        this.email = email;
        this.identifier = email;
        this.username = email;
        this.password = password;
        this.role = role;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) {
        this.email = email;
        this.identifier = email;
        this.username = email;
    }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}

