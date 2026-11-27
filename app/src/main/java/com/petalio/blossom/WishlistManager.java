package com.petalio.blossom;

import android.content.Context;
import android.content.SharedPreferences;

import androidx.annotation.NonNull;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.CommonResponse;
import com.petalio.blossom.network.WishlistRequest;
import com.petalio.blossom.network.WishlistResponse;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * WishlistManager: Persists and retrieves customer's saved flower favorites
 * strictly isolated per logged-in user_id across Browse, Flower Detail, and Wishlist screens
 * with dual persistence in SharedPreferences and live MySQL wishlists table.
 */
public class WishlistManager {

    private static final String PREF_NAME = "petalio_wishlist_prefs";
    private static final String KEY_WISHLIST_PREFIX = "wishlist_ids_";

    public static class FlowerItem {
        public int id;
        public String name;
        public String category;
        public int price;
        public int available;
        public String icon;
        public int soldCount = 0;
        public double avgRating = 0.0;
        public int reviewCount = 0;
        public String createdAt = "";

        public FlowerItem(int id, String name, String category, int price, int available, String icon) {
            this.id = id;
            this.name = name;
            this.category = category;
            this.price = price;
            this.available = available;
            this.icon = icon;
        }

        public FlowerItem(int id, String name, String category, int price, int available, String icon, int soldCount, double avgRating, int reviewCount, String createdAt) {
            this(id, name, category, price, available, icon);
            this.soldCount = soldCount;
            this.avgRating = (reviewCount > 0 && avgRating > 0) ? avgRating : 0.0;
            this.reviewCount = reviewCount;
            this.createdAt = createdAt != null ? createdAt : "";
        }

        public FlowerItem(String name, String category, int price, int available, String icon) {
            this(0, name, category, price, available, icon);
        }
    }

    private static SharedPreferences getPrefs(Context context) {
        return context.getApplicationContext().getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    private static int resolveActiveUserId(Context context) {
        if (context == null) return -1;
        int customerId = PetalioUserPrefs.getCustomerId(context);
        return customerId > 0 ? customerId : PetalioUserPrefs.getUserId(context);
    }

    private static String getScopedWishlistKey(int userId) {
        return KEY_WISHLIST_PREFIX + userId;
    }

    private static String normalizeFlowerKey(String flowerName) {
        return flowerName.trim().toLowerCase(Locale.ROOT).replace("'", "").replace(" ", "_");
    }

    private static Set<String> readScopedKeys(Context context, int userId) {
        Set<String> stored = getPrefs(context).getStringSet(getScopedWishlistKey(userId), null);
        return stored != null ? new HashSet<>(stored) : new HashSet<>();
    }

    public static boolean isFavorite(Context context, String flowerName) {
        if (context == null || flowerName == null || flowerName.trim().isEmpty()) return false;
        int userId = resolveActiveUserId(context);
        if (userId <= 0) return false;
        String itemKey = normalizeFlowerKey(flowerName);
        return readScopedKeys(context, userId).contains(itemKey);
    }

    public static void setFavorite(Context context, String flowerName, boolean isFav) {
        setFavorite(context, 0, flowerName, isFav);
    }

    public static void setFavorite(Context context, int flowerId, String flowerName, boolean isFav) {
        if (context == null || flowerName == null || flowerName.trim().isEmpty()) return;
        final int userId = resolveActiveUserId(context);
        if (userId <= 0) return;
        String itemKey = normalizeFlowerKey(flowerName);
        Set<String> keys = readScopedKeys(context, userId);
        if (isFav) {
            keys.add(itemKey);
        } else {
            keys.remove(itemKey);
        }
        getPrefs(context).edit().putStringSet(getScopedWishlistKey(userId), keys).apply();

        // Asynchronously synchronize with MySQL wishlists table
        final Context appCtx = context.getApplicationContext();
        try {
            ApiClient.getApiService(appCtx)
                    .toggleWishlist(new WishlistRequest(userId, flowerId, flowerName, isFav))
                    .enqueue(new Callback<CommonResponse>() {
                        @Override
                        public void onResponse(@NonNull Call<CommonResponse> call, @NonNull Response<CommonResponse> response) {}
                        @Override
                        public void onFailure(@NonNull Call<CommonResponse> call, @NonNull Throwable t) {}
                    });
        } catch (Exception ignored) {}
    }

    public static boolean toggleFavorite(Context context, String flowerName) {
        return toggleFavorite(context, 0, flowerName);
    }

    public static boolean toggleFavorite(Context context, int flowerId, String flowerName) {
        if (context == null || flowerName == null || flowerName.trim().isEmpty()) return false;
        int userId = resolveActiveUserId(context);
        if (userId <= 0) return false;
        boolean newState = !isFavorite(context, flowerName);
        setFavorite(context, flowerId, flowerName, newState);
        return newState;
    }

    public static void syncWithServer(Context context, Runnable onComplete) {
        if (context == null) {
            if (onComplete != null) onComplete.run();
            return;
        }
        final int userId = resolveActiveUserId(context);
        if (userId <= 0) {
            if (onComplete != null) onComplete.run();
            return;
        }
        final Context appCtx = context.getApplicationContext();
        ApiClient.getApiService(appCtx).getWishlist(userId).enqueue(new Callback<WishlistResponse>() {
            @Override
            public void onResponse(@NonNull Call<WishlistResponse> call, @NonNull Response<WishlistResponse> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    List<String> names = response.body().getFlowerNames();
                    if (names != null) {
                        Set<String> serverKeys = new HashSet<>();
                        for (String n : names) {
                            if (n != null && !n.trim().isEmpty()) {
                                serverKeys.add(normalizeFlowerKey(n));
                            }
                        }
                        getPrefs(appCtx).edit().putStringSet(getScopedWishlistKey(userId), serverKeys).apply();
                    }
                }
                if (onComplete != null) onComplete.run();
            }

            @Override
            public void onFailure(@NonNull Call<WishlistResponse> call, @NonNull Throwable t) {
                if (onComplete != null) onComplete.run();
            }
        });
    }

    public static void clearForCurrentUser(Context context) {
        int userId = resolveActiveUserId(context);
        if (context == null || userId <= 0) return;
        getPrefs(context).edit().remove(getScopedWishlistKey(userId)).apply();
    }
}
