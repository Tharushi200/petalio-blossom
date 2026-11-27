package com.petalio.blossom;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import com.petalio.blossom.network.ApiClient;
import com.petalio.blossom.network.CommonResponse;
import com.petalio.blossom.network.ReviewRequest;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * O5. Ratings & Reviews Activity for Petalio Blossom.
 * Persists verified ratings to MySQL `rating_reviews` using real order/flower/customer IDs.
 */
public class RateOrderActivity extends AppCompatActivity {

    private View btnBackRate;
    private ImageView rateStar1, rateStar2, rateStar3, rateStar4, rateStar5;
    private EditText etRateReviewText;
    private Button btnSubmitReviewAction;

    private int selectedRating = 5;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_rate_order);

        initViews();
        setupListeners();

        int presetRating = getIntent().getIntExtra("PRESET_RATING", 5);
        selectedRating = presetRating;
        updateStars();
    }

    private void initViews() {
        btnBackRate = findViewById(R.id.btnBackRate);
        rateStar1 = findViewById(R.id.rateStar1);
        rateStar2 = findViewById(R.id.rateStar2);
        rateStar3 = findViewById(R.id.rateStar3);
        rateStar4 = findViewById(R.id.rateStar4);
        rateStar5 = findViewById(R.id.rateStar5);
        etRateReviewText = findViewById(R.id.etRateReviewText);
        btnSubmitReviewAction = findViewById(R.id.btnSubmitReviewAction);
    }

    private void setupListeners() {
        AnimationUtilsHelper.applyPressScale(btnBackRate);
        AnimationUtilsHelper.applyPressScale(btnSubmitReviewAction);
        btnBackRate.setOnClickListener(v -> supportFinishAfterTransition());

        ImageView[] stars = {rateStar1, rateStar2, rateStar3, rateStar4, rateStar5};
        for (int i = 0; i < stars.length; i++) {
            final int starNum = i + 1;
            stars[i].setOnClickListener(v -> {
                AnimationUtilsHelper.playHeartBounce(v);
                selectedRating = starNum;
                updateStars();
            });
        }

        btnSubmitReviewAction.setOnClickListener(v -> {
            String review = etRateReviewText.getText() != null ? etRateReviewText.getText().toString().trim() : "";
            if (review.isEmpty()) {
                etRateReviewText.setError("Please write a few words about your flower order experience");
                etRateReviewText.requestFocus();
                return;
            }

            int customerId = PetalioUserPrefs.getCustomerId(this);
            if (customerId <= 0) customerId = PetalioUserPrefs.getUserId(this);
            if (customerId <= 0) {
                Toast.makeText(this, "Please sign in as a customer to submit a review.", Toast.LENGTH_SHORT).show();
                return;
            }

            int orderDbId = getIntent().getIntExtra("ORDER_DB_ID", -1);
            int flowerId = getIntent().getIntExtra("FLOWER_ID", -1);
            String orderCode = getIntent().getStringExtra("ORDER_ID");

            btnSubmitReviewAction.setEnabled(false);

            ReviewRequest reviewReq = new ReviewRequest(
                    orderDbId > 0 ? orderDbId : 0,
                    orderCode,
                    customerId,
                    flowerId > 0 ? flowerId : 0,
                    selectedRating,
                    review
            );

            ApiClient.getApiService(this).submitReview(reviewReq)
                    .enqueue(new Callback<CommonResponse>() {
                        @Override
                        public void onResponse(@NonNull Call<CommonResponse> call, @NonNull Response<CommonResponse> response) {
                            if (isFinishing() || isDestroyed()) return;
                            if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                                Toast.makeText(RateOrderActivity.this, "✓ Thank you! Your " + selectedRating + "-star review has been submitted.", Toast.LENGTH_LONG).show();
                                finish();
                            } else {
                                btnSubmitReviewAction.setEnabled(true);
                                String msg = response.body() != null && !response.body().getMessage().isEmpty()
                                        ? response.body().getMessage()
                                        : "Could not publish review. Please try again.";
                                Toast.makeText(RateOrderActivity.this, msg, Toast.LENGTH_LONG).show();
                            }
                        }

                        @Override
                        public void onFailure(@NonNull Call<CommonResponse> call, @NonNull Throwable t) {
                            if (isFinishing() || isDestroyed()) return;
                            btnSubmitReviewAction.setEnabled(true);
                            Toast.makeText(RateOrderActivity.this, "Network error: Could not submit review. Please try again.", Toast.LENGTH_SHORT).show();
                        }
                    });
        });
    }

    private void updateStars() {
        ImageView[] stars = {rateStar1, rateStar2, rateStar3, rateStar4, rateStar5};
        int activeColor = ContextCompat.getColor(this, R.color.accent_blossom_pink);
        int inactiveColor = ContextCompat.getColor(this, R.color.text_hint);

        for (int i = 0; i < stars.length; i++) {
            if (i < selectedRating) {
                stars[i].setImageResource(R.drawable.ic_star_rate);
                stars[i].setColorFilter(activeColor);
            } else {
                stars[i].setImageResource(R.drawable.ic_star_outline);
                stars[i].setColorFilter(inactiveColor);
            }
        }
    }
}
