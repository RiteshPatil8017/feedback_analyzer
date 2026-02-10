# Quick Start Guide - Fixing "Failed to submit feedback" Error

## Step 1: Start the Backend Server

Open a **new terminal/command prompt** and run:

```bash
cd backend

# Activate virtual environment (if not already activated)
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Download NLTK data (if not already done)
python init_nltk.py

# Start the backend server
python app.py
```

You should see:
```
Starting Student Feedback Analyzer API...
Database initialized successfully!
Server starting on http://localhost:5000
```

**Keep this terminal open!** The backend server must be running.

## Step 2: Start the Frontend Server

Open a **second terminal/command prompt** and run:

```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Start the frontend server
npm start
```

The browser should open automatically to `http://localhost:3000`

## Step 3: Test the Connection

1. Open your browser and go to `http://localhost:3000`
2. Click on "Submit Feedback" in the navigation
3. Fill in the form:
   - Student ID: DSE24143160 (or leave empty)
   - Feedback Text: "the dashboard is not attractive and its not working efficiently"
4. Click "Submit Feedback"

## Step 4: Check for Errors

### If you see "Failed to submit feedback":

1. **Check if backend is running:**
   - Look at the backend terminal - it should show activity
   - Try visiting: http://localhost:5000/api/health
   - You should see: `{"status":"healthy","message":"API is running"}`

2. **Check browser console:**
   - Press F12 to open Developer Tools
   - Go to the "Console" tab
   - Look for error messages
   - The improved error handling will show the actual error

3. **Check network requests:**
   - In Developer Tools, go to "Network" tab
   - Submit the form again
   - Look for the `/api/feedback` request
   - Check if it's returning an error (red status)

### Common Issues:

#### Issue 1: Backend not running
**Solution:** Make sure the backend terminal shows the server is running on port 5000

#### Issue 2: Port 5000 already in use
**Solution:** 
- Find what's using the port and close it
- Or change the port in `backend/app.py` to 5001
- Update `frontend/package.json` proxy to `http://localhost:5001`

#### Issue 3: Database error
**Solution:**
```bash
cd backend
# Delete the database file
del feedback.db  # Windows
rm feedback.db   # macOS/Linux
# Restart the server (it will create a new database)
python app.py
```

#### Issue 4: Missing dependencies
**Solution:**
```bash
# Backend
cd backend
pip install -r requirements.txt
python init_nltk.py

# Frontend
cd frontend
npm install
```

## Step 5: Verify Everything Works

1. Submit a test feedback
2. You should see a success message with:
   - Category (e.g., "teaching_style", "infrastructure")
   - Sentiment (positive/negative/neutral)
   - Sentiment score
   - Suggestions

3. Go to "View Feedbacks" to see your submitted feedback
4. Go to "Dashboard" to see analytics
5. Go to "Analytics" to see charts

## Still Having Issues?

1. Check the **TROUBLESHOOTING.md** file for detailed solutions
2. Check the browser console for specific error messages
3. Check the backend terminal for error messages
4. Make sure both servers are running simultaneously

## Quick Test

Test the API directly using curl or your browser:

```bash
# Health check
curl http://localhost:5000/api/health

# Or open in browser:
# http://localhost:5000/api/health
```

If this doesn't work, the backend is not running properly.

