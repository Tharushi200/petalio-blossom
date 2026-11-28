package com.petalio.blossom;

import android.app.DatePickerDialog;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.Editable;
import android.text.InputType;
import android.text.TextWatcher;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import com.google.gson.Gson;
import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.OrderItemRequest;
import com.petalio.blossom.network.OrderRequest;
import com.petalio.blossom.network.OrderResponse;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * O2. Digital Payment Activity for Petalio Blossom.
 * Supports interactive Credit/Debit Card mode (with live VISA/Mastercard brand detection
 * and auto-formatted 4-digit groups) and Direct Bank Transfer mode (with corporate account
 * details, 1-tap copy, and transfer reference validation).
 */
public class PaymentActivity extends AppCompatActivity {

    private View btnBackPayment;
    private View cardCardDetails, cardBankTransferDetails;
    private TextView tvPaymentOrderId, tvPaymentDeliveryDate, tvPaymentSummaryAmount;
    private TextView tvCardBrandBadge, tvTransferRemarkNote, tvBankAccNumber;
    private EditText etCardNumber, etCardExpiry, etCardCVV, etBankReference;
    private Button btnCopyAccountNo, btnBankTransferOption, btnPayTotal;

    private int totalAmount = 0;
    private String orderId = "";
    private String deliveryDate = "Tomorrow";
    private boolean isBankTransferSelected = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_payment);

        initViews();
        loadData();
        setupListeners();
    }

    private void initViews() {
        btnBackPayment = findViewById(R.id.btnBackPayment);
        cardCardDetails = findViewById(R.id.cardCardDetails);
        cardBankTransferDetails = findViewById(R.id.cardBankTransferDetails);

        tvPaymentOrderId = findViewById(R.id.tvPaymentOrderId);
        tvPaymentDeliveryDate = findViewById(R.id.tvPaymentDeliveryDate);
        tvPaymentSummaryAmount = findViewById(R.id.tvPaymentSummaryAmount);

        tvCardBrandBadge = findViewById(R.id.tvCardBrandBadge);
        tvTransferRemarkNote = findViewById(R.id.tvTransferRemarkNote);
        tvBankAccNumber = findViewById(R.id.tvBankAccNumber);

        etCardNumber = findViewById(R.id.etCardNumber);
        etCardExpiry = findViewById(R.id.etCardExpiry);
        etCardCVV = findViewById(R.id.etCardCVV);
        etBankReference = findViewById(R.id.etBankReference);

        btnCopyAccountNo = findViewById(R.id.btnCopyAccountNo);
        btnBankTransferOption = findViewById(R.id.btnBankTransferOption);
        btnPayTotal = findViewById(R.id.btnPayTotal);
    }

    private void loadData() {
        totalAmount = getIntent().getIntExtra("TOTAL_AMOUNT", 0);
        if (totalAmount <= 0) {
            int sub = CartManager.getInstance(this).getTotalAmount();
            if (sub > 0) totalAmount = sub + 200;
        }
        orderId = getIntent().getStringExtra("ORDER_ID");
        if (orderId == null || orderId.isEmpty()) orderId = "PB-" + (1000 + (int) (Math.random() * 9000));
        String cleanOrderCode = orderId.replace("Order ", "").replace("#", "").trim();
        if (!cleanOrderCode.startsWith("PB-") && !cleanOrderCode.startsWith("pb-")) {
            cleanOrderCode = "PB-" + cleanOrderCode;
        }
        orderId = cleanOrderCode;

        deliveryDate = getIntent().getStringExtra("DELIVERY_DATE");
        if (deliveryDate == null || deliveryDate.isEmpty()) deliveryDate = "Tomorrow";
        String cleanDate = deliveryDate.trim();
        if (cleanDate.toLowerCase().startsWith("delivery ")) {
            cleanDate = cleanDate.substring("delivery ".length()).trim();
        } else if (cleanDate.toLowerCase().startsWith("delivery")) {
            cleanDate = cleanDate.substring("delivery".length()).trim();
        }
        if (cleanDate.isEmpty()) cleanDate = "Tomorrow";
        deliveryDate = cleanDate;

        tvPaymentOrderId.setText("Order " + orderId);
        tvPaymentDeliveryDate.setText("Delivery " + deliveryDate + "  •  Tap to change");
        tvPaymentSummaryAmount.setText("Rs. " + totalAmount);
        btnPayTotal.setText("Pay Rs. " + totalAmount);

        if (tvTransferRemarkNote != null) {
            tvTransferRemarkNote.setText("Include Order ID (" + orderId + ") in transfer remarks");
        }
        if (tvCardBrandBadge != null) {
            tvCardBrandBadge.setText("VISA");
        }
    }

    private void setupListeners() {
        AnimationUtilsHelper.applyPressScale(btnBackPayment);
        AnimationUtilsHelper.applyPressScale(btnBankTransferOption);
        AnimationUtilsHelper.applyPressScale(btnPayTotal);
        if (btnCopyAccountNo != null) {
            AnimationUtilsHelper.applyPressScale(btnCopyAccountNo);
        }

        btnBackPayment.setOnClickListener(v -> supportFinishAfterTransition());

        // Interactive delivery date picker in Signature Petalio Rose-Burgundy theme
        if (tvPaymentDeliveryDate != null) {
            AnimationUtilsHelper.applyPressScale(tvPaymentDeliveryDate);
            tvPaymentDeliveryDate.setOnClickListener(v -> openDeliveryDatePicker());
        }

        // 1-Tap Copy Account Number
        if (btnCopyAccountNo != null) {
            btnCopyAccountNo.setOnClickListener(v -> {
                ClipboardManager clipboard = (ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
                ClipData clip = ClipData.newPlainText("Bank Account Number", "8014928410");
                if (clipboard != null) {
                    clipboard.setPrimaryClip(clip);
                    Toast.makeText(this, "Bank account number copied", Toast.LENGTH_SHORT).show();
                }
            });
        }

        // Live Card Network Detection & Auto-Grouping into 4-digit blocks
        if (etCardNumber != null) {
            etCardNumber.addTextChangedListener(new TextWatcher() {
                private boolean isUpdating = false;

                @Override
                public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

                @Override
                public void onTextChanged(CharSequence s, int start, int before, int count) {}

                @Override
                public void afterTextChanged(Editable s) {
                    if (isUpdating) return;

                    isUpdating = true;
                    String raw = s.toString().replaceAll("\\s+", "");
                    if (raw.length() > 16) {
                        raw = raw.substring(0, 16);
                    }

                    // Live Card Network Detection
                    if (tvCardBrandBadge != null) {
                        if (raw.startsWith("4")) {
                            tvCardBrandBadge.setText("VISA");
                        } else if (raw.startsWith("5") || raw.startsWith("2")) {
                            tvCardBrandBadge.setText("MASTERCARD");
                        } else {
                            tvCardBrandBadge.setText("CARD");
                        }
                    }

                    // Format into 4-digit groups
                    StringBuilder formatted = new StringBuilder();
                    for (int i = 0; i < raw.length(); i++) {
                        if (i > 0 && i % 4 == 0) {
                            formatted.append(" ");
                        }
                        formatted.append(raw.charAt(i));
                    }

                    s.replace(0, s.length(), formatted.toString());
                    isUpdating = false;
                }
            });
        }

        // Mode switch between Card and Direct Bank Transfer
        btnBankTransferOption.setOnClickListener(v -> {
            isBankTransferSelected = !isBankTransferSelected;
            if (isBankTransferSelected) {
                if (cardCardDetails != null) cardCardDetails.setVisibility(View.GONE);
                if (cardBankTransferDetails != null) cardBankTransferDetails.setVisibility(View.VISIBLE);
                btnBankTransferOption.setText("Use credit or debit card instead");
                btnPayTotal.setText("Confirm Bank Transfer • Rs. " + totalAmount);
            } else {
                if (cardCardDetails != null) cardCardDetails.setVisibility(View.VISIBLE);
                if (cardBankTransferDetails != null) cardBankTransferDetails.setVisibility(View.GONE);
                btnBankTransferOption.setText("Use bank transfer instead");
                btnPayTotal.setText("Pay Rs. " + totalAmount);
            }
        });

        // Submit Payment Action
        btnPayTotal.setOnClickListener(v -> {
            if (isBankTransferSelected) {
                // Validate Bank Transfer Reference
                String ref = etBankReference != null && etBankReference.getText() != null
                        ? etBankReference.getText().toString().trim() : "";
                if (ref.isEmpty()) {
                    if (etBankReference != null) {
                        etBankReference.setError("Please enter transfer reference or slip number");
                        etBankReference.requestFocus();
                    }
                    return;
                }
            } else {
                // Validate Card input details
                String rawCard = etCardNumber.getText() != null ? etCardNumber.getText().toString().trim() : "";
                String expiry = etCardExpiry.getText() != null ? etCardExpiry.getText().toString().trim() : "";
                String cvv = etCardCVV.getText() != null ? etCardCVV.getText().toString().trim() : "";

                String cleanCard = rawCard.replaceAll("[\\s-]", "");
                if (cleanCard.length() != 16 || !cleanCard.matches("^[0-9]{16}$")) {
                    etCardNumber.setError("Please enter a valid 16-digit card number");
                    etCardNumber.requestFocus();
                    return;
                }

                if (!expiry.matches("^(0[1-9]|1[0-2])\\/?([0-9]{2})$")) {
                    etCardExpiry.setError("Expiry required in MM/YY format (e.g. 08/28)");
                    etCardExpiry.requestFocus();
                    return;
                }
                if (isCardExpired(expiry)) {
                    etCardExpiry.setError("Card expiry date cannot be in the past");
                    etCardExpiry.requestFocus();
                    return;
                }

                if (!cvv.matches("^[0-9]{3,4}$")) {
                    etCardCVV.setError("Enter 3 or 4-digit CVV");
                    etCardCVV.requestFocus();
                    return;
                }
            }

            int customerId = PetalioUserPrefs.getCustomerId(this);
            if (customerId <= 0) customerId = PetalioUserPrefs.getUserId(this);
            if (customerId <= 0) {
                Toast.makeText(this, "Please sign in as a customer to place an order.", Toast.LENGTH_LONG).show();
                return;
            }

            List<CartManager.CartItem> cartItems = CartManager.getInstance(PaymentActivity.this).getItems();
            if (cartItems.isEmpty()) {
                Toast.makeText(this, "Your cart is empty! Please add flowers before checkout.", Toast.LENGTH_SHORT).show();
                return;
            }

            String address = PetalioUserPrefs.getUserAddress(this);
            String city = PetalioUserPrefs.getUserCity(this);
            if (address.trim().isEmpty() && city.trim().isEmpty()) {
                promptForDeliveryAddress(customerId, cartItems);
                return;
            }
            submitOrderToServer(customerId, address, city, cartItems);
        });
    }

    private boolean isCardExpired(String expiry) {
        try {
            String digits = expiry.replaceAll("\\D+", "");
            if (digits.length() != 4) return false;
            int expMonth = Integer.parseInt(digits.substring(0, 2));
            int expYear = 2000 + Integer.parseInt(digits.substring(2, 4));
            java.util.Calendar now = java.util.Calendar.getInstance();
            int curYear = now.get(java.util.Calendar.YEAR);
            int curMonth = now.get(java.util.Calendar.MONTH) + 1;
            return expYear < curYear || (expYear == curYear && expMonth < curMonth);
        } catch (Exception e) {
            return false;
        }
    }

    private void openDeliveryDatePicker() {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, 1);
        int year = calendar.get(Calendar.YEAR);
        int month = calendar.get(Calendar.MONTH);
        int day = calendar.get(Calendar.DAY_OF_MONTH);

        DatePickerDialog dialog = new DatePickerDialog(this, R.style.PetalioDatePickerTheme, (view, y, m, d) -> {
            deliveryDate = d + "/" + (m + 1) + "/" + y;
            if (tvPaymentDeliveryDate != null) {
                tvPaymentDeliveryDate.setText("Delivery " + deliveryDate + "  •  Tap to change");
            }
            Toast.makeText(this, "Delivery date set: " + deliveryDate, Toast.LENGTH_SHORT).show();
        }, year, month, day);
        dialog.getDatePicker().setMinDate(System.currentTimeMillis());
        dialog.setOnShowListener(d -> {
            Button positive = dialog.getButton(DatePickerDialog.BUTTON_POSITIVE);
            Button negative = dialog.getButton(DatePickerDialog.BUTTON_NEGATIVE);
            int burgundyColor = ContextCompat.getColor(this, R.color.petalio_burgundy);
            if (positive != null) {
                positive.setTextColor(burgundyColor);
                positive.setTypeface(null, android.graphics.Typeface.BOLD);
            }
            if (negative != null) {
                negative.setTextColor(burgundyColor);
            }
        });
        dialog.show();
    }

    private void promptForDeliveryAddress(int customerId, List<CartManager.CartItem> cartItems) {
        LinearLayout container = new LinearLayout(this);
        container.setOrientation(LinearLayout.VERTICAL);
        int pad = (int) (20 * getResources().getDisplayMetrics().density);
        container.setPadding(pad, pad / 2, pad, 0);

        final EditText etAddress = new EditText(this);
        etAddress.setHint("Street / House No. (e.g. 42 Flower Rd, Colombo 07)");
        etAddress.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_WORDS);
        container.addView(etAddress);

        final EditText etCity = new EditText(this);
        etCity.setHint("City (e.g. Colombo)");
        etCity.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_WORDS);
        container.addView(etCity);

        new AlertDialog.Builder(this)
                .setTitle("Delivery Destination")
                .setMessage("Enter where we should deliver your fresh blooms:")
                .setView(container)
                .setPositiveButton("Continue & Pay", (dialog, which) -> {
                    String addr = etAddress.getText() != null ? etAddress.getText().toString().trim() : "";
                    String city = etCity.getText() != null ? etCity.getText().toString().trim() : "";
                    if (addr.length() < 4) {
                        Toast.makeText(PaymentActivity.this, "Please enter a valid delivery address", Toast.LENGTH_SHORT).show();
                        return;
                    }
                    PetalioUserPrefs.saveCustomerInfo(
                            PaymentActivity.this,
                            customerId,
                            customerId,
                            PetalioUserPrefs.getUserName(PaymentActivity.this),
                            PetalioUserPrefs.getUserEmail(PaymentActivity.this),
                            PetalioUserPrefs.getUserPhone(PaymentActivity.this),
                            addr,
                            city
                    );
                    submitOrderToServer(customerId, addr, city, cartItems);
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void submitOrderToServer(int customerId, String address, String city, List<CartManager.CartItem> cartItems) {
        btnPayTotal.setEnabled(false);
        btnPayTotal.setText(isBankTransferSelected ? "Submitting Transfer..." : "Processing Transaction...");

        String payMethod = isBankTransferSelected ? "BANK_TRANSFER" : "CARD";
        final String itemsJson = new Gson().toJson(cartItems);
        List<OrderItemRequest> items = new ArrayList<>();
        for (CartManager.CartItem ci : cartItems) {
            items.add(new OrderItemRequest(
                    ci.getFlowerId(),
                    ci.getQuantity(),
                    ci.getUnitPrice()
            ));
        }

        String payRef = isBankTransferSelected
                ? (etBankReference != null && etBankReference.getText() != null ? etBankReference.getText().toString().trim() : "")
                : ("CARD-" + System.currentTimeMillis());

        OrderRequest orderReq = new OrderRequest(
                customerId,
                customerId,
                address,
                city,
                payMethod,
                payRef,
                deliveryDate,
                (double) totalAmount,
                orderId,
                items
        );

        ApiClient.getApiService(PaymentActivity.this)
                .placeOrder(orderReq)
                .enqueue(new Callback<OrderResponse>() {
                    @Override
                    public void onResponse(Call<OrderResponse> call, Response<OrderResponse> response) {
                        if (isFinishing() || isDestroyed()) return;
                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            CartManager.getInstance(PaymentActivity.this).clearCart();

                            String confirmedCode = response.body().getOrderCode();
                            int createdOrderId = response.body().getOrderId();
                            if (confirmedCode == null || confirmedCode.isEmpty()) {
                                confirmedCode = "PB-" + createdOrderId;
                            }
                            int finalTotal = (int) Math.round(response.body().getTotalAmount());

                            String msg = isBankTransferSelected
                                    ? "Bank Transfer Recorded! Order " + confirmedCode + " placed."
                                    : "Payment Successful! Order " + confirmedCode + " placed.";
                            Toast.makeText(PaymentActivity.this, msg, Toast.LENGTH_SHORT).show();

                            Intent intent = new Intent(PaymentActivity.this, OrderConfirmationActivity.class);
                            intent.putExtra("ORDER_DB_ID", createdOrderId);
                            intent.putExtra("ORDER_ID", confirmedCode);
                            intent.putExtra("DELIVERY_DATE", deliveryDate);
                            intent.putExtra("TOTAL_AMOUNT", finalTotal);
                            intent.putExtra("ORDER_ITEMS_JSON", itemsJson);
                            startActivity(intent);
                            finish();
                            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
                        } else {
                            btnPayTotal.setEnabled(true);
                            btnPayTotal.setText(isBankTransferSelected ? ("Confirm Bank Transfer • Rs. " + totalAmount) : ("Pay Rs. " + totalAmount));
                            String err = (response.body() != null && response.body().getMessage() != null && !response.body().getMessage().trim().isEmpty())
                                    ? response.body().getMessage()
                                    : ApiClient.extractErrorMessage(response, "Order could not be processed. Please try again.");
                            Toast.makeText(PaymentActivity.this, err, Toast.LENGTH_LONG).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<OrderResponse> call, Throwable t) {
                        if (isFinishing() || isDestroyed()) return;
                        btnPayTotal.setEnabled(true);
                        btnPayTotal.setText(isBankTransferSelected ? ("Confirm Bank Transfer • Rs. " + totalAmount) : ("Pay Rs. " + totalAmount));
                        Toast.makeText(PaymentActivity.this, "Network error: Could not place your order. Please check your connection and try again.", Toast.LENGTH_LONG).show();
                    }
                });
    }
}
