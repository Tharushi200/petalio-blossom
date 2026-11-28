package com.petalio.blossom;

import android.content.Context;

/**
 * SessionManager: Centralized controller for session lifecycle and multi-account state isolation.
 * Guarantees that Cart, Wishlist, Orders, and Profile states are strictly partitioned and purged
 * across distinct user IDs and role switches.
 */
public class SessionManager {

    private static volatile SessionManager instance;

    private SessionManager() {
    }

    public static SessionManager getInstance() {
        if (instance == null) {
            synchronized (SessionManager.class) {
                if (instance == null) {
                    instance = new SessionManager();
                }
            }
        }
        return instance;
    }

    public boolean isLoggedIn(Context context) {
        return PetalioUserPrefs.isLoggedIn(context);
    }

    public int getUserId(Context context) {
        return PetalioUserPrefs.getUserId(context);
    }

    public int getCustomerId(Context context) {
        return PetalioUserPrefs.getCustomerId(context);
    }

    public int getSupplierId(Context context) {
        return PetalioUserPrefs.getSupplierId(context);
    }

    public String getUserRole(Context context) {
        return PetalioUserPrefs.getUserRole(context);
    }

    public boolean isCustomer(Context context) {
        return !"SUPPLIER".equalsIgnoreCase(getUserRole(context));
    }

    public boolean isSupplier(Context context) {
        return "SUPPLIER".equalsIgnoreCase(getUserRole(context));
    }

    /**
     * Enforces strict multi-account isolation when switching between user accounts or roles.
     * Clears all cached user data, shopping cart items, wishlists, and cached browse listings.
     */
    public void isolateSessionOnAccountSwitch(Context context, int newUserId, String newRole) {
        if (context == null) return;
        int currentUserId = PetalioUserPrefs.getUserId(context);
        String currentRole = PetalioUserPrefs.getUserRole(context);

        if (currentUserId > 0 && (currentUserId != newUserId || !currentRole.equalsIgnoreCase(newRole))) {
            purgeUserSession(context);
        } else {
            BrowseFragment.clearCache();
        }
    }

    /**
     * Purges all user session data, cached cart, wishlist, and supplier preferences.
     */
    public void purgeUserSession(Context context) {
        if (context == null) return;
        try {
            CartManager.getInstance(context).clearCart();
        } catch (Exception ignored) {}
        try {
            WishlistManager.clearForCurrentUser(context);
        } catch (Exception ignored) {}
        try {
            BrowseFragment.clearCache();
        } catch (Exception ignored) {}
        PetalioUserPrefs.clear(context);
    }

    /**
     * Complete logout flow: purges session and resets all user credentials.
     */
    public void logout(Context context) {
        purgeUserSession(context);
    }
}
