package com.petalio.blossom.network;

import java.util.Collections;
import java.util.List;

public class SingleFlowerResponse {
    private boolean success;
    private FlowerDto flower;
    private List<FlowerReviewDto> reviews;

    public boolean isSuccess() { return success; }
    public FlowerDto getFlower() { return flower; }
    public List<FlowerReviewDto> getReviews() {
        if (reviews != null) return reviews;
        if (flower != null && flower.getReviews() != null) return flower.getReviews();
        return Collections.emptyList();
    }
}

