package com.petalio.blossom;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.animation.DecelerateInterpolator;
import android.widget.Button;
import android.widget.CheckBox;
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
import com.petalio.blossom.network.CustomerRegisterRequest;
import com.petalio.blossom.network.SupplierRegisterRequest;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.Random;

/**
 * RegisterActivity for Petalio Blossom Application.
 * Supports dual roles (Customer & Supplier), auto-generates Supplier ID for suppliers, and seamless status handoff.
 */
public class RegisterActivity extends AppCompatActivity {

    private CardView cardRegisterForm;
    private TextView btnRegRoleCustomer, btnRegRoleSupplier, tvRegRoleNotice, btnOpenSupplierFullReg;
    private TextInputLayout tilFullName, tilRegEmail, tilPhone, tilRegPassword, tilConfirmPassword;
    private TextInputEditText etFullName, etRegEmail, etPhone, etRegPassword, etConfirmPassword;
    private CheckBox cbTerms;
    private Button btnRegister;
    private ProgressBar regProgressBar;
    private TextView tvGoToLogin;

    // Selected Role: "CUSTOMER" or "SUPPLIER"
    private String selectedRole = "CUSTOMER";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        initViews();
        handleIntentData();
        setupRoleSelector();
        setupClickListeners();
        startEntranceAnimations();
    }

    private void initViews() {
        cardRegisterForm = findViewById(R.id.cardRegisterForm);
        btnRegRoleCustomer = findViewById(R.id.btnRegRoleCustomer);
        btnRegRoleSupplier = findViewById(R.id.btnRegRoleSupplier);
        tvRegRoleNotice = findViewById(R.id.tvRegRoleNotice);
        btnOpenSupplierFullReg = findViewById(R.id.btnOpenSupplierFullReg);

        tilFullName = findViewById(R.id.tilFullName);
        tilRegEmail = findViewById(R.id.tilRegEmail);
        tilPhone = findViewById(R.id.tilPhone);
        tilRegPassword = findViewById(R.id.tilRegPassword);
        tilConfirmPassword = findViewById(R.id.tilConfirmPassword);

        etFullName = findViewById(R.id.etFullName);
        etRegEmail = findViewById(R.id.etRegEmail);
        etPhone = findViewById(R.id.etPhone);
        etRegPassword = findViewById(R.id.etRegPassword);
        etConfirmPassword = findViewById(R.id.etConfirmPassword);

        cbTerms = findViewById(R.id.cbTerms);
        btnRegister = findViewById(R.id.btnRegister);
        regProgressBar = findViewById(R.id.regProgressBar);
        tvGoToLogin = findViewById(R.id.tvGoToLogin);
    }

    private void handleIntentData() {
        String preselected = getIntent().getStringExtra("PRESELECTED_ROLE");
        if (preselected != null && !preselected.isEmpty()) {
            selectRole(preselected);
        }
    }

    private void startEntranceAnimations() {
        cardRegisterForm.setTranslationY(250f);
        cardRegisterForm.setAlpha(0f);
        cardRegisterForm.animate()
                .translationY(0f)
                .alpha(1f)
                .setDuration(600)
                .setInterpolator(new DecelerateInterpolator())
                .start();
    }

    private void setupRoleSelector() {
        AnimationUtilsHelper.applyPressScale(btnRegRoleCustomer);
        AnimationUtilsHelper.applyPressScale(btnRegRoleSupplier);
        btnRegRoleCustomer.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                selectRole("CUSTOMER");
            }
        });
        btnRegRoleSupplier.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                selectRole("SUPPLIER");
            }
        });
    }

    private void selectRole(String role) {
        selectedRole = role;
        if ("CUSTOMER".equals(role)) {
            btnRegRoleCustomer.setBackgroundResource(R.drawable.bg_role_active);
            btnRegRoleCustomer.setTextColor(ContextCompat.getColor(this, R.color.text_white));
            androidx.core.widget.TextViewCompat.setCompoundDrawableTintList(btnRegRoleCustomer, android.content.res.ColorStateList.valueOf(ContextCompat.getColor(this, R.color.text_white)));

            btnRegRoleSupplier.setBackground(null);
            btnRegRoleSupplier.setTextColor(ContextCompat.getColor(this, R.color.text_primary));
            androidx.core.widget.TextViewCompat.setCompoundDrawableTintList(btnRegRoleSupplier, android.content.res.ColorStateList.valueOf(ContextCompat.getColor(this, R.color.text_primary)));

            tvRegRoleNotice.setText("Shop fresh flowers, customize bouquets and enjoy doorstep delivery.");
            tvRegRoleNotice.setTextColor(ContextCompat.getColor(this, R.color.accent_leaf_green));

            if (btnOpenSupplierFullReg != null) {
                btnOpenSupplierFullReg.setVisibility(View.GONE);
            }
            if (tilFullName != null) {
                tilFullName.setHint("Customer Full Name");
            }
        } else {
            btnRegRoleSupplier.setBackgroundResource(R.drawable.bg_role_active);
            btnRegRoleSupplier.setTextColor(ContextCompat.getColor(this, R.color.text_white));
            androidx.core.widget.TextViewCompat.setCompoundDrawableTintList(btnRegRoleSupplier, android.content.res.ColorStateList.valueOf(ContextCompat.getColor(this, R.color.text_white)));

            btnRegRoleCustomer.setBackground(null);
            btnRegRoleCustomer.setTextColor(ContextCompat.getColor(this, R.color.text_primary));
            androidx.core.widget.TextViewCompat.setCompoundDrawableTintList(btnRegRoleCustomer, android.content.res.ColorStateList.valueOf(ContextCompat.getColor(this, R.color.text_primary)));

            tvRegRoleNotice.setText("Note: Supplier accounts are assigned a unique Supplier ID (e.g. SUP-2026-XXXX) upon registration.");
            tvRegRoleNotice.setTextColor(ContextCompat.getColor(this, R.color.primary_forest));

            if (btnOpenSupplierFullReg != null) {
                btnOpenSupplierFullReg.setVisibility(View.VISIBLE);
            }
            if (tilFullName != null) {
                tilFullName.setHint("Supplier / Farm Business Name");
            }
        }
    }

    private void setupClickListeners() {
        AnimationUtilsHelper.applyPressScale(btnRegister);
        btnRegister.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                validateAndRegister();
            }
        });

        if (btnOpenSupplierFullReg != null) {
            AnimationUtilsHelper.applyPressScale(btnOpenSupplierFullReg);
            btnOpenSupplierFullReg.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    Intent intent = new Intent(RegisterActivity.this, SupplierRegisterActivity.class);
                    startActivity(intent);
                }
            });
        }

        AnimationUtilsHelper.applyPressScale(tvGoToLogin);
        tvGoToLogin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                supportFinishAfterTransition();
            }
        });
    }

    /**
     * Seamless registration flow with field validation and live backend API integration
     */
    private void validateAndRegister() {
        if (tilFullName != null) tilFullName.setError(null);
        if (tilRegEmail != null) tilRegEmail.setError(null);
        if (tilPhone != null) tilPhone.setError(null);
        if (tilRegPassword != null) tilRegPassword.setError(null);
        if (tilConfirmPassword != null) tilConfirmPassword.setError(null);

        String fullName = etFullName.getText() != null ? etFullName.getText().toString().trim() : "";
        String email = etRegEmail.getText() != null ? etRegEmail.getText().toString().trim() : "";
        String phone = etPhone.getText() != null ? etPhone.getText().toString().trim() : "";
        String password = etRegPassword.getText() != null ? etRegPassword.getText().toString().trim() : "";
        String confirmPassword = etConfirmPassword.getText() != null ? etConfirmPassword.getText().toString().trim() : "";

        if (fullName.length() < 2) {
            if (tilFullName != null) tilFullName.setError("Please enter your full name or farm name");
            etFullName.requestFocus();
            return;
        }

        if (email.isEmpty() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            if (tilRegEmail != null) tilRegEmail.setError("Please enter a valid email address");
            etRegEmail.requestFocus();
            return;
        }

        String cleanPhone = phone.replaceAll("[\\s-]", "");
        if (!cleanPhone.matches("^(\\+94|0)[0-9]{9}$")) {
            if (tilPhone != null) tilPhone.setError("Enter a valid 10-digit phone number (e.g. 0771234567 or +94771234567)");
            etPhone.requestFocus();
            return;
        }

        if (password.length() < 6) {
            if (tilRegPassword != null) tilRegPassword.setError("Password must be at least 6 characters");
            etRegPassword.requestFocus();
            return;
        }

        if (!password.equals(confirmPassword)) {
            if (tilConfirmPassword != null) tilConfirmPassword.setError("Passwords do not match");
            etConfirmPassword.requestFocus();
            return;
        }

        if (cbTerms != null && !cbTerms.isChecked()) {
            Toast.makeText(this, "Please agree to the Terms of Service & Privacy Policy", Toast.LENGTH_SHORT).show();
            return;
        }

        // Start registration loading
        btnRegister.setEnabled(false);
        regProgressBar.setVisibility(android.view.View.VISIBLE);

        final String finalFullName = fullName;
        final String finalEmail = email;
        final String finalPhone = phone;
        final String finalPassword = password;

        // Perform live MySQL registration via Node.js API
        if ("SUPPLIER".equals(selectedRole)) {
            int randomSuffix = 1000 + new Random().nextInt(9000);
            String supplierId = "SUP-2026-" + randomSuffix;

            SupplierRegisterRequest req = new SupplierRegisterRequest(finalFullName, finalFullName, finalPassword, finalPhone, "", finalEmail, supplierId);
            ApiClient.getApiService(this).registerSupplier(req).enqueue(new Callback<CommonResponse>() {
                @Override
                public void onResponse(Call<CommonResponse> call, Response<CommonResponse> response) {
                    if (isFinishing() || isDestroyed()) return;
                    regProgressBar.setVisibility(android.view.View.GONE);
                    btnRegister.setEnabled(true);

                    if (response.isSuccessful()) {
                        int userId = 0;
                        if (response.body() != null && response.body().getUserId() != null) {
                            userId = response.body().getUserId();
                        }
                        String savedCode = (response.body() != null && response.body().getSupplierId() != null && !response.body().getSupplierId().isEmpty())
                                ? response.body().getSupplierId() : supplierId;

                        SharedPreferences prefs = getSharedPreferences("PetalioSupplierPrefs", MODE_PRIVATE);
                        prefs.edit()
                                .putString("LAST_SUPPLIER_ID", savedCode)
                                .putString("LAST_SUPPLIER_FARM", finalFullName)
                                .putString("LAST_SUPPLIER_EMAIL", finalEmail)
                                .apply();

                        BrowseFragment.clearCache();
                        CartManager.getInstance(RegisterActivity.this).clearCart();
                        PetalioUserPrefs.saveSupplierInfo(
                                RegisterActivity.this,
                                userId,
                                savedCode,
                                finalFullName,
                                finalFullName,
                                finalEmail,
                                finalPhone,
                                "",
                                "",
                                0,
                                false
                        );

                        Toast.makeText(RegisterActivity.this, "Application submitted! Assigned Supplier ID: " + savedCode, Toast.LENGTH_LONG).show();
                        Intent intent = new Intent(RegisterActivity.this, SupplierApprovalStatusActivity.class);
                        intent.putExtra("SUPPLIER_ID", savedCode);
                        intent.putExtra("FARM_NAME", finalFullName);
                        intent.putExtra("APPROVAL_STATUS", "Pending Admin Verification");
                        startActivity(intent);
                        finish();
                        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
                    } else {
                        String msg = (response.body() != null && response.body().getMessage() != null && !response.body().getMessage().trim().isEmpty())
                                ? response.body().getMessage()
                                : ApiClient.extractErrorMessage(response, "Email or farm name is already registered");
                        if (response.code() == 409 && tilRegEmail != null) {
                            tilRegEmail.setError(msg);
                            etRegEmail.requestFocus();
                        }
                        Toast.makeText(RegisterActivity.this, msg, Toast.LENGTH_LONG).show();
                    }
                }

                @Override
                public void onFailure(Call<CommonResponse> call, Throwable t) {
                    if (isFinishing() || isDestroyed()) return;
                    regProgressBar.setVisibility(android.view.View.GONE);
                    btnRegister.setEnabled(true);
                    Toast.makeText(RegisterActivity.this, "Unable to connect right now. Please check your connection.", Toast.LENGTH_LONG).show();
                }
            });
        } else {
            CustomerRegisterRequest req = new CustomerRegisterRequest(finalFullName, finalEmail, finalPassword, finalPhone, "", "");
            ApiClient.getApiService(this).registerCustomer(req).enqueue(new Callback<CommonResponse>() {
                @Override
                public void onResponse(Call<CommonResponse> call, Response<CommonResponse> response) {
                    if (isFinishing() || isDestroyed()) return;
                    regProgressBar.setVisibility(android.view.View.GONE);
                    btnRegister.setEnabled(true);

                    if (response.isSuccessful() && response.body() != null && response.body().getUserId() != null && response.body().getUserId() > 0) {
                        int userId = response.body().getUserId();
                        int customerId = (response.body().getCustomerId() != null && response.body().getCustomerId() > 0)
                                ? response.body().getCustomerId()
                                : userId;

                        BrowseFragment.clearCache();
                        CartManager.getInstance(RegisterActivity.this).clearCart();
                        PetalioUserPrefs.saveCustomerInfo(
                                RegisterActivity.this,
                                userId,
                                customerId,
                                finalFullName,
                                finalEmail,
                                finalPhone,
                                "",
                                ""
                        );
                        CartManager.getInstance(RegisterActivity.this).clearCartForUser(customerId);

                        Toast.makeText(RegisterActivity.this, "Welcome " + finalFullName + "! Logging into Customer Portal...", Toast.LENGTH_SHORT).show();
                        Intent intent = new Intent(RegisterActivity.this, CustomerMainActivity.class);
                        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                        startActivity(intent);
                        finish();
                        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
                    } else {
                        String msg = (response.body() != null && response.body().getMessage() != null && !response.body().getMessage().trim().isEmpty())
                                ? response.body().getMessage()
                                : ApiClient.extractErrorMessage(response, "Email is already registered");
                        if (response.code() == 409 && tilRegEmail != null) {
                            tilRegEmail.setError(msg);
                            etRegEmail.requestFocus();
                        }
                        Toast.makeText(RegisterActivity.this, msg, Toast.LENGTH_LONG).show();
                    }
                }

                @Override
                public void onFailure(Call<CommonResponse> call, Throwable t) {
                    if (isFinishing() || isDestroyed()) return;
                    regProgressBar.setVisibility(android.view.View.GONE);
                    btnRegister.setEnabled(true);
                    Toast.makeText(RegisterActivity.this, "Unable to connect right now. Please check your connection.", Toast.LENGTH_LONG).show();
                }
            });
        }
    }
}
