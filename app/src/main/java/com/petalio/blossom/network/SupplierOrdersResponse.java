package com.petalio.blossom.network;

import java.util.List;

public class SupplierOrdersResponse {
    private boolean success;
    private List<SupplierOrderRequestDto> requests;

    public boolean isSuccess() { return success; }
    public List<SupplierOrderRequestDto> getRequests() { return requests; }
}
