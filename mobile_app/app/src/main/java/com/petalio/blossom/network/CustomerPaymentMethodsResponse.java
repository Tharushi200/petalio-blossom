package com.petalio.blossom.network;

import java.util.Collections;
import java.util.List;

public class CustomerPaymentMethodsResponse {
    private boolean success;
    private double bonus_wallet;
    private List<PaymentRecord> payments;

    public boolean isSuccess() { return success; }
    public double getBonusWallet() { return bonus_wallet; }
    public List<PaymentRecord> getPayments() { return payments != null ? payments : Collections.emptyList(); }

    public static class PaymentRecord {
        public int payment_id;
        public double amount_paid;
        public String payment_method;
        public String payment_date;
        public String status;
        public String invoice_number;
        public int order_id;
        public String order_code;
    }
}
