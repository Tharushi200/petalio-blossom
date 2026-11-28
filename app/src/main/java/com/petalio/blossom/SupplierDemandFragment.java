package com.petalio.blossom;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.cardview.widget.CardView;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.DemandForecastDto;
import com.petalio.blossom.network.SupplierDemandResponse;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * SupplierDemandFragment: 3-Master-Card Executive Hub for Low Stock Alerts,
 * Seasonal Demand Forecasts, and Completed Orders & Payouts.
 */
public class SupplierDemandFragment extends Fragment {

    private CardView cardMasterLowStock, cardMasterForecasts, cardMasterPayouts;
    private TextView tvHubAlertsBadge, tvHubAlertsPreview;
    private TextView tvHubForecastsBadge, tvHubForecastsPreview;
    private TextView tvHubPayoutsBadge, tvHubPayoutsPreview;

    private final List<SupplierDemandResponse.LowStockAlertDto> cachedAlerts = new ArrayList<>();
    private final List<DemandForecastDto> cachedForecasts = new ArrayList<>();
    private final List<SupplierDemandResponse.CompletedPaymentDto> cachedPayments = new ArrayList<>();
    private String cachedPayoutTotal = "Rs. 0";

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_supplier_demand, container, false);

        initViews(view);
        setupListeners();
        fetchDemandHubSummary();

        return view;
    }

    @Override
    public void onResume() {
        super.onResume();
        fetchDemandHubSummary();
    }

    private void initViews(View v) {
        cardMasterLowStock = v.findViewById(R.id.cardMasterLowStock);
        cardMasterForecasts = v.findViewById(R.id.cardMasterForecasts);
        cardMasterPayouts = v.findViewById(R.id.cardMasterPayouts);

        tvHubAlertsBadge = v.findViewById(R.id.tvHubAlertsBadge);
        tvHubAlertsPreview = v.findViewById(R.id.tvHubAlertsPreview);

        tvHubForecastsBadge = v.findViewById(R.id.tvHubForecastsBadge);
        tvHubForecastsPreview = v.findViewById(R.id.tvHubForecastsPreview);

        tvHubPayoutsBadge = v.findViewById(R.id.tvHubPayoutsBadge);
        tvHubPayoutsPreview = v.findViewById(R.id.tvHubPayoutsPreview);
    }

    private void setupListeners() {
        if (cardMasterLowStock != null) {
            AnimationUtilsHelper.applyPressScale(cardMasterLowStock);
            cardMasterLowStock.setOnClickListener(v -> showLowStockDialog(cachedAlerts));
        }
        if (cardMasterForecasts != null) {
            AnimationUtilsHelper.applyPressScale(cardMasterForecasts);
            cardMasterForecasts.setOnClickListener(v -> showForecastsDialog(cachedForecasts));
        }
        if (cardMasterPayouts != null) {
            AnimationUtilsHelper.applyPressScale(cardMasterPayouts);
            cardMasterPayouts.setOnClickListener(v -> showPayoutsDialog(cachedPayments, cachedPayoutTotal));
        }
    }

    private void fetchDemandHubSummary() {
        if (getContext() == null) return;
        int supplierId = PetalioUserPrefs.getSupplierId(requireContext());
        if (supplierId <= 0) {
            applyDefaultCleanTexts();
            return;
        }

        ApiClient.getApiService(requireContext())
                .getSupplierDemand(supplierId)
                .enqueue(new Callback<SupplierDemandResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<SupplierDemandResponse> call, @NonNull Response<SupplierDemandResponse> response) {
                        if (!isAdded() || getContext() == null) return;

                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            SupplierDemandResponse body = response.body();
                            cachedAlerts.clear();
                            if (body.getLowStockAlerts() != null) cachedAlerts.addAll(body.getLowStockAlerts());

                            cachedForecasts.clear();
                            if (body.getForecasts() != null) cachedForecasts.addAll(body.getForecasts());

                            cachedPayments.clear();
                            if (body.getCompletedPayments() != null) cachedPayments.addAll(body.getCompletedPayments());

                            cachedPayoutTotal = SupplierDemandUiHelper.resolveTotalPayoutFormatted(
                                    body.getCompletedPayments(), body.getTotalPayoutsFormatted()
                            );

                            bindLowStockHubCard(cachedAlerts);
                            bindForecastsHubCard(body.getTopDemanded(), cachedForecasts);
                            bindPayoutsHubCard(cachedPayments, cachedPayoutTotal);
                        } else {
                            applyDefaultCleanTexts();
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<SupplierDemandResponse> call, @NonNull Throwable t) {
                        if (!isAdded() || getContext() == null) return;
                        applyDefaultCleanTexts();
                    }
                });
    }

    private void applyDefaultCleanTexts() {
        if (tvHubAlertsPreview != null) {
            tvHubAlertsPreview.setText("All declared varieties are well stocked");
        }
        if (tvHubAlertsBadge != null) {
            tvHubAlertsBadge.setText("0 Alerts");
            tvHubAlertsBadge.setBackgroundResource(R.drawable.bg_badge_in_stock);
            tvHubAlertsBadge.setTextColor(ContextCompat.getColor(requireContext(), R.color.badge_in_stock_text));
        }
        if (tvHubForecastsPreview != null) {
            tvHubForecastsPreview.setText("No seasonal shortfalls projected");
        }
        if (tvHubForecastsBadge != null) {
            tvHubForecastsBadge.setText("All Covered");
            tvHubForecastsBadge.setBackgroundResource(R.drawable.bg_badge_in_stock);
            tvHubForecastsBadge.setTextColor(ContextCompat.getColor(requireContext(), R.color.badge_in_stock_text));
        }
        if (tvHubPayoutsPreview != null) {
            tvHubPayoutsPreview.setText("No settled payouts recorded yet");
        }
        if (tvHubPayoutsBadge != null) {
            tvHubPayoutsBadge.setText("Rs. 0");
            tvHubPayoutsBadge.setBackgroundResource(R.drawable.bg_badge_in_stock);
            tvHubPayoutsBadge.setTextColor(ContextCompat.getColor(requireContext(), R.color.badge_in_stock_text));
        }
    }

    private void bindLowStockHubCard(List<SupplierDemandResponse.LowStockAlertDto> alerts) {
        if (getContext() == null) return;
        int count = alerts != null ? alerts.size() : 0;

        if (tvHubAlertsBadge != null) {
            tvHubAlertsBadge.setText(count + (count == 1 ? " Alert" : " Alerts"));
            tvHubAlertsBadge.setBackgroundResource(count > 0 ? R.drawable.bg_badge_status : R.drawable.bg_badge_in_stock);
            tvHubAlertsBadge.setTextColor(ContextCompat.getColor(
                    requireContext(),
                    count > 0 ? R.color.badge_dispatched_text : R.color.badge_in_stock_text
            ));
        }

        if (tvHubAlertsPreview != null) {
            if (count == 0) {
                tvHubAlertsPreview.setText("All declared varieties are well stocked");
            } else {
                StringBuilder preview = new StringBuilder();
                int limit = Math.min(2, count);
                for (int i = 0; i < limit; i++) {
                    SupplierDemandResponse.LowStockAlertDto a = alerts.get(i);
                    if (i > 0) preview.append(" • ");
                    preview.append(a.getFlowerName()).append(" (").append(a.getAlertLabel()).append(")");
                }
                if (count > 2) {
                    preview.append(" +").append(count - 2).append(" more");
                }
                tvHubAlertsPreview.setText(preview.toString());
            }
        }
    }

    private void bindForecastsHubCard(List<SupplierDemandResponse.TopDemandedDto> topDemanded, List<DemandForecastDto> forecasts) {
        if (getContext() == null) return;
        List<DemandForecastDto> sorted = SupplierDemandUiHelper.sortForecastsByDemand(forecasts);
        int shortfalls = SupplierDemandUiHelper.countForecastShortfalls(sorted);

        if (tvHubForecastsBadge != null) {
            if (sorted.isEmpty()) {
                tvHubForecastsBadge.setText("Live Demand");
                tvHubForecastsBadge.setBackgroundResource(R.drawable.bg_badge_in_stock);
                tvHubForecastsBadge.setTextColor(ContextCompat.getColor(requireContext(), R.color.badge_in_stock_text));
            } else if (shortfalls > 0) {
                tvHubForecastsBadge.setText(shortfalls + (shortfalls == 1 ? " Shortfall" : " Shortfalls"));
                tvHubForecastsBadge.setBackgroundResource(R.drawable.bg_badge_pending_amber);
                tvHubForecastsBadge.setTextColor(ContextCompat.getColor(requireContext(), R.color.gold_loyalty));
            } else {
                tvHubForecastsBadge.setText("All Covered");
                tvHubForecastsBadge.setBackgroundResource(R.drawable.bg_badge_in_stock);
                tvHubForecastsBadge.setTextColor(ContextCompat.getColor(requireContext(), R.color.badge_in_stock_text));
            }
        }

        if (tvHubForecastsPreview != null) {
            if (shortfalls > 0) {
                StringBuilder preview = new StringBuilder("Top demand: ");
                int limit = Math.min(2, sorted.size());
                for (int i = 0; i < limit; i++) {
                    DemandForecastDto f = sorted.get(i);
                    if (i > 0) preview.append(" • ");
                    preview.append(f.getFlowerName()).append(" (").append(f.getPredictedDemand()).append(" stems)");
                }
                tvHubForecastsPreview.setText(preview.toString());
            } else if (!sorted.isEmpty()) {
                StringBuilder preview = new StringBuilder("All varieties covered: ");
                int limit = Math.min(2, sorted.size());
                for (int i = 0; i < limit; i++) {
                    DemandForecastDto f = sorted.get(i);
                    if (i > 0) preview.append(" • ");
                    preview.append(f.getFlowerName()).append(" (").append(f.getCurrentStock()).append(" in stock)");
                }
                tvHubForecastsPreview.setText(preview.toString());
            } else {
                tvHubForecastsPreview.setText("No seasonal shortfalls projected");
            }
        }
    }

    private void bindPayoutsHubCard(List<SupplierDemandResponse.CompletedPaymentDto> payments, String serverTotalFormatted) {
        String totalText = SupplierDemandUiHelper.resolveTotalPayoutFormatted(payments, serverTotalFormatted);
        if (tvHubPayoutsBadge != null) {
            tvHubPayoutsBadge.setText(totalText);
        }
        if (tvHubPayoutsPreview != null) {
            if (payments == null || payments.isEmpty()) {
                tvHubPayoutsPreview.setText("No settled payouts recorded yet");
            } else {
                SupplierDemandResponse.CompletedPaymentDto latest = payments.get(0);
                String code = latest.getOrderCode();
                if (!code.startsWith("#")) code = "#" + code;
                tvHubPayoutsPreview.setText("Latest: " + code + " (" + latest.getAmountFormatted() + ") • Paid");
            }
        }
    }

    private void showLowStockDialog(List<SupplierDemandResponse.LowStockAlertDto> alerts) {
        if (getContext() == null) return;
        StringBuilder sb = new StringBuilder();
        if (alerts == null || alerts.isEmpty()) {
            sb.append("All declared varieties are well stocked above reorder thresholds.");
        } else {
            sb.append("Itemized Stock Alert Varieties:\n\n");
            for (int i = 0; i < alerts.size(); i++) {
                SupplierDemandResponse.LowStockAlertDto a = alerts.get(i);
                sb.append(i + 1).append(". ").append(a.getFlowerName()).append("\n")
                  .append("   • Current Stock: ").append(a.getStockQuantity()).append(" stems\n")
                  .append("   • Reorder Threshold: ").append(a.getReorderLevel()).append(" stems\n")
                  .append("   • Status: ").append(a.getAlertLabel()).append("\n\n");
            }
        }

        new AlertDialog.Builder(requireContext())
                .setTitle("Low Stock & Replenishment Alerts")
                .setMessage(sb.toString().trim())
                .setPositiveButton("Open Inventory", (dialog, which) -> {
                    startActivity(new Intent(requireContext(), SupplierLowStockActivity.class));
                })
                .setNegativeButton("Close", null)
                .show();
    }

    private void showForecastsDialog(List<DemandForecastDto> forecasts) {
        if (getContext() == null) return;
        StringBuilder sb = new StringBuilder();
        if (forecasts == null || forecasts.isEmpty()) {
            sb.append("No seasonal shortfalls projected for the next 30 days.");
        } else {
            sb.append("30-Day Demand Projection vs Inventory:\n\n");
            for (int i = 0; i < forecasts.size(); i++) {
                DemandForecastDto f = forecasts.get(i);
                int shortfall = Math.max(0, f.getPredictedDemand() - f.getCurrentStock());
                sb.append(i + 1).append(". ").append(f.getFlowerName()).append(" (").append(f.getSeasonEvent()).append(")\n")
                  .append("   • Projected Demand: ").append(f.getPredictedDemand()).append(" stems\n")
                  .append("   • Current Stock: ").append(f.getCurrentStock()).append(" stems\n")
                  .append("   • Status: ").append(shortfall > 0 ? ("⚠ Shortfall of " + shortfall + " stems") : "✓ Fully Covered").append("\n\n");
            }
        }

        new AlertDialog.Builder(requireContext())
                .setTitle("Seasonal Demand Forecasts")
                .setMessage(sb.toString().trim())
                .setPositiveButton("View Demand Hub", (dialog, which) -> {
                    startActivity(new Intent(requireContext(), SupplierForecastsActivity.class));
                })
                .setNegativeButton("Close", null)
                .show();
    }

    private void showPayoutsDialog(List<SupplierDemandResponse.CompletedPaymentDto> payments, String totalFormatted) {
        if (getContext() == null) return;
        StringBuilder sb = new StringBuilder();
        if (payments == null || payments.isEmpty()) {
            sb.append("No settled payouts recorded in ledger yet.");
        } else {
            sb.append("Total Settled: ").append(totalFormatted).append("\n\n")
              .append("Itemized Settled Orders:\n\n");
            for (int i = 0; i < payments.size(); i++) {
                SupplierDemandResponse.CompletedPaymentDto p = payments.get(i);
                sb.append(i + 1).append(". ").append(p.getOrderCode()).append(" — ").append(p.getAmountFormatted()).append("\n")
                  .append("   • Method: ").append(p.getPaymentMethod()).append("\n")
                  .append("   • Date: ").append(p.getPaymentDate()).append("\n")
                  .append("   • Status: ").append(p.getStatus()).append("\n\n");
            }
        }

        new AlertDialog.Builder(requireContext())
                .setTitle("Completed Orders & Payouts")
                .setMessage(sb.toString().trim())
                .setPositiveButton("View Full Ledger", (dialog, which) -> {
                    startActivity(new Intent(requireContext(), SupplierPayoutsActivity.class));
                })
                .setNegativeButton("Close", null)
                .show();
    }
}
