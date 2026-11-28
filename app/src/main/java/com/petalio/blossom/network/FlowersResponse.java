package com.petalio.blossom.network;

import java.util.Collections;
import java.util.List;

public class FlowersResponse {
    private boolean success;
    private int count;
    private List<FlowerDto> flowers;

    public boolean isSuccess() { return success; }
    public int getCount() { return count; }
    public List<FlowerDto> getFlowers() { return flowers != null ? flowers : Collections.emptyList(); }
}

