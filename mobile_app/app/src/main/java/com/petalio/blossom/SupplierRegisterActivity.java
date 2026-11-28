package com.petalio.blossom;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.CommonResponse;
import com.petalio.blossom.network.SupplierRegisterRequest;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.Random;

/**
 * B1. Supplier Registration Activity for Petalio Blossom.
 * Features auto-generated unique Supplier ID assignment, modern inputs, and
 * status handoff.
 */
public class SupplierRegisterActivity extends AppCompatActivity {

    private View btnBackSupplierReg;
    private TextView tvGeneratedSupplierId, btnCopySupplierId;
    private EditText etFarmName, etContactPerson, etSupplierPhone, etFarmLocation, etSupplierEmail, etSupplierPassword;
    private Button btnSubmitForApproval;

    private String generatedSupplierId = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_supplier_register);

        initViews();
        generateSupplierId();
        setupListeners();
    }

    private void initViews() {
        btnBackSupplierReg = findViewById(R.id.btnBackSupplierReg);
        tvGeneratedSupplierId = findViewById(R.id.tvGeneratedSupplierId);
        btnCopySupplierId = findViewById(R.id.btnCopySupplierId);

        etFarmName = findViewById(R.id.etFarmName);
        etContactPerson = findViewById(R.id.etContactPerson);
        etSupplierPhone = findViewById(R.id.etSupplierPhone);
        etFarmLocation = findViewById(R.id.etFarmLocation);
        etSupplierEmail = findViewById(R.id.etSupplierEmail);
        etSupplierPassword = findViewById(R.id.etSupplierPassword);
        btnSubmitForApproval = findViewById(R.id.btnSubmitForApproval);
    }

    /**
     * Auto-generate a unique Petalio Supplier ID (e.g. SUP-2026-7842)
     */
    private void generateSupplierId() {
        int randomSuffix = 1000 + new Random().nextInt(9000);
        generatedSupplierId = "SUP-2026-" + randomSuffix;
        if (tvGeneratedSupplierId != null) {
            tvGeneratedSupplierId.setText(generatedSupplierId);
        }
    }

    private void copySupplierIdToClipboard() {
        ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
        if (clipboard != null) {
            ClipData clip = ClipData.newPlainText("Supplier ID", generatedSupplierId);
            clipboard.setPrimaryClip(clip);
            Toast.makeText(this, "Supplier ID copied: " + generatedSupplierId, Toast.LENGTH_SHORT).show();
        }
    }

    private void setupListeners() {
        AnimationUtilsHelper.applyPressScale(btnBackSupplierReg);
        btnBackSupplierReg.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                supportFinishAfterTransition();
            }
        });

        if (btnCopySupplierId != null) {
            AnimationUtilsHelper.applyPressScale(btnCopySupplierId);
            btnCopySupplierId.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    copySupplierIdToClipboard();
                }
            });
        }

        if (tvGeneratedSupplierId != null) {
            tvGeneratedSupplierId.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    copySupplierIdToClipboard();
                }
            });
        }

        AnimationUtilsHelper.applyPressScale(btnSubmitForApproval);
        btnSubmitForApproval.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                handleSupplierSubmit();
            }
        });
    }

    private void handleSupplierSubmit() {
            String farm = etFarmName.getText() != null ? etFarmName.getText().toString().trim() : "";
            String contact = etContactPerson.getText() != null ? etContactPerson.getText().toString().trim() : "";
            String phone = etSupplierPhone.getText() != null ? etSupplierPhone.getText().toString().trim() : "";
            String location = etFarmLocation.getText() != null ? etFarmLocation.getText().toString().trim() : "";
            String email = etSupplierEmail.getText() != null ? etSupplierEmail.getText().toString().trim() : "";
            String password = etSupplierPassword.getText() != null ? etSupplierPassword.getText().toString().trim() : "";

            if (farm.length() < 2) {
                etFarmName.setError("Please enter farm or business name");
                etFarmName.requestFocus();
                return;
            }
            if (contact.length() < 2) {
                etContactPerson.setError("Please enter contact person name");
                etContactPerson.requestFocus();
                return;
            }
            String cleanPhone = phone.replaceAll("[\\s-]", "");
            if (!cleanPhone.matches("^(\\+94|0)[0-9]{9}$")) {
                etSupplierPhone.setError("Enter a valid 10-digit phone number (e.g. 0771234567 or +94771234567)");
                etSupplierPhone.requestFocus();
                return;
            }
            if (location.isEmpty()) {
                etFarmLocation.setError("Please enter farm location (e.g. Nuwara Eliya)");
                etFarmLocation.requestFocus();
                return;
            }
            if (email.isEmpty() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                etSupplierEmail.setError("Enter a valid email address");
                etSupplierEmail.requestFocus();
                return;
            }
            if (password.length() < 6) {
                etSupplierPassword.setError("Password must be at least 6 characters");
                etSupplierPassword.requestFocus();
                return;
            }

            // Disable button during network request
            btnSubmitForApproval.setEnabled(false);
            btnSubmitForApproval.setText("Registering Farm...");

            // Persist newly registered supplier details
            SharedPreferences prefs = getSharedPreferences("PetalioSupplierPrefs", MODE_PRIVATE);
            prefs.edit()
                    .putString("LAST_SUPPLIER_ID", generatedSupplierId)
                    .putString("LAST_SUPPLIER_FARM", farm)
                    .putString("LAST_SUPPLIER_EMAIL", email)
                    .apply();

            // Save to live MySQL database via Node.js API with user-entered password
            SupplierRegisterRequest req = new SupplierRegisterRequest(farm, contact, password, phone, location, email, generatedSupplierId);
            ApiClient.getApiService(this).registerSupplier(req).enqueue(new Callback<CommonResponse>() {
                @Override
                public void onResponse(Call<CommonResponse> call, Response<CommonResponse> response) {
                    if (isFinishing() || isDestroyed()) return;
                    btnSubmitForApproval.setEnabled(true);
                    btnSubmitForApproval.setText("Submit for Approval");

                    if (response.isSuccessful()) {
                        int userId = 0;
                        if (response.body() != null && response.body().getUserId() != null) {
                            userId = response.body().getUserId();
                        }
                        String savedCode = (response.body() != null && response.body().getSupplierId() != null && !response.body().getSupplierId().isEmpty())
                                ? response.body().getSupplierId() : generatedSupplierId;

                        prefs.edit().putString("LAST_SUPPLIER_ID", savedCode).apply();

                        CartManager.getInstance(SupplierRegisterActivity.this).clearCart();
                        // Store user session in PetalioUserPrefs
                        PetalioUserPrefs.saveSupplierInfo(
                                SupplierRegisterActivity.this,
                                userId,
                                savedCode,
                                farm,
                                contact,
                                email,
                                phone,
                                location,
                                location,
                                0,
                                false
                        );

                        Toast.makeText(SupplierRegisterActivity.this, "Application registered! Assigned Supplier ID: " + savedCode,
                                Toast.LENGTH_LONG).show();

                        // Navigate to B3: Admin Approval Status Activity with Supplier ID
                        Intent intent = new Intent(SupplierRegisterActivity.this, SupplierApprovalStatusActivity.class);
                        intent.putExtra("SUPPLIER_ID", savedCode);
                        intent.putExtra("FARM_NAME", farm);
                        intent.putExtra("APPROVAL_STATUS", "Pending Admin Verification");
                        startActivity(intent);
                        finish();
                        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
                    } else {
                        String msg = (response.body() != null && response.body().getMessage() != null && !response.body().getMessage().trim().isEmpty())
                                ? response.body().getMessage()
                                : ApiClient.extractErrorMessage(response, "Registration failed: email or farm may already exist");
                        if (response.code() == 409 && etSupplierEmail != null) {
                            etSupplierEmail.setError(msg);
                            etSupplierEmail.requestFocus();
                        }
                        Toast.makeText(SupplierRegisterActivity.this, msg, Toast.LENGTH_LONG).show();
                    }
                }

                @Override
                public void onFailure(Call<CommonResponse> call, Throwable t) {
                    if (isFinishing() || isDestroyed()) return;
                    btnSubmitForApproval.setEnabled(true);
                    btnSubmitForApproval.setText("Submit for Approval");
                    Toast.makeText(SupplierRegisterActivity.this, "Unable to connect right now. Please try again.", Toast.LENGTH_LONG).show();
                }
            });
    }
}
