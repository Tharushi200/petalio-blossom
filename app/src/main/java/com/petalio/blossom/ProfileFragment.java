package com.petalio.blossom;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.widget.SwitchCompat;
import androidx.cardview.widget.CardView;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;

import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.ApiService;
import com.petalio.blossom.network.ChangePasswordRequest;
import com.petalio.blossom.network.CommonResponse;
import com.petalio.blossom.network.CustomerPaymentMethodsResponse;
import com.petalio.blossom.network.RedeemPointsResponse;
import com.petalio.blossom.network.ReminderDto;
import com.petalio.blossom.network.RemindersResponse;
import com.petalio.blossom.network.UpdateProfileRequest;
import com.petalio.blossom.network.UserDto;
import com.petalio.blossom.network.UserProfileResponse;

import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * Enhanced Profile Fragment for Petalio Blossom.
 * Fully connected to MySQL database with 100% authentic user data and real dynamic stats.
 */
public class ProfileFragment extends Fragment {

    private static final String PREFS_NAME = "PetalioUserPrefs";
    private static final String KEY_AVATAR_URI = "PROFILE_AVATAR_URI";
    private static final String KEY_REMINDER_TITLE = "REMINDER_TITLE";
    private static final String KEY_REMINDER_DATE = "REMINDER_DATE";
    private static final String KEY_REMINDER_PRESET = "REMINDER_PRESET";

    private View btnEditProfileHeader;
    private View btnAvatar;
    private ImageView ivProfileAvatarPhoto;
    private TextView tvProfileName, tvProfileEmail, tvProfilePhone;
    private TextView badgeMembershipTier, badgeVerifiedBuyer;
    private TextView tvMetricOrdersCount, tvMetricPointsCount, tvMetricWalletCount;
    private CardView cardMetricOrders, cardMetricPoints, cardMetricWallet;
    private CardView cardRewardsBanner, cardReminderItem;
    private TextView btnRedeemPoints, tvRewardsSubtitle;
    private ProgressBar pbRewardsProgress;
    private TextView tvReminderTitle, tvReminderDate, tvReminderPreset;
    private TextView tvSavedAddressesCount;
    private View rowSavedAddresses, rowPaymentMethods, rowFavourites, rowSupport, rowSecurity;
    private SwitchCompat switchNotifications;
    private Button btnProfileLogout;

    private int currentUserId = -1;
    private int lastLoadedUserId = -1;
    private int currentLoyaltyPoints = 0;
    private double currentWalletCredits = 0.0;
    private int currentOrdersCount = 0;

    private ActivityResultLauncher<String> photoPickerLauncher;

    private int resolveActiveCustomerId() {
        if (getContext() == null) return -1;
        int custId = PetalioUserPrefs.getCustomerId(requireContext());
        return custId > 0 ? custId : PetalioUserPrefs.getUserId(requireContext());
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        photoPickerLauncher = registerForActivityResult(
                new ActivityResultContracts.GetContent(),
                uri -> {
                    if (uri != null && getContext() != null) {
                        try {
                            getContext().getContentResolver().takePersistableUriPermission(
                                    uri, Intent.FLAG_GRANT_READ_URI_PERMISSION
                            );
                        } catch (Exception ignored) {
                        }
                        int uid = resolveActiveCustomerId();
                        if (uid > 0) {
                            PetalioUserPrefs.putScopedString(requireContext(), KEY_AVATAR_URI, uid, uri.toString());
                        }
                        applyAvatarUri(uri.toString());
                        Toast.makeText(getContext(), "Profile photo updated!", Toast.LENGTH_SHORT).show();
                    }
                }
        );
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_profile, container, false);

        initViews(view);
        loadLocalProfileData();
        fetchLiveProfileData();
        setupListeners();

        return view;
    }

    @Override
    public void onResume() {
        super.onResume();
        if (!isHidden()) {
            loadLocalProfileData();
            fetchLiveProfileData();
        }
    }

    @Override
    public void onHiddenChanged(boolean hidden) {
        super.onHiddenChanged(hidden);
        if (!hidden && isAdded()) {
            loadLocalProfileData();
            fetchLiveProfileData();
        }
    }

    private void initViews(View v) {
        btnEditProfileHeader = v.findViewById(R.id.btnEditProfileHeader);
        btnAvatar = v.findViewById(R.id.btnAvatar);
        ivProfileAvatarPhoto = v.findViewById(R.id.ivProfileAvatarPhoto);

        tvProfileName = v.findViewById(R.id.tvProfileName);
        tvProfileEmail = v.findViewById(R.id.tvProfileEmail);
        tvProfilePhone = v.findViewById(R.id.tvProfilePhone);

        badgeMembershipTier = v.findViewById(R.id.badgeMembershipTier);
        badgeVerifiedBuyer = v.findViewById(R.id.badgeVerifiedBuyer);

        tvMetricOrdersCount = v.findViewById(R.id.tvMetricOrdersCount);
        tvMetricPointsCount = v.findViewById(R.id.tvMetricPointsCount);
        tvMetricWalletCount = v.findViewById(R.id.tvMetricWalletCount);

        cardMetricOrders = v.findViewById(R.id.cardMetricOrders);
        cardMetricPoints = v.findViewById(R.id.cardMetricPoints);
        cardMetricWallet = v.findViewById(R.id.cardMetricWallet);

        cardRewardsBanner = v.findViewById(R.id.cardRewardsBanner);
        btnRedeemPoints = v.findViewById(R.id.btnRedeemPoints);
        tvRewardsSubtitle = v.findViewById(R.id.tvRewardsSubtitle);
        pbRewardsProgress = v.findViewById(R.id.pbRewardsProgress);

        cardReminderItem = v.findViewById(R.id.cardReminderItem);
        tvReminderTitle = v.findViewById(R.id.tvReminderTitle);
        tvReminderDate = v.findViewById(R.id.tvReminderDate);
        tvReminderPreset = v.findViewById(R.id.tvReminderPreset);

        tvSavedAddressesCount = v.findViewById(R.id.tvSavedAddressesCount);
        rowSavedAddresses = v.findViewById(R.id.rowSavedAddresses);
        rowPaymentMethods = v.findViewById(R.id.rowPaymentMethods);
        rowFavourites = v.findViewById(R.id.rowFavourites);
        rowSupport = v.findViewById(R.id.rowSupport);
        rowSecurity = v.findViewById(R.id.rowSecurity);

        switchNotifications = v.findViewById(R.id.switchNotifications);
        btnProfileLogout = v.findViewById(R.id.btnProfileLogout);
    }

    private void resetProfileUiForAccountSwitch() {
        currentOrdersCount = 0;
        currentLoyaltyPoints = 0;
        currentWalletCredits = 0.0;
        if (tvMetricOrdersCount != null) tvMetricOrdersCount.setText("0");
        if (tvMetricPointsCount != null) tvMetricPointsCount.setText("0");
        if (tvMetricWalletCount != null) tvMetricWalletCount.setText("Rs. 0");
        if (badgeMembershipTier != null) badgeMembershipTier.setText("Bloom Member");
        if (badgeVerifiedBuyer != null) badgeVerifiedBuyer.setText("Verified Buyer");
        if (tvRewardsSubtitle != null) tvRewardsSubtitle.setText("You are 500 points away from a FREE Rose Bouquet!");
        if (pbRewardsProgress != null) pbRewardsProgress.setProgress(0);
        if (tvSavedAddressesCount != null) tvSavedAddressesCount.setText("Saved Delivery Addresses (0)");
        resetDefaultAvatar();
    }

    private void resetDefaultAvatar() {
        if (ivProfileAvatarPhoto == null || getContext() == null) return;
        int pad = (int) (16 * getResources().getDisplayMetrics().density);
        ivProfileAvatarPhoto.setPadding(pad, pad, pad, pad);
        ivProfileAvatarPhoto.setImageResource(R.drawable.ic_nav_profile);
        ivProfileAvatarPhoto.setColorFilter(ContextCompat.getColor(requireContext(), R.color.primary_forest));
    }

    private void loadLocalProfileData() {
        if (getContext() == null) return;
        currentUserId = resolveActiveCustomerId();
        if (currentUserId <= 0 || currentUserId != lastLoadedUserId) {
            resetProfileUiForAccountSwitch();
        }
        if (currentUserId <= 0) {
            lastLoadedUserId = -1;
            if (tvProfileName != null) tvProfileName.setText("Guest Customer");
            if (tvProfileEmail != null) tvProfileEmail.setText("");
            if (tvProfilePhone != null) tvProfilePhone.setText("");
            return;
        }

        String name = PetalioUserPrefs.getUserName(requireContext());
        String email = PetalioUserPrefs.getUserEmail(requireContext());
        String phone = PetalioUserPrefs.getUserPhone(requireContext());
        String address = PetalioUserPrefs.getUserAddress(requireContext());

        if (tvProfileName != null) tvProfileName.setText(!name.isEmpty() ? name : "Customer");
        if (tvProfileEmail != null) tvProfileEmail.setText(email);
        if (tvProfilePhone != null) tvProfilePhone.setText(phone);

        // Load avatar photo if saved specifically for this user
        String avatarUri = PetalioUserPrefs.getScopedString(requireContext(), KEY_AVATAR_URI, currentUserId, null);
        if (avatarUri != null && !avatarUri.trim().isEmpty()) {
            applyAvatarUri(avatarUri);
        } else {
            resetDefaultAvatar();
        }

        // Load user-scoped cached floral reminders
        String remTitle = PetalioUserPrefs.getScopedString(requireContext(), KEY_REMINDER_TITLE, currentUserId, "No upcoming occasions set");
        String remDate = PetalioUserPrefs.getScopedString(requireContext(), KEY_REMINDER_DATE, currentUserId, "+ Add Date");
        String remPreset = PetalioUserPrefs.getScopedString(requireContext(), KEY_REMINDER_PRESET, currentUserId, "Tap to schedule anniversary, birthday, or floral occasion");
        if (tvReminderTitle != null) tvReminderTitle.setText(remTitle);
        if (tvReminderDate != null) tvReminderDate.setText(remDate);
        if (tvReminderPreset != null) tvReminderPreset.setText(remPreset);

        if (tvSavedAddressesCount != null) {
            tvSavedAddressesCount.setText("Saved Delivery Addresses (" + (address.trim().isEmpty() ? "0" : "1") + ")");
        }
    }

    private void applyAvatarUri(String uriString) {
        if (ivProfileAvatarPhoto == null) return;
        try {
            Uri uri = Uri.parse(uriString);
            ivProfileAvatarPhoto.setPadding(0, 0, 0, 0);
            ivProfileAvatarPhoto.setImageTintList(null);
            ivProfileAvatarPhoto.setImageURI(uri);
        } catch (Exception ignored) {
        }
    }

    private void fetchLiveProfileData() {
        if (getContext() == null || currentUserId <= 0) return;

        // 1. Fetch Customer Profile & Stats from MySQL via GET /api/customers/:customerId/profile
        ApiClient.getApiService(requireContext()).getCustomerProfile(currentUserId)
                .enqueue(new Callback<UserProfileResponse>() {
                    @Override
                    public void onResponse(Call<UserProfileResponse> call, Response<UserProfileResponse> response) {
                        if (!isAdded() || getContext() == null) return;
                        if (response.isSuccessful() && response.body() != null && response.body().getUser() != null) {
                            UserDto user = response.body().getUser();
                            bindUserProfile(user);
                        } else {
                            // Fallback to getUserProfile
                            ApiClient.getApiService(requireContext()).getUserProfile(currentUserId)
                                    .enqueue(new Callback<UserProfileResponse>() {
                                        @Override
                                        public void onResponse(Call<UserProfileResponse> c, Response<UserProfileResponse> r) {
                                            if (!isAdded() || getContext() == null) return;
                                            if (r.isSuccessful() && r.body() != null && r.body().getUser() != null) {
                                                bindUserProfile(r.body().getUser());
                                            }
                                        }

                                        @Override
                                        public void onFailure(Call<UserProfileResponse> c, Throwable t) {
                                        }
                                    });
                        }
                    }

                    @Override
                    public void onFailure(Call<UserProfileResponse> call, Throwable t) {
                        if (!isAdded() || getContext() == null) return;
                        // Fallback to getUserProfile
                        ApiClient.getApiService(requireContext()).getUserProfile(currentUserId)
                                .enqueue(new Callback<UserProfileResponse>() {
                                    @Override
                                    public void onResponse(Call<UserProfileResponse> c, Response<UserProfileResponse> r) {
                                        if (!isAdded() || getContext() == null) return;
                                        if (r.isSuccessful() && r.body() != null && r.body().getUser() != null) {
                                            bindUserProfile(r.body().getUser());
                                        }
                                    }

                                    @Override
                                    public void onFailure(Call<UserProfileResponse> c, Throwable t) {
                                    }
                                });
                    }
                });

        // 2. Fetch Floral Reminders from MySQL
        fetchLiveRemindersFromBackend(currentUserId);
    }

    private void fetchLiveRemindersFromBackend(int userId) {
        if (getContext() == null || userId <= 0) return;

        ApiClient.getApiService(requireContext()).getReminders(userId)
                .enqueue(new Callback<RemindersResponse>() {
                    @Override
                    public void onResponse(Call<RemindersResponse> call, Response<RemindersResponse> response) {
                        if (!isAdded() || getContext() == null) return;
                        if (response.isSuccessful() && response.body() != null) {
                            List<ReminderDto> list = response.body().getReminders();
                            if (list != null && !list.isEmpty()) {
                                ReminderDto latest = list.get(0);
                                String title = latest.getOccasionTitle();
                                String date = latest.getOccasionDate();
                                String preset = latest.getBouquetPreset();

                                if (tvReminderTitle != null) tvReminderTitle.setText(title);
                                if (tvReminderDate != null) tvReminderDate.setText(date);
                                if (tvReminderPreset != null) {
                                    tvReminderPreset.setText(!preset.isEmpty()
                                            ? ("Preset: " + preset + " • Scheduled Delivery")
                                            : "Scheduled for fresh morning estate delivery");
                                }

                                if (getContext() != null && userId == resolveActiveCustomerId()) {
                                    PetalioUserPrefs.putScopedString(requireContext(), KEY_REMINDER_TITLE, userId, title);
                                    PetalioUserPrefs.putScopedString(requireContext(), KEY_REMINDER_DATE, userId, date);
                                    PetalioUserPrefs.putScopedString(requireContext(), KEY_REMINDER_PRESET, userId, preset);
                                }
                            } else {
                                if (tvReminderTitle != null) tvReminderTitle.setText("No upcoming occasions set");
                                if (tvReminderDate != null) tvReminderDate.setText("+ Add Date");
                                if (tvReminderPreset != null) tvReminderPreset.setText("Tap to schedule anniversary, birthday, or floral occasion");
                            }
                        }
                    }

                    @Override
                    public void onFailure(Call<RemindersResponse> call, Throwable t) {
                    }
                });
    }

    private void bindUserProfile(UserDto user) {
        if (getContext() == null || user == null) return;
        int activeUid = resolveActiveCustomerId();
        int respUid = user.getCustomerId() != null && user.getCustomerId() > 0 ? user.getCustomerId() : user.getUserId();
        if (activeUid <= 0 || (respUid > 0 && respUid != activeUid && user.getUserId() != activeUid)) {
            return;
        }
        lastLoadedUserId = activeUid;

        PetalioUserPrefs.saveCustomerInfo(
                requireContext(),
                user.getUserId() > 0 ? user.getUserId() : activeUid,
                respUid > 0 ? respUid : activeUid,
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getCity()
        );

        if (tvProfileName != null) tvProfileName.setText(!user.getName().isEmpty() ? user.getName() : "Customer");
        if (tvProfileEmail != null) tvProfileEmail.setText(user.getEmail());
        if (tvProfilePhone != null) tvProfilePhone.setText(user.getPhone());

        currentOrdersCount = user.getTotalOrders();
        currentLoyaltyPoints = user.getLoyaltyPoints();
        currentWalletCredits = user.getWalletCredits();

        // Dynamic Membership Tier Badge
        if (badgeMembershipTier != null) {
            if (currentOrdersCount >= 5) {
                badgeMembershipTier.setText("Gold Bloom Member");
            } else if (currentOrdersCount >= 1) {
                badgeMembershipTier.setText("Silver Bloom Member");
            } else {
                badgeMembershipTier.setText("Bloom Member");
            }
        }

        // Dynamic Verification Badge
        if (badgeVerifiedBuyer != null) {
            String status = user.getStatus();
            if ("ACTIVE".equalsIgnoreCase(status) || "VERIFIED".equalsIgnoreCase(status)) {
                badgeVerifiedBuyer.setText("Verified Buyer");
            } else {
                badgeVerifiedBuyer.setText(status != null && !status.isEmpty() ? status : "Active Member");
            }
        }

        if (tvMetricOrdersCount != null) {
            tvMetricOrdersCount.setText(String.valueOf(currentOrdersCount));
        }

        if (tvMetricPointsCount != null) {
            tvMetricPointsCount.setText(String.valueOf(currentLoyaltyPoints));
        }

        if (tvMetricWalletCount != null) {
            tvMetricWalletCount.setText("Rs. " + String.format(Locale.US, "%,d", Math.round(currentWalletCredits)));
        }

        if (tvRewardsSubtitle != null) {
            if (currentLoyaltyPoints >= 500) {
                tvRewardsSubtitle.setText("You have " + currentLoyaltyPoints + " points! Ready to redeem a FREE Bouquet!");
            } else {
                int needed = 500 - currentLoyaltyPoints;
                tvRewardsSubtitle.setText("You are " + needed + " points away from a FREE Rose Bouquet!");
            }
        }

        if (pbRewardsProgress != null) {
            pbRewardsProgress.setProgress(Math.min(500, currentLoyaltyPoints));
        }

        if (tvSavedAddressesCount != null) {
            int addrCount = user.getSavedAddressesCount();
            tvSavedAddressesCount.setText("Saved Delivery Addresses (" + addrCount + ")");
        }
    }

    private void setupListeners() {
        // Tactile Press Scale on Cards & Buttons
        AnimationUtilsHelper.applyPressScale(btnEditProfileHeader);
        AnimationUtilsHelper.applyPressScale(btnAvatar);
        AnimationUtilsHelper.applyPressScale(cardMetricOrders);
        AnimationUtilsHelper.applyPressScale(cardMetricPoints);
        AnimationUtilsHelper.applyPressScale(cardMetricWallet);
        AnimationUtilsHelper.applyPressScale(btnRedeemPoints);
        AnimationUtilsHelper.applyPressScale(cardReminderItem);
        AnimationUtilsHelper.applyPressScale(tvReminderDate);
        AnimationUtilsHelper.applyPressScale(rowSavedAddresses);
        AnimationUtilsHelper.applyPressScale(rowPaymentMethods);
        AnimationUtilsHelper.applyPressScale(rowFavourites);
        AnimationUtilsHelper.applyPressScale(rowSupport);
        AnimationUtilsHelper.applyPressScale(rowSecurity);
        AnimationUtilsHelper.applyPressScale(btnProfileLogout);

        // Edit Profile Dialog
        btnEditProfileHeader.setOnClickListener(v -> showEditProfileDialog());

        // Profile Photo Picker from Phone Gallery
        btnAvatar.setOnClickListener(v -> {
            try {
                photoPickerLauncher.launch("image/*");
            } catch (Exception e) {
                Toast.makeText(getContext(), "Unable to open photo picker", Toast.LENGTH_SHORT).show();
            }
        });

        // 3-Column Metrics navigation & info
        cardMetricOrders.setOnClickListener(v -> {
            if (getActivity() instanceof CustomerMainActivity) {
                ((CustomerMainActivity) getActivity()).switchTab(2); // Go to Orders
            }
        });

        cardMetricPoints.setOnClickListener(v -> {
            Toast.makeText(getContext(), "Bloom Points: " + currentLoyaltyPoints + " (Tier: " + (currentOrdersCount >= 5 ? "Gold Bloom Member" : "Bloom Member") + ")", Toast.LENGTH_SHORT).show();
        });

        cardMetricWallet.setOnClickListener(v -> {
            Toast.makeText(getContext(), "Petalio Wallet Balance: Rs. " + String.format(Locale.US, "%,d", Math.round(currentWalletCredits)) + " (5% Cashback Active)", Toast.LENGTH_SHORT).show();
        });

        // Bloom Rewards Club Redeem Dialog
        btnRedeemPoints.setOnClickListener(v -> showRedeemRewardsDialog());

        // Floral Reminder Item Click -> Edit Occasion Reminder
        cardReminderItem.setOnClickListener(v -> showEditReminderDialog());
        if (tvReminderDate != null) {
            tvReminderDate.setOnClickListener(v -> showEditReminderDialog());
        }

        // Saved Delivery Addresses -> View & Edit
        rowSavedAddresses.setOnClickListener(v -> showSavedAddressesDialog());

        // Payment Methods & Cards
        rowPaymentMethods.setOnClickListener(v -> showPaymentMethodsDialog());

        // Wishlist / Favourites
        rowFavourites.setOnClickListener(v -> {
            Intent intent = new Intent(getContext(), WishlistActivity.class);
            startActivity(intent);
        });

        // 24/6 Florist Chat & Help Desk -> Direct WhatsApp (0774228936)
        rowSupport.setOnClickListener(v -> openFloristSupportWhatsApp());

        // Security & Change Password Dialog
        rowSecurity.setOnClickListener(v -> showChangePasswordDialog());

        // Notifications switch
        switchNotifications.setOnCheckedChangeListener((buttonView, isChecked) -> {
            Toast.makeText(getContext(), isChecked ? "Push notifications enabled for harvest updates" : "Notifications muted", Toast.LENGTH_SHORT).show();
        });

        // Sign Out with Complete Session Reset
        btnProfileLogout.setOnClickListener(v -> showLogoutConfirmationDialog());
    }

    private void showEditProfileDialog() {
        if (getContext() == null) return;

        View dialogView = LayoutInflater.from(requireContext()).inflate(R.layout.dialog_edit_profile, null);

        TextInputLayout tilEditName = dialogView.findViewById(R.id.tilEditName);
        TextInputEditText etEditName = dialogView.findViewById(R.id.etEditName);
        TextInputLayout tilEditPhone = dialogView.findViewById(R.id.tilEditPhone);
        TextInputEditText etEditPhone = dialogView.findViewById(R.id.etEditPhone);
        TextInputLayout tilEditAddress = dialogView.findViewById(R.id.tilEditAddress);
        TextInputEditText etEditAddress = dialogView.findViewById(R.id.etEditAddress);

        Button btnCancel = dialogView.findViewById(R.id.btnCancelEditProfile);
        Button btnSave = dialogView.findViewById(R.id.btnSaveEditProfile);

        etEditName.setText(PetalioUserPrefs.getUserName(requireContext()));
        etEditPhone.setText(PetalioUserPrefs.getUserPhone(requireContext()));
        etEditAddress.setText(PetalioUserPrefs.getUserAddress(requireContext()));

        AlertDialog dialog = new AlertDialog.Builder(requireContext())
                .setView(dialogView)
                .setCancelable(true)
                .create();

        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        }

        btnCancel.setOnClickListener(v -> dialog.dismiss());

        btnSave.setOnClickListener(v -> {
            tilEditName.setError(null);
            tilEditPhone.setError(null);

            String newName = etEditName.getText() != null ? etEditName.getText().toString().trim() : "";
            String newPhone = etEditPhone.getText() != null ? etEditPhone.getText().toString().trim() : "";
            String newAddress = etEditAddress.getText() != null ? etEditAddress.getText().toString().trim() : "";

            if (newName.isEmpty()) {
                tilEditName.setError("Name cannot be empty");
                return;
            }
            if (!newPhone.isEmpty() && !newPhone.replaceAll("[\\s-]", "").matches("^(\\+94|0)[0-9]{9}$")) {
                tilEditPhone.setError("Enter a valid 10-digit phone number (e.g. 0771234567)");
                return;
            }

            btnSave.setEnabled(false);
            btnSave.setText("Saving...");

            String currentCity = PetalioUserPrefs.getUserCity(requireContext());

            ApiClient.getApiService(requireContext()).updateUserProfile(
                    currentUserId,
                    new UpdateProfileRequest(newName, newPhone, newAddress, currentCity)
            ).enqueue(new Callback<UserProfileResponse>() {
                @Override
                public void onResponse(Call<UserProfileResponse> call, Response<UserProfileResponse> response) {
                    if (!isAdded() || getContext() == null) return;
                    btnSave.setEnabled(true);
                    btnSave.setText("Save Changes");

                    if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                        PetalioUserPrefs.saveUserInfo(
                                requireContext(),
                                currentUserId,
                                newName,
                                PetalioUserPrefs.getUserEmail(requireContext()),
                                newPhone,
                                PetalioUserPrefs.getUserRole(requireContext()),
                                newAddress,
                                currentCity
                        );

                        if (tvProfileName != null) tvProfileName.setText(newName);
                        if (tvProfilePhone != null) tvProfilePhone.setText(newPhone);
                        if (tvSavedAddressesCount != null) {
                            tvSavedAddressesCount.setText("Saved Delivery Addresses (" + (newAddress.isEmpty() ? "0" : "1") + ")");
                        }

                        Toast.makeText(getContext(), "Profile updated successfully!", Toast.LENGTH_SHORT).show();
                        dialog.dismiss();
                    } else {
                        String msg = (response.body() != null && response.body().getMessage() != null && !response.body().getMessage().trim().isEmpty())
                                ? response.body().getMessage()
                                : ApiClient.extractErrorMessage(response, "Failed to update profile");
                        Toast.makeText(getContext(), msg, Toast.LENGTH_LONG).show();
                    }
                }

                @Override
                public void onFailure(Call<UserProfileResponse> call, Throwable t) {
                    if (!isAdded() || getContext() == null) return;
                    btnSave.setEnabled(true);
                    btnSave.setText("Save Changes");
                    Toast.makeText(getContext(), "Unable to reach server. Changes were not saved.", Toast.LENGTH_SHORT).show();
                }
            });
        });

        dialog.show();
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

        AlertDialog dialog = new AlertDialog.Builder(requireContext())
                .setView(dialogView)
                .setCancelable(true)
                .create();

        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        }

        btnCancel.setOnClickListener(v -> dialog.dismiss());

        btnSubmit.setOnClickListener(v -> {
            tilCurrentPass.setError(null);
            tilNewPass.setError(null);
            tilConfirmPass.setError(null);

            String currentPass = etCurrentPass.getText() != null ? etCurrentPass.getText().toString().trim() : "";
            String newPass = etNewPass.getText() != null ? etNewPass.getText().toString().trim() : "";
            String confirmPass = etConfirmPass.getText() != null ? etConfirmPass.getText().toString().trim() : "";

            if (currentPass.isEmpty()) {
                tilCurrentPass.setError("Enter current password");
                return;
            }
            if (newPass.length() < 6) {
                tilNewPass.setError("Password must be at least 6 characters");
                return;
            }
            if (!newPass.equals(confirmPass)) {
                tilConfirmPass.setError("Passwords do not match");
                return;
            }

            btnSubmit.setEnabled(false);
            btnSubmit.setText("Updating...");

            ApiClient.getApiService(requireContext()).changePassword(
                    new ChangePasswordRequest(currentUserId, currentPass, newPass)
            ).enqueue(new Callback<CommonResponse>() {
                @Override
                public void onResponse(Call<CommonResponse> call, Response<CommonResponse> response) {
                    if (!isAdded() || getContext() == null) return;
                    btnSubmit.setEnabled(true);
                    btnSubmit.setText("Update Password");

                    if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                        Toast.makeText(getContext(), "Password changed successfully! Please use your new password next time.", Toast.LENGTH_LONG).show();
                        dialog.dismiss();
                    } else {
                        String msg = (response.body() != null && response.body().getMessage() != null && !response.body().getMessage().trim().isEmpty())
                                ? response.body().getMessage()
                                : ApiClient.extractErrorMessage(response, "Failed to change password. Check current password.");
                        tilCurrentPass.setError(msg);
                        Toast.makeText(getContext(), msg, Toast.LENGTH_LONG).show();
                    }
                }

                @Override
                public void onFailure(Call<CommonResponse> call, Throwable t) {
                    if (!isAdded() || getContext() == null) return;
                    btnSubmit.setEnabled(true);
                    btnSubmit.setText("Update Password");
                    Toast.makeText(getContext(), "Network error: Unable to contact server", Toast.LENGTH_SHORT).show();
                }
            });
        });

        dialog.show();
    }

    private void openFloristSupportWhatsApp() {
        String phoneNumber = "94774228936";
        String message = "Hello Petalio Blossom Support! I need assistance with my floral order.";
        String url = "https://wa.me/" + phoneNumber + "?text=" + Uri.encode(message);

        try {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(Uri.parse(url));
            startActivity(intent);
        } catch (Exception e) {
            Toast.makeText(getContext(), "Florist Support Hotline: +94 77 422 8936\n(WhatsApp not installed)", Toast.LENGTH_LONG).show();
        }
    }

    private void showRedeemRewardsDialog() {
        if (getContext() == null) return;

        if (currentLoyaltyPoints < 500) {
            int needed = 500 - currentLoyaltyPoints;
            new AlertDialog.Builder(requireContext())
                    .setTitle("Bloom Rewards Club")
                    .setMessage("You currently have " + currentLoyaltyPoints + " Bloom Points.\n\nYou need " + needed + " more points to unlock Rs. 500 Wallet Credit!\n\n(Earn 50 points with every highland floral arrangement order!)")
                    .setPositiveButton("Explore Blooms", (dialog, which) -> {
                        if (getActivity() instanceof CustomerMainActivity) {
                            ((CustomerMainActivity) getActivity()).switchTab(0);
                        }
                    })
                    .setNegativeButton("Close", null)
                    .show();
            return;
        }

        // Available points >= 500 -> Confirmation Dialog
        new AlertDialog.Builder(requireContext())
                .setTitle("Redeem Bloom Points")
                .setMessage("Redeem 500 Bloom Points for Rs. 500 Wallet Credit?\n\nAvailable Balance: " + currentLoyaltyPoints + " Points\nCurrent Wallet: Rs. " + String.format(Locale.US, "%,d", Math.round(currentWalletCredits)))
                .setPositiveButton("Redeem Rs. 500", (dialog, which) -> {
                    redeemBloomPoints();
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void redeemBloomPoints() {
        if (getContext() == null || currentUserId <= 0) {
            Toast.makeText(getContext(), "Please sign in to redeem Bloom Points.", Toast.LENGTH_SHORT).show();
            return;
        }

        Toast.makeText(getContext(), "Redeeming 500 Bloom Points...", Toast.LENGTH_SHORT).show();

        ApiService apiService = ApiClient.getApiService(requireContext());
        apiService.redeemPoints(currentUserId).enqueue(new Callback<RedeemPointsResponse>() {
            @Override
            public void onResponse(@NonNull Call<RedeemPointsResponse> call, @NonNull Response<RedeemPointsResponse> response) {
                if (!isAdded() || getContext() == null) return;

                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    RedeemPointsResponse data = response.body();
                    currentLoyaltyPoints = data.getPoints();
                    currentWalletCredits = data.getWalletBalance();

                    // Refresh Profile UI immediately
                    if (tvMetricPointsCount != null) {
                        tvMetricPointsCount.setText(String.valueOf(currentLoyaltyPoints));
                    }
                    if (tvMetricWalletCount != null) {
                        tvMetricWalletCount.setText("Rs. " + String.format(Locale.US, "%,d", Math.round(currentWalletCredits)));
                    }
                    if (tvRewardsSubtitle != null) {
                        if (currentLoyaltyPoints >= 500) {
                            tvRewardsSubtitle.setText("You have " + currentLoyaltyPoints + " points! Ready to redeem a FREE Bouquet!");
                        } else {
                            int needed = 500 - currentLoyaltyPoints;
                            tvRewardsSubtitle.setText("You are " + needed + " points away from a FREE Rose Bouquet!");
                        }
                    }
                    if (pbRewardsProgress != null) {
                        pbRewardsProgress.setProgress(Math.min(500, currentLoyaltyPoints));
                    }

                    // Success dialog
                    new AlertDialog.Builder(requireContext())
                            .setTitle("Redemption Successful!")
                            .setMessage("Successfully redeemed 500 Bloom Points for Rs. 500 Wallet Credit!\n\nNew Points Balance: " + currentLoyaltyPoints + " Points\nNew Wallet Balance: Rs. " + String.format(Locale.US, "%,d", Math.round(currentWalletCredits)))
                            .setPositiveButton("Awesome", null)
                            .show();

                    // Re-sync full profile in background
                    fetchLiveProfileData();
                } else {
                    String errorMsg = "Unable to redeem points. Please try again.";
                    if (response.body() != null && !response.body().getMessage().isEmpty()) {
                        errorMsg = response.body().getMessage();
                    }
                    Toast.makeText(getContext(), errorMsg, Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<RedeemPointsResponse> call, @NonNull Throwable t) {
                if (!isAdded() || getContext() == null) return;
                Toast.makeText(getContext(), "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showEditReminderDialog() {
        if (getContext() == null) return;

        View dialogView = LayoutInflater.from(requireContext()).inflate(R.layout.dialog_floral_reminder, null);

        TextInputEditText etTitle = dialogView.findViewById(R.id.etReminderTitle);
        TextInputEditText etDate = dialogView.findViewById(R.id.etReminderDate);
        TextInputEditText etPreset = dialogView.findViewById(R.id.etReminderPreset);

        Button btnCancel = dialogView.findViewById(R.id.btnCancelReminder);
        Button btnSave = dialogView.findViewById(R.id.btnSaveReminder);

        int uid = resolveActiveCustomerId();
        etTitle.setText(PetalioUserPrefs.getScopedString(requireContext(), KEY_REMINDER_TITLE, uid, ""));
        etDate.setText(PetalioUserPrefs.getScopedString(requireContext(), KEY_REMINDER_DATE, uid, ""));
        etPreset.setText(PetalioUserPrefs.getScopedString(requireContext(), KEY_REMINDER_PRESET, uid, ""));

        AlertDialog dialog = new AlertDialog.Builder(requireContext())
                .setView(dialogView)
                .setCancelable(true)
                .create();

        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        }

        btnCancel.setOnClickListener(v -> dialog.dismiss());

        btnSave.setOnClickListener(v -> {
            String newTitle = etTitle.getText() != null ? etTitle.getText().toString().trim() : "";
            String newDate = etDate.getText() != null ? etDate.getText().toString().trim() : "";
            String newPreset = etPreset.getText() != null ? etPreset.getText().toString().trim() : "";

            if (newTitle.isEmpty()) {
                Toast.makeText(getContext(), "Please enter an occasion title", Toast.LENGTH_SHORT).show();
                return;
            }

            if (newDate.isEmpty()) {
                newDate = "Upcoming";
            }

            saveReminderToBackend(newTitle, newDate, newPreset);
            dialog.dismiss();
        });

        dialog.show();
    }

    private void saveReminderToBackend(String title, String date, String preset) {
        if (getContext() == null || currentUserId <= 0) return;

        ReminderDto dto = new ReminderDto(currentUserId, title, date, preset);
        ApiClient.getApiService(requireContext()).saveReminder(dto)
                .enqueue(new Callback<CommonResponse>() {
                    @Override
                    public void onResponse(Call<CommonResponse> call, Response<CommonResponse> response) {
                        if (!isAdded() || getContext() == null) return;
                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            Toast.makeText(getContext(), "Occasion reminder saved!", Toast.LENGTH_SHORT).show();
                            fetchLiveRemindersFromBackend(currentUserId);
                        } else {
                            // Update locally if backend response differs
                            updateLocalReminderView(title, date, preset);
                        }
                    }

                    @Override
                    public void onFailure(Call<CommonResponse> call, Throwable t) {
                        if (!isAdded() || getContext() == null) return;
                        updateLocalReminderView(title, date, preset);
                    }
                });
    }

    private void updateLocalReminderView(String title, String date, String preset) {
        if (tvReminderTitle != null) tvReminderTitle.setText(title);
        if (tvReminderDate != null) tvReminderDate.setText(date);
        if (tvReminderPreset != null) {
            tvReminderPreset.setText(!preset.isEmpty() ? ("Preset: " + preset) : "Scheduled for fresh morning estate delivery");
        }
        if (getContext() != null && currentUserId > 0) {
            PetalioUserPrefs.putScopedString(requireContext(), KEY_REMINDER_TITLE, currentUserId, title);
            PetalioUserPrefs.putScopedString(requireContext(), KEY_REMINDER_DATE, currentUserId, date);
            PetalioUserPrefs.putScopedString(requireContext(), KEY_REMINDER_PRESET, currentUserId, preset);
        }
    }

    private void showSavedAddressesDialog() {
        if (getContext() == null) return;
        String currentAddress = PetalioUserPrefs.getUserAddress(requireContext());
        String currentCity = PetalioUserPrefs.getUserCity(requireContext());

        String displayAddr = currentAddress.isEmpty()
                ? "No default delivery address set yet."
                : (currentAddress + (!currentCity.isEmpty() ? (", " + currentCity) : "") + " (Default)");

        new AlertDialog.Builder(requireContext())
                .setTitle("Saved Delivery Addresses")
                .setMessage("Primary Delivery Location:\n\n" + displayAddr)
                .setPositiveButton("Update Address", (dialog, which) -> showEditProfileDialog())
                .setNegativeButton("Close", null)
                .show();
    }

    private void showPaymentMethodsDialog() {
        if (getContext() == null || currentUserId <= 0) return;
        Toast.makeText(getContext(), "Loading payment records...", Toast.LENGTH_SHORT).show();

        ApiClient.getApiService(requireContext())
                .getCustomerPaymentMethods(currentUserId)
                .enqueue(new Callback<CustomerPaymentMethodsResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<CustomerPaymentMethodsResponse> call, @NonNull Response<CustomerPaymentMethodsResponse> response) {
                        if (!isAdded() || getContext() == null) return;
                        StringBuilder msg = new StringBuilder();
                        msg.append("Accepted Checkout Methods:\n• Credit / Debit Card\n• Direct Bank Transfer (Commercial Bank)\n");

                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            List<CustomerPaymentMethodsResponse.PaymentRecord> payments = response.body().getPayments();
                            msg.append("\nRecent Payments:\n");
                            if (payments.isEmpty()) {
                                msg.append("No recorded transactions yet.");
                            } else {
                                int limit = Math.min(5, payments.size());
                                for (int i = 0; i < limit; i++) {
                                    CustomerPaymentMethodsResponse.PaymentRecord p = payments.get(i);
                                    String code = p.order_code != null && !p.order_code.isEmpty() ? p.order_code : ("#PB-" + p.order_id);
                                    String method = "BANK_TRANSFER".equalsIgnoreCase(p.payment_method) ? "Bank Transfer" : "Card Payment";
                                    String date = (p.payment_date != null && p.payment_date.length() >= 10) ? p.payment_date.substring(0, 10) : "";
                                    msg.append("• ").append(code).append(" — ").append(method)
                                       .append(" (Rs. ").append(String.format(Locale.US, "%,d", Math.round(p.amount_paid))).append(")")
                                       .append(date.isEmpty() ? "" : (" · " + date)).append("\n");
                                }
                            }
                        }

                        new AlertDialog.Builder(requireContext())
                                .setTitle("Payment Methods & History")
                                .setMessage(msg.toString().trim())
                                .setPositiveButton("Close", null)
                                .show();
                    }

                    @Override
                    public void onFailure(@NonNull Call<CustomerPaymentMethodsResponse> call, @NonNull Throwable t) {
                        if (!isAdded() || getContext() == null) return;
                        Toast.makeText(getContext(), "Unable to fetch payment records right now.", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void showLogoutConfirmationDialog() {
        if (getContext() == null) return;
        new AlertDialog.Builder(requireContext())
                .setTitle("Sign Out")
                .setMessage("Are you sure you want to sign out from Petalio Blossom?")
                .setPositiveButton("Sign Out", (dialog, which) -> {
                    // Clear active Cart, User Preferences, and in-memory Browse caches
                    CartManager.getInstance(requireContext()).clearCart();
                    PetalioUserPrefs.clear(requireContext());
                    BrowseFragment.clearCache();
                    lastLoadedUserId = -1;

                    Toast.makeText(requireContext(), "Signed out successfully", Toast.LENGTH_SHORT).show();

                    // Navigate to LoginActivity clearing task stack
                    Intent intent = new Intent(requireActivity(), LoginActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(intent);
                    requireActivity().finish();
                })
                .setNegativeButton("Cancel", null)
                .show();
    }
}
