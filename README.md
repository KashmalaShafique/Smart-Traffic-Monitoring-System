# 🚦 Smart Traffic Monitoring System

An AI-powered smart traffic monitoring platform that combines Computer Vision, Machine Learning, and Natural Language Processing to perform real-time vehicle detection, congestion prediction, and incident analysis. The system features a full-stack web application built with Django and React, along with an AI-powered Video Q&A assistant using the Gemini API.

---

## 📌 Overview

This project is designed to improve traffic monitoring and management by automating vehicle detection, predicting congestion levels, extracting incident information from reports, and enabling users to ask natural language questions about traffic footage.

---

## ✨ Features

- ✅ Real-time vehicle detection using **YOLO11**
- ✅ Traffic congestion prediction using **Gradient Boosting**
- ✅ NLP-based incident extraction using **spaCy**
- ✅ AI-powered Video Q&A using the **Gemini API**
- ✅ Interactive analytics dashboard built with **React.js**
- ✅ RESTful backend developed using **Django REST Framework**

---

## 🛠️ Tech Stack

### Backend
- Python
- Django
- Django REST Framework

### Frontend
- React.js
- HTML
- CSS
- JavaScript

### Artificial Intelligence
- YOLO11
- OpenCV
- Gradient Boosting
- spaCy
- Gemini API

---

## ⚙️ How It Works

1. Traffic videos are processed using **YOLO11** for real-time vehicle detection.
2. Vehicle counts and traffic patterns are analyzed using a **Gradient Boosting** model to predict congestion levels.
3. Traffic incident reports are processed using **spaCy** to extract structured incident information.
4. The processed data is served through a **Django REST API** and visualized on a **React.js dashboard**.
5. Users can interact with traffic footage using natural language through the **Gemini-powered Video Q&A** feature.

---

## 📂 Project Structure

```text
Smart-Traffic-Monitoring-System/
│
├── backend/                # Django backend & REST APIs
├── frontend/               # React frontend
├── models/                 # YOLO11 and ML models
├── screenshots/            # Project screenshots
├── requirements.txt
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🚀 Installation

### Clone the Repository

```bash
git clone https://github.com/<your-username>/Smart-Traffic-Monitoring-System.git
cd Smart-Traffic-Monitoring-System
```

### Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

npm install

npm start
```

---

## 🔐 Environment Variables

Create a `.env` file inside the backend directory and add:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
SECRET_KEY=YOUR_DJANGO_SECRET_KEY
DEBUG=True
```

> **Note:** Never upload your `.env` file or API keys to GitHub.

---

## 📸 Screenshots

### Dashboard

*Add dashboard screenshot here.*

### Vehicle Detection

*Add vehicle detection screenshot here.*

### Congestion Prediction

*Add congestion prediction screenshot here.*

### Video Q&A

*Add Video Q&A screenshot here.*

---

## 📈 Future Improvements

- Live CCTV camera integration
- Automatic accident detection
- Multi-camera support
- Traffic density heatmaps
- Mobile application
- Cloud deployment
- Advanced analytics and reporting

---

## 👩‍💻 Author

**Kashmala Shafique**

BS Artificial Intelligence Student

University of Wah

---

## 📄 License

This project is developed for academic and portfolio purposes.
