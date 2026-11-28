package com.petalio.blossom.network;

public class ReminderDto {
    private int reminder_id;
    private int user_id;
    private String occasion_title;
    private String occasion_date;
    private String bouquet_preset;
    private String created_at;

    public ReminderDto() {}

    public ReminderDto(int user_id, String occasion_title, String occasion_date, String bouquet_preset) {
        this.user_id = user_id;
        this.occasion_title = occasion_title;
        this.occasion_date = occasion_date;
        this.bouquet_preset = bouquet_preset;
    }

    public int getReminderId() { return reminder_id; }
    public void setReminderId(int reminder_id) { this.reminder_id = reminder_id; }

    public int getUserId() { return user_id; }
    public void setUserId(int user_id) { this.user_id = user_id; }

    public String getOccasionTitle() { return occasion_title != null ? occasion_title : ""; }
    public void setOccasionTitle(String occasion_title) { this.occasion_title = occasion_title; }

    public String getOccasionDate() { return occasion_date != null ? occasion_date : ""; }
    public void setOccasionDate(String occasion_date) { this.occasion_date = occasion_date; }

    public String getBouquetPreset() { return bouquet_preset != null ? bouquet_preset : ""; }
    public void setBouquetPreset(String bouquet_preset) { this.bouquet_preset = bouquet_preset; }

    public String getCreatedAt() { return created_at != null ? created_at : ""; }
    public void setCreatedAt(String created_at) { this.created_at = created_at; }
}
