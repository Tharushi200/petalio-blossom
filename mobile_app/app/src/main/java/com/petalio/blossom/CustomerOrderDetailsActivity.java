package com.petalio.blossom;

import android.content.Intent;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import androidx.core.content.ContextCompat;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.OrderDetailResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * CustomerOrderDetailsActivity: Live invoice, dynamic multi-item breakdown,
 * real supplier/courier info, and working MySQL-backed reorder & rating flows.
 */
public class CustomerOrderDetailsActivity extends AppCompatActivity {

    private View btnBackOrderDetails;
    private TextView tvOrderDetailsId, badgeOrderDetailsStatus, tvOrderDetailsDate, tvOrderDetailsAddress;
    private LinearLayout llOrderDetailsItems;
    private View rowItem1;
    private View tvItem1Icon;
    private TextView tvItem1Title, tvItem1Qty, tvItem1Price;
    private RelativeLayout rowItem2;
    private View tvItem2Icon;
    private TextView tvItem2Title, tvItem2Qty, tvItem2Price;
    private View rowItem3, rowOrderDiscount;
    private TextView tvOrderSubtotal, tvOrderDeliveryFee, tvOrderDiscount, tvOrderDetailsTotal, tvOrderPaymentMethod, tvFulfillmentCare;
    private Button btnRateThisOrder, btnReorder;

    private int orderDbId = -1;
    private int primaryFlowerId = -1;
    private String orderId = "";
    private String orderStatus = "Pending";
    private final List<OrderDetailResponse.DetailItem> loadedItems = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_customer_order_details);

        initViews();
        loadOrderData();
        setupListeners();
    }

    private void initViews() {
        btnBackOrderDetails = findViewById(R.id.btnBackOrderDetails);

        tvOrderDetailsId = findViewById(R.id.tvOrderDetailsId);
        badgeOrderDetailsStatus = findViewById(R.id.badgeOrderDetailsStatus);
        tvOrderDetailsDate = findViewById(R.id.tvOrderDetailsDate);
        tvOrderDetailsAddress = findViewById(R.id.tvOrderDetailsAddress);

        llOrderDetailsItems = findViewById(R.id.llOrderDetailsItems);
        rowItem1 = findViewById(R.id.rowItem1);
        tvItem1Icon = findViewById(R.id.tvItem1Icon);
        tvItem1Title = findViewById(R.id.tvItem1Title);
        tvItem1Qty = findViewById(R.id.tvItem1Qty);
        tvItem1Price = findViewById(R.id.tvItem1Price);

        rowItem2 = findViewById(R.id.rowItem2);
        tvItem2Icon = findViewById(R.id.tvItem2Icon);
        tvItem2Title = findViewById(R.id.tvItem2Title);
        tvItem2Qty = findViewById(R.id.tvItem2Qty);
        tvItem2Price = findViewById(R.id.tvItem2Price);

        rowItem3 = findViewById(R.id.rowItem3);
        if (rowItem3 != null) rowItem3.setVisibility(View.GONE);

        tvOrderSubtotal = findViewById(R.id.tvOrderSubtotal);
        tvOrderDeliveryFee = findViewById(R.id.tvOrderDeliveryFee);
        rowOrderDiscount = findViewById(R.id.rowOrderDiscount);
        tvOrderDiscount = findViewById(R.id.tvOrderDiscount);
        tvOrderDetailsTotal = findViewById(R.id.tvOrderDetailsTotal);
        tvOrderPaymentMethod = findViewById(R.id.tvOrderPaymentMethod);
        tvFulfillmentCare = findViewById(R.id.tvFulfillmentCare);

        btnRateThisOrder = findViewById(R.id.btnRateThisOrder);
        btnReorder = findViewById(R.id.btnReorder);
    }

    private void loadOrderData() {
        Intent intent = getIntent();
        if (intent != null) {
            orderDbId = intent.getIntExtra("ORDER_DB_ID", -1);
            String passedId = intent.getStringExtra("ORDER_ID");
            if (passedId != null && !passedId.isEmpty()) {
                orderId = passedId;
            }

            String passedStatus = intent.getStringExtra("ORDER_STATUS");
            if (passedStatus != null && !passedStatus.isEmpty()) {
                orderStatus = passedStatus;
            }

            String date = intent.getStringExtra("ORDER_DATE");
            if (date != null && !date.isEmpty()) {
                if (date.startsWith("Delivered") || date.startsWith("Ordered")) {
                    tvOrderDetailsDate.setText(date);
                } else {
                    tvOrderDetailsDate.setText("Ordered on " + formatShortDate(date));
                }
            }

            String address = intent.getStringExtra("DELIVERY_ADDRESS");
            if (address != null && !address.isEmpty()) {
                tvOrderDetailsAddress.setText(address);
            }

            String item1Title = intent.getStringExtra("ITEM1_TITLE");
            if (item1Title != null && !item1Title.isEmpty()) {
                tvItem1Title.setText(item1Title);
                if (tvItem1Icon instanceof ImageView) {
                    ((ImageView) tvItem1Icon).setImageResource(FlowerImageHelper.getDrawableForFlower(item1Title));
                }
            }

            String item1Qty = intent.getStringExtra("ITEM1_QTY");
            if (item1Qty != null) tvItem1Qty.setText(item1Qty);

            String item1Price = intent.getStringExtra("ITEM1_PRICE");
            if (item1Price != null && !item1Price.isEmpty()) tvItem1Price.setText(item1Price);

            String subtotal = intent.getStringExtra("ORDER_SUBTOTAL");
            if (subtotal != null && !subtotal.isEmpty()) tvOrderSubtotal.setText(subtotal);

            String total = intent.getStringExtra("ORDER_TOTAL");
            if (total != null && !total.isEmpty()) tvOrderDetailsTotal.setText(total);

            String payment = intent.getStringExtra("PAYMENT_METHOD");
            if (payment != null && !payment.isEmpty()) tvOrderPaymentMethod.setText(payment);
        }

        if (orderId != null && !orderId.isEmpty()) {
            tvOrderDetailsId.setText(orderId.startsWith("Order") ? orderId : "Order #" + orderId.replace("#", ""));
        } else {
            tvOrderDetailsId.setText("Order Details");
        }
        badgeOrderDetailsStatus.setText(orderStatus);

        fetchLiveOrderDetail();
    }

    private void fetchLiveOrderDetail() {
        String cleanId = orderDbId > 0
                ? String.valueOf(orderDbId)
                : (orderId != null ? orderId.replace("#", "").replace("Order", "").trim() : "");
        if (cleanId.isEmpty()) return;

        ApiClient.getApiService(this)
                .getOrderDetail(cleanId)
                .enqueue(new Callback<OrderDetailResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<OrderDetailResponse> call, @NonNull Response<OrderDetailResponse> response) {
                        if (isFinishing() || isDestroyed()) return;
                        if (response.isSuccessful() && response.body() != null && response.body().getOrder() != null) {
                            OrderDetailResponse.OrderData data = response.body().getOrder();
                            orderDbId = data.order_id;
                            if (data.order_code != null && !data.order_code.isEmpty()) {
                                orderId = data.order_code;
                                tvOrderDetailsId.setText("Order #" + data.order_code.replace("#", ""));
                            }
                            if (data.order_date != null && tvOrderDetailsDate != null) {
                                boolean delivered = "DELIVERED".equalsIgnoreCase(data.status)
                                        || "Delivered".equalsIgnoreCase(data.fulfilment_status);
                                tvOrderDetailsDate.setText((delivered ? "Delivered · Ordered on " : "Ordered on ") + formatShortDate(data.order_date));
                            }
                            String statusLabel = (data.fulfilment_status != null && !data.fulfilment_status.isEmpty())
                                    ? data.fulfilment_status : data.status;
                            if (statusLabel != null && badgeOrderDetailsStatus != null) {
                                orderStatus = statusLabel;
                                badgeOrderDetailsStatus.setText(statusLabel);
                            }
                            if (data.delivery_address != null && !data.delivery_address.isEmpty() && tvOrderDetailsAddress != null) {
                                tvOrderDetailsAddress.setText(data.delivery_address);
                            }

                            loadedItems.clear();
                            double computedSubtotal = 0;
                            if (data.items != null && !data.items.isEmpty()) {
                                loadedItems.addAll(data.items);
                                primaryFlowerId = data.items.get(0).flower_id;
                                for (OrderDetailResponse.DetailItem item : data.items) {
                                    computedSubtotal += (item.price * item.quantity);
                                }
                                renderDynamicItems(data.items);
                            }

                            double subtotalVal = data.subtotal > 0 ? data.subtotal : computedSubtotal;
                            double invoiceTotal = data.invoice != null ? data.invoice.total_amount : subtotalVal;
                            double feeVal = data.delivery_fee > 0 ? data.delivery_fee : Math.max(0, invoiceTotal - subtotalVal);

                            if (tvOrderSubtotal != null) {
                                tvOrderSubtotal.setText("Rs. " + String.format(Locale.US, "%,d", Math.round(subtotalVal)));
                            }
                            if (tvOrderDeliveryFee != null) {
                                tvOrderDeliveryFee.setText("Rs. " + String.format(Locale.US, "%,d", Math.round(feeVal)));
                            }
                            if (rowOrderDiscount != null) {
                                rowOrderDiscount.setVisibility(View.GONE);
                            }
                            if (tvOrderDetailsTotal != null) {
                                tvOrderDetailsTotal.setText("Rs. " + String.format(Locale.US, "%,d", Math.round(invoiceTotal)));
                            }

                            if (tvOrderPaymentMethod != null) {
                                if (data.payment != null && data.payment.payment_method != null) {
                                    String pm = data.payment.payment_method.toUpperCase();
                                    String pmText = "BANK_TRANSFER".equals(pm)
                                            ? "Paid via Direct Bank Transfer"
                                            : ("CASH".equals(pm) ? "Paid via Cash Settlement" : "Paid via Credit / Debit Card");
                                    tvOrderPaymentMethod.setText(pmText);
                                } else {
                                    tvOrderPaymentMethod.setText("Payment Status: " + (data.invoice != null ? data.invoice.status : "PAID"));
                                }
                            }

                            if (tvFulfillmentCare != null) {
                                StringBuilder fc = new StringBuilder();
                                if (data.supplier != null && data.supplier.supplier_name != null && !data.supplier.supplier_name.isEmpty()) {
                                    fc.append("Grower Estate: ").append(data.supplier.supplier_name);
                                    if (data.supplier.city != null && !data.supplier.city.isEmpty()) {
                                        fc.append(" (").append(data.supplier.city).append(")");
                                    }
                                }
                                if (data.delivery != null) {
                                    if (fc.length() > 0) fc.append("\n");
                                    fc.append("Delivery: ");
                                    if (data.delivery.driver_name != null && !data.delivery.driver_name.isEmpty()) {
                                        fc.append(data.delivery.driver_name);
                                        if (data.delivery.vehicle_number != null && !data.delivery.vehicle_number.isEmpty()) {
                                            fc.append(" • ").append(data.delivery.vehicle_number);
                                        }
                                    } else {
                                        fc.append("Petalio Express");
                                    }
                                    if (data.delivery.delivery_code != null && !data.delivery.delivery_code.isEmpty()) {
                                        fc.append(" (").append(data.delivery.delivery_code).append(")");
                                    }
                                }
                                tvFulfillmentCare.setText(fc.length() > 0 ? fc.toString() : "Fulfilled via Petalio Blossom Cold-Chain Logistics");
                            }
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<OrderDetailResponse> call, @NonNull Throwable t) {}
                });
    }

    private void renderDynamicItems(List<OrderDetailResponse.DetailItem> items) {
        if (llOrderDetailsItems == null) return;
        if (rowItem1 != null) rowItem1.setVisibility(View.GONE);
        if (rowItem2 != null) rowItem2.setVisibility(View.GONE);
        llOrderDetailsItems.removeAllViews();

        float density = getResources().getDisplayMetrics().density;
        int dp44 = (int) (44 * density);
        int dp14 = (int) (14 * density);
        int dp12 = (int) (12 * density);

        for (OrderDetailResponse.DetailItem item : items) {
            RelativeLayout row = new RelativeLayout(this);
            LinearLayout.LayoutParams rp = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
            rp.topMargin = dp14;
            row.setLayoutParams(rp);

            CardView imgCard = new CardView(this);
            imgCard.setId(View.generateViewId());
            RelativeLayout.LayoutParams cp = new RelativeLayout.LayoutParams(dp44, dp44);
            cp.addRule(RelativeLayout.ALIGN_PARENT_START);
            cp.addRule(RelativeLayout.CENTER_VERTICAL);
            imgCard.setLayoutParams(cp);
            imgCard.setRadius(10 * density);
            imgCard.setCardElevation(0f);

            ImageView iv = new ImageView(this);
            iv.setLayoutParams(new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.MATCH_PARENT));
            iv.setScaleType(ImageView.ScaleType.CENTER_CROP);
            iv.setImageResource(FlowerImageHelper.getDrawableForFlower(item.name));
            imgCard.addView(iv);
            row.addView(imgCard);

            TextView tvPrice = new TextView(this);
            tvPrice.setId(View.generateViewId());
            RelativeLayout.LayoutParams prp = new RelativeLayout.LayoutParams(
                    RelativeLayout.LayoutParams.WRAP_CONTENT, RelativeLayout.LayoutParams.WRAP_CONTENT);
            prp.addRule(RelativeLayout.ALIGN_PARENT_END);
            prp.addRule(RelativeLayout.CENTER_VERTICAL);
            tvPrice.setLayoutParams(prp);
            tvPrice.setText("Rs. " + String.format(Locale.US, "%,d", Math.round(item.price * item.quantity)));
            tvPrice.setTextColor(ContextCompat.getColor(this, R.color.primary_brand));
            tvPrice.setTextSize(14);
            tvPrice.setTypeface(null, android.graphics.Typeface.BOLD);
            row.addView(tvPrice);

            LinearLayout infoCol = new LinearLayout(this);
            infoCol.setOrientation(LinearLayout.VERTICAL);
            infoCol.setGravity(Gravity.CENTER_VERTICAL);
            RelativeLayout.LayoutParams ip = new RelativeLayout.LayoutParams(
                    RelativeLayout.LayoutParams.WRAP_CONTENT, RelativeLayout.LayoutParams.WRAP_CONTENT);
            ip.addRule(RelativeLayout.CENTER_VERTICAL);
            ip.addRule(RelativeLayout.END_OF, imgCard.getId());
            ip.addRule(RelativeLayout.START_OF, tvPrice.getId());
            ip.setMarginStart(dp12);
            ip.setMarginEnd(dp12);
            infoCol.setLayoutParams(ip);

            TextView tvTitle = new TextView(this);
            tvTitle.setText(item.name != null ? item.name : "Bloom");
            tvTitle.setTextColor(ContextCompat.getColor(this, R.color.text_primary));
            tvTitle.setTextSize(14);
            tvTitle.setTypeface(null, android.graphics.Typeface.BOLD);
            infoCol.addView(tvTitle);

            TextView tvQty = new TextView(this);
            tvQty.setText("Quantity: " + item.quantity + (item.quantity == 1 ? " stem" : " stems"));
            tvQty.setTextColor(ContextCompat.getColor(this, R.color.text_secondary));
            tvQty.setTextSize(12);
            infoCol.addView(tvQty);

            row.addView(infoCol);
            llOrderDetailsItems.addView(row);
        }
    }

    private String formatShortDate(String raw) {
        if (raw == null || raw.trim().isEmpty()) return "—";
        String clean = raw.replace("T", " ").replace("Z", "");
        return clean.length() >= 10 ? clean.substring(0, 10) : clean;
    }

    private void setupListeners() {
        AnimationUtilsHelper.applyPressScale(btnBackOrderDetails);
        AnimationUtilsHelper.applyPressScale(btnRateThisOrder);
        AnimationUtilsHelper.applyPressScale(btnReorder);

        btnBackOrderDetails.setOnClickListener(v -> supportFinishAfterTransition());

        btnRateThisOrder.setOnClickListener(v -> {
            Intent intent = new Intent(CustomerOrderDetailsActivity.this, RateOrderActivity.class);
            intent.putExtra("ORDER_DB_ID", orderDbId);
            intent.putExtra("ORDER_ID", orderId);
            intent.putExtra("FLOWER_ID", primaryFlowerId);
            startActivity(intent);
        });

        btnReorder.setOnClickListener(v -> {
            if (loadedItems.isEmpty()) {
                Toast.makeText(this, "Still loading order items, please wait.", Toast.LENGTH_SHORT).show();
                return;
            }
            for (OrderDetailResponse.DetailItem item : loadedItems) {
                CartManager.getInstance(this).addItem(new CartManager.CartItem(
                        item.flower_id,
                        item.name != null ? item.name : "Bloom",
                        item.category != null ? item.category : "General",
                        (int) Math.round(item.price),
                        Math.max(1, item.quantity),
                        item.name != null ? item.name.toLowerCase().replace(" ", "_") : ""
                ));
            }
            Toast.makeText(this, "Order " + orderId + " items added to your cart!", Toast.LENGTH_SHORT).show();
            Intent intent = new Intent(CustomerOrderDetailsActivity.this, CustomerMainActivity.class);
            intent.putExtra("TARGET_TAB", 1);
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            startActivity(intent);
            finish();
        });
    }
}
