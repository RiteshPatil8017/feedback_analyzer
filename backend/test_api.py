"""
Simple test script to check if the API is working
"""
import requests
import json

def test_api():
    base_url = "http://localhost:5000"
    
    # Test health check
    print("Testing health check...")
    try:
        response = requests.get(f"{base_url}/api/health")
        print(f"Health check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Error connecting to API: {e}")
        print("Make sure the backend server is running on http://localhost:5000")
        return
    
    # Test feedback submission
    print("\nTesting feedback submission...")
    test_feedback = {
        "student_id": "TEST001",
        "course_id": "CS101",
        "instructor_id": "INST001",
        "feedback_text": "The dashboard is not attractive and its not working efficiently"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/feedback",
            json=test_feedback,
            headers={"Content-Type": "application/json"}
        )
        print(f"Feedback submission: {response.status_code}")
        if response.status_code == 201:
            print("Success! Feedback submitted.")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error submitting feedback: {e}")

if __name__ == "__main__":
    test_api()

