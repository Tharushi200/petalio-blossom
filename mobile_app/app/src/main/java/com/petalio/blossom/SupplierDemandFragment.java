package com.petalio.blossom;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.cardview.widget.CardView;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.DemandForecastDto;
import com.petalio.blossom.network.SupplierDemandResponse;

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
            cardMasterLowStock.setOnClickListener(v ->
                    startActivity(new Intent(requireContext(), SupplierLowStockActivity.class)));
        }
        if (cardMasterForecasts != null) {
            AnimationUtilsHelper.applyPressScale(cardMasterForecasts);
            cardMasterForecasts.setOnClickListener(v ->
                    startActivity(new Intent(requireContext(), SupplierForecastsActivity.class)));
        }
        if (cardMasterPayouts != null) {
            AnimationUtilsHelper.applyPressScale(cardMasterPayouts);
            cardMasterPayouts.setOnClickListener(v ->
                    startActivity(new Intent(requireContext(), SupplierPayoutsActivity.class)));
        }
    }

    private void fetchDemandHubSummary() {
        if (getContext() == null) return;
        int supplierId = PetalioUserPrefs.getSupplierId(requireContext());
        if (supplierId <= 0) return;

        ApiClient.getApiService(requireContext())
                .getSupplierDemand(supplierId)
                .enqueue(new Callback<SupplierDemandResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<SupplierDemandResponse> call, @NonNull Response<SupplierDemandResponse> response) {
                        if (!isAdded() || getContext() == null) return;

                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            SupplierDemandResponse body = response.body();
                            bindLowStockHubCard(body.getLowStockAlerts());
                            bindForecastsHubCard(body.getTopDemanded(), body.getForecasts());
                            bindPayoutsHubCard(body.getCompletedPayments(), body.getTotalPayoutsFormatted());
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<SupplierDemandResponse> call, @NonNull Throwable t) {}
                });
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
                tvHubAlertsPreview.setText("All harvest varieties healthy above reorder levels");
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
            if (!sorted.isEmpty()) {
                StringBuilder preview = new StringBuilder("Top demand: ");
                int limit = Math.min(2, sorted.size());
                for (int i = 0; i < limit; i++) {
                    DemandForecastDto f = sorted.get(i);
                    if (i > 0) preview.append(" • ");
                    preview.append(f.getFlowerName()).append(" (").append(f.getPredictedDemand()).append(" stems)");
                }
                tvHubForecastsPreview.setText(preview.toString());
            } else if (topDemanded != null && !topDemanded.isEmpty()) {
                StringBuilder preview = new StringBuilder("Top demand: ");
                int limit = Math.min(2, topDemanded.size());
                for (int i = 0; i < limit; i++) {
                    SupplierDemandResponse.TopDemandedDto t = topDemanded.get(i);
                    if (i > 0) preview.append(" • ");
                    preview.append(t.getFlowerName()).append(" (").append(t.getTotalOrderedStems()).append(" stems)");
                }
                tvHubForecastsPreview.setText(preview.toString());
            } else {
                tvHubForecastsPreview.setText("No seasonal demand forecasts available yet");
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
                tvHubPayoutsPreview.setText("No completed settlements recorded yet");
            } else {
                SupplierDemandResponse.CompletedPaymentDto latest = payments.get(0);
                String code = latest.getOrderCode();
                if (!code.startsWith("#")) code = "#" + code;
                tvHubPayoutsPreview.setText("Latest: " + code + " (" + latest.getAmountFormatted() + ") • Paid");
            }
        }
    }
}
