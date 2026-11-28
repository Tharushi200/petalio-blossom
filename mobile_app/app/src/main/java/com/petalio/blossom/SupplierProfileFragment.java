package com.petalio.blossom;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.cardview.widget.CardView;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;

import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.ChangePasswordRequest;
import com.petalio.blossom.network.CommonResponse;
import com.petalio.blossom.network.SupplierProfileResponse;
import com.petalio.blossom.network.SupplierProfileUpdateRequest;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * Dedicated Supplier Profile Fragment for Petalio Blossom.
 * Displays 100% authentic MySQL database data, live payout summary, estate details,
 * edit profile dialog, change password, and sign out support.
 */
public class SupplierProfileFragment extends Fragment {

    private static final String PREFS_NAME = "PetalioUserPrefs";

    private ImageView btnEditProfileHeader;
    private TextView tvProfileFarmName, tvProfileSupplierCode, tvProfileVerificationBadge;
    private TextView tvProfileTotalPayouts, tvProfileActiveOrders, tvProfileVarieties;
    private TextView tvProfileContactPerson, tvProfileEmail, tvProfilePhone, tvProfileLocation, tvProfileAddress, tvProfileCapacity;
    private Button btnEditProfileSupplier, btnSupplierProfileLogout;
    private CardView rowSupplierChangePassword, rowSupplierSupport;

    private int currentUserId = -1;
    private String currentFarmName = "";
    private String currentContactPerson = "";
    private String currentEmail = "";
    private String currentPhone = "";
    private String currentCity = "";
    private String currentAddress = "";
    private String currentSupplierCode = "";
    private int currentCapacity = 0;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_supplier_profile, container, false);

        initViews(view);
        loadLocalData();
        setupListeners();
        fetchLiveSupplierProfile();

        return view;
    }

    @Override
    public void onResume() {
        super.onResume();
        loadLocalData();
        fetchLiveSupplierProfile();
    }

    private void initViews(View v) {
        btnEditProfileHeader = v.findViewById(R.id.btnEditProfileHeader);
        tvProfileFarmName = v.findViewById(R.id.tvProfileFarmName);
        tvProfileSupplierCode = v.findViewById(R.id.tvProfileSupplierCode);
        tvProfileVerificationBadge = v.findViewById(R.id.tvProfileVerificationBadge);

        tvProfileTotalPayouts = v.findViewById(R.id.tvProfileTotalPayouts);
        tvProfileActiveOrders = v.findViewById(R.id.tvProfileActiveOrders);
        tvProfileVarieties = v.findViewById(R.id.tvProfileVarieties);

        tvProfileContactPerson = v.findViewById(R.id.tvProfileContactPerson);
        tvProfileEmail = v.findViewById(R.id.tvProfileEmail);
        tvProfilePhone = v.findViewById(R.id.tvProfilePhone);
        tvProfileLocation = v.findViewById(R.id.tvProfileLocation);
        tvProfileAddress = v.findViewById(R.id.tvProfileAddress);
        tvProfileCapacity = v.findViewById(R.id.tvProfileCapacity);

        btnEditProfileSupplier = v.findViewById(R.id.btnEditProfileSupplier);
        btnSupplierProfileLogout = v.findViewById(R.id.btnSupplierProfileLogout);
        rowSupplierChangePassword = v.findViewById(R.id.rowSupplierChangePassword);
        rowSupplierSupport = v.findViewById(R.id.rowSupplierSupport);
    }

    private void loadLocalData() {
        if (getContext() == null) return;
        currentUserId = PetalioUserPrefs.getSupplierId(requireContext());
        if (currentUserId <= 0 || !"SUPPLIER".equalsIgnoreCase(PetalioUserPrefs.getUserRole(requireContext()))) {
            return;
        }
        currentFarmName = PetalioUserPrefs.getSupplierName(requireContext());
        currentContactPerson = PetalioUserPrefs.getContactPerson(requireContext());
        currentEmail = PetalioUserPrefs.getUserEmail(requireContext());
        currentPhone = PetalioUserPrefs.getUserPhone(requireContext());
        currentCity = PetalioUserPrefs.getUserCity(requireContext());
        currentAddress = PetalioUserPrefs.getUserAddress(requireContext());
        currentSupplierCode = PetalioUserPrefs.getSupplierCode(requireContext());
        currentCapacity = PetalioUserPrefs.getMonthlyCapacity(requireContext());

        if (!currentFarmName.isEmpty()) tvProfileFarmName.setText(currentFarmName);
        if (!currentSupplierCode.isEmpty()) tvProfileSupplierCode.setText(currentSupplierCode);
        if (!currentContactPerson.isEmpty()) tvProfileContactPerson.setText(currentContactPerson);
        if (!currentEmail.isEmpty()) tvProfileEmail.setText(currentEmail);
        if (!currentPhone.isEmpty()) tvProfilePhone.setText(currentPhone);
        if (!currentCity.isEmpty()) tvProfileLocation.setText(currentCity);
        if (!currentAddress.isEmpty()) tvProfileAddress.setText(currentAddress);
        if (currentCapacity > 0) tvProfileCapacity.setText(String.format("%,d Stems / mo", currentCapacity));

        if (tvProfileTotalPayouts != null) tvProfileTotalPayouts.setText("Rs. 0");
        if (tvProfileActiveOrders != null) tvProfileActiveOrders.setText("0");
        if (tvProfileVarieties != null) tvProfileVarieties.setText("0");
    }

    private void setupListeners() {
        if (btnEditProfileHeader != null) {
            AnimationUtilsHelper.applyPressScale(btnEditProfileHeader);
            btnEditProfileHeader.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    showEditProfileDialog();
                }
            });
        }

        if (btnEditProfileSupplier != null) {
            AnimationUtilsHelper.applyPressScale(btnEditProfileSupplier);
            btnEditProfileSupplier.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    showEditProfileDialog();
                }
            });
        }

        if (rowSupplierChangePassword != null) {
            AnimationUtilsHelper.applyPressScale(rowSupplierChangePassword);
            rowSupplierChangePassword.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    showChangePasswordDialog();
                }
            });
        }

        if (rowSupplierSupport != null) {
            AnimationUtilsHelper.applyPressScale(rowSupplierSupport);
            rowSupplierSupport.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    openWhatsAppHelpDesk();
                }
            });
        }

        if (btnSupplierProfileLogout != null) {
            AnimationUtilsHelper.applyPressScale(btnSupplierProfileLogout);
            btnSupplierProfileLogout.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    showLogoutConfirmation();
                }
            });
        }
    }

    private void fetchLiveSupplierProfile() {
        if (getContext() == null) return;
        currentUserId = PetalioUserPrefs.getSupplierId(requireContext());
        if (currentUserId <= 0 || !"SUPPLIER".equalsIgnoreCase(PetalioUserPrefs.getUserRole(requireContext()))) {
            return;
        }

        ApiClient.getApiService(requireContext())
                .getSupplierProfile(currentUserId)
                .enqueue(new Callback<SupplierProfileResponse>() {
                    @Override
                    public void onResponse(Call<SupplierProfileResponse> call, Response<SupplierProfileResponse> response) {
                        if (!isAdded() || getContext() == null) return;
                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess() && response.body().getProfile() != null) {
                            SupplierProfileResponse.SupplierProfileDto p = response.body().getProfile();

                            currentFarmName = p.getSupplierName();
                            currentContactPerson = p.getContactPerson();
                            currentEmail = p.getEmail();
                            currentPhone = p.getPhone();
                            currentCity = p.getCity();
                            currentAddress = p.getAddress();
                            currentSupplierCode = p.getSupplierCode();
                            currentCapacity = p.getMonthlyCapacity();

                            tvProfileFarmName.setText(currentFarmName.isEmpty() ? currentContactPerson : currentFarmName);
                            tvProfileSupplierCode.setText(currentSupplierCode.isEmpty() ? "—" : currentSupplierCode);

                            tvProfileVerificationBadge.setText(p.getStatus());
                            if (p.isApproved()) {
                                tvProfileVerificationBadge.setBackgroundResource(R.drawable.bg_badge_in_stock);
                                tvProfileVerificationBadge.setTextColor(ContextCompat.getColor(requireContext(), R.color.badge_in_stock_text));
                            } else {
                                tvProfileVerificationBadge.setBackgroundResource(R.drawable.bg_badge_status);
                                tvProfileVerificationBadge.setTextColor(ContextCompat.getColor(requireContext(), R.color.badge_dispatched_text));
                            }

                            tvProfileTotalPayouts.setText(p.getTotalPayoutsFormatted());
                            tvProfileActiveOrders.setText(String.valueOf(p.getActiveOrders()));
                            tvProfileVarieties.setText(String.valueOf(p.getSuppliedVarieties()));

                            tvProfileContactPerson.setText(currentContactPerson.isEmpty() ? "—" : currentContactPerson);
                            tvProfileEmail.setText(currentEmail.isEmpty() ? "—" : currentEmail);
                            tvProfilePhone.setText(currentPhone.isEmpty() ? "—" : currentPhone);
                            tvProfileLocation.setText(currentCity.isEmpty() ? "—" : currentCity);
                            tvProfileAddress.setText(currentAddress.isEmpty() ? "—" : currentAddress);
                            tvProfileCapacity.setText(String.format("%,d Stems / mo", currentCapacity));

                            // Sync to PetalioUserPrefs
                            PetalioUserPrefs.saveSupplierInfo(
                                    requireContext(),
                                    p.getSupplierId() > 0 ? p.getSupplierId() : currentUserId,
                                    currentSupplierCode,
                                    currentFarmName,
                                    currentContactPerson,
                                    currentEmail,
                                    currentPhone,
                                    currentCity,
                                    currentAddress,
                                    currentCapacity,
                                    p.isApproved()
                            );
                        }
                    }

                    @Override
                    public void onFailure(Call<SupplierProfileResponse> call, Throwable t) {
                        // Keep current cached values gracefully
                    }
                });
    }

    private void showEditProfileDialog() {
        if (getContext() == null) return;
        View dialogView = LayoutInflater.from(requireContext()).inflate(R.layout.dialog_edit_supplier_profile, null);

        TextInputLayout tilFarm = dialogView.findViewById(R.id.tilSupplierFarmName);
        TextInputLayout tilContact = dialogView.findViewById(R.id.tilSupplierContactPerson);
        TextInputLayout tilPhone = dialogView.findViewById(R.id.tilSupplierPhone);
        TextInputLayout tilCity = dialogView.findViewById(R.id.tilSupplierCity);
        TextInputLayout tilAddress = dialogView.findViewById(R.id.tilSupplierAddress);
        TextInputLayout tilCapacity = dialogView.findViewById(R.id.tilSupplierCapacity);

        TextInputEditText etFarm = dialogView.findViewById(R.id.etSupplierFarmName);
        TextInputEditText etContact = dialogView.findViewById(R.id.etSupplierContactPerson);
        TextInputEditText etPhone = dialogView.findViewById(R.id.etSupplierPhone);
        TextInputEditText etCity = dialogView.findViewById(R.id.etSupplierCity);
        TextInputEditText etAddress = dialogView.findViewById(R.id.etSupplierAddress);
        TextInputEditText etCapacity = dialogView.findViewById(R.id.etSupplierCapacity);

        Button btnCancel = dialogView.findViewById(R.id.btnCancelEditSupplierProfile);
        Button btnSave = dialogView.findViewById(R.id.btnSaveEditSupplierProfile);

        if (etFarm != null) etFarm.setText(currentFarmName);
        if (etContact != null) etContact.setText(currentContactPerson);
        if (etPhone != null) etPhone.setText(currentPhone);
        if (etCity != null) etCity.setText(currentCity);
        if (etAddress != null) etAddress.setText(currentAddress);
        if (etCapacity != null) etCapacity.setText(currentCapacity > 0 ? String.valueOf(currentCapacity) : "");

        AlertDialog dialog = new AlertDialog.Builder(requireContext())
                .setView(dialogView)
                .setCancelable(true)
                .create();

        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        }

        if (btnCancel != null) {
            btnCancel.setOnClickListener(v -> dialog.dismiss());
        }

        if (btnSave != null) {
            btnSave.setOnClickListener(v -> {
                if (tilFarm != null) tilFarm.setError(null);
                if (tilContact != null) tilContact.setError(null);
                if (tilPhone != null) tilPhone.setError(null);
                if (tilCity != null) tilCity.setError(null);
                if (tilCapacity != null) tilCapacity.setError(null);

                String newFarm = etFarm != null && etFarm.getText() != null ? etFarm.getText().toString().trim() : "";
                String newContact = etContact != null && etContact.getText() != null ? etContact.getText().toString().trim() : "";
                String newPhone = etPhone != null && etPhone.getText() != null ? etPhone.getText().toString().trim() : "";
                String newCity = etCity != null && etCity.getText() != null ? etCity.getText().toString().trim() : "";
                String newAddr = etAddress != null && etAddress.getText() != null ? etAddress.getText().toString().trim() : "";
                String capStr = etCapacity != null && etCapacity.getText() != null ? etCapacity.getText().toString().trim() : "";

                if (newFarm.isEmpty()) {
                    if (tilFarm != null) tilFarm.setError("Farm / Business name is required");
                    if (etFarm != null) etFarm.requestFocus();
                    return;
                }
                if (newContact.isEmpty()) {
                    if (tilContact != null) tilContact.setError("Contact person is required");
                    if (etContact != null) etContact.requestFocus();
                    return;
                }
                if (!newPhone.isEmpty() && !newPhone.replaceAll("[\\s-]", "").matches("^(\\+94|0)[0-9]{9}$")) {
                    if (tilPhone != null) tilPhone.setError("Enter a valid 10-digit phone number (e.g. 0771234567)");
                    if (etPhone != null) etPhone.requestFocus();
                    return;
                }
                int newCap = currentCapacity;
                if (!capStr.isEmpty()) {
                    try {
                        newCap = Integer.parseInt(capStr);
                        if (newCap < 0) throw new NumberFormatException();
                    } catch (NumberFormatException e) {
                        if (tilCapacity != null) tilCapacity.setError("Enter a valid stem capacity");
                        if (etCapacity != null) etCapacity.requestFocus();
                        return;
                    }
                }

                btnSave.setEnabled(false);
                btnSave.setText("Saving...");

                SupplierProfileUpdateRequest req = new SupplierProfileUpdateRequest(
                        newFarm,
                        newContact,
                        newPhone,
                        newCity,
                        newAddr,
                        newCap
                );

                int finalCap = newCap;
                ApiClient.getApiService(requireContext())
                        .updateSupplierProfile(currentUserId, req)
                        .enqueue(new Callback<CommonResponse>() {
                            @Override
                            public void onResponse(Call<CommonResponse> call, Response<CommonResponse> response) {
                                if (!isAdded() || getContext() == null) return;
                                btnSave.setEnabled(true);
                                btnSave.setText("Save Changes");

                                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                                    PetalioUserPrefs.saveSupplierInfo(
                                            requireContext(),
                                            currentUserId,
                                            currentSupplierCode,
                                            newFarm,
                                            newContact,
                                            currentEmail,
                                            newPhone,
                                            newCity,
                                            newAddr,
                                            finalCap,
                                            true
                                    );
                                    Toast.makeText(requireContext(), "Estate profile updated!", Toast.LENGTH_SHORT).show();
                                    dialog.dismiss();
                                    fetchLiveSupplierProfile();
                                } else {
                                    String msg = (response.body() != null && response.body().getMessage() != null && !response.body().getMessage().trim().isEmpty())
                                            ? response.body().getMessage()
                                            : ApiClient.extractErrorMessage(response, "Update failed. Please try again.");
                                    Toast.makeText(requireContext(), msg, Toast.LENGTH_SHORT).show();
                                }
                            }

                            @Override
                            public void onFailure(Call<CommonResponse> call, Throwable t) {
                                if (!isAdded() || getContext() == null) return;
                                btnSave.setEnabled(true);
                                btnSave.setText("Save Changes");
                                Toast.makeText(requireContext(), "Network error: Unable to save estate profile changes.", Toast.LENGTH_SHORT).show();
                            }
                        });
            });
        }

        dialog.show();
        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        }
    }

    private void showChangePasswordDialog() {
        if (getContext() == null) return;
        View dialogView = LayoutInflater.from(requireContext()).inflate(R.layout.dialog_change_password, null);

        TextInputLayout tilCurrentPass = dialogView.findViewById(R.id.tilCurrentPassword);
        TextInputEditText etCurrentPass = dialogView.findViewById(R.id.etCurrentPassword);
        TextInputLayout tilNewPass = dialogView.findViewById(R.id.tilNewPassword);
        TextInputEditText etNewPass = dialogView.findViewById(R.id.etNewPassword);
        TextInputLayout tilConfirmPass = dialogView.findViewById(R.id.tilConfirmPassword);
        TextInputEditText etConfirmPass = dialogView.findViewById(R.id.etConfirmPassword);

        Button btnCancel = dialogView.findViewById(R.id.btnCancelChangePassword);
        Button btnSubmit = dialogView.findViewById(R.id.btnSubmitChangePassword);

        if (btnCancel != null) {
            AnimationUtilsHelper.applyPressScale(btnCancel);
        }
        if (btnSubmit != null) {
            AnimationUtilsHelper.applyPressScale(btnSubmit);
        }

        AlertDialog dialog = new AlertDialog.Builder(requireContext())
                .setView(dialogView)
                .setCancelable(true)
                .create();

        if (btnCancel != null) {
            btnCancel.setOnClickListener(v -> dialog.dismiss());
        }

        if (btnSubmit != null) {
            btnSubmit.setOnClickListener(v -> {
                if (tilCurrentPass != null) tilCurrentPass.setError(null);
                if (tilNewPass != null) tilNewPass.setError(null);
                if (tilConfirmPass != null) tilConfirmPass.setError(null);

                String currentP = etCurrentPass != null && etCurrentPass.getText() != null ? etCurrentPass.getText().toString().trim() : "";
                String newP = etNewPass != null && etNewPass.getText() != null ? etNewPass.getText().toString().trim() : "";
                String confirmP = etConfirmPass != null && etConfirmPass.getText() != null ? etConfirmPass.getText().toString().trim() : "";

                if (currentP.isEmpty()) {
                    if (tilCurrentPass != null) tilCurrentPass.setError("Enter current password");
                    else Toast.makeText(requireContext(), "Please enter current password", Toast.LENGTH_SHORT).show();
                    return;
                }
                if (newP.length() < 6) {
                    if (tilNewPass != null) tilNewPass.setError("Password must be at least 6 characters");
                    else Toast.makeText(requireContext(), "Password must be at least 6 characters", Toast.LENGTH_SHORT).show();
                    return;
                }
                if (!newP.equals(confirmP)) {
                    if (tilConfirmPass != null) tilConfirmPass.setError("New passwords do not match");
                    else Toast.makeText(requireContext(), "New passwords do not match", Toast.LENGTH_SHORT).show();
                    return;
                }

                btnSubmit.setEnabled(false);
                btnSubmit.setText("Updating...");

                int uid = (currentUserId > 0) ? currentUserId : PetalioUserPrefs.getUserId(requireContext());

                ApiClient.getApiService(requireContext())
                        .changePassword(new ChangePasswordRequest(uid, currentP, newP))
                        .enqueue(new Callback<CommonResponse>() {
                            @Override
                            public void onResponse(Call<CommonResponse> call, Response<CommonResponse> response) {
                                if (!isAdded() || getContext() == null) return;
                                btnSubmit.setEnabled(true);
                                btnSubmit.setText("Update Password");

                                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                                    Toast.makeText(requireContext(), "Password changed successfully! Please use your new password next time.", Toast.LENGTH_LONG).show();
                                    dialog.dismiss();
                                } else {
                                    String msg = ApiClient.extractErrorMessage(response, "Current password may be incorrect.");
                                    if (tilCurrentPass != null) tilCurrentPass.setError(msg);
                                    Toast.makeText(requireContext(), msg, Toast.LENGTH_LONG).show();
                                }
                            }

                            @Override
                            public void onFailure(Call<CommonResponse> call, Throwable t) {
                                if (!isAdded() || getContext() == null) return;
                                btnSubmit.setEnabled(true);
                                btnSubmit.setText("Update Password");
                                Toast.makeText(requireContext(), "Network error: Could not update password", Toast.LENGTH_SHORT).show();
                            }
                        });
            });
        }

        dialog.show();
        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        }
    }

    private void openWhatsAppHelpDesk() {
        try {
            String phone = "+94774228936";
            String message = "Hello Petalio Blossom Florist Desk! I am reaching out from the Supplier Portal regarding my farm floral orders.";
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(Uri.parse("https://wa.me/" + phone.replace("+", "") + "?text=" + Uri.encode(message)));
            startActivity(intent);
        } catch (Exception e) {
            Toast.makeText(requireContext(), "WhatsApp is not installed on this device", Toast.LENGTH_SHORT).show();
        }
    }

    private void showLogoutConfirmation() {
        if (getContext() == null) return;
        new AlertDialog.Builder(requireContext())
                .setTitle("Sign Out")
                .setMessage("Are you sure you want to log out from your Supplier Portal?")
                .setPositiveButton("Logout", (dialog, which) -> {
                    PetalioUserPrefs.clear(requireContext());
                    CartManager.getInstance(requireContext()).clearCart();
                    requireContext().getSharedPreferences("PetalioSupplierPrefs", Context.MODE_PRIVATE).edit().clear().apply();

                    Toast.makeText(requireContext(), "Logged out successfully", Toast.LENGTH_SHORT).show();
                    Intent intent = new Intent(requireActivity(), LoginActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(intent);
                    requireActivity().finish();
                })
                .setNegativeButton("Cancel", null)
                .show();
    }
}
