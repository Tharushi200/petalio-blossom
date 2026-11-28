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
import com.petalio.blossom.network.SupplierDemandResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * Dedicated screen displaying Total Settled Payouts banner and complete payment ledger.
 */
public class SupplierPayoutsActivity extends AppCompatActivity {

    private View btnBack;
    private TextView tvTotalAmount, tvTotalCount;
    private ProgressBar pbLoading;
    private LinearLayout layoutItems;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_supplier_payouts);

        btnBack = findViewById(R.id.btnBackPayouts);
        tvTotalAmount = findViewById(R.id.tvTotalSettledAmount);
        tvTotalCount = findViewById(R.id.tvTotalSettledCount);
        pbLoading = findViewById(R.id.pbPayoutsLoading);
        layoutItems = findViewById(R.id.layoutPayoutItems);

        if (btnBack != null) {
            AnimationUtilsHelper.applyPressScale(btnBack);
            btnBack.setOnClickListener(v -> supportFinishAfterTransition());
        }

        fetchPayouts();
    }

    @Override
    protected void onResume() {
        super.onResume();
        fetchPayouts();
    }

    private void fetchPayouts() {
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
                            List<SupplierDemandResponse.CompletedPaymentDto> payments = body.getCompletedPayments();
                            int count = payments != null ? payments.size() : 0;

                            if (tvTotalAmount != null) {
                                tvTotalAmount.setText(SupplierDemandUiHelper.resolveTotalPayoutFormatted(
                                        payments, body.getTotalPayoutsFormatted()
                                ));
                            }
                            if (tvTotalCount != null) {
                                tvTotalCount.setText(count + (count == 1 ? " completed settlement" : " completed settlements"));
                            }
                            SupplierDemandUiHelper.renderCompletedPayments(
                                    SupplierPayoutsActivity.this,
                                    layoutItems,
                                    payments
                            );
                        } else {
                            Toast.makeText(SupplierPayoutsActivity.this, "Unable to load settlement ledger.", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<SupplierDemandResponse> call, @NonNull Throwable t) {
                        if (isFinishing() || isDestroyed()) return;
                        if (pbLoading != null) pbLoading.setVisibility(View.GONE);
                        Toast.makeText(SupplierPayoutsActivity.this, "Network error loading payouts.", Toast.LENGTH_SHORT).show();
                    }
                });
    }
}
