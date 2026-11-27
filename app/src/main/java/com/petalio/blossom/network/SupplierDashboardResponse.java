package com.petalio.blossom.network;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class SupplierDashboardResponse {
    private boolean success;

    @SerializedName("supplier_id")
    private int supplierId;

    @SerializedName("supplier_code")
    private String supplierCode;

    @SerializedName("supplier_name")
    private String supplierName;

    @SerializedName("contact_person")
    private String contactPerson;

    @SerializedName("email")
    private String email;

    @SerializedName("phone")
    private String phone;

    @SerializedName("city")
    private String city;

    @SerializedName("address")
    private String address;

    @SerializedName("is_approved")
    private boolean isApproved;

    @SerializedName("status")
    private String status;

    @SerializedName("new_requests_count")
    private int newRequestsCount;

    @SerializedName("active_orders_count")
    private int activeOrdersCount;

    @SerializedName("supplied_varieties_count")
    private int suppliedVarietiesCount;

    @SerializedName(value = "total_payouts", alternate = {"total_earnings"})
    private double totalPayouts;

    @SerializedName("total_payouts_formatted")
    private String totalPayoutsFormatted;

    @SerializedName("monthly_capacity")
    private int monthlyCapacity;

    @SerializedName("latest_notification")
    private String latestNotification;

    @SerializedName("recent_alerts")
    private List<SupplierNotificationDto> recentAlerts;

    @SerializedName(value = "alerts_count", alternate = {"notifications_count", "unread_notifications"})
    private int alertsCount;

    public boolean isSuccess() { return success; }
    public int getSupplierId() { return supplierId; }
    public String getSupplierCode() { return supplierCode != null ? supplierCode : ""; }
    public String getSupplierName() { return supplierName != null ? supplierName : ""; }
    public String getContactPerson() { return contactPerson != null ? contactPerson : ""; }
    public String getEmail() { return email != null ? email : ""; }
    public String getPhone() { return phone != null ? phone : ""; }
    public String getCity() { return city != null ? city : ""; }
    public String getAddress() { return address != null ? address : ""; }
    public boolean isApproved() { return isApproved; }
    public String getStatus() { return status != null ? status : (isApproved ? "Approved" : "Pending"); }
    public int getNewRequestsCount() { return newRequestsCount; }
    public int getActiveOrdersCount() { return activeOrdersCount; }
    public int getSuppliedVarietiesCount() { return suppliedVarietiesCount; }
    public double getTotalPayouts() { return totalPayouts; }
    public double getTotalEarnings() { return totalPayouts; }
    public String getTotalPayoutsFormatted() { return totalPayoutsFormatted != null ? totalPayoutsFormatted : "Rs. " + (int) totalPayouts; }
    public int getMonthlyCapacity() { return monthlyCapacity; }
    public String getLatestNotification() { return latestNotification != null ? latestNotification : ""; }
    public List<SupplierNotificationDto> getRecentAlerts() { return recentAlerts; }
    public int getAlertsCount() { return alertsCount; }
    public int getUnreadNotifications() { return alertsCount; }
}
