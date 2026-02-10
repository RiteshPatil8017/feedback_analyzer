import nltk
import ssl

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('vader_lexicon', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
    nltk.download('brown', quiet=True)  # Required for TextBlob
    print("NLTK data downloaded successfully!")
except Exception as e:
    print(f"Warning: Error downloading NLTK data: {e}")
    print("The application may still work, but some features might be limited.")

