package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;

public class WishlistRequest {
    @SerializedName(value = "user_id", alternate = {"userId", "customer_id"})
    private int userId;

    @SerializedName(value = "flower_id", alternate = {"flowerId", "id"})
    private int flowerId;

    @SerializedName(value = "flower_name", alternate = {"flowerName", "name"})
    private String flowerName;

    @SerializedName(value = "is_favorite", alternate = {"isFavorite"})
    private boolean isFavorite;

    public WishlistRequest(int userId, int flowerId, String flowerName, boolean isFavorite) {
        this.userId = userId;
        this.flowerId = flowerId;
        this.flowerName = flowerName;
        this.isFavorite = isFavorite;
    }

    public WishlistRequest(int userId, String flowerName, boolean isFavorite) {
        this(userId, 0, flowerName, isFavorite);
    }

    public int getUserId() { return userId; }
    public int getFlowerId() { return flowerId; }
    public String getFlowerName() { return flowerName != null ? flowerName : ""; }
    public boolean isFavorite() { return isFavorite; }
}
