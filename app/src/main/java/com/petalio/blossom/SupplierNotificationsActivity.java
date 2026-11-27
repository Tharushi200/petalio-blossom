package com.petalio.blossom;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.SupplierNotificationDto;
import com.petalio.blossom.network.SupplierNotificationsResponse;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * D4. Supplier Notifications Activity.
 * Dynamically backed by MySQL via GET /api/suppliers/:supplierId/notifications.
 */
public class SupplierNotificationsActivity extends AppCompatActivity {

    private View btnBack;
    private ProgressBar pbLoading;
    private LinearLayout layoutEmpty;
    private TextView tvEmpty, tvSubtitle;
    private RecyclerView rvNotifications;

    private SupplierNotificationsAdapter adapter;
    private final List<SupplierNotificationDto> notificationList = new ArrayList<>();
    private int currentSupplierId = -1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_supplier_notifications);

        currentSupplierId = PetalioUserPrefs.getSupplierId(this);

        initViews();
        setupRecyclerView();
        setupListeners();
        fetchLiveNotifications();
    }

    @Override
    protected void onResume() {
        super.onResume();
        fetchLiveNotifications();
    }

    private void initViews() {
        btnBack = findViewById(R.id.btnBackNotifications);
        pbLoading = findViewById(R.id.pbSupplierNotificationsLoading);
        layoutEmpty = findViewById(R.id.layoutEmptySupplierNotifications);
        tvEmpty = findViewById(R.id.tvEmptySupplierNotifications);
        tvSubtitle = findViewById(R.id.tvNotificationsSubtitle);
        rvNotifications = findViewById(R.id.rvSupplierNotifications);
    }

    private void setupRecyclerView() {
        rvNotifications.setLayoutManager(new LinearLayoutManager(this));
        adapter = new SupplierNotificationsAdapter(notificationList, this::handleNotificationClick);
        rvNotifications.setAdapter(adapter);
    }

    private void setupListeners() {
        AnimationUtilsHelper.applyPressScale(btnBack);
        btnBack.setOnClickListener(v -> supportFinishAfterTransition());
    }

    private void fetchLiveNotifications() {
        if (currentSupplierId <= 0) {
            if (pbLoading != null) pbLoading.setVisibility(View.GONE);
            if (layoutEmpty != null) layoutEmpty.setVisibility(View.VISIBLE);
            if (tvEmpty != null) tvEmpty.setText("Please sign in as a supplier to view notifications.");
            if (tvSubtitle != null) tvSubtitle.setText("No active estate alerts");
            return;
        }

        if (pbLoading != null) pbLoading.setVisibility(View.VISIBLE);

        ApiClient.getApiService(getApplicationContext())
                .getSupplierNotifications(currentSupplierId)
                .enqueue(new Callback<SupplierNotificationsResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<SupplierNotificationsResponse> call,
                                           @NonNull Response<SupplierNotificationsResponse> response) {
                        if (isFinishing() || isDestroyed()) return;
                        if (pbLoading != null) pbLoading.setVisibility(View.GONE);

                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            List<SupplierNotificationDto> items = response.body().getNotifications();
                            notificationList.clear();
                            if (items != null && !items.isEmpty()) {
                                notificationList.addAll(items);
                                if (layoutEmpty != null) layoutEmpty.setVisibility(View.GONE);
                                if (rvNotifications != null) rvNotifications.setVisibility(View.VISIBLE);
                                if (tvSubtitle != null) {
                                    tvSubtitle.setText(items.size() + " active estate alerts & recent updates");
                                }
                            } else {
                                if (layoutEmpty != null) layoutEmpty.setVisibility(View.VISIBLE);
                                if (rvNotifications != null) rvNotifications.setVisibility(View.GONE);
                                if (tvEmpty != null) tvEmpty.setText("You're all caught up! No pending requests or alerts.");
                                if (tvSubtitle != null) tvSubtitle.setText("No active estate alerts");
                            }
                            if (adapter != null) adapter.notifyDataSetChanged();
                        } else {
                            showEmptyError("Unable to load notifications from server.");
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<SupplierNotificationsResponse> call, @NonNull Throwable t) {
                        if (isFinishing() || isDestroyed()) return;
                        if (pbLoading != null) pbLoading.setVisibility(View.GONE);
                        showEmptyError("Network error: Could not load notifications.");
                    }
                });
    }

    private void showEmptyError(String message) {
        if (notificationList.isEmpty()) {
            if (layoutEmpty != null) layoutEmpty.setVisibility(View.VISIBLE);
            if (rvNotifications != null) rvNotifications.setVisibility(View.GONE);
            if (tvEmpty != null) tvEmpty.setText(message);
            if (tvSubtitle != null) tvSubtitle.setText("No active estate alerts");
        } else {
            Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
        }
    }

    private void handleNotificationClick(SupplierNotificationDto item) {
        if (item == null) return;
        String type = item.getType().toUpperCase();

        if ("ORDER_REQUEST".equals(type) && item.getOrderId() != null && item.getOrderId() > 0) {
            Intent intent = new Intent(this, OrderRequestDetailsActivity.class);
            intent.putExtra("order_id", String.valueOf(item.getOrderId()));
            intent.putExtra("order_number", item.getOrderNumber());
            intent.putExtra("items_summary", item.getItemsSummary());
            intent.putExtra("total_quantity", item.getTotalQuantity());
            intent.putExtra("total_amount", item.getTotalAmount());
            intent.putExtra("customer_name", item.getCustomerName());
            intent.putExtra("delivery_address", item.getDeliveryAddress());
            intent.putExtra("delivery_date", item.getDeliveryDate());
            intent.putExtra("status", item.getStatus());
            startActivity(intent);
        } else if ("PAYMENT".equals(type)) {
            openSupplierMain(3); // Demand & Payments tab
        } else if ("LOW_STOCK".equals(type)) {
            openSupplierMain(2); // Stock tab
        } else {
            openSupplierMain(1); // Orders tab fallback
        }
    }

    private void openSupplierMain(int tabIndex) {
        Intent intent = new Intent(this, SupplierMainActivity.class);
        intent.putExtra("target_tab", tabIndex);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        startActivity(intent);
        finish();
    }
}
