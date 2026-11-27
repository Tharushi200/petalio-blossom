package com.petalio.blossom.network;

public class ReviewRequest {
    private int order_id;
    private String order_code;
    private int customer_id;
    private int flower_id;
    private int rating;
    private String comment;

    public ReviewRequest(int order_id, int customer_id, int flower_id, int rating, String comment) {
        this(order_id, null, customer_id, flower_id, rating, comment);
    }

    public ReviewRequest(int order_id, String order_code, int customer_id, int flower_id, int rating, String comment) {
        this.order_id = order_id;
        this.order_code = order_code;
        this.customer_id = customer_id;
        this.flower_id = flower_id;
        this.rating = rating;
        this.comment = comment;
    }
}

