package com.petalio.blossom;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;

/**
 * CustomerMainActivity: Hosts 4 tabs (Browse, Cart, Orders, Profile) using show/hide
 * to keep Browse warm in memory without fragment recreation lag.
 */
public class CustomerMainActivity extends AppCompatActivity {

    private static final String TAG_BROWSE = "tab_browse";
    private static final String TAG_CART = "tab_cart";
    private static final String TAG_ORDERS = "tab_orders";
    private static final String TAG_PROFILE = "tab_profile";
    private static final String[] TAB_TAGS = {TAG_BROWSE, TAG_CART, TAG_ORDERS, TAG_PROFILE};
    private static final String KEY_CURRENT_TAB = "CURRENT_TAB";

    private LinearLayout navTabBrowse, navTabCart, navTabOrders, navTabProfile;
    private TextView tvNavBrowse, tvNavCart, tvNavOrders, tvNavProfile;
    private TextView badgeNavCart;
    private android.widget.ImageView ivNavBrowse, ivNavCart, ivNavOrders, ivNavProfile;
    private int currentTabIndex = -1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (!ensureCustomerSession()) return;
        setContentView(R.layout.activity_customer_main);

        initViews();
        setupNavigation();

        int targetTab = getIntent().getIntExtra("TARGET_TAB", getIntent().getIntExtra("target_tab", 0));
        if (savedInstanceState != null && !getIntent().hasExtra("TARGET_TAB") && !getIntent().hasExtra("target_tab")) {
            targetTab = savedInstanceState.getInt(KEY_CURRENT_TAB, targetTab);
        }
        switchTab(targetTab);
        updateCartBadge();

        if (getIntent().getBooleanExtra("OPEN_NOTIFICATIONS", false)) {
            getWindow().getDecorView().post(() -> {
                Fragment browse = getSupportFragmentManager().findFragmentByTag(TAG_BROWSE);
                if (browse instanceof BrowseFragment) {
                    ((BrowseFragment) browse).showOrderNotificationsBottomSheet();
                }
            });
        }
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putInt(KEY_CURRENT_TAB, Math.max(0, currentTabIndex));
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (!ensureCustomerSession()) return;
        updateCartBadge();
    }

    private boolean ensureCustomerSession() {
        int customerId = PetalioUserPrefs.getCustomerId(this);
        if (!PetalioUserPrefs.isLoggedIn(this) || customerId <= 0 || "SUPPLIER".equalsIgnoreCase(PetalioUserPrefs.getUserRole(this))) {
            Intent intent = new Intent(this, LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
            return false;
        }
        return true;
    }

    public void updateCartBadge() {
        if (badgeNavCart != null) {
            int count = CartManager.getInstance(this).getTotalItemCount();
            if (count > 0) {
                boolean wasHidden = badgeNavCart.getVisibility() != View.VISIBLE;
                String newText = String.valueOf(count);
                boolean changed = !newText.equals(badgeNavCart.getText().toString());
                badgeNavCart.setVisibility(View.VISIBLE);
                badgeNavCart.setText(newText);
                badgeNavCart.setMaxLines(1);
                badgeNavCart.setSingleLine(true);

                if (wasHidden || changed) {
                    AnimationUtilsHelper.playBadgePop(badgeNavCart);
                }
            } else {
                badgeNavCart.setVisibility(View.GONE);
            }
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        int targetTab = intent.getIntExtra("TARGET_TAB", intent.getIntExtra("target_tab", 0));
        switchTab(targetTab);

        if (intent.getBooleanExtra("OPEN_NOTIFICATIONS", false)) {
            getWindow().getDecorView().post(() -> {
                Fragment browse = getSupportFragmentManager().findFragmentByTag(TAG_BROWSE);
                if (browse instanceof BrowseFragment) {
                    ((BrowseFragment) browse).showOrderNotificationsBottomSheet();
                }
            });
        }
    }

    private void initViews() {
        navTabBrowse = findViewById(R.id.navTabBrowse);
        navTabCart = findViewById(R.id.navTabCart);
        navTabOrders = findViewById(R.id.navTabOrders);
        navTabProfile = findViewById(R.id.navTabProfile);

        tvNavBrowse = findViewById(R.id.tvNavBrowse);
        tvNavCart = findViewById(R.id.tvNavCart);
        tvNavOrders = findViewById(R.id.tvNavOrders);
        tvNavProfile = findViewById(R.id.tvNavProfile);

        ivNavBrowse = findViewById(R.id.ivNavBrowse);
        ivNavCart = findViewById(R.id.ivNavCart);
        badgeNavCart = findViewById(R.id.badgeNavCart);
        ivNavOrders = findViewById(R.id.ivNavOrders);
        ivNavProfile = findViewById(R.id.ivNavProfile);
    }

    private void setupNavigation() {
        AnimationUtilsHelper.applyPressScale(navTabBrowse);
        AnimationUtilsHelper.applyPressScale(navTabCart);
        AnimationUtilsHelper.applyPressScale(navTabOrders);
        AnimationUtilsHelper.applyPressScale(navTabProfile);

        navTabBrowse.setOnClickListener(v -> switchTab(0));
        navTabCart.setOnClickListener(v -> switchTab(1));
        navTabOrders.setOnClickListener(v -> switchTab(2));
        navTabProfile.setOnClickListener(v -> switchTab(3));
    }

    public void switchTab(int index) {
        if (isFinishing() || isDestroyed()) return;
        int normalizedIndex = (index >= 0 && index < TAB_TAGS.length) ? index : 0;

        int inactiveColor = ContextCompat.getColor(this, R.color.text_secondary);
        int activeColor = ContextCompat.getColor(this, R.color.primary_forest);

        TextView[] navLabels = {tvNavBrowse, tvNavCart, tvNavOrders, tvNavProfile};
        android.widget.ImageView[] navIcons = {ivNavBrowse, ivNavCart, ivNavOrders, ivNavProfile};
        for (int i = 0; i < TAB_TAGS.length; i++) {
            boolean active = (i == normalizedIndex);
            if (navLabels[i] != null) navLabels[i].setTextColor(active ? activeColor : inactiveColor);
            if (navIcons[i] != null) navIcons[i].setColorFilter(active ? activeColor : inactiveColor);
        }

        FragmentManager fm = getSupportFragmentManager();
        String targetTag = TAB_TAGS[normalizedIndex];
        Fragment targetFragment = fm.findFragmentByTag(targetTag);

        if (currentTabIndex == normalizedIndex && targetFragment != null && !targetFragment.isHidden()) {
            if (normalizedIndex == 2 && getIntent().getBooleanExtra("SHOW_HISTORY", false) && targetFragment instanceof OrdersFragment) {
                ((OrdersFragment) targetFragment).openHistoryTab();
            }
            return;
        }

        FragmentTransaction transaction = fm.beginTransaction();
        if (targetFragment == null) {
            targetFragment = createFragmentForIndex(normalizedIndex);
            transaction.add(R.id.customerFragmentContainer, targetFragment, targetTag);
        } else {
            if (normalizedIndex == 2 && getIntent().getBooleanExtra("SHOW_HISTORY", false) && targetFragment instanceof OrdersFragment) {
                ((OrdersFragment) targetFragment).openHistoryTab();
            }
            if (targetFragment.isHidden()) {
                transaction.show(targetFragment);
            }
        }

        for (int i = 0; i < TAB_TAGS.length; i++) {
            if (i == normalizedIndex) continue;
            Fragment other = fm.findFragmentByTag(TAB_TAGS[i]);
            if (other != null && !other.isHidden()) {
                transaction.hide(other);
            }
        }

        currentTabIndex = normalizedIndex;
        transaction.commitAllowingStateLoss();
    }

    private Fragment createFragmentForIndex(int index) {
        switch (index) {
            case 1:
                return new CartFragment();
            case 2:
                OrdersFragment orders = new OrdersFragment();
                if (getIntent().getBooleanExtra("SHOW_HISTORY", false)) {
                    Bundle b = new Bundle();
                    b.putBoolean("SHOW_HISTORY", true);
                    orders.setArguments(b);
                }
                return orders;
            case 3:
                return new ProfileFragment();
            case 0:
            default:
                BrowseFragment browse = new BrowseFragment();
                if (getIntent().getBooleanExtra("OPEN_NOTIFICATIONS", false)) {
                    Bundle b = new Bundle();
                    b.putBoolean("OPEN_NOTIFICATIONS", true);
                    browse.setArguments(b);
                }
                return browse;
        }
    }
}
