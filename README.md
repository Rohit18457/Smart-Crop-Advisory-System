# 🌾 Smart Agriculture Advisory Web Platform

A comprehensive AI-powered web application designed to help Indian farmers make data-driven decisions using modern technology, real-time APIs, and an intuitive dashboard interface.

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     Frontend (React 18)                         │
│  Tailwind CSS │ React Router │ i18next │ Recharts │ Axios       │
│  Supabase Auth (client-side)                                    │
└────────────────────────┬─────────────────────────────────────────┘
                         │ REST API (http://localhost:5000)
┌────────────────────────▼─────────────────────────────────────────┐
│                     Backend (Flask 3.1)                          │
│  Blueprints │ Flask-Limiter │ Supabase JWT verification         │
├─────────────┬──────────────┬──────────────┬─────────────────────┤
│ Disease     │ Crop         │ Weather      │ Chat                │
│ Detection   │ Recommend    │ (OpenWeather)│ (Groq LLaMA 3.3)   │
│ (CNN)       │ (RandomForest│              │                     │
│             │              │              │                     │
├─────────────┴──────────────┤ Market Prices (data.gov.in live)   │
│     ML Models (TensorFlow  ├────────────────────────────────────┤
│     + scikit-learn)        │ User Profile (Supabase JWT)        │
└────────────────────────────┴────────────────────────────────────┘
```

## 🌟 Features

### 🏠 Home Page
- Modern hero section with compelling tagline
- Feature overview showcasing AI advisory, disease detection, weather monitoring, and market insights
- Responsive design with smooth animations
- Call-to-action buttons for easy navigation

### 📊 Farmer Dashboard
- Personalized greeting and summary cards
- Real-time weather information
- AI-powered crop recommendations with confidence scores
- Live market prices and top movers
- Important alerts and notifications
- Quick action buttons for common tasks

### 🌱 Crop Recommendation System
- Interactive form for soil nutrients (N, P, K), temperature, rainfall, humidity, and pH
- AI-powered crop suggestions (Random Forest model) with confidence percentages
- Top-5 crop alternatives with detailed cultivation tips
- Input validation with meaningful range checks

### 🔍 Disease Detection
- Drag-and-drop image upload interface
- MobileNetV2 CNN model identifying **39 plant diseases** across 14 crop species
- Detailed treatment recommendations, causes, and prevention measures
- Top-3 predictions with confidence scores
- File size and type validation

### 🌤️ Weather Monitoring
- Real-time weather data from OpenWeatherMap API
- 5-day / 3-hour forecast with agricultural insights
- Weather alerts and farming advisories
- Location-based weather information

### 💰 Market Prices
- **Live commodity prices** from India's data.gov.in Open Data Platform (Mandi prices)
- State and commodity filtering
- Min/max/modal price breakdown per market
- Graceful fallback to cached data when API is unavailable
- Data source indicator (Live / Cached)

### 🎤 Voice Assistant (AI Chat)
- Powered by **Groq API with LLaMA 3.3-70B** for fast inference
- Specialized agricultural system prompt for Indian farming context
- Speech-to-text and text-to-speech functionality
- Multi-language support with quick question templates
- Message length and history validation

### 👤 User Profile & Auth
- **Supabase Authentication** (email/password)
- User profile management (soil type, location, language preference)
- Activity history logging (disease detections, crop recommendations)
- Protected routes with JWT verification on both frontend and backend

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework (Create React App) |
| Tailwind CSS 3.3 | Styling |
| React Router DOM 6 | Client-side routing |
| Axios | HTTP client to backend API |
| Supabase JS | Authentication & database |
| i18next | Internationalization (EN/HI/MR) |
| Recharts | Dashboard charts |
| Lucide React | Icon system |
| React Dropzone | Image upload |

### Backend
| Technology | Purpose |
|-----------|---------|
| Flask 3.1 | REST API framework |
| Flask-CORS | Cross-origin requests |
| Flask-Limiter | Rate limiting (in-memory) |
| TensorFlow 2.16 | Plant disease CNN model |
| scikit-learn 1.6 | Crop recommendation model |
| Groq SDK | LLaMA 3.3-70B chat API |
| PyJWT | Supabase JWT verification |
| Pillow | Image preprocessing |
| Requests | External API calls |
| Pytest | Backend testing |

### External Services
| Service | Purpose |
|---------|---------|
| Supabase | Auth, user profiles, activity history |
| OpenWeatherMap API | Real-time weather data |
| data.gov.in API | Live mandi commodity prices |
| Groq API | LLM-powered agricultural chat |

### ML Models
| Model | Architecture | Size | Details |
|-------|-------------|------|---------|
| Plant Disease | MobileNetV2 (transfer learning) | 31 MB | 39 classes, 14 crop species |
| Crop Recommendation | Random Forest | 7 MB | 22 crops, 7 soil/weather features |

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher) + npm
- **Python** 3.9+ with pip
- **Supabase** account (free tier works)
- API keys for OpenWeatherMap, Groq, and data.gov.in

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv ../.venv
../.venv/Scripts/activate  # Windows
# source ../.venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Edit backend/.env with your actual API keys:
#   FLASK_SECRET_KEY=your-strong-random-key
#   OPENWEATHER_API_KEY=your-key
#   CROP_PRICE_API_KEY=your-data-gov-in-key
#   GROQ_API_KEY=your-groq-key
#   SUPABASE_JWT_SECRET=your-supabase-jwt-secret

# Start the server
python app.py
```

The backend runs at `http://localhost:5000`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
# Edit frontend/.env:
#   REACT_APP_SUPABASE_URL=your-supabase-url
#   REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
#   REACT_APP_API_URL=http://127.0.0.1:5000

# Start the development server
npm start
```

The frontend runs at `http://localhost:3000`.

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Create a `profiles` table:
   ```sql
   CREATE TABLE profiles (
     id UUID PRIMARY KEY REFERENCES auth.users(id),
     full_name TEXT,
     email TEXT,
     role TEXT DEFAULT 'farmer',
     soil_type TEXT,
     location TEXT,
     preferred_language TEXT DEFAULT 'en',
     phone TEXT,
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```
3. Create a `user_history` table:
   ```sql
   CREATE TABLE user_history (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id),
     type TEXT,
     title TEXT,
     result TEXT,
     confidence FLOAT,
     metadata JSONB,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```
4. Copy the **JWT Secret** from Settings → API into `backend/.env` as `SUPABASE_JWT_SECRET`

### Running Tests

```bash
cd backend
python -m pytest tests/ -v
```

## 🔒 Security

- **Rate Limiting**: 60 req/min default, 10/min for ML inference & chat, 30/min for crop recommendations
- **Supabase JWT Auth**: Backend verifies Supabase-issued JWTs — no custom auth system
- **Input Validation**: All endpoints validate inputs with meaningful error messages
- **File Validation**: Disease detection validates file type, size (max 10 MB), and content
- **CORS**: Restricted to `localhost:3000` origins
- **Environment Variables**: All API keys loaded from `.env` — never hardcoded

## 🌍 Multilingual Support

The platform supports multiple languages:
- English (en)
- Hindi (hi) - हिंदी
- Marathi (mr) - मराठी

Language switching is available through the header navigation.

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes and orientations

## 🔧 Customization

### Adding New Languages
1. Add translations to `src/i18n/config.js`
2. Update the language switcher component
3. Test all pages with the new language

### Extending Features
1. Create new page components in `src/pages/`
2. Add routes to `src/App.js`
3. Update navigation in `src/components/Layout/Sidebar.js`

### Styling Modifications
- Customize colors in `tailwind.config.js`
- Add new components in `src/components/`
- Modify existing styles in component files

## 🔮 Future Enhancements

- PWA support for offline access in rural areas
- IoT sensor integration for real-time soil monitoring
- Mobile app development (React Native)
- Advanced analytics and reporting dashboards
- Community features and forums
- Docker deployment setup
- CI/CD pipeline with GitHub Actions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `python -m pytest tests/ -v`
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

Built with ❤️ for the farming community