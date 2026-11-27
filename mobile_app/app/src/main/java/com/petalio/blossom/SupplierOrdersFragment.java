package com.petalio.blossom;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.CommonResponse;
import com.petalio.blossom.network.OrderStatusUpdateRequest;
import com.petalio.blossom.network.SupplierOrderDto;
import com.petalio.blossom.network.SupplierOrdersListResponse;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * SupplierOrdersFragment: Real-time orders and harvest fulfilment queue driven
 * 100% by live MySQL backend.
 */
public class SupplierOrdersFragment extends Fragment {

    public static final int FILTER_NEW_REQUESTS = 0;
    public static final int FILTER_IN_PROGRESS = 1;
    public static final int FILTER_COMPLETED = 2;

    private RecyclerView rvOrders;
    private ProgressBar pbLoading;
    private LinearLayout layoutEmpty;
    private TextView tvOrdersHeaderTitle, tvOrdersHeaderSubtitle;
    private TextView tabNewRequests, tabInProgress, tabCompleted, tvEmptyOrders;
    private SupplierOrdersAdapter adapter;
    private final List<SupplierOrderDto> allOrdersList = new ArrayList<>();
    private final List<SupplierOrderDto> newRequestsList = new ArrayList<>();
    private final List<SupplierOrderDto> inProgressList = new ArrayList<>();
    private final List<SupplierOrderDto> completedOrdersList = new ArrayList<>();
    private final List<SupplierOrderDto> displayedOrderList = new ArrayList<>();
    private int selectedFilter = FILTER_NEW_REQUESTS;

    public static SupplierOrdersFragment newInstance(int initialFilter) {
        SupplierOrdersFragment fragment = new SupplierOrdersFragment();
        Bundle args = new Bundle();
        args.putInt("ORDER_FILTER", initialFilter);
        fragment.setArguments(args);
        return fragment;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
            @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_supplier_orders, container, false);

        if (getArguments() != null) {
            selectedFilter = getArguments().getInt("ORDER_FILTER", FILTER_NEW_REQUESTS);
        }

        initViews(view);
        setupRecyclerView();
        setupTabs();
        fetchLiveOrders();

        return view;
    }

    @Override
    public void onResume() {
        super.onResume();
        fetchLiveOrders();
    }

    public void setOrderFilter(int filter) {
        selectedFilter = filter;
        updateTabStyles();
        updateHeaderText();
        updateDisplayedList();
        if (rvOrders != null) {
            rvOrders.scrollToPosition(0);
        }
    }

    private void initViews(View v) {
        tvOrdersHeaderTitle = v.findViewById(R.id.tvOrdersHeaderTitle);
        tvOrdersHeaderSubtitle = v.findViewById(R.id.tvOrdersHeaderSubtitle);
        rvOrders = v.findViewById(R.id.rvSupplierOrders);
        pbLoading = v.findViewById(R.id.pbSupplierOrdersLoading);
        layoutEmpty = v.findViewById(R.id.layoutEmptySupplierOrders);
        tvEmptyOrders = v.findViewById(R.id.tvEmptySupplierOrders);
        tabNewRequests = v.findViewById(R.id.tabSupplierNewRequests);
        tabInProgress = v.findViewById(R.id.tabSupplierInProgress);
        tabCompleted = v.findViewById(R.id.tabSupplierCompleted);
    }

    private void setupRecyclerView() {
        if (getContext() == null || rvOrders == null)
            return;
        rvOrders.setLayoutManager(new LinearLayoutManager(requireContext()));
        rvOrders.setHasFixedSize(false);
        rvOrders.setItemViewCacheSize(12);
        adapter = new SupplierOrdersAdapter(displayedOrderList);
        rvOrders.setAdapter(adapter);
    }

    private void setupTabs() {
        if (tabNewRequests != null) {
            AnimationUtilsHelper.applyPressScale(tabNewRequests);
            tabNewRequests.setOnClickListener(v -> setOrderFilter(FILTER_NEW_REQUESTS));
        }
        if (tabInProgress != null) {
            AnimationUtilsHelper.applyPressScale(tabInProgress);
            tabInProgress.setOnClickListener(v -> setOrderFilter(FILTER_IN_PROGRESS));
        }
        if (tabCompleted != null) {
            AnimationUtilsHelper.applyPressScale(tabCompleted);
            tabCompleted.setOnClickListener(v -> setOrderFilter(FILTER_COMPLETED));
        }
        updateTabStyles();
        updateHeaderText();
    }

    private void updateHeaderText() {
        String title;
        String subtitle;
        if (selectedFilter == FILTER_IN_PROGRESS) {
            title = "Active Fulfilment";
            subtitle = "Accepted orders in harvesting, packing & dispatch";
        } else if (selectedFilter == FILTER_COMPLETED) {
            title = "Completed Orders";
            subtitle = "Delivered customer orders & completed settlements";
        } else {
            title = "New Order Requests";
            subtitle = "Incoming customer orders awaiting estate acceptance";
        }
        if (tvOrdersHeaderTitle != null) {
            tvOrdersHeaderTitle.setText(title);
        }
        if (tvOrdersHeaderSubtitle != null) {
            tvOrdersHeaderSubtitle.setText(subtitle);
        }
    }

    private void updateTabStyles() {
        if (getContext() == null)
            return;
        styleTab(tabNewRequests, selectedFilter == FILTER_NEW_REQUESTS);
        styleTab(tabInProgress, selectedFilter == FILTER_IN_PROGRESS);
        styleTab(tabCompleted, selectedFilter == FILTER_COMPLETED);
    }

    private void styleTab(TextView tab, boolean active) {
        if (tab == null || getContext() == null)
            return;
        tab.setBackgroundResource(active ? R.drawable.bg_chip_selected : R.drawable.bg_chip_unselected);
        tab.setTextColor(ContextCompat.getColor(requireContext(), active ? R.color.text_white : R.color.text_primary));
    }

    private void updateTabCounts() {
        if (tabNewRequests != null)
            tabNewRequests.setText("New (" + newRequestsList.size() + ")");
        if (tabInProgress != null)
            tabInProgress.setText("In Progress (" + inProgressList.size() + ")");
        if (tabCompleted != null)
            tabCompleted.setText("Completed (" + completedOrdersList.size() + ")");
    }

    private void updateDisplayedList() {
        displayedOrderList.clear();
        if (selectedFilter == FILTER_IN_PROGRESS) {
            displayedOrderList.addAll(inProgressList);
        } else if (selectedFilter == FILTER_COMPLETED) {
            displayedOrderList.addAll(completedOrdersList);
        } else {
            displayedOrderList.addAll(newRequestsList);
        }

        if (displayedOrderList.isEmpty()) {
            if (layoutEmpty != null)
                layoutEmpty.setVisibility(View.VISIBLE);
            if (rvOrders != null)
                rvOrders.setVisibility(View.GONE);
            if (tvEmptyOrders != null) {
                if (selectedFilter == FILTER_COMPLETED) {
                    tvEmptyOrders.setText("No completed orders yet\nDelivered orders will appear here.");
                } else if (selectedFilter == FILTER_IN_PROGRESS) {
                    tvEmptyOrders.setText(
                            "No orders currently in fulfillment\nAccept a pending request to start preparing.");
                } else {
                    tvEmptyOrders.setText("No new pending requests\nIncoming customer requests will appear here.");
                }
            }
        } else {
            if (layoutEmpty != null)
                layoutEmpty.setVisibility(View.GONE);
            if (rvOrders != null)
                rvOrders.setVisibility(View.VISIBLE);
        }
        if (adapter != null)
            adapter.notifyDataSetChanged();
    }

    private void fetchLiveOrders() {
        if (getContext() == null)
            return;
        int supplierId = PetalioUserPrefs.getSupplierId(requireContext());
        if (supplierId <= 0) {
            if (pbLoading != null)
                pbLoading.setVisibility(View.GONE);
            allOrdersList.clear();
            newRequestsList.clear();
            inProgressList.clear();
            completedOrdersList.clear();
            updateTabCounts();
            updateDisplayedList();
            return;
        }
        if (pbLoading != null && allOrdersList.isEmpty()) {
            pbLoading.setVisibility(View.VISIBLE);
        }

        ApiClient.getApiService(requireContext())
                .getSupplierOrdersList(supplierId)
                .enqueue(new Callback<SupplierOrdersListResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<SupplierOrdersListResponse> call,
                            @NonNull Response<SupplierOrdersListResponse> response) {
                        if (!isAdded() || getContext() == null)
                            return;
                        if (pbLoading != null)
                            pbLoading.setVisibility(View.GONE);

                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            List<SupplierOrderDto> orders = response.body().getOrders();
                            allOrdersList.clear();
                            newRequestsList.clear();
                            inProgressList.clear();
                            completedOrdersList.clear();

                            if (orders != null) {
                                allOrdersList.addAll(orders);
                                for (SupplierOrderDto o : orders) {
                                    String raw = o.getStatus() != null ? o.getStatus().toUpperCase() : "";
                                    String ful = o.getFulfilmentStatus() != null ? o.getFulfilmentStatus().toUpperCase()
                                            : "";
                                    if ("DELIVERED".equals(raw) || "DELIVERED".equals(ful)
                                            || "CANCELLED".equals(raw) || "CANCELLED".equals(ful)) {
                                        completedOrdersList.add(o);
                                    } else if ("PENDING".equals(raw) || "PENDING".equals(ful)) {
                                        newRequestsList.add(o);
                                    } else {
                                        inProgressList.add(o);
                                    }
                                }
                            }
                            updateTabCounts();
                            updateDisplayedList();
                        } else {
                            updateTabCounts();
                            updateDisplayedList();
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<SupplierOrdersListResponse> call, @NonNull Throwable t) {
                        if (!isAdded() || getContext() == null)
                            return;
                        if (pbLoading != null)
                            pbLoading.setVisibility(View.GONE);
                        updateTabCounts();
                        updateDisplayedList();
                    }
                });
    }

    private void updateOrderStatusOnServer(int orderId, String status, String fulfilmentStatus) {
        if (getContext() == null)
            return;
        Toast.makeText(requireContext(), "Updating order #" + orderId + "...", Toast.LENGTH_SHORT).show();

        OrderStatusUpdateRequest req = new OrderStatusUpdateRequest(status, fulfilmentStatus);
        ApiClient.getApiService(requireContext())
                .updateOrderStatusLive(orderId, req)
                .enqueue(new Callback<CommonResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<CommonResponse> call,
                            @NonNull Response<CommonResponse> response) {
                        if (!isAdded() || getContext() == null)
                            return;
                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            Toast.makeText(requireContext(), "✓ Order updated to " + fulfilmentStatus,
                                    Toast.LENGTH_SHORT).show();
                            fetchLiveOrders();
                        } else {
                            String msg = (response.body() != null && response.body().getMessage() != null
                                    && !response.body().getMessage().trim().isEmpty())
                                            ? response.body().getMessage()
                                            : ApiClient.extractErrorMessage(response, "Failed to update order status");
                            Toast.makeText(requireContext(), msg, Toast.LENGTH_SHORT).show();
                            fetchLiveOrders();
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<CommonResponse> call, @NonNull Throwable t) {
                        if (!isAdded() || getContext() == null)
                            return;
                        Toast.makeText(requireContext(), "Network error: Could not update order status",
                                Toast.LENGTH_SHORT).show();
                        fetchLiveOrders();
                    }
                });
    }

    /**
     * Inner Adapter for Supplier Orders
     */
    private class SupplierOrdersAdapter extends RecyclerView.Adapter<SupplierOrdersAdapter.OrderViewHolder> {

        private final List<SupplierOrderDto> items;

        public SupplierOrdersAdapter(List<SupplierOrderDto> items) {
            this.items = items;
        }

        @NonNull
        @Override
        public OrderViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_supplier_order_card, parent,
                    false);
            return new OrderViewHolder(view);
        }

        @Override
        public void onBindViewHolder(OrderViewHolder holder, int position) {
            SupplierOrderDto order = items.get(position);

            holder.tvOrderCode.setText(order.getOrderCode());

            String summary = order.getFlowerSummary();
            if (summary.isEmpty()) {
                int qty = order.getTotalQuantity();
                summary = qty > 0 ? (qty + (qty == 1 ? " stem" : " stems")) : "—";
            }
            holder.tvOrderSummary.setText(summary);

            String address = order.getDeliveryAddress().isEmpty() ? order.getDeliveryCity()
                    : order.getDeliveryAddress();
            holder.tvCustomerInfo.setText(address.isEmpty()
                    ? ("Customer: " + order.getCustomerName())
                    : ("Customer: " + order.getCustomerName() + " · " + address));
            holder.tvOrderAmount.setText("Rs. " + String.format("%,.0f", order.getTotalAmount()));

            String date = order.getCreatedAt();
            if (date != null && date.length() > 10) {
                date = date.substring(0, 10);
            }
            holder.tvOrderDate.setText(date != null && !date.isEmpty() ? date : "Recent");

            String fulfilment = order.getFulfilmentStatus();
            String rawStatus = order.getStatus();

            boolean isDelivered = "DELIVERED".equalsIgnoreCase(rawStatus) || "Delivered".equalsIgnoreCase(fulfilment);
            boolean isCancelled = "CANCELLED".equalsIgnoreCase(rawStatus) || "Cancelled".equalsIgnoreCase(fulfilment);
            boolean isPending = !isDelivered && !isCancelled
                    && ("PENDING".equalsIgnoreCase(rawStatus) || "Pending".equalsIgnoreCase(fulfilment));
            boolean isDispatched = !isDelivered && !isCancelled && !isPending
                    && ("DISPATCHED".equalsIgnoreCase(rawStatus) || "SHIPPED".equalsIgnoreCase(rawStatus)
                            || "Dispatched".equalsIgnoreCase(fulfilment));
            boolean isReady = !isDelivered && !isCancelled && !isPending && !isDispatched
                    && ("Ready".equalsIgnoreCase(fulfilment) || "READY".equalsIgnoreCase(rawStatus));

            holder.btnUpdateFulfilment.setEnabled(true);

            if (isDelivered) {
                holder.tvOrderStatus.setText("Delivered");
                holder.tvOrderStatus.setBackgroundResource(R.drawable.bg_badge_in_stock);
                holder.tvOrderStatus.setTextColor(
                        ContextCompat.getColor(holder.itemView.getContext(), R.color.badge_in_stock_text));
                holder.layoutPendingActions.setVisibility(View.GONE);
                holder.btnUpdateFulfilment.setVisibility(View.GONE);
            } else if (isCancelled) {
                holder.tvOrderStatus.setText("Cancelled");
                holder.tvOrderStatus.setBackgroundResource(R.drawable.bg_badge_status);
                holder.tvOrderStatus.setTextColor(
                        ContextCompat.getColor(holder.itemView.getContext(), R.color.badge_dispatched_text));
                holder.layoutPendingActions.setVisibility(View.GONE);
                holder.btnUpdateFulfilment.setVisibility(View.GONE);
            } else if (isPending) {
                holder.tvOrderStatus.setText("Pending");
                holder.tvOrderStatus.setBackgroundResource(R.drawable.bg_badge_pending_amber);
                holder.tvOrderStatus
                        .setTextColor(ContextCompat.getColor(holder.itemView.getContext(), R.color.gold_loyalty));
                holder.layoutPendingActions.setVisibility(View.VISIBLE);
                holder.btnUpdateFulfilment.setVisibility(View.GONE);
            } else if (isDispatched) {
                holder.tvOrderStatus.setText("Dispatched");
                holder.tvOrderStatus.setBackgroundResource(R.drawable.bg_badge_in_stock);
                holder.tvOrderStatus
                        .setTextColor(ContextCompat.getColor(holder.itemView.getContext(), R.color.primary_brand));
                holder.layoutPendingActions.setVisibility(View.GONE);
                holder.btnUpdateFulfilment.setVisibility(View.VISIBLE);
                holder.btnUpdateFulfilment.setText("Mark Delivered ✓");
                holder.btnUpdateFulfilment.setOnClickListener(v -> {
                    holder.btnUpdateFulfilment.setEnabled(false);
                    updateOrderStatusOnServer(order.getOrderId(), "DELIVERED", "Delivered");
                });
            } else if (isReady) {
                holder.tvOrderStatus.setText("Ready");
                holder.tvOrderStatus.setBackgroundResource(R.drawable.bg_badge_in_stock);
                holder.tvOrderStatus.setTextColor(
                        ContextCompat.getColor(holder.itemView.getContext(), R.color.badge_in_stock_text));
                holder.layoutPendingActions.setVisibility(View.GONE);
                holder.btnUpdateFulfilment.setVisibility(View.VISIBLE);
                holder.btnUpdateFulfilment.setText("Update Fulfilment (Ready) →");
                holder.btnUpdateFulfilment
                        .setOnClickListener(v -> openHarvestFulfilment(holder.itemView.getContext(), order));
            } else {
                String label = (fulfilment != null && !fulfilment.isEmpty() && !"Pending".equalsIgnoreCase(fulfilment))
                        ? fulfilment
                        : "Preparing";
                holder.tvOrderStatus.setText(label);
                holder.tvOrderStatus.setBackgroundResource(R.drawable.bg_badge_in_stock);
                holder.tvOrderStatus.setTextColor(
                        ContextCompat.getColor(holder.itemView.getContext(), R.color.badge_in_stock_text));
                holder.layoutPendingActions.setVisibility(View.GONE);
                holder.btnUpdateFulfilment.setVisibility(View.VISIBLE);
                holder.btnUpdateFulfilment.setText("Update Fulfilment (" + label + ") →");
                holder.btnUpdateFulfilment
                        .setOnClickListener(v -> openHarvestFulfilment(holder.itemView.getContext(), order));
            }

            AnimationUtilsHelper.applyPressScale(holder.btnAcceptOrder);
            AnimationUtilsHelper.applyPressScale(holder.btnRejectOrder);
            AnimationUtilsHelper.applyPressScale(holder.btnUpdateFulfilment);

            holder.btnAcceptOrder
                    .setOnClickListener(v -> updateOrderStatusOnServer(order.getOrderId(), "CONFIRMED", "Preparing"));

            holder.btnRejectOrder
                    .setOnClickListener(v -> updateOrderStatusOnServer(order.getOrderId(), "CANCELLED", "Cancelled"));
        }

        private void openHarvestFulfilment(Context ctx, SupplierOrderDto order) {
            Intent intent = new Intent(ctx, HarvestFulfilmentActivity.class);
            intent.putExtra("order_id", String.valueOf(order.getOrderId()));
            intent.putExtra("order_code", order.getOrderCode());
            intent.putExtra("flower_summary", order.getFlowerSummary());
            intent.putExtra("quantity", order.getTotalQuantity());
            intent.putExtra("delivery_address", order.getDeliveryAddress());
            intent.putExtra("customer_name", order.getCustomerName());
            intent.putExtra("status", order.getFulfilmentStatus());
            ctx.startActivity(intent);
        }

        @Override
        public int getItemCount() {
            return items.size();
        }

        class OrderViewHolder extends RecyclerView.ViewHolder {
            TextView tvOrderCode, tvOrderStatus, tvOrderSummary, tvCustomerInfo, tvOrderAmount, tvOrderDate;
            LinearLayout layoutPendingActions;
            Button btnRejectOrder, btnAcceptOrder, btnUpdateFulfilment;

            OrderViewHolder(View itemView) {
                super(itemView);
                tvOrderCode = itemView.findViewById(R.id.tvOrderCode);
                tvOrderStatus = itemView.findViewById(R.id.tvOrderStatus);
                tvOrderSummary = itemView.findViewById(R.id.tvOrderSummary);
                tvCustomerInfo = itemView.findViewById(R.id.tvCustomerInfo);
                tvOrderAmount = itemView.findViewById(R.id.tvOrderAmount);
                tvOrderDate = itemView.findViewById(R.id.tvOrderDate);
                layoutPendingActions = itemView.findViewById(R.id.layoutPendingActions);
                btnRejectOrder = itemView.findViewById(R.id.btnRejectOrder);
                btnAcceptOrder = itemView.findViewById(R.id.btnAcceptOrder);
                btnUpdateFulfilment = itemView.findViewById(R.id.btnUpdateFulfilment);
            }
        }
    }
}
