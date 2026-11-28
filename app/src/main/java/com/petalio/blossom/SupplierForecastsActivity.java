package com.petalio.blossom;

import android.os.Bundle;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.DemandForecastDto;
import com.petalio.blossom.network.SupplierDemandResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * Dedicated screen showing all Seasonal & 30-Day Demand Forecasts vs Current Stock.
 */
public class SupplierForecastsActivity extends AppCompatActivity {

    private View btnBack;
    private TextView tvSubtitle;
    private ProgressBar pbLoading;
    private LinearLayout layoutItems;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_supplier_forecasts);

        btnBack = findViewById(R.id.btnBackForecasts);
        tvSubtitle = findViewById(R.id.tvForecastsSubtitle);
        pbLoading = findViewById(R.id.pbForecastsLoading);
        layoutItems = findViewById(R.id.layoutForecastItems);

        if (btnBack != null) {
            AnimationUtilsHelper.applyPressScale(btnBack);
            btnBack.setOnClickListener(v -> supportFinishAfterTransition());
        }

        fetchForecasts();
    }

    @Override
    protected void onResume() {
        super.onResume();
        fetchForecasts();
    }

    private void fetchForecasts() {
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
                            SupplierDemandResponse body = response.body();
                            List<DemandForecastDto> forecasts = body.getForecasts();
                            if (tvSubtitle != null && forecasts != null && !forecasts.isEmpty()) {
                                int shortfalls = SupplierDemandUiHelper.countForecastShortfalls(forecasts);
                                tvSubtitle.setText(forecasts.size() + " varieties tracked  •  " + shortfalls + (shortfalls == 1 ? " shortfall detected" : " shortfalls detected"));
                            }
                            SupplierDemandUiHelper.renderAllDemandForecasts(
                                    SupplierForecastsActivity.this,
                                    layoutItems,
                                    body.getTopDemanded(),
                                    forecasts
                            );
                        } else {
                            Toast.makeText(SupplierForecastsActivity.this, "Unable to load seasonal forecasts.", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<SupplierDemandResponse> call, @NonNull Throwable t) {
                        if (isFinishing() || isDestroyed()) return;
                        if (pbLoading != null) pbLoading.setVisibility(View.GONE);
                        Toast.makeText(SupplierForecastsActivity.this, "Network error loading forecasts.", Toast.LENGTH_SHORT).show();
                    }
                });
    }
}
