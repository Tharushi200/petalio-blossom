package com.petalio.blossom.network;

import java.util.Collections;
import java.util.List;

public class CustomerOrdersResponse {
    private boolean success;
    private int count;
    private List<OrderSummaryDto> orders;
    private List<OrderSummaryDto> active_orders;
    private List<OrderSummaryDto> history_orders;

    public boolean isSuccess() { return success; }
    public int getCount() { return count; }
    public List<OrderSummaryDto> getOrders() { return orders != null ? orders : Collections.emptyList(); }
    public List<OrderSummaryDto> getActiveOrders() { return active_orders != null ? active_orders : Collections.emptyList(); }
    public List<OrderSummaryDto> getHistoryOrders() { return history_orders != null ? history_orders : Collections.emptyList(); }
}

