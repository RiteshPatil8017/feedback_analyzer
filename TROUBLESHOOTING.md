# Troubleshooting Guide

## Common Issues and Solutions

### 1. "Failed to submit feedback" Error

#### Check Backend Server
**Problem:** The backend server is not running or not accessible.

**Solution:**
1. Open a terminal and navigate to the `backend` directory
2. Make sure you're in the virtual environment:
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```
3. Start the backend server:
   ```bash
   python app.py
   ```
4. You should see:
   ```
   Starting Student Feedback Analyzer API...
   Database initialized successfully!
   Server starting on http://localhost:5000
   ```

#### Check Dependencies
**Problem:** Missing Python packages.

**Solution:**
```bash
cd backend
pip install -r requirements.txt
python init_nltk.py
```

#### Check Database
**Problem:** Database not initialized.

**Solution:**
The database should be created automatically. If not:
```bash
cd backend
python
>>> from app import app, db
>>> with app.app_context():
...     db.create_all()
```

### 2. "Unable to connect to the server" Error

#### Check Port 5000
**Problem:** Port 5000 is already in use.

**Solution:**
1. Find what's using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # macOS/Linux
   lsof -i :5000
   ```
2. Change the port in `backend/app.py`:
   ```python
   app.run(debug=True, port=5001, host='0.0.0.0')
   ```
3. Update `frontend/package.json`:
   ```json
   "proxy": "http://localhost:5001"
   ```

### 3. NLTK Data Errors

**Problem:** NLTK data not downloaded.

**Solution:**
```bash
cd backend
python init_nltk.py
```

If that doesn't work, download manually:
```python
import nltk
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('vader_lexicon')
nltk.download('averaged_perceptron_tagger')
nltk.download('brown')
```

### 4. TextBlob Errors

**Problem:** TextBlob requires additional data.

**Solution:**
```bash
python -m textblob.download_corpora
```

### 5. CORS Errors

**Problem:** Cross-Origin Resource Sharing errors.

**Solution:**
Make sure `flask-cors` is installed:
```bash
pip install flask-cors
```

Check that CORS is enabled in `backend/app.py`:
```python
from flask_cors import CORS
CORS(app)
```

### 6. Database Errors

**Problem:** SQLite database errors.

**Solution:**
1. Delete the existing database:
   ```bash
   # Windows
   del backend\feedback.db
   
   # macOS/Linux
   rm backend/feedback.db
   ```
2. Restart the server (it will create a new database)

### 7. Frontend Not Loading

**Problem:** React app not starting.

**Solution:**
1. Make sure Node.js is installed:
   ```bash
   node --version
   npm --version
   ```
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

### 8. Module Not Found Errors

**Problem:** Python modules not found.

**Solution:**
1. Make sure you're in the virtual environment
2. Reinstall requirements:
   ```bash
   pip install -r requirements.txt
   ```

### 9. API Endpoint Not Found

**Problem:** API routes returning 404.

**Solution:**
1. Check that the backend is running
2. Test the health endpoint:
   ```bash
   curl http://localhost:5000/api/health
   ```
3. Check browser console for errors
4. Verify the proxy setting in `frontend/package.json`

### 10. Sentiment Analysis Not Working

**Problem:** Sentiment analysis returns neutral for everything.

**Solution:**
1. Check that NLTK data is downloaded
2. Check that VADER and TextBlob are installed
3. Look at backend console for error messages
4. The system will fall back to neutral if analysis fails

## Testing the API

### Using curl
```bash
# Health check
curl http://localhost:5000/api/health

# Submit feedback
curl -X POST http://localhost:5000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "TEST001",
    "feedback_text": "The dashboard is not attractive and its not working efficiently"
  }'

# Get feedbacks
curl http://localhost:5000/api/feedback

# Get analytics
curl http://localhost:5000/api/feedback/analytics
```

### Using Python test script
```bash
cd backend
python test_api.py
```

## Debug Mode

### Backend Debugging
1. Backend is already in debug mode (`debug=True`)
2. Check terminal for error messages
3. Check for Python tracebacks

### Frontend Debugging
1. Open browser Developer Tools (F12)
2. Check Console tab for errors
3. Check Network tab for API requests
4. Look for CORS errors or 404 errors

## Getting Help

If you're still having issues:

1. **Check the console logs:**
   - Backend: Terminal where `python app.py` is running
   - Frontend: Browser Developer Tools Console

2. **Check the error messages:**
   - The improved error handling should show more specific errors
   - Look for the actual error message, not just "Failed to submit feedback"

3. **Verify all services are running:**
   - Backend: http://localhost:5000/api/health
   - Frontend: http://localhost:3000

4. **Check dependencies:**
   - Backend: `pip list`
   - Frontend: `npm list`

## Quick Checklist

- [ ] Backend server is running on port 5000
- [ ] Frontend server is running on port 3000
- [ ] All Python dependencies are installed
- [ ] All Node.js dependencies are installed
- [ ] NLTK data is downloaded
- [ ] Database is initialized
- [ ] No port conflicts
- [ ] CORS is enabled
- [ ] Browser console shows no errors
- [ ] Network requests are successful

## Common Error Messages

| Error Message | Possible Cause | Solution |
|--------------|----------------|----------|
| "Failed to submit feedback" | Backend not running | Start backend server |
| "Unable to connect to server" | Backend not accessible | Check port and firewall |
| "Module not found" | Missing dependencies | Install requirements |
| "Database error" | Database not initialized | Delete and recreate database |
| "NLTK data not found" | NLTK data missing | Run init_nltk.py |
| "CORS error" | CORS not enabled | Install flask-cors |
| "Port already in use" | Port conflict | Change port or kill process |

