package com.petalio.blossom;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.cardview.widget.CardView;
import androidx.core.app.ActivityOptionsCompat;
import androidx.core.content.ContextCompat;
import androidx.interpolator.view.animation.FastOutSlowInInterpolator;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

/**
 * FlowerAdapter: Displays all authentic flowers from the Petalio Blossom database
 * with modern 2-column e-commerce cards, social proof, and quick-add cart button.
 */
public class FlowerAdapter extends RecyclerView.Adapter<FlowerAdapter.FlowerViewHolder> {

    public interface OnFlowerCountChangedListener {
        void onCountChanged(int count);
    }

    private final Context context;
    private final List<WishlistManager.FlowerItem> masterList;
    private final List<WishlistManager.FlowerItem> displayedList;
    private OnFlowerCountChangedListener countListener;
    private int lastAnimatedPosition = -1;
    private final FastOutSlowInInterpolator entranceInterpolator = new FastOutSlowInInterpolator();

    public FlowerAdapter(Context context, List<WishlistManager.FlowerItem> items) {
        this.context = context;
        this.masterList = new ArrayList<>(items);
        this.displayedList = new ArrayList<>(items);
    }

    public void setCountListener(OnFlowerCountChangedListener listener) {
        this.countListener = listener;
    }

    public void updateData(List<WishlistManager.FlowerItem> newItems) {
        setMasterData(newItems);
        displayedList.clear();
        displayedList.addAll(newItems);
        lastAnimatedPosition = -1;
        notifyDataSetChanged();
        if (countListener != null) countListener.onCountChanged(displayedList.size());
    }

    /**
     * Replaces master catalog data without flashing unfiltered results when applyFilter follows immediately.
     */
    public void setMasterData(List<WishlistManager.FlowerItem> newItems) {
        masterList.clear();
        if (newItems != null) {
            masterList.addAll(newItems);
        }
    }

    public int getMasterCount() {
        return masterList.size();
    }

    /**
     * Normalizes category labels and flower names (handling -ies and -s plurals) for accurate matching.
     */
    public static String normalizeCategoryToken(String raw) {
        if (raw == null) return "";
        String token = raw.trim().toLowerCase(Locale.US);
        if (token.endsWith("ies") && token.length() > 3) {
            return token.substring(0, token.length() - 3) + "y";
        }
        if (token.endsWith("s") && token.length() > 3) {
            return token.substring(0, token.length() - 1);
        }
        return token;
    }

    private static boolean matchesCategory(WishlistManager.FlowerItem item, String rawFilterCategory) {
        if (rawFilterCategory == null) return true;
        String filterRaw = rawFilterCategory.trim().toLowerCase(Locale.US);
        if (filterRaw.isEmpty() || "all".equals(filterRaw)) return true;

        String filterNorm = normalizeCategoryToken(filterRaw);
        String itemCatRaw = item.category != null ? item.category.trim().toLowerCase(Locale.US) : "";
        String itemNameRaw = item.name != null ? item.name.trim().toLowerCase(Locale.US) : "";

        if (itemCatRaw.equals(filterRaw) || normalizeCategoryToken(itemCatRaw).equals(filterNorm)) {
            return true;
        }
        if (itemNameRaw.equals(filterRaw) || normalizeCategoryToken(itemNameRaw).equals(filterNorm)) {
            return true;
        }

        return containsWholeNormalizedWord(itemCatRaw, filterNorm)
                || containsWholeNormalizedWord(itemNameRaw, filterNorm);
    }

    private static boolean containsWholeNormalizedWord(String text, String normalizedTarget) {
        if (text == null || text.isEmpty() || normalizedTarget.isEmpty()) return false;
        String[] words = text.split("[^a-z0-9']+");
        for (String word : words) {
            if (!word.isEmpty() && normalizeCategoryToken(word).equals(normalizedTarget)) {
                return true;
            }
        }
        return false;
    }

    private static double effectiveRating(WishlistManager.FlowerItem item) {
        return (item.reviewCount > 0 && item.avgRating > 0) ? item.avgRating : 0.0;
    }

    private boolean hasAnySalesInMaster() {
        for (WishlistManager.FlowerItem item : masterList) {
            if (item.soldCount > 0) return true;
        }
        return false;
    }

    public void applyFilter(String query, String category, String availability, int minPrice, int maxPrice) {
        applyFilter(query, category, availability, minPrice, maxPrice, "ALL");
    }

    public void applyFilter(String query, String category, String availability, int minPrice, int maxPrice, String subTab) {
        applyFilter(query, category, availability, minPrice, maxPrice, subTab, "All Prices");
    }

    public void applyFilter(String query, String category, String availability, int minPrice, int maxPrice, String subTab, String priceOption) {
        displayedList.clear();
        lastAnimatedPosition = -1;
        String q = (query != null) ? query.trim().toLowerCase(Locale.US) : "";

        for (WishlistManager.FlowerItem item : masterList) {
            // 1. Search Query filter
            if (!q.isEmpty()) {
                boolean match = (item.name != null && item.name.toLowerCase(Locale.US).contains(q))
                        || (item.category != null && item.category.toLowerCase(Locale.US).contains(q))
                        || String.valueOf(item.price).contains(q);
                if (!match) continue;
            }

            // 2. Category filter (plural/singular safe; avoids substring collisions like Tuberose vs Rose)
            if (!matchesCategory(item, category)) {
                continue;
            }

            // 3. Min price filter
            if (minPrice >= 0 && item.price < minPrice) {
                continue;
            }

            // 4. Max price filter
            if (maxPrice >= 0 && item.price > maxPrice) {
                continue;
            }

            // 5. Availability filter (Pre-order removed)
            if (availability != null && !availability.equalsIgnoreCase("All")) {
                if ("In stock".equalsIgnoreCase(availability) && item.available <= 0) {
                    continue;
                }
            }

            // 6. Price Dropdown Filter (Under Rs. 2,500, Rs. 2,500 – Rs. 5,000, Above Rs. 5,000)
            if (priceOption != null) {
                if ("Under Rs. 2,500".equalsIgnoreCase(priceOption) && item.price >= 2500) {
                    continue;
                } else if (("Rs. 2,500 – Rs. 5,000".equalsIgnoreCase(priceOption) || "Rs. 2,500 - Rs. 5,000".equalsIgnoreCase(priceOption))
                        && (item.price < 2500 || item.price > 5000)) {
                    continue;
                } else if ("Above Rs. 5,000".equalsIgnoreCase(priceOption) && item.price <= 5000) {
                    continue;
                }
            }

            displayedList.add(item);
        }

        // Price Sort Option or Sub-Tab sorting
        if (priceOption != null && "Price: Low to High".equalsIgnoreCase(priceOption)) {
            Collections.sort(displayedList, (a, b) -> Integer.compare(a.price, b.price));
        } else if (priceOption != null && "Price: High to Low".equalsIgnoreCase(priceOption)) {
            Collections.sort(displayedList, (a, b) -> Integer.compare(b.price, a.price));
        } else {
            // Sub-Tab filtering & sorting (All keeps default MySQL catalog order from masterList)
            applySubTabFilterAndSort(subTab);
        }

        notifyDataSetChanged();
        if (countListener != null) {
            countListener.onCountChanged(displayedList.size());
        }
    }

    private void applySubTabFilterAndSort(String subTab) {
        if (subTab == null || "ALL".equalsIgnoreCase(subTab)) {
            return;
        }

        if ("RATED".equalsIgnoreCase(subTab)) {
            List<WishlistManager.FlowerItem> ratedItems = new ArrayList<>();
            for (WishlistManager.FlowerItem item : displayedList) {
                if (item.reviewCount > 0 && effectiveRating(item) >= 4.5) {
                    ratedItems.add(item);
                }
            }
            displayedList.clear();
            displayedList.addAll(ratedItems);
            Collections.sort(displayedList, new Comparator<WishlistManager.FlowerItem>() {
                @Override
                public int compare(WishlistManager.FlowerItem a, WishlistManager.FlowerItem b) {
                    int ratingCmp = Double.compare(effectiveRating(b), effectiveRating(a));
                    if (ratingCmp != 0) return ratingCmp;
                    int reviewCmp = Integer.compare(b.reviewCount, a.reviewCount);
                    if (reviewCmp != 0) return reviewCmp;
                    int soldCmp = Integer.compare(b.soldCount, a.soldCount);
                    if (soldCmp != 0) return soldCmp;
                    return Integer.compare(a.id, b.id);
                }
            });
        } else if ("BEST_SELLING".equalsIgnoreCase(subTab)) {
            if (hasAnySalesInMaster()) {
                List<WishlistManager.FlowerItem> soldItems = new ArrayList<>();
                for (WishlistManager.FlowerItem item : displayedList) {
                    if (item.soldCount > 0) {
                        soldItems.add(item);
                    }
                }
                displayedList.clear();
                displayedList.addAll(soldItems);
            }
            Collections.sort(displayedList, new Comparator<WishlistManager.FlowerItem>() {
                @Override
                public int compare(WishlistManager.FlowerItem a, WishlistManager.FlowerItem b) {
                    int soldCmp = Integer.compare(b.soldCount, a.soldCount);
                    if (soldCmp != 0) return soldCmp;
                    int ratingCmp = Double.compare(effectiveRating(b), effectiveRating(a));
                    if (ratingCmp != 0) return ratingCmp;
                    return Integer.compare(a.id, b.id);
                }
            });
        } else if ("NEW_IN".equalsIgnoreCase(subTab)) {
            Collections.sort(displayedList, new Comparator<WishlistManager.FlowerItem>() {
                @Override
                public int compare(WishlistManager.FlowerItem a, WishlistManager.FlowerItem b) {
                    String ca = a.createdAt != null ? a.createdAt.trim() : "";
                    String cb = b.createdAt != null ? b.createdAt.trim() : "";
                    if (!ca.isEmpty() && !cb.isEmpty()) {
                        int dateCmp = cb.compareTo(ca);
                        if (dateCmp != 0) return dateCmp;
                    }
                    return Integer.compare(b.id, a.id);
                }
            });
        }
    }

    @Override
    public FlowerViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_flower_card, parent, false);
        return new FlowerViewHolder(view);
    }

    @Override
    public void onBindViewHolder(FlowerViewHolder holder, int position) {
        final WishlistManager.FlowerItem flower = displayedList.get(position);

        holder.tvFlowerName.setText(flower.name);

        // Live MySQL review rating or New badge (never show unreviewed defaults as 5-star)
        if (holder.tvFlowerRating != null) {
            if (flower.reviewCount > 0 && flower.avgRating > 0) {
                holder.tvFlowerRating.setText(String.format(Locale.US, "%.1f", flower.avgRating) + " (" + flower.reviewCount + ")");
                holder.tvFlowerRating.setTextColor(ContextCompat.getColor(context, R.color.gold_loyalty));
            } else {
                holder.tvFlowerRating.setText("New");
                holder.tvFlowerRating.setTextColor(ContextCompat.getColor(context, R.color.text_secondary));
            }
        }

        // Sold count / Fresh Harvest / Out of Stock social-proof
        if (holder.tvFlowerAvailable != null) {
            if (flower.available <= 0) {
                holder.tvFlowerAvailable.setText("• Out of Stock");
                holder.tvFlowerAvailable.setTextColor(ContextCompat.getColor(context, R.color.badge_dispatched_text));
            } else {
                holder.tvFlowerAvailable.setTextColor(ContextCompat.getColor(context, R.color.text_secondary));
                if (flower.soldCount > 0) {
                    holder.tvFlowerAvailable.setText("• " + flower.soldCount + " sold");
                } else {
                    holder.tvFlowerAvailable.setText("• Fresh Harvest");
                }
            }
        }

        // Bold Price per stem
        holder.tvFlowerPrice.setText("Rs. " + flower.price);

        // Cached, downsampled botanical flower photo with top focal crop for roses
        holder.ivFlowerImage.clearColorFilter();
        boolean isRose = flower.name != null
                && flower.name.toLowerCase(Locale.US).contains("rose")
                && !flower.name.toLowerCase(Locale.US).contains("tuberose");
        FlowerImageHelper.loadFlowerImage(
                holder.ivFlowerImage,
                context,
                FlowerImageHelper.getDrawableForFlower(flower.name),
                200,
                175,
                isRose,
                0.15f
        );

        // Wishlist Favorite state
        boolean isFav = WishlistManager.isFavorite(context, flower.name);
        updateFavIcon(holder.btnFlowerFav, isFav);

        holder.btnFlowerFav.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                AnimationUtilsHelper.playHeartBounce(holder.btnFlowerFav);
                boolean newState = WishlistManager.toggleFavorite(context, flower.name);
                updateFavIcon(holder.btnFlowerFav, newState);
                Toast.makeText(context, newState ? "Added " + flower.name + " to Wishlist" : "Removed " + flower.name + " from Wishlist", Toast.LENGTH_SHORT).show();
            }
        });

        // Tactile Press Scale on Card
        AnimationUtilsHelper.applyPressScale(holder.cardFlowerRoot);

        // Click to open Flower Detail Screen with Shared Element Hero Transition
        holder.cardFlowerRoot.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(context, FlowerDetailActivity.class);
                intent.putExtra("FLOWER_ID", flower.id);
                intent.putExtra("FLOWER_NAME", flower.name);
                intent.putExtra("FLOWER_CATEGORY", flower.category);
                intent.putExtra("FLOWER_PRICE", flower.price);
                intent.putExtra("FLOWER_AVAILABLE", flower.available);
                intent.putExtra("FLOWER_ICON", flower.icon);
                intent.putExtra("FLOWER_SOLD", flower.soldCount);
                intent.putExtra("FLOWER_RATING", flower.avgRating);
                intent.putExtra("FLOWER_REVIEWS", flower.reviewCount);

                if (context instanceof Activity) {
                    ActivityOptionsCompat options = ActivityOptionsCompat.makeSceneTransitionAnimation(
                            (Activity) context, holder.ivFlowerImage, "flower_hero_transition"
                    );
                    context.startActivity(intent, options.toBundle());
                } else {
                    context.startActivity(intent);
                }
            }
        });

        // Quick-Add Shopping Cart Action (Quick Add) with live stock guard
        if (holder.btnAddToCart != null) {
            if (flower.available <= 0) {
                holder.btnAddToCart.setEnabled(false);
                holder.btnAddToCart.setAlpha(0.45f);
                holder.btnAddToCart.setOnClickListener(null);
            } else {
                holder.btnAddToCart.setEnabled(true);
                holder.btnAddToCart.setAlpha(1f);
                AnimationUtilsHelper.applyPressScale(holder.btnAddToCart);
                holder.btnAddToCart.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        CartManager cartManager = CartManager.getInstance(context);
                        int existing = cartManager.getQuantityForFlower(flower.id);
                        if (existing + 1 > flower.available) {
                            Toast.makeText(context, "Only " + flower.available + " stems available for " + flower.name, Toast.LENGTH_SHORT).show();
                            return;
                        }
                        cartManager.addItem(new CartManager.CartItem(
                                flower.id,
                                flower.name,
                                flower.category,
                                flower.price,
                                1,
                                flower.name.toLowerCase(),
                                flower.available
                        ));
                        Toast.makeText(context, "Added " + flower.name + " to Cart!", Toast.LENGTH_SHORT).show();
                        if (context instanceof CustomerMainActivity) {
                            ((CustomerMainActivity) context).updateCartBadge();
                        }
                    }
                });
            }
        }

        // Hardware-Accelerated subtle 240ms Fade + 18dp Translation Entrance Animation
        animateCardEntrance(holder.itemView, position);
    }

    private void animateCardEntrance(View viewToAnimate, int position) {
        if (position > lastAnimatedPosition) {
            viewToAnimate.setAlpha(0f);
            viewToAnimate.setTranslationY(36f); // 18dp translation
            viewToAnimate.animate()
                    .alpha(1f)
                    .translationY(0f)
                    .setDuration(240)
                    .setInterpolator(entranceInterpolator)
                    .start();
            lastAnimatedPosition = position;
        }
    }

    private void updateFavIcon(ImageView btn, boolean isFav) {
        if (btn == null) return;
        btn.setImageResource(isFav ? R.drawable.ic_heart_filled : R.drawable.ic_heart_outline);
        btn.setColorFilter(ContextCompat.getColor(context, isFav ? R.color.accent_blossom_pink : R.color.text_hint));
    }

    @Override
    public int getItemCount() {
        return displayedList.size();
    }

    static class FlowerViewHolder extends RecyclerView.ViewHolder {
        CardView cardFlowerRoot;
        ImageView ivFlowerImage, btnFlowerFav;
        TextView tvFlowerName, tvFlowerRating, tvFlowerAvailable, tvFlowerPrice, btnAddToCart;

        FlowerViewHolder(View itemView) {
            super(itemView);
            cardFlowerRoot = itemView.findViewById(R.id.cardFlowerRoot);
            ivFlowerImage = itemView.findViewById(R.id.ivFlowerImage);
            btnFlowerFav = itemView.findViewById(R.id.btnFlowerFav);
            tvFlowerName = itemView.findViewById(R.id.tvFlowerName);
            tvFlowerRating = itemView.findViewById(R.id.tvFlowerRating);
            tvFlowerAvailable = itemView.findViewById(R.id.tvFlowerAvailable);
            tvFlowerPrice = itemView.findViewById(R.id.tvFlowerPrice);
            btnAddToCart = itemView.findViewById(R.id.btnAddToCart);
        }
    }
}
