import re

from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

try:
    from transformers import pipeline
except Exception as e:  # pragma: no cover - transformers is optional
    pipeline = None
    print(f"Warning: transformers not available, falling back to classic sentiment models: {e}")


class SentimentAnalyzer:
    """
    Sentiment analyzer that prefers a transformer-based model (DistilBERT)
    for high-accuracy classification, with TextBlob/VADER as a graceful
    fallback when transformers or model weights are unavailable.
    """

    def __init__(self):
        # Initialize transformer pipeline lazily to avoid heavy startup if unavailable
        self.transformer_pipeline = None
        if pipeline is not None:
            try:
                self.transformer_pipeline = pipeline(
                    "sentiment-analysis",
                    model="distilbert-base-uncased-finetuned-sst-2-english"
                )
                print("Transformer-based sentiment model initialised (DistilBERT).")
            except Exception as e:
                print(f"Warning: could not initialise transformer sentiment model: {e}")
                self.transformer_pipeline = None

        # Classic models kept as robust fallback
        try:
            self.vader_analyzer = SentimentIntensityAnalyzer()
        except Exception as e:
            print(f"Warning: Error initializing VADER analyzer: {e}")
            self.vader_analyzer = None

    def analyze(self, text):
        """
        Analyze sentiment of text.

        Priority:
        1. DistilBERT transformer pipeline (if available)
        2. Combined VADER + TextBlob fallback
        """
        if not text or not text.strip():
            return {
                'sentiment': 'neutral',
                'score': 0.0,
                'confidence': 0.0
            }

        cleaned_text = self._clean_text(text)

        # 1) Try high-accuracy transformer first
        if self.transformer_pipeline is not None:
            try:
                result = self.transformer_pipeline(cleaned_text[:400])[0]  # type: ignore[index]
                label = (result.get("label") or "").lower()
                score = float(result.get("score", 0.0))

                # Map model labels to our tri-state sentiment
                if label == "positive":
                    sentiment = "positive"
                elif label == "negative":
                    sentiment = "negative"
                else:
                    sentiment = "neutral"

                # Derive a signed score in [-1, 1]
                signed_score = score if sentiment == "positive" else -score if sentiment == "negative" else 0.0

                return {
                    'sentiment': sentiment,
                    'score': round(signed_score, 3),
                    'confidence': round(score, 3),
                    'model': 'distilbert-base-uncased-finetuned-sst-2-english'
                }
            except Exception as e:
                print(f"Warning: transformer sentiment inference failed, falling back: {e}")

        # 2) Fallback: VADER + TextBlob
        try:
            if self.vader_analyzer:
                vader_scores = self.vader_analyzer.polarity_scores(cleaned_text)
                vader_compound = vader_scores['compound']
            else:
                vader_compound = 0.0
        except Exception as e:
            print(f"Error in VADER analysis: {e}")
            vader_compound = 0.0

        try:
            blob = TextBlob(cleaned_text)
            textblob_polarity = blob.sentiment.polarity
        except Exception as e:
            print(f"Error in TextBlob analysis: {e}")
            textblob_polarity = 0.0

        combined_score = (vader_compound * 0.6) + (textblob_polarity * 0.4)

        if combined_score >= 0.1:
            sentiment = 'positive'
        elif combined_score <= -0.1:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'

        confidence = abs(combined_score)

        return {
            'sentiment': sentiment,
            'score': round(combined_score, 3),
            'confidence': round(confidence, 3),
            'vader_score': round(vader_compound, 3),
            'textblob_score': round(textblob_polarity, 3),
            'model': 'vader+textblob'
        }

    def _clean_text(self, text):
        """
        Clean and preprocess text
        """
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\w\s.,!?]', '', text)
        return text.strip()

    def analyze_batch(self, texts):
        """
        Analyze sentiment for multiple texts
        """
        results = []
        for text in texts:
            results.append(self.analyze(text))
        return results

