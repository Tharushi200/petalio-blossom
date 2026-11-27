package com.petalio.blossom;

import android.app.Application;
import androidx.appcompat.app.AppCompatDelegate;

/**
 * Petalio Blossom Application class.
 * Enforces consistent luxury botanical light theme across all devices and Android OS versions.
 */
public class PetalioApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        // Prevent dark mode from inverting custom botanical colors or turning dialogs dark grey
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO);
    }
}
