package com.petalio.blossom;

import android.content.Context;
import android.content.res.ColorStateList;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.core.content.ContextCompat;

import com.petalio.blossom.network.DemandForecastDto;
import com.petalio.blossom.network.SupplierDemandResponse;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

/**
 * Shared rendering helpers for the Demand & Payments sub-screens
 * (Low Stock Alerts, Seasonal Demand Forecasts, Completed Payouts).
 */
public final class SupplierDemandUiHelper {

    private SupplierDemandUiHelper() {}

    public static void renderLowStockAlerts(
            Context context,
            LinearLayout container,
            List<SupplierDemandResponse.LowStockAlertDto> alerts,
            Runnable onRestockClick
    ) {
        if (context == null || container == null) return;
        container.removeAllViews();

        if (alerts == null || alerts.isEmpty()) {
            TextView tvClean = new TextView(context);
            tvClean.setText("✓ All harvest inventories are healthy above reorder levels.");
            tvClean.setTextColor(ContextCompat.getColor(context, R.color.primary_forest));
            tvClean.setTextSize(14);
            container.addView(tvClean);
            return;
        }

        float density = context.getResources().getDisplayMetrics().density;
        int dp4 = (int) (4 * density);
        int dp6 = (int) (6 * density);
        int dp8 = (int) (8 * density);
        int dp10 = (int) (10 * density);

        for (int i = 0; i < alerts.size(); i++) {
            SupplierDemandResponse.LowStockAlertDto alert = alerts.get(i);
            boolean nearReorder = alert.isNearReorder();

            LinearLayout row = new LinearLayout(context);
            row.setOrientation(LinearLayout.HORIZONTAL);
            row.setGravity(Gravity.CENTER_VERTICAL);
            row.setPadding(0, dp8, 0, dp8);

            // Left column: Variety name + stock/reorder subtitle
            LinearLayout titleBox = new LinearLayout(context);
            titleBox.setOrientation(LinearLayout.VERTICAL);
            LinearLayout.LayoutParams titleParams = new LinearLayout.LayoutParams(
                    0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f
            );
            titleParams.setMarginEnd(dp8);
            titleBox.setLayoutParams(titleParams);

            TextView tvName = new TextView(context);
            tvName.setText(alert.getFlowerName());
            tvName.setTextSize(15);
            tvName.setTextColor(ContextCompat.getColor(context, R.color.text_primary));
            tvName.setTypeface(null, android.graphics.Typeface.BOLD);
            titleBox.addView(tvName);

            TextView tvMeta = new TextView(context);
            tvMeta.setText("Stock: " + alert.getStockQuantity() + " stems  •  Reorder at " + alert.getReorderLevel());
            tvMeta.setTextSize(12);
            tvMeta.setTextColor(ContextCompat.getColor(context, R.color.text_secondary));
            titleBox.addView(tvMeta);

            row.addView(titleBox);

            // Right column: single-line status pill + "Restock →" button
            LinearLayout rightActions = new LinearLayout(context);
            rightActions.setLayoutParams(new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT
            ));
            rightActions.setOrientation(LinearLayout.VERTICAL);
            rightActions.setGravity(Gravity.END);

            TextView tvStatusBadge = new TextView(context);
            tvStatusBadge.setLayoutParams(new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT
            ));
            configureSingleLinePill(tvStatusBadge);
            tvStatusBadge.setText(alert.getAlertLabel());
            tvStatusBadge.setTextSize(11);
            tvStatusBadge.setTypeface(null, android.graphics.Typeface.BOLD);
            tvStatusBadge.setTextColor(ContextCompat.getColor(
                    context,
                    nearReorder ? R.color.gold_loyalty : R.color.badge_dispatched_text
            ));
            tvStatusBadge.setBackgroundResource(
                    nearReorder ? R.drawable.bg_badge_pending_amber : R.drawable.bg_badge_status
            );
            tvStatusBadge.setPadding(dp10, dp4, dp10, dp4);
            rightActions.addView(tvStatusBadge);

            TextView tvRestockAction = new TextView(context);
            LinearLayout.LayoutParams restockParams = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT
            );
            restockParams.topMargin = dp6;
            tvRestockAction.setLayoutParams(restockParams);
            configureSingleLinePill(tvRestockAction);
            tvRestockAction.setText("Restock →");
            tvRestockAction.setTextSize(11);
            tvRestockAction.setTypeface(null, android.graphics.Typeface.BOLD);
            tvRestockAction.setTextColor(ContextCompat.getColor(context, R.color.primary_brand));
            tvRestockAction.setBackgroundResource(R.drawable.bg_chip_unselected);
            tvRestockAction.setPadding(dp10, dp4, dp10, dp4);
            tvRestockAction.setClickable(true);
            tvRestockAction.setFocusable(true);
            AnimationUtilsHelper.applyPressScale(tvRestockAction);
            tvRestockAction.setOnClickListener(v -> {
                if (onRestockClick != null) onRestockClick.run();
            });
            rightActions.addView(tvRestockAction);

            row.addView(rightActions);
            container.addView(row);

            if (i < alerts.size() - 1) {
                addRowDivider(context, container, dp4);
            }
        }
    }

    public static List<DemandForecastDto> sortForecastsByDemand(List<DemandForecastDto> forecasts) {
        if (forecasts == null) return Collections.emptyList();
        List<DemandForecastDto> sorted = new ArrayList<>(forecasts);
        Collections.sort(sorted, (a, b) -> Integer.compare(
                b != null ? b.getPredictedDemand() : 0,
                a != null ? a.getPredictedDemand() : 0
        ));
        return sorted;
    }

    public static int countForecastShortfalls(List<DemandForecastDto> forecasts) {
        if (forecasts == null) return 0;
        int shortfalls = 0;
        for (DemandForecastDto f : forecasts) {
            if (f != null && f.getCurrentStock() < f.getPredictedDemand()) {
                shortfalls++;
            }
        }
        return shortfalls;
    }

    public static void renderAllDemandForecasts(
            Context context,
            LinearLayout container,
            List<SupplierDemandResponse.TopDemandedDto> topDemanded,
            List<DemandForecastDto> forecasts
    ) {
        if (context == null || container == null) return;
        container.removeAllViews();

        List<DemandForecastDto> sortedForecasts = sortForecastsByDemand(forecasts);
        if (!sortedForecasts.isEmpty()) {
            int maxDemand = 1;
            for (DemandForecastDto f : sortedForecasts) {
                if (f != null && f.getPredictedDemand() > maxDemand) {
                    maxDemand = f.getPredictedDemand();
                }
            }
            for (int i = 0; i < sortedForecasts.size(); i++) {
                DemandForecastDto f = sortedForecasts.get(i);
                if (f == null) continue;
                String rawSeason = f.getSeasonEvent();
                String title = f.getFlowerName() + " · " + (
                        (rawSeason.isEmpty() || "Live Order Demand".equalsIgnoreCase(rawSeason) || "Season".equalsIgnoreCase(rawSeason))
                                ? "Next 30 Days"
                                : rawSeason
                );
                addForecastRow(context, container, title, f.getPredictedDemand(), f.getCurrentStock(), maxDemand, i < sortedForecasts.size() - 1);
            }
        } else if (topDemanded != null && !topDemanded.isEmpty()) {
            int maxOrdered = 1;
            for (SupplierDemandResponse.TopDemandedDto t : topDemanded) {
                if (t != null && t.getTotalOrderedStems() > maxOrdered) {
                    maxOrdered = t.getTotalOrderedStems();
                }
            }
            for (int i = 0; i < topDemanded.size(); i++) {
                SupplierDemandResponse.TopDemandedDto t = topDemanded.get(i);
                if (t == null) continue;
                addForecastRow(context, container, t.getFlowerName() + " · Next 30 Days", t.getTotalOrderedStems(), t.getCurrentStock(), maxOrdered, i < topDemanded.size() - 1);
            }
        } else {
            TextView tvEmpty = new TextView(context);
            tvEmpty.setText("No seasonal demand forecasts available yet.");
            tvEmpty.setTextColor(ContextCompat.getColor(context, R.color.text_secondary));
            tvEmpty.setTextSize(14);
            container.addView(tvEmpty);
        }
    }

    private static void addForecastRow(
            Context context,
            LinearLayout container,
            String title,
            int projectedDemand,
            int currentStock,
            int maxDemand,
            boolean addDivider
    ) {
        float density = context.getResources().getDisplayMetrics().density;
        int dp4 = (int) (4 * density);
        int dp6 = (int) (6 * density);
        int dp8 = (int) (8 * density);
        int dp10 = (int) (10 * density);

        LinearLayout rowWrap = new LinearLayout(context);
        rowWrap.setOrientation(LinearLayout.VERTICAL);
        rowWrap.setPadding(0, dp6, 0, dp6);

        LinearLayout headerRow = new LinearLayout(context);
        headerRow.setOrientation(LinearLayout.HORIZONTAL);
        headerRow.setGravity(Gravity.CENTER_VERTICAL);

        TextView tvTitle = new TextView(context);
        LinearLayout.LayoutParams titleParams = new LinearLayout.LayoutParams(
                0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f
        );
        titleParams.setMarginEnd(dp8);
        tvTitle.setLayoutParams(titleParams);
        tvTitle.setText(title);
        tvTitle.setTextSize(14);
        tvTitle.setTextColor(ContextCompat.getColor(context, R.color.text_primary));
        tvTitle.setTypeface(null, android.graphics.Typeface.BOLD);
        headerRow.addView(tvTitle);

        boolean covered = currentStock >= projectedDemand;
        TextView tvCoveragePill = new TextView(context);
        tvCoveragePill.setLayoutParams(new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT
        ));
        configureSingleLinePill(tvCoveragePill);
        tvCoveragePill.setText(covered ? "Covered" : "Shortfall");
        tvCoveragePill.setTextSize(11);
        tvCoveragePill.setTypeface(null, android.graphics.Typeface.BOLD);
        tvCoveragePill.setTextColor(ContextCompat.getColor(
                context,
                covered ? R.color.badge_in_stock_text : R.color.badge_dispatched_text
        ));
        tvCoveragePill.setBackgroundResource(
                covered ? R.drawable.bg_badge_in_stock : R.drawable.bg_badge_status
        );
        tvCoveragePill.setPadding(dp10, dp4, dp10, dp4);
        headerRow.addView(tvCoveragePill);

        rowWrap.addView(headerRow);

        TextView tvSubtitle = new TextView(context);
        LinearLayout.LayoutParams subParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT
        );
        subParams.topMargin = dp4 / 2;
        tvSubtitle.setLayoutParams(subParams);
        tvSubtitle.setText("Projected: " + projectedDemand + " stems  •  In Stock: " + currentStock + " stems");
        tvSubtitle.setTextSize(12);
        tvSubtitle.setTextColor(ContextCompat.getColor(context, R.color.text_secondary));
        rowWrap.addView(tvSubtitle);

        ProgressBar pb = new ProgressBar(context, null, android.R.attr.progressBarStyleHorizontal);
        LinearLayout.LayoutParams pbParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, (int) (10 * density)
        );
        pbParams.topMargin = dp6;
        pb.setLayoutParams(pbParams);
        pb.setMax(100);
        double ratio = Math.sqrt(Math.max(1, projectedDemand)) / Math.sqrt(Math.max(1, maxDemand));
        int pct = Math.min(100, Math.max(22, (int) Math.round(ratio * 100.0)));
        pb.setProgress(pct);
        pb.setProgressTintList(ColorStateList.valueOf(ContextCompat.getColor(context, R.color.primary_brand)));
        rowWrap.addView(pb);

        container.addView(rowWrap);

        if (addDivider) {
            addRowDivider(context, container, dp6);
        }
    }

    public static void renderCompletedPayments(
            Context context,
            LinearLayout container,
            List<SupplierDemandResponse.CompletedPaymentDto> payments
    ) {
        if (context == null || container == null) return;
        container.removeAllViews();

        if (payments == null || payments.isEmpty()) {
            TextView tvClean = new TextView(context);
            tvClean.setText("No settlement records found. Delivered orders will appear here automatically.");
            tvClean.setTextColor(ContextCompat.getColor(context, R.color.text_secondary));
            tvClean.setTextSize(14);
            container.addView(tvClean);
            return;
        }

        int dp8 = (int) (8 * context.getResources().getDisplayMetrics().density);

        for (int i = 0; i < payments.size(); i++) {
            SupplierDemandResponse.CompletedPaymentDto p = payments.get(i);

            View row = LayoutInflater.from(context).inflate(R.layout.item_supplier_completed_payment, container, false);

            TextView tvCode = row.findViewById(R.id.tvPaymentOrderCode);
            TextView tvDate = row.findViewById(R.id.tvPaymentMethodDate);
            TextView tvAmount = row.findViewById(R.id.tvPaymentAmount);

            String code = p.getOrderCode();
            tvCode.setText(code.startsWith("#") ? ("Order " + code) : ("Order #" + code));

            String date = p.getPaymentDate();
            if (date != null && date.length() > 10) date = date.substring(0, 10);
            String ref = p.getPaymentReference();
            StringBuilder meta = new StringBuilder(p.getPaymentMethod());
            if (ref != null && !ref.isEmpty()) meta.append(" · ").append(ref);
            if (date != null && !date.isEmpty()) meta.append(" · ").append(date);
            tvDate.setText(meta.toString());

            tvAmount.setText(p.getAmountFormatted());
            tvAmount.setMaxLines(1);
            tvAmount.setSingleLine(true);

            container.addView(row);

            if (i < payments.size() - 1) {
                addRowDivider(context, container, dp8);
            }
        }
    }

    public static String resolveTotalPayoutFormatted(
            List<SupplierDemandResponse.CompletedPaymentDto> payments,
            String serverFormatted
    ) {
        if (serverFormatted != null && !serverFormatted.trim().isEmpty()) {
            return serverFormatted.trim();
        }
        double sum = 0.0;
        if (payments != null) {
            for (SupplierDemandResponse.CompletedPaymentDto p : payments) {
                if (p != null) sum += p.getAmount();
            }
        }
        return "Rs. " + String.format(Locale.US, "%,d", Math.round(sum));
    }

    private static void configureSingleLinePill(TextView tv) {
        tv.setSingleLine(true);
        tv.setMaxLines(1);
        tv.setEllipsize(null);
        tv.setMinWidth(0);
        tv.setMinimumWidth(0);
    }

    private static void addRowDivider(Context context, LinearLayout parent, int verticalMargin) {
        View divider = new View(context);
        LinearLayout.LayoutParams divParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 1);
        divParams.setMargins(0, verticalMargin, 0, verticalMargin);
        divider.setLayoutParams(divParams);
        divider.setBackgroundColor(ContextCompat.getColor(context, R.color.divider_color));
        parent.addView(divider);
    }
}
