# AI-Powered Student Feedback Analyzer for Educators

A comprehensive web application for analyzing student feedback using Natural Language Processing (NLP) and Sentiment Analysis. This system helps educators understand student feedback, detect sentiments, generate improvement suggestions, and identify urgent issues that require immediate attention.

## Features

### 1. NLP Engine
- Processes open-ended student feedback
- Categorizes feedback by topic:
  - Teaching Style
  - Course Content
  - Infrastructure
  - Assessment
  - Student Support
  - General

### 2. Sentiment Analysis Module
- Detects sentiment (positive, negative, neutral)
- Uses combined VADER and TextBlob analysis
- Provides sentiment scores and confidence levels

### 3. Suggestion Generator
- Generates actionable improvement suggestions
- Context-aware recommendations based on feedback category and sentiment
- Identifies recurring themes and patterns

### 4. Visual Dashboard
- Real-time analytics and insights
- Sentiment distribution charts
- Category distribution visualization
- Trend analysis over time
- Interactive filters for instructors and courses

### 5. Alert System
- Detects urgent issues (harassment, discrimination, safety concerns)
- Immediate alerts for critical feedback
- Priority-based alert levels (low, medium, high, critical)

## Tech Stack

### Backend
- **Python 3.8+**
- **Flask** - Web framework
- **SQLAlchemy** - ORM for database operations
- **NLTK** - Natural Language Processing
- **TextBlob** - Sentiment analysis
- **VADER Sentiment** - Sentiment analysis for social media/text
- **SQLite** - Database (can be easily switched to PostgreSQL/MySQL)

### Frontend
- **React.js 18** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **CSS3** - Styling

## Project Structure

```
.
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── init_nltk.py          # NLTK data download script
│   ├── services/
│   │   ├── nlp_engine.py     # NLP categorization engine
│   │   ├── sentiment_analyzer.py  # Sentiment analysis
│   │   ├── suggestion_generator.py  # Suggestion generation
│   │   └── alert_system.py   # Urgent issue detection
│   └── feedback.db           # SQLite database (created automatically)
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js            # Main React component
│   │   ├── App.css           # Global styles
│   │   ├── components/
│   │   │   ├── Dashboard.js      # Dashboard component
│   │   │   ├── FeedbackForm.js   # Feedback submission form
│   │   │   ├── FeedbackList.js   # Feedback listing
│   │   │   ├── Analytics.js      # Analytics dashboard
│   │   │   └── UrgentAlerts.js   # Urgent alerts view
│   │   └── index.js
│   └── package.json
│
└── README.md
```

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

#### Windows (PowerShell/Command Prompt)

**Quick Start (Easiest):**
1. Double-click `backend/start_server.bat` to start the backend

**Manual Setup:**
1. Navigate to the backend directory:
```powershell
cd backend
```

2. Create a virtual environment:
```powershell
python -m venv venv
```

3. Install Python dependencies:
```powershell
# PowerShell
.\venv\Scripts\python.exe -m pip install -r requirements.txt

# OR Command Prompt
venv\Scripts\activate
pip install -r requirements.txt
```

4. Download NLTK data:
```powershell
# PowerShell
.\venv\Scripts\python.exe init_nltk.py

# OR Command Prompt
venv\Scripts\activate
python init_nltk.py
```

5. Run the Flask server:
```powershell
# PowerShell
.\venv\Scripts\python.exe app.py

# OR Command Prompt
venv\Scripts\activate
python app.py
```

#### macOS/Linux

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Download NLTK data:
```bash
python init_nltk.py
```

5. Run the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

**Note:** For detailed Windows setup instructions, see `WINDOWS_SETUP.md`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

### Submitting Feedback

1. Navigate to "Submit Feedback" page
2. Fill in the feedback form:
   - Student ID (optional)
   - Course ID (optional)
   - Instructor ID (optional)
   - Feedback Text (required)
3. Click "Submit Feedback"
4. View the analysis results:
   - Category classification
   - Sentiment analysis
   - Generated suggestions
   - Urgent alert status (if applicable)

### Viewing Analytics

1. Navigate to "Analytics" page
2. Apply filters (optional):
   - Filter by Instructor ID
   - Filter by Course ID
3. View visualizations:
   - Sentiment distribution (pie chart)
   - Category distribution (bar chart)
   - Trend analysis (line chart)
   - Summary statistics

### Urgent Alerts

1. Navigate to "Urgent Alerts" page
2. View all urgent feedbacks requiring immediate attention
3. Review recommended actions
4. Mark alerts as reviewed (feature to be implemented)

## API Endpoints

### Feedback Endpoints

- `POST /api/feedback` - Submit new feedback
  - Body: `{ student_id, course_id, instructor_id, feedback_text }`
  - Returns: Feedback object with analysis results

- `GET /api/feedback` - Get all feedbacks
  - Query params: `instructor_id`, `course_id`, `start_date`, `end_date`
  - Returns: List of feedbacks

- `GET /api/feedback/analytics` - Get analytics data
  - Query params: `instructor_id`, `course_id`
  - Returns: Analytics data with distributions and trends

- `GET /api/feedback/urgent` - Get urgent feedbacks
  - Returns: List of urgent feedbacks

- `GET /api/suggestions` - Get improvement suggestions
  - Query params: `instructor_id`, `course_id`
  - Returns: List of suggestions

### Health Check

- `GET /api/health` - Check API health status

## Database Schema

### Feedback Table
- `id` - Primary key
- `student_id` - Student identifier
- `course_id` - Course identifier
- `instructor_id` - Instructor identifier
- `feedback_text` - Feedback content
- `category` - Categorized topic
- `sentiment` - Sentiment label (positive/negative/neutral)
- `sentiment_score` - Sentiment score (-1 to 1)
- `timestamp` - Submission timestamp
- `is_urgent` - Urgent flag
- `suggestions` - Generated suggestions

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Email/SMS notifications for urgent alerts
- [ ] Advanced NLP models (BERT, GPT-based)
- [ ] Multi-language support
- [ ] Export reports (PDF, CSV)
- [ ] Real-time notifications
- [ ] Machine learning model training on feedback data
- [ ] Integration with learning management systems
- [ ] Mobile app support
- [ ] Advanced filtering and search
- [ ] Feedback response tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is developed for Mini Hackathon 2025.

## Authors

Developed for **SHRI SWAMI VIVEKANAND SHIKSHAN SANSTHA'S DR. BAPUJI SALUNKHE INSTITUTE OF ENGINEERING AND TECHNOLOGY (BSIET)**

## Acknowledgments

- NLTK community for NLP tools
- Flask and React.js communities
- VADER Sentiment for sentiment analysis

