package com.petalio.blossom;

import android.content.Context;
import android.content.SharedPreferences;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

/**
 * CartManager: Centralized manager for persistent dynamic shopping cart
 * across Browse, Flower Detail, Cart, and Payment screens.
 */
public class CartManager {

    private static final String PREF_NAME = "petalio_cart_prefs";
    private static final String KEY_CART_ITEMS = "cart_items_json";
    private static final String KEY_CART_ITEMS_PREFIX = "cart_items_json_";
    private static final String KEY_CART_ITEMS_GUEST = "cart_items_json_guest";
    private static final String KEY_INITIALIZED = "cart_is_initialized";

    private static CartManager instance;
    private final Context appContext;
    private final SharedPreferences prefs;
    private final Gson gson;

    public static class CartItem {
        private int flowerId;
        private String name;
        private String category;
        private int unitPrice;
        private int quantity;
        private String imageUrl;
        private int maxStock;

        public CartItem(int flowerId, String name, String category, int unitPrice, int quantity, String imageUrl) {
            this(flowerId, name, category, unitPrice, quantity, imageUrl, 0);
        }

        public CartItem(int flowerId, String name, String category, int unitPrice, int quantity, String imageUrl, int maxStock) {
            this.flowerId = flowerId;
            this.name = name;
            this.category = category;
            this.unitPrice = unitPrice;
            this.quantity = quantity;
            this.imageUrl = imageUrl;
            this.maxStock = Math.max(0, maxStock);
        }

        public int getFlowerId() { return flowerId; }
        public String getName() { return name != null ? name : "Flower"; }
        public String getCategory() { return category != null ? category : "Blossom"; }
        public int getUnitPrice() { return unitPrice; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        public String getImageUrl() { return imageUrl != null ? imageUrl : ""; }
        public int getMaxStock() { return maxStock; }
        public void setMaxStock(int maxStock) { this.maxStock = Math.max(0, maxStock); }
        public int getTotalPrice() { return unitPrice * quantity; }
    }

    private CartManager(Context context) {
        this.appContext = context.getApplicationContext();
        this.prefs = this.appContext.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        this.gson = new Gson();
        initDefaultsIfNeeded();
        cleanupLegacyMockItems();
    }

    public static synchronized CartManager getInstance(Context context) {
        if (instance == null) {
            instance = new CartManager(context);
        }
        return instance;
    }

    private int resolveActiveUserId() {
        int custId = PetalioUserPrefs.getCustomerId(appContext);
        return custId > 0 ? custId : PetalioUserPrefs.getUserId(appContext);
    }

    private String getScopedCartKey() {
        int userId = resolveActiveUserId();
        return userId > 0 ? (KEY_CART_ITEMS_PREFIX + userId) : KEY_CART_ITEMS_GUEST;
    }

    private void initDefaultsIfNeeded() {
        if (!prefs.getBoolean(KEY_INITIALIZED, false)) {
            // Cart starts clean and strictly dynamic
            prefs.edit().putBoolean(KEY_INITIALIZED, true).apply();
        }
    }

    private void cleanupLegacyMockItems() {
        if (!prefs.getBoolean("cart_legacy_mock_cleaned", false)) {
            prefs.edit()
                    .putBoolean("cart_legacy_mock_cleaned", true)
                    .remove(KEY_CART_ITEMS)
                    .apply();
        } else if (prefs.contains(KEY_CART_ITEMS)) {
            prefs.edit().remove(KEY_CART_ITEMS).apply();
        }
    }

    public synchronized List<CartItem> getItems() {
        if (resolveActiveUserId() <= 0) {
            return new ArrayList<>();
        }
        String json = prefs.getString(getScopedCartKey(), null);
        if (json == null || json.trim().isEmpty()) {
            return new ArrayList<>();
        }
        try {
            Type listType = new TypeToken<ArrayList<CartItem>>() {}.getType();
            List<CartItem> list = gson.fromJson(json, listType);
            return list != null ? list : new ArrayList<>();
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private synchronized void saveItems(List<CartItem> items) {
        if (resolveActiveUserId() <= 0) {
            prefs.edit().remove(KEY_CART_ITEMS_GUEST).remove(KEY_CART_ITEMS).apply();
            return;
        }
        String json = gson.toJson(items);
        prefs.edit().putString(getScopedCartKey(), json).apply();
    }

    public synchronized void addItem(CartItem newItem) {
        if (newItem == null || newItem.getQuantity() <= 0) return;
        List<CartItem> items = getItems();
        boolean found = false;
        for (CartItem item : items) {
            if (item.getFlowerId() == newItem.getFlowerId() ||
                    (item.getName() != null && item.getName().equalsIgnoreCase(newItem.getName()))) {
                int effectiveMax = newItem.getMaxStock() > 0 ? newItem.getMaxStock() : item.getMaxStock();
                if (effectiveMax > 0) {
                    item.setMaxStock(effectiveMax);
                }
                int desired = item.getQuantity() + newItem.getQuantity();
                item.setQuantity(effectiveMax > 0 ? Math.min(desired, effectiveMax) : desired);
                found = true;
                break;
            }
        }
        if (!found) {
            if (newItem.getMaxStock() > 0 && newItem.getQuantity() > newItem.getMaxStock()) {
                newItem.setQuantity(newItem.getMaxStock());
            }
            items.add(newItem);
        }
        saveItems(items);
    }

    public synchronized int getQuantityForFlower(int flowerId) {
        for (CartItem item : getItems()) {
            if (item.getFlowerId() == flowerId) {
                return item.getQuantity();
            }
        }
        return 0;
    }

    public synchronized void updateMaxStock(int flowerId, int availableStock) {
        List<CartItem> items = getItems();
        boolean changed = false;
        for (int i = items.size() - 1; i >= 0; i--) {
            CartItem item = items.get(i);
            if (item.getFlowerId() == flowerId) {
                item.setMaxStock(Math.max(0, availableStock));
                if (availableStock <= 0) {
                    items.remove(i);
                } else if (item.getQuantity() > availableStock) {
                    item.setQuantity(availableStock);
                }
                changed = true;
            }
        }
        if (changed) {
            saveItems(items);
        }
    }

    public synchronized void removeItem(int flowerId) {
        List<CartItem> items = getItems();
        for (int i = 0; i < items.size(); i++) {
            if (items.get(i).getFlowerId() == flowerId) {
                items.remove(i);
                break;
            }
        }
        saveItems(items);
    }

    public synchronized void removeItemByName(String name) {
        if (name == null) return;
        List<CartItem> items = getItems();
        for (int i = 0; i < items.size(); i++) {
            if (name.equalsIgnoreCase(items.get(i).getName())) {
                items.remove(i);
                break;
            }
        }
        saveItems(items);
    }

    public synchronized void updateQuantity(int flowerId, int quantity) {
        List<CartItem> items = getItems();
        if (quantity <= 0) {
            removeItem(flowerId);
            return;
        }
        for (CartItem item : items) {
            if (item.getFlowerId() == flowerId) {
                item.setQuantity(quantity);
                break;
            }
        }
        saveItems(items);
    }

    public synchronized int getTotalAmount() {
        int total = 0;
        for (CartItem item : getItems()) {
            total += item.getTotalPrice();
        }
        return total;
    }

    public synchronized int getTotalItemCount() {
        int count = 0;
        for (CartItem item : getItems()) {
            count += item.getQuantity();
        }
        return count;
    }

    public synchronized void clearCart() {
        SharedPreferences.Editor editor = prefs.edit()
                .remove(KEY_CART_ITEMS)
                .remove(KEY_CART_ITEMS_GUEST);
        int userId = resolveActiveUserId();
        if (userId > 0) {
            editor.remove(KEY_CART_ITEMS_PREFIX + userId);
        }
        editor.apply();
    }

    public synchronized void clearCartForUser(int userId) {
        if (userId <= 0) return;
        prefs.edit().remove(KEY_CART_ITEMS_PREFIX + userId).apply();
    }
}

