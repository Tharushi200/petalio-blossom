package com.petalio.blossom;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.FlowerDto;
import com.petalio.blossom.network.FlowersResponse;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * WishlistActivity: Live wishlist screen synced 100% with GET /api/flowers from MySQL.
 */
public class WishlistActivity extends AppCompatActivity {

    private View btnBackWishlist;
    private TextView tvWishlistCount;
    private ProgressBar pbWishlistLoading;
    private LinearLayout layoutWishlistEmpty, bottomWishlistBar;
    private RecyclerView rvWishlist;
    private Button btnBrowseFromWishlist, btnAddAllWishlistToCart;

    private final List<FlowerDto> savedFlowers = new ArrayList<>();
    private WishlistAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_wishlist);

        initViews();
        setupRecyclerView();
        setupListeners();
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadLiveWishlist();
    }

    private void initViews() {
        btnBackWishlist = findViewById(R.id.btnBackWishlist);
        tvWishlistCount = findViewById(R.id.tvWishlistCount);
        pbWishlistLoading = findViewById(R.id.pbWishlistLoading);
        layoutWishlistEmpty = findViewById(R.id.layoutWishlistEmpty);
        bottomWishlistBar = findViewById(R.id.bottomWishlistBar);
        rvWishlist = findViewById(R.id.rvWishlist);
        btnBrowseFromWishlist = findViewById(R.id.btnBrowseFromWishlist);
        btnAddAllWishlistToCart = findViewById(R.id.btnAddAllWishlistToCart);
    }

    private void setupRecyclerView() {
        rvWishlist.setLayoutManager(new LinearLayoutManager(this));
        adapter = new WishlistAdapter(savedFlowers);
        rvWishlist.setAdapter(adapter);
    }

    private void loadLiveWishlist() {
        int customerId = PetalioUserPrefs.getCustomerId(this);
        if (customerId <= 0) customerId = PetalioUserPrefs.getUserId(this);
        if (customerId <= 0) {
            if (pbWishlistLoading != null) pbWishlistLoading.setVisibility(View.GONE);
            savedFlowers.clear();
            updateEmptyState();
            return;
        }
        if (pbWishlistLoading != null && savedFlowers.isEmpty()) {
            pbWishlistLoading.setVisibility(View.VISIBLE);
        }

        ApiClient.getApiService(getApplicationContext())
                .getFlowers()
                .enqueue(new Callback<FlowersResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<FlowersResponse> call, @NonNull Response<FlowersResponse> response) {
                        if (isFinishing() || isDestroyed()) return;
                        if (pbWishlistLoading != null) pbWishlistLoading.setVisibility(View.GONE);

                        savedFlowers.clear();
                        if (response.isSuccessful() && response.body() != null && response.body().getFlowers() != null) {
                            for (FlowerDto dto : response.body().getFlowers()) {
                                if (WishlistManager.isFavorite(WishlistActivity.this, dto.getName())) {
                                    savedFlowers.add(dto);
                                }
                            }
                        }
                        updateEmptyState();
                    }

                    @Override
                    public void onFailure(@NonNull Call<FlowersResponse> call, @NonNull Throwable t) {
                        if (isFinishing() || isDestroyed()) return;
                        if (pbWishlistLoading != null) pbWishlistLoading.setVisibility(View.GONE);
                        updateEmptyState();
                        Toast.makeText(WishlistActivity.this, "Unable to sync wishlist from server.", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void updateEmptyState() {
        int count = savedFlowers.size();
        if (count == 0) {
            if (layoutWishlistEmpty != null) layoutWishlistEmpty.setVisibility(View.VISIBLE);
            if (rvWishlist != null) rvWishlist.setVisibility(View.GONE);
            if (bottomWishlistBar != null) bottomWishlistBar.setVisibility(View.GONE);
            if (tvWishlistCount != null) tvWishlistCount.setText("0 items saved");
        } else {
            if (layoutWishlistEmpty != null) layoutWishlistEmpty.setVisibility(View.GONE);
            if (rvWishlist != null) rvWishlist.setVisibility(View.VISIBLE);
            if (bottomWishlistBar != null) bottomWishlistBar.setVisibility(View.VISIBLE);
            if (tvWishlistCount != null) {
                tvWishlistCount.setText(count + (count == 1 ? " flower saved" : " flowers saved"));
            }
        }
        if (adapter != null) adapter.notifyDataSetChanged();
    }

    private void setupListeners() {
        btnBackWishlist.setOnClickListener(v -> finish());

        btnBrowseFromWishlist.setOnClickListener(v -> {
            Intent intent = new Intent(WishlistActivity.this, CustomerMainActivity.class);
            intent.putExtra("TARGET_TAB", 0);
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            startActivity(intent);
            finish();
        });

        btnAddAllWishlistToCart.setOnClickListener(v -> {
            if (savedFlowers.isEmpty()) return;
            for (FlowerDto dto : savedFlowers) {
                CartManager.getInstance(this).addItem(new CartManager.CartItem(
                        dto.getFlowerId(),
                        dto.getName(),
                        dto.getCategory(),
                        (int) Math.round(dto.getUnitPrice()),
                        1,
                        dto.getName().toLowerCase().replace(" ", "_"),
                        dto.getStockQuantity()
                ));
            }
            Toast.makeText(this, "All wishlist flowers added to your Cart!", Toast.LENGTH_LONG).show();
            Intent intent = new Intent(WishlistActivity.this, CustomerMainActivity.class);
            intent.putExtra("TARGET_TAB", 1);
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            startActivity(intent);
            finish();
        });
    }

    private class WishlistAdapter extends RecyclerView.Adapter<WishlistAdapter.WishlistViewHolder> {
        private final List<FlowerDto> items;

        WishlistAdapter(List<FlowerDto> items) {
            this.items = items;
        }

        @NonNull
        @Override
        public WishlistViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_wishlist_flower, parent, false);
            return new WishlistViewHolder(v);
        }

        @Override
        public void onBindViewHolder(@NonNull WishlistViewHolder holder, int position) {
            FlowerDto dto = items.get(position);
            int unitPrice = (int) Math.round(dto.getUnitPrice());

            holder.tvName.setText(dto.getName());
            holder.tvMeta.setText(dto.getCategory() + " • " + dto.getStockQuantity() + " stems in stock");
            holder.tvPrice.setText("Rs. " + unitPrice + " / stem");
            holder.ivFlower.setImageResource(FlowerImageHelper.getDrawableForFlower(dto.getName()));

            AnimationUtilsHelper.applyPressScale(holder.card);
            AnimationUtilsHelper.applyPressScale(holder.btnAddToCart);

            holder.card.setOnClickListener(v -> {
                Intent intent = new Intent(WishlistActivity.this, FlowerDetailActivity.class);
                intent.putExtra("FLOWER_ID", dto.getFlowerId());
                intent.putExtra("FLOWER_NAME", dto.getName());
                intent.putExtra("FLOWER_CATEGORY", dto.getCategory());
                intent.putExtra("FLOWER_PRICE", unitPrice);
                intent.putExtra("FLOWER_AVAILABLE", dto.getStockQuantity());
                intent.putExtra("FLOWER_ICON", dto.getName().toLowerCase().replace(" ", "_"));
                intent.putExtra("FLOWER_SOLD", dto.getSoldCount());
                intent.putExtra("FLOWER_RATING", dto.getAvgRating());
                intent.putExtra("FLOWER_REVIEWS", dto.getReviewCount());
                startActivity(intent);
            });

            holder.btnRemove.setOnClickListener(v -> {
                WishlistManager.setFavorite(WishlistActivity.this, dto.getName(), false);
                savedFlowers.remove(position);
                updateEmptyState();
                Toast.makeText(WishlistActivity.this, dto.getName() + " removed from your Wishlist", Toast.LENGTH_SHORT).show();
            });

            holder.btnAddToCart.setOnClickListener(v -> {
                CartManager.getInstance(WishlistActivity.this).addItem(new CartManager.CartItem(
                        dto.getFlowerId(),
                        dto.getName(),
                        dto.getCategory(),
                        unitPrice,
                        1,
                        dto.getName().toLowerCase().replace(" ", "_"),
                        dto.getStockQuantity()
                ));
                Toast.makeText(WishlistActivity.this, dto.getName() + " added to your Cart!", Toast.LENGTH_SHORT).show();
            });
        }

        @Override
        public int getItemCount() {
            return items.size();
        }

        class WishlistViewHolder extends RecyclerView.ViewHolder {
            CardView card;
            ImageView ivFlower, btnRemove;
            TextView tvName, tvMeta, tvPrice;
            Button btnAddToCart;

            WishlistViewHolder(@NonNull View itemView) {
                super(itemView);
                card = itemView.findViewById(R.id.cardWishlistItem);
                ivFlower = itemView.findViewById(R.id.ivWishlistFlower);
                btnRemove = itemView.findViewById(R.id.btnRemoveWishlistItem);
                tvName = itemView.findViewById(R.id.tvWishlistFlowerName);
                tvMeta = itemView.findViewById(R.id.tvWishlistFlowerMeta);
                tvPrice = itemView.findViewById(R.id.tvWishlistFlowerPrice);
                btnAddToCart = itemView.findViewById(R.id.btnAddWishlistItemToCart);
            }
        }
    }
}
