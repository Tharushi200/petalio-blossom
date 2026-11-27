package com.petalio.blossom.network;

import java.util.List;

public class DeclaredFlowersResponse {
    private boolean success;
    private int count;
    private List<DeclaredFlowerDto> flowers;

    public boolean isSuccess() { return success; }
    public int getCount() { return count; }
    public List<DeclaredFlowerDto> getFlowers() { return flowers; }
}
