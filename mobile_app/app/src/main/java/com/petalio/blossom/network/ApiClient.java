package com.petalio.blossom.network;

import android.content.Context;
import android.content.SharedPreferences;

import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

/**
 * ApiClient: Centralized Retrofit client connecting Petalio Blossom Android App
 * to the Node.js Express backend (connected to MySQL 'petalio_blossom').
 */
public class ApiClient {

    // Default to USB reverse port (127.0.0.1). Also supports local Wi-Fi IP override
    public static final String DEFAULT_SERVER_IP = "127.0.0.1";
    public static final String DEFAULT_PORT = "5000";
    public static final String DEFAULT_BASE_URL = "http://" + DEFAULT_SERVER_IP + ":" + DEFAULT_PORT + "/api/";

    // Android Emulator loopback alias (if running on emulator instead of physical
    // phone)
    public static final String EMULATOR_BASE_URL = "http://10.0.2.2:5000/api/";

    private static Retrofit retrofit = null;

    public static boolean isEmulator() {
        return android.os.Build.FINGERPRINT.startsWith("generic")
                || android.os.Build.FINGERPRINT.startsWith("unknown")
                || android.os.Build.MODEL.contains("google_sdk")
                || android.os.Build.MODEL.contains("Emulator")
                || android.os.Build.MODEL.contains("Android SDK built for x86")
                || android.os.Build.HARDWARE.contains("goldfish")
                || android.os.Build.HARDWARE.contains("ranchu")
                || android.os.Build.MANUFACTURER.contains("Genymotion")
                || android.os.Build.PRODUCT.contains("sdk");
    }

    public static String getBaseUrl(Context context) {
        String defaultIp = isEmulator() ? "10.0.2.2" : DEFAULT_SERVER_IP;
        if (context != null) {
            SharedPreferences prefs = context.getSharedPreferences("PetalioApiPrefs", Context.MODE_PRIVATE);
            String savedIp = prefs.getString("SERVER_IP", null);
            // Auto-heal old virtual adapter IPs
            if (savedIp == null || savedIp.equals("192.168.57.133")) {
                savedIp = defaultIp;
                prefs.edit().putString("SERVER_IP", savedIp).apply();
            }
            return "http://" + savedIp + ":" + DEFAULT_PORT + "/api/";
        }
        return "http://" + defaultIp + ":" + DEFAULT_PORT + "/api/";
    }

    public static void updateServerIp(Context context, String newIp) {
        if (context != null && newIp != null && !newIp.isEmpty()) {
            SharedPreferences prefs = context.getSharedPreferences("PetalioApiPrefs", Context.MODE_PRIVATE);
            prefs.edit().putString("SERVER_IP", newIp.trim()).apply();
            retrofit = null; // force re-initialization
        }
    }

    public static Retrofit getClient(Context context) {
        if (retrofit == null) {
            OkHttpClient okHttpClient = new OkHttpClient.Builder()
                    .connectTimeout(5, TimeUnit.SECONDS)
                    .readTimeout(8, TimeUnit.SECONDS)
                    .writeTimeout(8, TimeUnit.SECONDS)
                    .retryOnConnectionFailure(true)
                    .build();

            retrofit = new Retrofit.Builder()
                    .baseUrl(getBaseUrl(context))
                    .client(okHttpClient)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit;
    }

    public static ApiService getApiService(Context context) {
        return getClient(context).create(ApiService.class);
    }

    /**
     * Extract user-facing message from Retrofit non-2xx errorBody JSON or body.
     */
    public static String extractErrorMessage(retrofit2.Response<?> response, String fallback) {
        if (response != null) {
            try {
                if (response.errorBody() != null) {
                    String raw = response.errorBody().string();
                    if (raw != null && !raw.trim().isEmpty()) {
                        org.json.JSONObject obj = new org.json.JSONObject(raw);
                        String msg = obj.optString("message", "");
                        if (msg.trim().isEmpty()) {
                            msg = obj.optString("error", "");
                        }
                        if (!msg.trim().isEmpty()) {
                            return msg.trim();
                        }
                    }
                }
            } catch (Exception ignored) {}
        }
        return fallback;
    }
}
