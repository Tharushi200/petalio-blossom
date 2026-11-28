package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class OrderDetailResponse {
    private boolean success;
    private OrderData order;

    public boolean isSuccess() { return success; }
    public OrderData getOrder() { return order; }

    public static class OrderData {
        public int order_id;
        public String order_code;
        public String order_date;
        public String delivery_address;
        public String delivery_city;
        public String customer_name;
        public String customer_phone;
        public String status;
        public String fulfilment_status;
        public double subtotal;
        public double delivery_fee;
        public List<DetailItem> items;
        public InvoiceData invoice;
        public PaymentData payment;
        public DeliveryData delivery;
        public SupplierData supplier;
        public String payment_method;
        public String payment_reference;
    }

    public static class PaymentData {
        public int payment_id;
        public double amount_paid;
        public String payment_method;
        public String payment_reference;
        public String payment_date;
        public String status;
    }

    public static class SupplierData {
        public int supplier_id;
        public String supplier_code;
        public String supplier_name;
        public String city;
        public String address;
        public String contact_number;
    }

    public static class DeliveryData {
        public int delivery_id;
        public String delivery_code;
        public String vehicle_number;
        public String driver_name;
        public String driver_phone;
        public String destination_address;
        public String delivery_date;
        public String status;
        public String officer_name;
        public String officer_phone;
    }

    public static class DetailItem {
        public int order_item_id;
        public int flower_id;
        public int quantity;
        public double price;
        public String name;
        public String category;
        public String image_url;
    }

    public static class InvoiceData {
        public int invoice_id;
        public String invoice_number;
        public double total_amount;
        public String status;
    }
}
