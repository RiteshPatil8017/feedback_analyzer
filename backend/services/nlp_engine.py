import re
from collections import Counter

class NLPEngine:
    def __init__(self):
        # Define keywords for different categories
        self.category_keywords = {
            'teaching_style': [
                'teaching', 'explain', 'explanation', 'lecture', 'presentation', 
                'speaking', 'pace', 'speed', 'clarity', 'understand', 'comprehensible',
                'method', 'approach', 'style', 'delivery', 'communicate'
            ],
            'course_content': [
                'content', 'syllabus', 'curriculum', 'material', 'textbook', 
                'assignment', 'project', 'exam', 'test', 'quiz', 'homework',
                'topic', 'subject', 'module', 'chapter', 'lesson', 'course'
            ],
            'infrastructure': [
                'infrastructure', 'lab', 'laboratory', 'computer', 'equipment',
                'facility', 'building', 'classroom', 'library', 'wifi', 'internet',
                'projector', 'board', 'whiteboard', 'chair', 'table', 'room'
            ],
            'assessment': [
                'assessment', 'evaluation', 'grading', 'marks', 'score', 'grade',
                'feedback', 'review', 'exam', 'test', 'quiz', 'assignment'
            ],
            'student_support': [
                'help', 'support', 'guidance', 'mentor', 'counseling', 'assistance',
                'doubt', 'question', 'office hours', 'available', 'accessibility'
            ],
            'general': []
        }
        
        # Initialize category scores
        for category in self.category_keywords:
            self.category_keywords[category] = [word.lower() for word in self.category_keywords[category]]
    
    def categorize_feedback(self, feedback_text):
        """
        Categorize feedback into one of the predefined categories
        """
        if not feedback_text:
            return 'general'
        
        feedback_lower = feedback_text.lower()
        category_scores = {}
        
        # Calculate scores for each category
        for category, keywords in self.category_keywords.items():
            if category == 'general':
                continue
            score = sum(1 for keyword in keywords if keyword in feedback_lower)
            if score > 0:
                category_scores[category] = score
        
        # Return category with highest score, or 'general' if no match
        if category_scores:
            return max(category_scores, key=category_scores.get)
        else:
            return 'general'
    
    def extract_key_phrases(self, feedback_text):
        """
        Extract key phrases from feedback
        """
        # Simple key phrase extraction using common patterns
        sentences = re.split(r'[.!?]+', feedback_text)
        key_phrases = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 10:  # Filter out very short sentences
                key_phrases.append(sentence)
        
        return key_phrases[:5]  # Return top 5 key phrases
    
    def detect_topics(self, feedback_text):
        """
        Detect multiple topics in feedback
        """
        feedback_lower = feedback_text.lower()
        detected_topics = []
        
        for category, keywords in self.category_keywords.items():
            if category == 'general':
                continue
            matches = [keyword for keyword in keywords if keyword in feedback_lower]
            if matches:
                detected_topics.append(category)
        
        return detected_topics if detected_topics else ['general']

