package com.petalio.blossom.network;

import java.util.List;

public class OrderRequest {
    private int customer_id;
    private String delivery_address;
    private String delivery_city;
    private String payment_method;
    private String order_code;
    private List<OrderItemRequest> items;

    public OrderRequest(int customer_id, String delivery_address, String delivery_city, String payment_method, List<OrderItemRequest> items) {
        this(customer_id, delivery_address, delivery_city, payment_method, null, items);
    }

    public OrderRequest(int customer_id, String delivery_address, String delivery_city, String payment_method, String order_code, List<OrderItemRequest> items) {
        this.customer_id = customer_id;
        this.delivery_address = delivery_address;
        this.delivery_city = delivery_city;
        this.payment_method = payment_method;
        this.order_code = order_code;
        this.items = items;
    }

    public String getOrderCode() { return order_code; }
    public void setOrderCode(String order_code) { this.order_code = order_code; }
}
