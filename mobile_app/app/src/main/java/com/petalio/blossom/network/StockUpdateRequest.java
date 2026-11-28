package com.petalio.blossom.network;

public class StockUpdateRequest {
    private int flower_id;
    private int stock_quantity;

    public StockUpdateRequest(int flower_id, int stock_quantity) {
        this.flower_id = flower_id;
        this.stock_quantity = stock_quantity;
    }

    public int getFlowerId() { return flower_id; }
    public int getStockQuantity() { return stock_quantity; }
}

