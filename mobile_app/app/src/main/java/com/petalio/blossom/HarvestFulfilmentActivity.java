package com.petalio.blossom;

import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.CommonResponse;
import com.petalio.blossom.network.OrderDetailResponse;
import com.petalio.blossom.network.OrderStatusUpdateRequest;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * HarvestFulfilmentActivity: Real-time harvest logging and fulfilment status tracking
 * backed 100% by live MySQL order, item, customer, and delivery records.
 */
public class HarvestFulfilmentActivity extends AppCompatActivity {

    private ImageView btnBack;
    private TextView tvFulfilTitle, tvFulfilSubtitle;
    private TextView tvSpecFlowers, tvSpecQuantity, tvSpecDelivery, tvSpecPackaging;
    private EditText etHarvestedQty;
    private TextView chipPreparing, chipReady, chipDispatched;
    private Button btnUpdateStatus;

    private String selectedStatus = "Ready";
    private int resolvedOrderId = -1;
    private String orderCode = "";
    private int orderQuantity = 0;
    private String flowerSummary = "";
    private String deliveryAddress = "";
    private String customerName = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_harvest_fulfilment);

        initViews();
        bindIntentData();
        setupListeners();
        fetchLiveOrderDetails();
    }

    private void initViews() {
        btnBack = findViewById(R.id.btnBackFulfil);
        tvFulfilTitle = findViewById(R.id.tvFulfilTitle);
        tvFulfilSubtitle = findViewById(R.id.tvFulfilSubtitle);
        tvSpecFlowers = findViewById(R.id.tvSpecFlowers);
        tvSpecQuantity = findViewById(R.id.tvSpecQuantity);
        tvSpecDelivery = findViewById(R.id.tvSpecDelivery);
        tvSpecPackaging = findViewById(R.id.tvSpecPackaging);
        etHarvestedQty = findViewById(R.id.etHarvestedQty);
        chipPreparing = findViewById(R.id.chipPreparing);
        chipReady = findViewById(R.id.chipReady);
        chipDispatched = findViewById(R.id.chipDispatched);
        btnUpdateStatus = findViewById(R.id.btnUpdateStatus);
    }

    private void bindIntentData() {
        String orderIdStr = getIntent().getStringExtra("order_id");
        orderCode = getIntent().getStringExtra("order_code");
        flowerSummary = getIntent().getStringExtra("flower_summary");
        orderQuantity = getIntent().getIntExtra("quantity", 0);
        deliveryAddress = getIntent().getStringExtra("delivery_address");
        customerName = getIntent().getStringExtra("customer_name");
        String initialStatus = getIntent().getStringExtra("status");

        if (orderIdStr != null && !orderIdStr.isEmpty()) {
            String digits = orderIdStr.replaceAll("\\D+", "");
            if (!digits.isEmpty()) {
                try {
                    resolvedOrderId = Integer.parseInt(digits);
                } catch (Exception ignored) {}
            }
        }

        if (TextUtils.isEmpty(orderCode) && resolvedOrderId > 0) {
            orderCode = "#PB-" + resolvedOrderId;
        }

        updateSpecsUI(null, null, null);

        if (orderQuantity > 0 && etHarvestedQty != null) {
            etHarvestedQty.setText(String.valueOf(orderQuantity));
        }

        if (initialStatus != null && !initialStatus.isEmpty()) {
            selectChip(initialStatus);
        } else {
            selectChip("Ready");
        }
    }

    private void fetchLiveOrderDetails() {
        String lookup = resolvedOrderId > 0 ? String.valueOf(resolvedOrderId) : orderCode;
        if (TextUtils.isEmpty(lookup)) return;

        ApiClient.getApiService(getApplicationContext())
                .getOrderDetail(lookup)
                .enqueue(new Callback<OrderDetailResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<OrderDetailResponse> call, @NonNull Response<OrderDetailResponse> response) {
                        if (isFinishing() || isDestroyed()) return;
                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess() && response.body().getOrder() != null) {
                            OrderDetailResponse.OrderData order = response.body().getOrder();
                            resolvedOrderId = order.order_id;
                            if (!TextUtils.isEmpty(order.order_code)) {
                                orderCode = order.order_code.startsWith("#") ? order.order_code : ("#" + order.order_code);
                            }
                            if (!TextUtils.isEmpty(order.customer_name)) {
                                customerName = order.customer_name;
                            }

                            if (order.delivery != null && !TextUtils.isEmpty(order.delivery.destination_address)) {
                                deliveryAddress = order.delivery.destination_address;
                                if (!TextUtils.isEmpty(order.delivery_city) && !deliveryAddress.toLowerCase().contains(order.delivery_city.toLowerCase())) {
                                    deliveryAddress = deliveryAddress + ", " + order.delivery_city;
                                }
                            } else if (!TextUtils.isEmpty(order.delivery_address)) {
                                deliveryAddress = order.delivery_address;
                            } else if (!TextUtils.isEmpty(order.delivery_city)) {
                                deliveryAddress = order.delivery_city;
                            }

                            int qtySum = 0;
                            StringBuilder sb = new StringBuilder();
                            Set<String> categories = new LinkedHashSet<>();
                            List<OrderDetailResponse.DetailItem> items = order.items;
                            if (items != null && !items.isEmpty()) {
                                for (int i = 0; i < items.size(); i++) {
                                    OrderDetailResponse.DetailItem it = items.get(i);
                                    qtySum += it.quantity;
                                    if (i > 0) sb.append(", ");
                                    sb.append(it.quantity).append("x ").append(it.name);
                                    if (!TextUtils.isEmpty(it.category)) {
                                        categories.add(it.category);
                                    }
                                }
                                flowerSummary = sb.toString();
                                orderQuantity = qtySum;
                            }

                            if (etHarvestedQty != null && TextUtils.isEmpty(etHarvestedQty.getText()) && orderQuantity > 0) {
                                etHarvestedQty.setText(String.valueOf(orderQuantity));
                            }

                            String catSummary = categories.isEmpty() ? "" : TextUtils.join(", ", categories);
                            updateSpecsUI(catSummary, order.delivery, order.order_date);
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<OrderDetailResponse> call, @NonNull Throwable t) {}
                });
    }

    private void updateSpecsUI(String categoriesSummary, OrderDetailResponse.DeliveryData delivery, String orderDate) {
        if (tvFulfilTitle != null && !TextUtils.isEmpty(orderCode)) {
            tvFulfilTitle.setText("Fulfil Order " + orderCode);
        }

        if (tvSpecFlowers != null) {
            tvSpecFlowers.setText("• Flowers: " + (!TextUtils.isEmpty(flowerSummary) ? flowerSummary : "—"));
        }

        if (tvSpecQuantity != null) {
            String qtyText = orderQuantity > 0
                    ? (orderQuantity + (orderQuantity == 1 ? " stem" : " stems"))
                    : "—";
            tvSpecQuantity.setText("• Required: " + qtyText);
        }

        if (tvSpecDelivery != null) {
            StringBuilder dest = new StringBuilder();
            if (!TextUtils.isEmpty(customerName)) dest.append(customerName);
            if (!TextUtils.isEmpty(deliveryAddress)) {
                if (dest.length() > 0) dest.append(" · ");
                dest.append(deliveryAddress);
            }
            tvSpecDelivery.setText("• Destination: " + (dest.length() > 0 ? dest.toString() : "—"));
        }

        if (tvSpecPackaging != null) {
            StringBuilder dispatchSpec = new StringBuilder("• Dispatch & Handling: ");
            boolean hasPart = false;
            if (!TextUtils.isEmpty(categoriesSummary)) {
                dispatchSpec.append(categoriesSummary).append(" stems");
                hasPart = true;
            } else if (!TextUtils.isEmpty(flowerSummary)) {
                dispatchSpec.append(flowerSummary);
                hasPart = true;
            }
            if (delivery != null && !TextUtils.isEmpty(delivery.delivery_code)) {
                if (hasPart) dispatchSpec.append(" · ");
                dispatchSpec.append(delivery.delivery_code);
                hasPart = true;
            }
            if (delivery != null && !TextUtils.isEmpty(delivery.delivery_date)) {
                String d = delivery.delivery_date.replace("T", " ").replace("Z", "");
                if (d.length() > 10) d = d.substring(0, 10);
                if (hasPart) dispatchSpec.append(" · ");
                dispatchSpec.append("Due ").append(d);
                hasPart = true;
            } else if (!TextUtils.isEmpty(orderDate)) {
                String d = orderDate.replace("T", " ").replace("Z", "");
                if (d.length() > 10) d = d.substring(0, 10);
                if (hasPart) dispatchSpec.append(" · ");
                dispatchSpec.append("Ordered ").append(d);
                hasPart = true;
            }
            if (delivery != null && !TextUtils.isEmpty(delivery.driver_name)) {
                if (hasPart) dispatchSpec.append(" · ");
                dispatchSpec.append("Courier: ").append(delivery.driver_name);
                hasPart = true;
            }
            tvSpecPackaging.setText(hasPart ? dispatchSpec.toString() : "• Dispatch & Handling: —");
        }
    }

    private void setupListeners() {
        AnimationUtilsHelper.applyPressScale(btnBack);
        AnimationUtilsHelper.applyPressScale(btnUpdateStatus);
        AnimationUtilsHelper.applyPressScale(chipPreparing);
        AnimationUtilsHelper.applyPressScale(chipReady);
        AnimationUtilsHelper.applyPressScale(chipDispatched);

        btnBack.setOnClickListener(v -> supportFinishAfterTransition());
        chipPreparing.setOnClickListener(v -> selectChip("Preparing"));
        chipReady.setOnClickListener(v -> selectChip("Ready"));
        chipDispatched.setOnClickListener(v -> selectChip("Dispatched"));
        btnUpdateStatus.setOnClickListener(v -> submitFulfilmentStatus());
    }

    private void selectChip(String status) {
        if (status == null) status = "Ready";
        if (status.equalsIgnoreCase("Accepted") || status.equalsIgnoreCase("Preparing")) {
            selectedStatus = "Preparing";
        } else if (status.equalsIgnoreCase("Ready")) {
            selectedStatus = "Ready";
        } else if (status.equalsIgnoreCase("Dispatched") || status.equalsIgnoreCase("Shipped")) {
            selectedStatus = "Dispatched";
        } else {
            selectedStatus = status;
        }

        int unselectedText = ContextCompat.getColor(this, R.color.text_primary);
        int selectedText = ContextCompat.getColor(this, R.color.text_white);

        chipPreparing.setBackgroundResource(R.drawable.bg_chip_unselected);
        chipPreparing.setTextColor(unselectedText);

        chipReady.setBackgroundResource(R.drawable.bg_chip_unselected);
        chipReady.setTextColor(unselectedText);

        chipDispatched.setBackgroundResource(R.drawable.bg_chip_unselected);
        chipDispatched.setTextColor(unselectedText);

        if ("Preparing".equalsIgnoreCase(selectedStatus)) {
            chipPreparing.setBackgroundResource(R.drawable.bg_chip_selected);
            chipPreparing.setTextColor(selectedText);
        } else if ("Ready".equalsIgnoreCase(selectedStatus)) {
            chipReady.setBackgroundResource(R.drawable.bg_chip_selected);
            chipReady.setTextColor(selectedText);
        } else if ("Dispatched".equalsIgnoreCase(selectedStatus)) {
            chipDispatched.setBackgroundResource(R.drawable.bg_chip_selected);
            chipDispatched.setTextColor(selectedText);
        }
    }

    private void submitFulfilmentStatus() {
        if (resolvedOrderId <= 0) {
            Toast.makeText(this, "Order ID not available", Toast.LENGTH_SHORT).show();
            return;
        }
        String qtyStr = etHarvestedQty.getText() != null ? etHarvestedQty.getText().toString().trim() : "";
        if (TextUtils.isEmpty(qtyStr)) {
            etHarvestedQty.setError("Please enter harvested or packed quantity");
            etHarvestedQty.requestFocus();
            return;
        }

        int harvestedQty;
        try {
            harvestedQty = Integer.parseInt(qtyStr);
            if (harvestedQty <= 0) throw new NumberFormatException();
        } catch (NumberFormatException e) {
            etHarvestedQty.setError("Enter a valid positive stem count");
            etHarvestedQty.requestFocus();
            return;
        }

        btnUpdateStatus.setEnabled(false);
        Toast.makeText(this, "Updating " + orderCode + " status to " + selectedStatus + "...", Toast.LENGTH_SHORT).show();

        int finalQty = harvestedQty;
        String rawStatus = "CONFIRMED";
        if ("Dispatched".equalsIgnoreCase(selectedStatus)) {
            rawStatus = "SHIPPED";
        }

        OrderStatusUpdateRequest req = new OrderStatusUpdateRequest(rawStatus, selectedStatus);

        ApiClient.getApiService(getApplicationContext())
                .updateOrderStatusLive(resolvedOrderId, req)
                .enqueue(new Callback<CommonResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<CommonResponse> call, @NonNull Response<CommonResponse> response) {
                        if (isFinishing() || isDestroyed()) return;
                        btnUpdateStatus.setEnabled(true);

                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            Toast.makeText(
                                    HarvestFulfilmentActivity.this,
                                    "Order " + orderCode + " marked as " + selectedStatus + " (" + finalQty + (finalQty == 1 ? " stem" : " stems") + ")!",
                                    Toast.LENGTH_LONG
                            ).show();
                            finish();
                        } else {
                            Toast.makeText(HarvestFulfilmentActivity.this,
                                    ApiClient.extractErrorMessage(response, "Failed to update order status on server."),
                                    Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<CommonResponse> call, @NonNull Throwable t) {
                        if (isFinishing() || isDestroyed()) return;
                        btnUpdateStatus.setEnabled(true);
                        Toast.makeText(HarvestFulfilmentActivity.this, "Network error: Unable to update order status. Please try again.", Toast.LENGTH_SHORT).show();
                    }
                });
    }
}
