package com.petalio.blossom.network;

import java.util.Collections;
import java.util.List;

public class FlowerDto {
    private int flower_id;
    private String name;
    private String category;
    private String color;
    private double unit_price;
    private String image_url;
    private String description;
    private int stock_quantity;
    private int reorder_level;
    private int sold_count;
    private double avg_rating;
    private int review_count;
    private String created_at;
    private List<FlowerReviewDto> reviews;

    public int getFlowerId() { return flower_id; }
    public String getName() { return name != null ? name : "Flower"; }
    public String getCategory() { return category != null ? category : "General"; }
    public String getColor() { return color != null ? color : ""; }
    public double getUnitPrice() { return unit_price; }
    public String getImageUrl() { return image_url; }
    public String getDescription() { return description != null ? description : ""; }
    public int getStockQuantity() { return stock_quantity; }
    public int getReorderLevel() { return reorder_level > 0 ? reorder_level : 30; }

    public int getSoldCount() { return sold_count; }
    public void setSoldCount(int sold_count) { this.sold_count = sold_count; }

    public double getAvgRating() { return (review_count > 0 && avg_rating > 0) ? avg_rating : 0.0; }
    public void setAvgRating(double avg_rating) { this.avg_rating = avg_rating; }

    public int getReviewCount() { return review_count; }
    public void setReviewCount(int review_count) { this.review_count = review_count; }

    public String getCreatedAt() { return created_at != null ? created_at : ""; }
    public void setCreatedAt(String created_at) { this.created_at = created_at; }

    public List<FlowerReviewDto> getReviews() {
        return reviews != null ? reviews : Collections.emptyList();
    }
}
