import re
from collections import Counter

class SuggestionGenerator:
    def __init__(self):
        self.category_suggestions = {
            'teaching_style': {
                'positive': [
                    "Continue maintaining clear explanations",
                    "Keep up the engaging teaching style",
                    "Maintain the good pace of lectures"
                ],
                'negative': [
                    "Consider slowing down the pace of lectures",
                    "Try to provide more examples and real-world applications",
                    "Consider using visual aids to enhance understanding",
                    "Encourage more student participation and interaction"
                ],
                'neutral': [
                    "Consider gathering more feedback on teaching methods",
                    "Explore different teaching techniques"
                ]
            },
            'course_content': {
                'positive': [
                    "Continue with the comprehensive course content",
                    "Keep the material relevant and up-to-date"
                ],
                'negative': [
                    "Consider updating course materials with recent developments",
                    "Review and update assignments to be more practical",
                    "Consider adding more resources and references",
                    "Balance theory with practical applications"
                ],
                'neutral': [
                    "Regularly review course content for relevance",
                    "Consider student suggestions for content improvement"
                ]
            },
            'infrastructure': {
                'positive': [
                    "Maintain the good infrastructure facilities"
                ],
                'negative': [
                    "Address infrastructure issues promptly",
                    "Consider upgrading lab equipment",
                    "Improve internet connectivity in classrooms",
                    "Ensure proper maintenance of facilities"
                ],
                'neutral': [
                    "Regular maintenance checks recommended",
                    "Consider infrastructure upgrades"
                ]
            },
            'assessment': {
                'positive': [
                    "Continue with fair assessment methods"
                ],
                'negative': [
                    "Consider diversifying assessment methods",
                    "Provide timely feedback on assessments",
                    "Make assessment criteria more transparent",
                    "Balance different types of assessments"
                ],
                'neutral': [
                    "Review assessment methods periodically",
                    "Ensure assessment fairness and transparency"
                ]
            },
            'student_support': {
                'positive': [
                    "Continue providing excellent student support"
                ],
                'negative': [
                    "Increase availability for student consultations",
                    "Provide more guidance and mentorship",
                    "Improve response time to student queries",
                    "Create more support resources"
                ],
                'neutral': [
                    "Maintain regular student support channels",
                    "Consider expanding support services"
                ]
            },
            'general': {
                'positive': [
                    "Continue the good work",
                    "Maintain current standards"
                ],
                'negative': [
                    "Consider overall improvement in various aspects",
                    "Address concerns raised by students",
                    "Focus on continuous improvement"
                ],
                'neutral': [
                    "Regular feedback collection recommended",
                    "Consider periodic reviews"
                ]
            }
        }
        
        self.urgent_keywords = [
            'harassment', 'discrimination', 'safety', 'emergency', 'urgent',
            'abuse', 'threat', 'danger', 'unsafe', 'violence', 'bullying'
        ]
    
    def generate_suggestions(self, feedback_text, category, sentiment):
        """
        Generate suggestions based on feedback text, category, and sentiment
        """
        if not feedback_text:
            return "No specific suggestions available"
        
        # Get base suggestions for category and sentiment
        base_suggestions = self.category_suggestions.get(category, self.category_suggestions['general'])
        sentiment_suggestions = base_suggestions.get(sentiment, base_suggestions.get('neutral', []))
        
        # Extract specific issues from feedback
        specific_issues = self._extract_issues(feedback_text)
        
        # Generate contextual suggestions
        contextual_suggestions = []
        
        # Check for specific patterns
        feedback_lower = feedback_text.lower()
        
        if 'slow' in feedback_lower or 'fast' in feedback_lower:
            if category == 'teaching_style':
                contextual_suggestions.append("Adjust lecture pace based on student feedback")
        
        if 'difficult' in feedback_lower or 'hard' in feedback_lower:
            contextual_suggestions.append("Consider providing additional resources or supplementary materials")
        
        if 'boring' in feedback_lower or 'monotonous' in feedback_lower:
            contextual_suggestions.append("Incorporate interactive activities and engaging teaching methods")
        
        if 'unclear' in feedback_lower or 'confusing' in feedback_lower:
            contextual_suggestions.append("Provide clearer explanations and use more examples")
        
        # Combine suggestions
        all_suggestions = list(sentiment_suggestions) + contextual_suggestions
        
        if not all_suggestions:
            return "No specific suggestions available at this time"
        
        # Return top 3-5 suggestions
        return "; ".join(all_suggestions[:5])
    
    def _extract_issues(self, text):
        """
        Extract specific issues mentioned in feedback
        """
        issues = []
        text_lower = text.lower()
        
        # Common issue patterns
        issue_patterns = {
            'pace': ['too fast', 'too slow', 'pace', 'speed'],
            'clarity': ['unclear', 'confusing', 'not clear', 'difficult to understand'],
            'engagement': ['boring', 'monotonous', 'not engaging', 'dry'],
            'resources': ['lack of', 'need more', 'insufficient', 'missing'],
            'support': ['not available', 'unresponsive', 'no help', 'lack of support']
        }
        
        for issue_type, patterns in issue_patterns.items():
            if any(pattern in text_lower for pattern in patterns):
                issues.append(issue_type)
        
        return issues
    
    def generate_summary_suggestions(self, feedback_list):
        """
        Generate summary suggestions based on multiple feedback entries
        """
        if not feedback_list:
            return []
        
        # Aggregate categories and sentiments
        category_sentiment_counts = {}
        
        for feedback in feedback_list:
            category = feedback.get('category', 'general')
            sentiment = feedback.get('sentiment', 'neutral')
            
            key = f"{category}_{sentiment}"
            category_sentiment_counts[key] = category_sentiment_counts.get(key, 0) + 1
        
        # Generate prioritized suggestions
        suggestions = []
        sorted_categories = sorted(category_sentiment_counts.items(), key=lambda x: x[1], reverse=True)
        
        for (category_sentiment, count), _ in sorted_categories[:3]:
            category, sentiment = category_sentiment.split('_')
            base_suggestions = self.category_suggestions.get(category, self.category_suggestions['general'])
            sentiment_suggestions = base_suggestions.get(sentiment, [])
            
            if sentiment_suggestions:
                suggestions.append({
                    'category': category,
                    'sentiment': sentiment,
                    'count': count,
                    'suggestions': sentiment_suggestions[:2]
                })
        
        return suggestions

