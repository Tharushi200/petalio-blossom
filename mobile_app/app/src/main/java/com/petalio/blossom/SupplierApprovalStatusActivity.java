package com.petalio.blossom;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.SupplierStatusResponse;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * B3. Admin Approval Status Activity for Petalio Blossom.
 * Displays unique Supplier ID and approval workflow.
 */
public class SupplierApprovalStatusActivity extends AppCompatActivity {

    private View btnBackApproval;
    private TextView badgeApprovalStatus, tvApprovalSubtitle, tvStepApproved;
    private TextView tvApprovalFarmName, tvApprovalSupplierId, btnApprovalCopyId;
    private ProgressBar progressApprovalSteps;
    private Button btnRefreshApprovalStatus, btnGoToSupplierDashboard, btnApprovalSignOut;

    private boolean isApproved = false;
    private String supplierId = "";
    private String farmName = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_supplier_approval_status);

        loadIntentData();
        initViews();
        setupListeners();
        fetchApprovalStatus(false);
    }

    private void loadIntentData() {
        if (getIntent().hasExtra("SUPPLIER_ID")) {
            supplierId = getIntent().getStringExtra("SUPPLIER_ID");
        } else {
            String prefCode = PetalioUserPrefs.getSupplierCode(this);
            if (!prefCode.isEmpty()) {
                supplierId = prefCode;
            } else {
                int sid = PetalioUserPrefs.getSupplierId(this);
                if (sid > 0) {
                    supplierId = String.valueOf(sid);
                } else {
                    SharedPreferences prefs = getSharedPreferences("PetalioSupplierPrefs", MODE_PRIVATE);
                    supplierId = prefs.getString("LAST_SUPPLIER_ID", "");
                }
            }
        }

        if (getIntent().hasExtra("FARM_NAME")) {
            farmName = getIntent().getStringExtra("FARM_NAME");
        } else {
            String prefFarm = PetalioUserPrefs.getSupplierName(this);
            if (!prefFarm.isEmpty()) {
                farmName = prefFarm;
            } else {
                SharedPreferences prefs = getSharedPreferences("PetalioSupplierPrefs", MODE_PRIVATE);
                farmName = prefs.getString("LAST_SUPPLIER_FARM", "");
            }
        }
    }

    private void initViews() {
        btnBackApproval = findViewById(R.id.btnBackApproval);
        badgeApprovalStatus = findViewById(R.id.badgeApprovalStatus);
        tvApprovalSubtitle = findViewById(R.id.tvApprovalSubtitle);
        tvStepApproved = findViewById(R.id.tvStepApproved);
        tvApprovalFarmName = findViewById(R.id.tvApprovalFarmName);
        tvApprovalSupplierId = findViewById(R.id.tvApprovalSupplierId);
        btnApprovalCopyId = findViewById(R.id.btnApprovalCopyId);
        progressApprovalSteps = findViewById(R.id.progressApprovalSteps);
        btnRefreshApprovalStatus = findViewById(R.id.btnRefreshApprovalStatus);
        btnGoToSupplierDashboard = findViewById(R.id.btnGoToSupplierDashboard);
        btnApprovalSignOut = findViewById(R.id.btnApprovalSignOut);

        if (tvApprovalSupplierId != null) {
            tvApprovalSupplierId.setText(supplierId);
        }
        if (tvApprovalFarmName != null) {
            tvApprovalFarmName.setText(farmName);
        }
        applyApprovalGateUi(false, "Pending");
    }

    private void copySupplierIdToClipboard() {
        ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
        if (clipboard != null) {
            ClipData clip = ClipData.newPlainText("Supplier ID", supplierId);
            clipboard.setPrimaryClip(clip);
            Toast.makeText(this, "Supplier ID copied: " + supplierId, Toast.LENGTH_SHORT).show();
        }
    }

    private void setupListeners() {
        AnimationUtilsHelper.applyPressScale(btnBackApproval);
        AnimationUtilsHelper.applyPressScale(btnRefreshApprovalStatus);
        if (btnGoToSupplierDashboard != null) {
            AnimationUtilsHelper.applyPressScale(btnGoToSupplierDashboard);
        }
        if (btnApprovalSignOut != null) {
            AnimationUtilsHelper.applyPressScale(btnApprovalSignOut);
        }
        if (btnApprovalCopyId != null) {
            AnimationUtilsHelper.applyPressScale(btnApprovalCopyId);
        }

        btnBackApproval.setOnClickListener(v -> {
            if (isApproved) {
                supportFinishAfterTransition();
            } else {
                signOutToLogin();
            }
        });

        if (btnApprovalCopyId != null) {
            btnApprovalCopyId.setOnClickListener(v -> copySupplierIdToClipboard());
        }

        if (tvApprovalSupplierId != null) {
            tvApprovalSupplierId.setOnClickListener(v -> copySupplierIdToClipboard());
        }

        btnRefreshApprovalStatus.setOnClickListener(v -> fetchApprovalStatus(true));

        if (btnGoToSupplierDashboard != null) {
            btnGoToSupplierDashboard.setOnClickListener(v -> {
                if (!isApproved) {
                    Toast.makeText(this, "Your account is still awaiting Admin approval.", Toast.LENGTH_SHORT).show();
                    return;
                }
                Intent intent = new Intent(SupplierApprovalStatusActivity.this, SupplierMainActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            });
        }

        if (btnApprovalSignOut != null) {
            btnApprovalSignOut.setOnClickListener(v -> signOutToLogin());
        }
    }

    private void signOutToLogin() {
        PetalioUserPrefs.clear(this);
        CartManager.getInstance(this).clearCart();
        getSharedPreferences("PetalioSupplierPrefs", MODE_PRIVATE).edit().clear().apply();
        Intent intent = new Intent(this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }

    private void applyApprovalGateUi(boolean approved, String rawState) {
        isApproved = approved;
        PetalioUserPrefs.setSupplierApproved(this, approved);

        if (approved) {
            if (badgeApprovalStatus != null) {
                badgeApprovalStatus.setText("Approved");
                badgeApprovalStatus.setBackgroundResource(R.drawable.bg_badge_in_stock);
                badgeApprovalStatus.setTextColor(ContextCompat.getColor(this, R.color.badge_in_stock_text));
            }
            if (tvApprovalSubtitle != null) {
                tvApprovalSubtitle.setText("Congratulations! Farm account #" + supplierId + " is Approved & Verified.");
            }
            if (progressApprovalSteps != null) {
                progressApprovalSteps.setProgress(100);
            }
            if (tvStepApproved != null) {
                tvStepApproved.setTextColor(ContextCompat.getColor(this, R.color.primary_forest));
                tvStepApproved.setText("Approved");
            }
            if (btnRefreshApprovalStatus != null) {
                btnRefreshApprovalStatus.setVisibility(View.GONE);
            }
            if (btnGoToSupplierDashboard != null) {
                btnGoToSupplierDashboard.setVisibility(View.VISIBLE);
                btnGoToSupplierDashboard.setEnabled(true);
            }
            if (btnApprovalSignOut != null) {
                btnApprovalSignOut.setVisibility(View.GONE);
            }
        } else {
            boolean rejected = "REJECTED".equalsIgnoreCase(rawState);
            if (badgeApprovalStatus != null) {
                badgeApprovalStatus.setText(rejected ? "Application Rejected" : "Pending Admin Verification");
                badgeApprovalStatus.setBackgroundResource(rejected ? R.drawable.bg_badge_status : R.drawable.bg_badge_pending_amber);
                badgeApprovalStatus.setTextColor(ContextCompat.getColor(
                        this, rejected ? R.color.badge_dispatched_text : R.color.gold_loyalty));
            }
            if (tvApprovalSubtitle != null) {
                tvApprovalSubtitle.setText(rejected
                        ? ("Application #" + supplierId + " was declined. Please contact Petalio Floriculture support.")
                        : ("Account #" + supplierId + " is Pending Admin verification. Dashboard access unlocks once approved."));
            }
            if (progressApprovalSteps != null) {
                progressApprovalSteps.setProgress(50);
            }
            if (tvStepApproved != null) {
                tvStepApproved.setTextColor(ContextCompat.getColor(this, R.color.text_hint));
                tvStepApproved.setText("Approved");
            }
            if (btnRefreshApprovalStatus != null) {
                btnRefreshApprovalStatus.setVisibility(View.VISIBLE);
                btnRefreshApprovalStatus.setText("Refresh Approval Status");
            }
            if (btnGoToSupplierDashboard != null) {
                btnGoToSupplierDashboard.setVisibility(View.GONE);
                btnGoToSupplierDashboard.setEnabled(false);
            }
            if (btnApprovalSignOut != null) {
                btnApprovalSignOut.setVisibility(View.VISIBLE);
            }
        }
    }

    private void fetchApprovalStatus(boolean notifyUser) {
        if (btnRefreshApprovalStatus != null) {
            btnRefreshApprovalStatus.setEnabled(false);
        }
        if (notifyUser) {
            Toast.makeText(this, "Checking with Highland Admin portal...", Toast.LENGTH_SHORT).show();
        }

        ApiClient.getApiService(getApplicationContext())
                .getSupplierStatus(supplierId)
                .enqueue(new Callback<SupplierStatusResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<SupplierStatusResponse> call, @NonNull Response<SupplierStatusResponse> response) {
                        if (isFinishing() || isDestroyed()) return;
                        if (btnRefreshApprovalStatus != null) {
                            btnRefreshApprovalStatus.setEnabled(true);
                        }

                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            SupplierStatusResponse status = response.body();
                            if (status.getFarmName() != null && !status.getFarmName().isEmpty() && tvApprovalFarmName != null) {
                                tvApprovalFarmName.setText(status.getFarmName());
                            }

                            if (status.isApproved()) {
                                applyApprovalGateUi(true, "Approved");
                                if (notifyUser) {
                                    Toast.makeText(SupplierApprovalStatusActivity.this, "Admin Approval Granted! Welcome to Petalio Blossom.", Toast.LENGTH_LONG).show();
                                }
                            } else {
                                String stateText = status.getStatus();
                                applyApprovalGateUi(false, stateText);
                                if (notifyUser) {
                                    Toast.makeText(SupplierApprovalStatusActivity.this, "Current Status: " + stateText + ". Awaiting Admin approval.", Toast.LENGTH_SHORT).show();
                                }
                            }
                        } else {
                            if (notifyUser) {
                                Toast.makeText(SupplierApprovalStatusActivity.this, "Unable to fetch live approval status", Toast.LENGTH_SHORT).show();
                            }
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<SupplierStatusResponse> call, @NonNull Throwable t) {
                        if (isFinishing() || isDestroyed()) return;
                        if (btnRefreshApprovalStatus != null) {
                            btnRefreshApprovalStatus.setEnabled(true);
                        }
                        if (notifyUser) {
                            Toast.makeText(SupplierApprovalStatusActivity.this, "Unable to reach Petalio right now. Please check your connection.", Toast.LENGTH_SHORT).show();
                        }
                    }
                });
    }
}
