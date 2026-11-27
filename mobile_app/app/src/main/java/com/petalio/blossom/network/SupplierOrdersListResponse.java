package com.petalio.blossom.network;

import java.util.List;

public class SupplierOrdersListResponse {
    private boolean success;
    private int count;
    private List<SupplierOrderDto> orders;
    private List<SupplierOrderDto> requests;

    public boolean isSuccess() { return success; }
    public int getCount() { return count; }
    public List<SupplierOrderDto> getOrders() {
        if (orders != null) return orders;
        return requests;
    }
}
