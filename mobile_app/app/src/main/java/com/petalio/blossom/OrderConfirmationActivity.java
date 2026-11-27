package com.petalio.blossom;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.animation.OvershootInterpolator;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.OrderDetailResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * O3. Order Confirmation Activity for Petalio Blossom.
 * Dynamically displays actual purchased order items, clean order code, and live total.
 */
public class OrderConfirmationActivity extends AppCompatActivity {

    private FrameLayout checkCircleFrame;
    private TextView tvConfirmOrderDetails, tvConfirmTotal;
    private LinearLayout llConfirmItemsContainer;
    private Button btnTrackOrder, btnContinueShopping;

    private String orderId = "";
    private String deliveryDate = "Tomorrow";
    private int totalAmount = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_order_confirmation);

        initViews();
        loadData();
        setupListeners();
        animateCheckmark();
    }

    private void initViews() {
        checkCircleFrame = findViewById(R.id.checkCircleFrame);
        tvConfirmOrderDetails = findViewById(R.id.tvConfirmOrderDetails);
        tvConfirmTotal = findViewById(R.id.tvConfirmTotal);
        llConfirmItemsContainer = findViewById(R.id.llConfirmItemsContainer);
        btnTrackOrder = findViewById(R.id.btnTrackOrder);
        btnContinueShopping = findViewById(R.id.btnContinueShopping);
    }

    private void loadData() {
        String rawOrderId = getIntent().getStringExtra("ORDER_ID");
        if (rawOrderId != null && !rawOrderId.trim().isEmpty()) {
            String cleanOrderCode = rawOrderId.replace("Order ", "").replace("#", "").trim();
            if (!cleanOrderCode.startsWith("PB-") && !cleanOrderCode.startsWith("pb-")) {
                cleanOrderCode = "PB-" + cleanOrderCode;
            }
            orderId = cleanOrderCode;
        }

        String rawDate = getIntent().getStringExtra("DELIVERY_DATE");
        if (rawDate == null || rawDate.isEmpty())
            rawDate = "Tomorrow";
        String cleanDate = rawDate.trim();
        if (cleanDate.toLowerCase().startsWith("delivery ")) {
            cleanDate = cleanDate.substring("delivery ".length()).trim();
        } else if (cleanDate.toLowerCase().startsWith("delivery")) {
            cleanDate = cleanDate.substring("delivery".length()).trim();
        }
        if (cleanDate.isEmpty())
            cleanDate = "Tomorrow";
        deliveryDate = cleanDate;

        totalAmount = getIntent().getIntExtra("TOTAL_AMOUNT", 0);

        tvConfirmOrderDetails.setText(!orderId.isEmpty()
                ? ("Order " + orderId + " • Delivery " + deliveryDate)
                : ("Order Confirmed • Delivery " + deliveryDate));
        tvConfirmTotal.setText("Rs. " + totalAmount);

        populatePurchasedItems();
    }

    private void populatePurchasedItems() {
        if (llConfirmItemsContainer == null)
            return;
        llConfirmItemsContainer.removeAllViews();

        String itemsJson = getIntent().getStringExtra("ORDER_ITEMS_JSON");
        boolean hasDynamicItems = false;

        if (itemsJson != null && !itemsJson.trim().isEmpty()) {
            try {
                JSONArray arr = new JSONArray(itemsJson);
                for (int i = 0; i < arr.length(); i++) {
                    JSONObject obj = arr.getJSONObject(i);
                    String name = obj.optString("name", "");
                    int qty = obj.optInt("quantity", 1);
                    if (!name.isEmpty()) {
                        addItemRow(name, qty);
                        hasDynamicItems = true;
                    }
                }
            } catch (Exception ignored) {
                hasDynamicItems = false;
            }
        }

        if (!hasDynamicItems && !orderId.isEmpty()) {
            fetchOrderItemsFromServer();
        }
    }

    private void fetchOrderItemsFromServer() {
        ApiClient.getApiService(getApplicationContext())
                .getOrderDetail(orderId)
                .enqueue(new Callback<OrderDetailResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<OrderDetailResponse> call, @NonNull Response<OrderDetailResponse> response) {
                        if (isFinishing() || isDestroyed()) return;
                        if (response.isSuccessful() && response.body() != null && response.body().getOrder() != null) {
                            OrderDetailResponse.OrderData order = response.body().getOrder();
                            if (order.items != null && llConfirmItemsContainer != null) {
                                llConfirmItemsContainer.removeAllViews();
                                for (OrderDetailResponse.DetailItem item : order.items) {
                                    if (item.name != null) addItemRow(item.name, item.quantity);
                                }
                            }
                            if (order.invoice != null && order.invoice.total_amount > 0 && tvConfirmTotal != null) {
                                tvConfirmTotal.setText("Rs. " + Math.round(order.invoice.total_amount));
                            }
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<OrderDetailResponse> call, @NonNull Throwable t) {}
                });
    }

    private void addItemRow(String name, int qty) {
        if (llConfirmItemsContainer == null)
            return;
        View row = getLayoutInflater().inflate(R.layout.item_order_confirmation_flower, llConfirmItemsContainer, false);
        ImageView iv = row.findViewById(R.id.ivConfirmFlowerImg);
        TextView tvName = row.findViewById(R.id.tvConfirmFlowerName);
        TextView tvQty = row.findViewById(R.id.tvConfirmFlowerQty);

        if (tvName != null)
            tvName.setText(name);
        if (tvQty != null)
            tvQty.setText("x " + qty);
        if (iv != null) {
            iv.setImageResource(FlowerImageHelper.getDrawableForFlower(name));
            if (name != null && name.toLowerCase().contains("rose") && !name.toLowerCase().contains("tuberose")) {
                FlowerImageHelper.applyFocalCrop(iv, 0.15f);
            } else {
                FlowerImageHelper.resetCrop(iv);
            }
        }

        llConfirmItemsContainer.addView(row);
    }

    private void animateCheckmark() {
        checkCircleFrame.setScaleX(0.2f);
        checkCircleFrame.setScaleY(0.2f);
        checkCircleFrame.setAlpha(0f);
        checkCircleFrame.animate()
                .scaleX(1f).scaleY(1f).alpha(1f)
                .setDuration(700)
                .setInterpolator(new OvershootInterpolator(1.4f))
                .start();
    }

    private void setupListeners() {
        AnimationUtilsHelper.applyPressScale(btnTrackOrder);
        AnimationUtilsHelper.applyPressScale(btnContinueShopping);

        btnTrackOrder.setOnClickListener(v -> {
            Intent intent = new Intent(OrderConfirmationActivity.this, DeliveryTrackingActivity.class);
            intent.putExtra("ORDER_ID", orderId);
            intent.putExtra("DELIVERY_DATE", deliveryDate);
            startActivity(intent);
            finish();
        });

        btnContinueShopping.setOnClickListener(v -> {
            Intent intent = new Intent(OrderConfirmationActivity.this, CustomerMainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            startActivity(intent);
            finish();
        });
    }
}
