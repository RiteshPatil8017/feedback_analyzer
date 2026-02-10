import re
from datetime import datetime

class AlertSystem:
    def __init__(self):
        # Keywords that indicate urgent issues
        self.urgent_keywords = [
            'ragging', 'ragged', 'rag', 'senior bullying',
            'harassment', 'harassed', 'harassing',
            'discrimination', 'discriminate', 'discriminatory',
            'safety', 'unsafe', 'danger', 'dangerous',
            'emergency', 'urgent', 'critical',
            'abuse', 'abusive', 'abusing',
            'threat', 'threatening', 'threaten',
            'violence', 'violent', 'assault',
            'bullying', 'bully', 'bullied',
            'suicide', 'self-harm', 'harm',
            'sexual', 'inappropriate behavior',
            'unsafe environment', 'hostile environment'
        ]
        
        # Patterns that indicate severity
        self.severity_patterns = [
            r'\b(very|extremely|highly|severely)\s+(unsafe|dangerous|urgent|critical)',
            r'\b(immediate|immediately|right away|asap)\s+(action|attention|help)',
            r'\b(report|reporting|filing)\s+(complaint|report)',
            r'\b(no\s+longer|can\'t|cannot)\s+(feel|feel safe|continue)'
        ]
    
    def check_urgent(self, feedback_text):
        """
        Check if feedback contains urgent issues that need immediate attention
        """
        if not feedback_text:
            return False
        
        feedback_lower = feedback_text.lower()
        
        # Check for urgent keywords
        keyword_matches = sum(1 for keyword in self.urgent_keywords if keyword in feedback_lower)
        
        # Check for severity patterns
        pattern_matches = sum(1 for pattern in self.severity_patterns if re.search(pattern, feedback_lower, re.IGNORECASE))
        
        # Consider urgent if keywords or patterns found
        return keyword_matches > 0 or pattern_matches > 0
    
    def get_urgency_level(self, feedback_text):
        """
        Determine urgency level (low, medium, high, critical)
        """
        if not feedback_text:
            return 'low'
        
        feedback_lower = feedback_text.lower()
        
        # Count matches
        keyword_count = sum(1 for keyword in self.urgent_keywords if keyword in feedback_lower)
        pattern_count = sum(1 for pattern in self.severity_patterns if re.search(pattern, feedback_lower, re.IGNORECASE))
        
        total_score = keyword_count + (pattern_count * 2)
        
        if total_score >= 5:
            return 'critical'
        elif total_score >= 3:
            return 'high'
        elif total_score >= 1:
            return 'medium'
        else:
            return 'low'
    
    def send_alert(self, feedback):
        """
        Send alert for urgent feedback
        In production, this would send emails, SMS, or push notifications
        """
        urgency_level = self.get_urgency_level(feedback.feedback_text)
        
        alert_message = {
            'alert_id': f"ALERT-{feedback.id}",
            'timestamp': datetime.utcnow().isoformat(),
            'urgency_level': urgency_level,
            'feedback_id': feedback.id,
            'student_id': feedback.student_id,
            'course_id': feedback.course_id,
            'instructor_id': feedback.instructor_id,
            'feedback_text': feedback.feedback_text[:200] + '...' if len(feedback.feedback_text) > 200 else feedback.feedback_text,
            'category': feedback.category,
            'sentiment': feedback.sentiment
        }
        
        # In production, implement actual alert sending:
        # - Send email to admin/instructor
        # - Send SMS for critical alerts
        # - Log to alert system
        # - Create ticket in support system
        
        print(f"🚨 URGENT ALERT [{urgency_level.upper()}]: {alert_message}")
        
        return alert_message
    
    def extract_urgent_issues(self, feedback_text):
        """
        Extract specific urgent issues mentioned in feedback
        """
        if not feedback_text:
            return []
        
        feedback_lower = feedback_text.lower()
        detected_issues = []
        
        for keyword in self.urgent_keywords:
            if keyword in feedback_lower:
                detected_issues.append(keyword)
        
        return detected_issues

