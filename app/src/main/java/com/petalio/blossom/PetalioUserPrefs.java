package com.petalio.blossom;

import android.content.Context;
import android.content.SharedPreferences;

public class PetalioUserPrefs {
    public static final String PREFS_NAME = "PetalioUserPrefs";
    public static final String KEY_USER_ID = "USER_ID";
    public static final String KEY_USER_NAME = "USER_NAME";
    public static final String KEY_USER_EMAIL = "USER_EMAIL";
    public static final String KEY_USER_PHONE = "USER_PHONE";
    public static final String KEY_USER_ROLE = "USER_ROLE";
    public static final String KEY_USER_ADDRESS = "USER_ADDRESS";
    public static final String KEY_USER_CITY = "USER_CITY";
    public static final String KEY_AVATAR_URI = "PROFILE_AVATAR_URI";
    public static final String KEY_SUPPLIER_ID = "SUPPLIER_ID";
    public static final String KEY_CUSTOMER_ID = "CUSTOMER_ID";
    public static final String KEY_SUPPLIER_CODE = "SUPPLIER_CODE";
    public static final String KEY_SUPPLIER_NAME = "SUPPLIER_NAME";
    public static final String KEY_CONTACT_PERSON = "CONTACT_PERSON";
    public static final String KEY_MONTHLY_CAPACITY = "MONTHLY_CAPACITY";
    public static final String KEY_SUPPLIER_APPROVED = "SUPPLIER_APPROVED";

    private static SharedPreferences getPrefs(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public static boolean isLoggedIn(Context context) {
        if (context == null) return false;
        return getUserId(context) > 0;
    }

    public static int getUserId(Context context) {
        if (context == null) return -1;
        return getPrefs(context).getInt(KEY_USER_ID, -1);
    }

    public static int getCustomerId(Context context) {
        if (context == null) return -1;
        SharedPreferences prefs = getPrefs(context);
        int customerId = prefs.getInt(KEY_CUSTOMER_ID, -1);
        if (customerId > 0) return customerId;
        String role = prefs.getString(KEY_USER_ROLE, "");
        if (!"SUPPLIER".equalsIgnoreCase(role)) {
            int uid = prefs.getInt(KEY_USER_ID, -1);
            if (uid > 0) return uid;
        }
        return -1;
    }

    public static int getSupplierId(Context context) {
        if (context == null) return -1;
        SharedPreferences prefs = getPrefs(context);
        int supplierId = prefs.getInt(KEY_SUPPLIER_ID, -1);
        if (supplierId > 0) return supplierId;
        if ("SUPPLIER".equalsIgnoreCase(prefs.getString(KEY_USER_ROLE, ""))) {
            return prefs.getInt(KEY_USER_ID, -1);
        }
        return -1;
    }

    public static String getSupplierCode(Context context) {
        if (context == null) return "";
        return getPrefs(context).getString(KEY_SUPPLIER_CODE, "");
    }

    public static String getSupplierName(Context context) {
        if (context == null) return "";
        return getPrefs(context).getString(KEY_SUPPLIER_NAME, "");
    }

    public static String getContactPerson(Context context) {
        if (context == null) return "";
        return getPrefs(context).getString(KEY_CONTACT_PERSON, "");
    }

    public static int getMonthlyCapacity(Context context) {
        if (context == null) return 0;
        return getPrefs(context).getInt(KEY_MONTHLY_CAPACITY, 0);
    }

    public static boolean isSupplierApproved(Context context) {
        if (context == null) return false;
        return getPrefs(context).getBoolean(KEY_SUPPLIER_APPROVED, false);
    }

    public static void setSupplierApproved(Context context, boolean approved) {
        if (context == null) return;
        getPrefs(context).edit().putBoolean(KEY_SUPPLIER_APPROVED, approved).apply();
    }

    public static String getUserName(Context context) {
        if (context == null) return "";
        return getPrefs(context).getString(KEY_USER_NAME, "");
    }

    public static String getUserEmail(Context context) {
        if (context == null) return "";
        return getPrefs(context).getString(KEY_USER_EMAIL, "");
    }

    public static String getUserPhone(Context context) {
        if (context == null) return "";
        return getPrefs(context).getString(KEY_USER_PHONE, "");
    }

    public static String getUserRole(Context context) {
        if (context == null) return "CUSTOMER";
        return getPrefs(context).getString(KEY_USER_ROLE, "CUSTOMER");
    }

    public static String getUserAddress(Context context) {
        if (context == null) return "";
        return getPrefs(context).getString(KEY_USER_ADDRESS, "");
    }

    public static String getUserCity(Context context) {
        if (context == null) return "";
        return getPrefs(context).getString(KEY_USER_CITY, "");
    }

    public static void saveUserInfo(Context context, int userId, String name, String email, String phone, String role, String address, String city) {
        if (context == null) return;
        String normalizedRole = (role != null && !role.trim().isEmpty()) ? role : "CUSTOMER";
        SharedPreferences.Editor editor = getPrefs(context).edit()
                .putInt(KEY_USER_ID, userId)
                .putString(KEY_USER_NAME, name != null ? name : "")
                .putString(KEY_USER_EMAIL, email != null ? email : "")
                .putString(KEY_USER_PHONE, phone != null ? phone : "")
                .putString(KEY_USER_ROLE, normalizedRole)
                .putString(KEY_USER_ADDRESS, address != null ? address : "")
                .putString(KEY_USER_CITY, city != null ? city : "");
        if ("SUPPLIER".equalsIgnoreCase(normalizedRole)) {
            editor.remove(KEY_CUSTOMER_ID);
        } else {
            editor.putInt(KEY_CUSTOMER_ID, userId)
                    .remove(KEY_SUPPLIER_ID)
                    .remove(KEY_SUPPLIER_CODE)
                    .remove(KEY_SUPPLIER_NAME)
                    .remove(KEY_CONTACT_PERSON)
                    .remove(KEY_MONTHLY_CAPACITY)
                    .remove(KEY_SUPPLIER_APPROVED);
        }
        editor.apply();
    }

    public static void saveCustomerInfo(Context context, int userId, int customerId, String name, String email, String phone, String address, String city) {
        if (context == null) return;
        int resolvedUserId = userId > 0 ? userId : customerId;
        int resolvedCustId = customerId > 0 ? customerId : userId;
        getPrefs(context).edit()
                .putInt(KEY_USER_ID, resolvedUserId)
                .putInt(KEY_CUSTOMER_ID, resolvedCustId)
                .putString(KEY_USER_NAME, name != null ? name : "")
                .putString(KEY_USER_EMAIL, email != null ? email : "")
                .putString(KEY_USER_PHONE, phone != null ? phone : "")
                .putString(KEY_USER_ROLE, "CUSTOMER")
                .putString(KEY_USER_ADDRESS, address != null ? address : "")
                .putString(KEY_USER_CITY, city != null ? city : "")
                .remove(KEY_SUPPLIER_ID)
                .remove(KEY_SUPPLIER_CODE)
                .remove(KEY_SUPPLIER_NAME)
                .remove(KEY_CONTACT_PERSON)
                .remove(KEY_MONTHLY_CAPACITY)
                .remove(KEY_SUPPLIER_APPROVED)
                .apply();
    }

    public static void saveSupplierInfo(Context context, int supplierId, String supplierCode, String supplierName,
                                        String contactPerson, String email, String phone, String city,
                                        String address, int monthlyCapacity) {
        saveSupplierInfo(context, supplierId, supplierCode, supplierName, contactPerson, email, phone, city, address, monthlyCapacity, true);
    }

    public static void saveSupplierInfo(Context context, int supplierId, String supplierCode, String supplierName,
                                        String contactPerson, String email, String phone, String city,
                                        String address, int monthlyCapacity, boolean isApproved) {
        if (context == null) return;
        getPrefs(context).edit()
                .putInt(KEY_USER_ID, supplierId)
                .putInt(KEY_SUPPLIER_ID, supplierId)
                .remove(KEY_CUSTOMER_ID)
                .putString(KEY_SUPPLIER_CODE, supplierCode != null ? supplierCode : "")
                .putString(KEY_SUPPLIER_NAME, supplierName != null ? supplierName : "")
                .putString(KEY_CONTACT_PERSON, contactPerson != null ? contactPerson : "")
                .putString(KEY_USER_NAME, contactPerson != null && !contactPerson.isEmpty() ? contactPerson : (supplierName != null ? supplierName : ""))
                .putString(KEY_USER_EMAIL, email != null ? email : "")
                .putString(KEY_USER_PHONE, phone != null ? phone : "")
                .putString(KEY_USER_ROLE, "SUPPLIER")
                .putString(KEY_USER_CITY, city != null ? city : "")
                .putString(KEY_USER_ADDRESS, address != null ? address : "")
                .putInt(KEY_MONTHLY_CAPACITY, monthlyCapacity)
                .putBoolean(KEY_SUPPLIER_APPROVED, isApproved)
                .apply();
    }

    public static String getScopedString(Context context, String baseKey, int userId, String fallback) {
        if (context == null || userId <= 0 || baseKey == null) return fallback;
        return getPrefs(context).getString(baseKey + "_" + userId, fallback);
    }

    public static void putScopedString(Context context, String baseKey, int userId, String value) {
        if (context == null || userId <= 0 || baseKey == null) return;
        getPrefs(context).edit().putString(baseKey + "_" + userId, value).apply();
    }

    public static void clear(Context context) {
        if (context == null) return;
        getPrefs(context).edit().clear().apply();
    }
}
