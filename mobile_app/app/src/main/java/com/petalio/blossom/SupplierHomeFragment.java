package com.petalio.blossom;

import android.content.Intent;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.cardview.widget.CardView;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.SupplierDashboardResponse;
import com.petalio.blossom.network.SupplierNotificationDto;

import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * S1. Executive Supplier Home Dashboard Fragment.
 * Cohesive Estate Identity Card, interactive 2x2 KPI grid, quick harvest actions,
 * and live recent alerts mini-rows.
 */
public class SupplierHomeFragment extends Fragment {

    private TextView tvSupplierWelcome, tvSupplierFarmSubtitle, tvSupplierIdPill;
    private TextView tvApprovalBadge, tvNewRequestsCount, tvActiveOrdersCount;
    private TextView tvSuppliedVarietiesCount, tvTotalPayouts, tvNotificationSummary, tvEstateAlertsCount;
    private LinearLayout layoutHomeRecentAlerts;
    private View btnDeclareHarvestHome, btnManageStockHome;
    private View cardAdminApproval;
    private CardView cardNewRequestsMetric, cardActiveOrdersMetric;
    private CardView cardSuppliedVarietiesMetric, cardTotalPayoutsMetric, cardSupplierNotifications;

    private int currentUserId = -1;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
            @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_supplier_home, container, false);

        initViews(view);
        loadLocalProfileData();
        setupListeners();
        fetchSupplierDashboard();

        return view;
    }

    @Override
    public void onResume() {
        super.onResume();
        loadLocalProfileData();
        fetchSupplierDashboard();
    }

    private void initViews(View v) {
        tvSupplierWelcome = v.findViewById(R.id.tvSupplierWelcome);
        tvSupplierFarmSubtitle = v.findViewById(R.id.tvSupplierFarmSubtitle);
        tvSupplierIdPill = v.findViewById(R.id.tvSupplierIdPill);
        tvApprovalBadge = v.findViewById(R.id.tvApprovalBadge);
        tvNewRequestsCount = v.findViewById(R.id.tvNewRequestsCount);
        tvActiveOrdersCount = v.findViewById(R.id.tvActiveOrdersCount);
        tvSuppliedVarietiesCount = v.findViewById(R.id.tvSuppliedVarietiesCount);
        tvTotalPayouts = v.findViewById(R.id.tvTotalPayouts);
        tvNotificationSummary = v.findViewById(R.id.tvNotificationSummary);
        tvEstateAlertsCount = v.findViewById(R.id.tvEstateAlertsCount);
        layoutHomeRecentAlerts = v.findViewById(R.id.layoutHomeRecentAlerts);

        btnDeclareHarvestHome = v.findViewById(R.id.btnDeclareHarvestHome);
        btnManageStockHome = v.findViewById(R.id.btnManageStockHome);

        cardAdminApproval = v.findViewById(R.id.cardAdminApproval);
        cardNewRequestsMetric = v.findViewById(R.id.cardNewRequestsMetric);
        cardActiveOrdersMetric = v.findViewById(R.id.cardActiveOrdersMetric);
        cardSuppliedVarietiesMetric = v.findViewById(R.id.cardSuppliedVarietiesMetric);
        cardTotalPayoutsMetric = v.findViewById(R.id.cardTotalPayoutsMetric);
        cardSupplierNotifications = v.findViewById(R.id.cardSupplierNotifications);
    }

    private void loadLocalProfileData() {
        if (getContext() == null) return;
        currentUserId = PetalioUserPrefs.getSupplierId(requireContext());
        if (currentUserId <= 0 || !"SUPPLIER".equalsIgnoreCase(PetalioUserPrefs.getUserRole(requireContext()))) {
            return;
        }
        String farmName = PetalioUserPrefs.getSupplierName(requireContext());
        String contactName = PetalioUserPrefs.getContactPerson(requireContext());
        String displayName = !farmName.isEmpty() ? farmName : contactName;
        String city = PetalioUserPrefs.getUserCity(requireContext());
        String supplierCode = PetalioUserPrefs.getSupplierCode(requireContext());

        bindHeaderIdentity(displayName, city, supplierCode);
    }

    private void bindHeaderIdentity(String displayName, String city, String supplierCode) {
        if (tvSupplierWelcome != null && !TextUtils.isEmpty(displayName)) {
            tvSupplierWelcome.setText(displayName.trim());
        }
        if (tvSupplierFarmSubtitle != null) {
            StringBuilder eyebrow = new StringBuilder("GROWER PORTAL");
            if (!TextUtils.isEmpty(city)) {
                eyebrow.append(" • ").append(city.trim().toUpperCase(Locale.US));
            }
            if (!TextUtils.isEmpty(supplierCode)) {
                eyebrow.append(" • ").append(supplierCode.trim().toUpperCase(Locale.US));
            }
            tvSupplierFarmSubtitle.setText(eyebrow.toString());
        }
        if (tvSupplierIdPill != null && !TextUtils.isEmpty(supplierCode)) {
            tvSupplierIdPill.setText(supplierCode);
        }
    }

    private void setupListeners() {
        if (cardAdminApproval != null) {
            AnimationUtilsHelper.applyPressScale(cardAdminApproval);
            cardAdminApproval.setOnClickListener(v ->
                    startActivity(new Intent(requireActivity(), SupplierApprovalStatusActivity.class)));
        }

        if (cardNewRequestsMetric != null) {
            AnimationUtilsHelper.applyPressScale(cardNewRequestsMetric);
            cardNewRequestsMetric.setOnClickListener(v -> {
                if (getActivity() instanceof SupplierMainActivity) {
                    ((SupplierMainActivity) getActivity()).openOrdersWithFilter(SupplierOrdersFragment.FILTER_NEW_REQUESTS);
                }
            });
        }

        if (cardActiveOrdersMetric != null) {
            AnimationUtilsHelper.applyPressScale(cardActiveOrdersMetric);
            cardActiveOrdersMetric.setOnClickListener(v -> {
                if (getActivity() instanceof SupplierMainActivity) {
                    ((SupplierMainActivity) getActivity()).openOrdersWithFilter(SupplierOrdersFragment.FILTER_IN_PROGRESS);
                }
            });
        }

        if (cardSuppliedVarietiesMetric != null) {
            AnimationUtilsHelper.applyPressScale(cardSuppliedVarietiesMetric);
            cardSuppliedVarietiesMetric.setOnClickListener(v -> {
                if (getActivity() instanceof SupplierMainActivity) {
                    ((SupplierMainActivity) getActivity()).switchTab(2); // Stock Tab
                }
            });
        }

        if (cardTotalPayoutsMetric != null) {
            AnimationUtilsHelper.applyPressScale(cardTotalPayoutsMetric);
            cardTotalPayoutsMetric.setOnClickListener(v -> {
                if (getActivity() instanceof SupplierMainActivity) {
                    ((SupplierMainActivity) getActivity()).switchTab(3); // Demand / Payments Tab
                }
            });
        }

        if (btnDeclareHarvestHome != null) {
            AnimationUtilsHelper.applyPressScale(btnDeclareHarvestHome);
            btnDeclareHarvestHome.setOnClickListener(v ->
                    startActivity(new Intent(requireActivity(), DeclareFlowersActivity.class)));
        }

        if (btnManageStockHome != null) {
            AnimationUtilsHelper.applyPressScale(btnManageStockHome);
            btnManageStockHome.setOnClickListener(v -> {
                if (getActivity() instanceof SupplierMainActivity) {
                    ((SupplierMainActivity) getActivity()).switchTab(2); // Stock Tab
                }
            });
        }

        if (cardSupplierNotifications != null) {
            AnimationUtilsHelper.applyPressScale(cardSupplierNotifications);
            cardSupplierNotifications.setOnClickListener(v ->
                    startActivity(new Intent(requireActivity(), SupplierNotificationsActivity.class)));
        }
    }

    private void fetchSupplierDashboard() {
        if (getContext() == null) return;
        currentUserId = PetalioUserPrefs.getSupplierId(requireContext());
        if (currentUserId <= 0 || !"SUPPLIER".equalsIgnoreCase(PetalioUserPrefs.getUserRole(requireContext()))) {
            return;
        }

        ApiClient.getApiService(requireContext())
                .getSupplierDashboard(currentUserId)
                .enqueue(new Callback<SupplierDashboardResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<SupplierDashboardResponse> call,
                            @NonNull Response<SupplierDashboardResponse> response) {
                        if (!isAdded() || getContext() == null) return;
                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            SupplierDashboardResponse data = response.body();

                            String displayName = !data.getSupplierName().isEmpty()
                                    ? data.getSupplierName()
                                    : data.getContactPerson();
                            bindHeaderIdentity(displayName, data.getCity(), data.getSupplierCode());

                            if (tvApprovalBadge != null) {
                                tvApprovalBadge.setText(data.getStatus());
                                if (data.isApproved()) {
                                    tvApprovalBadge.setBackgroundResource(R.drawable.bg_badge_in_stock);
                                    tvApprovalBadge.setTextColor(
                                            ContextCompat.getColor(requireContext(), R.color.badge_in_stock_text));
                                } else {
                                    tvApprovalBadge.setBackgroundResource(R.drawable.bg_badge_status);
                                    tvApprovalBadge.setTextColor(
                                            ContextCompat.getColor(requireContext(), R.color.badge_dispatched_text));
                                }
                            }

                            if (tvNewRequestsCount != null) {
                                tvNewRequestsCount.setText(String.valueOf(data.getNewRequestsCount()));
                            }
                            if (tvActiveOrdersCount != null) {
                                tvActiveOrdersCount.setText(String.valueOf(data.getActiveOrdersCount()));
                            }
                            if (tvSuppliedVarietiesCount != null) {
                                tvSuppliedVarietiesCount.setText(String.valueOf(data.getSuppliedVarietiesCount()));
                            }
                            if (tvTotalPayouts != null) {
                                tvTotalPayouts.setText(data.getTotalPayoutsFormatted());
                            }
                            if (tvEstateAlertsCount != null) {
                                int alertsCount = data.getAlertsCount();
                                tvEstateAlertsCount.setText(String.valueOf(alertsCount));
                                tvEstateAlertsCount.setVisibility(View.VISIBLE);
                            }

                            renderRecentAlertsPreview(data.getRecentAlerts(), data.getLatestNotification());

                            // Keep PetalioUserPrefs synced with live supplier record
                            PetalioUserPrefs.saveSupplierInfo(
                                    requireContext(),
                                    data.getSupplierId() > 0 ? data.getSupplierId() : currentUserId,
                                    data.getSupplierCode(),
                                    data.getSupplierName(),
                                    data.getContactPerson(),
                                    data.getEmail(),
                                    data.getPhone(),
                                    data.getCity(),
                                    data.getAddress(),
                                    data.getMonthlyCapacity(),
                                    data.isApproved()
                            );

                            if (!data.isApproved()) {
                                Intent intent = new Intent(requireActivity(), SupplierApprovalStatusActivity.class);
                                String code = data.getSupplierCode();
                                intent.putExtra("SUPPLIER_ID", !code.isEmpty() ? code : String.valueOf(currentUserId));
                                intent.putExtra("FARM_NAME", !data.getSupplierName().isEmpty() ? data.getSupplierName() : data.getContactPerson());
                                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                                startActivity(intent);
                                requireActivity().finish();
                            }
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<SupplierDashboardResponse> call, @NonNull Throwable t) {
                        // Keep current clean neutral states if server offline
                    }
                });
    }

    private void renderRecentAlertsPreview(List<SupplierNotificationDto> recentAlerts, String fallbackSummary) {
        if (!isAdded() || getContext() == null) return;

        if (layoutHomeRecentAlerts == null || recentAlerts == null || recentAlerts.isEmpty()) {
            if (layoutHomeRecentAlerts != null) {
                layoutHomeRecentAlerts.removeAllViews();
                layoutHomeRecentAlerts.setVisibility(View.GONE);
            }
            if (tvNotificationSummary != null) {
                tvNotificationSummary.setVisibility(View.VISIBLE);
                tvNotificationSummary.setText(!TextUtils.isEmpty(fallbackSummary)
                        ? fallbackSummary
                        : "All floral operations up to date.");
            }
            return;
        }

        if (tvNotificationSummary != null) {
            tvNotificationSummary.setVisibility(View.GONE);
        }
        layoutHomeRecentAlerts.setVisibility(View.VISIBLE);
        layoutHomeRecentAlerts.removeAllViews();

        float density = getResources().getDisplayMetrics().density;
        int dp4 = (int) (4 * density);
        int dp8 = (int) (8 * density);
        int dp10 = (int) (10 * density);

        int count = Math.min(2, recentAlerts.size());
        for (int i = 0; i < count; i++) {
            SupplierNotificationDto alert = recentAlerts.get(i);
            if (alert == null) continue;

            String type = alert.getType().toUpperCase(Locale.US);
            int dotColorRes;
            int badgeBgRes;
            int badgeTextRes;
            String pillLabel;

            if ("PAYMENT".equals(type)) {
                dotColorRes = R.color.badge_in_stock_text;
                badgeBgRes = R.drawable.bg_badge_in_stock;
                badgeTextRes = R.color.badge_in_stock_text;
                pillLabel = !alert.getBadge().isEmpty() ? alert.getBadge() : "Paid";
            } else if ("LOW_STOCK".equals(type)) {
                dotColorRes = R.color.gold_loyalty;
                badgeBgRes = R.drawable.bg_badge_pending_amber;
                badgeTextRes = R.color.gold_loyalty;
                pillLabel = !alert.getBadge().isEmpty() ? alert.getBadge() : "Low Stock";
            } else {
                dotColorRes = R.color.primary_brand;
                badgeBgRes = R.drawable.bg_badge_status;
                badgeTextRes = R.color.badge_dispatched_text;
                pillLabel = !alert.getBadge().isEmpty() ? alert.getBadge() : "Pending";
            }

            LinearLayout row = new LinearLayout(requireContext());
            row.setOrientation(LinearLayout.HORIZONTAL);
            row.setGravity(Gravity.CENTER_VERTICAL);
            row.setPadding(0, dp8, 0, dp8);

            // Status Dot Indicator
            View dot = new View(requireContext());
            LinearLayout.LayoutParams dotParams = new LinearLayout.LayoutParams(dp8, dp8);
            dot.setLayoutParams(dotParams);
            GradientDrawable dotDrawable = new GradientDrawable();
            dotDrawable.setShape(GradientDrawable.OVAL);
            dotDrawable.setColor(ContextCompat.getColor(requireContext(), dotColorRes));
            dot.setBackground(dotDrawable);
            row.addView(dot);

            // Title & Subtitle
            LinearLayout textCol = new LinearLayout(requireContext());
            textCol.setOrientation(LinearLayout.VERTICAL);
            LinearLayout.LayoutParams textParams = new LinearLayout.LayoutParams(
                    0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f
            );
            textParams.setMarginStart(dp10);
            textParams.setMarginEnd(dp8);
            textCol.setLayoutParams(textParams);

            TextView tvTitle = new TextView(requireContext());
            tvTitle.setText(alert.getTitle());
            tvTitle.setTextSize(13);
            tvTitle.setTypeface(null, android.graphics.Typeface.BOLD);
            tvTitle.setTextColor(ContextCompat.getColor(requireContext(), R.color.text_primary));
            tvTitle.setMaxLines(1);
            tvTitle.setEllipsize(TextUtils.TruncateAt.END);
            textCol.addView(tvTitle);

            if (!alert.getSubtitle().isEmpty()) {
                TextView tvSub = new TextView(requireContext());
                tvSub.setText(alert.getSubtitle());
                tvSub.setTextSize(12);
                tvSub.setTextColor(ContextCompat.getColor(requireContext(), R.color.text_secondary));
                tvSub.setMaxLines(1);
                tvSub.setEllipsize(TextUtils.TruncateAt.END);
                textCol.addView(tvSub);
            }

            row.addView(textCol);

            // Type Pill
            TextView tvBadge = new TextView(requireContext());
            tvBadge.setLayoutParams(new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT
            ));
            tvBadge.setSingleLine(true);
            tvBadge.setMaxLines(1);
            tvBadge.setText(pillLabel);
            tvBadge.setTextSize(10);
            tvBadge.setTypeface(null, android.graphics.Typeface.BOLD);
            tvBadge.setTextColor(ContextCompat.getColor(requireContext(), badgeTextRes));
            tvBadge.setBackgroundResource(badgeBgRes);
            tvBadge.setPadding(dp8, dp4 / 2, dp8, dp4 / 2);
            row.addView(tvBadge);

            layoutHomeRecentAlerts.addView(row);

            if (i < count - 1) {
                View divider = new View(requireContext());
                LinearLayout.LayoutParams divParams = new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT, 1);
                divParams.setMargins(0, dp4 / 2, 0, dp4 / 2);
                divider.setLayoutParams(divParams);
                divider.setBackgroundColor(ContextCompat.getColor(requireContext(), R.color.divider_color));
                layoutHomeRecentAlerts.addView(divider);
            }
        }
    }
}
