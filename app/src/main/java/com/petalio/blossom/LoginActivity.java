package com.petalio.blossom;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Patterns;
import android.view.View;
import android.view.animation.DecelerateInterpolator;
import android.view.animation.OvershootInterpolator;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import androidx.core.content.ContextCompat;

import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.CommonResponse;
import com.petalio.blossom.network.LoginRequest;
import com.petalio.blossom.network.LoginResponse;
import com.petalio.blossom.network.UserDto;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * LoginActivity for Petalio Blossom Application.
 * Supports dual roles (Customer & Supplier), animated view entrance, and instant testing capability.
 */
public class LoginActivity extends AppCompatActivity {

    // Views
    private ImageView ivLogo;
    private TextView tvTagline;
    private CardView cardLoginForm;
    private View btnRoleCustomer, btnRoleSupplier;
    private ImageView ivRoleCustomer, ivRoleSupplier;
    private TextView tvRoleCustomer, tvRoleSupplier;
    private TextView tvRoleHint;
    private TextInputLayout tilEmail, tilPassword;
    private TextInputEditText etEmail, etPassword;
    private Button btnLogin;
    private ProgressBar progressBar;
    private TextView tvForgotPassword, tvGoToRegister;

    // State: "CUSTOMER" or "SUPPLIER"
    private String selectedRole = "CUSTOMER";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        initViews();
        setupRoleSelector();
        selectRole("CUSTOMER");
        setupClickListeners();
        AnimationUtilsHelper.applyPressScale(btnRoleCustomer);
        AnimationUtilsHelper.applyPressScale(btnRoleSupplier);
        AnimationUtilsHelper.applyPressScale(btnLogin);
        startEntranceAnimations();
    }

    private void initViews() {
        ivLogo = findViewById(R.id.ivLogo);
        tvTagline = findViewById(R.id.tvTagline);
        cardLoginForm = findViewById(R.id.cardLoginForm);
        btnRoleCustomer = findViewById(R.id.btnRoleCustomer);
        btnRoleSupplier = findViewById(R.id.btnRoleSupplier);
        ivRoleCustomer = findViewById(R.id.ivRoleCustomer);
        tvRoleCustomer = findViewById(R.id.tvRoleCustomer);
        ivRoleSupplier = findViewById(R.id.ivRoleSupplier);
        tvRoleSupplier = findViewById(R.id.tvRoleSupplier);
        tvRoleHint = findViewById(R.id.tvRoleHint);
        tilEmail = findViewById(R.id.tilEmail);
        tilPassword = findViewById(R.id.tilPassword);
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);
        progressBar = findViewById(R.id.progressBar);
        tvForgotPassword = findViewById(R.id.tvForgotPassword);
        tvGoToRegister = findViewById(R.id.tvGoToRegister);
    }

    /**
     * Smooth entrance animations for logo, tagline, and bottom form card
     */
    private void startEntranceAnimations() {
        ivLogo.setScaleX(0.4f);
        ivLogo.setScaleY(0.4f);
        ivLogo.setAlpha(0f);
        ivLogo.animate()
                .scaleX(1f)
                .scaleY(1f)
                .alpha(1f)
                .setDuration(800)
                .setInterpolator(new OvershootInterpolator(1.2f))
                .start();

        tvTagline.setAlpha(0f);
        tvTagline.setTranslationY(20f);
        tvTagline.animate()
                .alpha(1f)
                .translationY(0f)
                .setStartDelay(300)
                .setDuration(500)
                .start();

        cardLoginForm.setTranslationY(300f);
        cardLoginForm.setAlpha(0f);
        cardLoginForm.animate()
                .translationY(0f)
                .alpha(1f)
                .setStartDelay(200)
                .setDuration(700)
                .setInterpolator(new DecelerateInterpolator())
                .start();
    }

    /**
     * Toggle between Customer and Supplier role views
     */
    private void setupRoleSelector() {
        btnRoleCustomer.setOnClickListener(v -> selectRole("CUSTOMER"));
        btnRoleSupplier.setOnClickListener(v -> selectRole("SUPPLIER"));
    }

    private void selectRole(String role) {
        selectedRole = role;
        if ("CUSTOMER".equals(role)) {
            btnRoleCustomer.setBackgroundResource(R.drawable.bg_role_active);
            if (tvRoleCustomer != null) tvRoleCustomer.setTextColor(ContextCompat.getColor(this, R.color.text_white));
            if (ivRoleCustomer != null) ivRoleCustomer.setImageTintList(android.content.res.ColorStateList.valueOf(ContextCompat.getColor(this, R.color.text_white)));

            btnRoleSupplier.setBackground(null);
            if (tvRoleSupplier != null) tvRoleSupplier.setTextColor(ContextCompat.getColor(this, R.color.text_primary));
            if (ivRoleSupplier != null) ivRoleSupplier.setImageTintList(android.content.res.ColorStateList.valueOf(ContextCompat.getColor(this, R.color.text_primary)));

            if (tvRoleHint != null) {
                tvRoleHint.setText("Order fresh flowers & track deliveries in real-time");
                tvRoleHint.setTextColor(ContextCompat.getColor(this, R.color.text_secondary));
            }
            if (tilEmail != null) {
                tilEmail.setHint("Customer Email");
            }
            if (tilPassword != null) {
                tilPassword.setHelperText(null);
            }
        } else {
            btnRoleSupplier.setBackgroundResource(R.drawable.bg_role_active);
            if (tvRoleSupplier != null) tvRoleSupplier.setTextColor(ContextCompat.getColor(this, R.color.text_white));
            if (ivRoleSupplier != null) ivRoleSupplier.setImageTintList(android.content.res.ColorStateList.valueOf(ContextCompat.getColor(this, R.color.text_white)));

            btnRoleCustomer.setBackground(null);
            if (tvRoleCustomer != null) tvRoleCustomer.setTextColor(ContextCompat.getColor(this, R.color.text_primary));
            if (ivRoleCustomer != null) ivRoleCustomer.setImageTintList(android.content.res.ColorStateList.valueOf(ContextCompat.getColor(this, R.color.text_primary)));

            if (tvRoleHint != null) {
                tvRoleHint.setText("Manage stock, confirm orders & view payout records");
                tvRoleHint.setTextColor(ContextCompat.getColor(this, R.color.text_secondary));
            }
            if (tilEmail != null) {
                tilEmail.setHint("Supplier Email");
            }
            if (tilPassword != null) {
                tilPassword.setHelperText(null);
            }
        }
    }

    private void setupClickListeners() {
        ivLogo.setOnClickListener(v -> showServerConfigDialog());
        tvTagline.setOnClickListener(v -> showServerConfigDialog());

        btnLogin.setOnClickListener(v -> {
            v.animate().scaleX(0.96f).scaleY(0.96f).setDuration(80).withEndAction(() -> {
                v.animate().scaleX(1f).scaleY(1f).setDuration(80).start();
                validateAndLogin();
            }).start();
        });

        tvGoToRegister.setOnClickListener(v -> {
            Intent intent = new Intent(LoginActivity.this, RegisterActivity.class);
            intent.putExtra("PRESELECTED_ROLE", selectedRole);
            startActivity(intent);
            overridePendingTransition(R.anim.slide_in_right_fade, R.anim.slide_out_left_fade);
        });

        tvForgotPassword.setOnClickListener(v -> {
            Intent intent = new Intent(LoginActivity.this, ForgotPasswordActivity.class);
            String currentEmail = etEmail != null && etEmail.getText() != null
                    ? etEmail.getText().toString().trim()
                    : "";
            if (!currentEmail.isEmpty()) {
                intent.putExtra(ForgotPasswordActivity.EXTRA_PREFILL_EMAIL, currentEmail);
            }
            startActivity(intent);
            overridePendingTransition(R.anim.slide_in_right_fade, R.anim.slide_out_left_fade);
        });
    }

    /**
     * Authentication flow connected to Node.js backend (MySQL petalio_blossom)
     * verifying database bcrypt password hash.
     */
    private void validateAndLogin() {
        String email = etEmail.getText() != null ? etEmail.getText().toString().trim() : "";
        String password = etPassword.getText() != null ? etPassword.getText().toString().trim() : "";

        tilEmail.setError(null);
        tilPassword.setError(null);

        if (email.isEmpty()) {
            tilEmail.setError("Please enter your email or username");
            return;
        }

        if (password.isEmpty()) {
            tilPassword.setError("Please enter your password");
            return;
        }

        // Show loading progress
        btnLogin.setEnabled(false);
        progressBar.setVisibility(View.VISIBLE);

        final String userEmail = email;
        final String userPassword = password;
        final String role = selectedRole;

        // Perform live network call to Node.js backend / MySQL
        ApiClient.getApiService(this).login(new LoginRequest(userEmail, userPassword, role)).enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                progressBar.setVisibility(View.GONE);
                btnLogin.setEnabled(true);

                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    UserDto user = response.body().getUser();
                    if (user != null && user.getRole() != null && !user.getRole().equalsIgnoreCase(role)) {
                        String msg = "Account is registered as " + user.getRole() + ". Please switch to the " + user.getRole().toLowerCase() + " login tab.";
                        tilPassword.setError(msg);
                        Toast.makeText(LoginActivity.this, msg, Toast.LENGTH_LONG).show();
                        return;
                    }
                    saveUserSession(user);
                    if ("SUPPLIER".equalsIgnoreCase(role) && (user == null || !user.isApproved())) {
                        Toast.makeText(LoginActivity.this, "Estate account is pending Admin verification.", Toast.LENGTH_SHORT).show();
                        String supIdExtra = user != null && !user.getSupplierCode().isEmpty()
                                ? user.getSupplierCode()
                                : String.valueOf(user != null ? user.getUserId() : "");
                        String farmExtra = user != null && user.getSupplierName() != null && !user.getSupplierName().isEmpty()
                                ? user.getSupplierName()
                                : (user != null ? user.getName() : "");
                        Intent intent = new Intent(LoginActivity.this, SupplierApprovalStatusActivity.class);
                        intent.putExtra("SUPPLIER_ID", supIdExtra);
                        intent.putExtra("FARM_NAME", farmExtra);
                        intent.putExtra("APPROVAL_STATUS", user != null ? user.getApprovalStatus() : "Pending");
                        startActivity(intent);
                        finish();
                        return;
                    }
                    String welcomeName = (user != null && user.getName() != null && !user.getName().trim().isEmpty())
                            ? (", " + user.getName().trim()) : "";
                    Toast.makeText(LoginActivity.this, "Welcome back" + welcomeName + "!", Toast.LENGTH_SHORT).show();
                    navigateNext(role);
                } else {
                    String fallbackMsg = "Incorrect password! Please check your credentials.";
                    String errorMsg = (response.body() != null && response.body().getMessage() != null && !response.body().getMessage().trim().isEmpty())
                            ? response.body().getMessage()
                            : ApiClient.extractErrorMessage(response, fallbackMsg);
                    tilPassword.setError(errorMsg);
                    Toast.makeText(LoginActivity.this, errorMsg, Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                btnLogin.setEnabled(true);

                String msg = "Unable to connect right now. Please ensure the Petalio server is reachable.";
                tilPassword.setError(msg);
                Toast.makeText(LoginActivity.this, msg, Toast.LENGTH_LONG).show();
            }
        });
    }

    private void showServerConfigDialog() {
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_server_config, null);

        TextView tvCurrentServerUrl = dialogView.findViewById(R.id.tvCurrentServerUrl);
        com.google.android.material.textfield.TextInputEditText etServerHost = dialogView.findViewById(R.id.etServerHost);
        Button btnQuickUsb = dialogView.findViewById(R.id.btnQuickUsb);
        Button btnQuickWifi = dialogView.findViewById(R.id.btnQuickWifi);
        Button btnCancel = dialogView.findViewById(R.id.btnCancelServerConfig);
        Button btnSave = dialogView.findViewById(R.id.btnSaveServerConfig);

        String currentUrl = ApiClient.getBaseUrl(this);
        tvCurrentServerUrl.setText(currentUrl);
        String cleanHost = currentUrl.endsWith("/api/")
                ? currentUrl.substring(0, currentUrl.length() - 5)
                : currentUrl;
        if (cleanHost.startsWith("http://")) {
            cleanHost = cleanHost.substring("http://".length());
        }
        etServerHost.setText(cleanHost);

        androidx.appcompat.app.AlertDialog dialog = new androidx.appcompat.app.AlertDialog.Builder(this)
                .setView(dialogView)
                .setCancelable(true)
                .create();

        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        }

        btnQuickUsb.setOnClickListener(v -> etServerHost.setText("127.0.0.1:5000"));
        btnQuickWifi.setOnClickListener(v -> etServerHost.setText("192.168.137.1:5000"));
        btnCancel.setOnClickListener(v -> dialog.dismiss());

        btnSave.setOnClickListener(v -> {
            String text = etServerHost.getText() != null ? etServerHost.getText().toString().trim() : "";
            if (!text.isEmpty()) {
                ApiClient.updateServerEndpoint(this, text);
                Toast.makeText(this, "Server updated: " + ApiClient.getBaseUrl(this), Toast.LENGTH_SHORT).show();
                dialog.dismiss();
            }
        });

        dialog.show();
    }

    private void saveUserSession(UserDto user) {
        if (user == null) return;
        int prevUserId = PetalioUserPrefs.getUserId(this);
        String prevRole = PetalioUserPrefs.getUserRole(this);

        // Session isolation: If switching accounts or changing roles, purge all prior user state
        SessionManager.getInstance().isolateSessionOnAccountSwitch(this, user.getUserId(), user.getRole());

        if ("SUPPLIER".equalsIgnoreCase(user.getRole())) {
            CartManager.getInstance(this).clearCart();
            int supId = user.getSupplierId() != null ? user.getSupplierId() : user.getUserId();
            boolean approved = user.isApproved();
            PetalioUserPrefs.saveSupplierInfo(
                    this,
                    supId,
                    user.getSupplierCode(),
                    user.getSupplierName(),
                    user.getName(),
                    user.getEmail(),
                    user.getPhone(),
                    user.getCity(),
                    user.getAddress(),
                    user.getMonthlyCapacity() != null ? user.getMonthlyCapacity() : 0,
                    approved
            );
            PetalioUserPrefs.setApprovalStatus(this, approved ? "APPROVED" : "PENDING");
            return;
        }
        int customerId = (user.getCustomerId() != null && user.getCustomerId() > 0)
                ? user.getCustomerId()
                : user.getUserId();
        PetalioUserPrefs.saveCustomerInfo(
                this,
                user.getUserId(),
                customerId,
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getCity()
        );
        PetalioUserPrefs.setApprovalStatus(this, "APPROVED");
    }

    private void navigateNext(String role) {
        Intent intent;
        if ("CUSTOMER".equals(role)) {
            intent = new Intent(LoginActivity.this, CustomerMainActivity.class);
        } else {
            intent = new Intent(LoginActivity.this, SupplierMainActivity.class);
        }
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
        overridePendingTransition(R.anim.slide_in_right_fade, R.anim.slide_out_left_fade);
    }
}
