# Backend API - Student Feedback Analyzer

## Setup Instructions

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Download NLTK data:
```bash
python init_nltk.py
```

3. Run the Flask server:
```bash
python app.py
```

## API Documentation

### Endpoints

- `GET /api/health` - Health check
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback` - Get all feedbacks
- `GET /api/feedback/analytics` - Get analytics
- `GET /api/feedback/urgent` - Get urgent alerts
- `GET /api/suggestions` - Get suggestions

## Environment Variables

Create a `.env` file with:
```
DATABASE_URL=sqlite:///feedback.db
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here
```

