package com.petalio.blossom.network;

public class OrderItemRequest {
    private int flower_id;
    private int quantity;
    private double price;

    public OrderItemRequest(int flower_id, int quantity, double price) {
        this.flower_id = flower_id;
        this.quantity = quantity;
        this.price = price;
    }
}

