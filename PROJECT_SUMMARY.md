# Project Summary: AI-Powered Student Feedback Analyzer

## Overview
This project is a complete web application for analyzing student feedback using AI-powered Natural Language Processing and Sentiment Analysis. It was developed for Mini Hackathon 2025.

## Project Structure

```
hack/
├── backend/                 # Python Flask Backend
│   ├── app.py              # Main Flask application with API endpoints
│   ├── requirements.txt    # Python dependencies
│   ├── init_nltk.py       # NLTK data initialization script
│   ├── services/          # AI Services
│   │   ├── nlp_engine.py           # NLP categorization engine
│   │   ├── sentiment_analyzer.py   # Sentiment analysis (VADER + TextBlob)
│   │   ├── suggestion_generator.py # Improvement suggestions
│   │   └── alert_system.py         # Urgent issue detection
│   └── feedback.db        # SQLite database (created automatically)
│
├── frontend/              # React.js Frontend
│   ├── src/
│   │   ├── App.js         # Main React component with routing
│   │   ├── components/    # React components
│   │   │   ├── Dashboard.js      # Main dashboard
│   │   │   ├── FeedbackForm.js   # Feedback submission form
│   │   │   ├── FeedbackList.js   # Feedback listing with filters
│   │   │   ├── Analytics.js      # Analytics with charts
│   │   │   └── UrgentAlerts.js   # Urgent alerts view
│   │   └── index.js       # React entry point
│   └── package.json       # Node.js dependencies
│
├── README.md              # Main documentation
├── SETUP.md               # Setup instructions
└── .gitignore            # Git ignore file

```

## Key Features Implemented

### 1. ✅ NLP Engine
- Categorizes feedback into 6 categories:
  - Teaching Style
  - Course Content
  - Infrastructure
  - Assessment
  - Student Support
  - General
- Uses keyword matching and scoring algorithm
- Extracts key phrases and topics

### 2. ✅ Sentiment Analysis
- Combines VADER and TextBlob analysis
- Detects positive, negative, and neutral sentiments
- Provides sentiment scores (-1 to 1)
- Confidence levels for each analysis

### 3. ✅ Suggestion Generator
- Context-aware suggestions based on category and sentiment
- Identifies specific issues (pace, clarity, engagement, etc.)
- Generates actionable recommendations
- Supports both individual and aggregated suggestions

### 4. ✅ Visual Dashboard
- Real-time analytics and statistics
- Sentiment distribution visualization
- Category distribution charts
- Trend analysis over 30 days
- Interactive filters (instructor, course)
- Summary statistics

### 5. ✅ Alert System
- Detects urgent issues automatically
- Keywords: harassment, discrimination, safety, abuse, threat, etc.
- Priority levels: low, medium, high, critical
- Immediate alert generation
- Dedicated urgent alerts page

## Technology Stack

### Backend
- **Flask** - Web framework
- **SQLAlchemy** - ORM
- **NLTK** - Natural Language Processing
- **TextBlob** - Sentiment analysis
- **VADER Sentiment** - Social media sentiment analysis
- **SQLite** - Database

### Frontend
- **React.js 18** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **CSS3** - Styling with gradients and animations

## API Endpoints

### Feedback Management
- `POST /api/feedback` - Submit new feedback
- `GET /api/feedback` - Get all feedbacks (with filters)
- `GET /api/feedback/analytics` - Get analytics data
- `GET /api/feedback/urgent` - Get urgent feedbacks
- `GET /api/suggestions` - Get improvement suggestions
- `GET /api/health` - Health check

## Database Schema

### Feedback Table
- `id` (Primary Key)
- `student_id` (String)
- `course_id` (String)
- `instructor_id` (String)
- `feedback_text` (Text)
- `category` (String)
- `sentiment` (String: positive/negative/neutral)
- `sentiment_score` (Float: -1 to 1)
- `timestamp` (DateTime)
- `is_urgent` (Boolean)
- `suggestions` (Text)

## How It Works

1. **Feedback Submission**
   - User submits feedback through the web form
   - Backend receives the feedback

2. **Processing Pipeline**
   - NLP Engine categorizes the feedback
   - Sentiment Analyzer determines sentiment
   - Suggestion Generator creates recommendations
   - Alert System checks for urgent issues

3. **Storage**
   - Feedback stored in database with analysis results
   - Urgent alerts logged and flagged

4. **Visualization**
   - Dashboard displays real-time statistics
   - Analytics page shows charts and trends
   - Urgent alerts page highlights critical issues

## Usage Examples

### Example 1: Positive Feedback
**Input:** "The instructor explains concepts very clearly and the course content is excellent."

**Output:**
- Category: `teaching_style` or `course_content`
- Sentiment: `positive`
- Score: `0.6` (positive)
- Suggestions: "Continue maintaining clear explanations"

### Example 2: Negative Feedback
**Input:** "The lectures are too fast and the lab equipment is outdated."

**Output:**
- Category: `teaching_style` or `infrastructure`
- Sentiment: `negative`
- Score: `-0.4` (negative)
- Suggestions: "Consider slowing down the pace of lectures", "Address infrastructure issues promptly"

### Example 3: Urgent Feedback
**Input:** "I feel unsafe due to harassment issues. This requires immediate attention."

**Output:**
- Category: `general`
- Sentiment: `negative`
- Score: `-0.8` (strongly negative)
- Urgent: `true`
- Alert: Generated and logged

## Installation & Running

### Quick Start
1. **Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   python init_nltk.py
   python app.py
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Access:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Future Enhancements

### Short-term
- [ ] User authentication and authorization
- [ ] Email/SMS notifications for urgent alerts
- [ ] Export reports (PDF, CSV)
- [ ] Advanced filtering and search

### Long-term
- [ ] Machine learning model training
- [ ] Multi-language support
- [ ] Integration with LMS systems
- [ ] Mobile app
- [ ] Real-time notifications
- [ ] Advanced NLP models (BERT, GPT)

## Testing

### Manual Testing
1. Submit various types of feedback
2. Check categorization accuracy
3. Verify sentiment analysis
4. Test urgent alert detection
5. View analytics and trends

### Sample Test Cases
- Positive feedback → Should show positive sentiment
- Negative feedback → Should show negative sentiment
- Urgent keywords → Should trigger alert
- Empty feedback → Should handle gracefully
- Long feedback → Should process correctly

## Performance Considerations

- **NLP Processing:** Optimized keyword matching
- **Database:** Indexed queries for fast retrieval
- **Frontend:** Lazy loading and efficient rendering
- **API:** Caching for analytics (can be implemented)

## Security Considerations

- Input validation on backend
- SQL injection prevention (SQLAlchemy ORM)
- CORS configuration
- Environment variables for secrets
- XSS prevention (React's built-in protection)

## Deployment

### Backend Deployment
- Can be deployed on Heroku, AWS, Azure, etc.
- Use PostgreSQL/MySQL for production
- Set environment variables
- Enable production mode

### Frontend Deployment
- Build with `npm run build`
- Deploy to Netlify, Vercel, AWS S3, etc.
- Configure API endpoint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

Developed for Mini Hackathon 2025
BSIET - Dr. Bapuji Salunkhe Institute of Engineering and Technology

## Contact & Support

For issues or questions, please refer to the README.md file or create an issue in the repository.

