package com.petalio.blossom.network;

import java.util.Collections;
import java.util.List;

public class RemindersResponse {
    private boolean success;
    private String message;
    private List<ReminderDto> reminders;

    public boolean isSuccess() { return success; }
    public String getMessage() { return message != null ? message : ""; }
    public List<ReminderDto> getReminders() {
        return reminders != null ? reminders : Collections.emptyList();
    }
}
