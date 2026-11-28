package com.petalio.blossom;

import android.content.Intent;
import android.os.Bundle;
import android.view.MenuItem;

import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;

import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.navigation.NavigationBarView;

/**
 * SupplierMainActivity: Hosts 5 executive supplier tabs matching the modern navigation experience:
 * S1. Home (Approval status & overview)
 * S2. Orders (Order requests accept/reject & fulfilment)
 * S3. Stock (Supply, estimates & harvest records)
 * S4. Demand (Demand forecast & completed payments)
 * S5. Profile (Estate profile, capacity, settings & logout)
 */
public class SupplierMainActivity extends AppCompatActivity {

    private BottomNavigationView supplierBottomNav;
    private int currentTabIndex = -1;
    private int pendingOrdersFilter = SupplierOrdersFragment.FILTER_NEW_REQUESTS;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if ("SUPPLIER".equalsIgnoreCase(PetalioUserPrefs.getUserRole(this)) && !PetalioUserPrefs.isSupplierApproved(this)) {
            redirectToPendingApprovalGate();
            return;
        }
        setContentView(R.layout.activity_supplier_main);

        initViews();
        setupNavigation();

        int targetTab = getIntent().getIntExtra("target_tab", getIntent().getIntExtra("TARGET_TAB", 0));
        if (getIntent().hasExtra("ORDER_FILTER")) {
            pendingOrdersFilter = getIntent().getIntExtra("ORDER_FILTER", SupplierOrdersFragment.FILTER_NEW_REQUESTS);
        }
        switchTab(targetTab);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if ("SUPPLIER".equalsIgnoreCase(PetalioUserPrefs.getUserRole(this)) && !PetalioUserPrefs.isSupplierApproved(this)) {
            redirectToPendingApprovalGate();
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        if ("SUPPLIER".equalsIgnoreCase(PetalioUserPrefs.getUserRole(this)) && !PetalioUserPrefs.isSupplierApproved(this)) {
            redirectToPendingApprovalGate();
            return;
        }
        setIntent(intent);
        int targetTab = intent.getIntExtra("target_tab", intent.getIntExtra("TARGET_TAB", 0));
        if (intent.hasExtra("ORDER_FILTER")) {
            pendingOrdersFilter = intent.getIntExtra("ORDER_FILTER", SupplierOrdersFragment.FILTER_NEW_REQUESTS);
        }
        switchTab(targetTab);
    }

    private void initViews() {
        supplierBottomNav = findViewById(R.id.supplierBottomNav);
    }

    private void setupNavigation() {
        if (supplierBottomNav != null) {
            supplierBottomNav.setOnItemSelectedListener(new NavigationBarView.OnItemSelectedListener() {
                @Override
                public boolean onNavigationItemSelected(MenuItem item) {
                    int id = item.getItemId();
                    if (id == R.id.nav_supplier_home) {
                        loadFragment(new SupplierHomeFragment(), 0);
                        return true;
                    } else if (id == R.id.nav_supplier_orders) {
                        int filter = pendingOrdersFilter;
                        pendingOrdersFilter = SupplierOrdersFragment.FILTER_NEW_REQUESTS;
                        loadFragment(SupplierOrdersFragment.newInstance(filter), 1);
                        return true;
                    } else if (id == R.id.nav_supplier_stock) {
                        loadFragment(new SupplierStockFragment(), 2);
                        return true;
                    } else if (id == R.id.nav_supplier_demand) {
                        loadFragment(new SupplierDemandFragment(), 3);
                        return true;
                    } else if (id == R.id.nav_supplier_profile) {
                        loadFragment(new SupplierProfileFragment(), 4);
                        return true;
                    }
                    return false;
                }
            });
        }
    }

    private void loadFragment(Fragment fragment, int tabIndex) {
        if (isFinishing() || isDestroyed()) return;
        if (currentTabIndex == tabIndex) return;
        currentTabIndex = tabIndex;

        FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
        transaction.setCustomAnimations(R.anim.fade_in_fast, R.anim.fade_out_fast);
        transaction.replace(R.id.supplierFragmentContainer, fragment);
        transaction.commitAllowingStateLoss();
    }

    public void openOrdersWithFilter(int filter) {
        if (isFinishing() || isDestroyed()) return;
        pendingOrdersFilter = filter;
        if (currentTabIndex == 1) {
            Fragment current = getSupportFragmentManager().findFragmentById(R.id.supplierFragmentContainer);
            if (current instanceof SupplierOrdersFragment) {
                ((SupplierOrdersFragment) current).setOrderFilter(filter);
                pendingOrdersFilter = SupplierOrdersFragment.FILTER_NEW_REQUESTS;
                return;
            }
        }
        switchTab(1);
    }

    public void switchTab(int index) {
        if (isFinishing() || isDestroyed()) return;

        if (supplierBottomNav != null) {
            switch (index) {
                case 1:
                    supplierBottomNav.setSelectedItemId(R.id.nav_supplier_orders);
                    break;
                case 2:
                    supplierBottomNav.setSelectedItemId(R.id.nav_supplier_stock);
                    break;
                case 3:
                    supplierBottomNav.setSelectedItemId(R.id.nav_supplier_demand);
                    break;
                case 4:
                    supplierBottomNav.setSelectedItemId(R.id.nav_supplier_profile);
                    break;
                case 0:
                default:
                    supplierBottomNav.setSelectedItemId(R.id.nav_supplier_home);
                    break;
            }
        } else {
            Fragment selected;
            switch (index) {
                case 1: selected = new SupplierOrdersFragment(); break;
                case 2: selected = new SupplierStockFragment(); break;
                case 3: selected = new SupplierDemandFragment(); break;
                case 4: selected = new SupplierProfileFragment(); break;
                case 0:
                default: selected = new SupplierHomeFragment(); break;
            }
            loadFragment(selected, index);
        }
    }

    private void redirectToPendingApprovalGate() {
        Intent intent = new Intent(this, SupplierApprovalStatusActivity.class);
        String code = PetalioUserPrefs.getSupplierCode(this);
        intent.putExtra("SUPPLIER_ID", !code.isEmpty() ? code : String.valueOf(PetalioUserPrefs.getSupplierId(this)));
        intent.putExtra("FARM_NAME", PetalioUserPrefs.getSupplierName(this));
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}
