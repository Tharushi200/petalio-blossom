package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;
import java.util.Collections;
import java.util.List;

public class WishlistResponse {
    private boolean success;
    private int count;

    private List<FlowerDto> flowers;

    @SerializedName(value = "flower_ids", alternate = {"flowerIds"})
    private List<Integer> flowerIds;

    @SerializedName(value = "flower_names", alternate = {"flowerNames"})
    private List<String> flowerNames;

    public boolean isSuccess() { return success; }
    public int getCount() { return count; }
    public List<FlowerDto> getFlowers() { return flowers != null ? flowers : Collections.emptyList(); }
    public List<Integer> getFlowerIds() { return flowerIds != null ? flowerIds : Collections.emptyList(); }
    public List<String> getFlowerNames() { return flowerNames != null ? flowerNames : Collections.emptyList(); }
}
