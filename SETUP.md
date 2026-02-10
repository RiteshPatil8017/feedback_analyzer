# Quick Setup Guide

## Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

## Step-by-Step Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Create virtual environment (macOS/Linux)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download NLTK data
python init_nltk.py

# Run the server
python app.py
```

Backend will run on: `http://localhost:5000`

### 2. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will run on: `http://localhost:3000`

## Testing the Application

1. Open `http://localhost:3000` in your browser
2. Navigate to "Submit Feedback" page
3. Submit a sample feedback:
   - Feedback Text: "The instructor explains concepts very clearly and the course content is excellent. However, the lab equipment needs improvement."
4. View the results:
   - Category will be assigned
   - Sentiment will be analyzed
   - Suggestions will be generated
5. Check the Dashboard and Analytics pages to see visualizations

## Sample Feedback Examples

### Positive Feedback
"The teaching style is excellent and the instructor is very helpful. The course content is comprehensive and well-organized."

### Negative Feedback
"The lectures are too fast and difficult to follow. The lab equipment is outdated and the assignments are too difficult."

### Urgent Feedback
"I feel unsafe in this environment due to harassment issues. This requires immediate attention."

## Troubleshooting

### Backend Issues
- **NLTK data not found**: Run `python init_nltk.py` again
- **Database errors**: Delete `feedback.db` and restart the server
- **Port already in use**: Change the port in `app.py` (line 281)

### Frontend Issues
- **Dependencies not installing**: Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- **Proxy errors**: Make sure backend is running on port 5000
- **CORS errors**: Check that `flask-cors` is installed and backend is running

## Next Steps

- Customize the NLP categories in `backend/services/nlp_engine.py`
- Adjust sentiment analysis thresholds in `backend/services/sentiment_analyzer.py`
- Modify suggestion templates in `backend/services/suggestion_generator.py`
- Add more urgent keywords in `backend/services/alert_system.py`
- Customize the UI in `frontend/src/components/`

