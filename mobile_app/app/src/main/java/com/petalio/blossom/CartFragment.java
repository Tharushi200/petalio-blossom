package com.petalio.blossom;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.cardview.widget.CardView;
import androidx.fragment.app.Fragment;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.FlowerDto;
import com.petalio.blossom.network.FlowersResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * C3. Shopping Cart, Confirmation & Payment Fragment.
 * Wired directly to CartManager for real persistent items, steppers, and live totals.
 */
public class CartFragment extends Fragment {

    private LinearLayout layoutCartEmpty;
    private View btnExploreBlooms;
    private View bottomPayBar;
    private LinearLayout layoutCartItemsContainer;
    private CardView cardPaymentMethod;
    private CardView cardCostBreakdown;
    private TextView tvCartSubtotal, tvCartDeliveryFee, tvCartTotalAmount;
    private RadioGroup rgPaymentMethod;
    private RadioButton rbCard, rbBankTransfer;
    private Button btnConfirmOrderPay;

    // Retained for backward compatibility
    private CardView cardCartItem1, cardCartItem2;
    private TextView btnRemoveCart1, btnRemoveCart2;
    private TextView tvCartTitle1, tvCartTitle2, tvCartDesc1, tvCartDesc2, tvCartPrice1, tvCartPrice2;
    private ImageView ivCartImg1, ivCartImg2;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_cart, container, false);

        initViews(view);
        setupListeners();
        renderCart();

        return view;
    }

    @Override
    public void onResume() {
        super.onResume();
        if (!isHidden()) {
            renderCart();
            syncLiveCartStock();
        }
    }

    @Override
    public void onHiddenChanged(boolean hidden) {
        super.onHiddenChanged(hidden);
        if (!hidden && isAdded()) {
            renderCart();
            syncLiveCartStock();
        }
    }

    private void syncLiveCartStock() {
        if (getContext() == null) return;
        CartManager cartManager = CartManager.getInstance(getContext());
        if (cartManager.getItems().isEmpty()) return;

        ApiClient.getApiService(getContext()).getFlowers().enqueue(new Callback<FlowersResponse>() {
            @Override
            public void onResponse(@NonNull Call<FlowersResponse> call, @NonNull Response<FlowersResponse> response) {
                if (!isAdded() || getContext() == null) return;
                if (response.isSuccessful() && response.body() != null && response.body().getFlowers() != null) {
                    boolean anyAdjusted = false;
                    CartManager manager = CartManager.getInstance(getContext());
                    List<CartManager.CartItem> before = manager.getItems();
                    for (FlowerDto dto : response.body().getFlowers()) {
                        for (CartManager.CartItem ci : before) {
                            if (ci.getFlowerId() == dto.getFlowerId() && (dto.getStockQuantity() <= 0 || ci.getQuantity() > dto.getStockQuantity())) {
                                anyAdjusted = true;
                            }
                        }
                        manager.updateMaxStock(dto.getFlowerId(), dto.getStockQuantity());
                    }
                    if (anyAdjusted) {
                        Toast.makeText(getContext(), "Cart quantities were adjusted to match live stem availability.", Toast.LENGTH_SHORT).show();
                    }
                    renderCart();
                    if (getActivity() instanceof CustomerMainActivity) {
                        ((CustomerMainActivity) getActivity()).updateCartBadge();
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<FlowersResponse> call, @NonNull Throwable t) {}
        });
    }

    private void initViews(View v) {
        layoutCartEmpty = v.findViewById(R.id.layoutCartEmpty);
        btnExploreBlooms = v.findViewById(R.id.btnExploreBlooms);
        bottomPayBar = v.findViewById(R.id.bottomPayBar);
        layoutCartItemsContainer = v.findViewById(R.id.layoutCartItemsContainer);
        cardPaymentMethod = v.findViewById(R.id.cardPaymentMethod);
        cardCostBreakdown = v.findViewById(R.id.cardCostBreakdown);
        tvCartSubtotal = v.findViewById(R.id.tvCartSubtotal);
        tvCartDeliveryFee = v.findViewById(R.id.tvCartDeliveryFee);
        tvCartTotalAmount = v.findViewById(R.id.tvCartTotalAmount);
        rgPaymentMethod = v.findViewById(R.id.rgPaymentMethod);
        rbCard = v.findViewById(R.id.rbCard);
        rbBankTransfer = v.findViewById(R.id.rbBankTransfer);
        btnConfirmOrderPay = v.findViewById(R.id.btnConfirmOrderPay);

        // Retained views
        cardCartItem1 = v.findViewById(R.id.cardCartItem1);
        cardCartItem2 = v.findViewById(R.id.cardCartItem2);
        btnRemoveCart1 = v.findViewById(R.id.btnRemoveCart1);
        btnRemoveCart2 = v.findViewById(R.id.btnRemoveCart2);
        tvCartTitle1 = v.findViewById(R.id.tvCartTitle1);
        tvCartTitle2 = v.findViewById(R.id.tvCartTitle2);
        tvCartDesc1 = v.findViewById(R.id.tvCartDesc1);
        tvCartDesc2 = v.findViewById(R.id.tvCartDesc2);
        tvCartPrice1 = v.findViewById(R.id.tvCartPrice1);
        tvCartPrice2 = v.findViewById(R.id.tvCartPrice2);
        ivCartImg1 = v.findViewById(R.id.ivCartImg1);
        ivCartImg2 = v.findViewById(R.id.ivCartImg2);
    }

    private void renderCart() {
        if (getContext() == null) return;
        List<CartManager.CartItem> items = CartManager.getInstance(getContext()).getItems();

        if (items.isEmpty()) {
            if (layoutCartEmpty != null) layoutCartEmpty.setVisibility(View.VISIBLE);
            if (layoutCartItemsContainer != null) {
                layoutCartItemsContainer.removeAllViews();
                layoutCartItemsContainer.setVisibility(View.GONE);
            }
            if (cardPaymentMethod != null) cardPaymentMethod.setVisibility(View.GONE);
            if (cardCostBreakdown != null) cardCostBreakdown.setVisibility(View.GONE);
            if (bottomPayBar != null) bottomPayBar.setVisibility(View.GONE);
            if (btnConfirmOrderPay != null) {
                btnConfirmOrderPay.setVisibility(View.GONE);
                btnConfirmOrderPay.setEnabled(false);
            }
            if (tvCartSubtotal != null) tvCartSubtotal.setText("Rs. 0");
            if (tvCartTotalAmount != null) tvCartTotalAmount.setText("Rs. 0");
            return;
        }

        if (layoutCartEmpty != null) layoutCartEmpty.setVisibility(View.GONE);
        if (cardPaymentMethod != null) cardPaymentMethod.setVisibility(View.VISIBLE);
        if (cardCostBreakdown != null) cardCostBreakdown.setVisibility(View.VISIBLE);
        if (bottomPayBar != null) bottomPayBar.setVisibility(View.VISIBLE);
        if (btnConfirmOrderPay != null) {
            btnConfirmOrderPay.setVisibility(View.VISIBLE);
            btnConfirmOrderPay.setEnabled(true);
        }

        if (layoutCartItemsContainer != null) {
            layoutCartItemsContainer.setVisibility(View.VISIBLE);
            layoutCartItemsContainer.removeAllViews();

            LayoutInflater inflater = LayoutInflater.from(getContext());
            for (CartManager.CartItem item : items) {
                View itemView = inflater.inflate(R.layout.item_cart_product, layoutCartItemsContainer, false);

                ImageView ivCartItemPhoto = itemView.findViewById(R.id.ivCartItemPhoto);
                TextView tvCartItemTitle = itemView.findViewById(R.id.tvCartItemTitle);
                TextView tvCartItemUnitPrice = itemView.findViewById(R.id.tvCartItemUnitPrice);
                ImageView btnCartItemMinus = itemView.findViewById(R.id.btnCartItemMinus);
                TextView tvCartItemQuantity = itemView.findViewById(R.id.tvCartItemQuantity);
                ImageView btnCartItemPlus = itemView.findViewById(R.id.btnCartItemPlus);
                TextView tvCartItemLineTotal = itemView.findViewById(R.id.tvCartItemLineTotal);
                TextView btnCartItemRemove = itemView.findViewById(R.id.btnCartItemRemove);

                tvCartItemTitle.setText(item.getName());
                tvCartItemUnitPrice.setText("Rs. " + item.getUnitPrice() + " / stem");
                tvCartItemQuantity.setText(String.valueOf(item.getQuantity()));
                tvCartItemLineTotal.setText("Rs. " + item.getTotalPrice());
                FlowerImageHelper.loadFlowerImage(
                        ivCartItemPhoto,
                        getContext(),
                        FlowerImageHelper.getDrawableForFlower(item.getName()),
                        80, 80, false, 0.5f
                );

                // Tactile Spring Touch feedback
                AnimationUtilsHelper.applyPressScale(btnCartItemMinus);
                AnimationUtilsHelper.applyPressScale(btnCartItemPlus);
                AnimationUtilsHelper.applyPressScale(btnCartItemRemove);

                // Stepper "-" button
                btnCartItemMinus.setOnClickListener(v -> {
                    int newQty = item.getQuantity() - 1;
                    if (newQty <= 0) {
                        CartManager.getInstance(getContext()).removeItem(item.getFlowerId());
                        Toast.makeText(getContext(), item.getName() + " removed from cart", Toast.LENGTH_SHORT).show();
                    } else {
                        CartManager.getInstance(getContext()).updateQuantity(item.getFlowerId(), newQty);
                    }
                    renderCart();
                });

                // Stepper "+" button with live stock cap
                btnCartItemPlus.setOnClickListener(v -> {
                    int newQty = item.getQuantity() + 1;
                    int maxStock = item.getMaxStock();
                    if (maxStock > 0 && newQty > maxStock) {
                        Toast.makeText(getContext(), "Only " + maxStock + " stems available for " + item.getName(), Toast.LENGTH_SHORT).show();
                        return;
                    }
                    CartManager.getInstance(getContext()).updateQuantity(item.getFlowerId(), newQty);
                    renderCart();
                });

                // Remove text button
                btnCartItemRemove.setOnClickListener(v -> {
                    CartManager.getInstance(getContext()).removeItem(item.getFlowerId());
                    Toast.makeText(getContext(), item.getName() + " removed from cart", Toast.LENGTH_SHORT).show();
                    renderCart();
                });

                layoutCartItemsContainer.addView(itemView);
            }
        }

        // Live calculation of subtotal, delivery fee and grand total
        int subtotal = CartManager.getInstance(getContext()).getTotalAmount();
        int deliveryFee = 200;
        int grandTotal = subtotal + deliveryFee;

        if (tvCartSubtotal != null) tvCartSubtotal.setText("Rs. " + subtotal);
        if (tvCartDeliveryFee != null) tvCartDeliveryFee.setText("Rs. " + deliveryFee);
        if (tvCartTotalAmount != null) tvCartTotalAmount.setText("Rs. " + grandTotal);
        if (btnConfirmOrderPay != null) {
            btnConfirmOrderPay.setText("Confirm Order & Pay • Rs. " + grandTotal);
        }
    }

    private void setupListeners() {
        if (btnExploreBlooms != null) {
            AnimationUtilsHelper.applyPressScale(btnExploreBlooms);
            btnExploreBlooms.setOnClickListener(v -> {
                if (getActivity() instanceof CustomerMainActivity) {
                    ((CustomerMainActivity) getActivity()).switchTab(0);
                }
            });
        }

        if (btnConfirmOrderPay != null) {
            AnimationUtilsHelper.applyPressScale(btnConfirmOrderPay);
        }

        // Launch O2: Digital Payment Activity
        btnConfirmOrderPay.setOnClickListener(v -> {
            if (getContext() == null) return;
            int customerId = PetalioUserPrefs.getCustomerId(getContext());
            if (customerId <= 0) customerId = PetalioUserPrefs.getUserId(getContext());
            if (customerId <= 0) {
                Toast.makeText(getContext(), "Please sign in as a customer to checkout.", Toast.LENGTH_SHORT).show();
                return;
            }
            int subtotal = CartManager.getInstance(getContext()).getTotalAmount();
            if (subtotal <= 0) {
                Toast.makeText(getContext(), "Your cart is empty! Please add flowers to your cart before proceeding to payment.", Toast.LENGTH_SHORT).show();
                return;
            }
            int grandTotal = subtotal + 200;
            Intent intent = new Intent(getContext(), PaymentActivity.class);
            intent.putExtra("TOTAL_AMOUNT", grandTotal);
            intent.putExtra("SUBTOTAL", subtotal);
            intent.putExtra("DELIVERY_FEE", 200);
            intent.putExtra("ORDER_ID", "PB-" + (1000 + (int) (Math.random() * 9000)));
            intent.putExtra("DELIVERY_DATE", "Delivery Tomorrow");
            startActivity(intent);
        });
    }
}
