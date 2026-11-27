package com.petalio.blossom;

import android.content.Context;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.drawable.Drawable;
import android.os.Handler;
import android.os.Looper;
import android.util.LruCache;
import android.widget.ImageView;

import androidx.annotation.DrawableRes;
import androidx.core.content.ContextCompat;

import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * FlowerImageHelper: Maps flower names to their authentic botanical drawables,
 * provides downsampled LruCache + background-thread image loading so large JPEGs never
 * block the main UI thread, and applies top focal-aligned cropping for tall flowers.
 */
public class FlowerImageHelper {

    private static final int CACHE_SIZE_KB = (int) Math.min(48 * 1024L, (Runtime.getRuntime().maxMemory() / 1024L) / 6L);

    private static final LruCache<String, Bitmap> BITMAP_CACHE = new LruCache<String, Bitmap>(Math.max(4096, CACHE_SIZE_KB)) {
        @Override
        protected int sizeOf(String key, Bitmap bitmap) {
            return bitmap != null ? Math.max(1, bitmap.getByteCount() / 1024) : 1;
        }
    };

    private static final ExecutorService IMAGE_EXECUTOR = Executors.newFixedThreadPool(3);
    private static final Handler MAIN_HANDLER = new Handler(Looper.getMainLooper());

    public static void loadFlowerImage(
            final ImageView imageView,
            final Context context,
            @DrawableRes final int resId,
            final int reqWidthDp,
            final int reqHeightDp,
            final boolean applyTopCrop,
            final float focalY
    ) {
        if (imageView == null || context == null) return;

        float density = context.getResources().getDisplayMetrics().density;
        final int reqWidthPx = Math.max(80, Math.round(reqWidthDp * density));
        final int reqHeightPx = Math.max(80, Math.round(reqHeightDp * density));
        final String cacheKey = resId + "_" + reqWidthPx + "x" + reqHeightPx;

        Object existingTag = imageView.getTag(R.id.tag_flower_image_key);
        Bitmap cached = BITMAP_CACHE.get(cacheKey);
        if (cached != null && !cached.isRecycled()) {
            if (!cacheKey.equals(existingTag) || imageView.getDrawable() == null) {
                imageView.setTag(R.id.tag_flower_image_key, cacheKey);
                imageView.setBackgroundColor(Color.TRANSPARENT);
                imageView.setImageBitmap(cached);
            }
            if (applyTopCrop) {
                applyFocalCrop(imageView, focalY);
            } else {
                resetCrop(imageView);
            }
            return;
        }

        imageView.setTag(R.id.tag_flower_image_key, cacheKey);
        imageView.setImageDrawable(null);
        imageView.setBackgroundColor(ContextCompat.getColor(context, R.color.card_flower_thumb));

        final Context appContext = context.getApplicationContext();
        IMAGE_EXECUTOR.execute(() -> {
            Bitmap bmp = BITMAP_CACHE.get(cacheKey);
            if (bmp == null || bmp.isRecycled()) {
                bmp = decodeSampledBitmap(appContext.getResources(), resId, reqWidthPx, reqHeightPx);
                if (bmp != null) {
                    BITMAP_CACHE.put(cacheKey, bmp);
                }
            }
            final Bitmap finalBitmap = bmp;
            if (finalBitmap == null) return;

            MAIN_HANDLER.post(() -> {
                Object activeTag = imageView.getTag(R.id.tag_flower_image_key);
                if (!cacheKey.equals(activeTag)) return;
                imageView.setBackgroundColor(Color.TRANSPARENT);
                imageView.setImageBitmap(finalBitmap);
                if (applyTopCrop) {
                    applyFocalCrop(imageView, focalY);
                } else {
                    resetCrop(imageView);
                }
            });
        });
    }

    public static void preloadFlowerImages(final Context context, final List<WishlistManager.FlowerItem> items, final int reqWidthDp, final int reqHeightDp) {
        if (context == null || items == null || items.isEmpty()) return;
        final Context appContext = context.getApplicationContext();
        float density = appContext.getResources().getDisplayMetrics().density;
        final int reqWidthPx = Math.max(80, Math.round(reqWidthDp * density));
        final int reqHeightPx = Math.max(80, Math.round(reqHeightDp * density));

        IMAGE_EXECUTOR.execute(() -> {
            Resources res = appContext.getResources();
            for (WishlistManager.FlowerItem item : items) {
                if (item == null) continue;
                int resId = getDrawableForFlower(item.name);
                String key = resId + "_" + reqWidthPx + "x" + reqHeightPx;
                Bitmap existing = BITMAP_CACHE.get(key);
                if (existing == null || existing.isRecycled()) {
                    Bitmap decoded = decodeSampledBitmap(res, resId, reqWidthPx, reqHeightPx);
                    if (decoded != null) {
                        BITMAP_CACHE.put(key, decoded);
                    }
                }
            }
        });
    }

    private static Bitmap decodeSampledBitmap(Resources res, @DrawableRes int resId, int reqWidth, int reqHeight) {
        try {
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inJustDecodeBounds = true;
            BitmapFactory.decodeResource(res, resId, options);

            options.inSampleSize = calculateInSampleSize(options, reqWidth, reqHeight);
            options.inJustDecodeBounds = false;
            return BitmapFactory.decodeResource(res, resId, options);
        } catch (Throwable t) {
            return null;
        }
    }

    private static int calculateInSampleSize(BitmapFactory.Options options, int reqWidth, int reqHeight) {
        int height = options.outHeight;
        int width = options.outWidth;
        int inSampleSize = 1;

        if (height > reqHeight || width > reqWidth) {
            int halfHeight = height / 2;
            int halfWidth = width / 2;
            while ((halfHeight / inSampleSize) >= reqHeight && (halfWidth / inSampleSize) >= reqWidth) {
                inSampleSize *= 2;
            }
        }
        return inSampleSize;
    }

    @DrawableRes
    public static int getDrawableForFlower(String name) {
        if (name == null) return R.drawable.img_flower_rose;
        String clean = name.trim().toLowerCase();

        if (clean.contains("rose") && !clean.contains("tuberose")) {
            return R.drawable.img_flower_rose;
        } else if (clean.contains("orchid")) {
            return R.drawable.img_flower_orchid;
        } else if (clean.contains("lily") || clean.contains("lilies")) {
            return R.drawable.img_flower_lily;
        } else if (clean.contains("carnation")) {
            return R.drawable.img_flower_carnation;
        } else if (clean.contains("chrysanthemum")) {
            return R.drawable.img_flower_chrysanthemum;
        } else if (clean.contains("gerbera")) {
            return R.drawable.img_flower_gerbera;
        } else if (clean.contains("lisianthus")) {
            return R.drawable.img_flower_lisianthus;
        } else if (clean.contains("lavender")) {
            return R.drawable.img_flower_lavender;
        } else if (clean.contains("baby") || clean.contains("breath")) {
            return R.drawable.img_flower_baby_breath;
        } else if (clean.contains("sunflower")) {
            return R.drawable.img_flower_sunflower;
        } else if (clean.contains("tulip")) {
            return R.drawable.img_flower_tulip;
        } else if (clean.contains("hydrangea")) {
            return R.drawable.img_flower_hydrangea;
        } else if (clean.contains("peony")) {
            return R.drawable.img_flower_peony;
        } else if (clean.contains("freesia")) {
            return R.drawable.img_flower_freesia;
        } else if (clean.contains("bird") || clean.contains("paradise")) {
            return R.drawable.img_flower_bird_paradise;
        } else if (clean.contains("ranunculus")) {
            return R.drawable.img_flower_ranunculus;
        } else if (clean.contains("tuberose")) {
            return R.drawable.img_flower_tuberose;
        } else if (clean.contains("eucalyptus")) {
            return R.drawable.img_flower_eucalyptus;
        } else if (clean.contains("alstroemeria")) {
            return R.drawable.img_flower_alstroemeria;
        }

        return R.drawable.img_flower_rose;
    }

    /**
     * Aligns vertical crop toward the top (focal point focalY ~ 0.15 instead of 0.5)
     * so top petals and upper blossoms are never cropped off.
     */
    public static void applyFocalCrop(final ImageView imageView, final float focalY) {
        if (imageView == null) return;
        imageView.setScaleType(ImageView.ScaleType.MATRIX);

        final Runnable updateMatrix = new Runnable() {
            @Override
            public void run() {
                Drawable drawable = imageView.getDrawable();
                if (drawable == null) return;
                int viewWidth = imageView.getWidth() - imageView.getPaddingLeft() - imageView.getPaddingRight();
                int viewHeight = imageView.getHeight() - imageView.getPaddingTop() - imageView.getPaddingBottom();
                int dWidth = drawable.getIntrinsicWidth();
                int dHeight = drawable.getIntrinsicHeight();
                if (viewWidth <= 0 || viewHeight <= 0 || dWidth <= 0 || dHeight <= 0) return;

                float scaleX = (float) viewWidth / (float) dWidth;
                float scaleY = (float) viewHeight / (float) dHeight;
                float scale = Math.max(scaleX, scaleY);

                float scaledWidth = dWidth * scale;
                float scaledHeight = dHeight * scale;

                float dx = (viewWidth - scaledWidth) * 0.5f + imageView.getPaddingLeft();
                float dy = (viewHeight - scaledHeight) * focalY + imageView.getPaddingTop();

                Matrix matrix = new Matrix();
                matrix.setScale(scale, scale);
                matrix.postTranslate(Math.round(dx), Math.round(dy));
                imageView.setImageMatrix(matrix);
            }
        };

        if (imageView.getWidth() > 0 && imageView.getHeight() > 0) {
            updateMatrix.run();
        } else {
            imageView.post(updateMatrix);
        }
    }

    /**
     * Resets ImageView back to default CENTER_CROP for non-focal items.
     */
    public static void resetCrop(ImageView imageView) {
        if (imageView == null) return;
        imageView.setImageMatrix(null);
        imageView.setScaleType(ImageView.ScaleType.CENTER_CROP);
    }
}
