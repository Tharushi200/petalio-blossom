package com.petalio.blossom;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.bottomsheet.BottomSheetDialog;
import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.CategoriesResponse;
import com.petalio.blossom.network.CustomerOrdersResponse;
import com.petalio.blossom.network.FlowerDto;
import com.petalio.blossom.network.FlowersResponse;
import com.petalio.blossom.network.OrderSummaryDto;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * C1. Flower Catalogue, Search & Filter Fragment.
 * Features top underline filter tabs, live metrics, and real-time category filtering.
 */
public class BrowseFragment extends Fragment {

    private EditText etSearchFlowers;
    private ImageView btnOpenFilter, btnOpenWishlist;
    private View btnOpenNotifications;
    private TextView badgeNotificationCount;
    private RecyclerView rvFlowerCatalogue;
    private ProgressBar pbBrowseLoading;
    private FlowerAdapter flowerAdapter;
    private LinearLayout layoutNoResults, layoutChipsContainer;
    private View btnClearSearchFilter;

    // Sub-Tabs
    private View tabSubAll, tabSubRated, tabSubBestSelling, tabSubNewIn;
    private TextView tvSubAllText, tvSubRatedText, tvSubBestSellingText, tvSubNewInText;
    private View indicatorSubAll, indicatorSubRated, indicatorSubBestSelling, indicatorSubNewIn;
    private String currentSubTab = "ALL";

    private final List<TextView> categoryChipViews = new ArrayList<>();
    private Spinner spinnerPriceFilter;
    private String selectedPriceOption = "All Prices";

    // Process-wide in-memory catalog cache for instant frame-1 rendering
    private static final List<FlowerDto> cachedFlowerDtos = new ArrayList<>();
    private String lastWishlistSignature = "";
    private int lastBoundUserId = -1;

    public static void clearCache() {
        cachedFlowerDtos.clear();
    }

    private int resolveCustomerId() {
        if (getContext() == null) return -1;
        int custId = PetalioUserPrefs.getCustomerId(requireContext());
        return custId > 0 ? custId : PetalioUserPrefs.getUserId(requireContext());
    }

    // Filter states
    private String currentSearchQuery = "";
    private String filterCategory = "All";
    private String filterAvailability = "All";
    private int filterMinPrice = -1;
    private int filterMaxPrice = -1;

    private ActivityResultLauncher<Intent> filterLauncher;

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        filterLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                        Intent data = result.getData();
                        filterCategory = data.getStringExtra("FILTER_CATEGORY");
                        if (filterCategory == null || filterCategory.isEmpty()) filterCategory = "All";

                        filterAvailability = data.getStringExtra("FILTER_AVAILABILITY");
                        if (filterAvailability == null || filterAvailability.isEmpty()) filterAvailability = "All";

                        String minStr = data.getStringExtra("FILTER_MIN_PRICE");
                        String maxStr = data.getStringExtra("FILTER_MAX_PRICE");
                        try {
                            filterMinPrice = (minStr != null && !minStr.isEmpty()) ? Integer.parseInt(minStr) : -1;
                        } catch (NumberFormatException e) {
                            filterMinPrice = -1;
                        }
                        try {
                            filterMaxPrice = (maxStr != null && !maxStr.isEmpty()) ? Integer.parseInt(maxStr) : -1;
                        } catch (NumberFormatException e) {
                            filterMaxPrice = -1;
                        }

                        syncTopChipWithCategory(filterCategory);
                        applyFilters();
                    }
                }
        );
    }

    @Override
    public void onResume() {
        super.onResume();
        if (!isHidden()) {
            refreshBrowseOnVisible();
        }
    }

    @Override
    public void onHiddenChanged(boolean hidden) {
        super.onHiddenChanged(hidden);
        if (!hidden && isAdded()) {
            refreshBrowseOnVisible();
        }
    }

    private void refreshBrowseOnVisible() {
        int activeUserId = resolveCustomerId();
        if (activeUserId != lastBoundUserId) {
            lastBoundUserId = activeUserId;
            lastWishlistSignature = "";
            if (activeUserId <= 0 && badgeNotificationCount != null) {
                badgeNotificationCount.setVisibility(View.GONE);
            }
            if (flowerAdapter != null) {
                flowerAdapter.notifyDataSetChanged();
            }
        }
        refreshWishlistStatesIfNeeded();
        fetchLiveFlowersFromBackend(false);
        if (getActivity() instanceof CustomerMainActivity) {
            ((CustomerMainActivity) getActivity()).updateCartBadge();
        }
        fetchCustomerNotificationsBadge();
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_browse, container, false);

        initViews(view);
        setupPriceSpinner();
        setupSubTabs();
        setupRecyclerView();
        setupSearchAndFilter();
        setupChips();

        lastBoundUserId = resolveCustomerId();

        // Render cached catalog immediately on frame 1 if available, then silently refresh
        if (!cachedFlowerDtos.isEmpty()) {
            isCatalogLoaded = true;
            if (pbBrowseLoading != null) pbBrowseLoading.setVisibility(View.GONE);
            List<WishlistManager.FlowerItem> cachedItems = mapDtosToItems(cachedFlowerDtos);
            flowerAdapter.setMasterData(cachedItems);
            applyFilters();
            lastWishlistSignature = buildWishlistSignature(cachedFlowerDtos);
            FlowerImageHelper.preloadFlowerImages(requireContext(), cachedItems, 200, 175);
            fetchLiveFlowersFromBackend(false);
        } else {
            fetchLiveFlowersFromBackend(true);
        }
        fetchCustomerNotificationsBadge();

        if (getArguments() != null && getArguments().getBoolean("OPEN_NOTIFICATIONS", false)) {
            view.post(this::showOrderNotificationsBottomSheet);
        }

        return view;
    }

    private void initViews(View v) {
        etSearchFlowers = v.findViewById(R.id.etSearchFlowers);
        btnOpenFilter = v.findViewById(R.id.btnOpenFilter);
        btnOpenWishlist = v.findViewById(R.id.btnOpenWishlist);
        btnOpenNotifications = v.findViewById(R.id.btnOpenNotifications);
        badgeNotificationCount = v.findViewById(R.id.badgeNotificationCount);

        if (btnOpenNotifications != null) {
            AnimationUtilsHelper.applyPressScale(btnOpenNotifications);
            btnOpenNotifications.setOnClickListener(v1 -> showOrderNotificationsBottomSheet());
        }
        rvFlowerCatalogue = v.findViewById(R.id.rvFlowerCatalogue);
        pbBrowseLoading = v.findViewById(R.id.pbBrowseLoading);
        layoutNoResults = v.findViewById(R.id.layoutNoResults);
        btnClearSearchFilter = v.findViewById(R.id.btnClearSearchFilter);
        layoutChipsContainer = v.findViewById(R.id.layoutChipsContainer);
        spinnerPriceFilter = v.findViewById(R.id.spinnerPriceFilter);

        // Sub-tabs
        tabSubAll = v.findViewById(R.id.tabSubAll);
        tvSubAllText = v.findViewById(R.id.tvSubAllText);
        indicatorSubAll = v.findViewById(R.id.indicatorSubAll);

        tabSubRated = v.findViewById(R.id.tabSubRated);
        tvSubRatedText = v.findViewById(R.id.tvSubRatedText);
        indicatorSubRated = v.findViewById(R.id.indicatorSubRated);

        tabSubBestSelling = v.findViewById(R.id.tabSubBestSelling);
        tvSubBestSellingText = v.findViewById(R.id.tvSubBestSellingText);
        indicatorSubBestSelling = v.findViewById(R.id.indicatorSubBestSelling);

        tabSubNewIn = v.findViewById(R.id.tabSubNewIn);
        tvSubNewInText = v.findViewById(R.id.tvSubNewInText);
        indicatorSubNewIn = v.findViewById(R.id.indicatorSubNewIn);

        TextView chipAll = v.findViewById(R.id.chipAll);
        categoryChipViews.clear();
        if (chipAll != null) {
            categoryChipViews.add(chipAll);
        }
    }

    private void setupPriceSpinner() {
        if (spinnerPriceFilter == null || getContext() == null) return;
        String[] priceOptions = new String[]{
                "All Prices",
                "Price: Low to High",
                "Price: High to Low",
                "Under Rs. 2,500",
                "Rs. 2,500 – Rs. 5,000",
                "Above Rs. 5,000"
        };
        ArrayAdapter<String> adapter = new ArrayAdapter<>(requireContext(), android.R.layout.simple_spinner_item, priceOptions);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerPriceFilter.setAdapter(adapter);
        spinnerPriceFilter.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                selectedPriceOption = priceOptions[position];
                applyFilters();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });
    }

    private void setupSubTabs() {
        if (tabSubAll != null) {
            AnimationUtilsHelper.applyPressScale(tabSubAll);
            tabSubAll.setOnClickListener(v -> selectSubTab("ALL"));
        }
        if (tabSubRated != null) {
            AnimationUtilsHelper.applyPressScale(tabSubRated);
            tabSubRated.setOnClickListener(v -> selectSubTab("RATED"));
        }
        if (tabSubBestSelling != null) {
            AnimationUtilsHelper.applyPressScale(tabSubBestSelling);
            tabSubBestSelling.setOnClickListener(v -> selectSubTab("BEST_SELLING"));
        }
        if (tabSubNewIn != null) {
            AnimationUtilsHelper.applyPressScale(tabSubNewIn);
            tabSubNewIn.setOnClickListener(v -> selectSubTab("NEW_IN"));
        }
        selectSubTab(currentSubTab);
    }

    private void selectSubTab(String subTab) {
        currentSubTab = (subTab != null && !subTab.isEmpty()) ? subTab : "ALL";
        if (!isAdded() || getContext() == null) return;

        updateSubTabUi(tvSubAllText, indicatorSubAll, "ALL".equals(currentSubTab));
        updateSubTabUi(tvSubRatedText, indicatorSubRated, "RATED".equals(currentSubTab));
        updateSubTabUi(tvSubBestSellingText, indicatorSubBestSelling, "BEST_SELLING".equals(currentSubTab));
        updateSubTabUi(tvSubNewInText, indicatorSubNewIn, "NEW_IN".equals(currentSubTab));

        applyFilters();
    }

    private void updateSubTabUi(TextView label, View indicator, boolean isSelected) {
        int activeColor = ContextCompat.getColor(requireContext(), R.color.primary_brand);
        int inactiveColor = ContextCompat.getColor(requireContext(), R.color.text_secondary);
        if (label != null) {
            label.setTextColor(isSelected ? activeColor : inactiveColor);
            label.setTypeface(null, isSelected ? Typeface.BOLD : Typeface.NORMAL);
        }
        if (indicator != null) {
            indicator.setBackgroundColor(isSelected ? activeColor : Color.TRANSPARENT);
        }
    }

    private boolean isCatalogLoaded = false;

    private void setupRecyclerView() {
        rvFlowerCatalogue.setLayoutManager(new GridLayoutManager(getContext(), 2));
        rvFlowerCatalogue.setHasFixedSize(true);
        rvFlowerCatalogue.setItemViewCacheSize(12);
        flowerAdapter = new FlowerAdapter(requireContext(), new ArrayList<>());
        flowerAdapter.setCountListener(count -> {
            if (!isCatalogLoaded) return;
            layoutNoResults.setVisibility(count == 0 ? View.VISIBLE : View.GONE);
            rvFlowerCatalogue.setVisibility(count == 0 ? View.GONE : View.VISIBLE);
        });
        rvFlowerCatalogue.setAdapter(flowerAdapter);
    }

    private void refreshWishlistStatesIfNeeded() {
        if (!isAdded() || getContext() == null || flowerAdapter == null || cachedFlowerDtos.isEmpty()) return;
        String currentSig = buildWishlistSignature(cachedFlowerDtos);
        if (!currentSig.equals(lastWishlistSignature)) {
            lastWishlistSignature = currentSig;
            flowerAdapter.notifyDataSetChanged();
        }
    }

    private String buildWishlistSignature(List<FlowerDto> dtos) {
        if (getContext() == null || dtos == null) return "";
        int activeUid = resolveCustomerId();
        StringBuilder sb = new StringBuilder(dtos.size() * 2 + 12);
        sb.append(activeUid).append(':');
        for (FlowerDto dto : dtos) {
            sb.append(WishlistManager.isFavorite(requireContext(), dto.getName()) ? '1' : '0');
        }
        return sb.toString();
    }

    private List<WishlistManager.FlowerItem> mapDtosToItems(List<FlowerDto> dtos) {
        List<WishlistManager.FlowerItem> liveItems = new ArrayList<>();
        if (dtos == null) return liveItems;
        for (FlowerDto dto : dtos) {
            liveItems.add(new WishlistManager.FlowerItem(
                    dto.getFlowerId(),
                    dto.getName(),
                    dto.getCategory(),
                    (int) Math.round(dto.getUnitPrice()),
                    dto.getStockQuantity(),
                    dto.getName().toLowerCase().replace(" ", "_"),
                    dto.getSoldCount(),
                    dto.getAvgRating(),
                    dto.getReviewCount(),
                    dto.getCreatedAt()
            ));
        }
        return liveItems;
    }

    private boolean hasCatalogChanged(List<FlowerDto> oldDtos, List<FlowerDto> newDtos) {
        if (oldDtos == null || newDtos == null) return true;
        if (oldDtos.size() != newDtos.size()) return true;
        for (int i = 0; i < oldDtos.size(); i++) {
            FlowerDto a = oldDtos.get(i);
            FlowerDto b = newDtos.get(i);
            if (a.getFlowerId() != b.getFlowerId()
                    || a.getStockQuantity() != b.getStockQuantity()
                    || a.getSoldCount() != b.getSoldCount()
                    || a.getReviewCount() != b.getReviewCount()
                    || Double.compare(a.getAvgRating(), b.getAvgRating()) != 0
                    || Math.round(a.getUnitPrice()) != Math.round(b.getUnitPrice())
                    || !a.getName().equals(b.getName())
                    || !a.getCategory().equals(b.getCategory())
                    || !a.getCreatedAt().equals(b.getCreatedAt())) {
                return true;
            }
        }
        return false;
    }

    private void fetchLiveFlowersFromBackend(boolean allowSpinner) {
        if (getContext() == null) return;
        if (allowSpinner && !isCatalogLoaded && cachedFlowerDtos.isEmpty() && pbBrowseLoading != null) {
            pbBrowseLoading.setVisibility(View.VISIBLE);
        }
        ApiClient.getApiService(requireContext()).getFlowers().enqueue(new Callback<FlowersResponse>() {
            @Override
            public void onResponse(@NonNull Call<FlowersResponse> call, @NonNull Response<FlowersResponse> response) {
                if (!isAdded() || getContext() == null) return;
                if (pbBrowseLoading != null) pbBrowseLoading.setVisibility(View.GONE);
                boolean wasLoaded = isCatalogLoaded;
                isCatalogLoaded = true;

                if (response.isSuccessful() && response.body() != null && response.body().getFlowers() != null) {
                    List<FlowerDto> dtos = response.body().getFlowers();
                    boolean changed = hasCatalogChanged(cachedFlowerDtos, dtos);

                    cachedFlowerDtos.clear();
                    cachedFlowerDtos.addAll(dtos);
                    lastWishlistSignature = buildWishlistSignature(dtos);

                    if (flowerAdapter != null && (!wasLoaded || changed || flowerAdapter.getMasterCount() == 0)) {
                        List<WishlistManager.FlowerItem> liveItems = mapDtosToItems(dtos);
                        flowerAdapter.setMasterData(liveItems);
                        applyFilters();
                        FlowerImageHelper.preloadFlowerImages(requireContext(), liveItems, 200, 175);
                    }
                    if (categoryChipViews.size() <= 1) {
                        loadCategories();
                    }
                } else if (flowerAdapter != null && flowerAdapter.getMasterCount() == 0) {
                    layoutNoResults.setVisibility(View.VISIBLE);
                    rvFlowerCatalogue.setVisibility(View.GONE);
                }
            }

            @Override
            public void onFailure(@NonNull Call<FlowersResponse> call, @NonNull Throwable t) {
                if (!isAdded() || getContext() == null) return;
                if (pbBrowseLoading != null) pbBrowseLoading.setVisibility(View.GONE);
                isCatalogLoaded = true;
                if (flowerAdapter != null && flowerAdapter.getMasterCount() == 0) {
                    layoutNoResults.setVisibility(View.VISIBLE);
                    rvFlowerCatalogue.setVisibility(View.GONE);
                }
            }
        });
    }

    private void setupSearchAndFilter() {
        // Search text watcher - live search while typing
        etSearchFlowers.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                currentSearchQuery = (s != null) ? s.toString().trim() : "";
                applyFilters();
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        // Search action on soft keyboard
        etSearchFlowers.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_SEARCH || actionId == EditorInfo.IME_ACTION_DONE) {
                currentSearchQuery = etSearchFlowers.getText().toString().trim();
                applyFilters();
                hideKeyboard();
                return true;
            }
            return false;
        });

        // Open Filter Activity from search bar filter icon
        AnimationUtilsHelper.applyPressScale(btnOpenFilter);
        btnOpenFilter.setOnClickListener(v -> {
            Intent intent = new Intent(getContext(), FilterActivity.class);
            intent.putExtra("CURRENT_CATEGORY", filterCategory);
            intent.putExtra("CURRENT_AVAILABILITY", filterAvailability);
            if (filterMinPrice >= 0) {
                intent.putExtra("CURRENT_MIN_PRICE", String.valueOf(filterMinPrice));
            }
            if (filterMaxPrice >= 0) {
                intent.putExtra("CURRENT_MAX_PRICE", String.valueOf(filterMaxPrice));
            }
            filterLauncher.launch(intent);
        });

        // Open Wishlist from top heart icon
        if (btnOpenWishlist != null) {
            AnimationUtilsHelper.applyPressScale(btnOpenWishlist);
            btnOpenWishlist.setOnClickListener(v -> {
                Intent intent = new Intent(getContext(), WishlistActivity.class);
                startActivity(intent);
            });
        }

        // Reset button in empty state
        if (btnClearSearchFilter != null) {
            AnimationUtilsHelper.applyPressScale(btnClearSearchFilter);
            btnClearSearchFilter.setOnClickListener(v -> {
                filterCategory = "All";
                filterAvailability = "All";
                filterMinPrice = -1;
                filterMaxPrice = -1;
                currentSubTab = "ALL";
                currentSearchQuery = "";
                selectedPriceOption = "All Prices";
                if (spinnerPriceFilter != null) {
                    spinnerPriceFilter.setSelection(0);
                }
                etSearchFlowers.setText("");
                syncTopChipWithCategory("All");
                selectSubTab("ALL");
            });
        }
    }

    private void setupChips() {
        if (layoutChipsContainer == null) return;

        if (!categoryChipViews.isEmpty()) {
            TextView chipAll = categoryChipViews.get(0);
            AnimationUtilsHelper.applyPressScale(chipAll);
            chipAll.setOnClickListener(v -> {
                filterCategory = "All";
                syncTopChipWithCategory("All");
                applyFilters();
            });
        }

        loadCategories();
    }

    private void loadCategories() {
        if (getContext() == null) return;
        ApiClient.getApiService(requireContext()).getCategories().enqueue(new Callback<CategoriesResponse>() {
            @Override
            public void onResponse(@NonNull Call<CategoriesResponse> call, @NonNull Response<CategoriesResponse> response) {
                if (!isAdded() || getContext() == null) return;
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess() && response.body().getCategories() != null) {
                    populateCategoryChips(response.body().getCategories());
                } else {
                    populateFallbackCategories();
                }
            }

            @Override
            public void onFailure(@NonNull Call<CategoriesResponse> call, @NonNull Throwable t) {
                if (!isAdded() || getContext() == null) return;
                populateFallbackCategories();
            }
        });
    }

    private void populateCategoryChips(List<String> categories) {
        if (layoutChipsContainer == null || getContext() == null) return;
        if (categories == null || categories.isEmpty()) {
            populateFallbackCategories();
            return;
        }

        while (layoutChipsContainer.getChildCount() > 1) {
            layoutChipsContainer.removeViewAt(1);
        }
        categoryChipViews.clear();
        TextView chipAll = layoutChipsContainer.findViewById(R.id.chipAll);
        if (chipAll != null) {
            categoryChipViews.add(chipAll);
        }

        int marginStart = (int) (8 * getResources().getDisplayMetrics().density);
        int padH = (int) (16 * getResources().getDisplayMetrics().density);
        int heightPx = (int) (34 * getResources().getDisplayMetrics().density);

        for (String cat : categories) {
            if (cat == null || cat.trim().isEmpty()) continue;
            final String categoryName = cat.trim();
            TextView chip = new TextView(requireContext());
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    heightPx
            );
            lp.setMarginStart(marginStart);
            chip.setLayoutParams(lp);
            chip.setGravity(android.view.Gravity.CENTER);
            chip.setPadding(padH, 0, padH, 0);
            chip.setText(categoryName);
            chip.setTextSize(13);
            chip.setBackgroundResource(R.drawable.bg_chip_unselected);
            chip.setTextColor(ContextCompat.getColor(requireContext(), R.color.text_primary));
            chip.setClickable(true);
            chip.setFocusable(true);
            AnimationUtilsHelper.applyPressScale(chip);

            chip.setOnClickListener(v -> {
                filterCategory = categoryName;
                syncTopChipWithCategory(categoryName);
                applyFilters();
            });

            layoutChipsContainer.addView(chip);
            categoryChipViews.add(chip);
        }

        syncTopChipWithCategory(filterCategory);
    }

    private void populateFallbackCategories() {
        List<String> categories = new ArrayList<>();
        if (!cachedFlowerDtos.isEmpty()) {
            for (FlowerDto f : cachedFlowerDtos) {
                if (f.getCategory() != null && !f.getCategory().trim().isEmpty() && !categories.contains(f.getCategory().trim())) {
                    categories.add(f.getCategory().trim());
                }
            }
        }
        if (categories.isEmpty()) {
            String[] defaults = new String[]{
                    "Alstroemeria", "Baby's Breath", "Bird of Paradise", "Carnation",
                    "Chrysanthemum", "Eucalyptus", "Freesia", "Gerbera",
                    "Hydrangea", "Lavender", "Lily", "Lisianthus",
                    "Orchid", "Peony", "Ranunculus", "Rose",
                    "Sunflower", "Tuberose", "Tulip"
            };
            for (String d : defaults) categories.add(d);
        }
        populateCategoryChips(categories);
    }

    private void syncTopChipWithCategory(String category) {
        if (!isAdded() || getContext() == null) return;

        for (TextView c : categoryChipViews) {
            if (c != null) {
                c.setBackgroundResource(R.drawable.bg_chip_unselected);
                c.setTextColor(ContextCompat.getColor(requireContext(), R.color.text_primary));
                c.setTypeface(null, Typeface.NORMAL);
            }
        }

        String normalizedInput = FlowerAdapter.normalizeCategoryToken(category);
        TextView targetChip = ("all".equals(normalizedInput) || normalizedInput.isEmpty()) && !categoryChipViews.isEmpty()
                ? categoryChipViews.get(0) : null;

        for (TextView c : categoryChipViews) {
            if (c == null) continue;
            String chipLabel = c.getText().toString();
            if (chipLabel.equalsIgnoreCase(category)
                    || (!normalizedInput.isEmpty() && FlowerAdapter.normalizeCategoryToken(chipLabel).equals(normalizedInput))) {
                targetChip = c;
                break;
            }
        }

        if (targetChip != null) {
            targetChip.setBackgroundResource(R.drawable.bg_chip_selected);
            targetChip.setTextColor(ContextCompat.getColor(requireContext(), R.color.text_white));
            targetChip.setTypeface(null, Typeface.BOLD);
        }
    }

    private void applyFilters() {
        if (!isAdded() || getContext() == null || flowerAdapter == null) return;

        flowerAdapter.applyFilter(currentSearchQuery, filterCategory, filterAvailability, filterMinPrice, filterMaxPrice, currentSubTab, selectedPriceOption);

        // Highlight filter icon if custom filter applied from FilterActivity
        boolean hasCustomFilter = (!"All".equalsIgnoreCase(filterCategory))
                || (!"All".equalsIgnoreCase(filterAvailability))
                || (filterMinPrice >= 0)
                || (filterMaxPrice >= 0)
                || (!"All Prices".equalsIgnoreCase(selectedPriceOption));

        if (hasCustomFilter) {
            btnOpenFilter.setBackgroundResource(R.drawable.bg_chip_selected);
            btnOpenFilter.setColorFilter(ContextCompat.getColor(requireContext(), R.color.text_white));
        } else {
            btnOpenFilter.setBackgroundResource(R.drawable.bg_chip_unselected);
            btnOpenFilter.setColorFilter(ContextCompat.getColor(requireContext(), R.color.text_primary));
        }
    }

    private void hideKeyboard() {
        if (getActivity() != null && etSearchFlowers != null) {
            InputMethodManager imm = (InputMethodManager) getActivity().getSystemService(Context.INPUT_METHOD_SERVICE);
            if (imm != null) {
                imm.hideSoftInputFromWindow(etSearchFlowers.getWindowToken(), 0);
            }
        }
    }

    public void fetchCustomerNotificationsBadge() {
        if (getContext() == null || !isAdded()) return;
        int customerId = resolveCustomerId();
        if (customerId <= 0) {
            if (badgeNotificationCount != null) badgeNotificationCount.setVisibility(View.GONE);
            return;
        }

        ApiClient.getApiService(requireContext())
                .getCustomerOrders(customerId)
                .enqueue(new Callback<CustomerOrdersResponse>() {
                    @Override
                    public void onResponse(Call<CustomerOrdersResponse> call, Response<CustomerOrdersResponse> response) {
                        if (!isAdded() || getContext() == null) return;
                        if (response.isSuccessful() && response.body() != null && response.body().getOrders() != null) {
                            List<OrderSummaryDto> orders = response.body().getOrders();
                            int activeCount = 0;
                            for (OrderSummaryDto o : orders) {
                                String s = o.getStatus() != null ? o.getStatus().toUpperCase() : "";
                                String fs = o.getFulfilmentStatus() != null ? o.getFulfilmentStatus().toUpperCase() : "";
                                String ds = o.getDeliveryStatus() != null ? o.getDeliveryStatus().toUpperCase() : "";
                                boolean isDeliveredOrCancelled = s.equals("DELIVERED") || fs.equals("DELIVERED") || ds.equals("DELIVERED")
                                        || s.equals("CANCELLED") || fs.equals("CANCELLED");
                                if (!isDeliveredOrCancelled) {
                                    activeCount++;
                                }
                            }
                            if (badgeNotificationCount != null) {
                                if (activeCount > 0) {
                                    badgeNotificationCount.setText(String.valueOf(activeCount));
                                    badgeNotificationCount.setVisibility(View.VISIBLE);
                                } else {
                                    badgeNotificationCount.setVisibility(View.GONE);
                                }
                            }
                        }
                    }

                    @Override
                    public void onFailure(Call<CustomerOrdersResponse> call, Throwable t) {
                        // Silent fallback
                    }
                });
    }

    public void showOrderNotificationsBottomSheet() {
        if (getContext() == null || !isAdded()) return;

        BottomSheetDialog bottomSheetDialog = new BottomSheetDialog(requireContext());
        View sheetView = LayoutInflater.from(requireContext()).inflate(R.layout.dialog_order_notifications, null);
        bottomSheetDialog.setContentView(sheetView);

        if (bottomSheetDialog.getWindow() != null) {
            View bottomSheetInternal = bottomSheetDialog.getWindow().findViewById(com.google.android.material.R.id.design_bottom_sheet);
            if (bottomSheetInternal != null) {
                bottomSheetInternal.setBackgroundResource(android.R.color.transparent);
            }
        }

        TextView btnClose = sheetView.findViewById(R.id.btnCloseNotifications);
        TextView tvSheetActiveCount = sheetView.findViewById(R.id.tvSheetActiveCount);
        ProgressBar pbLoading = sheetView.findViewById(R.id.pbNotificationsLoading);
        RecyclerView rvNotifications = sheetView.findViewById(R.id.rvOrderNotifications);
        View layoutEmpty = sheetView.findViewById(R.id.layoutEmptyNotifications);

        if (btnClose != null) {
            btnClose.setOnClickListener(v -> bottomSheetDialog.dismiss());
        }

        rvNotifications.setLayoutManager(new LinearLayoutManager(getContext()));
        OrderNotificationsAdapter notifAdapter = new OrderNotificationsAdapter(requireContext(), order -> {
            bottomSheetDialog.dismiss();
            if (getContext() == null) return;
            String code = order.getOrderCode() != null && !order.getOrderCode().isEmpty()
                    ? order.getOrderCode() : ("PB-" + order.getOrderId());
            String status = order.getFulfilmentStatus() != null && !order.getFulfilmentStatus().isEmpty()
                    ? order.getFulfilmentStatus() : order.getStatus();
            String dateToPass = order.getDeliveryDate() != null && !order.getDeliveryDate().isEmpty() && !order.getDeliveryDate().equalsIgnoreCase("null")
                    ? order.getDeliveryDate() : order.getOrderDate();

            Intent intent = new Intent(getContext(), DeliveryTrackingActivity.class);
            intent.putExtra("ORDER_ID", code);
            intent.putExtra("ORDER_STATUS", status);
            intent.putExtra("DELIVERY_DATE", dateToPass);
            intent.putExtra("ORDER_DATE", order.getOrderDate());
            intent.putExtra("DRIVER_NAME", order.getDriverName());
            intent.putExtra("VEHICLE_NUMBER", order.getVehicleNumber());
            intent.putExtra("DRIVER_PHONE", order.getDriverPhone());
            startActivity(intent);
        });
        rvNotifications.setAdapter(notifAdapter);

        int customerId = resolveCustomerId();
        if (customerId <= 0) {
            pbLoading.setVisibility(View.GONE);
            layoutEmpty.setVisibility(View.VISIBLE);
            rvNotifications.setVisibility(View.GONE);
            bottomSheetDialog.show();
            return;
        }

        pbLoading.setVisibility(View.VISIBLE);
        rvNotifications.setVisibility(View.GONE);
        layoutEmpty.setVisibility(View.GONE);

        ApiClient.getApiService(requireContext())
                .getCustomerOrders(customerId)
                .enqueue(new Callback<CustomerOrdersResponse>() {
                    @Override
                    public void onResponse(Call<CustomerOrdersResponse> call, Response<CustomerOrdersResponse> response) {
                        if (!isAdded() || getContext() == null) return;
                        pbLoading.setVisibility(View.GONE);

                        if (response.isSuccessful() && response.body() != null && response.body().getOrders() != null) {
                            List<OrderSummaryDto> orders = response.body().getOrders();
                            if (orders.isEmpty()) {
                                layoutEmpty.setVisibility(View.VISIBLE);
                                rvNotifications.setVisibility(View.GONE);
                                if (tvSheetActiveCount != null) tvSheetActiveCount.setVisibility(View.GONE);
                            } else {
                                layoutEmpty.setVisibility(View.GONE);
                                rvNotifications.setVisibility(View.VISIBLE);
                                notifAdapter.setOrders(orders);

                                int activeCount = 0;
                                for (OrderSummaryDto o : orders) {
                                    String s = o.getStatus() != null ? o.getStatus().toUpperCase() : "";
                                    String fs = o.getFulfilmentStatus() != null ? o.getFulfilmentStatus().toUpperCase() : "";
                                    String ds = o.getDeliveryStatus() != null ? o.getDeliveryStatus().toUpperCase() : "";
                                    if (!s.equals("DELIVERED") && !fs.equals("DELIVERED") && !ds.equals("DELIVERED") && !s.equals("CANCELLED")) {
                                        activeCount++;
                                    }
                                }
                                if (tvSheetActiveCount != null) {
                                    if (activeCount > 0) {
                                        tvSheetActiveCount.setText(activeCount + " Active");
                                        tvSheetActiveCount.setVisibility(View.VISIBLE);
                                    } else {
                                        tvSheetActiveCount.setVisibility(View.GONE);
                                    }
                                }

                                if (badgeNotificationCount != null) {
                                    if (activeCount > 0) {
                                        badgeNotificationCount.setText(String.valueOf(activeCount));
                                        badgeNotificationCount.setVisibility(View.VISIBLE);
                                    } else {
                                        badgeNotificationCount.setVisibility(View.GONE);
                                    }
                                }
                            }
                        } else {
                            layoutEmpty.setVisibility(View.VISIBLE);
                            rvNotifications.setVisibility(View.GONE);
                        }
                    }

                    @Override
                    public void onFailure(Call<CustomerOrdersResponse> call, Throwable t) {
                        if (!isAdded() || getContext() == null) return;
                        pbLoading.setVisibility(View.GONE);
                        layoutEmpty.setVisibility(View.VISIBLE);
                        rvNotifications.setVisibility(View.GONE);
                    }
                });

        bottomSheetDialog.show();
    }
}
