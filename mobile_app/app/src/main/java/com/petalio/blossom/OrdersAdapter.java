package com.petalio.blossom;

import android.content.Context;
import android.content.res.ColorStateList;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.cardview.widget.CardView;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import com.petalio.blossom.network.OrderSummaryDto;

import java.util.ArrayList;
import java.util.List;

/**
 * Modern RecyclerView Adapter for Customer Orders (Active & History).
 * Renders individual order cards with real status, 4-step progress stepper,
 * live driver/delivery details, and interactive tracking / rating actions.
 */
public class OrdersAdapter extends RecyclerView.Adapter<OrdersAdapter.OrderViewHolder> {

    public interface OnOrderActionListener {
        void onTrackOrder(OrderSummaryDto order);
        void onRateOrder(OrderSummaryDto order);
        void onViewDetails(OrderSummaryDto order);
    }

    private final Context context;
    private final List<OrderSummaryDto> orders = new ArrayList<>();
    private final OnOrderActionListener listener;

    public OrdersAdapter(Context context, OnOrderActionListener listener) {
        this.context = context;
        this.listener = listener;
    }

    public void setOrders(List<OrderSummaryDto> newOrders) {
        orders.clear();
        if (newOrders != null) {
            orders.addAll(newOrders);
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public OrderViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_customer_order_card, parent, false);
        return new OrderViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull OrderViewHolder holder, int position) {
        OrderSummaryDto order = orders.get(position);
        holder.bind(order);
    }

    @Override
    public void onViewRecycled(@NonNull OrderViewHolder holder) {
        super.onViewRecycled(holder);
        holder.clearPulseAnimations();
    }

    @Override
    public int getItemCount() {
        return orders.size();
    }

    class OrderViewHolder extends RecyclerView.ViewHolder {

        private final CardView cardOrderContainer;
        private final TextView tvOrderCode, tvOrderStatusBadge, tvOrderItems, tvOrderTotal, tvOrderDeliveryDate;
        private final LinearLayout layoutStepperContainer, layoutRatingLocked;
        private final View layoutDeliveredActions;
        private final TextView btnRateOrder, tvViewDetails;

        // Stepper views
        private final View stepPlacedDot, stepLine1, stepPreparingDot, stepLine2, stepDispatchedDot, stepLine3, stepDeliveredDot;
        private final TextView stepPlacedText, stepPreparingText, stepDispatchedText, stepDeliveredText;

        OrderViewHolder(@NonNull View itemView) {
            super(itemView);
            cardOrderContainer = itemView.findViewById(R.id.cardOrderContainer);
            tvOrderCode = itemView.findViewById(R.id.tvOrderCode);
            tvOrderStatusBadge = itemView.findViewById(R.id.tvOrderStatusBadge);
            tvOrderItems = itemView.findViewById(R.id.tvOrderItems);
            tvOrderTotal = itemView.findViewById(R.id.tvOrderTotal);
            tvOrderDeliveryDate = itemView.findViewById(R.id.tvOrderDeliveryDate);

            layoutStepperContainer = itemView.findViewById(R.id.layoutStepperContainer);
            layoutRatingLocked = itemView.findViewById(R.id.layoutRatingLocked);
            layoutDeliveredActions = itemView.findViewById(R.id.layoutDeliveredActions);
            btnRateOrder = itemView.findViewById(R.id.btnRateOrder);
            tvViewDetails = itemView.findViewById(R.id.tvViewDetails);

            stepPlacedDot = itemView.findViewById(R.id.stepPlacedDot);
            stepLine1 = itemView.findViewById(R.id.stepLine1);
            stepPreparingDot = itemView.findViewById(R.id.stepPreparingDot);
            stepLine2 = itemView.findViewById(R.id.stepLine2);
            stepDispatchedDot = itemView.findViewById(R.id.stepDispatchedDot);
            stepLine3 = itemView.findViewById(R.id.stepLine3);
            stepDeliveredDot = itemView.findViewById(R.id.stepDeliveredDot);

            stepPlacedText = itemView.findViewById(R.id.stepPlacedText);
            stepPreparingText = itemView.findViewById(R.id.stepPreparingText);
            stepDispatchedText = itemView.findViewById(R.id.stepDispatchedText);
            stepDeliveredText = itemView.findViewById(R.id.stepDeliveredText);
        }

        void bind(OrderSummaryDto order) {
            clearPulseAnimations();

            String code = order.getOrderCode() != null && !order.getOrderCode().isEmpty()
                    ? order.getOrderCode() : ("PB-" + order.getOrderId());
            if (!code.startsWith("#")) {
                code = "#" + code;
            }
            tvOrderCode.setText("Order " + code);

            String rawStatus = order.getFulfilmentStatus() != null && !order.getFulfilmentStatus().isEmpty()
                    ? order.getFulfilmentStatus() : order.getStatus();
            String upper = (rawStatus != null ? rawStatus : "PENDING").toUpperCase();
            boolean isDelivered = upper.contains("DELIVER");
            boolean isCancelled = upper.contains("CANCEL");

            // Status Badge
            tvOrderStatusBadge.setText(formatStatusLabel(rawStatus));
            if (isDelivered) {
                tvOrderStatusBadge.setBackgroundResource(R.drawable.bg_badge_in_stock);
                tvOrderStatusBadge.setTextColor(ContextCompat.getColor(context, R.color.badge_in_stock_text));
            } else {
                tvOrderStatusBadge.setBackgroundResource(R.drawable.bg_badge_status);
                tvOrderStatusBadge.setTextColor(ContextCompat.getColor(context, R.color.primary_forest));
            }

            // Items summary
            String items = order.getItemsSummary() != null && !order.getItemsSummary().isEmpty()
                    ? order.getItemsSummary() : "Highland Floral Arrangement";
            tvOrderItems.setText(items);

            // Total amount
            int total = (int) Math.round(order.getTotalAmount());
            tvOrderTotal.setText("Total: Rs. " + total);

            // Date & Delivery hint
            if (isDelivered) {
                tvOrderDeliveryDate.setText("Delivered on " + formatHistoryDate(order.getOrderDate()));
                layoutStepperContainer.setVisibility(View.GONE);
                layoutRatingLocked.setVisibility(View.GONE);
                layoutDeliveredActions.setVisibility(View.VISIBLE);
            } else {
                String dateStr = formatDeliveryDate(order.getDeliveryDate(), order.getOrderDate());
                tvOrderDeliveryDate.setText("Expected delivery " + dateStr + " • Tap to track live");
                layoutStepperContainer.setVisibility(View.VISIBLE);
                layoutRatingLocked.setVisibility(View.VISIBLE);
                layoutDeliveredActions.setVisibility(View.GONE);

                // Apply Stepper Colors
                applyStepper(rawStatus,
                        stepPlacedDot, stepLine1, stepPlacedText,
                        stepPreparingDot, stepLine2, stepPreparingText,
                        stepDispatchedDot, stepLine3, stepDispatchedText,
                        stepDeliveredDot, stepDeliveredText);
            }

            // Action clicks
            AnimationUtilsHelper.applyPressScale(cardOrderContainer);
            cardOrderContainer.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onTrackOrder(order);
                }
            });

            if (btnRateOrder != null) {
                AnimationUtilsHelper.applyPressScale(btnRateOrder);
                btnRateOrder.setOnClickListener(v -> {
                    if (listener != null) {
                        listener.onRateOrder(order);
                    }
                });
            }

            if (tvViewDetails != null) {
                AnimationUtilsHelper.applyPressScale(tvViewDetails);
                tvViewDetails.setOnClickListener(v -> {
                    if (listener != null) {
                        listener.onViewDetails(order);
                    }
                });
            }
        }

        void clearPulseAnimations() {
            AnimationUtilsHelper.stopStepPulse(stepPlacedDot, stepPreparingDot, stepDispatchedDot, stepDeliveredDot);
        }

        private void applyStepper(String rawStatus,
                                  View dot1, View line1, TextView txt1,
                                  View dot2, View line2, TextView txt2,
                                  View dot3, View line3, TextView txt3,
                                  View dot4, TextView txt4) {
            AnimationUtilsHelper.stopStepPulse(dot1, dot2, dot3, dot4);

            int activeColor = ContextCompat.getColor(context, R.color.primary_forest);
            int inactiveColor = ContextCompat.getColor(context, R.color.divider_color);
            int activeTextColor = ContextCompat.getColor(context, R.color.primary_forest);
            int inactiveTextColor = ContextCompat.getColor(context, R.color.text_hint);

            String s = (rawStatus != null ? rawStatus : "").toUpperCase();
            boolean isCancelled = s.contains("CANCEL");
            int step = 1;
            if (s.contains("PREPAR") || s.contains("CONFIRM")) {
                step = 2;
            } else if (s.contains("DISPATCH") || s.contains("TRANSIT") || s.contains("SHIP") || s.contains("WAY")) {
                step = 3;
            } else if (s.contains("DELIVER")) {
                step = 4;
            }

            // Step 1: Placed
            dot1.setBackgroundTintList(ColorStateList.valueOf(activeColor));
            if (txt1 != null) {
                txt1.setTextColor(activeTextColor);
                txt1.setTypeface(null, android.graphics.Typeface.BOLD);
            }

            // Line 1 & Step 2: Preparing
            if (step >= 2) {
                if (line1 != null) line1.setBackgroundColor(activeColor);
                if (dot2 != null) dot2.setBackgroundTintList(ColorStateList.valueOf(activeColor));
                if (txt2 != null) {
                    txt2.setTextColor(activeTextColor);
                    txt2.setTypeface(null, android.graphics.Typeface.BOLD);
                }
            } else {
                if (line1 != null) line1.setBackgroundColor(inactiveColor);
                if (dot2 != null) dot2.setBackgroundTintList(ColorStateList.valueOf(inactiveColor));
                if (txt2 != null) {
                    txt2.setTextColor(inactiveTextColor);
                    txt2.setTypeface(null, android.graphics.Typeface.NORMAL);
                }
            }

            // Line 2 & Step 3: Dispatched
            if (step >= 3) {
                if (line2 != null) line2.setBackgroundColor(activeColor);
                if (dot3 != null) dot3.setBackgroundTintList(ColorStateList.valueOf(activeColor));
                if (txt3 != null) {
                    txt3.setTextColor(activeTextColor);
                    txt3.setTypeface(null, android.graphics.Typeface.BOLD);
                }
            } else {
                if (line2 != null) line2.setBackgroundColor(inactiveColor);
                if (dot3 != null) dot3.setBackgroundTintList(ColorStateList.valueOf(inactiveColor));
                if (txt3 != null) {
                    txt3.setTextColor(inactiveTextColor);
                    txt3.setTypeface(null, android.graphics.Typeface.NORMAL);
                }
            }

            // Line 3 & Step 4: Delivered
            if (step >= 4) {
                if (line3 != null) line3.setBackgroundColor(activeColor);
                if (dot4 != null) dot4.setBackgroundTintList(ColorStateList.valueOf(activeColor));
                if (txt4 != null) {
                    txt4.setTextColor(activeTextColor);
                    txt4.setTypeface(null, android.graphics.Typeface.BOLD);
                }
            } else {
                if (line3 != null) line3.setBackgroundColor(inactiveColor);
                if (dot4 != null) dot4.setBackgroundTintList(ColorStateList.valueOf(inactiveColor));
                if (txt4 != null) {
                    txt4.setTextColor(inactiveTextColor);
                    txt4.setTypeface(null, android.graphics.Typeface.NORMAL);
                }
            }

            // Apply pulse animation to the current active step dot only if in-progress and not cancelled
            if (!isCancelled && step < 4) {
                if (step == 1) {
                    AnimationUtilsHelper.startStepPulse(dot1);
                } else if (step == 2) {
                    AnimationUtilsHelper.startStepPulse(dot2);
                } else if (step == 3) {
                    AnimationUtilsHelper.startStepPulse(dot3);
                }
            }
        }

        private String formatStatusLabel(String status) {
            if (status == null) return "Pending";
            String upper = status.toUpperCase();
            if (upper.contains("PREPAR")) return "Preparing";
            if (upper.contains("DISPATCH") || upper.contains("TRANSIT") || upper.contains("SHIP") || upper.contains("WAY")) return "On the Way";
            if (upper.contains("DELIVER")) return "Delivered";
            if (upper.contains("CANCEL")) return "Cancelled";
            return "Order Placed";
        }

        private String formatDeliveryDate(String deliveryDateStr, String orderDateStr) {
            if (deliveryDateStr != null && !deliveryDateStr.isEmpty() && !deliveryDateStr.equalsIgnoreCase("null")) {
                try {
                    String clean = deliveryDateStr.replace("Z", "");
                    if (clean.contains("T")) {
                        String[] parts = clean.split("T");
                        String[] ymd = parts[0].split("-");
                        if (ymd.length == 3) {
                            int month = Integer.parseInt(ymd[1]);
                            String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
                            return ymd[2] + " " + months[Math.max(0, Math.min(11, month - 1))] + " " + ymd[0];
                        }
                    } else if (clean.contains("-")) {
                        String[] ymd = clean.split("-");
                        if (ymd.length == 3) {
                            int month = Integer.parseInt(ymd[1]);
                            String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
                            return ymd[2] + " " + months[Math.max(0, Math.min(11, month - 1))];
                        }
                    }
                } catch (Exception ignored) {}
            }
            return "Tomorrow";
        }

        private String formatHistoryDate(String dateStr) {
            if (dateStr != null && !dateStr.isEmpty() && !dateStr.equalsIgnoreCase("null")) {
                try {
                    String clean = dateStr.replace("Z", "");
                    if (clean.contains("T")) {
                        String[] parts = clean.split("T");
                        String[] ymd = parts[0].split("-");
                        if (ymd.length == 3) {
                            int month = Integer.parseInt(ymd[1]);
                            String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
                            return ymd[2] + " " + months[Math.max(0, Math.min(11, month - 1))] + " " + ymd[0];
                        }
                    } else if (clean.contains("-")) {
                        String[] ymd = clean.split("-");
                        if (ymd.length == 3) {
                            int month = Integer.parseInt(ymd[1]);
                            String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
                            return ymd[2] + " " + months[Math.max(0, Math.min(11, month - 1))];
                        }
                    }
                } catch (Exception ignored) {}
            }
            return "Recent";
        }
    }
}
