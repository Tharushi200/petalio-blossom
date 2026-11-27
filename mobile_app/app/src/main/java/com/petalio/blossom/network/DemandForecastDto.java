package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;

public class DemandForecastDto {
    @SerializedName("forecast_id")
    private int forecastId;

    @SerializedName("flower_id")
    private int flowerId;

    @SerializedName("season_event")
    private String seasonEvent;

    @SerializedName("predicted_demand")
    private int predictedDemand;

    @SerializedName("unit_price")
    private double unitPrice;

    @SerializedName("forecast_date")
    private String forecastDate;

    @SerializedName("flower_name")
    private String flowerName;

    @SerializedName("current_stock")
    private int currentStock;

    @SerializedName("live_ordered_stems")
    private int liveOrderedStems;

    private String category;
    private String color;

    public int getForecastId() { return forecastId; }
    public int getFlowerId() { return flowerId; }
    public String getSeasonEvent() { return seasonEvent != null ? seasonEvent : "Next 30 Days"; }
    public int getPredictedDemand() { return predictedDemand; }
    public int getCurrentStock() { return Math.max(0, currentStock); }
    public int getLiveOrderedStems() { return Math.max(0, liveOrderedStems); }
    public double getUnitPrice() { return unitPrice; }
    public String getForecastDate() { return forecastDate != null ? forecastDate : ""; }
    public String getFlowerName() { return flowerName != null ? flowerName : "Flower"; }
    public String getCategory() { return category != null ? category : ""; }
    public String getColor() { return color != null ? color : ""; }
}
