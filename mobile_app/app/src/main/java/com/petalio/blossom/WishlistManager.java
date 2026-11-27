package com.petalio.blossom;

import android.content.Context;
import android.content.SharedPreferences;

import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

/**
 * WishlistManager: Persists and retrieves customer's saved flower favorites
 * strictly isolated per logged-in user_id across Browse, Flower Detail, and Wishlist screens.
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
        if (context == null || flowerName == null || flowerName.trim().isEmpty()) return;
        int userId = resolveActiveUserId(context);
        if (userId <= 0) return;
        String itemKey = normalizeFlowerKey(flowerName);
        Set<String> keys = readScopedKeys(context, userId);
        if (isFav) {
            keys.add(itemKey);
        } else {
            keys.remove(itemKey);
        }
        getPrefs(context).edit().putStringSet(getScopedWishlistKey(userId), keys).apply();
    }

    public static boolean toggleFavorite(Context context, String flowerName) {
        if (context == null || flowerName == null || flowerName.trim().isEmpty()) return false;
        int userId = resolveActiveUserId(context);
        if (userId <= 0) return false;
        boolean newState = !isFavorite(context, flowerName);
        setFavorite(context, flowerName, newState);
        return newState;
    }

    public static void clearForCurrentUser(Context context) {
        int userId = resolveActiveUserId(context);
        if (context == null || userId <= 0) return;
        getPrefs(context).edit().remove(getScopedWishlistKey(userId)).apply();
    }
}
