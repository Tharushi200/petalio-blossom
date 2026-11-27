package com.petalio.blossom;

import android.content.Context;
import android.content.Intent;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import com.petalio.blossom.network.OrderSummaryDto;

import java.util.ArrayList;
import java.util.List;

/**
 * Adapter for rendering real customer order status updates inside the Notifications BottomSheetDialog.
 */
public class OrderNotificationsAdapter extends RecyclerView.Adapter<OrderNotificationsAdapter.NotificationViewHolder> {

    public interface OnNotificationClickListener {
        void onNotificationClick(OrderSummaryDto order);
    }

    private final Context context;
    private final List<OrderSummaryDto> orders = new ArrayList<>();
    private final OnNotificationClickListener listener;

    public OrderNotificationsAdapter(Context context, OnNotificationClickListener listener) {
        this.context = context;
        this.listener = listener;
    }

    public void setOrders(List<OrderSummaryDto> newOrders) {
        this.orders.clear();
        if (newOrders != null) {
            this.orders.addAll(newOrders);
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public NotificationViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_order_notification, parent, false);
        return new NotificationViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull NotificationViewHolder holder, int position) {
        holder.bind(orders.get(position));
    }

    @Override
    public int getItemCount() {
        return orders.size();
    }

    class NotificationViewHolder extends RecyclerView.ViewHolder {

        private final View cardNotificationItem;
        private final ImageView ivNotifIcon;
        private final TextView tvNotifStatusTitle;
        private final TextView tvNotifBadge;
        private final TextView tvNotifMessage;
        private final TextView tvNotifTime;

        NotificationViewHolder(@NonNull View itemView) {
            super(itemView);
            cardNotificationItem = itemView.findViewById(R.id.cardNotificationItem);
            ivNotifIcon = itemView.findViewById(R.id.ivNotifIcon);
            tvNotifStatusTitle = itemView.findViewById(R.id.tvNotifStatusTitle);
            tvNotifBadge = itemView.findViewById(R.id.tvNotifBadge);
            tvNotifMessage = itemView.findViewById(R.id.tvNotifMessage);
            tvNotifTime = itemView.findViewById(R.id.tvNotifTime);
        }

        void bind(OrderSummaryDto order) {
            if (order == null) return;

            String rawStatus = order.getFulfilmentStatus() != null && !order.getFulfilmentStatus().isEmpty()
                    ? order.getFulfilmentStatus().toUpperCase()
                    : (order.getStatus() != null ? order.getStatus().toUpperCase() : "PENDING");

            String orderCode = order.getOrderCode() != null && !order.getOrderCode().isEmpty()
                    ? order.getOrderCode() : ("PB-" + order.getOrderId());
            if (!orderCode.startsWith("#")) orderCode = "#" + orderCode;

            String items = order.getItemsSummary() != null && !order.getItemsSummary().isEmpty()
                    ? (" (" + order.getItemsSummary() + ")") : "";

            String title;
            String message;
            int iconRes;
            int iconColor;
            int badgeBg;
            int badgeTextColor;
            String badgeText;

            if (rawStatus.contains("DELIVER")) {
                title = "Order Delivered";
                badgeText = "Delivered";
                badgeBg = R.drawable.bg_badge_in_stock;
                badgeTextColor = ContextCompat.getColor(context, R.color.emerald_accent);
                iconRes = R.drawable.ic_verified_badge;
                iconColor = ContextCompat.getColor(context, R.color.emerald_accent);
                String driver = order.getDriverName();
                if (!TextUtils.isEmpty(driver) && !"null".equalsIgnoreCase(driver) && !"Unassigned".equalsIgnoreCase(driver)) {
                    message = "Your floral order " + orderCode + items + " was delivered by " + driver + ".";
                } else {
                    message = "Your floral order " + orderCode + items + " has been delivered via Petalio Express.";
                }
            } else if (rawStatus.contains("DISPATCH") || rawStatus.contains("TRANSIT") || rawStatus.contains("SHIP") || rawStatus.contains("WAY")) {
                title = "Out for Delivery";
                badgeText = "Dispatched";
                badgeBg = R.drawable.bg_badge_pending_amber;
                badgeTextColor = ContextCompat.getColor(context, R.color.primary_brand);
                iconRes = R.drawable.ic_location_pin;
                iconColor = ContextCompat.getColor(context, R.color.petalio_burgundy);
                String driver = order.getDriverName();
                if (!TextUtils.isEmpty(driver) && !"null".equalsIgnoreCase(driver) && !"Unassigned".equalsIgnoreCase(driver)) {
                    message = "Your floral order " + orderCode + items + " is out for delivery with " + driver + ".";
                } else {
                    message = "Your floral order " + orderCode + items + " is out for luxury same-day delivery.";
                }
            } else if (rawStatus.contains("PREPAR")) {
                title = "Order Preparing";
                badgeText = "Preparing";
                badgeBg = R.drawable.bg_badge_pending_amber;
                badgeTextColor = ContextCompat.getColor(context, R.color.primary_brand);
                iconRes = R.drawable.ic_gift_box;
                iconColor = ContextCompat.getColor(context, R.color.petalio_burgundy);
                message = "Your floral order " + orderCode + items + " is being fresh-picked and hand-arranged by our florists.";
            } else if (rawStatus.contains("CANCEL")) {
                title = "Order Cancelled";
                badgeText = "Cancelled";
                badgeBg = R.drawable.bg_chip_unselected;
                badgeTextColor = ContextCompat.getColor(context, R.color.text_secondary);
                iconRes = R.drawable.ic_notifications;
                iconColor = ContextCompat.getColor(context, R.color.text_secondary);
                message = "Your floral order " + orderCode + " was cancelled.";
            } else {
                // Placed / Pending
                title = "Order Placed";
                badgeText = "Placed";
                badgeBg = R.drawable.bg_badge_pending_amber;
                badgeTextColor = ContextCompat.getColor(context, R.color.primary_brand);
                iconRes = R.drawable.ic_flower_petal;
                iconColor = ContextCompat.getColor(context, R.color.petalio_burgundy);
                message = "Your floral order " + orderCode + items + " has been confirmed and received.";
            }

            tvNotifStatusTitle.setText(title);
            tvNotifMessage.setText(message);
            tvNotifBadge.setText(badgeText);
            tvNotifBadge.setBackgroundResource(badgeBg);
            tvNotifBadge.setTextColor(badgeTextColor);

            ivNotifIcon.setImageResource(iconRes);
            ivNotifIcon.setColorFilter(iconColor);

            String formattedDate = formatNotifDate(order.getDeliveryDate(), order.getOrderDate());
            tvNotifTime.setText(formattedDate + " • Tap to track live ›");

            AnimationUtilsHelper.applyPressScale(cardNotificationItem);
            cardNotificationItem.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onNotificationClick(order);
                }
            });
        }

        private String formatNotifDate(String deliveryDate, String orderDate) {
            String raw = !TextUtils.isEmpty(deliveryDate) && !"null".equalsIgnoreCase(deliveryDate)
                    ? deliveryDate : orderDate;
            if (TextUtils.isEmpty(raw) || "null".equalsIgnoreCase(raw)) return "Today";

            try {
                String clean = raw.replace("T", " ").replace("Z", "");
                if (clean.contains(".")) clean = clean.substring(0, clean.indexOf("."));
                if (clean.length() >= 10) {
                    String ymd = clean.substring(0, 10);
                    String[] parts = ymd.split("-");
                    if (parts.length == 3) {
                        int m = Integer.parseInt(parts[1]);
                        int d = Integer.parseInt(parts[2]);
                        int y = Integer.parseInt(parts[0]);
                        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
                        if (m >= 1 && m <= 12) {
                            return d + " " + months[m - 1] + " " + y;
                        }
                    }
                }
            } catch (Exception ignored) {}
            return raw;
        }
    }
}
