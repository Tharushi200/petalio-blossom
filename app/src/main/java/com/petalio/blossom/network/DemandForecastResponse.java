package com.petalio.blossom.network;

import java.util.List;

public class DemandForecastResponse {
    private boolean success;
    private List<DemandForecastDto> forecasts;

    public boolean isSuccess() { return success; }
    public List<DemandForecastDto> getForecasts() { return forecasts; }
}
