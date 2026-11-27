package com.petalio.blossom;

import android.app.DatePickerDialog;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.FlowerDto;
import com.petalio.blossom.network.FlowerReviewDto;
import com.petalio.blossom.network.SingleFlowerResponse;

import java.util.Calendar;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * C2. Flower Details & Place Order Screen.
 * Full-bleed luxury aesthetic, live social-proof, and synchronized sticky bottom bar.
 */
public class FlowerDetailActivity extends AppCompatActivity {

    private View btnBackDetail;
    private TextView tvDetailTitle;
    private ImageView btnFavDetail;
    private ImageView tvDetailBigIcon;
    private TextView tvDetailRatingSocial;
    private TextView tvDetailCategory, tvDetailPrice, tvDetailAvailable;
    private TextView btnQtyMinus, btnQtyPlus, tvQtyValue;
    private TextView btnQtyMinusBottom, btnQtyPlusBottom, tvQtyValueBottom;
    private ScrollView svFlowerDetail;
    private View cardReviewHighlight, cardRecentReviews, sectionRecentReviewsHeader;
    private TextView btnSelectDate, tvReviewHighlightText, tvReviewHighlightAction;
    private Button btnAddToCartDetail;
    private LinearLayout llFlowerReviewsContainer;
    private TextView tvEmptyFlowerReviews, tvReviewsCountBadge;

    private int quantity = 1;
    private int unitPrice = 0;
    private int availableStock = 0;
    private int flowerId = -1;
    private boolean isFav = false;
    private String selectedDate = "";
    private String flowerName = "";
    private int soldCount = 0;
    private double avgRating = 0.0;
    private int reviewCount = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_flower_detail);

        initViews();
        loadIntentData();
        setupListeners();
        updateQuantityDisplay();
        fetchLiveFlowerDetail();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (flowerId > 0) {
            fetchLiveFlowerDetail();
        }
    }

    private void initViews() {
        btnBackDetail = findViewById(R.id.btnBackDetail);
        tvDetailTitle = findViewById(R.id.tvDetailTitle);
        btnFavDetail = findViewById(R.id.btnFavDetail);

        tvDetailBigIcon = findViewById(R.id.tvDetailBigIcon);
        tvDetailRatingSocial = findViewById(R.id.tvDetailRatingSocial);
        tvDetailCategory = findViewById(R.id.tvDetailCategory);
        tvDetailPrice = findViewById(R.id.tvDetailPrice);
        tvDetailAvailable = findViewById(R.id.tvDetailAvailable);

        btnQtyMinus = findViewById(R.id.btnQtyMinus);
        btnQtyPlus = findViewById(R.id.btnQtyPlus);
        tvQtyValue = findViewById(R.id.tvQtyValue);

        btnQtyMinusBottom = findViewById(R.id.btnQtyMinusBottom);
        btnQtyPlusBottom = findViewById(R.id.btnQtyPlusBottom);
        tvQtyValueBottom = findViewById(R.id.tvQtyValueBottom);

        svFlowerDetail = findViewById(R.id.svFlowerDetail);
        btnSelectDate = findViewById(R.id.btnSelectDate);
        btnAddToCartDetail = findViewById(R.id.btnAddToCartDetail);
        cardReviewHighlight = findViewById(R.id.cardReviewHighlight);
        tvReviewHighlightText = findViewById(R.id.tvReviewHighlightText);
        tvReviewHighlightAction = findViewById(R.id.tvReviewHighlightAction);
        sectionRecentReviewsHeader = findViewById(R.id.sectionRecentReviewsHeader);
        cardRecentReviews = findViewById(R.id.cardRecentReviews);
        llFlowerReviewsContainer = findViewById(R.id.llFlowerReviewsContainer);
        tvEmptyFlowerReviews = findViewById(R.id.tvEmptyFlowerReviews);
        tvReviewsCountBadge = findViewById(R.id.tvReviewsCountBadge);
    }

    private void loadIntentData() {
        flowerId = getIntent().getIntExtra("FLOWER_ID", -1);
        String name = getIntent().getStringExtra("FLOWER_NAME");
        String category = getIntent().getStringExtra("FLOWER_CATEGORY");
        unitPrice = getIntent().getIntExtra("FLOWER_PRICE", 0);
        int available = getIntent().getIntExtra("FLOWER_AVAILABLE", 0);
        soldCount = getIntent().getIntExtra("FLOWER_SOLD", 0);
        avgRating = getIntent().getDoubleExtra("FLOWER_RATING", 0.0);
        reviewCount = getIntent().getIntExtra("FLOWER_REVIEWS", 0);

        bindFlowerUi(name, category, unitPrice, available, soldCount, avgRating, reviewCount);
    }

    private void fetchLiveFlowerDetail() {
        if (flowerId <= 0) return;
        ApiClient.getApiService(getApplicationContext())
                .getFlowerById(flowerId)
                .enqueue(new Callback<SingleFlowerResponse>() {
                    @Override
                    public void onResponse(@NonNull Call<SingleFlowerResponse> call, @NonNull Response<SingleFlowerResponse> response) {
                        if (isFinishing() || isDestroyed()) return;
                        if (response.isSuccessful() && response.body() != null && response.body().getFlower() != null) {
                            FlowerDto dto = response.body().getFlower();
                            flowerId = dto.getFlowerId();
                            unitPrice = (int) Math.round(dto.getUnitPrice());
                            soldCount = dto.getSoldCount();
                            avgRating = dto.getAvgRating();
                            reviewCount = dto.getReviewCount();
                            bindFlowerUi(dto.getName(), dto.getCategory(), unitPrice, dto.getStockQuantity(), soldCount, avgRating, reviewCount);
                            bindCustomerReviews(response.body().getReviews(), reviewCount);
                            updateQuantityDisplay();
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<SingleFlowerResponse> call, @NonNull Throwable t) {}
                });
    }

    private void bindCustomerReviews(List<FlowerReviewDto> reviews, int totalReviewsCount) {
        if (llFlowerReviewsContainer == null || tvEmptyFlowerReviews == null) return;
        llFlowerReviewsContainer.removeAllViews();

        if (reviews == null || reviews.isEmpty()) {
            if (cardReviewHighlight != null) cardReviewHighlight.setVisibility(View.GONE);
            llFlowerReviewsContainer.setVisibility(View.GONE);
            tvEmptyFlowerReviews.setVisibility(View.VISIBLE);
            tvEmptyFlowerReviews.setText("No reviews yet — be the first to review after delivery!");
            if (tvReviewsCountBadge != null) {
                tvReviewsCountBadge.setText("0 reviews");
            }
            return;
        }

        tvEmptyFlowerReviews.setVisibility(View.GONE);
        llFlowerReviewsContainer.setVisibility(View.VISIBLE);

        int total = Math.max(totalReviewsCount, reviews.size());
        if (tvReviewsCountBadge != null) {
            tvReviewsCountBadge.setText(total + (total == 1 ? " review" : " reviews"));
        }

        // Populate compact above-the-fold review highlight banner with latest review
        if (cardReviewHighlight != null && tvReviewHighlightText != null) {
            FlowerReviewDto latest = reviews.get(0);
            String ratingPrefix = String.format(Locale.US, "%.1f", (double) latest.getRating());
            String commentSnippet = latest.getComment();
            String bannerText = !commentSnippet.isEmpty()
                    ? (ratingPrefix + " \"" + commentSnippet + "\" — " + latest.getReviewerName())
                    : (ratingPrefix + " — " + latest.getReviewerName());
            tvReviewHighlightText.setText(bannerText);
            if (tvReviewHighlightAction != null) {
                tvReviewHighlightAction.setText("View all " + total + " ›");
            }
            cardReviewHighlight.setVisibility(View.VISIBLE);
        }

        float density = getResources().getDisplayMetrics().density;
        int displayLimit = Math.min(3, reviews.size());

        for (int i = 0; i < displayLimit; i++) {
            FlowerReviewDto rev = reviews.get(i);

            LinearLayout rowCard = new LinearLayout(this);
            rowCard.setOrientation(LinearLayout.VERTICAL);
            LinearLayout.LayoutParams rowParams = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
            if (i > 0) rowParams.topMargin = (int) (12 * density);
            rowCard.setLayoutParams(rowParams);

            // Top Row: Reviewer Name on left, Star Rating + Date on right
            LinearLayout topRow = new LinearLayout(this);
            topRow.setOrientation(LinearLayout.HORIZONTAL);
            topRow.setGravity(android.view.Gravity.CENTER_VERTICAL);

            TextView tvName = new TextView(this);
            LinearLayout.LayoutParams nameParams = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
            tvName.setLayoutParams(nameParams);
            tvName.setText(rev.getReviewerName());
            tvName.setTextColor(ContextCompat.getColor(this, R.color.text_primary));
            tvName.setTextSize(13f);
            tvName.setTypeface(null, android.graphics.Typeface.BOLD);
            tvName.setMaxLines(1);
            tvName.setEllipsize(android.text.TextUtils.TruncateAt.END);
            topRow.addView(tvName);

            TextView tvMeta = new TextView(this);
            StringBuilder stars = new StringBuilder();
            for (int s = 1; s <= 5; s++) {
                stars.append(s <= rev.getRating() ? "★" : "☆");
            }
            String dateLabel = formatReviewDate(rev.getCreatedAt());
            tvMeta.setText(dateLabel.isEmpty() ? stars.toString() : (stars + "  •  " + dateLabel));
            tvMeta.setTextColor(ContextCompat.getColor(this, R.color.gold_loyalty));
            tvMeta.setTextSize(12f);
            tvMeta.setTypeface(null, android.graphics.Typeface.BOLD);
            topRow.addView(tvMeta);

            rowCard.addView(topRow);

            // Review comment text
            if (!rev.getComment().isEmpty()) {
                TextView tvComment = new TextView(this);
                LinearLayout.LayoutParams commentParams = new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
                commentParams.topMargin = (int) (4 * density);
                tvComment.setLayoutParams(commentParams);
                tvComment.setText(rev.getComment());
                tvComment.setTextColor(ContextCompat.getColor(this, R.color.text_secondary));
                tvComment.setTextSize(13f);
                tvComment.setLineSpacing(2 * density, 1f);
                rowCard.addView(tvComment);
            }

            llFlowerReviewsContainer.addView(rowCard);

            if (i < displayLimit - 1) {
                View divider = new View(this);
                LinearLayout.LayoutParams divParams = new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT, Math.max(1, (int) density));
                divParams.topMargin = (int) (12 * density);
                divider.setLayoutParams(divParams);
                divider.setBackgroundColor(ContextCompat.getColor(this, R.color.divider_color));
                llFlowerReviewsContainer.addView(divider);
            }
        }
    }

    private String formatReviewDate(String raw) {
        if (raw == null || raw.trim().isEmpty()) return "";
        String clean = raw.replace("T", " ").replace("Z", "").trim();
        return clean.length() >= 10 ? clean.substring(0, 10) : clean;
    }

    private void bindFlowerUi(String name, String category, int price, int available, int sold, double rating, int reviews) {
        if (name != null && !name.isEmpty()) {
            flowerName = name;
            tvDetailTitle.setText(name);
        }
        if (category != null && !category.isEmpty()) {
            tvDetailCategory.setText("Category: " + category);
        }

        tvDetailBigIcon.clearColorFilter();
        tvDetailBigIcon.setImageResource(FlowerImageHelper.getDrawableForFlower(flowerName));
        if (!flowerName.isEmpty() && flowerName.toLowerCase().contains("rose") && !flowerName.toLowerCase().contains("tuberose")) {
            FlowerImageHelper.applyFocalCrop(tvDetailBigIcon, 0.15f);
        } else {
            FlowerImageHelper.resetCrop(tvDetailBigIcon);
        }

        availableStock = Math.max(0, available);
        tvDetailPrice.setText("Rs. " + price + " / stem");
        if (availableStock <= 0) {
            tvDetailAvailable.setText("Out of Stock");
            tvDetailAvailable.setTextColor(ContextCompat.getColor(this, R.color.badge_dispatched_text));
            quantity = 1;
            if (btnAddToCartDetail != null) {
                btnAddToCartDetail.setEnabled(false);
                btnAddToCartDetail.setAlpha(0.5f);
                btnAddToCartDetail.setText("Out of Stock");
            }
        } else {
            tvDetailAvailable.setText(availableStock + " stems available");
            tvDetailAvailable.setTextColor(ContextCompat.getColor(this, R.color.badge_in_stock_text));
            if (quantity > availableStock) {
                quantity = availableStock;
            }
            if (btnAddToCartDetail != null) {
                btnAddToCartDetail.setEnabled(true);
                btnAddToCartDetail.setAlpha(1f);
            }
        }

        if (tvDetailRatingSocial != null) {
            String soldText = sold > 0 ? (sold + " stems sold") : "Fresh Highland Harvest";
            if (reviews > 0 && rating > 0) {
                String reviewLabel = reviews == 1 ? "1 review" : (reviews + " reviews");
                tvDetailRatingSocial.setText(String.format(Locale.US, "%.1f", rating) + " (" + reviewLabel + ") ›  •  " + soldText);
            } else {
                tvDetailRatingSocial.setText("No reviews yet  •  " + soldText);
            }
        }

        isFav = WishlistManager.isFavorite(this, flowerName);
        updateFavIcon(isFav);
    }

    private void updateFavIcon(boolean fav) {
        btnFavDetail.setImageResource(fav ? R.drawable.ic_heart_filled : R.drawable.ic_heart_outline);
        btnFavDetail.setColorFilter(ContextCompat.getColor(this, fav ? R.color.accent_blossom_pink : R.color.text_primary));
    }

    private void updateQuantityDisplay() {
        String qStr = String.valueOf(quantity);
        if (tvQtyValue != null) tvQtyValue.setText(qStr);
        if (tvQtyValueBottom != null) tvQtyValueBottom.setText(qStr);

        int total = quantity * unitPrice;
        if (btnAddToCartDetail != null) {
            if (availableStock <= 0) {
                btnAddToCartDetail.setEnabled(false);
                btnAddToCartDetail.setAlpha(0.5f);
                btnAddToCartDetail.setText("Out of Stock");
            } else {
                btnAddToCartDetail.setEnabled(true);
                btnAddToCartDetail.setAlpha(1f);
                btnAddToCartDetail.setText("Add to Cart  •  Rs. " + total);
            }
        }

        // Stepper '+' button disabled at stock limit
        boolean canIncrement = availableStock > 0 && quantity < availableStock;
        if (btnQtyPlus != null) {
            btnQtyPlus.setEnabled(canIncrement);
            btnQtyPlus.setAlpha(canIncrement ? 1.0f : 0.4f);
        }
        if (btnQtyPlusBottom != null) {
            btnQtyPlusBottom.setEnabled(canIncrement);
            btnQtyPlusBottom.setAlpha(canIncrement ? 1.0f : 0.4f);
        }

        boolean canDecrement = quantity > 1 && availableStock > 0;
        if (btnQtyMinus != null) {
            btnQtyMinus.setEnabled(canDecrement);
            btnQtyMinus.setAlpha(canDecrement ? 1.0f : 0.4f);
        }
        if (btnQtyMinusBottom != null) {
            btnQtyMinusBottom.setEnabled(canDecrement);
            btnQtyMinusBottom.setAlpha(canDecrement ? 1.0f : 0.4f);
        }
    }

    private void scrollToRecentReviews() {
        if (svFlowerDetail == null) return;
        View target = sectionRecentReviewsHeader != null ? sectionRecentReviewsHeader : cardRecentReviews;
        if (target == null) return;
        svFlowerDetail.post(() -> {
            if (svFlowerDetail.getChildCount() == 0) return;
            android.graphics.Rect rect = new android.graphics.Rect();
            target.getDrawingRect(rect);
            ((android.view.ViewGroup) svFlowerDetail.getChildAt(0)).offsetDescendantRectToMyCoords(target, rect);
            int topOffset = (int) (16 * getResources().getDisplayMetrics().density);
            svFlowerDetail.smoothScrollTo(0, Math.max(0, rect.top - topOffset));
        });
    }

    private void setupListeners() {
        // Smooth reverse shared element transition on back
        btnBackDetail.setOnClickListener(v -> supportFinishAfterTransition());
        AnimationUtilsHelper.applyPressScale(btnBackDetail);

        // Smooth-scroll to Recent Customer Reviews from rating summary or highlight strip
        if (tvDetailRatingSocial != null) {
            tvDetailRatingSocial.setOnClickListener(v -> scrollToRecentReviews());
        }
        if (cardReviewHighlight != null) {
            AnimationUtilsHelper.applyPressScale(cardReviewHighlight);
            cardReviewHighlight.setOnClickListener(v -> scrollToRecentReviews());
        }

        // Tactile Wishlist Heart Bounce
        AnimationUtilsHelper.applyPressScale(btnFavDetail);
        btnFavDetail.setOnClickListener(v -> {
            AnimationUtilsHelper.playHeartBounce(btnFavDetail);
            isFav = WishlistManager.toggleFavorite(this, flowerName);
            updateFavIcon(isFav);
            Toast.makeText(this, isFav ? "Added to Wishlist!" : "Removed from Wishlist", Toast.LENGTH_SHORT).show();
        });

        // Inline Stepper
        if (btnQtyMinus != null) {
            AnimationUtilsHelper.applyPressScale(btnQtyMinus);
            btnQtyMinus.setOnClickListener(v -> {
                if (quantity > 1) {
                    quantity--;
                    updateQuantityDisplay();
                }
            });
        }
        if (btnQtyPlus != null) {
            AnimationUtilsHelper.applyPressScale(btnQtyPlus);
            btnQtyPlus.setOnClickListener(v -> incrementQuantityWithinStock());
        }

        // Sticky Bottom Stepper
        if (btnQtyMinusBottom != null) {
            AnimationUtilsHelper.applyPressScale(btnQtyMinusBottom);
            btnQtyMinusBottom.setOnClickListener(v -> {
                if (quantity > 1) {
                    quantity--;
                    updateQuantityDisplay();
                }
            });
        }
        if (btnQtyPlusBottom != null) {
            AnimationUtilsHelper.applyPressScale(btnQtyPlusBottom);
            btnQtyPlusBottom.setOnClickListener(v -> incrementQuantityWithinStock());
        }

        if (btnAddToCartDetail != null) {
            AnimationUtilsHelper.applyPressScale(btnAddToCartDetail);
        }

        if (btnSelectDate != null) {
            AnimationUtilsHelper.applyPressScale(btnSelectDate);
        }

        // Date Picker Dialog in Signature Petalio Rose-Burgundy Theme
        btnSelectDate.setOnClickListener(v -> {
            Calendar calendar = Calendar.getInstance();
            int year = calendar.get(Calendar.YEAR);
            int month = calendar.get(Calendar.MONTH);
            int day = calendar.get(Calendar.DAY_OF_MONTH);

            DatePickerDialog dialog = new DatePickerDialog(this, R.style.PetalioDatePickerTheme, (view, y, m, d) -> {
                selectedDate = d + "/" + (m + 1) + "/" + y;
                btnSelectDate.setText(selectedDate);
                btnSelectDate.setTextColor(ContextCompat.getColor(this, R.color.text_primary));
            }, year, month, day);
            dialog.getDatePicker().setMinDate(System.currentTimeMillis());
            dialog.setOnShowListener(d -> {
                Button positive = dialog.getButton(DatePickerDialog.BUTTON_POSITIVE);
                Button negative = dialog.getButton(DatePickerDialog.BUTTON_NEGATIVE);
                int burgundyColor = ContextCompat.getColor(this, R.color.petalio_burgundy);
                if (positive != null) {
                    positive.setTextColor(burgundyColor);
                    positive.setTypeface(null, android.graphics.Typeface.BOLD);
                }
                if (negative != null) {
                    negative.setTextColor(burgundyColor);
                }
            });
            dialog.show();
        });

        // Add to Cart Action with strict stock ceiling enforcement
        btnAddToCartDetail.setOnClickListener(v -> {
            if (availableStock <= 0) {
                Toast.makeText(this, flowerName + " is currently out of stock.", Toast.LENGTH_SHORT).show();
                return;
            }
            CartManager cartManager = CartManager.getInstance(this);
            int alreadyInCart = cartManager.getQuantityForFlower(flowerId);
            if (alreadyInCart + quantity > availableStock) {
                int remaining = Math.max(0, availableStock - alreadyInCart);
                String msg = remaining == 0
                        ? "Stock limit reached"
                        : ("Stock limit reached (Only " + remaining + " more stem" + (remaining == 1 ? "" : "s") + " available)");
                Toast.makeText(this, msg, Toast.LENGTH_SHORT).show();
                return;
            }
            int total = quantity * unitPrice;
            String cat = tvDetailCategory != null ? tvDetailCategory.getText().toString().replace("Category: ", "") : "Blossom";
            cartManager.addItem(new CartManager.CartItem(
                    flowerId,
                    flowerName,
                    cat,
                    unitPrice,
                    quantity,
                    flowerName.toLowerCase(),
                    availableStock
            ));
            Toast.makeText(this, "Added " + quantity + "x " + flowerName + " to Cart! (Rs. " + total + ")", Toast.LENGTH_SHORT).show();
            finish();
        });
    }

    private void incrementQuantityWithinStock() {
        if (availableStock <= 0) {
            Toast.makeText(this, flowerName + " is currently out of stock.", Toast.LENGTH_SHORT).show();
            updateQuantityDisplay();
            return;
        }
        if (quantity < availableStock) {
            quantity++;
            updateQuantityDisplay();
            if (quantity >= availableStock) {
                Toast.makeText(this, "Stock limit reached", Toast.LENGTH_SHORT).show();
            }
        } else {
            Toast.makeText(this, "Stock limit reached", Toast.LENGTH_SHORT).show();
            updateQuantityDisplay();
        }
    }
}
