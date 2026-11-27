package com.petalio.blossom.network;

public class ChangePasswordRequest {
    private int user_id;
    private String current_password;
    private String new_password;

    public ChangePasswordRequest(int user_id, String current_password, String new_password) {
        this.user_id = user_id;
        this.current_password = current_password;
        this.new_password = new_password;
    }

    public int getUserId() { return user_id; }
    public String getCurrentPassword() { return current_password; }
    public String getNewPassword() { return new_password; }
}
