import spacy
import os

nlp = spacy.load("en_core_web_sm")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NEWS_PATH = os.path.join(BASE_DIR, "data", "news.txt")

SEVERITY_KEYWORDS = {
    "HIGH": ["accident", "closed", "blocked", "flooding", "protest", "collision", "crash"],
    "MEDIUM": ["construction", "delays", "vip", "movement", "diversion", "repair"],
    "LOW": ["slow", "minor", "slight", "congestion", "busy"]
}

def classify_severity(text):
    text_lower = text.lower()
    for level, keywords in SEVERITY_KEYWORDS.items():
        if any(word in text_lower for word in keywords):
            return level
    return "LOW"

def extract_incidents():
    # If news.txt doesn't exist, return sample data
    if not os.path.exists(NEWS_PATH):
        return [{
            "text": "No news data available yet.",
            "locations": [],
            "severity": "LOW"
        }]

    with open(NEWS_PATH, "r") as f:
        lines = f.readlines()

    incidents = []
    for line in lines:
        line = line.strip()
        if not line:
            continue

        doc = nlp(line)

        # Extract locations using NER
        locations = [ent.text for ent in doc.ents
                     if ent.label_ in ["GPE", "LOC", "FAC"]]

        severity = classify_severity(line)

        incidents.append({
            "text": line,
            "locations": locations,
            "severity": severity
        })

    return incidents

if __name__ == "__main__":
    results = extract_incidents()
    for r in results:
        print(r)