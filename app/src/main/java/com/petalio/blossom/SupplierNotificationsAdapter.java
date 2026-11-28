package com.petalio.blossom;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import com.petalio.blossom.network.SupplierNotificationDto;

import java.util.List;

/**
 * Adapter rendering live supplier notifications (Order Requests, Payments, Low Stock Alerts).
 */
public class SupplierNotificationsAdapter extends RecyclerView.Adapter<SupplierNotificationsAdapter.NotifViewHolder> {

    public interface OnNotificationClickListener {
        void onNotificationClick(SupplierNotificationDto item);
    }

    private final List<SupplierNotificationDto> items;
    private final OnNotificationClickListener listener;

    public SupplierNotificationsAdapter(List<SupplierNotificationDto> items, OnNotificationClickListener listener) {
        this.items = items;
        this.listener = listener;
    }

    @NonNull
    @Override
    public NotifViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_supplier_notification, parent, false);
        return new NotifViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull NotifViewHolder holder, int position) {
        SupplierNotificationDto item = items.get(position);
        Context ctx = holder.itemView.getContext();

        holder.tvTitle.setText(item.getTitle());
        holder.tvSubtitle.setText(item.getSubtitle());
        holder.tvHint.setText(item.getActionHint());

        String type = item.getType().toUpperCase();
        String badge = item.getBadge();
        holder.tvBadge.setText(badge.isEmpty() ? "Alert" : badge);

        if ("ORDER_REQUEST".equals(type)) {
            holder.tvBadge.setBackgroundResource(R.drawable.bg_badge_pending_amber);
            holder.tvBadge.setTextColor(ContextCompat.getColor(ctx, R.color.gold_loyalty));
            holder.tvHint.setTextColor(ContextCompat.getColor(ctx, R.color.primary_forest));
        } else if ("PAYMENT".equals(type)) {
            holder.tvBadge.setBackgroundResource(R.drawable.bg_badge_in_stock);
            holder.tvBadge.setTextColor(ContextCompat.getColor(ctx, R.color.badge_in_stock_text));
            holder.tvHint.setTextColor(ContextCompat.getColor(ctx, R.color.accent_leaf_green));
        } else {
            holder.tvBadge.setBackgroundResource(R.drawable.bg_badge_status);
            holder.tvBadge.setTextColor(ContextCompat.getColor(ctx, R.color.badge_dispatched_text));
            holder.tvHint.setTextColor(ContextCompat.getColor(ctx, R.color.accent_blossom_pink));
        }

        AnimationUtilsHelper.applyPressScale(holder.card);
        holder.card.setOnClickListener(v -> {
            if (listener != null) {
                listener.onNotificationClick(item);
            }
        });
    }

    @Override
    public int getItemCount() {
        return items != null ? items.size() : 0;
    }

    static class NotifViewHolder extends RecyclerView.ViewHolder {
        View card;
        TextView tvTitle, tvBadge, tvSubtitle, tvHint;

        NotifViewHolder(@NonNull View itemView) {
            super(itemView);
            card = itemView.findViewById(R.id.cardSupplierNotif);
            tvTitle = itemView.findViewById(R.id.tvSupplierNotifTitle);
            tvBadge = itemView.findViewById(R.id.tvSupplierNotifBadge);
            tvSubtitle = itemView.findViewById(R.id.tvSupplierNotifSubtitle);
            tvHint = itemView.findViewById(R.id.tvSupplierNotifHint);
        }
    }
}
