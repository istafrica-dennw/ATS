package com.ats.service.impl;

import com.ats.model.Interview;
import com.ats.model.LocationType;
import com.ats.model.User;
import com.ats.service.CalendarService;
import com.ats.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@Slf4j
public class CalendarServiceImpl implements CalendarService {

    private final EmailService emailService;

    @Autowired
    public CalendarServiceImpl(EmailService emailService) {
        this.emailService = emailService;
    }

    @Override
    public String generateCalendarInvite(Interview interview, boolean includeCandidate) {
        return generateOutlookCalendarInvite(interview);
    }

    @Override
    public String generateOutlookCalendarInvite(Interview interview) {
        StringBuilder ics = new StringBuilder();
        
        // ICS Header with proper Outlook compatibility
        ics.append("BEGIN:VCALENDAR\n");
        ics.append("VERSION:2.0\n");
        ics.append("PRODID:-//IST Africa//ATS System//EN\n");
        ics.append("CALSCALE:GREGORIAN\n");
        ics.append("METHOD:PUBLISH\n");
        
        // Event
        ics.append("BEGIN:VEVENT\n");
        
        // Unique ID
        String uid = "interview-" + interview.getId() + "-" + UUID.randomUUID().toString() + "@ist.africa";
        ics.append("UID:").append(uid).append("\n");
        
        // Timestamp
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss"));
        ics.append("DTSTAMP:").append(timestamp).append("\n");
        
        // Start and End time with proper timezone
        LocalDateTime startTime = interview.getScheduledAt();
        LocalDateTime endTime;
        if (interview.getDurationMinutes() != null) {
            endTime = startTime.plusMinutes(interview.getDurationMinutes());
        } else {
            endTime = startTime.plusHours(1); // Default 1 hour interview if no duration set
        }
        
        // Format with local timezone (no 'Z' suffix to avoid UTC conversion issues)
        String startTimeStr = startTime.format(DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss"));
        String endTimeStr = endTime.format(DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss"));
        
        ics.append("DTSTART:").append(startTimeStr).append("\n");
        ics.append("DTEND:").append(endTimeStr).append("\n");
        
        // Summary (Title)
        String candidateName = interview.getApplication().getCandidate().getFirstName() + " " + 
                              interview.getApplication().getCandidate().getLastName();
        String jobTitle = interview.getApplication().getJob().getTitle();
        String skeletonName = interview.getSkeleton().getName();
        
        String summary = String.format("Interview: %s - %s (%s)", candidateName, jobTitle, skeletonName);
        ics.append("SUMMARY:").append(escapeIcsText(summary)).append("\n");
        
        // Description
        StringBuilder description = new StringBuilder();
        description.append("Interview Details:\n\n");
        description.append("Candidate: ").append(candidateName).append("\n");
        description.append("Position: ").append(jobTitle).append("\n");
        description.append("Interview Type: ").append(skeletonName).append("\n");
        description.append("Interviewer: ").append(interview.getInterviewer().getFirstName())
                  .append(" ").append(interview.getInterviewer().getLastName()).append("\n");
        description.append("Assigned by: ").append(interview.getAssignedBy().getFirstName())
                  .append(" ").append(interview.getAssignedBy().getLastName()).append("\n\n");
        
        if (interview.getNotes() != null && !interview.getNotes().isEmpty()) {
            description.append("Notes: ").append(interview.getNotes()).append("\n\n");
        }
        
        
        // Add meeting link for online interviews
        if (interview.getLocationType() == LocationType.ONLINE) {
            description.append("\nMeeting Link: https://meet.google.com/abc-defg-hij\n");
            description.append("(Actual meeting link will be provided before the interview)");
        }
        
        ics.append(foldLine("DESCRIPTION", escapeIcsText(description.toString())));
        
        // Location (can be virtual or physical)
        String location;
        if (interview.getLocationType() != null) {
            if (interview.getLocationType() == LocationType.OFFICE && interview.getLocationAddress() != null) {
                location = interview.getLocationAddress();
            } else if (interview.getLocationType() == LocationType.ONLINE) {
                location = "Online Interview - Meeting link will be provided";
            } else {
                location = " IST Interview Room";
            }
        } else {
            location = " IST Interview Room";
        }
        ics.append("LOCATION:").append(escapeIcsText(location)).append("\n");
        
        // Organizer (Admin who assigned)
        User admin = interview.getAssignedBy();
        ics.append("ORGANIZER;CN=").append(escapeIcsText(admin.getFirstName() + " " + admin.getLastName()))
           .append(":MAILTO:").append(admin.getEmail()).append("\n");
        
        // Attendees
        User interviewer = interview.getInterviewer();
        ics.append("ATTENDEE;CN=").append(escapeIcsText(interviewer.getFirstName() + " " + interviewer.getLastName()))
           .append(";ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:MAILTO:")
           .append(interviewer.getEmail()).append("\n");
        
        User candidate = interview.getApplication().getCandidate();
        ics.append("ATTENDEE;CN=").append(escapeIcsText(candidate.getFirstName() + " " + candidate.getLastName()))
           .append(";ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:MAILTO:")
           .append(candidate.getEmail()).append("\n");
        
        // Status and scheduling properties
        ics.append("STATUS:CONFIRMED\n");
        ics.append("TRANSP:OPAQUE\n");
        
        // Priority (5 = normal)
        ics.append("PRIORITY:5\n");
        
        // Sequence (version control)
        ics.append("SEQUENCE:0\n");
        
        // Additional Outlook compatibility fields
        ics.append("CLASS:PUBLIC\n");
        ics.append("CREATED:").append(timestamp).append("\n");
        ics.append("LAST-MODIFIED:").append(timestamp).append("\n");
        
        ics.append("END:VEVENT\n");
        ics.append("END:VCALENDAR\n");
        
        return ics.toString();
    }

    @Override
    public void sendCalendarInvites(Interview interview) {
        try {
            String calendarInvite = generateOutlookCalendarInvite(interview);
            
            // Get participants
            User interviewer = interview.getInterviewer();
            User candidate = interview.getApplication().getCandidate();
            User admin = interview.getAssignedBy();
            
            String subject = String.format("Interview Scheduled: %s - %s", 
                candidate.getFirstName() + " " + candidate.getLastName(),
                interview.getApplication().getJob().getTitle());
            
            // Email body
            String emailBody = createEmailBody(interview);
            
            // Send to interviewer (use job region)
            emailService.sendEmailWithCalendarAttachment(
                interviewer.getEmail(),
                subject,
                emailBody,
                calendarInvite,
                "interview.ics",
                interview.getApplication().getJob()
            );
            
            // Send to candidate (use job region)
            emailService.sendEmailWithCalendarAttachment(
                candidate.getEmail(),
                subject,
                emailBody,
                calendarInvite,
                "interview.ics",
                interview.getApplication().getJob()
            );
            
            // Send to admin (optional, for tracking) (use job region)
            emailService.sendEmailWithCalendarAttachment(
                admin.getEmail(),
                subject + " (Admin Copy)",
                emailBody + "\n\nThis is a copy for your records as the interview coordinator.",
                calendarInvite,
                "interview.ics",
                interview.getApplication().getJob()
            );
            
            log.info("Calendar invites sent successfully for interview ID: {}", interview.getId());
            
        } catch (Exception e) {
            log.error("Failed to send calendar invites for interview ID: {}: {}", 
                     interview.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to send calendar invites", e);
        }
    }
    
    private String createEmailBody(Interview interview) {
        User candidate = interview.getApplication().getCandidate();
        User interviewer = interview.getInterviewer();
        User admin = interview.getAssignedBy();
        
        StringBuilder body = new StringBuilder();
        body.append("Dear Team,\n\n");
        body.append("An interview has been scheduled with the following details:\n\n");
        body.append("📅 Interview Details:\n");
        body.append("• Candidate: ").append(candidate.getFirstName()).append(" ").append(candidate.getLastName()).append("\n");
        body.append("• Position: ").append(interview.getApplication().getJob().getTitle()).append("\n");
        body.append("• Interview Type: ").append(interview.getSkeleton().getName()).append("\n");
        body.append("• Date & Time: ").append(interview.getScheduledAt().format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a"))).append("\n");
        if (interview.getDurationMinutes() != null) {
            body.append("• Duration: ").append(interview.getDurationMinutes()).append(" minutes\n");
        } else {
            body.append("• Duration: 1 hour\n");
        }
        
        // Location information
        if (interview.getLocationType() != null) {
            if (interview.getLocationType() == LocationType.OFFICE && interview.getLocationAddress() != null) {
                body.append("• Location: ").append(interview.getLocationAddress()).append("\n");
            } else if (interview.getLocationType() == LocationType.ONLINE) {
                body.append("• Location: Online Interview\n");
                body.append("• Meeting Link: https://meet.google.com/abc-defg-hij (Link will be provided)\n");
            } else {
                body.append("• Location:  IST Interview Room\n");
            }
        } else {
            body.append("• Location:  IST Interview Room\n");
        }
        body.append("\n");
        
        body.append("👥 Participants:\n");
        body.append("• Interviewer: ").append(interviewer.getFirstName()).append(" ").append(interviewer.getLastName())
            .append(" (").append(interviewer.getEmail()).append(")\n");
        body.append("• Candidate: ").append(candidate.getFirstName()).append(" ").append(candidate.getLastName())
            .append(" (").append(candidate.getEmail()).append(")\n");
        body.append("• Coordinator: ").append(admin.getFirstName()).append(" ").append(admin.getLastName())
            .append(" (").append(admin.getEmail()).append(")\n\n");
        
        if (interview.getNotes() != null && !interview.getNotes().isEmpty()) {
            body.append("📝 Additional Notes:\n");
            body.append(interview.getNotes()).append("\n\n");
        }
        
        
        body.append("\n📎 A calendar invite (.ics file) is attached to this email. Please add it to your calendar.\n\n");
        body.append("For any questions or rescheduling requests, please contact ").append(admin.getFirstName())
            .append(" ").append(admin.getLastName()).append(" at ").append(admin.getEmail()).append(".\n\n");
        body.append("Best regards,\n");
        body.append("IST Africa ATS System");
        
        return body.toString();
    }
    
    private String escapeIcsText(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                  .replace(";", "\\;")
                  .replace(",", "\\,")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r");
    }
    
    /**
     * Fold long lines according to RFC 5545 (max 75 characters per line)
     * This helps with Outlook compatibility
     */
    private String foldLine(String property, String value) {
        String line = property + ":" + value;
        if (line.length() <= 75) {
            return line + "\n";
        }
        
        StringBuilder folded = new StringBuilder();
        int start = 0;
        while (start < line.length()) {
            int end = Math.min(start + 75, line.length());
            if (start == 0) {
                folded.append(line, start, end).append("\n");
            } else {
                folded.append(" ").append(line, start, end).append("\n");
            }
            start = end;
        }
        return folded.toString();
    }
}