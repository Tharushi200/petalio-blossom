package com.petalio.blossom;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.SupplierProfileResponse;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * B4. Supplier Profile & Logout Activity for Petalio Blossom.
 */
public class SupplierProfileActivity extends AppCompatActivity {

    private View btnBackSupplierProfile;
    private TextView tvProfileFarm, tvProfileContact, tvProfilePhone, tvProfileLocation;
    private Button btnEditProfileSupplier, btnLogoutSupplier;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_supplier_profile);

        initViews();
        loadProfileData();
        setupListeners();
    }

    private void loadProfileData() {
        int supplierId = PetalioUserPrefs.getSupplierId(this);
        String role = PetalioUserPrefs.getUserRole(this);
        if (supplierId <= 0 || !"SUPPLIER".equalsIgnoreCase(role)) {
            return;
        }
        String farm = PetalioUserPrefs.getSupplierName(this);
        if (farm.isEmpty()) farm = PetalioUserPrefs.getUserName(this);
        String email = PetalioUserPrefs.getUserEmail(this);
        String phone = PetalioUserPrefs.getUserPhone(this);
        String city = PetalioUserPrefs.getUserCity(this);

        if (tvProfileFarm != null) tvProfileFarm.setText(farm.isEmpty() ? "—" : farm);
        if (tvProfileContact != null) tvProfileContact.setText(email.isEmpty() ? "—" : email);
        if (tvProfilePhone != null) tvProfilePhone.setText(phone.isEmpty() ? "—" : phone);
        if (tvProfileLocation != null) tvProfileLocation.setText(city.isEmpty() ? "—" : city);

        ApiClient.getApiService(getApplicationContext())
                .getSupplierProfile(supplierId)
                .enqueue(new Callback<SupplierProfileResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<SupplierProfileResponse> call, @NonNull Response<SupplierProfileResponse> response) {
                        if (isFinishing() || isDestroyed()) return;
                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess() && response.body().getProfile() != null) {
                            SupplierProfileResponse.SupplierProfileDto p = response.body().getProfile();
                            if (tvProfileFarm != null) tvProfileFarm.setText(!p.getSupplierName().isEmpty() ? p.getSupplierName() : "—");
                            if (tvProfileContact != null) tvProfileContact.setText(!p.getEmail().isEmpty() ? p.getEmail() : "—");
                            if (tvProfilePhone != null) tvProfilePhone.setText(!p.getPhone().isEmpty() ? p.getPhone() : "—");
                            if (tvProfileLocation != null) tvProfileLocation.setText(!p.getCity().isEmpty() ? p.getCity() : "—");
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<SupplierProfileResponse> call, @NonNull Throwable t) {}
                });
    }

    private void initViews() {
        btnBackSupplierProfile = findViewById(R.id.btnBackSupplierProfile);
        tvProfileFarm = findViewById(R.id.tvProfileFarm);
        tvProfileContact = findViewById(R.id.tvProfileContact);
        tvProfilePhone = findViewById(R.id.tvProfilePhone);
        tvProfileLocation = findViewById(R.id.tvProfileLocation);
        btnEditProfileSupplier = findViewById(R.id.btnEditProfileSupplier);
        btnLogoutSupplier = findViewById(R.id.btnLogoutSupplier);
    }

    private void setupListeners() {
        AnimationUtilsHelper.applyPressScale(btnBackSupplierProfile);
        AnimationUtilsHelper.applyPressScale(btnEditProfileSupplier);
        AnimationUtilsHelper.applyPressScale(btnLogoutSupplier);

        btnBackSupplierProfile.setOnClickListener(v -> supportFinishAfterTransition());

        btnEditProfileSupplier.setOnClickListener(v -> {
            Intent intent = new Intent(SupplierProfileActivity.this, SupplierMainActivity.class);
            intent.putExtra("TARGET_TAB", 4);
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            startActivity(intent);
            finish();
        });

        btnLogoutSupplier.setOnClickListener(v -> {
            new AlertDialog.Builder(this)
                    .setTitle("Logout")
                    .setMessage("Are you sure you want to log out from your Supplier Portal?")
                    .setPositiveButton("Logout", (dialog, which) -> {
                        getSharedPreferences("PetalioUserPrefs", MODE_PRIVATE).edit().clear().apply();
                        Toast.makeText(this, "Logged out successfully", Toast.LENGTH_SHORT).show();
                        Intent intent = new Intent(SupplierProfileActivity.this, LoginActivity.class);
                        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                        startActivity(intent);
                        finish();
                    })
                    .setNegativeButton("Cancel", null)
                    .show();
        });
    }
}
