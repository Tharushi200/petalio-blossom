package com.petalio.blossom.network;

import java.util.List;

public class OrderRequest {
    private int customer_id;
    private int user_id;
    private String delivery_address;
    private String delivery_city;
    private String payment_method;
    private String payment_reference;
    private String delivery_date;
    private double total_amount;
    private String order_code;
    private List<OrderItemRequest> items;

    public OrderRequest(int customer_id, String delivery_address, String delivery_city, String payment_method, List<OrderItemRequest> items) {
        this(customer_id, delivery_address, delivery_city, payment_method, null, items);
    }

    public OrderRequest(int customer_id, String delivery_address, String delivery_city, String payment_method, String order_code, List<OrderItemRequest> items) {
        this(customer_id, customer_id, delivery_address, delivery_city, payment_method, null, null, 0.0, order_code, items);
    }

    public OrderRequest(int customer_id, int user_id, String delivery_address, String delivery_city,
                        String payment_method, String payment_reference, String delivery_date,
                        double total_amount, String order_code, List<OrderItemRequest> items) {
        this.customer_id = customer_id;
        this.user_id = user_id;
        this.delivery_address = delivery_address;
        this.delivery_city = delivery_city;
        this.payment_method = payment_method;
        this.payment_reference = payment_reference;
        this.delivery_date = delivery_date;
        this.total_amount = total_amount;
        this.order_code = order_code;
        this.items = items;
    }

    public String getOrderCode() { return order_code; }
    public void setOrderCode(String order_code) { this.order_code = order_code; }
    public String getPaymentReference() { return payment_reference; }
    public void setPaymentReference(String payment_reference) { this.payment_reference = payment_reference; }
    public String getDeliveryDate() { return delivery_date; }
    public void setDeliveryDate(String delivery_date) { this.delivery_date = delivery_date; }
    public double getTotalAmount() { return total_amount; }
    public void setTotalAmount(double total_amount) { this.total_amount = total_amount; }
}
