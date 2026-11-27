package com.petalio.blossom.network;

import android.content.Context;
import android.content.SharedPreferences;

import java.io.IOException;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.NetworkInterface;
import java.net.Socket;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import okhttp3.HttpUrl;
import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

/**
 * ApiClient: Centralized Retrofit client connecting Petalio Blossom Android App
 * to the Node.js Express backend (connected to MySQL 'petalio_blossom').
 * Supports automatic multi-host failover across USB reverse, Windows Mobile Hotspot,
 * local Wi-Fi IPs, and custom HTTP/HTTPS tunnel URLs.
 */
public class ApiClient {

    private static final String PREFS_NAME = "PetalioApiPrefs";
    private static final String KEY_SERVER_IP = "SERVER_IP";
    private static final String KEY_SERVER_URL = "SERVER_URL";

    // USB reverse port (127.0.0.1) + Windows Mobile Hotspot (192.168.137.1) + known Wi-Fi/Hotspot hosts
    public static final String DEFAULT_SERVER_IP = "127.0.0.1";
    public static final String HOTSPOT_SERVER_IP = "192.168.137.1";
    public static final String PHONE_HOTSPOT_KNOWN_IP = "192.168.72.181";
    public static final String CAMPUS_WIFI_IP = "192.168.57.13";
    public static final String HOME_WIFI_IP = "192.168.8.183";
    public static final String DEFAULT_PORT = "5000";
    public static final String DEFAULT_BASE_URL = "http://" + DEFAULT_SERVER_IP + ":" + DEFAULT_PORT + "/api/";

    // Android Emulator loopback alias (if running on emulator instead of physical phone)
    public static final String EMULATOR_BASE_URL = "http://10.0.2.2:5000/api/";

    private static Retrofit retrofit = null;
    private static volatile String activeBaseUrl = null;
    private static OkHttpClient probeClient = null;

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

    public static String normalizeBaseUrl(String rawEndpoint) {
        if (rawEndpoint == null) return DEFAULT_BASE_URL;
        String clean = rawEndpoint.trim();
        if (clean.isEmpty()) return DEFAULT_BASE_URL;

        boolean hasScheme = clean.startsWith("http://") || clean.startsWith("https://");
        if (!hasScheme) {
            clean = "http://" + clean;
        }

        // Strip trailing /api or /api/ before adding default port if no port & plain HTTP host
        while (clean.endsWith("/")) {
            clean = clean.substring(0, clean.length() - 1);
        }
        if (clean.endsWith("/api")) {
            clean = clean.substring(0, clean.length() - 4);
        }

        HttpUrl parsed = HttpUrl.parse(clean);
        if (parsed != null && clean.startsWith("http://") && !clean.substring(7).contains(":")) {
            clean = clean + ":" + DEFAULT_PORT;
        }
        return clean + "/api/";
    }

    public static String getBaseUrl(Context context) {
        if (activeBaseUrl != null && !activeBaseUrl.isEmpty()) {
            return activeBaseUrl;
        }
        String defaultIp = isEmulator() ? "10.0.2.2" : DEFAULT_SERVER_IP;
        if (context != null) {
            SharedPreferences prefs = context.getApplicationContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String savedUrl = prefs.getString(KEY_SERVER_URL, null);
            if (savedUrl != null && !savedUrl.trim().isEmpty()) {
                return normalizeBaseUrl(savedUrl);
            }
            String savedIp = prefs.getString(KEY_SERVER_IP, null);
            if (savedIp == null || savedIp.equals("192.168.57.133") || savedIp.trim().isEmpty()) {
                savedIp = defaultIp;
                prefs.edit().putString(KEY_SERVER_IP, savedIp).apply();
            }
            return normalizeBaseUrl(savedIp);
        }
        return normalizeBaseUrl(defaultIp);
    }

    public static void updateServerIp(Context context, String newIp) {
        updateServerEndpoint(context, newIp);
    }

    public static synchronized void updateServerEndpoint(Context context, String endpoint) {
        if (context != null && endpoint != null && !endpoint.trim().isEmpty()) {
            String normalized = normalizeBaseUrl(endpoint);
            SharedPreferences prefs = context.getApplicationContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            HttpUrl url = HttpUrl.parse(normalized);
            SharedPreferences.Editor ed = prefs.edit().putString(KEY_SERVER_URL, normalized);
            if (url != null) {
                ed.putString(KEY_SERVER_IP, url.host());
            }
            ed.apply();
            activeBaseUrl = normalized;
            retrofit = null; // force re-initialization
        }
    }

    private static List<String> buildCandidateBaseUrls(Context context, String failedBaseUrl) {
        Set<String> candidates = new LinkedHashSet<>();
        if (context != null) {
            SharedPreferences prefs = context.getApplicationContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String savedUrl = prefs.getString(KEY_SERVER_URL, null);
            if (savedUrl != null && !savedUrl.trim().isEmpty()) {
                candidates.add(normalizeBaseUrl(savedUrl));
            }
            String savedIp = prefs.getString(KEY_SERVER_IP, null);
            if (savedIp != null && !savedIp.trim().isEmpty() && !"192.168.57.133".equals(savedIp)) {
                candidates.add(normalizeBaseUrl(savedIp));
            }
        }
        if (isEmulator()) {
            candidates.add(EMULATOR_BASE_URL);
        }
        candidates.add(normalizeBaseUrl(DEFAULT_SERVER_IP));
        candidates.add(normalizeBaseUrl(PHONE_HOTSPOT_KNOWN_IP));
        candidates.add(normalizeBaseUrl(HOTSPOT_SERVER_IP));
        candidates.add(normalizeBaseUrl(CAMPUS_WIFI_IP));
        candidates.add(normalizeBaseUrl(HOME_WIFI_IP));
        if (failedBaseUrl != null) {
            candidates.remove(failedBaseUrl);
        }
        return new ArrayList<>(candidates);
    }

    private static boolean isPrivateLanIp(InetAddress addr) {
        if (!(addr instanceof Inet4Address) || addr.isLoopbackAddress() || addr.isLinkLocalAddress()) {
            return false;
        }
        String ip = addr.getHostAddress();
        if (ip == null) return false;
        if (ip.startsWith("192.168.") || ip.startsWith("10.")) return true;
        if (ip.startsWith("172.")) {
            try {
                int secondOctet = Integer.parseInt(ip.split("\\.")[1]);
                return secondOctet >= 16 && secondOctet <= 31;
            } catch (Exception ignored) {}
        }
        return false;
    }

    private static List<String> getLocalHotspotAndWifiSelfIps() {
        List<String> apIps = new ArrayList<>();
        List<String> wlanIps = new ArrayList<>();
        try {
            Enumeration<NetworkInterface> ifaces = NetworkInterface.getNetworkInterfaces();
            while (ifaces != null && ifaces.hasMoreElements()) {
                NetworkInterface nif = ifaces.nextElement();
                if (!nif.isUp() || nif.isLoopback()) continue;
                String name = nif.getName() != null ? nif.getName().toLowerCase() : "";
                if (name.contains("rmnet") || name.contains("ccmni") || name.contains("pdp") || name.contains("tun")) {
                    continue;
                }
                for (InetAddress addr : Collections.list(nif.getInetAddresses())) {
                    if (!isPrivateLanIp(addr)) continue;
                    String ip = addr.getHostAddress();
                    if (name.startsWith("ap") || name.startsWith("rndis") || name.startsWith("swlan")) {
                        apIps.add(ip);
                    } else if (name.startsWith("wlan") || name.startsWith("eth")) {
                        wlanIps.add(ip);
                    }
                }
            }
        } catch (Exception ignored) {}
        List<String> ordered = new ArrayList<>(apIps);
        ordered.addAll(wlanIps);
        return ordered;
    }

    private static String scanActiveSubnetsForBackend(OkHttpClient client) {
        List<String> localIps = getLocalHotspotAndWifiSelfIps();
        if (localIps.isEmpty()) return null;

        int maxSubnets = Math.min(2, localIps.size());
        for (int sIdx = 0; sIdx < maxSubnets; sIdx++) {
            String selfIp = localIps.get(sIdx);
            int lastDot = selfIp.lastIndexOf('.');
            if (lastDot <= 0) continue;
            String prefix = selfIp.substring(0, lastDot + 1);

            ExecutorService pool = Executors.newFixedThreadPool(48);
            CountDownLatch latch = new CountDownLatch(254);
            AtomicReference<String> winner = new AtomicReference<>(null);

            for (int host = 1; host <= 254; host++) {
                final String targetIp = prefix + host;
                pool.execute(() -> {
                    try {
                        if (winner.get() != null || targetIp.equals(selfIp)) return;
                        try (Socket socket = new Socket()) {
                            socket.connect(new InetSocketAddress(targetIp, 5000), 320);
                        }
                        String rootUrl = "http://" + targetIp + ":5000/";
                        Request probeReq = new Request.Builder().url(rootUrl).get().build();
                        try (Response resp = client.newCall(probeReq).execute()) {
                            if (resp.isSuccessful() && resp.body() != null) {
                                String body = resp.body().string();
                                if (body.contains("Petalio")) {
                                    if (winner.compareAndSet(null, "http://" + targetIp + ":5000/api/")) {
                                        while (latch.getCount() > 0) latch.countDown();
                                    }
                                }
                            }
                        }
                    } catch (Exception ignored) {
                    } finally {
                        latch.countDown();
                    }
                });
            }

            try {
                latch.await(1800, TimeUnit.MILLISECONDS);
            } catch (InterruptedException ignored) {
                Thread.currentThread().interrupt();
            } finally {
                pool.shutdownNow();
            }

            if (winner.get() != null) {
                return winner.get();
            }
        }
        return null;
    }

    private static synchronized OkHttpClient getProbeClient() {
        if (probeClient == null) {
            probeClient = new OkHttpClient.Builder()
                    .connectTimeout(1500, TimeUnit.MILLISECONDS)
                    .readTimeout(1500, TimeUnit.MILLISECONDS)
                    .writeTimeout(1500, TimeUnit.MILLISECONDS)
                    .retryOnConnectionFailure(false)
                    .build();
        }
        return probeClient;
    }

    private static String probeReachableBaseUrl(Context context, String failedBaseUrl) {
        List<String> candidates = buildCandidateBaseUrls(context, failedBaseUrl);
        OkHttpClient client = getProbeClient();
        String found = null;

        if (!candidates.isEmpty()) {
            ExecutorService pool = Executors.newFixedThreadPool(Math.min(6, candidates.size()));
            CountDownLatch latch = new CountDownLatch(candidates.size());
            AtomicReference<String> winner = new AtomicReference<>(null);

            for (final String candidateBase : candidates) {
                pool.execute(() -> {
                    try {
                        if (winner.get() != null) return;
                        String rootUrl = candidateBase.endsWith("/api/")
                                ? candidateBase.substring(0, candidateBase.length() - 4)
                                : candidateBase;
                        Request probeReq = new Request.Builder().url(rootUrl).get().build();
                        try (Response resp = client.newCall(probeReq).execute()) {
                            if (resp.isSuccessful() && resp.body() != null && resp.body().string().contains("Petalio")) {
                                if (winner.compareAndSet(null, candidateBase)) {
                                    while (latch.getCount() > 0) latch.countDown();
                                }
                            }
                        }
                    } catch (Exception ignored) {
                    } finally {
                        latch.countDown();
                    }
                });
            }

            try {
                latch.await(1200, TimeUnit.MILLISECONDS);
            } catch (InterruptedException ignored) {
                Thread.currentThread().interrupt();
            } finally {
                pool.shutdownNow();
            }
            found = winner.get();
        }

        if (found == null) {
            found = scanActiveSubnetsForBackend(client);
        }

        if (found != null) {
            activeBaseUrl = found;
            if (context != null) {
                SharedPreferences prefs = context.getApplicationContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                HttpUrl parsed = HttpUrl.parse(found);
                SharedPreferences.Editor ed = prefs.edit().putString(KEY_SERVER_URL, found);
                if (parsed != null) {
                    ed.putString(KEY_SERVER_IP, parsed.host());
                }
                ed.apply();
            }
        }
        return found;
    }

    private static Request rewriteRequestForBase(Request original, String targetBaseUrl) {
        HttpUrl targetBase = HttpUrl.parse(targetBaseUrl);
        if (targetBase == null) return original;
        HttpUrl origUrl = original.url();
        HttpUrl.Builder builder = origUrl.newBuilder()
                .scheme(targetBase.scheme())
                .host(targetBase.host())
                .port(targetBase.port());
        return original.newBuilder().url(builder.build()).build();
    }

    private static String extractBaseRootApi(HttpUrl url) {
        return url.scheme() + "://" + url.host()
                + ((url.port() == HttpUrl.defaultPort(url.scheme())) ? "" : (":" + url.port()))
                + "/api/";
    }

    public static Retrofit getClient(Context context) {
        final Context appContext = context != null ? context.getApplicationContext() : null;
        if (retrofit == null) {
            Interceptor failoverInterceptor = new Interceptor() {
                @Override
                public Response intercept(Chain chain) throws IOException {
                    Request original = chain.request();
                    String currentTarget = activeBaseUrl != null ? activeBaseUrl : getBaseUrl(appContext);
                    Request primaryReq = rewriteRequestForBase(original, currentTarget);
                    try {
                        return chain.proceed(primaryReq);
                    } catch (IOException firstError) {
                        String failedBase = extractBaseRootApi(primaryReq.url());
                        String fallbackBase = probeReachableBaseUrl(appContext, failedBase);
                        if (fallbackBase == null || fallbackBase.equals(failedBase)) {
                            throw firstError;
                        }
                        Request retryReq = rewriteRequestForBase(original, fallbackBase);
                        return chain.proceed(retryReq);
                    }
                }
            };

            OkHttpClient okHttpClient = new OkHttpClient.Builder()
                    .connectTimeout(2500, TimeUnit.MILLISECONDS)
                    .readTimeout(8, TimeUnit.SECONDS)
                    .writeTimeout(8, TimeUnit.SECONDS)
                    .addInterceptor(failoverInterceptor)
                    .retryOnConnectionFailure(true)
                    .build();

            retrofit = new Retrofit.Builder()
                    .baseUrl(getBaseUrl(appContext))
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
