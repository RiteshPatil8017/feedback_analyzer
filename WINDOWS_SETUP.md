# Windows Setup Guide - Student Feedback Analyzer

## Quick Start (Easiest Method)

### Method 1: Using Batch File (Recommended)

1. **Double-click** `backend/start_server.bat` to start the backend
2. **Open a new terminal** and run:
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Method 2: Manual Setup

## Backend Setup

### Step 1: Open PowerShell or Command Prompt
Navigate to the project directory:
```powershell
cd "C:\Users\PRATIKSHA\OneDrive\Documents\Engineering(BTech)\Sem_V\Python\hack\backend"
```

### Step 2: Create Virtual Environment (if not exists)
```powershell
python -m venv venv
```

### Step 3: Install Dependencies
**For PowerShell:**
```powershell
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

**For Command Prompt:**
```cmd
venv\Scripts\activate
pip install -r requirements.txt
```

### Step 4: Download NLTK Data
**For PowerShell:**
```powershell
.\venv\Scripts\python.exe init_nltk.py
```

**For Command Prompt:**
```cmd
venv\Scripts\activate
python init_nltk.py
```

### Step 5: Start Backend Server

**For PowerShell:**
```powershell
.\venv\Scripts\python.exe app.py
```

**For Command Prompt:**
```cmd
venv\Scripts\activate
python app.py
```

You should see:
```
Starting Student Feedback Analyzer API...
Database initialized successfully!
Server starting on http://localhost:5000
```

**Keep this terminal open!** The backend must be running.

## Frontend Setup

### Step 1: Open a NEW Terminal
Navigate to the frontend directory:
```powershell
cd "C:\Users\PRATIKSHA\OneDrive\Documents\Engineering(BTech)\Sem_V\Python\hack\frontend"
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start Frontend Server
```bash
npm start
```

The browser should open automatically to `http://localhost:3000`

## Troubleshooting

### Issue 1: "ModuleNotFoundError: No module named 'flask_cors'"

**Solution:**
```powershell
cd backend
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

### Issue 2: "venv\Scripts\activate : The module 'venv' could not be loaded"

This is a PowerShell issue. Use one of these methods:

**Method A: Use the batch file**
```cmd
start_server.bat
```

**Method B: Use Python directly (no activation needed)**
```powershell
.\venv\Scripts\python.exe app.py
```

**Method C: Enable PowerShell script execution**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then you can use:
```powershell
.\venv\Scripts\Activate.ps1
```

### Issue 3: Port 5000 already in use

**Solution:**
1. Find what's using the port:
   ```powershell
   netstat -ano | findstr :5000
   ```
2. Kill the process or change the port in `backend/app.py`:
   ```python
   app.run(debug=True, port=5001, host='0.0.0.0')
   ```
3. Update `frontend/package.json`:
   ```json
   "proxy": "http://localhost:5001"
   ```

### Issue 4: "Failed to submit feedback"

**Check:**
1. Is the backend server running? (Check the terminal)
2. Can you access http://localhost:5000/api/health in your browser?
3. Check browser console (F12) for errors
4. Check backend terminal for error messages

### Issue 5: NLTK Data Errors

**Solution:**
```powershell
cd backend
.\venv\Scripts\python.exe init_nltk.py
```

If that doesn't work:
```powershell
.\venv\Scripts\python.exe
```
Then in Python:
```python
import nltk
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('vader_lexicon')
nltk.download('averaged_perceptron_tagger')
nltk.download('brown')
```

## Testing the Setup

1. **Test Backend:**
   - Open browser: http://localhost:5000/api/health
   - Should see: `{"status":"healthy","message":"API is running"}`

2. **Test Frontend:**
   - Open browser: http://localhost:3000
   - Should see the Student Feedback Analyzer dashboard

3. **Test Feedback Submission:**
   - Go to "Submit Feedback"
   - Enter feedback text
   - Click "Submit Feedback"
   - Should see success message with analysis results

## Common Commands Reference

### Backend
```powershell
# Start server (PowerShell)
.\venv\Scripts\python.exe app.py

# Start server (Command Prompt)
venv\Scripts\activate
python app.py

# Install dependencies
.\venv\Scripts\python.exe -m pip install -r requirements.txt

# Download NLTK data
.\venv\Scripts\python.exe init_nltk.py
```

### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Next Steps

1. ✅ Backend server running on port 5000
2. ✅ Frontend server running on port 3000
3. ✅ Test feedback submission
4. ✅ Check dashboard and analytics

## Need Help?

1. Check the **TROUBLESHOOTING.md** file
2. Check browser console (F12) for errors
3. Check backend terminal for error messages
4. Verify both servers are running simultaneously

