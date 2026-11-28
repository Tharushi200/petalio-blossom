package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;

public class RedeemPointsResponse {
    private boolean success;
    private String message;
    @SerializedName(value = "points", alternate = {"loyalty_points"})
    private Integer points;
    @SerializedName(value = "wallet_balance", alternate = {"wallet_credits"})
    private Integer wallet_balance;
    @SerializedName("points_needed")
    private Integer points_needed;
    @SerializedName("available_points")
    private Integer available_points;

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message != null ? message : "";
    }

    public int getPoints() {
        return points != null ? points : 0;
    }

    public int getWalletBalance() {
        return wallet_balance != null ? wallet_balance : 0;
    }

    public int getPointsNeeded() {
        return points_needed != null ? points_needed : 0;
    }

    public int getAvailablePoints() {
        return available_points != null ? available_points : 0;
    }
}
