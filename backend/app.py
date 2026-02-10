from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime
import os
from dotenv import load_dotenv
import pandas as pd
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

from services.nlp_engine import NLPEngine
from services.sentiment_analyzer import SentimentAnalyzer
from services.suggestion_generator import SuggestionGenerator
from services.alert_system import AlertSystem

load_dotenv()

app = Flask(__name__)

# Always use the SQLite database file inside the backend folder,
# regardless of where the server is started from.
BASEDIR = os.path.abspath(os.path.dirname(__file__))
DEFAULT_DB_PATH = os.path.join(BASEDIR, 'feedback.db')
default_sqlite_uri = f"sqlite:///{DEFAULT_DB_PATH}"

# PRODUCTION UPDATED: Render provides DATABASE_URL. 
# SQLAlchemy requires 'postgresql://' instead of 'postgres://'
db_url = os.getenv('DATABASE_URL', default_sqlite_uri)
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = os.path.join(BASEDIR, 'uploads')
app.config['ALLOWED_EXTENSIONS'] = {'csv', 'xlsx', 'xls'}
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# PRODUCTION UPDATED: Update CORS origins to include your production Vercel URL
allowed_origins = [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'https://your-app-name.vercel.app' # Replace with your actual Vercel URL after deployment
]
CORS(app, supports_credentials=True, origins=allowed_origins)

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Initialize services
nlp_engine = NLPEngine()
sentiment_analyzer = SentimentAnalyzer()
suggestion_generator = SuggestionGenerator()
alert_system = AlertSystem()

# Database Models
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'student', 'admin', or 'faculty'
    student_id = db.Column(db.String(100))  # For students
    faculty_id = db.Column(db.String(100))  # For faculty (employee ID)
    name = db.Column(db.String(200))  # Display name
    classes = db.Column(db.String(500))  # For faculty: comma-separated classes they teach
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'student_id': self.student_id,
            'faculty_id': self.faculty_id,
            'name': self.name,
            'classes': [c.strip() for c in (self.classes or '').split(',') if c.strip()] if self.role == 'faculty' else None
        }

class Feedback(db.Model):
    __tablename__ = 'feedback'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(100))
    class_name = db.Column(db.String(100))  # Student's class/section
    course_id = db.Column(db.String(100))
    instructor_id = db.Column(db.String(100))  # Faculty user id when feedback_type='faculty'
    feedback_type = db.Column(db.String(20), default='campus')  # 'campus' or 'faculty'
    feedback_text = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100))
    sentiment = db.Column(db.String(20))
    sentiment_score = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_urgent = db.Column(db.Boolean, default=False)
    suggestions = db.Column(db.Text)

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'class_name': self.class_name,
            'course_id': self.course_id,
            'instructor_id': self.instructor_id,
            'feedback_type': self.feedback_type,
            'feedback_text': self.feedback_text,
            'category': self.category,
            'sentiment': self.sentiment,
            'sentiment_score': self.sentiment_score,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'is_urgent': self.is_urgent,
            'suggestions': self.suggestions
        }

# Authentication decorators
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        user = User.query.get(session['user_id'])
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

def faculty_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        user = User.query.get(session['user_id'])
        if not user or user.role != 'faculty':
            return jsonify({'error': 'Faculty access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'API is running'})

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        role = data.get('role', 'student')  # Default to student
        student_id = data.get('student_id')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        if role not in ['student', 'admin', 'faculty']:
            return jsonify({'error': 'Invalid role. Must be student, admin, or faculty'}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        # Create new user
        faculty_id = data.get('faculty_id')
        name = data.get('name')
        classes = data.get('classes', '')  # Comma-separated for faculty
        if isinstance(classes, list):
            classes = ','.join(classes)
        user = User(username=username, role=role, student_id=student_id, faculty_id=faculty_id, name=name, classes=classes)
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        user = User.query.filter_by(username=username).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid username or password'}), 401
        
        # Set session
        session['user_id'] = user.id
        session['username'] = user.username
        session['role'] = user.role
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200

@app.route('/api/auth/me', methods=['GET'])
@login_required
def get_current_user():
    try:
        user = User.query.get(session['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'success': True, 'user': user.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/feedback', methods=['POST'])
@login_required
def submit_feedback():
    try:
        data = request.get_json()
        
        if not data or 'feedback_text' not in data:
            return jsonify({'error': 'Feedback text is required'}), 400
        
        # Get student_id from session if user is logged in as student
        user = User.query.get(session['user_id'])
        if user and user.role == 'student' and user.student_id:
            student_id = user.student_id
        else:
            student_id = data.get('student_id', 'anonymous') or 'anonymous'
        
        feedback_text = data['feedback_text']
        feedback_type = data.get('feedback_type', 'campus')
        if feedback_type not in ['campus', 'faculty']:
            feedback_type = 'campus'
        class_name = data.get('class_name', '') or ''
        course_id = data.get('course_id', 'general') or 'general'
        instructor_id = data.get('instructor_id', '') or ''
        if feedback_type == 'faculty' and not instructor_id:
            return jsonify({'error': 'Please select a faculty member for faculty feedback'}), 400
        
        # Process feedback using NLP
        try:
            category = nlp_engine.categorize_feedback(feedback_text)
        except Exception as e:
            print(f"Error in NLP categorization: {e}")
            category = 'general'
        
        # Analyze sentiment
        try:
            sentiment_result = sentiment_analyzer.analyze(feedback_text)
            sentiment = sentiment_result['sentiment']
            sentiment_score = sentiment_result['score']
        except Exception as e:
            print(f"Error in sentiment analysis: {e}")
            sentiment = 'neutral'
            sentiment_score = 0.0
        
        # Generate suggestions
        try:
            suggestions = suggestion_generator.generate_suggestions(feedback_text, category, sentiment)
        except Exception as e:
            print(f"Error in suggestion generation: {e}")
            suggestions = "No suggestions available at this time."
        
        # Check for urgent issues
        try:
            is_urgent = alert_system.check_urgent(feedback_text)
        except Exception as e:
            print(f"Error in alert system: {e}")
            is_urgent = False
        
        # Create feedback record
        feedback = Feedback(
            student_id=student_id,
            class_name=class_name,
            course_id=course_id,
            instructor_id=str(instructor_id) if instructor_id else '',
            feedback_type=feedback_type,
            feedback_text=feedback_text,
            category=category,
            sentiment=sentiment,
            sentiment_score=sentiment_score,
            suggestions=suggestions,
            is_urgent=is_urgent
        )
        
        db.session.add(feedback)
        db.session.commit()
        
        # Send alert if urgent
        if is_urgent:
            try:
                alert_system.send_alert(feedback)
            except Exception as e:
                print(f"Error sending alert: {e}")
        
        return jsonify({
            'success': True,
            'feedback': feedback.to_dict(),
            'message': 'Feedback submitted successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in submit_feedback: {error_trace}")
        return jsonify({
            'error': str(e),
            'message': 'An error occurred while processing your feedback. Please try again.'
        }), 500

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def process_feedback_row(row, default_feedback_type=None):
    """Process a single row from CSV/Excel and create feedback entry.

    Args:
        row: A pandas Series representing the CSV/Excel row.
        default_feedback_type (str | None): Optional override for feedback type.
            If provided ('campus' or 'faculty'), that value will be used when the
            row does not contain an explicit feedback_type column.
    """
    try:
        # Try to extract data from different possible column names (case-insensitive)
        feedback_text = None
        student_id = None
        course_id = None
        instructor_id = None
        
        # Normalize column names to lowercase for easier matching
        row_dict = {str(k).lower().strip(): v for k, v in row.items()}
        
        # Find feedback text column (could be 'feedback', 'feedback_text', 'text', 'comment', etc.)
        for key in ['feedback_text', 'feedback', 'text', 'comment', 'comments', 'message']:
            if key in row_dict and pd.notna(row_dict[key]):
                feedback_text = str(row_dict[key]).strip()
                break
        
        # Find student_id column
        for key in ['student_id', 'studentid', 'student', 'sid']:
            if key in row_dict and pd.notna(row_dict[key]):
                student_id = str(row_dict[key]).strip() or 'anonymous'
                break
        
        # Find course_id column
        for key in ['course_id', 'courseid', 'course', 'cid']:
            if key in row_dict and pd.notna(row_dict[key]):
                course_id = str(row_dict[key]).strip() or 'general'
                break
        
        # Find instructor_id column
        for key in ['instructor_id', 'instructorid', 'instructor', 'iid', 'teacher_id', 'teacher']:
            if key in row_dict and pd.notna(row_dict[key]):
                instructor_id = str(row_dict[key]).strip() or 'general'
                break
        
        # If feedback_text is missing, skip this row
        if not feedback_text or feedback_text == '':
            return None
        
        # Normalise default feedback type from the upload form if provided
        if default_feedback_type:
            default_feedback_type = str(default_feedback_type).strip().lower()
            if default_feedback_type not in ['campus', 'faculty']:
                default_feedback_type = None

        # Set defaults
        student_id = student_id or 'anonymous'
        course_id = course_id or 'general'
        instructor_id = instructor_id or 'general'
        # Determine feedback type - priority: row value > form default > campus
        row_feedback_type = str(
            row_dict.get('feedback_type', row_dict.get('feedback type', '')).strip()
        ).lower() if row_dict.get('feedback_type') or row_dict.get('feedback type') else ''

        if row_feedback_type in ['campus', 'faculty']:
            feedback_type = row_feedback_type
        elif default_feedback_type in ['campus', 'faculty']:
            feedback_type = default_feedback_type
        else:
            feedback_type = 'campus'
        class_name = ''
        for key in ['class_name', 'class', 'section']:
            if key in row_dict and pd.notna(row_dict[key]):
                class_name = str(row_dict[key]).strip()
                break
        
        # Process feedback using NLP
        try:
            category = nlp_engine.categorize_feedback(feedback_text)
        except Exception as e:
            print(f"Error in NLP categorization: {e}")
            category = 'general'
        
        # Analyze sentiment
        try:
            sentiment_result = sentiment_analyzer.analyze(feedback_text)
            sentiment = sentiment_result['sentiment']
            sentiment_score = sentiment_result['score']
        except Exception as e:
            print(f"Error in sentiment analysis: {e}")
            sentiment = 'neutral'
            sentiment_score = 0.0
        
        # Generate suggestions
        try:
            suggestions = suggestion_generator.generate_suggestions(feedback_text, category, sentiment)
        except Exception as e:
            print(f"Error in suggestion generation: {e}")
            suggestions = "No suggestions available at this time."
        
        # Check for urgent issues
        try:
            is_urgent = alert_system.check_urgent(feedback_text)
        except Exception as e:
            print(f"Error in alert system: {e}")
            is_urgent = False
        
        # Create feedback record
        feedback = Feedback(
            student_id=student_id,
            class_name=class_name,
            course_id=course_id,
            instructor_id=str(instructor_id),
            feedback_type=feedback_type,
            feedback_text=feedback_text,
            category=category,
            sentiment=sentiment,
            sentiment_score=sentiment_score,
            suggestions=suggestions,
            is_urgent=is_urgent
        )
        
        db.session.add(feedback)
        
        # Send alert if urgent
        if is_urgent:
            try:
                alert_system.send_alert(feedback)
            except Exception as e:
                print(f"Error sending alert: {e}")
        
        return feedback
        
    except Exception as e:
        print(f"Error processing row: {e}")
        return None

@app.route('/api/feedback/upload', methods=['POST'])
@admin_required
def upload_feedback_file():
    try:
        # Optional feedback_type coming from the admin panel UI
        # This acts as a default when the file itself does not specify per-row types
        default_feedback_type = request.form.get('feedback_type', '').strip().lower() or None

        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only CSV and Excel files are allowed.'}), 400
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Read the file based on extension
        try:
            if filename.endswith('.csv'):
                df = pd.read_csv(filepath)
            elif filename.endswith('.xlsx') or filename.endswith('.xls'):
                df = pd.read_excel(filepath)
            else:
                os.remove(filepath)
                return jsonify({'error': 'Unsupported file format'}), 400
        except Exception as e:
            os.remove(filepath)
            return jsonify({'error': f'Error reading file: {str(e)}'}), 400
        
        # Process each row
        processed_count = 0
        failed_count = 0
        feedbacks = []
        
        for index, row in df.iterrows():
            feedback = process_feedback_row(row, default_feedback_type=default_feedback_type)
            if feedback:
                processed_count += 1
                feedbacks.append(feedback)
            else:
                failed_count += 1
        
        # Commit all feedback entries
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            os.remove(filepath)
            return jsonify({'error': f'Error saving feedback to database: {str(e)}'}), 500
        
        # Clean up uploaded file
        try:
            os.remove(filepath)
        except Exception as e:
            print(f"Warning: Could not delete uploaded file: {e}")
        
        return jsonify({
            'success': True,
            'message': f'File processed successfully. {processed_count} feedback entries added.',
            'processed': processed_count,
            'failed': failed_count,
            'total_rows': len(df),
            'feedbacks': [f.to_dict() for f in feedbacks]
        }), 201
        
    except Exception as e:
        db.session.rollback()
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in upload_feedback_file: {error_trace}")
        return jsonify({
            'error': str(e),
            'message': 'An error occurred while processing the file. Please try again.'
        }), 500

@app.route('/api/faculty', methods=['GET'])
def get_faculty_list():
    """Get list of all faculty - for student form dropdown (no auth) and admin"""
    try:
        faculty = User.query.filter_by(role='faculty').order_by(User.name or User.username).all()
        return jsonify({
            'success': True,
            'faculty': [f.to_dict() for f in faculty]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/faculty', methods=['POST'])
@admin_required
def add_faculty():
    """Admin: Add new faculty"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        name = data.get('name')
        faculty_id = data.get('faculty_id', '')
        classes = data.get('classes', '')
        if isinstance(classes, list):
            classes = ','.join(str(c) for c in classes)
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        user = User(username=username, role='faculty', faculty_id=faculty_id, name=name or username, classes=classes)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Faculty added successfully', 'faculty': user.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/faculty/<int:faculty_user_id>', methods=['PUT', 'PATCH'])
@admin_required
def update_faculty(faculty_user_id):
    """Admin: Update faculty details"""
    try:
        user = User.query.get_or_404(faculty_user_id)
        if user.role != 'faculty':
            return jsonify({'error': 'User is not a faculty member'}), 400
        
        data = request.get_json() or {}
        if 'name' in data:
            user.name = data['name']
        if 'faculty_id' in data:
            user.faculty_id = data['faculty_id']
        if 'classes' in data:
            classes = data['classes']
            user.classes = ','.join(classes) if isinstance(classes, list) else str(classes)
        if data.get('password'):
            user.set_password(data['password'])
        
        db.session.commit()
        return jsonify({'success': True, 'message': 'Faculty updated successfully', 'faculty': user.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/faculty/<int:faculty_user_id>', methods=['DELETE'])
@admin_required
def delete_faculty(faculty_user_id):
    """Admin: Delete faculty"""
    try:
        user = User.query.get_or_404(faculty_user_id)
        if user.role != 'faculty':
            return jsonify({'error': 'User is not a faculty member'}), 400
        db.session.delete(user)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Faculty deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/feedback', methods=['GET'])
@login_required
def get_feedback():
    try:
        user = User.query.get(session['user_id'])
        instructor_id = request.args.get('instructor_id')
        course_id = request.args.get('course_id')
        class_name = request.args.get('class_name')
        feedback_type = request.args.get('feedback_type')
        
        query = Feedback.query
        
        # Faculty sees only their feedback
        if user.role == 'faculty':
            query = query.filter_by(instructor_id=str(user.id))
            if class_name:
                query = query.filter_by(class_name=class_name)
        # Admin sees all
        else:
            if instructor_id:
                query = query.filter_by(instructor_id=instructor_id)
            if course_id:
                query = query.filter_by(course_id=course_id)
            if class_name:
                query = query.filter_by(class_name=class_name)
            if feedback_type:
                query = query.filter_by(feedback_type=feedback_type)
        
        feedbacks = query.order_by(Feedback.timestamp.desc()).all()
        
        return jsonify({
            'success': True,
            'feedbacks': [f.to_dict() for f in feedbacks],
            'count': len(feedbacks)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/feedback/<int:feedback_id>', methods=['DELETE'])
@admin_required
def delete_feedback(feedback_id):
    try:
        feedback = Feedback.query.get_or_404(feedback_id)
        
        db.session.delete(feedback)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Feedback deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/feedback/analytics', methods=['GET'])
@login_required
def get_analytics():
    try:
        user = User.query.get(session['user_id'])
        instructor_id = request.args.get('instructor_id')
        course_id = request.args.get('course_id')
        class_name = request.args.get('class_name')
        
        query = Feedback.query
        if user.role == 'faculty':
            query = query.filter_by(instructor_id=str(user.id))
            if class_name:
                query = query.filter_by(class_name=class_name)
        else:
            if instructor_id:
                query = query.filter_by(instructor_id=instructor_id)
            if course_id:
                query = query.filter_by(course_id=course_id)
            if class_name:
                query = query.filter_by(class_name=class_name)
        
        feedbacks = query.all()
        
        # Calculate analytics
        total_feedbacks = len(feedbacks)
        if total_feedbacks == 0:
            return jsonify({
                'success': True,
                'analytics': {
                    'total_feedbacks': 0,
                    'sentiment_distribution': {},
                    'category_distribution': {},
                    'average_sentiment_score': 0,
                    'urgent_count': 0,
                    'trends': []
                }
            })
        
        # Sentiment distribution
        sentiment_counts = {}
        category_counts = {}
        total_sentiment_score = 0
        sentiment_score_count = 0
        urgent_count = 0
        
        for feedback in feedbacks:
            # Sentiment distribution
            sentiment = feedback.sentiment
            sentiment_counts[sentiment] = sentiment_counts.get(sentiment, 0) + 1
            
            # Category distribution
            category = feedback.category
            category_counts[category] = category_counts.get(category, 0) + 1
            
            # Average sentiment score
            if feedback.sentiment_score is not None:
                total_sentiment_score += feedback.sentiment_score
                sentiment_score_count += 1
            
            # Urgent count
            if feedback.is_urgent:
                urgent_count += 1
        
        avg_sentiment_score = total_sentiment_score / sentiment_score_count if sentiment_score_count > 0 else 0
        
        # Trends (last 30 days)
        trends = []
        from datetime import timedelta
        for i in range(30):
            date = datetime.utcnow() - timedelta(days=30-i)
            day_feedbacks = [f for f in feedbacks if f.timestamp and f.timestamp.date() == date.date()]
            day_scores = [f.sentiment_score for f in day_feedbacks if f.sentiment_score is not None]
            trends.append({
                'date': date.strftime('%Y-%m-%d'),
                'count': len(day_feedbacks),
                'avg_sentiment': sum(day_scores) / len(day_scores) if day_scores else 0
            })
        
        return jsonify({
            'success': True,
            'analytics': {
                'total_feedbacks': total_feedbacks,
                'sentiment_distribution': sentiment_counts,
                'category_distribution': category_counts,
                'average_sentiment_score': round(avg_sentiment_score, 2),
                'urgent_count': urgent_count,
                'trends': trends
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/feedback/urgent', methods=['GET'])
@admin_required
def get_urgent_feedback():
    try:
        urgent_feedbacks = Feedback.query.filter_by(is_urgent=True).order_by(Feedback.timestamp.desc()).all()
        
        return jsonify({
            'success': True,
            'feedbacks': [f.to_dict() for f in urgent_feedbacks],
            'count': len(urgent_feedbacks)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/suggestions', methods=['GET'])
@login_required
def get_suggestions():
    try:
        user = User.query.get(session['user_id'])
        instructor_id = request.args.get('instructor_id')
        course_id = request.args.get('course_id')
        class_name = request.args.get('class_name')
        
        query = Feedback.query
        if user.role == 'faculty':
            query = query.filter_by(instructor_id=str(user.id))
            if class_name:
                query = query.filter_by(class_name=class_name)
        else:
            if instructor_id:
                query = query.filter_by(instructor_id=instructor_id)
            if course_id:
                query = query.filter_by(course_id=course_id)
            if class_name:
                query = query.filter_by(class_name=class_name)
        
        feedbacks = query.all()
        
        # Aggregate suggestions
        all_suggestions = []
        for feedback in feedbacks:
            if feedback.suggestions:
                all_suggestions.append({
                    'feedback_id': feedback.id,
                    'category': feedback.category,
                    'suggestion': feedback.suggestions,
                    'sentiment': feedback.sentiment
                })
        
        return jsonify({
            'success': True,
            'suggestions': all_suggestions
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Student Feedback Analyzer API...")
    print("Initializing database...")
    
    try:
        with app.app_context():
            db.create_all()
            
            # Add new columns to existing DB (SQLite migration)
            import sqlite3
            db_path = app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
            if db_path and db_path != app.config['SQLALCHEMY_DATABASE_URI']:
                try:
                    conn = sqlite3.connect(db_path)
                    c = conn.cursor()
                    c.execute("PRAGMA table_info(users)")
                    user_cols = [row[1] for row in c.fetchall()]
                    for col, defn in [('faculty_id', 'VARCHAR(100)'), ('name', 'VARCHAR(200)'), ('classes', 'VARCHAR(500)')]:
                        if col not in user_cols:
                            c.execute(f"ALTER TABLE users ADD COLUMN {col} {defn}")
                    c.execute("PRAGMA table_info(feedback)")
                    fb_cols = [row[1] for row in c.fetchall()]
                    for col, defn in [('class_name', 'VARCHAR(100)'), ('feedback_type', "VARCHAR(20) DEFAULT 'campus'")]:
                        if col not in fb_cols:
                            c.execute(f"ALTER TABLE feedback ADD COLUMN {col} {defn}")
                    conn.commit()
                    conn.close()
                except Exception as me:
                    print(f"Migration: {me}")
            
            # Create default admin user if it doesn't exist
            admin = User.query.filter_by(username='admin').first()
            if not admin:
                admin = User(username='admin', role='admin')
                admin.set_password('admin123')  # Default password - change in production!
                db.session.add(admin)
                db.session.commit()
                print("Default admin user created: username='admin', password='admin123'")
            
            # Create default faculty for testing if none exist
            faculty_count = User.query.filter_by(role='faculty').count()
            if faculty_count == 0:
                faculty = User(username='faculty1', role='faculty', name='Dr. Sample Faculty', faculty_id='FAC001', classes='DSE-A,BTech-CSE-3A')
                faculty.set_password('faculty123')
                db.session.add(faculty)
                db.session.commit()
                print("Default faculty created: username='faculty1', password='faculty123'")
            
            print("Database initialized successfully!")
    except Exception as e:
        print(f"Warning: Database initialization error: {e}")
        print("The application will continue, but database operations may fail.")
    
    # Render requires the app to listen on a port defined by an environment variable
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)