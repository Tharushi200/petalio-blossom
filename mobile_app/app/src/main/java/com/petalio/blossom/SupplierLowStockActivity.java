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

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.SupplierDemandResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * Dedicated screen for Low Stock & Near-Reorder Replenishment Alerts.
 */
public class SupplierLowStockActivity extends AppCompatActivity {

    private View btnBack;
    private TextView tvSubtitle;
    private ProgressBar pbLoading;
    private LinearLayout layoutItems;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_supplier_low_stock);

        btnBack = findViewById(R.id.btnBackLowStock);
        tvSubtitle = findViewById(R.id.tvLowStockSubtitle);
        pbLoading = findViewById(R.id.pbLowStockLoading);
        layoutItems = findViewById(R.id.layoutLowStockItems);

        if (btnBack != null) {
            AnimationUtilsHelper.applyPressScale(btnBack);
            btnBack.setOnClickListener(v -> supportFinishAfterTransition());
        }

        fetchLowStockAlerts();
    }

    @Override
    protected void onResume() {
        super.onResume();
        fetchLowStockAlerts();
    }

    private void fetchLowStockAlerts() {
        int supplierId = PetalioUserPrefs.getSupplierId(this);
        if (supplierId <= 0) return;
        if (pbLoading != null && layoutItems != null && layoutItems.getChildCount() <= 1) {
            pbLoading.setVisibility(View.VISIBLE);
        }

        ApiClient.getApiService(getApplicationContext())
                .getSupplierDemand(supplierId)
                .enqueue(new Callback<SupplierDemandResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<SupplierDemandResponse> call, @NonNull Response<SupplierDemandResponse> response) {
                        if (isFinishing() || isDestroyed()) return;
                        if (pbLoading != null) pbLoading.setVisibility(View.GONE);

                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            List<SupplierDemandResponse.LowStockAlertDto> alerts = response.body().getLowStockAlerts();
                            int count = alerts != null ? alerts.size() : 0;
                            if (tvSubtitle != null) {
                                tvSubtitle.setText(count == 0
                                        ? "All estate flower varieties are above reorder thresholds"
                                        : (count + (count == 1 ? " variety requires grower attention" : " varieties require grower attention")));
                            }
                            SupplierDemandUiHelper.renderLowStockAlerts(
                                    SupplierLowStockActivity.this,
                                    layoutItems,
                                    alerts,
                                    SupplierLowStockActivity.this::openStockTab
                            );
                        } else {
                            Toast.makeText(SupplierLowStockActivity.this, "Unable to load low-stock alerts.", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<SupplierDemandResponse> call, @NonNull Throwable t) {
                        if (isFinishing() || isDestroyed()) return;
                        if (pbLoading != null) pbLoading.setVisibility(View.GONE);
                        Toast.makeText(SupplierLowStockActivity.this, "Network error loading stock alerts.", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void openStockTab() {
        Intent intent = new Intent(this, SupplierMainActivity.class);
        intent.putExtra("target_tab", 2);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        startActivity(intent);
        finish();
    }
}
