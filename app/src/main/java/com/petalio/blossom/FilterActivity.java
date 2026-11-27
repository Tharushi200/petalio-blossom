package com.petalio.blossom;

import android.content.Intent;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.CategoriesResponse;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * O1. Categories & Filter Activity for Petalio Blossom.
 * Dynamically synchronized with backend /api/categories.
 */
public class FilterActivity extends AppCompatActivity {

    private View btnBackFilter;
    private TextView btnResetFilter;
    private LinearLayout layoutFilterCategoriesContainer;
    private TextView filterChipAll;
    private final List<TextView> dynamicCategoryChips = new ArrayList<>();
    private TextView chipAllAvailability, chipInStock;
    private TextView[] availabilityChips;
    private EditText etMinPrice, etMaxPrice;
    private Button btnApplyFilters;

    private String selectedCategory = "All";
    private String selectedAvailability = "All";

    private static final List<String> FALLBACK_CATEGORIES = Arrays.asList(
            "Alstroemeria", "Baby's Breath", "Bird of Paradise", "Carnation",
            "Chrysanthemum", "Eucalyptus", "Freesia", "Gerbera", "Hydrangea",
            "Lavender", "Lily", "Lisianthus", "Orchid", "Peony", "Ranunculus",
            "Rose", "Sunflower", "Tuberose", "Tulip"
    );

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_filter);

        initViews();
        loadInitialFilters();
        setupListeners();
        loadCategories();
    }

    private void initViews() {
        btnBackFilter = findViewById(R.id.btnBackFilter);
        btnResetFilter = findViewById(R.id.btnResetFilter);
        layoutFilterCategoriesContainer = findViewById(R.id.layoutFilterCategoriesContainer);
        filterChipAll = findViewById(R.id.filterChipAll);

        chipAllAvailability = findViewById(R.id.chipAllAvailability);
        chipInStock = findViewById(R.id.chipInStock);
        availabilityChips = new TextView[]{chipAllAvailability, chipInStock};

        etMinPrice = findViewById(R.id.etMinPrice);
        etMaxPrice = findViewById(R.id.etMaxPrice);
        btnApplyFilters = findViewById(R.id.btnApplyFilters);
    }

    private void loadInitialFilters() {
        Intent intent = getIntent();
        if (intent != null) {
            String cat = intent.getStringExtra("CURRENT_CATEGORY");
            if (cat != null && !cat.trim().isEmpty()) {
                selectedCategory = cat.trim();
            }

            String avail = intent.getStringExtra("CURRENT_AVAILABILITY");
            if (avail != null && !avail.trim().isEmpty()) {
                selectedAvailability = avail.trim();
            }

            String min = intent.getStringExtra("CURRENT_MIN_PRICE");
            if (min != null && !min.isEmpty()) {
                etMinPrice.setText(min);
            }

            String max = intent.getStringExtra("CURRENT_MAX_PRICE");
            if (max != null && !max.isEmpty()) {
                etMaxPrice.setText(max);
            }
        }

        TextView matchedAvailabilityChip = findMatchingChip(availabilityChips, selectedAvailability);
        if (matchedAvailabilityChip != null) {
            selectAvailability(matchedAvailabilityChip, matchedAvailabilityChip.getText().toString());
        } else {
            selectAvailability(chipAllAvailability, "All");
        }
    }

    private void loadCategories() {
        buildCategoryChips(FALLBACK_CATEGORIES);

        ApiClient.getApiService(this).getCategories().enqueue(new Callback<CategoriesResponse>() {
            @Override
            public void onResponse(Call<CategoriesResponse> call, Response<CategoriesResponse> response) {
                if (isFinishing() || isDestroyed()) return;
                if (response.isSuccessful() && response.body() != null && response.body().getCategories() != null) {
                    List<String> liveCats = response.body().getCategories();
                    if (!liveCats.isEmpty()) {
                        buildCategoryChips(liveCats);
                    }
                }
            }

            @Override
            public void onFailure(Call<CategoriesResponse> call, Throwable t) {}
        });
    }

    private void buildCategoryChips(List<String> categories) {
        if (layoutFilterCategoriesContainer == null) return;
        layoutFilterCategoriesContainer.removeAllViews();
        dynamicCategoryChips.clear();

        float density = getResources().getDisplayMetrics().density;
        int heightPx = (int) (36 * density);
        int padPx = (int) (20 * density);
        int marginPx = (int) (10 * density);

        // 1. "All" Chip
        filterChipAll = new TextView(this);
        filterChipAll.setText("All");
        filterChipAll.setTextSize(13);
        filterChipAll.setGravity(android.view.Gravity.CENTER);
        filterChipAll.setPadding(padPx, 0, padPx, 0);
        filterChipAll.setClickable(true);
        filterChipAll.setFocusable(true);
        LinearLayout.LayoutParams allParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, heightPx);
        filterChipAll.setLayoutParams(allParams);
        dynamicCategoryChips.add(filterChipAll);
        layoutFilterCategoriesContainer.addView(filterChipAll);
        filterChipAll.setOnClickListener(v -> selectCategory(filterChipAll, "All"));

        // 2. Dynamic Categories
        for (String cat : categories) {
            if (cat == null || cat.trim().isEmpty()) continue;
            final String cleanCat = cat.trim();

            TextView chip = new TextView(this);
            chip.setText(cleanCat);
            chip.setTextSize(13);
            chip.setGravity(android.view.Gravity.CENTER);
            chip.setPadding(padPx, 0, padPx, 0);
            chip.setClickable(true);
            chip.setFocusable(true);

            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT, heightPx);
            lp.setMarginStart(marginPx);
            chip.setLayoutParams(lp);

            chip.setOnClickListener(v -> selectCategory(chip, cleanCat));
            dynamicCategoryChips.add(chip);
            layoutFilterCategoriesContainer.addView(chip);
        }

        // Highlight matching chip
        TextView targetChip = findMatchingCategoryChip(selectedCategory);
        if (targetChip != null) {
            selectCategory(targetChip, selectedCategory);
        } else {
            selectCategory(filterChipAll, "All");
        }
    }

    private TextView findMatchingCategoryChip(String target) {
        if (target == null || target.trim().isEmpty()) return filterChipAll;
        String norm = FlowerAdapter.normalizeCategoryToken(target);
        for (TextView chip : dynamicCategoryChips) {
            String label = chip.getText().toString();
            if (label.equalsIgnoreCase(target) || FlowerAdapter.normalizeCategoryToken(label).equals(norm)) {
                return chip;
            }
        }
        return null;
    }

    private TextView findMatchingChip(TextView[] chips, String target) {
        if (target == null || target.trim().isEmpty()) return null;
        for (TextView chip : chips) {
            if (chip == null) continue;
            if (chip.getText().toString().equalsIgnoreCase(target)) {
                return chip;
            }
        }
        return null;
    }

    private void setupListeners() {
        btnBackFilter.setOnClickListener(v -> finish());

        // Availability Selection
        for (TextView chip : availabilityChips) {
            if (chip != null) {
                chip.setOnClickListener(v -> selectAvailability(chip, chip.getText().toString()));
            }
        }

        // Reset Action
        btnResetFilter.setOnClickListener(v -> {
            selectCategory(filterChipAll, "All");
            selectAvailability(chipAllAvailability, "All");
            etMinPrice.setText("");
            etMaxPrice.setText("");

            Intent resultIntent = new Intent();
            resultIntent.putExtra("FILTER_CATEGORY", "All");
            resultIntent.putExtra("FILTER_AVAILABILITY", "All");
            resultIntent.putExtra("FILTER_MIN_PRICE", "");
            resultIntent.putExtra("FILTER_MAX_PRICE", "");
            setResult(RESULT_OK, resultIntent);

            Toast.makeText(this, "Filters reset", Toast.LENGTH_SHORT).show();
            finish();
        });

        // Apply Filters Action
        btnApplyFilters.setOnClickListener(v -> {
            String min = etMinPrice.getText() != null ? etMinPrice.getText().toString().trim() : "";
            String max = etMaxPrice.getText() != null ? etMaxPrice.getText().toString().trim() : "";

            int minVal = -1;
            int maxVal = -1;
            if (!min.isEmpty()) {
                try {
                    minVal = Integer.parseInt(min);
                } catch (NumberFormatException e) {
                    etMinPrice.setError("Invalid number");
                    return;
                }
            }
            if (!max.isEmpty()) {
                try {
                    maxVal = Integer.parseInt(max);
                } catch (NumberFormatException e) {
                    etMaxPrice.setError("Invalid number");
                    return;
                }
            }

            if (minVal >= 0 && maxVal >= 0 && minVal > maxVal) {
                etMinPrice.setError("Min cannot be greater than Max");
                Toast.makeText(this, "Minimum price cannot be greater than maximum price", Toast.LENGTH_SHORT).show();
                return;
            }

            Intent resultIntent = new Intent();
            resultIntent.putExtra("FILTER_CATEGORY", selectedCategory);
            resultIntent.putExtra("FILTER_AVAILABILITY", selectedAvailability);
            resultIntent.putExtra("FILTER_MIN_PRICE", min);
            resultIntent.putExtra("FILTER_MAX_PRICE", max);
            setResult(RESULT_OK, resultIntent);

            String priceText = (!min.isEmpty() || !max.isEmpty()) ? " (Price: Rs." + min + " - " + max + ")" : "";
            Toast.makeText(this, "Filters applied: " + selectedCategory + " • " + selectedAvailability + priceText, Toast.LENGTH_SHORT).show();
            finish();
        });
    }

    private void selectCategory(TextView selected, String category) {
        selectedCategory = category;
        highlightChipSelection(dynamicCategoryChips, selected);
    }

    private void selectAvailability(TextView selected, String availability) {
        selectedAvailability = availability;
        highlightChipSelection(Arrays.asList(availabilityChips), selected);
    }

    private void highlightChipSelection(List<TextView> chips, TextView selected) {
        for (TextView chip : chips) {
            if (chip == null) continue;
            boolean isSelected = chip == selected;
            chip.setBackgroundResource(isSelected ? R.drawable.bg_chip_selected : R.drawable.bg_chip_unselected);
            chip.setTextColor(ContextCompat.getColor(this, isSelected ? R.color.text_white : R.color.text_primary));
            chip.setTypeface(null, isSelected ? Typeface.BOLD : Typeface.NORMAL);
        }
    }
}
