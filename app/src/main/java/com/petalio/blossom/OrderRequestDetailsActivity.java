package com.petalio.blossom;

import android.content.Intent;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import androidx.core.content.ContextCompat;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.CommonResponse;
import com.petalio.blossom.network.OrderDetailResponse;
import com.petalio.blossom.network.OrderStatusUpdateRequest;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * D2. Order Request Details Activity.
 * Dynamically displays live MySQL order items, total payment, delivery date, and customer destination,
 * and persists Accept / Reject decisions directly to MySQL.
 */
public class OrderRequestDetailsActivity extends AppCompatActivity {

    private View btnBack;
    private TextView tvRequestTitle, badgeRequestStatus, tvNeededDate, tvOfferedPayment, tvClientDestination;
    private LinearLayout layoutItemsContainer;
    private Button btnReject, btnAccept;

    private int resolvedOrderId = -1;
    private String orderNumber = "";
    private String itemsSummary = "";
    private int totalQuantity = 0;
    private double totalAmount = 0.0;
    private String customerName = "";
    private String deliveryAddress = "";
    private String deliveryDate = "";
    private String orderStatus = "PENDING";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_order_request_details);

        initViews();
        readIntentExtras();
        bindSummaryData();
        setupListeners();
        fetchLiveOrderDetail();
    }

    private void initViews() {
        btnBack = findViewById(R.id.btnBackOrderRequest);
        tvRequestTitle = findViewById(R.id.tvRequestTitle);
        badgeRequestStatus = findViewById(R.id.badgeRequestStatus);
        layoutItemsContainer = findViewById(R.id.layoutOrderRequestItems);
        tvNeededDate = findViewById(R.id.tvNeededDate);
        tvOfferedPayment = findViewById(R.id.tvOfferedPayment);
        tvClientDestination = findViewById(R.id.tvClientDestination);
        btnReject = findViewById(R.id.btnRejectOrder);
        btnAccept = findViewById(R.id.btnAcceptOrder);
    }

    private void readIntentExtras() {
        Intent i = getIntent();
        if (i == null) return;

        String rawId = i.getStringExtra("order_id");
        if (rawId != null && !rawId.isEmpty()) {
            try {
                resolvedOrderId = Integer.parseInt(rawId.replaceAll("\\D+", ""));
            } catch (Exception ignored) {}
        }

        String passedNum = i.getStringExtra("order_number");
        if (passedNum != null && !passedNum.isEmpty()) {
            orderNumber = passedNum;
        } else if (i.hasExtra("request_id")) {
            orderNumber = i.getStringExtra("request_id");
        }

        if (i.hasExtra("items_summary")) {
            itemsSummary = i.getStringExtra("items_summary");
        }
        if (i.hasExtra("total_quantity")) {
            totalQuantity = i.getIntExtra("total_quantity", 0);
        }
        if (i.hasExtra("total_amount")) {
            totalAmount = i.getDoubleExtra("total_amount", 0.0);
        }
        if (i.hasExtra("customer_name")) {
            customerName = i.getStringExtra("customer_name");
        }
        if (i.hasExtra("delivery_address")) {
            deliveryAddress = i.getStringExtra("delivery_address");
        }
        if (i.hasExtra("delivery_date")) {
            deliveryDate = i.getStringExtra("delivery_date");
        }
        if (i.hasExtra("status")) {
            orderStatus = i.getStringExtra("status");
        }
    }

    private boolean itemsRenderedFromApi = false;

    private void bindSummaryData() {
        String codeDisplay = !isBlank(orderNumber)
                ? (orderNumber.startsWith("#") ? orderNumber : "#" + orderNumber)
                : (resolvedOrderId > 0 ? "#PB-" + resolvedOrderId : "");

        if (tvRequestTitle != null && !codeDisplay.isEmpty()) {
            tvRequestTitle.setText("Request " + codeDisplay);
        }

        if (!itemsRenderedFromApi && layoutItemsContainer != null && !isBlank(itemsSummary)) {
            TextView tvPlaceholder = findViewById(R.id.tvItemsLoadingPlaceholder);
            if (tvPlaceholder != null) {
                tvPlaceholder.setText(itemsSummary + (totalQuantity > 0 ? (" (" + totalQuantity + (totalQuantity == 1 ? " stem)" : " stems)")) : ""));
            }
        }

        if (badgeRequestStatus != null) {
            String stLabel = "PENDING".equalsIgnoreCase(orderStatus) ? "Pending" : orderStatus;
            badgeRequestStatus.setText(isBlank(stLabel) ? "Pending" : stLabel);
            if ("PENDING".equalsIgnoreCase(orderStatus)) {
                badgeRequestStatus.setBackgroundResource(R.drawable.bg_badge_pending_amber);
                badgeRequestStatus.setTextColor(ContextCompat.getColor(this, R.color.gold_loyalty));
            } else {
                badgeRequestStatus.setBackgroundResource(R.drawable.bg_badge_in_stock);
                badgeRequestStatus.setTextColor(ContextCompat.getColor(this, R.color.badge_in_stock_text));
            }
        }

        if (tvNeededDate != null) {
            tvNeededDate.setText(formatDateString(deliveryDate));
        }

        if (tvOfferedPayment != null) {
            tvOfferedPayment.setText(totalAmount > 0 ? ("Rs. " + String.format("%,.0f", totalAmount)) : "—");
        }

        if (tvClientDestination != null) {
            StringBuilder destText = new StringBuilder();
            if (!isBlank(customerName)) {
                destText.append(customerName);
            }
            if (!isBlank(deliveryAddress)) {
                if (destText.length() > 0) destText.append(" • ");
                destText.append(deliveryAddress);
            }
            tvClientDestination.setText(destText.length() > 0 ? destText.toString() : "Loading client details...");
        }
    }

    private void fetchLiveOrderDetail() {
        String lookupKey = resolvedOrderId > 0 ? String.valueOf(resolvedOrderId) : orderNumber;
        if (isBlank(lookupKey)) return;

        ApiClient.getApiService(getApplicationContext())
                .getOrderDetail(lookupKey)
                .enqueue(new Callback<OrderDetailResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<OrderDetailResponse> call, @NonNull Response<OrderDetailResponse> response) {
                        if (isFinishing() || isDestroyed()) return;
                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess() && response.body().getOrder() != null) {
                            OrderDetailResponse.OrderData order = response.body().getOrder();
                            resolvedOrderId = order.order_id;

                            if (!isBlank(order.order_code)) {
                                orderNumber = order.order_code.startsWith("#") ? order.order_code : ("#" + order.order_code);
                            } else {
                                orderNumber = "#PB-" + order.order_id;
                            }

                            if (!isBlank(order.customer_name)) {
                                customerName = order.customer_name;
                            }

                            if (order.delivery != null && !isBlank(order.delivery.destination_address)) {
                                deliveryAddress = order.delivery.destination_address;
                                if (!isBlank(order.delivery_city) && !deliveryAddress.toLowerCase().contains(order.delivery_city.toLowerCase())) {
                                    deliveryAddress = deliveryAddress + ", " + order.delivery_city;
                                }
                            } else if (!isBlank(order.delivery_address)) {
                                deliveryAddress = order.delivery_address;
                            } else if (!isBlank(order.delivery_city)) {
                                deliveryAddress = order.delivery_city;
                            }

                            if (order.delivery != null && !isBlank(order.delivery.delivery_date)) {
                                deliveryDate = order.delivery.delivery_date;
                            } else if (!isBlank(order.order_date)) {
                                deliveryDate = order.order_date;
                            }

                            if (!isBlank(order.status)) {
                                orderStatus = order.status;
                            }

                            double itemsTotal = 0;
                            int qtySum = 0;
                            StringBuilder summaryBuilder = new StringBuilder();
                            List<OrderDetailResponse.DetailItem> items = order.items;
                            if (items != null && !items.isEmpty()) {
                                for (int idx = 0; idx < items.size(); idx++) {
                                    OrderDetailResponse.DetailItem item = items.get(idx);
                                    qtySum += item.quantity;
                                    itemsTotal += (item.quantity * item.price);
                                    if (idx > 0) summaryBuilder.append(", ");
                                    summaryBuilder.append(item.quantity).append("x ").append(item.name);
                                }
                                totalQuantity = qtySum;
                                itemsSummary = summaryBuilder.toString();
                                renderItemRows(items);
                            }

                            if (order.invoice != null && order.invoice.total_amount > 0) {
                                totalAmount = order.invoice.total_amount;
                            } else if (itemsTotal > 0 && totalAmount <= 0) {
                                totalAmount = itemsTotal;
                            }

                            bindSummaryData();
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<OrderDetailResponse> call, @NonNull Throwable t) {
                        // Keep intent summary values cleanly
                    }
                });
    }

    private void renderItemRows(List<OrderDetailResponse.DetailItem> items) {
        if (layoutItemsContainer == null) return;
        itemsRenderedFromApi = true;
        layoutItemsContainer.removeAllViews();

        float density = getResources().getDisplayMetrics().density;
        int dp38 = (int) (38 * density);
        int dp10 = (int) (10 * density);
        int dp8 = (int) (8 * density);

        for (int i = 0; i < items.size(); i++) {
            OrderDetailResponse.DetailItem item = items.get(i);

            LinearLayout row = new LinearLayout(this);
            row.setOrientation(LinearLayout.HORIZONTAL);
            row.setGravity(Gravity.CENTER_VERTICAL);
            row.setLayoutParams(new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
            ));

            CardView imgCard = new CardView(this);
            LinearLayout.LayoutParams cardParams = new LinearLayout.LayoutParams(dp38, dp38);
            imgCard.setLayoutParams(cardParams);
            imgCard.setRadius(8 * density);
            imgCard.setCardElevation(0f);

            ImageView iv = new ImageView(this);
            iv.setLayoutParams(new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.MATCH_PARENT
            ));
            iv.setScaleType(ImageView.ScaleType.CENTER_CROP);
            iv.setImageResource(FlowerImageHelper.getDrawableForFlower(item.name));
            imgCard.addView(iv);
            row.addView(imgCard);

            LinearLayout textCol = new LinearLayout(this);
            textCol.setOrientation(LinearLayout.VERTICAL);
            LinearLayout.LayoutParams textParams = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
            textParams.setMarginStart(dp10);
            textCol.setLayoutParams(textParams);

            TextView tvName = new TextView(this);
            tvName.setText(item.name);
            tvName.setTextSize(15);
            tvName.setTypeface(null, android.graphics.Typeface.BOLD);
            tvName.setTextColor(ContextCompat.getColor(this, R.color.text_primary));
            textCol.addView(tvName);

            TextView tvUnit = new TextView(this);
            tvUnit.setText("Rs. " + String.format("%,.0f", item.price) + " / stem");
            tvUnit.setTextSize(12);
            tvUnit.setTextColor(ContextCompat.getColor(this, R.color.text_secondary));
            textCol.addView(tvUnit);

            row.addView(textCol);

            TextView tvQty = new TextView(this);
            tvQty.setText("x" + item.quantity);
            tvQty.setTextSize(15);
            tvQty.setTypeface(null, android.graphics.Typeface.BOLD);
            tvQty.setTextColor(ContextCompat.getColor(this, R.color.text_secondary));
            row.addView(tvQty);

            layoutItemsContainer.addView(row);

            if (i < items.size() - 1) {
                View divider = new View(this);
                LinearLayout.LayoutParams divParams = new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT, 1);
                divParams.setMargins(0, dp10, 0, dp10);
                divider.setLayoutParams(divParams);
                divider.setBackgroundColor(ContextCompat.getColor(this, R.color.divider_color));
                layoutItemsContainer.addView(divider);
            }
        }
    }

    private void setupListeners() {
        AnimationUtilsHelper.applyPressScale(btnBack);
        AnimationUtilsHelper.applyPressScale(btnReject);
        AnimationUtilsHelper.applyPressScale(btnAccept);

        btnBack.setOnClickListener(v -> supportFinishAfterTransition());

        btnReject.setOnClickListener(v -> {
            if (resolvedOrderId <= 0) {
                Toast.makeText(this, "Order ID not available", Toast.LENGTH_SHORT).show();
                return;
            }
            new AlertDialog.Builder(this)
                    .setTitle("Reject Order Request")
                    .setMessage("Are you sure you want to decline order " + orderNumber + "?")
                    .setPositiveButton("Yes, Decline", (dialog, which) -> submitOrderRejection())
                    .setNegativeButton("Cancel", null)
                    .show();
        });

        btnAccept.setOnClickListener(v -> submitOrderAcceptance());
    }

    private void submitOrderAcceptance() {
        if (resolvedOrderId <= 0) {
            Toast.makeText(this, "Order ID not loaded yet", Toast.LENGTH_SHORT).show();
            return;
        }
        btnAccept.setEnabled(false);
        btnReject.setEnabled(false);
        Toast.makeText(this, "Accepting order " + orderNumber + "...", Toast.LENGTH_SHORT).show();

        OrderStatusUpdateRequest req = new OrderStatusUpdateRequest("ACCEPTED", "Preparing");
        ApiClient.getApiService(getApplicationContext())
                .updateOrderStatusLive(resolvedOrderId, req)
                .enqueue(new Callback<CommonResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<CommonResponse> call, @NonNull Response<CommonResponse> response) {
                        if (isFinishing() || isDestroyed()) return;
                        btnAccept.setEnabled(true);
                        btnReject.setEnabled(true);

                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            Toast.makeText(OrderRequestDetailsActivity.this, "✓ Order accepted! Proceeding to harvest fulfilment...", Toast.LENGTH_SHORT).show();
                            Intent intent = new Intent(OrderRequestDetailsActivity.this, HarvestFulfilmentActivity.class);
                            intent.putExtra("order_id", String.valueOf(resolvedOrderId));
                            intent.putExtra("order_code", orderNumber);
                            intent.putExtra("flower_summary", itemsSummary);
                            intent.putExtra("quantity", totalQuantity);
                            intent.putExtra("delivery_address", deliveryAddress);
                            intent.putExtra("customer_name", customerName);
                            intent.putExtra("status", "Preparing");
                            startActivity(intent);
                            finish();
                        } else {
                            Toast.makeText(OrderRequestDetailsActivity.this,
                                    ApiClient.extractErrorMessage(response, "Could not accept order on server."),
                                    Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<CommonResponse> call, @NonNull Throwable t) {
                        if (isFinishing() || isDestroyed()) return;
                        btnAccept.setEnabled(true);
                        btnReject.setEnabled(true);
                        Toast.makeText(OrderRequestDetailsActivity.this, "Network error: Unable to accept order.", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void submitOrderRejection() {
        btnReject.setEnabled(false);
        btnAccept.setEnabled(false);

        OrderStatusUpdateRequest req = new OrderStatusUpdateRequest("CANCELLED", "Cancelled");
        ApiClient.getApiService(getApplicationContext())
                .updateOrderStatusLive(resolvedOrderId, req)
                .enqueue(new Callback<CommonResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<CommonResponse> call, @NonNull Response<CommonResponse> response) {
                        if (isFinishing() || isDestroyed()) return;
                        btnReject.setEnabled(true);
                        btnAccept.setEnabled(true);
                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            Toast.makeText(OrderRequestDetailsActivity.this, "Order " + orderNumber + " declined.", Toast.LENGTH_SHORT).show();
                            finish();
                        } else {
                            Toast.makeText(OrderRequestDetailsActivity.this,
                                    ApiClient.extractErrorMessage(response, "Failed to update order status."),
                                    Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<CommonResponse> call, @NonNull Throwable t) {
                        if (isFinishing() || isDestroyed()) return;
                        btnReject.setEnabled(true);
                        btnAccept.setEnabled(true);
                        Toast.makeText(OrderRequestDetailsActivity.this, "Network error: Unable to decline order.", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private String formatDateString(String raw) {
        if (isBlank(raw) || "null".equalsIgnoreCase(raw)) return "—";
        String clean = raw.replace("T", " ").replace("Z", "");
        if (clean.length() >= 10) {
            return clean.substring(0, 10);
        }
        return clean;
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
