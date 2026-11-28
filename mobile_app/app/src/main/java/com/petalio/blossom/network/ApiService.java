package com.petalio.blossom.network;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.Headers;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;
import retrofit2.http.Query;
import java.util.List;
import java.util.Map;

/**
 * ApiService: REST API Endpoints defined for Petalio Blossom.
 */
public interface ApiService {

    // 1. Auth & Profile Endpoints
    @POST("auth/login")
    Call<LoginResponse> login(@Body LoginRequest request);

    @POST("auth/register")
    Call<CommonResponse> registerGeneric(@Body CustomerRegisterRequest request);

    @POST("auth/register-customer")
    Call<CommonResponse> registerCustomer(@Body CustomerRegisterRequest request);

    @POST("auth/register-supplier")
    Call<CommonResponse> registerSupplier(@Body SupplierRegisterRequest request);

    @POST("auth/forgot-password")
    Call<CommonResponse> forgotPassword(@Body ForgotPasswordRequest request);

    @POST("auth/reset-password")
    Call<CommonResponse> resetPassword(@Body ResetPasswordRequest request);

    @POST("auth/change-password")
    Call<CommonResponse> changePassword(@Body ChangePasswordRequest request);

    @GET("users/{userId}/profile")
    Call<UserProfileResponse> getUserProfile(@Path("userId") int userId);

    @GET("customers/{customerId}/profile")
    Call<UserProfileResponse> getCustomerProfile(@Path("customerId") int customerId);

    @POST("customers/{customerId}/redeem-points")
    Call<RedeemPointsResponse> redeemPoints(@Path("customerId") int customerId);

    @GET("customers/{customerId}/payment-methods")
    Call<CustomerPaymentMethodsResponse> getCustomerPaymentMethods(@Path("customerId") int customerId);

    @PUT("users/{userId}/profile")
    Call<UserProfileResponse> updateUserProfile(@Path("userId") int userId, @Body UpdateProfileRequest request);

    @GET("notifications/{userId}")
    Call<NotificationsResponse> getNotifications(@Path("userId") int userId);

    @GET("reminders/{userId}")
    Call<RemindersResponse> getReminders(@Path("userId") int userId);

    @POST("reminders")
    Call<CommonResponse> saveReminder(@Body ReminderDto request);

    // 2. Flowers Catalog & Live Inventory
    @GET("flowers")
    Call<FlowersResponse> getFlowers();

    @GET("categories")
    Call<CategoriesResponse> getCategories();

    @Headers("Cache-Control: no-cache, no-store")
    @GET("wishlist")
    Call<WishlistResponse> getWishlist(@Query("user_id") int userId);

    @POST("wishlist")
    Call<CommonResponse> toggleWishlist(@Body WishlistRequest request);

    @GET("flowers")
    Call<FlowersResponse> getSupplierFlowers(@Query("supplier_id") int supplierId);

    @GET("flowers/{id}")
    Call<SingleFlowerResponse> getFlowerById(@Path("id") int flowerId);

    // 3. Orders & Tracking
    @POST("orders")
    Call<OrderResponse> placeOrder(@Body OrderRequest request);

    @GET("orders/customer/{customerId}")
    Call<CustomerOrdersResponse> getCustomerOrders(@Path("customerId") int customerId);

    @GET("customers/{customerId}/orders")
    Call<CustomerOrdersResponse> getCustomerOrdersAlt(@Path("customerId") int customerId);

    @GET("orders/{orderId}")
    Call<OrderDetailResponse> getOrderDetail(@Path("orderId") String orderId);

    // 4. Ratings & Reviews
    @POST("reviews")
    Call<CommonResponse> submitReview(@Body ReviewRequest request);

    // 5. Supplier Workflows & Stock
    @POST("supplier/stock-update")
    Call<CommonResponse> updateSupplierStock(@Body StockUpdateRequest request);

    @Headers("Cache-Control: no-cache, no-store")
    @GET("suppliers/status")
    Call<SupplierStatusResponse> getSupplierStatusQuery(
            @Query("supplier_code") String supplierCode,
            @Query("user_id") String userId,
            @Query("email") String email
    );

    @Headers("Cache-Control: no-cache, no-store")
    @GET("supplier/status/{id}")
    Call<SupplierStatusResponse> getSupplierStatus(@Path("id") String id);

    @POST("supplier/declare-flowers")
    Call<CommonResponse> declareFlowers(@Body DeclareFlowerRequest request);

    @GET("supplier/dashboard/{supplierId}")
    Call<SupplierDashboardResponse> getSupplierDashboard(@Path("supplierId") int supplierId);

    @GET("suppliers/{userId}/dashboard")
    Call<SupplierDashboardResponse> getSupplierDashboardAlternate(@Path("userId") int userId);

    @GET("suppliers/{userId}/profile")
    Call<SupplierProfileResponse> getSupplierProfile(@Path("userId") int userId);

    @PUT("suppliers/{userId}/profile")
    Call<CommonResponse> updateSupplierProfile(@Path("userId") int userId, @Body SupplierProfileUpdateRequest request);

    @GET("supplier/orders/{supplierId}")
    Call<SupplierOrdersResponse> getSupplierOrders(@Path("supplierId") int supplierId);

    @GET("suppliers/orders")
    Call<SupplierOrdersListResponse> getSupplierOrdersList(@Query("supplier_id") int supplierId);

    @PUT("supplier/orders/{placeOrderId}/status")
    Call<CommonResponse> updateSupplierOrderStatus(@Path("placeOrderId") int placeOrderId, @Body OrderStatusUpdateRequest request);

    @PUT("orders/{orderId}/status")
    Call<CommonResponse> updateOrderStatusLive(@Path("orderId") int orderId, @Body OrderStatusUpdateRequest request);

    @PUT("flowers/bulk-stock")
    Call<CommonResponse> bulkUpdateStock(@Body List<StockUpdateRequest> updates);

    @GET("suppliers/{userId}/declared-flowers")
    Call<DeclaredFlowersResponse> getDeclaredFlowers(@Path("userId") int userId);

    @POST("suppliers/{userId}/declared-flowers")
    Call<CommonResponse> saveDeclaredFlower(@Path("userId") int userId, @Body DeclareFlowerRequest request);

    @PUT("suppliers/{userId}/declared-flowers/{id}")
    Call<CommonResponse> updateDeclaredFlower(@Path("userId") int userId, @Path("id") int declarationId, @Body Map<String, Integer> body);

    @DELETE("suppliers/{userId}/declared-flowers/{id}")
    Call<CommonResponse> deleteDeclaredFlower(@Path("userId") int userId, @Path("id") int declarationId);

    @GET("suppliers/demand")
    Call<SupplierDemandResponse> getSupplierDemand(@Query("supplier_id") int supplierId);

    @GET("suppliers/demand-summary")
    Call<SupplierDemandResponse> getSupplierDemandSummary(@Query("supplier_id") int supplierId);

    @GET("suppliers/{supplierId}/notifications")
    Call<SupplierNotificationsResponse> getSupplierNotifications(@Path("supplierId") int supplierId);

    @GET("notifications")
    Call<SupplierNotificationsResponse> getEstateAlerts(@Query("user_id") int userId, @Query("role") String role);

    @POST("supplier/harvest-fulfilment")
    Call<CommonResponse> submitHarvestFulfilment(@Body HarvestFulfilmentRequest request);

    @GET("demand-forecasts")
    Call<DemandForecastResponse> getDemandForecasts();
}
