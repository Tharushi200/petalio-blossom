package com.petalio.blossom;

import android.content.Intent;
import android.content.res.ColorStateList;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.OrderDetailResponse;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * O4. Delivery Status Tracking Activity for Petalio Blossom.
 * Dynamically binds live orders, driver contact, vehicle info, and status
 * stepper from MySQL.
 * Bottom navigation bar is 100% consistent with CustomerMainActivity.
 */
public class DeliveryTrackingActivity extends AppCompatActivity {

    private View btnBackTracking;
    private TextView tvTrackingHeaderTitle, tvTrackingStatusBadge, tvTrackingExpectedDate;
    private TextView tvTrackingDriverDetails;

    private View stepPlacedDotTrack, stepLine1Track, stepPreparingDotTrack, stepLine2Track, stepDispatchedDotTrack,
            stepLine3Track, stepDeliveredDotTrack;
    private TextView stepPlacedTextTrack, stepPreparingTextTrack, stepDispatchedTextTrack, stepDeliveredTextTrack;

    private Button btnRateFromTracking;

    // Bottom Navigation Elements (matching CustomerMainActivity identically)
    private LinearLayout navTabBrowse, navTabCart, navTabOrders, navTabProfile;
    private ImageView ivNavBrowse, ivNavCart, ivNavOrders, ivNavProfile;
    private TextView tvNavBrowse, tvNavCart, tvNavOrders, tvNavProfile;
    private TextView badgeNavCart;

    private int orderDbId = -1;
    private String currentOrderId = "";
    private String orderStatus = "Pending";
    private String deliveryDate = "Tomorrow";
    private String driverName = null;
    private String vehicleNumber = null;
    private String driverPhone = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_delivery_tracking);

        initViews();
        readIntentData();
        setupListeners();
        updateCartBadge();
        fetchLiveOrderDetail();
    }

    @Override
    protected void onResume() {
        super.onResume();
        updateCartBadge();
    }

    private void initViews() {
        btnBackTracking = findViewById(R.id.btnBackTracking);
        tvTrackingHeaderTitle = findViewById(R.id.tvTrackingHeaderTitle);
        tvTrackingStatusBadge = findViewById(R.id.tvTrackingStatusBadge);
        tvTrackingExpectedDate = findViewById(R.id.tvTrackingExpectedDate);
        tvTrackingDriverDetails = findViewById(R.id.tvTrackingDriverDetails);

        stepPlacedDotTrack = findViewById(R.id.stepPlacedDotTrack);
        stepLine1Track = findViewById(R.id.stepLine1Track);
        stepPreparingDotTrack = findViewById(R.id.stepPreparingDotTrack);
        stepLine2Track = findViewById(R.id.stepLine2Track);
        stepDispatchedDotTrack = findViewById(R.id.stepDispatchedDotTrack);
        stepLine3Track = findViewById(R.id.stepLine3Track);
        stepDeliveredDotTrack = findViewById(R.id.stepDeliveredDotTrack);

        stepPlacedTextTrack = findViewById(R.id.stepPlacedTextTrack);
        stepPreparingTextTrack = findViewById(R.id.stepPreparingTextTrack);
        stepDispatchedTextTrack = findViewById(R.id.stepDispatchedTextTrack);
        stepDeliveredTextTrack = findViewById(R.id.stepDeliveredTextTrack);

        btnRateFromTracking = findViewById(R.id.btnRateFromTracking);

        // Bottom Navigation Bar Views
        navTabBrowse = findViewById(R.id.navTabBrowse);
        navTabCart = findViewById(R.id.navTabCart);
        navTabOrders = findViewById(R.id.navTabOrders);
        navTabProfile = findViewById(R.id.navTabProfile);

        ivNavBrowse = findViewById(R.id.ivNavBrowse);
        ivNavCart = findViewById(R.id.ivNavCart);
        ivNavOrders = findViewById(R.id.ivNavOrders);
        ivNavProfile = findViewById(R.id.ivNavProfile);

        tvNavBrowse = findViewById(R.id.tvNavBrowse);
        tvNavCart = findViewById(R.id.tvNavCart);
        tvNavOrders = findViewById(R.id.tvNavOrders);
        tvNavProfile = findViewById(R.id.tvNavProfile);

        badgeNavCart = findViewById(R.id.badgeNavCart);
    }

    private void readIntentData() {
        String passedOrderId = getIntent().getStringExtra("ORDER_ID");
        if (passedOrderId != null && !passedOrderId.isEmpty()) {
            currentOrderId = passedOrderId;
        }

        String passedStatus = getIntent().getStringExtra("ORDER_STATUS");
        if (passedStatus != null && !passedStatus.isEmpty()) {
            orderStatus = passedStatus;
        }

        String passedDate = getIntent().getStringExtra("DELIVERY_DATE");
        if (passedDate != null && !passedDate.isEmpty()) {
            deliveryDate = parseDeliveryDate(passedDate);
        }

        String passedOrderDate = getIntent().getStringExtra("ORDER_DATE");
        if ((deliveryDate == null || deliveryDate.isEmpty() || "Tomorrow".equalsIgnoreCase(deliveryDate))
                && passedOrderDate != null && !passedOrderDate.isEmpty()) {
            deliveryDate = parseDeliveryDate(passedOrderDate);
        }

        String passedDriver = getIntent().getStringExtra("DRIVER_NAME");
        if (passedDriver != null && !passedDriver.trim().isEmpty() && !passedDriver.equalsIgnoreCase("null")) {
            driverName = passedDriver.trim();
        }

        String passedVeh = getIntent().getStringExtra("VEHICLE_NUMBER");
        if (passedVeh != null && !passedVeh.trim().isEmpty() && !passedVeh.equalsIgnoreCase("null")) {
            vehicleNumber = passedVeh.trim();
        }

        String passedPhone = getIntent().getStringExtra("DRIVER_PHONE");
        if (passedPhone != null && !passedPhone.trim().isEmpty() && !passedPhone.equalsIgnoreCase("null")) {
            driverPhone = passedPhone.trim();
        }

        applyUiData();
    }

    private void applyUiData() {
        String cleanCode = currentOrderId != null && !currentOrderId.isEmpty() ? currentOrderId : "";
        if (!cleanCode.isEmpty() && !cleanCode.startsWith("#")) {
            cleanCode = "#" + cleanCode;
        }
        tvTrackingHeaderTitle.setText(cleanCode.isEmpty() ? "Order Tracking" : ("Order " + cleanCode));

        if (tvTrackingStatusBadge != null) {
            tvTrackingStatusBadge.setText(formatStatusBadge(orderStatus));
        }

        boolean isDelivered = "DELIVERED".equalsIgnoreCase(orderStatus) ||
                (orderStatus != null && orderStatus.toUpperCase().contains("DELIVER"));

        if (tvTrackingExpectedDate != null) {
            if (isDelivered) {
                tvTrackingExpectedDate.setText("Delivered on " + deliveryDate);
            } else {
                tvTrackingExpectedDate.setText("Expected delivery " + deliveryDate);
            }
        }

        updateDriverDetailsUi();

        applyStepper(orderStatus,
                stepPlacedDotTrack, stepLine1Track, stepPlacedTextTrack,
                stepPreparingDotTrack, stepLine2Track, stepPreparingTextTrack,
                stepDispatchedDotTrack, stepLine3Track, stepDispatchedTextTrack,
                stepDeliveredDotTrack, stepDeliveredTextTrack);

        updateRateButtonState();
    }

    private void updateDriverDetailsUi() {
        if (tvTrackingDriverDetails == null)
            return;

        boolean hasDriver = driverName != null && !driverName.trim().isEmpty() && !driverName.equalsIgnoreCase("null");
        boolean hasVehicle = vehicleNumber != null && !vehicleNumber.trim().isEmpty()
                && !vehicleNumber.equalsIgnoreCase("null");
        boolean hasPhone = driverPhone != null && !driverPhone.trim().isEmpty()
                && !driverPhone.equalsIgnoreCase("null");

        String upperStatus = (orderStatus != null ? orderStatus : "").toUpperCase();
        boolean isDelivered = upperStatus.contains("DELIVER");
        boolean isDispatched = upperStatus.contains("DISPATCH") || upperStatus.contains("TRANSIT")
                || upperStatus.contains("SHIP") || upperStatus.contains("WAY");

        if (hasDriver && (isDispatched || isDelivered || hasVehicle)) {
            StringBuilder sb = new StringBuilder();
            sb.append(driverName);
            if (hasVehicle) {
                sb.append(" • Vehicle: ").append(vehicleNumber);
            }
            if (hasPhone) {
                sb.append("\nContact: ").append(driverPhone);
            }
            tvTrackingDriverDetails.setText(sb.toString());
        } else if (isDelivered) {
            tvTrackingDriverDetails.setText("Delivered via Petalio Express");
        } else if (isDispatched) {
            tvTrackingDriverDetails.setText("Dispatched via Petalio Express");
        } else {
            tvTrackingDriverDetails.setText("Awaiting driver assignment");
        }
    }

    private void fetchLiveOrderDetail() {
        if (currentOrderId == null || currentOrderId.isEmpty())
            return;
        String queryId = currentOrderId.replace("#", "").replace("Order ", "").trim();

        ApiClient.getApiService(this)
                .getOrderDetail(queryId)
                .enqueue(new Callback<OrderDetailResponse>() {
                    @Override
                    public void onResponse(Call<OrderDetailResponse> call, Response<OrderDetailResponse> response) {
                        if (response.isSuccessful() && response.body() != null && response.body().getOrder() != null) {
                            OrderDetailResponse.OrderData data = response.body().getOrder();
                            orderDbId = data.order_id;
                            if (data.fulfilment_status != null && !data.fulfilment_status.isEmpty()) {
                                orderStatus = data.fulfilment_status;
                            } else if (data.status != null && !data.status.isEmpty()) {
                                orderStatus = data.status;
                            }

                            if (data.delivery != null) {
                                driverName = (data.delivery.driver_name != null && !data.delivery.driver_name.isEmpty()
                                        && !data.delivery.driver_name.equalsIgnoreCase("null"))
                                                ? data.delivery.driver_name
                                                : null;
                                vehicleNumber = (data.delivery.vehicle_number != null
                                        && !data.delivery.vehicle_number.isEmpty()
                                        && !data.delivery.vehicle_number.equalsIgnoreCase("null"))
                                                ? data.delivery.vehicle_number
                                                : null;
                                driverPhone = (data.delivery.driver_phone != null
                                        && !data.delivery.driver_phone.isEmpty()
                                        && !data.delivery.driver_phone.equalsIgnoreCase("null"))
                                                ? data.delivery.driver_phone
                                                : null;

                                if (data.delivery.delivery_date != null && !data.delivery.delivery_date.isEmpty()
                                        && !data.delivery.delivery_date.equalsIgnoreCase("null")) {
                                    deliveryDate = parseDeliveryDate(data.delivery.delivery_date);
                                } else if (data.order_date != null && !data.order_date.isEmpty()) {
                                    deliveryDate = parseDeliveryDate(data.order_date);
                                }
                            } else {
                                driverName = null;
                                vehicleNumber = null;
                                driverPhone = null;
                                if (data.order_date != null && !data.order_date.isEmpty()) {
                                    deliveryDate = parseDeliveryDate(data.order_date);
                                }
                            }

                            applyUiData();
                        }
                    }

                    @Override
                    public void onFailure(Call<OrderDetailResponse> call, Throwable t) {
                        // Keep intent data
                    }
                });
    }

    private void updateRateButtonState() {
        boolean isDelivered = "DELIVERED".equalsIgnoreCase(orderStatus);

        if (isDelivered) {
            btnRateFromTracking.setText("Rate & Review Delivery");
            btnRateFromTracking.setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_star_rate, 0, 0, 0);
            btnRateFromTracking.setOnClickListener(v -> {
                Intent intent = new Intent(DeliveryTrackingActivity.this, RateOrderActivity.class);
                intent.putExtra("ORDER_DB_ID", orderDbId);
                intent.putExtra("ORDER_ID", currentOrderId);
                intent.putExtra("PRESET_RATING", 5);
                startActivity(intent);
            });
        } else {
            btnRateFromTracking.setText("Rating available after delivery");
            btnRateFromTracking.setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_security, 0, 0, 0);
            btnRateFromTracking.setOnClickListener(v -> {
                Toast.makeText(this,
                        "Order " + currentOrderId + " is in progress. You can rate your delivery once delivered.",
                        Toast.LENGTH_SHORT).show();
            });
        }
    }

    private void updateCartBadge() {
        if (badgeNavCart != null) {
            int count = CartManager.getInstance(this).getTotalItemCount();
            if (count > 0) {
                badgeNavCart.setVisibility(View.VISIBLE);
                badgeNavCart.setText(String.valueOf(count));
                badgeNavCart.setMaxLines(1);
                badgeNavCart.setSingleLine(true);
            } else {
                badgeNavCart.setVisibility(View.GONE);
            }
        }
    }

    private void setupListeners() {
        AnimationUtilsHelper.applyPressScale(btnBackTracking);
        btnBackTracking.setOnClickListener(v -> supportFinishAfterTransition());

        if (navTabBrowse != null) {
            AnimationUtilsHelper.applyPressScale(navTabBrowse);
            navTabBrowse.setOnClickListener(v -> openCustomerTab(0));
        }

        if (navTabCart != null) {
            AnimationUtilsHelper.applyPressScale(navTabCart);
            navTabCart.setOnClickListener(v -> openCustomerTab(1));
        }

        if (navTabOrders != null) {
            AnimationUtilsHelper.applyPressScale(navTabOrders);
            navTabOrders.setOnClickListener(v -> finish()); // Go back to Orders tab
        }

        if (navTabProfile != null) {
            AnimationUtilsHelper.applyPressScale(navTabProfile);
            navTabProfile.setOnClickListener(v -> openCustomerTab(3));
        }
    }

    private void openCustomerTab(int tabIndex) {
        Intent intent = new Intent(DeliveryTrackingActivity.this, CustomerMainActivity.class);
        intent.putExtra("TARGET_TAB", tabIndex);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        startActivity(intent);
        finish();
    }

    private String formatStatusBadge(String status) {
        if (status == null)
            return "Pending";
        String upper = status.toUpperCase();
        if (upper.contains("PREPAR"))
            return "Preparing";
        if (upper.contains("DISPATCH") || upper.contains("TRANSIT") || upper.contains("SHIP") || upper.contains("WAY"))
            return "On the Way";
        if (upper.contains("DELIVER"))
            return "Delivered";
        if (upper.contains("CANCEL"))
            return "Cancelled";
        return "Order Placed";
    }

    private String parseDeliveryDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty() || dateStr.equalsIgnoreCase("null")) {
            return "Tomorrow";
        }
        String clean = dateStr.trim();
        if (clean.matches(".*[a-zA-Z]{3,}.*") && !clean.contains("T")) {
            return clean;
        }

        try {
            clean = clean.replace("Z", "");
            if (clean.contains("T")) {
                String[] parts = clean.split("T");
                clean = parts[0];
            }
            if (clean.contains("-")) {
                String[] ymd = clean.split("-");
                if (ymd.length == 3) {
                    int year = Integer.parseInt(ymd[0]);
                    int month = Integer.parseInt(ymd[1]);
                    int day = Integer.parseInt(ymd[2]);
                    String[] months = { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov",
                            "Dec" };
                    String mStr = months[Math.max(0, Math.min(11, month - 1))];
                    return day + " " + mStr + " " + year;
                }
            }
        } catch (Exception ignored) {
        }
        return clean;
    }

    public static void applyStepper(String rawStatus,
            View dot1, View line1, TextView txt1,
            View dot2, View line2, TextView txt2,
            View dot3, View line3, TextView txt3,
            View dot4, TextView txt4) {
        if (dot1 == null || dot1.getContext() == null)
            return;
        AnimationUtilsHelper.stopStepPulse(dot1, dot2, dot3, dot4);

        android.content.Context ctx = dot1.getContext();
        int activeColor = ContextCompat.getColor(ctx, R.color.primary_forest);
        int inactiveColor = ContextCompat.getColor(ctx, R.color.divider_color);
        int activeTextColor = ContextCompat.getColor(ctx, R.color.primary_forest);
        int inactiveTextColor = ContextCompat.getColor(ctx, R.color.text_hint);

        String s = (rawStatus != null ? rawStatus : "").toUpperCase();
        boolean isCancelled = s.contains("CANCEL");
        int step = 1;
        if (s.contains("PREPAR") || s.contains("CONFIRM")) {
            step = 2;
        } else if (s.contains("DISPATCH") || s.contains("TRANSIT") || s.contains("SHIP") || s.contains("WAY")) {
            step = 3;
        } else if (s.contains("DELIVER")) {
            step = 4;
        }

        // Step 1: Placed
        dot1.setBackgroundTintList(ColorStateList.valueOf(activeColor));
        if (txt1 != null) {
            txt1.setTextColor(activeTextColor);
            txt1.setTypeface(null, android.graphics.Typeface.BOLD);
        }

        // Line 1 & Step 2: Preparing
        if (step >= 2) {
            if (line1 != null)
                line1.setBackgroundColor(activeColor);
            if (dot2 != null)
                dot2.setBackgroundTintList(ColorStateList.valueOf(activeColor));
            if (txt2 != null) {
                txt2.setTextColor(activeTextColor);
                txt2.setTypeface(null, android.graphics.Typeface.BOLD);
            }
        } else {
            if (line1 != null)
                line1.setBackgroundColor(inactiveColor);
            if (dot2 != null)
                dot2.setBackgroundTintList(ColorStateList.valueOf(inactiveColor));
            if (txt2 != null) {
                txt2.setTextColor(inactiveTextColor);
                txt2.setTypeface(null, android.graphics.Typeface.NORMAL);
            }
        }

        // Line 2 & Step 3: Dispatched
        if (step >= 3) {
            if (line2 != null)
                line2.setBackgroundColor(activeColor);
            if (dot3 != null)
                dot3.setBackgroundTintList(ColorStateList.valueOf(activeColor));
            if (txt3 != null) {
                txt3.setTextColor(activeTextColor);
                txt3.setTypeface(null, android.graphics.Typeface.BOLD);
            }
        } else {
            if (line2 != null)
                line2.setBackgroundColor(inactiveColor);
            if (dot3 != null)
                dot3.setBackgroundTintList(ColorStateList.valueOf(inactiveColor));
            if (txt3 != null) {
                txt3.setTextColor(inactiveTextColor);
                txt3.setTypeface(null, android.graphics.Typeface.NORMAL);
            }
        }

        // Line 3 & Step 4: Delivered
        if (step >= 4) {
            if (line3 != null)
                line3.setBackgroundColor(activeColor);
            if (dot4 != null)
                dot4.setBackgroundTintList(ColorStateList.valueOf(activeColor));
            if (txt4 != null) {
                txt4.setTextColor(activeTextColor);
                txt4.setTypeface(null, android.graphics.Typeface.BOLD);
            }
        } else {
            if (line3 != null)
                line3.setBackgroundColor(inactiveColor);
            if (dot4 != null)
                dot4.setBackgroundTintList(ColorStateList.valueOf(inactiveColor));
            if (txt4 != null) {
                txt4.setTextColor(inactiveTextColor);
                txt4.setTypeface(null, android.graphics.Typeface.NORMAL);
            }
        }

        // Apply pulse animation to the current active step dot only if in-progress and
        // not cancelled
        if (!isCancelled && step < 4) {
            if (step == 1) {
                AnimationUtilsHelper.startStepPulse(dot1);
            } else if (step == 2) {
                AnimationUtilsHelper.startStepPulse(dot2);
            } else if (step == 3) {
                AnimationUtilsHelper.startStepPulse(dot3);
            }
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        AnimationUtilsHelper.stopStepPulse(stepPlacedDotTrack, stepPreparingDotTrack, stepDispatchedDotTrack,
                stepDeliveredDotTrack);
    }
}
