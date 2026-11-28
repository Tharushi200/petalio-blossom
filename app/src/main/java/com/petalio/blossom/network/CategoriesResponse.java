package com.petalio.blossom.network;

import java.util.Collections;
import java.util.List;

public class CategoriesResponse {
    private boolean success;
    private int count;
    private List<String> categories;

    public boolean isSuccess() { return success; }
    public int getCount() { return count; }
    public List<String> getCategories() {
        return categories != null ? categories : Collections.emptyList();
    }
}
