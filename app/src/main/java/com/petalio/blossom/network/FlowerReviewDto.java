package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;

/**
 * Customer review DTO returned by GET /api/flowers/:id.
 */
public class FlowerReviewDto {
    private int review_id;
    private int order_id;
    private int customer_id;
    private int flower_id;
    private String reviewer_name;
    private int rating;
    private String comment;

    @SerializedName(value = "created_at", alternate = {"review_date"})
    private String created_at;

    public int getReviewId() { return review_id; }
    public int getOrderId() { return order_id; }
    public int getCustomerId() { return customer_id; }
    public int getFlowerId() { return flower_id; }
    public String getReviewerName() {
        return (reviewer_name != null && !reviewer_name.trim().isEmpty())
                ? reviewer_name.trim()
                : "Verified Buyer";
    }
    public int getRating() { return Math.max(1, Math.min(5, rating > 0 ? rating : 5)); }
    public String getComment() { return comment != null ? comment.trim() : ""; }
    public String getCreatedAt() { return created_at != null ? created_at : ""; }
}
