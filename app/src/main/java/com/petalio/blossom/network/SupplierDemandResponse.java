package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class SupplierDemandResponse {
    private boolean success;

    @SerializedName("low_stock_alerts")
    private List<LowStockAlertDto> lowStockAlerts;

    @SerializedName("top_demanded")
    private List<TopDemandedDto> topDemanded;

    @SerializedName("completed_payments")
    private List<CompletedPaymentDto> completedPayments;

    @SerializedName("forecasts")
    private List<DemandForecastDto> forecasts;

    @SerializedName("total_payouts")
    private double totalPayouts;

    @SerializedName("total_payouts_formatted")
    private String totalPayoutsFormatted;

    public boolean isSuccess() { return success; }
    public List<LowStockAlertDto> getLowStockAlerts() { return lowStockAlerts; }
    public List<TopDemandedDto> getTopDemanded() { return topDemanded; }
    public List<CompletedPaymentDto> getCompletedPayments() { return completedPayments; }
    public List<DemandForecastDto> getForecasts() { return forecasts; }
    public double getTotalPayouts() { return totalPayouts; }
    public String getTotalPayoutsFormatted() { return totalPayoutsFormatted != null ? totalPayoutsFormatted : ""; }

    public static class LowStockAlertDto {
        @SerializedName("flower_id")
        private int flowerId;

        @SerializedName("flower_name")
        private String flowerName;

        private String category;

        @SerializedName("stock_quantity")
        private int stockQuantity;

        @SerializedName("reorder_level")
        private int reorderLevel;

        @SerializedName("unit_price")
        private double unitPrice;

        @SerializedName("alert_status")
        private String alertStatus;

        @SerializedName("alert_label")
        private String alertLabel;

        public int getFlowerId() { return flowerId; }
        public String getFlowerName() { return flowerName != null ? flowerName : "Flower"; }
        public String getCategory() { return category != null ? category : "Florals"; }
        public int getStockQuantity() { return stockQuantity; }
        public int getReorderLevel() { return reorderLevel > 0 ? reorderLevel : 30; }
        public double getUnitPrice() { return unitPrice; }
        public boolean isNearReorder() {
            if ("NEAR_REORDER".equalsIgnoreCase(alertStatus)) return true;
            if ("LOW_STOCK".equalsIgnoreCase(alertStatus)) return false;
            return stockQuantity > getReorderLevel();
        }
        public String getAlertLabel() {
            if (alertLabel != null && !alertLabel.trim().isEmpty()) return alertLabel;
            return isNearReorder() ? "Near Reorder" : "Low Stock";
        }
    }

    public static class TopDemandedDto {
        @SerializedName("flower_id")
        private int flowerId;

        @SerializedName("flower_name")
        private String flowerName;

        private String category;

        @SerializedName("total_ordered_stems")
        private int totalOrderedStems;

        @SerializedName("current_stock")
        private int currentStock;

        public int getFlowerId() { return flowerId; }
        public String getFlowerName() { return flowerName != null ? flowerName : "Flower"; }
        public String getCategory() { return category != null ? category : "Florals"; }
        public int getTotalOrderedStems() { return totalOrderedStems; }
        public int getCurrentStock() { return currentStock; }
    }

    public static class CompletedPaymentDto {
        @SerializedName("supplier_payment_id")
        private int supplierPaymentId;

        @SerializedName("place_order_id")
        private Integer placeOrderId;

        @SerializedName("order_code")
        private String orderCode;

        private double amount;

        @SerializedName("amount_formatted")
        private String amountFormatted;

        @SerializedName("payment_method")
        private String paymentMethod;

        @SerializedName("payment_date")
        private String paymentDate;

        @SerializedName("payment_reference")
        private String paymentReference;

        private String status;

        public int getSupplierPaymentId() { return supplierPaymentId; }
        public Integer getPlaceOrderId() { return placeOrderId; }
        public String getOrderCode() { return orderCode != null ? orderCode : ("#PB-" + supplierPaymentId); }
        public double getAmount() { return amount; }
        public String getAmountFormatted() { return amountFormatted != null ? amountFormatted : ("Rs. " + (int)amount); }
        public String getPaymentMethod() { return paymentMethod != null ? paymentMethod : "Bank Transfer"; }
        public String getPaymentDate() { return paymentDate != null ? paymentDate : ""; }
        public String getPaymentReference() { return paymentReference != null ? paymentReference : ""; }
        public String getStatus() { return status != null ? status : "COMPLETED"; }
    }
}
