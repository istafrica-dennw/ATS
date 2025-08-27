package com.ats.service;

import com.ats.model.Interview;

public interface CalendarService {
    
    /**
     * Generate calendar invite (.ics file) for interview
     * @param interview The interview to create calendar invite for
     * @param includeCandidate Whether to include candidate in the invite
     * @return Calendar invite content as String
     */
    String generateCalendarInvite(Interview interview, boolean includeCandidate);
    
    /**
     * Send calendar invites via email to all participants
     * @param interview The interview to send calendar invites for
     */
    void sendCalendarInvites(Interview interview);
    
    /**
     * Generate Outlook-compatible calendar invite
     * @param interview The interview to create calendar invite for
     * @return Calendar invite content as String
     */
    String generateOutlookCalendarInvite(Interview interview);
}