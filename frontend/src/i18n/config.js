import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      dashboard: 'Dashboard',
      cropRecommendation: 'Crop Recommendation',
      diseaseDetection: 'Disease Detection',
      weather: 'Weather',
      marketPrices: 'Market Prices',
      voiceAssistant: 'Voice Assistant',
      profile: 'Profile',
      logout: 'Logout',
      
      // Home Page
      heroTitle: 'Smart Agriculture Advisory Platform',
      heroSubtitle: 'Empowering farmers with AI-driven insights for better crop management and higher yields',
      getStarted: 'Get Started',
      learnMore: 'Learn More',
      
      // Features
      aiAdvisory: 'AI Advisory',
      aiAdvisoryDesc: 'Get personalized farming recommendations based on your soil and climate conditions',
      diseaseDetectionTitle: 'Disease Detection',
      diseaseDetectionDesc: 'Upload crop images to identify diseases and get treatment suggestions',
      weatherMonitoring: 'Weather Monitoring',
      weatherMonitoringDesc: 'Real-time weather updates and forecasts for your location',
      marketInsights: 'Market Insights',
      marketInsightsDesc: 'Stay updated with current crop prices and market trends',
      
      // Dashboard
      welcomeBack: 'Welcome back',
      todaysWeather: "Today's Weather",
      recommendedCrop: 'Recommended Crop',
      currentPrice: 'Current Price',
      alerts: 'Alerts',
      recentActivity: 'Recent Activity',
      quickActions: 'Quick Actions',
      
      // Forms
      soilType: 'Soil Type',
      temperature: 'Temperature (°C)',
      rainfall: 'Rainfall (mm)',
      humidity: 'Humidity (%)',
      nitrogen: 'Nitrogen (N)',
      phosphorus: 'Phosphorus (P)',
      potassium: 'Potassium (K)',
      phLevel: 'pH Level',
      getRecommendation: 'Get Recommendation',
      submit: 'Submit',
      reset: 'Reset',
      
      // Common
      confidence: 'Confidence',
      treatment: 'Treatment',
      uploadImage: 'Upload Image',
      dragDrop: 'Drag and drop an image here, or click to select',
      analyze: 'Analyze',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      noData: 'No data available',
      tryAgain: 'Try Again',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      filter: 'Filter',
      
      // Weather
      windSpeed: 'Wind Speed',
      pressure: 'Pressure',
      visibility: 'Visibility',
      cloudCover: 'Cloud Cover',
      feelsLike: 'Feels Like',
      forecast: '5-Day Forecast',
      enterCity: 'Enter city name',
      
      // Market
      crop: 'Crop',
      price: 'Price',
      change: 'Change',
      minPrice: 'Min Price',
      maxPrice: 'Max Price',
      modalPrice: 'Modal Price',
      market: 'Market',
      state: 'State',
      district: 'District',
      source: 'Source',
      liveData: 'Live Data',
      cachedData: 'Cached Data',
      
      // Voice
      startListening: 'Start Listening',
      stopListening: 'Stop Listening',
      speak: 'Speak',
      typeMessage: 'Type your message...',
      askQuestion: 'Ask a question about farming',
      suggestedQuestions: 'Suggested Questions',

      // Disease Detection
      diseaseResults: 'Detection Results',
      diseaseName: 'Disease',
      cause: 'Cause',
      solution: 'Solution',
      healthy: 'Healthy',
      topPredictions: 'Top Predictions',

      // Profile
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      location: 'Location',
      preferredLanguage: 'Preferred Language',
      updateProfile: 'Update Profile',
      activityHistory: 'Activity History',

      // Auth
      login: 'Login',
      register: 'Register',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      signUp: 'Sign Up',
      signIn: 'Sign In',
    }
  },
  hi: {
    translation: {
      // Navigation
      dashboard: 'डैशबोर्ड',
      cropRecommendation: 'फसल सिफारिश',
      diseaseDetection: 'रोग पहचान',
      weather: 'मौसम',
      marketPrices: 'बाजार मूल्य',
      voiceAssistant: 'आवाज सहायक',
      profile: 'प्रोफाइल',
      logout: 'लॉग आउट',
      
      // Home Page
      heroTitle: 'स्मार्ट कृषि सलाहकार मंच',
      heroSubtitle: 'बेहतर फसल प्रबंधन और उच्च उत्पादन के लिए AI-संचालित अंतर्दृष्टि के साथ किसानों को सशक्त बनाना',
      getStarted: 'शुरू करें',
      learnMore: 'और जानें',
      
      // Features
      aiAdvisory: 'AI सलाहकार',
      aiAdvisoryDesc: 'अपनी मिट्टी और जलवायु की स्थिति के आधार पर व्यक्तिगत खेती की सिफारिशें प्राप्त करें',
      diseaseDetectionTitle: 'रोग पहचान',
      diseaseDetectionDesc: 'रोगों की पहचान करने और उपचार सुझाव प्राप्त करने के लिए फसल की छवियां अपलोड करें',
      weatherMonitoring: 'मौसम निगरानी',
      weatherMonitoringDesc: 'आपके स्थान के लिए वास्तविक समय मौसम अपडेट और पूर्वानुमान',
      marketInsights: 'बाजार अंतर्दृष्टि',
      marketInsightsDesc: 'वर्तमान फसल की कीमतों और बाजार के रुझान के साथ अपडेट रहें',

      // Dashboard
      welcomeBack: 'वापस स्वागत है',
      todaysWeather: 'आज का मौसम',
      recommendedCrop: 'सिफारिश की गई फसल',
      currentPrice: 'वर्तमान मूल्य',
      alerts: 'अलर्ट',
      recentActivity: 'हालिया गतिविधि',
      quickActions: 'त्वरित कार्य',

      // Forms
      soilType: 'मिट्टी का प्रकार',
      temperature: 'तापमान (°C)',
      rainfall: 'वर्षा (मिमी)',
      humidity: 'आर्द्रता (%)',
      nitrogen: 'नाइट्रोजन (N)',
      phosphorus: 'फॉस्फोरस (P)',
      potassium: 'पोटेशियम (K)',
      phLevel: 'pH स्तर',
      getRecommendation: 'सिफारिश प्राप्त करें',
      submit: 'जमा करें',
      reset: 'रीसेट',

      // Common
      confidence: 'विश्वास स्तर',
      treatment: 'उपचार',
      uploadImage: 'छवि अपलोड करें',
      dragDrop: 'छवि यहां खींचें और छोड़ें, या चुनने के लिए क्लिक करें',
      analyze: 'विश्लेषण करें',
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      noData: 'कोई डेटा उपलब्ध नहीं',
      tryAgain: 'पुनः प्रयास करें',
      cancel: 'रद्द करें',
      save: 'सहेजें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      search: 'खोजें',
      filter: 'फ़िल्टर',

      // Weather
      windSpeed: 'हवा की गति',
      pressure: 'दबाव',
      visibility: 'दृश्यता',
      cloudCover: 'बादल',
      feelsLike: 'अनुभव तापमान',
      forecast: '5-दिवसीय पूर्वानुमान',
      enterCity: 'शहर का नाम दर्ज करें',

      // Market
      crop: 'फसल',
      price: 'मूल्य',
      change: 'बदलाव',
      minPrice: 'न्यूनतम मूल्य',
      maxPrice: 'अधिकतम मूल्य',
      modalPrice: 'औसत मूल्य',
      market: 'बाजार',
      state: 'राज्य',
      district: 'जिला',
      source: 'स्रोत',
      liveData: 'लाइव डेटा',
      cachedData: 'कैश्ड डेटा',

      // Voice
      startListening: 'सुनना शुरू करें',
      stopListening: 'सुनना बंद करें',
      speak: 'बोलें',
      typeMessage: 'अपना संदेश लिखें...',
      askQuestion: 'खेती के बारे में सवाल पूछें',
      suggestedQuestions: 'सुझाए गए प्रश्न',

      // Disease Detection
      diseaseResults: 'पहचान परिणाम',
      diseaseName: 'रोग',
      cause: 'कारण',
      solution: 'समाधान',
      healthy: 'स्वस्थ',
      topPredictions: 'शीर्ष पूर्वानुमान',

      // Profile
      fullName: 'पूरा नाम',
      email: 'ईमेल',
      phone: 'फोन',
      location: 'स्थान',
      preferredLanguage: 'पसंदीदा भाषा',
      updateProfile: 'प्रोफाइल अपडेट करें',
      activityHistory: 'गतिविधि इतिहास',

      // Auth
      login: 'लॉगिन',
      register: 'पंजीकरण',
      password: 'पासवर्ड',
      confirmPassword: 'पासवर्ड की पुष्टि करें',
      forgotPassword: 'पासवर्ड भूल गए?',
      noAccount: 'खाता नहीं है?',
      hasAccount: 'पहले से खाता है?',
      signUp: 'साइन अप',
      signIn: 'साइन इन',
    }
  },
  mr: {
    translation: {
      // Navigation
      dashboard: 'डॅशबोर्ड',
      cropRecommendation: 'पीक शिफारस',
      diseaseDetection: 'रोग ओळख',
      weather: 'हवामान',
      marketPrices: 'बाजार किंमती',
      voiceAssistant: 'आवाज सहाय्यक',
      profile: 'प्रोफाइल',
      logout: 'लॉग आउट',
      
      // Home Page
      heroTitle: 'स्मार्ट कृषी सल्लागार व्यासपीठ',
      heroSubtitle: 'चांगल्या पीक व्यवस्थापन आणि उच्च उत्पादनासाठी AI-चालित अंतर्दृष्टीसह शेतकऱ्यांना सक्षम करणे',
      getStarted: 'सुरुवात करा',
      learnMore: 'अधिक जाणून घ्या',

      // Features
      aiAdvisory: 'AI सल्लागार',
      aiAdvisoryDesc: 'तुमच्या मातीच्या आणि हवामानाच्या परिस्थितीनुसार वैयक्तिक शेतीच्या शिफारसी मिळवा',
      diseaseDetectionTitle: 'रोग ओळख',
      diseaseDetectionDesc: 'रोग ओळखण्यासाठी आणि उपचार सूचना मिळवण्यासाठी पिकांच्या छवी अपलोड करा',
      weatherMonitoring: 'हवामान निरीक्षण',
      weatherMonitoringDesc: 'तुमच्या स्थानासाठी वास्तविक वेळेत हवामान अद्यतने आणि अंदाज',
      marketInsights: 'बाजार अंतर्दृष्टी',
      marketInsightsDesc: 'सध्याच्या पिकांच्या किंमतींसह आणि बाजारातील कलांसह अपडेट रहा',

      // Dashboard
      welcomeBack: 'पुन्हा स्वागत',
      todaysWeather: 'आजचे हवामान',
      recommendedCrop: 'शिफारस केलेले पीक',
      currentPrice: 'सध्याची किंमत',
      alerts: 'सूचना',
      recentActivity: 'अलीकडील क्रियाकलाप',
      quickActions: 'जलद कृती',

      // Forms
      soilType: 'मातीचा प्रकार',
      temperature: 'तापमान (°C)',
      rainfall: 'पाऊस (मिमी)',
      humidity: 'आर्द्रता (%)',
      nitrogen: 'नायट्रोजन (N)',
      phosphorus: 'फॉस्फरस (P)',
      potassium: 'पोटॅशियम (K)',
      phLevel: 'pH पातळी',
      getRecommendation: 'शिफारस मिळवा',
      submit: 'सबमिट करा',
      reset: 'रीसेट',

      // Common
      confidence: 'विश्वास पातळी',
      treatment: 'उपचार',
      uploadImage: 'छवी अपलोड करा',
      dragDrop: 'छवी इथे ड्रॅग करा किंवा निवडण्यासाठी क्लिक करा',
      analyze: 'विश्लेषण करा',
      loading: 'लोड होत आहे...',
      error: 'त्रुटी',
      success: 'यश',
      noData: 'डेटा उपलब्ध नाही',
      tryAgain: 'पुन्हा प्रयत्न करा',
      cancel: 'रद्द करा',
      save: 'जतन करा',
      delete: 'हटवा',
      edit: 'संपादित करा',
      search: 'शोधा',
      filter: 'फिल्टर',

      // Weather
      windSpeed: 'वाऱ्याचा वेग',
      pressure: 'दाब',
      visibility: 'दृश्यमानता',
      cloudCover: 'ढगाळपणा',
      feelsLike: 'जाणवणारे तापमान',
      forecast: '5-दिवसीय अंदाज',
      enterCity: 'शहराचे नाव प्रविष्ट करा',

      // Market
      crop: 'पीक',
      price: 'किंमत',
      change: 'बदल',
      minPrice: 'किमान किंमत',
      maxPrice: 'कमाल किंमत',
      modalPrice: 'सरासरी किंमत',
      market: 'बाजार',
      state: 'राज्य',
      district: 'जिल्हा',
      source: 'स्रोत',
      liveData: 'लाइव्ह डेटा',
      cachedData: 'कॅश्ड डेटा',

      // Voice
      startListening: 'ऐकणे सुरू करा',
      stopListening: 'ऐकणे थांबवा',
      speak: 'बोला',
      typeMessage: 'तुमचा संदेश लिहा...',
      askQuestion: 'शेतीबद्दल प्रश्न विचारा',
      suggestedQuestions: 'सुचवलेले प्रश्न',

      // Disease Detection
      diseaseResults: 'ओळख परिणाम',
      diseaseName: 'रोग',
      cause: 'कारण',
      solution: 'उपाय',
      healthy: 'निरोगी',
      topPredictions: 'शीर्ष अंदाज',

      // Profile
      fullName: 'पूर्ण नाव',
      email: 'ईमेल',
      phone: 'फोन',
      location: 'ठिकाण',
      preferredLanguage: 'पसंतीची भाषा',
      updateProfile: 'प्रोफाइल अपडेट करा',
      activityHistory: 'क्रियाकलाप इतिहास',

      // Auth
      login: 'लॉगिन',
      register: 'नोंदणी',
      password: 'पासवर्ड',
      confirmPassword: 'पासवर्डची पुष्टी करा',
      forgotPassword: 'पासवर्ड विसरलात?',
      noAccount: 'खाते नाही?',
      hasAccount: 'आधीच खाते आहे?',
      signUp: 'साइन अप',
      signIn: 'साइन इन',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;