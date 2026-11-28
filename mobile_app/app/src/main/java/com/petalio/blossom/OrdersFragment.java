package com.petalio.blossom;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.CustomerOrdersResponse;
import com.petalio.blossom.network.OrderSummaryDto;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * C4. Customer Orders & Delivery Tracking Fragment.
 * Uses a vertical RecyclerView (OrdersAdapter) to stack ALL active and history orders
 * with live real-time filtering, stepper progress, and direct tracking & rating.
 */
public class OrdersFragment extends Fragment implements OrdersAdapter.OnOrderActionListener {

    private TextView tabActiveOrders, tabHistoryOrders;
    private RecyclerView rvCustomerOrders;
    private OrdersAdapter ordersAdapter;

    private View layoutEmptyOrders;
    private ImageView ivEmptyOrdersIcon;
    private TextView tvEmptyOrdersTitle, tvEmptyOrdersSub;

    private final List<OrderSummaryDto> activeOrdersList = new ArrayList<>();
    private final List<OrderSummaryDto> historyOrdersList = new ArrayList<>();
    private boolean isHistoryTab = false;
    private int lastLoadedCustomerId = -1;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_orders, container, false);

        initViews(view);
        setupRecyclerView();
        setupTabs();

        if (getArguments() != null && getArguments().getBoolean("SHOW_HISTORY", false)) {
            showHistoryTab();
        } else {
            showActiveTab();
        }
        fetchLiveCustomerOrders();

        return view;
    }

    @Override
    public void onResume() {
        super.onResume();
        if (!isHidden()) {
            fetchLiveCustomerOrders();
        }
    }

    @Override
    public void onHiddenChanged(boolean hidden) {
        super.onHiddenChanged(hidden);
        if (!hidden && isAdded()) {
            fetchLiveCustomerOrders();
        }
    }

    public void openHistoryTab() {
        showHistoryTab();
    }

    private void initViews(View v) {
        tabActiveOrders = v.findViewById(R.id.tabActiveOrders);
        tabHistoryOrders = v.findViewById(R.id.tabHistoryOrders);

        rvCustomerOrders = v.findViewById(R.id.rvCustomerOrders);
        layoutEmptyOrders = v.findViewById(R.id.layoutEmptyOrders);
        ivEmptyOrdersIcon = v.findViewById(R.id.ivEmptyOrdersIcon);
        tvEmptyOrdersTitle = v.findViewById(R.id.tvEmptyOrdersTitle);
        tvEmptyOrdersSub = v.findViewById(R.id.tvEmptyOrdersSub);
    }

    private void setupRecyclerView() {
        ordersAdapter = new OrdersAdapter(requireContext(), this);
        rvCustomerOrders.setLayoutManager(new LinearLayoutManager(getContext()));
        rvCustomerOrders.setHasFixedSize(false);
        rvCustomerOrders.setAdapter(ordersAdapter);
    }

    private void setupTabs() {
        AnimationUtilsHelper.applyPressScale(tabActiveOrders);
        AnimationUtilsHelper.applyPressScale(tabHistoryOrders);
        tabActiveOrders.setOnClickListener(v -> showActiveTab());
        tabHistoryOrders.setOnClickListener(v -> showHistoryTab());
    }

    private void showActiveTab() {
        if (getContext() == null) return;
        isHistoryTab = false;

        tabActiveOrders.setBackgroundResource(R.drawable.bg_chip_selected);
        tabActiveOrders.setTextColor(ContextCompat.getColor(requireContext(), R.color.text_white));

        tabHistoryOrders.setBackgroundResource(R.drawable.bg_chip_unselected);
        tabHistoryOrders.setTextColor(ContextCompat.getColor(requireContext(), R.color.text_primary));

        updateDisplayedOrders();
    }

    private void showHistoryTab() {
        if (getContext() == null) return;
        isHistoryTab = true;

        tabHistoryOrders.setBackgroundResource(R.drawable.bg_chip_selected);
        tabHistoryOrders.setTextColor(ContextCompat.getColor(requireContext(), R.color.text_white));

        tabActiveOrders.setBackgroundResource(R.drawable.bg_chip_unselected);
        tabActiveOrders.setTextColor(ContextCompat.getColor(requireContext(), R.color.text_primary));

        updateDisplayedOrders();
    }

    private void updateDisplayedOrders() {
        if (isHistoryTab) {
            ordersAdapter.setOrders(historyOrdersList);
            if (historyOrdersList.isEmpty()) {
                rvCustomerOrders.setVisibility(View.GONE);
                layoutEmptyOrders.setVisibility(View.VISIBLE);
                if (ivEmptyOrdersIcon != null) {
                    ivEmptyOrdersIcon.setImageResource(R.drawable.ic_crown);
                    ivEmptyOrdersIcon.setColorFilter(ContextCompat.getColor(requireContext(), R.color.gold_loyalty));
                }
                if (tvEmptyOrdersTitle != null) {
                    tvEmptyOrdersTitle.setText("No past orders yet");
                }
                if (tvEmptyOrdersSub != null) {
                    tvEmptyOrdersSub.setText("Your completed orders and receipts will appear here once delivered.");
                }
            } else {
                rvCustomerOrders.setVisibility(View.VISIBLE);
                layoutEmptyOrders.setVisibility(View.GONE);
            }
        } else {
            ordersAdapter.setOrders(activeOrdersList);
            if (activeOrdersList.isEmpty()) {
                rvCustomerOrders.setVisibility(View.GONE);
                layoutEmptyOrders.setVisibility(View.VISIBLE);
                if (ivEmptyOrdersIcon != null) {
                    ivEmptyOrdersIcon.setImageResource(R.drawable.ic_flower_petal);
                    ivEmptyOrdersIcon.setColorFilter(ContextCompat.getColor(requireContext(), R.color.accent_blossom_pink));
                }
                if (tvEmptyOrdersTitle != null) {
                    tvEmptyOrdersTitle.setText("No active orders yet");
                }
                if (tvEmptyOrdersSub != null) {
                    tvEmptyOrdersSub.setText("When you place a fresh floral order, you can track its delivery status here in real time.");
                }
            } else {
                rvCustomerOrders.setVisibility(View.VISIBLE);
                layoutEmptyOrders.setVisibility(View.GONE);
            }
        }
    }

    private int resolveCustomerId() {
        if (getContext() == null) return -1;
        int custId = PetalioUserPrefs.getCustomerId(requireContext());
        return custId > 0 ? custId : PetalioUserPrefs.getUserId(requireContext());
    }

    private void fetchLiveCustomerOrders() {
        if (getContext() == null) return;
        int customerId = resolveCustomerId();
        if (customerId <= 0) {
            lastLoadedCustomerId = -1;
            activeOrdersList.clear();
            historyOrdersList.clear();
            updateDisplayedOrders();
            return;
        }
        if (customerId != lastLoadedCustomerId) {
            lastLoadedCustomerId = customerId;
            activeOrdersList.clear();
            historyOrdersList.clear();
            updateDisplayedOrders();
        }

        ApiClient.getApiService(requireContext())
                .getCustomerOrders(customerId)
                .enqueue(new Callback<CustomerOrdersResponse>() {
                    @Override
                    public void onResponse(Call<CustomerOrdersResponse> call, Response<CustomerOrdersResponse> response) {
                        if (!isAdded() || getContext() == null) return;
                        if (resolveCustomerId() != customerId) return;
                        if (response.isSuccessful() && response.body() != null && response.body().getOrders() != null) {
                            List<OrderSummaryDto> orders = response.body().getOrders();
                            filterAndPopulateOrders(orders);
                        }
                    }

                    @Override
                    public void onFailure(Call<CustomerOrdersResponse> call, Throwable t) {
                        if (!isAdded() || getContext() == null) return;
                        // Keep current view state gracefully
                    }
                });
    }

    private void filterAndPopulateOrders(List<OrderSummaryDto> orders) {
        activeOrdersList.clear();
        historyOrdersList.clear();

        if (orders != null) {
            for (OrderSummaryDto o : orders) {
                String s = o.getStatus() != null ? o.getStatus().toUpperCase() : "";
                String fs = o.getFulfilmentStatus() != null ? o.getFulfilmentStatus().toUpperCase() : "";
                String ds = o.getDeliveryStatus() != null ? o.getDeliveryStatus().toUpperCase() : "";

                if (s.equals("DELIVERED") || fs.equals("DELIVERED") || ds.equals("DELIVERED") ||
                        s.equals("CANCELLED") || fs.equals("CANCELLED")) {
                    historyOrdersList.add(o);
                } else {
                    activeOrdersList.add(o);
                }
            }
        }

        updateDisplayedOrders();
    }

    @Override
    public void onTrackOrder(OrderSummaryDto order) {
        if (order == null || getContext() == null) return;
        String code = order.getOrderCode() != null && !order.getOrderCode().isEmpty()
                ? order.getOrderCode() : ("PB-" + order.getOrderId());
        String status = order.getFulfilmentStatus() != null && !order.getFulfilmentStatus().isEmpty()
                ? order.getFulfilmentStatus() : order.getStatus();

        String dateToPass = order.getDeliveryDate() != null && !order.getDeliveryDate().isEmpty() && !order.getDeliveryDate().equalsIgnoreCase("null")
                ? order.getDeliveryDate() : order.getOrderDate();

        Intent intent = new Intent(getContext(), DeliveryTrackingActivity.class);
        intent.putExtra("ORDER_ID", code);
        intent.putExtra("ORDER_STATUS", status);
        intent.putExtra("DELIVERY_DATE", dateToPass);
        intent.putExtra("ORDER_DATE", order.getOrderDate());
        intent.putExtra("DRIVER_NAME", order.getDriverName());
        intent.putExtra("VEHICLE_NUMBER", order.getVehicleNumber());
        intent.putExtra("DRIVER_PHONE", order.getDriverPhone());
        intent.putExtra("ITEMS_SUMMARY", order.getItemsSummary());
        startActivity(intent);
    }

    @Override
    public void onRateOrder(OrderSummaryDto order) {
        if (order == null || getContext() == null) return;
        String code = order.getOrderCode() != null && !order.getOrderCode().isEmpty()
                ? order.getOrderCode() : ("PB-" + order.getOrderId());

        Intent intent = new Intent(getContext(), RateOrderActivity.class);
        intent.putExtra("ORDER_DB_ID", order.getOrderId());
        intent.putExtra("ORDER_ID", code);
        intent.putExtra("PRESET_RATING", 5);
        startActivity(intent);
    }

    @Override
    public void onViewDetails(OrderSummaryDto order) {
        if (order == null || getContext() == null) return;
        String code = order.getOrderCode() != null && !order.getOrderCode().isEmpty()
                ? order.getOrderCode() : ("PB-" + order.getOrderId());
        String status = order.getFulfilmentStatus() != null && !order.getFulfilmentStatus().isEmpty()
                ? order.getFulfilmentStatus() : order.getStatus();
        int total = (int) Math.round(order.getTotalAmount());
        String items = order.getItemsSummary() != null ? order.getItemsSummary() : "";
        String address = order.getDeliveryAddress() != null ? order.getDeliveryAddress() : "";

        Intent intent = new Intent(getContext(), CustomerOrderDetailsActivity.class);
        intent.putExtra("ORDER_DB_ID", order.getOrderId());
        intent.putExtra("ORDER_ID", code.startsWith("#") ? code : ("#" + code));
        intent.putExtra("ORDER_STATUS", status);
        intent.putExtra("ORDER_DATE", order.getOrderDate());
        intent.putExtra("DELIVERY_ADDRESS", address);
        intent.putExtra("ITEM1_ICON", "");
        intent.putExtra("ITEM1_TITLE", items);
        intent.putExtra("ITEM1_QTY", "");
        intent.putExtra("ITEM1_PRICE", "Rs. " + total);
        intent.putExtra("HAS_ITEM2", false);
        intent.putExtra("ORDER_SUBTOTAL", "Rs. " + total);
        intent.putExtra("ORDER_TOTAL", "Rs. " + total);
        startActivity(intent);
    }
}
