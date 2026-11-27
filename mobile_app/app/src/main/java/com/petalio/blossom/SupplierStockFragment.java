package com.petalio.blossom;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.CommonResponse;
import com.petalio.blossom.network.FlowerDto;
import com.petalio.blossom.network.FlowersResponse;
import com.petalio.blossom.network.StockUpdateRequest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * SupplierStockFragment: Real-time inventory and bulk harvest update driven 100% by MySQL database.
 */
public class SupplierStockFragment extends Fragment {

    private RecyclerView rvStock;
    private ProgressBar pbLoading;
    private LinearLayout layoutEmpty, bottomSaveStockBar;
    private Button btnAddFlowerType, btnSaveStockUpdates;

    private SupplierStockAdapter adapter;
    private final List<FlowerDto> flowerList = new ArrayList<>();
    private final Map<Integer, Integer> editedStockMap = new HashMap<>();
    private final java.util.Set<Integer> invalidQtyIds = new java.util.HashSet<>();

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_supplier_stock, container, false);

        initViews(view);
        setupRecyclerView();
        setupListeners();
        fetchLiveFlowers();

        return view;
    }

    @Override
    public void onResume() {
        super.onResume();
        fetchLiveFlowers();
    }

    private void initViews(View v) {
        rvStock = v.findViewById(R.id.rvSupplierStock);
        pbLoading = v.findViewById(R.id.pbStockLoading);
        layoutEmpty = v.findViewById(R.id.layoutEmptyStock);
        bottomSaveStockBar = v.findViewById(R.id.bottomSaveStockBar);
        btnAddFlowerType = v.findViewById(R.id.btnAddFlowerType);
        btnSaveStockUpdates = v.findViewById(R.id.btnSaveStockUpdates);
    }

    private void setupRecyclerView() {
        if (getContext() == null || rvStock == null) return;
        rvStock.setLayoutManager(new LinearLayoutManager(requireContext()));
        adapter = new SupplierStockAdapter(flowerList);
        rvStock.setAdapter(adapter);
    }

    private void setupListeners() {
        AnimationUtilsHelper.applyPressScale(btnAddFlowerType);
        AnimationUtilsHelper.applyPressScale(btnSaveStockUpdates);

        btnAddFlowerType.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(requireActivity(), DeclareFlowersActivity.class);
                startActivity(intent);
            }
        });

        btnSaveStockUpdates.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                saveBulkStockUpdates();
            }
        });
    }

    private void fetchLiveFlowers() {
        if (getContext() == null) return;
        int supplierId = PetalioUserPrefs.getSupplierId(requireContext());
        if (supplierId <= 0) {
            if (pbLoading != null) pbLoading.setVisibility(View.GONE);
            flowerList.clear();
            editedStockMap.clear();
            invalidQtyIds.clear();
            if (layoutEmpty != null) layoutEmpty.setVisibility(View.VISIBLE);
            if (rvStock != null) rvStock.setVisibility(View.GONE);
            if (bottomSaveStockBar != null) bottomSaveStockBar.setVisibility(View.GONE);
            if (adapter != null) adapter.notifyDataSetChanged();
            return;
        }
        if (pbLoading != null) {
            pbLoading.setVisibility(View.VISIBLE);
        }

        ApiClient.getApiService(requireContext())
                .getSupplierFlowers(supplierId)
                .enqueue(new Callback<FlowersResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<FlowersResponse> call, @NonNull Response<FlowersResponse> response) {
                        if (!isAdded() || getContext() == null) return;
                        if (pbLoading != null) pbLoading.setVisibility(View.GONE);

                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            List<FlowerDto> flowers = response.body().getFlowers();
                            flowerList.clear();
                            editedStockMap.clear();
                            invalidQtyIds.clear();
                            if (flowers != null && !flowers.isEmpty()) {
                                flowerList.addAll(flowers);
                                for (FlowerDto f : flowers) {
                                    editedStockMap.put(f.getFlowerId(), f.getStockQuantity());
                                }
                                if (layoutEmpty != null) layoutEmpty.setVisibility(View.GONE);
                                if (rvStock != null) rvStock.setVisibility(View.VISIBLE);
                                if (bottomSaveStockBar != null) bottomSaveStockBar.setVisibility(View.VISIBLE);
                            } else {
                                if (layoutEmpty != null) layoutEmpty.setVisibility(View.VISIBLE);
                                if (rvStock != null) rvStock.setVisibility(View.GONE);
                                if (bottomSaveStockBar != null) bottomSaveStockBar.setVisibility(View.GONE);
                            }
                            if (adapter != null) adapter.notifyDataSetChanged();
                        } else {
                            if (flowerList.isEmpty() && layoutEmpty != null) {
                                layoutEmpty.setVisibility(View.VISIBLE);
                            }
                            if (flowerList.isEmpty() && bottomSaveStockBar != null) {
                                bottomSaveStockBar.setVisibility(View.GONE);
                            }
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<FlowersResponse> call, @NonNull Throwable t) {
                        if (!isAdded() || getContext() == null) return;
                        if (pbLoading != null) pbLoading.setVisibility(View.GONE);
                        if (flowerList.isEmpty() && layoutEmpty != null) {
                            layoutEmpty.setVisibility(View.VISIBLE);
                        }
                        if (flowerList.isEmpty() && bottomSaveStockBar != null) {
                            bottomSaveStockBar.setVisibility(View.GONE);
                        }
                    }
                });
    }

    private void saveBulkStockUpdates() {
        if (getContext() == null || flowerList.isEmpty()) {
            Toast.makeText(getContext(), "No flowers available to update.", Toast.LENGTH_SHORT).show();
            return;
        }

        if (!invalidQtyIds.isEmpty()) {
            Toast.makeText(getContext(), "Please enter a valid quantity (0 or more) for all flowers.", Toast.LENGTH_SHORT).show();
            return;
        }

        List<StockUpdateRequest> updateList = new ArrayList<>();
        for (FlowerDto f : flowerList) {
            int currentQty = editedStockMap.containsKey(f.getFlowerId()) ? editedStockMap.get(f.getFlowerId()) : f.getStockQuantity();
            if (currentQty < 0) {
                Toast.makeText(getContext(), "Stock quantity cannot be negative.", Toast.LENGTH_SHORT).show();
                return;
            }
            updateList.add(new StockUpdateRequest(f.getFlowerId(), currentQty));
        }

        btnSaveStockUpdates.setEnabled(false);
        Toast.makeText(requireContext(), "Saving " + updateList.size() + " stock updates...", Toast.LENGTH_SHORT).show();

        ApiClient.getApiService(requireContext())
                .bulkUpdateStock(updateList)
                .enqueue(new Callback<CommonResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<CommonResponse> call, @NonNull Response<CommonResponse> response) {
                        if (!isAdded() || getContext() == null) return;
                        btnSaveStockUpdates.setEnabled(true);
                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            Toast.makeText(requireContext(), "✓ Live inventory quantities successfully updated!", Toast.LENGTH_LONG).show();
                            fetchLiveFlowers();
                        } else {
                            String msg = (response.body() != null && response.body().getMessage() != null && !response.body().getMessage().trim().isEmpty())
                                    ? response.body().getMessage()
                                    : ApiClient.extractErrorMessage(response, "Failed to save stock updates.");
                            Toast.makeText(requireContext(), msg, Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<CommonResponse> call, @NonNull Throwable t) {
                        if (!isAdded() || getContext() == null) return;
                        btnSaveStockUpdates.setEnabled(true);
                        Toast.makeText(requireContext(), "Network error: Unable to update stock right now.", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    /**
     * Inner Adapter for Live Stock Management
     */
    private class SupplierStockAdapter extends RecyclerView.Adapter<SupplierStockAdapter.StockViewHolder> {

        private final List<FlowerDto> items;

        public SupplierStockAdapter(List<FlowerDto> items) {
            this.items = items;
        }

        @NonNull
        @Override
        public StockViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_supplier_stock_card, parent, false);
            return new StockViewHolder(view);
        }

        @Override
        public void onBindViewHolder(StockViewHolder holder, int position) {
            FlowerDto flower = items.get(position);

            holder.tvName.setText(flower.getName());
            holder.tvCategory.setText(flower.getCategory()
                    + " · Rs. " + String.format("%,.0f", flower.getUnitPrice()) + " / stem"
                    + " · Reorder: " + flower.getReorderLevel());

            int currentQty = editedStockMap.containsKey(flower.getFlowerId()) ? editedStockMap.get(flower.getFlowerId()) : flower.getStockQuantity();

            if (holder.textWatcher != null) {
                holder.etQuantity.removeTextChangedListener(holder.textWatcher);
            }
            holder.etQuantity.setText(String.valueOf(currentQty));

            holder.textWatcher = new TextWatcher() {
                @Override
                public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

                @Override
                public void onTextChanged(CharSequence s, int start, int before, int count) {}

                @Override
                public void afterTextChanged(Editable s) {
                    String raw = s != null ? s.toString().trim() : "";
                    if (raw.isEmpty()) {
                        invalidQtyIds.add(flower.getFlowerId());
                        holder.etQuantity.setError("Enter 0 or more");
                        return;
                    }
                    try {
                        int newQty = Integer.parseInt(raw);
                        if (newQty < 0) {
                            invalidQtyIds.add(flower.getFlowerId());
                            holder.etQuantity.setError("Cannot be negative");
                            return;
                        }
                        invalidQtyIds.remove(flower.getFlowerId());
                        holder.etQuantity.setError(null);
                        editedStockMap.put(flower.getFlowerId(), newQty);
                        updateBadge(holder.tvBadge, newQty, flower.getReorderLevel());
                    } catch (NumberFormatException e) {
                        invalidQtyIds.add(flower.getFlowerId());
                        holder.etQuantity.setError("Invalid number");
                    }
                }
            };
            holder.etQuantity.addTextChangedListener(holder.textWatcher);

            updateBadge(holder.tvBadge, currentQty, flower.getReorderLevel());

            // Use FlowerImageHelper native drawable mapping
            int drawableRes = FlowerImageHelper.getDrawableForFlower(flower.getName());
            holder.ivImage.setImageResource(drawableRes);
        }

        private void updateBadge(TextView tvBadge, int qty, int reorderLevel) {
            if (tvBadge == null) return;
            int threshold = Math.max(reorderLevel, 49);
            if (qty <= 0) {
                tvBadge.setText("Out of Stock");
                tvBadge.setBackgroundResource(R.drawable.bg_badge_status);
                tvBadge.setTextColor(ContextCompat.getColor(tvBadge.getContext(), R.color.badge_dispatched_text));
            } else if (qty <= threshold) {
                tvBadge.setText("Low Stock (" + qty + ")");
                tvBadge.setBackgroundResource(R.drawable.bg_badge_status);
                tvBadge.setTextColor(ContextCompat.getColor(tvBadge.getContext(), R.color.badge_dispatched_text));
            } else {
                tvBadge.setText("In Stock (" + qty + ")");
                tvBadge.setBackgroundResource(R.drawable.bg_badge_in_stock);
                tvBadge.setTextColor(ContextCompat.getColor(tvBadge.getContext(), R.color.badge_in_stock_text));
            }
        }

        @Override
        public int getItemCount() {
            return items.size();
        }

        class StockViewHolder extends RecyclerView.ViewHolder {
            ImageView ivImage;
            TextView tvName, tvCategory, tvBadge;
            EditText etQuantity;
            TextWatcher textWatcher;

            StockViewHolder(View itemView) {
                super(itemView);
                ivImage = itemView.findViewById(R.id.ivStockFlowerImage);
                tvName = itemView.findViewById(R.id.tvStockFlowerName);
                tvCategory = itemView.findViewById(R.id.tvStockFlowerCategory);
                tvBadge = itemView.findViewById(R.id.tvStockBadge);
                etQuantity = itemView.findViewById(R.id.etStockQuantity);
            }
        }
    }
}
