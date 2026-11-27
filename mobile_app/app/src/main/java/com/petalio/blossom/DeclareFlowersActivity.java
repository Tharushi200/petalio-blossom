package com.petalio.blossom;

import android.app.AlertDialog;
import android.content.Context;
import android.os.Bundle;
import android.text.InputType;
import android.text.TextUtils;
import android.view.Gravity;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.CommonResponse;
import com.petalio.blossom.network.DeclareFlowerRequest;
import com.petalio.blossom.network.DeclaredFlowerDto;
import com.petalio.blossom.network.DeclaredFlowersResponse;
import com.petalio.blossom.network.FlowerDto;
import com.petalio.blossom.network.FlowersResponse;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * DeclareFlowersActivity: Real-time flower variety and capacity declarations synced to backend.
 */
public class DeclareFlowersActivity extends AppCompatActivity {

    private ImageView btnBack;
    private LinearLayout layoutFlowersList;
    private ProgressBar pbLoading;
    private TextView tvEmpty, btnVarietyDropdown;
    private AutoCompleteTextView etFlowerType;
    private EditText etSupplyCapacity;
    private Button btnSaveFlowerType;

    private int loggedInUserId = -1;
    private final List<String> flowerCatalogSuggestions = new ArrayList<>();
    private final Map<String, Double> flowerPriceMap = new HashMap<>();
    private ArrayAdapter<String> varietyDropdownAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_declare_flowers);

        loggedInUserId = PetalioUserPrefs.getSupplierId(this);

        initViews();
        setupVarietyDropdown();
        setupListeners();
        fetchCatalogSuggestions();
        fetchDeclaredFlowers();
    }

    private void initViews() {
        btnBack = findViewById(R.id.btnBackDeclare);
        layoutFlowersList = findViewById(R.id.layoutFlowersList);
        pbLoading = findViewById(R.id.pbDeclaredFlowersLoading);
        tvEmpty = findViewById(R.id.tvEmptyDeclaredFlowers);
        etFlowerType = findViewById(R.id.etFlowerType);
        btnVarietyDropdown = findViewById(R.id.btnVarietyDropdown);
        etSupplyCapacity = findViewById(R.id.etSupplyCapacity);
        btnSaveFlowerType = findViewById(R.id.btnSaveFlowerType);
    }

    private void setupVarietyDropdown() {
        if (etFlowerType == null) return;
        varietyDropdownAdapter = new ArrayAdapter<>(
                this,
                android.R.layout.simple_dropdown_item_1line,
                flowerCatalogSuggestions
        );
        etFlowerType.setAdapter(varietyDropdownAdapter);
        etFlowerType.setThreshold(1);
        etFlowerType.setDropDownBackgroundResource(R.drawable.bg_dialog_inner);

        etFlowerType.setOnClickListener(v -> showVarietyDropdown());
        etFlowerType.setOnFocusChangeListener((v, hasFocus) -> {
            if (hasFocus) {
                showVarietyDropdown();
            }
        });
        etFlowerType.setOnItemClickListener((parent, view, position, id) -> {
            if (etSupplyCapacity != null) {
                etSupplyCapacity.requestFocus();
            }
        });

        if (btnVarietyDropdown != null) {
            btnVarietyDropdown.setOnClickListener(v -> {
                etFlowerType.requestFocus();
                showVarietyDropdown();
            });
        }
    }

    private void showVarietyDropdown() {
        if (isFinishing() || isDestroyed() || etFlowerType == null || varietyDropdownAdapter == null) return;
        if (flowerCatalogSuggestions.isEmpty()) return;
        etFlowerType.post(() -> {
            if (!isFinishing() && !isDestroyed() && etFlowerType != null) {
                etFlowerType.showDropDown();
            }
        });
    }

    private void setupListeners() {
        AnimationUtilsHelper.applyPressScale(btnBack);
        AnimationUtilsHelper.applyPressScale(btnSaveFlowerType);

        btnBack.setOnClickListener(v -> supportFinishAfterTransition());
        btnSaveFlowerType.setOnClickListener(v -> saveDeclaredFlower());
    }

    private void fetchCatalogSuggestions() {
        ApiClient.getApiService(getApplicationContext())
                .getFlowers()
                .enqueue(new Callback<FlowersResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<FlowersResponse> call, @NonNull Response<FlowersResponse> response) {
                        if (isFinishing() || isDestroyed()) return;
                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            flowerCatalogSuggestions.clear();
                            flowerPriceMap.clear();
                            List<FlowerDto> flowers = response.body().getFlowers();
                            if (flowers != null) {
                                for (FlowerDto f : flowers) {
                                    flowerCatalogSuggestions.add(f.getName());
                                    flowerPriceMap.put(f.getName().toLowerCase(Locale.US), f.getUnitPrice());
                                }
                            }
                            if (varietyDropdownAdapter != null) {
                                varietyDropdownAdapter.notifyDataSetChanged();
                            }
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<FlowersResponse> call, @NonNull Throwable t) {}
                });
    }

    private void fetchDeclaredFlowers() {
        if (loggedInUserId <= 0) {
            if (pbLoading != null) pbLoading.setVisibility(View.GONE);
            if (layoutFlowersList != null) {
                layoutFlowersList.removeAllViews();
                layoutFlowersList.setVisibility(View.GONE);
            }
            if (tvEmpty != null) {
                tvEmpty.setVisibility(View.VISIBLE);
                tvEmpty.setText("Please sign in as a supplier to view declared flowers.");
            }
            return;
        }
        if (pbLoading != null) pbLoading.setVisibility(View.VISIBLE);
        if (layoutFlowersList != null && layoutFlowersList.getChildCount() == 0) {
            layoutFlowersList.setVisibility(View.GONE);
            if (tvEmpty != null) {
                tvEmpty.setVisibility(View.VISIBLE);
                tvEmpty.setText("Loading declared flowers...");
            }
        }

        ApiClient.getApiService(getApplicationContext())
                .getDeclaredFlowers(loggedInUserId)
                .enqueue(new Callback<DeclaredFlowersResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<DeclaredFlowersResponse> call, @NonNull Response<DeclaredFlowersResponse> response) {
                        if (isFinishing() || isDestroyed()) return;
                        if (pbLoading != null) pbLoading.setVisibility(View.GONE);

                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            List<DeclaredFlowerDto> flowers = response.body().getFlowers();
                            if (flowers != null && !flowers.isEmpty()) {
                                if (tvEmpty != null) tvEmpty.setVisibility(View.GONE);
                                if (layoutFlowersList != null) layoutFlowersList.setVisibility(View.VISIBLE);
                                renderDeclaredFlowersList(flowers);
                            } else {
                                showEmptyState("No varieties declared yet — add your first flower supply below.");
                            }
                        } else {
                            showEmptyState("No varieties declared yet — add your first flower supply below.");
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<DeclaredFlowersResponse> call, @NonNull Throwable t) {
                        if (isFinishing() || isDestroyed()) return;
                        if (pbLoading != null) pbLoading.setVisibility(View.GONE);
                        if (layoutFlowersList != null && layoutFlowersList.getChildCount() > 0) {
                            Toast.makeText(DeclareFlowersActivity.this, "Unable to refresh declared flowers.", Toast.LENGTH_SHORT).show();
                        } else {
                            showEmptyState("Unable to connect to server to load declared flowers.");
                        }
                    }
                });
    }

    private void showEmptyState(String message) {
        if (layoutFlowersList != null) {
            layoutFlowersList.removeAllViews();
            layoutFlowersList.setVisibility(View.GONE);
        }
        if (tvEmpty != null) {
            tvEmpty.setVisibility(View.VISIBLE);
            tvEmpty.setText(message);
        }
    }

    private void renderDeclaredFlowersList(List<DeclaredFlowerDto> flowers) {
        if (layoutFlowersList == null) return;
        layoutFlowersList.removeAllViews();

        float density = getResources().getDisplayMetrics().density;
        int dp4 = (int) (4 * density);
        int dp6 = (int) (6 * density);
        int dp8 = (int) (8 * density);
        int dp10 = (int) (10 * density);
        int dp28 = (int) (28 * density);

        for (int i = 0; i < flowers.size(); i++) {
            DeclaredFlowerDto f = flowers.get(i);

            LinearLayout row = new LinearLayout(this);
            row.setOrientation(LinearLayout.HORIZONTAL);
            row.setGravity(Gravity.CENTER_VERTICAL);
            row.setPadding(0, dp8, 0, dp8);

            // Left Column: Variety Name + Category/Price
            LinearLayout titleBox = new LinearLayout(this);
            titleBox.setOrientation(LinearLayout.VERTICAL);
            LinearLayout.LayoutParams titleParams = new LinearLayout.LayoutParams(
                    0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f
            );
            titleParams.setMarginEnd(dp8);
            titleBox.setLayoutParams(titleParams);

            TextView tvName = new TextView(this);
            tvName.setText(f.getFlowerName());
            tvName.setTextSize(15);
            tvName.setTextColor(ContextCompat.getColor(this, R.color.text_primary));
            tvName.setTypeface(null, android.graphics.Typeface.BOLD);
            titleBox.addView(tvName);

            String meta = !f.getCategory().isEmpty() ? f.getCategory() : "Highland Stems";
            if (f.getUnitPrice() > 0) {
                meta += " • Rs. " + Math.round(f.getUnitPrice()) + " / stem";
            }
            TextView tvCat = new TextView(this);
            tvCat.setText(meta);
            tvCat.setTextSize(12);
            tvCat.setTextColor(ContextCompat.getColor(this, R.color.text_secondary));
            titleBox.addView(tvCat);

            row.addView(titleBox);

            // Capacity Pill ("250 stems / cycle")
            TextView tvCap = new TextView(this);
            tvCap.setText(f.getSupplyCapacity() + " stems / cycle");
            tvCap.setTextSize(11);
            tvCap.setTypeface(null, android.graphics.Typeface.BOLD);
            tvCap.setTextColor(ContextCompat.getColor(this, R.color.badge_in_stock_text));
            tvCap.setBackgroundResource(R.drawable.bg_badge_in_stock);
            tvCap.setPadding(dp10, dp4, dp10, dp4);
            row.addView(tvCap);

            // Quick Edit Icon
            ImageView btnEdit = new ImageView(this);
            LinearLayout.LayoutParams editParams = new LinearLayout.LayoutParams(dp28, dp28);
            editParams.setMarginStart(dp6);
            btnEdit.setLayoutParams(editParams);
            btnEdit.setPadding(dp6, dp6, dp6, dp6);
            btnEdit.setImageResource(R.drawable.ic_edit);
            btnEdit.setColorFilter(ContextCompat.getColor(this, R.color.primary_brand));
            btnEdit.setContentDescription("Edit capacity");
            btnEdit.setOnClickListener(v -> showEditCapacityDialog(f));
            row.addView(btnEdit);

            // Quick Remove Action
            TextView btnRemove = new TextView(this);
            LinearLayout.LayoutParams removeParams = new LinearLayout.LayoutParams(dp28, dp28);
            removeParams.setMarginStart(dp4 / 2);
            btnRemove.setLayoutParams(removeParams);
            btnRemove.setGravity(Gravity.CENTER);
            btnRemove.setText("✕");
            btnRemove.setTextSize(13);
            btnRemove.setTypeface(null, android.graphics.Typeface.BOLD);
            btnRemove.setTextColor(ContextCompat.getColor(this, R.color.text_secondary));
            btnRemove.setOnClickListener(v -> confirmRemoveDeclaredVariety(f));
            row.addView(btnRemove);

            layoutFlowersList.addView(row);

            if (i < flowers.size() - 1) {
                View divider = new View(this);
                LinearLayout.LayoutParams divParams = new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT, 1);
                divParams.setMargins(0, dp4, 0, dp4);
                divider.setLayoutParams(divParams);
                divider.setBackgroundColor(ContextCompat.getColor(this, R.color.divider_color));
                layoutFlowersList.addView(divider);
            }
        }
    }

    private void showEditCapacityDialog(DeclaredFlowerDto flower) {
        if (flower == null || flower.getId() <= 0) return;

        int dp20 = (int) (20 * getResources().getDisplayMetrics().density);
        int dp12 = (int) (12 * getResources().getDisplayMetrics().density);
        LinearLayout container = new LinearLayout(this);
        container.setOrientation(LinearLayout.VERTICAL);
        container.setPadding(dp20, dp12, dp20, 0);

        EditText etCap = new EditText(this);
        etCap.setInputType(InputType.TYPE_CLASS_NUMBER);
        etCap.setHint("Stems per harvest cycle");
        etCap.setText(String.valueOf(flower.getSupplyCapacity()));
        etCap.setSelection(etCap.getText().length());
        container.addView(etCap);

        new AlertDialog.Builder(this)
                .setTitle("Edit " + flower.getFlowerName() + " Capacity")
                .setView(container)
                .setPositiveButton("Update", (dialog, which) -> {
                    String val = etCap.getText() != null ? etCap.getText().toString().trim() : "";
                    int newCap;
                    try {
                        newCap = Integer.parseInt(val);
                        if (newCap <= 0) throw new NumberFormatException();
                    } catch (NumberFormatException e) {
                        Toast.makeText(this, "Enter a valid positive stem capacity", Toast.LENGTH_SHORT).show();
                        return;
                    }
                    ApiClient.getApiService(getApplicationContext())
                            .updateDeclaredFlower(loggedInUserId, flower.getId(), Collections.singletonMap("supply_capacity", newCap))
                            .enqueue(new Callback<CommonResponse>() {
                                @Override
                                public void onResponse(@NonNull Call<CommonResponse> call, @NonNull Response<CommonResponse> response) {
                                    if (isFinishing() || isDestroyed()) return;
                                    if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                                        Toast.makeText(DeclareFlowersActivity.this, "Updated " + flower.getFlowerName() + " to " + newCap + " stems / cycle", Toast.LENGTH_SHORT).show();
                                        fetchDeclaredFlowers();
                                    } else {
                                        Toast.makeText(DeclareFlowersActivity.this, "Failed to update capacity", Toast.LENGTH_SHORT).show();
                                    }
                                }

                                @Override
                                public void onFailure(@NonNull Call<CommonResponse> call, @NonNull Throwable t) {
                                    if (!isFinishing() && !isDestroyed()) {
                                        Toast.makeText(DeclareFlowersActivity.this, "Network error while updating capacity", Toast.LENGTH_SHORT).show();
                                    }
                                }
                            });
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void confirmRemoveDeclaredVariety(DeclaredFlowerDto flower) {
        if (flower == null || flower.getId() <= 0) return;
        new AlertDialog.Builder(this)
                .setTitle("Remove Variety")
                .setMessage("Remove " + flower.getFlowerName() + " from your declared supply varieties?")
                .setPositiveButton("Remove", (dialog, which) -> {
                    ApiClient.getApiService(getApplicationContext())
                            .deleteDeclaredFlower(loggedInUserId, flower.getId())
                            .enqueue(new Callback<CommonResponse>() {
                                @Override
                                public void onResponse(@NonNull Call<CommonResponse> call, @NonNull Response<CommonResponse> response) {
                                    if (isFinishing() || isDestroyed()) return;
                                    if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                                        Toast.makeText(DeclareFlowersActivity.this, flower.getFlowerName() + " removed", Toast.LENGTH_SHORT).show();
                                        fetchDeclaredFlowers();
                                    } else {
                                        Toast.makeText(DeclareFlowersActivity.this, "Unable to remove variety", Toast.LENGTH_SHORT).show();
                                    }
                                }

                                @Override
                                public void onFailure(@NonNull Call<CommonResponse> call, @NonNull Throwable t) {
                                    if (!isFinishing() && !isDestroyed()) {
                                        Toast.makeText(DeclareFlowersActivity.this, "Network error while removing variety", Toast.LENGTH_SHORT).show();
                                    }
                                }
                            });
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void saveDeclaredFlower() {
        if (loggedInUserId <= 0) {
            Toast.makeText(this, "Please sign in as a supplier first.", Toast.LENGTH_SHORT).show();
            return;
        }
        String flowerName = etFlowerType.getText() != null ? etFlowerType.getText().toString().trim() : "";
        String capacityStr = etSupplyCapacity.getText() != null ? etSupplyCapacity.getText().toString().trim() : "";

        if (TextUtils.isEmpty(flowerName)) {
            etFlowerType.setError("Please select or enter a flower variety");
            etFlowerType.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(capacityStr)) {
            etSupplyCapacity.setError("Please enter harvest supply capacity in stems");
            etSupplyCapacity.requestFocus();
            return;
        }

        int capacity;
        try {
            capacity = Integer.parseInt(capacityStr);
            if (capacity <= 0) throw new NumberFormatException();
        } catch (NumberFormatException e) {
            etSupplyCapacity.setError("Please enter a valid positive stem count");
            etSupplyCapacity.requestFocus();
            return;
        }

        btnSaveFlowerType.setEnabled(false);
        Toast.makeText(this, "Saving " + flowerName + " declaration...", Toast.LENGTH_SHORT).show();

        int finalCap = capacity;
        String lookupKey = flowerName.toLowerCase(Locale.US);
        double unitPrice = flowerPriceMap.containsKey(lookupKey) ? flowerPriceMap.get(lookupKey) : 0.0;
        DeclareFlowerRequest req = new DeclareFlowerRequest(loggedInUserId, flowerName, finalCap, unitPrice);

        ApiClient.getApiService(getApplicationContext())
                .saveDeclaredFlower(loggedInUserId, req)
                .enqueue(new Callback<CommonResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<CommonResponse> call, @NonNull Response<CommonResponse> response) {
                        if (isFinishing() || isDestroyed()) return;
                        btnSaveFlowerType.setEnabled(true);

                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            etFlowerType.setText("");
                            etSupplyCapacity.setText("");
                            etFlowerType.clearFocus();
                            etSupplyCapacity.clearFocus();
                            hideKeyboard();
                            Toast.makeText(DeclareFlowersActivity.this, "✓ " + flowerName + " (" + finalCap + " stems) declared successfully!", Toast.LENGTH_LONG).show();
                            fetchDeclaredFlowers();
                            fetchCatalogSuggestions();
                        } else {
                            String msg = (response.body() != null && response.body().getMessage() != null && !response.body().getMessage().isEmpty())
                                    ? response.body().getMessage()
                                    : "Failed to record flower capacity";
                            Toast.makeText(DeclareFlowersActivity.this, msg, Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<CommonResponse> call, @NonNull Throwable t) {
                        if (isFinishing() || isDestroyed()) return;
                        btnSaveFlowerType.setEnabled(true);
                        Toast.makeText(DeclareFlowersActivity.this, "Network error: Unable to save declaration. Please try again.", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void hideKeyboard() {
        View view = getCurrentFocus();
        if (view != null) {
            InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
            if (imm != null) {
                imm.hideSoftInputFromWindow(view.getWindowToken(), 0);
            }
        }
    }
}
