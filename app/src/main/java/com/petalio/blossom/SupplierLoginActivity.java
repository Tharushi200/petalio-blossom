package com.petalio.blossom;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.CommonResponse;
import com.petalio.blossom.network.LoginRequest;
import com.petalio.blossom.network.LoginResponse;
import com.petalio.blossom.network.ResetPasswordRequest;
import com.petalio.blossom.network.UserDto;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * B2. Supplier Login Activity for Petalio Blossom.
 * Connects securely to Node.js / MySQL backend with proper validation.
 */
public class SupplierLoginActivity extends AppCompatActivity {

    private View btnBackSupplierLogin;
    private EditText etSupplierLoginEmail, etSupplierLoginPassword;
    private Button btnLoginSupplierAction, btnGoToRegisterSupplier;
    private TextView tvSupplierForgotPassword;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_supplier_login);

        initViews();
        prefillLastSupplierId();
        setupListeners();
    }

    private void initViews() {
        btnBackSupplierLogin = findViewById(R.id.btnBackSupplierLogin);
        etSupplierLoginEmail = findViewById(R.id.etSupplierLoginEmail);
        etSupplierLoginPassword = findViewById(R.id.etSupplierLoginPassword);
        btnLoginSupplierAction = findViewById(R.id.btnLoginSupplierAction);
        btnGoToRegisterSupplier = findViewById(R.id.btnGoToRegisterSupplier);
        tvSupplierForgotPassword = findViewById(R.id.tvSupplierForgotPassword);
    }

    private void prefillLastSupplierId() {
        SharedPreferences prefs = getSharedPreferences("PetalioSupplierPrefs", MODE_PRIVATE);
        String lastSupplierId = prefs.getString("LAST_SUPPLIER_ID", "");
        if (!lastSupplierId.isEmpty() && etSupplierLoginEmail != null) {
            etSupplierLoginEmail.setText(lastSupplierId);
        }
    }

    private void setupListeners() {
        AnimationUtilsHelper.applyPressScale(btnBackSupplierLogin);
        AnimationUtilsHelper.applyPressScale(btnLoginSupplierAction);
        AnimationUtilsHelper.applyPressScale(btnGoToRegisterSupplier);

        btnBackSupplierLogin.setOnClickListener(v -> supportFinishAfterTransition());

        // Secure Login Action with Backend Verification
        btnLoginSupplierAction.setOnClickListener(v -> {
            String loginInput = etSupplierLoginEmail.getText() != null ? etSupplierLoginEmail.getText().toString().trim() : "";
            String password = etSupplierLoginPassword.getText() != null ? etSupplierLoginPassword.getText().toString().trim() : "";

            if (loginInput.isEmpty()) {
                etSupplierLoginEmail.setError("Supplier ID or Email is required");
                etSupplierLoginEmail.requestFocus();
                return;
            }

            if (password.isEmpty()) {
                etSupplierLoginPassword.setError("Password is required");
                etSupplierLoginPassword.requestFocus();
                return;
            }

            btnLoginSupplierAction.setEnabled(false);
            Toast.makeText(this, "Verifying credentials with server...", Toast.LENGTH_SHORT).show();

            ApiClient.getApiService(getApplicationContext())
                    .login(new LoginRequest(loginInput, password, "SUPPLIER"))
                    .enqueue(new Callback<LoginResponse>() {
                        @Override
                        public void onResponse(@NonNull Call<LoginResponse> call, @NonNull Response<LoginResponse> response) {
                            if (isFinishing() || isDestroyed()) return;
                            btnLoginSupplierAction.setEnabled(true);

                            if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                                UserDto user = response.body().getUser();
                                saveSupplierSession(user);

                                boolean approved = (user != null && user.isApproved());
                                if (!approved) {
                                    Toast.makeText(SupplierLoginActivity.this, "Account pending Admin verification.", Toast.LENGTH_SHORT).show();
                                    Intent intent = new Intent(SupplierLoginActivity.this, SupplierApprovalStatusActivity.class);
                                    String supIdExtra = user != null && !user.getSupplierCode().isEmpty()
                                            ? user.getSupplierCode()
                                            : String.valueOf(user != null ? user.getUserId() : "");
                                    intent.putExtra("SUPPLIER_ID", supIdExtra);
                                    intent.putExtra("FARM_NAME", user != null && user.getSupplierName() != null ? user.getSupplierName() : (user != null ? user.getName() : ""));
                                    intent.putExtra("APPROVAL_STATUS", user != null ? user.getApprovalStatus() : "Pending");
                                    startActivity(intent);
                                    finish();
                                } else {
                                    Toast.makeText(SupplierLoginActivity.this, "Welcome " + (user != null ? user.getName() : "Supplier") + "!", Toast.LENGTH_SHORT).show();
                                    Intent intent = new Intent(SupplierLoginActivity.this, SupplierMainActivity.class);
                                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                                    startActivity(intent);
                                    finish();
                                    overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
                                }
                            } else {
                                String fallbackMsg = "Incorrect password or unauthorized supplier!";
                                String errorMsg = (response.body() != null && response.body().getMessage() != null && !response.body().getMessage().trim().isEmpty())
                                        ? response.body().getMessage()
                                        : ApiClient.extractErrorMessage(response, fallbackMsg);
                                etSupplierLoginPassword.setError(errorMsg);
                                Toast.makeText(SupplierLoginActivity.this, errorMsg, Toast.LENGTH_LONG).show();
                            }
                        }

                        @Override
                        public void onFailure(@NonNull Call<LoginResponse> call, @NonNull Throwable t) {
                            if (isFinishing() || isDestroyed()) return;
                            btnLoginSupplierAction.setEnabled(true);
                            Toast.makeText(SupplierLoginActivity.this, "Unable to connect right now. Please check your connection.", Toast.LENGTH_LONG).show();
                        }
                    });
        });

        // Register as Supplier Action
        btnGoToRegisterSupplier.setOnClickListener(v -> {
            Intent intent = new Intent(SupplierLoginActivity.this, SupplierRegisterActivity.class);
            startActivity(intent);
        });

        // Forgot password -> Live MySQL password reset dialog
        if (tvSupplierForgotPassword != null) {
            tvSupplierForgotPassword.setOnClickListener(v -> showForgotPasswordDialog());
        }
    }

    private void showForgotPasswordDialog() {
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_reset_password, null);

        com.google.android.material.textfield.TextInputLayout tilResetEmail = dialogView.findViewById(R.id.tilResetEmail);
        com.google.android.material.textfield.TextInputEditText etResetEmail = dialogView.findViewById(R.id.etResetEmail);
        com.google.android.material.textfield.TextInputLayout tilResetPhone = dialogView.findViewById(R.id.tilResetPhone);
        com.google.android.material.textfield.TextInputEditText etResetPhone = dialogView.findViewById(R.id.etResetPhone);
        com.google.android.material.textfield.TextInputLayout tilResetPass = dialogView.findViewById(R.id.tilResetPass);
        com.google.android.material.textfield.TextInputEditText etResetPass = dialogView.findViewById(R.id.etResetPass);
        Button btnCancel = dialogView.findViewById(R.id.btnCancelReset);
        Button btnSubmit = dialogView.findViewById(R.id.btnSubmitReset);

        androidx.appcompat.app.AlertDialog dialog = new androidx.appcompat.app.AlertDialog.Builder(this)
                .setView(dialogView)
                .setCancelable(true)
                .create();

        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        }

        if (btnCancel != null) btnCancel.setOnClickListener(v -> dialog.dismiss());

        if (btnSubmit != null) {
            btnSubmit.setOnClickListener(v -> {
                String email = etResetEmail != null && etResetEmail.getText() != null ? etResetEmail.getText().toString().trim() : "";
                String phone = etResetPhone != null && etResetPhone.getText() != null ? etResetPhone.getText().toString().trim() : "";
                String newPass = etResetPass != null && etResetPass.getText() != null ? etResetPass.getText().toString().trim() : "";

                if (tilResetEmail != null) tilResetEmail.setError(null);
                if (tilResetPhone != null) tilResetPhone.setError(null);
                if (tilResetPass != null) tilResetPass.setError(null);

                if (email.isEmpty() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                    if (tilResetEmail != null) tilResetEmail.setError("Please enter a valid registered email");
                    return;
                }
                if (phone.isEmpty()) {
                    if (tilResetPhone != null) tilResetPhone.setError("Please enter your registered phone number");
                    return;
                }
                if (newPass.length() < 6) {
                    if (tilResetPass != null) tilResetPass.setError("Password must be at least 6 characters");
                    return;
                }

                btnSubmit.setEnabled(false);
                ApiClient.getApiService(getApplicationContext())
                        .resetPassword(new ResetPasswordRequest(email, phone, newPass))
                        .enqueue(new Callback<CommonResponse>() {
                            @Override
                            public void onResponse(@NonNull Call<CommonResponse> call, @NonNull Response<CommonResponse> response) {
                                if (isFinishing() || isDestroyed()) return;
                                btnSubmit.setEnabled(true);
                                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                                    Toast.makeText(SupplierLoginActivity.this, "" + response.body().getMessage(), Toast.LENGTH_LONG).show();
                                    if (etSupplierLoginEmail != null) etSupplierLoginEmail.setText(email);
                                    if (etSupplierLoginPassword != null) etSupplierLoginPassword.setText(newPass);
                                    dialog.dismiss();
                                } else {
                                    String msg = (response.body() != null && response.body().getMessage() != null && !response.body().getMessage().trim().isEmpty())
                                            ? response.body().getMessage()
                                            : ApiClient.extractErrorMessage(response, "Could not reset password.");
                                    Toast.makeText(SupplierLoginActivity.this, msg, Toast.LENGTH_LONG).show();
                                }
                            }

                            @Override
                            public void onFailure(@NonNull Call<CommonResponse> call, @NonNull Throwable t) {
                                if (isFinishing() || isDestroyed()) return;
                                btnSubmit.setEnabled(true);
                                Toast.makeText(SupplierLoginActivity.this, "Unable to reach Petalio right now. Please check your connection.", Toast.LENGTH_SHORT).show();
                            }
                        });
            });
        }
        dialog.show();
    }

    private void saveSupplierSession(UserDto user) {
        if (user == null) return;
        int prevUserId = PetalioUserPrefs.getUserId(this);
        String prevRole = PetalioUserPrefs.getUserRole(this);

        // Session isolation: Purge previous user state on switch
        if (prevUserId > 0 && (prevUserId != user.getUserId() || !"SUPPLIER".equalsIgnoreCase(prevRole))) {
            PetalioUserPrefs.clear(this);
        } else {
            CartManager.getInstance(this).clearCart();
        }

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
    }
}
