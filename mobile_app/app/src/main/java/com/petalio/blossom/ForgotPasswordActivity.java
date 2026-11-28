package com.petalio.blossom;

import android.os.Bundle;
import android.util.Patterns;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.CommonResponse;
import com.petalio.blossom.network.ForgotPasswordRequest;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * ForgotPasswordActivity requests an email password-reset link via POST /api/auth/forgot-password
 * and displays a clear inbox confirmation state.
 */
public class ForgotPasswordActivity extends AppCompatActivity {

    public static final String EXTRA_PREFILL_EMAIL = "PREFILL_EMAIL";

    private ImageView btnBackForgot;
    private CardView cardForgotForm;
    private CardView cardForgotConfirmation;
    private TextInputLayout tilForgotEmail;
    private TextInputEditText etForgotEmail;
    private Button btnSendResetLink;
    private ProgressBar pbForgotLoading;
    private TextView tvCancelBackToLogin;
    private TextView tvResetSentMessage;
    private Button btnBackToLogin;
    private TextView tvTryAnotherEmail;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forgot_password);

        initViews();
        prefillEmailFromIntent();
        setupListeners();
    }

    private void initViews() {
        btnBackForgot = findViewById(R.id.btnBackForgot);
        cardForgotForm = findViewById(R.id.cardForgotForm);
        cardForgotConfirmation = findViewById(R.id.cardForgotConfirmation);
        tilForgotEmail = findViewById(R.id.tilForgotEmail);
        etForgotEmail = findViewById(R.id.etForgotEmail);
        btnSendResetLink = findViewById(R.id.btnSendResetLink);
        pbForgotLoading = findViewById(R.id.pbForgotLoading);
        tvCancelBackToLogin = findViewById(R.id.tvCancelBackToLogin);
        tvResetSentMessage = findViewById(R.id.tvResetSentMessage);
        btnBackToLogin = findViewById(R.id.btnBackToLogin);
        tvTryAnotherEmail = findViewById(R.id.tvTryAnotherEmail);
    }

    private void prefillEmailFromIntent() {
        String prefill = getIntent().getStringExtra(EXTRA_PREFILL_EMAIL);
        if (prefill != null && !prefill.trim().isEmpty() && Patterns.EMAIL_ADDRESS.matcher(prefill.trim()).matches()) {
            etForgotEmail.setText(prefill.trim());
        }
    }

    private void setupListeners() {
        AnimationUtilsHelper.applyPressScale(btnSendResetLink);
        AnimationUtilsHelper.applyPressScale(btnBackToLogin);

        View.OnClickListener goBackListener = v -> finishToLogin();
        btnBackForgot.setOnClickListener(goBackListener);
        tvCancelBackToLogin.setOnClickListener(goBackListener);
        btnBackToLogin.setOnClickListener(goBackListener);

        btnSendResetLink.setOnClickListener(v -> submitForgotPassword());

        tvTryAnotherEmail.setOnClickListener(v -> {
            cardForgotConfirmation.setVisibility(View.GONE);
            cardForgotForm.setVisibility(View.VISIBLE);
            etForgotEmail.requestFocus();
        });
    }

    private void submitForgotPassword() {
        String email = etForgotEmail.getText() != null ? etForgotEmail.getText().toString().trim() : "";
        tilForgotEmail.setError(null);

        if (email.isEmpty() || !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            tilForgotEmail.setError("Please enter a valid email address");
            etForgotEmail.requestFocus();
            return;
        }

        setLoading(true);
        ApiClient.getApiService(getApplicationContext())
                .forgotPassword(new ForgotPasswordRequest(email))
                .enqueue(new Callback<CommonResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<CommonResponse> call, @NonNull Response<CommonResponse> response) {
                        if (isFinishing() || isDestroyed()) return;
                        setLoading(false);

                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            showConfirmationState(email);
                        } else {
                            String fallback = "Could not send reset link. Please verify your email address.";
                            String msg = (response.body() != null && !response.body().getMessage().trim().isEmpty())
                                    ? response.body().getMessage()
                                    : ApiClient.extractErrorMessage(response, fallback);
                            tilForgotEmail.setError(msg);
                            Toast.makeText(ForgotPasswordActivity.this, msg, Toast.LENGTH_LONG).show();
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<CommonResponse> call, @NonNull Throwable t) {
                        if (isFinishing() || isDestroyed()) return;
                        setLoading(false);
                        Toast.makeText(
                                ForgotPasswordActivity.this,
                                "Unable to reach Petalio server. Please check your connection.",
                                Toast.LENGTH_LONG
                        ).show();
                    }
                });
    }

    private void showConfirmationState(String email) {
        tvResetSentMessage.setText(
                "Reset link sent to " + email + ". Check your inbox and open the link to set a new password."
        );
        cardForgotForm.setVisibility(View.GONE);
        cardForgotConfirmation.setVisibility(View.VISIBLE);
    }

    private void setLoading(boolean loading) {
        btnSendResetLink.setEnabled(!loading);
        btnSendResetLink.setText(loading ? "Sending Reset Link..." : "Send Reset Link");
        pbForgotLoading.setVisibility(loading ? View.VISIBLE : View.GONE);
    }

    private void finishToLogin() {
        finish();
        overridePendingTransition(R.anim.slide_in_right_fade, R.anim.slide_out_left_fade);
    }
}
