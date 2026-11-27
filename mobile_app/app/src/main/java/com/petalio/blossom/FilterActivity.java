package com.petalio.blossom;

import android.content.Intent;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

/**
 * O1. Categories & Filter Activity for Petalio Blossom.
 */
public class FilterActivity extends AppCompatActivity {

    private View btnBackFilter;
    private TextView btnResetFilter;
    private TextView filterChipAll;
    private TextView[] categoryChips;
    private TextView chipAllAvailability, chipInStock, chipPreOrder;
    private TextView[] availabilityChips;
    private EditText etMinPrice, etMaxPrice;
    private Button btnApplyFilters;

    private String selectedCategory = "All";
    private String selectedAvailability = "All";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_filter);

        initViews();
        loadInitialFilters();
        setupListeners();
    }

    private void initViews() {
        btnBackFilter = findViewById(R.id.btnBackFilter);
        btnResetFilter = findViewById(R.id.btnResetFilter);

        filterChipAll = findViewById(R.id.filterChipAll);
        categoryChips = new TextView[]{
                filterChipAll,
                findViewById(R.id.filterChipRoses),
                findViewById(R.id.filterChipOrchids),
                findViewById(R.id.filterChipLilies),
                findViewById(R.id.filterChipCarnations),
                findViewById(R.id.filterChipChrysanthemums),
                findViewById(R.id.filterChipGerberas),
                findViewById(R.id.filterChipSunflowers),
                findViewById(R.id.filterChipTulips),
                findViewById(R.id.filterChipLavender),
                findViewById(R.id.filterChipHydrangeas),
                findViewById(R.id.filterChipPeonies)
        };

        chipAllAvailability = findViewById(R.id.chipAllAvailability);
        chipInStock = findViewById(R.id.chipInStock);
        chipPreOrder = findViewById(R.id.chipPreOrder);
        availabilityChips = new TextView[]{chipAllAvailability, chipInStock, chipPreOrder};

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

        TextView matchedCategoryChip = findMatchingChip(categoryChips, selectedCategory);
        if (matchedCategoryChip != null) {
            selectCategory(matchedCategoryChip, matchedCategoryChip.getText().toString());
        } else {
            highlightChipSelection(categoryChips, null);
        }

        TextView matchedAvailabilityChip = findMatchingChip(availabilityChips, selectedAvailability);
        if (matchedAvailabilityChip != null) {
            selectAvailability(matchedAvailabilityChip, matchedAvailabilityChip.getText().toString());
        } else {
            selectAvailability(chipAllAvailability, "All");
        }
    }

    private TextView findMatchingChip(TextView[] chips, String target) {
        if (target == null || target.trim().isEmpty()) return null;
        String normalizedTarget = FlowerAdapter.normalizeCategoryToken(target);
        for (TextView chip : chips) {
            if (chip == null) continue;
            String label = chip.getText().toString();
            if (label.equalsIgnoreCase(target) || FlowerAdapter.normalizeCategoryToken(label).equals(normalizedTarget)) {
                return chip;
            }
        }
        return null;
    }

    private void setupListeners() {
        btnBackFilter.setOnClickListener(v -> finish());

        // Category Selection
        for (TextView chip : categoryChips) {
            if (chip != null) {
                chip.setOnClickListener(v -> selectCategory(chip, chip.getText().toString()));
            }
        }

        // Availability Selection
        for (TextView chip : availabilityChips) {
            if (chip != null) {
                chip.setOnClickListener(v -> selectAvailability(chip, chip.getText().toString()));
            }
        }

        // Reset Action (resets modal filters while keeping Browse search & active sub-tab)
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
        highlightChipSelection(categoryChips, selected);
    }

    private void selectAvailability(TextView selected, String availability) {
        selectedAvailability = availability;
        highlightChipSelection(availabilityChips, selected);
    }

    private void highlightChipSelection(TextView[] chips, TextView selected) {
        for (TextView chip : chips) {
            if (chip == null) continue;
            boolean isSelected = chip == selected;
            chip.setBackgroundResource(isSelected ? R.drawable.bg_chip_selected : R.drawable.bg_chip_unselected);
            chip.setTextColor(ContextCompat.getColor(this, isSelected ? R.color.text_white : R.color.text_primary));
            chip.setTypeface(null, isSelected ? Typeface.BOLD : Typeface.NORMAL);
        }
    }
}
