// Language Learning App - React Implementation

// Import necessary React libraries
import React, { useState, useEffect, createContext, useContext } from 'react';

// Create a context for our app state
const AppContext = createContext();

// Main App component
function App() {
  // Set up our main app state
  const [user, setUser] = useState(null);
  const [languages, setLanguages] = useState([
    'Spanish', 'French', 'German', 'Italian', 'Japanese', 'Mandarin', 'Korean'
  ]);
  const [lessons, setLessons] = useState({});
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [currentLanguage, setCurrentLanguage] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Initialize our app when it first loads
  useEffect(() => {
    // Load languages and generate lessons
    const generatedLessons = generateLessonsForAllLanguages(languages);
    setLessons(generatedLessons);
    
    // Check for saved user data
    const savedUser = localStorage.getItem('languageAppUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      updateUserStreak(userData);
      
      // If they have a selected language, show that dashboard
      if (userData.selectedLanguage) {
        setCurrentLanguage(userData.selectedLanguage);
        setCurrentScreen('languageDashboard');
      }
    }
  }, []);

  // Save user data whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('languageAppUser', JSON.stringify(user));
    }
  }, [user]);

  // Function to register a new user
  const registerUser = (username, password, email) => {
    const newUser = {
      username,
      email,
      selectedLanguage: null,
      progress: {},
      streak: 0,
      lastLogin: new Date(),
      settings: {
        dailyGoal: 10, // minutes
        notifications: true,
        darkMode: false
      }
    };
    
    setUser(newUser);
    addNotification(`Welcome, ${username}!`);
    setCurrentScreen('languageSelection');
  };

  // Function to login an existing user
  const loginUser = (username, password) => {
    // In a real app, this would validate against stored credentials
    // For this demo, we'll assume the login is successful if we have a user
    if (user && user.username === username) {
      // Update streak
      updateUserStreak(user);
      
      addNotification(`Welcome back, ${username}!`);
      
      // If they already selected a language, go to that dashboard
      if (user.selectedLanguage) {
        setCurrentLanguage(user.selectedLanguage);
        setCurrentScreen('languageDashboard');
      } else {
        setCurrentScreen('languageSelection');
      }
      
      return true;
    }
    
    addNotification('Login failed. User not found or incorrect password.', 'error');
    return false;
  };

  // Function to select a language
  const selectLanguage = (language) => {
    if (!languages.includes(language)) {
      addNotification(`Language ${language} not available`, 'error');
      return false;
    }
    
    setCurrentLanguage(language);
    
    // Initialize progress for this language if it doesn't exist
    const updatedUser = { ...user };
    updatedUser.selectedLanguage = language;
    
    if (!updatedUser.progress[language]) {
      updatedUser.progress[language] = {
        level: 1,
        xp: 0,
        completedLessons: [],
        vocabulary: []
      };
    }
    
    setUser(updatedUser);
    setCurrentScreen('languageDashboard');
    addNotification(`You've selected ${language}!`);
    return true;
  };

  // Function to start a lesson
  const startLesson = (category, lessonId) => {
    const categoryLessons = lessons[currentLanguage][category];
    const lesson = categoryLessons.find(l => l.id === lessonId);
    
    if (!lesson) {
      addNotification('Lesson not found', 'error');
      return;
    }
    
    setCurrentLesson(lesson);
    setCurrentExercise(lesson.exercises[0]);
    setCurrentScreen('lesson');
    addNotification(`Starting lesson: ${lesson.title}`);
  };

  // Function to complete an exercise
  const completeExercise = (exerciseId, isCorrect) => {
    // Find current exercise index
    const exerciseIndex = currentLesson.exercises.findIndex(ex => ex.id === exerciseId);
    if (exerciseIndex === -1) return;
    
    // Mark exercise as completed
    const updatedLessons = { ...lessons };
    const lesson = updatedLessons[currentLanguage][currentLesson.category].find(
      l => l.id === currentLesson.id
    );
    
    lesson.exercises[exerciseIndex].completed = true;
    
    // Update user XP
    const updatedUser = { ...user };
    if (isCorrect) {
      const xpGained = 10;
      updatedUser.progress[currentLanguage].xp += xpGained;
      addNotification(`Correct! +${xpGained}XP`, 'success');
    } else {
      addNotification('Not quite right. Try again!', 'warning');
    }
    
    setUser(updatedUser);
    setLessons(updatedLessons);
    
    // Check if all exercises in the lesson are completed
    const allCompleted = lesson.exercises.every(ex => ex.completed);
    if (allCompleted) {
      completeLesson(currentLesson.id);
    }
    
    // Move to next exercise or complete lesson
    if (exerciseIndex < currentLesson.exercises.length - 1) {
      setCurrentExercise(currentLesson.exercises[exerciseIndex + 1]);
    } else {
      // This was the last exercise
      setCurrentScreen('lessonComplete');
    }
  };

  // Function to complete a lesson
  const completeLesson = (lessonId) => {
    // Mark lesson as completed
    const updatedLessons = { ...lessons };
    const category = currentLesson.category;
    const lesson = updatedLessons[currentLanguage][category].find(l => l.id === lessonId);
    lesson.completed = true;
    
    // Update user progress
    const updatedUser = { ...user };
    const completedLessons = updatedUser.progress[currentLanguage].completedLessons;
    
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
      
      // Award bonus XP
      const bonusXp = 50;
      updatedUser.progress[currentLanguage].xp += bonusXp;
      
      addNotification(`Lesson completed! +${bonusXp}XP bonus`, 'success');
      
      // Check for level up
      checkForLevelUp(updatedUser);
    }
    
    setUser(updatedUser);
    setLessons(updatedLessons);
  };

  // Function to check for level up
  const checkForLevelUp = (updatedUser) => {
    const progress = updatedUser.progress[currentLanguage];
    const currentXp = progress.xp;
    const currentLevel = progress.level;
    
    // XP required for next level
    const requiredXp = 100 * currentLevel;
    
    if (currentXp >= requiredXp) {
      progress.level += 1;
      addNotification(`Level Up! You are now level ${progress.level}`, 'success');
      // In a real app, show a congratulatory animation or message
    }
  };

  // Function to update user streak
  const updateUserStreak = (userData) => {
    const updatedUser = { ...userData };
    const today = new Date();
    const lastLogin = new Date(updatedUser.lastLogin);
    
    // Check if last login was yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (
      lastLogin.getDate() === yesterday.getDate() &&
      lastLogin.getMonth() === yesterday.getMonth() &&
      lastLogin.getFullYear() === yesterday.getFullYear()
    ) {
      updatedUser.streak += 1;
      addNotification(`You're on a ${updatedUser.streak} day streak!`, 'success');
    } else if (
      lastLogin.getDate() !== today.getDate() ||
      lastLogin.getMonth() !== today.getMonth() ||
      lastLogin.getFullYear() !== today.getFullYear()
    ) {
      // If last login was before yesterday, reset streak
      if (
        lastLogin.getDate() !== yesterday.getDate() ||
        lastLogin.getMonth() !== yesterday.getMonth() ||
        lastLogin.getFullYear() !== yesterday.getFullYear()
      ) {
        updatedUser.streak = 1;
        addNotification('New day, new streak!', 'info');
      }
    }
    
    updatedUser.lastLogin = today;
    setUser(updatedUser);
  };

  // Function to add a vocabulary word
  const addVocabularyWord = (word, translation, context) => {
    const updatedUser = { ...user };
    const vocabulary = updatedUser.progress[currentLanguage].vocabulary;
    
    vocabulary.push({
      word,
      translation,
      context,
      dateAdded: new Date(),
      reviewDates: [],
      masteryLevel: 0 // 0-5 scale for spaced repetition
    });
    
    setUser(updatedUser);
    addNotification(`"${word}" added to vocabulary`, 'success');
  };

  // Function to add a notification
  const addNotification = (message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      message,
      type
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  // Helper function to generate lessons for all languages
  const generateLessonsForAllLanguages = (languageList) => {
    const allLessons = {};
    
    languageList.forEach(language => {
      allLessons[language] = generateLessonsForLanguage(language);
    });
    
    return allLessons;
  };

  // Function to generate lessons for a language
  const generateLessonsForLanguage = (language) => {
    const categories = ['Basics', 'Greetings', 'Numbers', 'Food', 'Travel', 'Conversation'];
    const languageLessons = {};
    
    categories.forEach(category => {
      languageLessons[category] = generateLessonsForCategory(language, category);
    });
    
    return languageLessons;
  };

  // Function to generate lessons for a category
  const generateLessonsForCategory = (language, category) => {
    const lessonCount = 5;
    const lessonArray = [];
    
    for (let i = 1; i <= lessonCount; i++) {
      lessonArray.push({
        id: `${language}-${category}-${i}`,
        title: `${category} ${i}`,
        category: category,
        difficulty: i <= 2 ? 'Beginner' : i <= 4 ? 'Intermediate' : 'Advanced',
        exercises: generateExercises(language, category, i),
        completed: false
      });
    }
    
    return lessonArray;
  };

  // Function to generate exercises for a lesson
  const generateExercises = (language, category, lessonNum) => {
    const exerciseTypes = ['MultipleChoice', 'Translation', 'Listening', 'Speaking', 'Matching'];
    const exerciseCount = 5; // Reduced for demo
    const exercises = [];
    
    for (let i = 1; i <= exerciseCount; i++) {
      const type = exerciseTypes[(i - 1) % exerciseTypes.length]; // Ensures variety
      exercises.push({
        id: `${language}-${category}-${lessonNum}-ex-${i}`,
        type,
        prompt: `Exercise ${i} for ${category} lesson ${lessonNum}`,
        completed: false,
        // This would contain actual exercise content in a real app
        options: type === 'MultipleChoice' ? generateMultipleChoiceOptions(language, i) : null,
        correctAnswer: type === 'MultipleChoice' ? 0 : type === 'Translation' ? 'Sample answer' : null
      });
    }
    
    return exercises;
  };

  // Generate options for multiple choice questions
  const generateMultipleChoiceOptions = (language, seed) => {
    // This would be real content in a production app
    return [
      'Correct option',
      'Wrong option 1',
      'Wrong option 2',
      'Wrong option 3'
    ];
  };

  // Provide our state and functions to all components
  const contextValue = {
    user,
    languages,
    lessons,
    currentLanguage,
    currentLesson,
    currentExercise,
    notifications,
    registerUser,
    loginUser,
    selectLanguage,
    startLesson,
    completeExercise,
    addVocabularyWord,
    setCurrentScreen
  };

  // Render the appropriate screen based on currentScreen state
  return (
    <AppContext.Provider value={contextValue}>
      <div className="app-container">
        <Header />
        <NotificationArea notifications={notifications} />
        <main>
          {currentScreen === 'welcome' && <WelcomeScreen />}
          {currentScreen === 'login' && <LoginScreen />}
          {currentScreen === 'register' && <RegisterScreen />}
          {currentScreen === 'languageSelection' && <LanguageSelectionScreen />}
          {currentScreen === 'languageDashboard' && <LanguageDashboard />}
          {currentScreen === 'lesson' && <LessonScreen />}
          {currentScreen === 'lessonComplete' && <LessonCompleteScreen />}
          {currentScreen === 'vocabulary' && <VocabularyScreen />}
          {currentScreen === 'profile' && <ProfileScreen />}
        </main>
        <Footer />
      </div>
    </AppContext.Provider>
  );
}

// Header component
function Header() {
  const { user, currentLanguage, setCurrentScreen } = useContext(AppContext);
  
  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => setCurrentScreen('welcome')}>
          LinguaLearn
        </h1>
        
        {user && (
          <div className="flex items-center space-x-4">
            {currentLanguage && (
              <button 
                className="bg-blue-500 px-3 py-1 rounded"
                onClick={() => setCurrentScreen('languageDashboard')}
              >
                {currentLanguage}
              </button>
            )}
            
            <div className="flex items-center space-x-2">
              <span>🔥 {user.streak}</span>
              <span>⭐ {currentLanguage && user.progress[currentLanguage]?.xp || 0}</span>
            </div>
            
            <button 
              className="bg-blue-500 p-2 rounded-full"
              onClick={() => setCurrentScreen('profile')}
            >
              {user.username.charAt(0).toUpperCase()}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// Footer component
function Footer() {
  return (
    <footer className="bg-gray-100 p-4 mt-auto">
      <div className="container mx-auto text-center text-gray-600">
        <p>© 2025 LinguaLearn - Learn languages the fun way!</p>
      </div>
    </footer>
  );
}

// Notification area component
function NotificationArea({ notifications }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className={`p-3 rounded shadow-md ${
            notification.type === 'error' ? 'bg-red-500 text-white' :
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
}

// Welcome Screen component
function WelcomeScreen() {
  const { setCurrentScreen } = useContext(AppContext);
  
  return (
    <div className="container mx-auto py-8 text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to LinguaLearn</h1>
      <p className="text-xl mb-8">Start your language learning journey today!</p>
      
      <div className="flex justify-center space-x-4">
        <button 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg"
          onClick={() => setCurrentScreen('login')}
        >
          Login
        </button>
        <button 
          className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg"
          onClick={() => setCurrentScreen('register')}
        >
          Sign Up
        </button>
      </div>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-2">Learn 7 Languages</h3>
          <p>Spanish, French, German, Italian, Japanese, Mandarin, and Korean</p>
        </div>
        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-2">Interactive Exercises</h3>
          <p>Multiple choice, translation, listening, speaking, and matching</p>
        </div>
        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-2">Track Your Progress</h3>
          <p>XP system, streaks, and vocabulary management</p>
        </div>
      </div>
    </div>
  );
}

// Login Screen component
function LoginScreen() {
  const { loginUser, setCurrentScreen } = useContext(AppContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      loginUser(username, password);
    }
  };
  
  return (
    <div className="container mx-auto py-8 max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            className="w-full p-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button 
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          Login
        </button>
        
        <p className="mt-4 text-center">
          Don't have an account?{' '}
          <span 
            className="text-blue-600 cursor-pointer"
            onClick={() => setCurrentScreen('register')}
          >
            Sign up
          </span>
        </p>
      </form>
    </div>
  );
}

// Register Screen component
function RegisterScreen() {
  const { registerUser, setCurrentScreen } = useContext(AppContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    
    if (username && email && password) {
      registerUser(username, password, email);
    }
  };
  
  return (
    <div className="container mx-auto py-8 max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            className="w-full p-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            className="w-full p-2 border rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        <button 
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg"
        >
          Sign Up
        </button>
        
        <p className="mt-4 text-center">
          Already have an account?{' '}
          <span 
            className="text-blue-600 cursor-pointer"
            onClick={() => setCurrentScreen('login')}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

// Language Selection Screen component
function LanguageSelectionScreen() {
  const { languages, selectLanguage } = useContext(AppContext);
  
  // Sample flag emoji codes for languages
  const languageFlags = {
    'Spanish': '🇪🇸',
    'French': '🇫🇷',
    'German': '🇩🇪',
    'Italian': '🇮🇹',
    'Japanese': '🇯🇵',
    'Mandarin': '🇨🇳',
    'Korean': '🇰🇷'
  };
  
  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Choose a Language</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {languages.map(language => (
          <div 
            key={language}
            className="bg-white p-6 rounded-lg shadow-md text-center cursor-pointer hover:shadow-lg transition"
            onClick={() => selectLanguage(language)}
          >
            <div className="text-4xl mb-2">{languageFlags[language]}</div>
            <h3 className="text-xl font-bold">{language}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

// Language Dashboard component
function LanguageDashboard() {
  const { 
    user, 
    currentLanguage, 
    lessons, 
    startLesson, 
    setCurrentScreen 
  } = useContext(AppContext);
  
  // Get user progress for current language
  const progress = user.progress[currentLanguage];
  
  // Get categories
  const categories = Object.keys(lessons[currentLanguage]);
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">{currentLanguage}</h2>
        <div className="flex justify-center items-center space-x-6">
          <div>
            <p className="text-gray-600">Level</p>
            <p className="text-2xl font-bold">{progress.level}</p>
          </div>
          <div>
            <p className="text-gray-600">XP</p>
            <p className="text-2xl font-bold">{progress.xp}</p>
          </div>
          <div>
            <p className="text-gray-600">Streak</p>
            <p className="text-2xl font-bold">{user.streak} 🔥</p>
          </div>
        </div>
        
        <div className="mt-4 flex justify-center space-x-4">
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => setCurrentScreen('vocabulary')}
          >
            My Vocabulary
          </button>
          <button 
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => setCurrentScreen('profile')}
          >
            Settings
          </button>
        </div>
      </div>
      
      {categories.map(category => (
        <div key={category} className="mb-10">
          <h3 className="text-2xl font-bold mb-4">{category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {lessons[currentLanguage][category].map(lesson => {
              const isCompleted = progress.completedLessons.includes(lesson.id);
              return (
                <div 
                  key={lesson.id}
                  className={`p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition ${
                    isCompleted ? 'bg-green-100' : 'bg-white'
                  }`}
                  onClick={() => startLesson(category, lesson.id)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold">{lesson.title}</h4>
                    {isCompleted && <span className="text-green-600">✓</span>}
                  </div>
                  <p className="text-sm text-gray-600">{lesson.difficulty}</p>
                  <p className="text-sm mt-2">{lesson.exercises.length} exercises</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Lesson Screen component
function LessonScreen() {
  const { currentLesson, currentExercise, completeExercise } = useContext(AppContext);
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Determine if answer is correct based on exercise type
    let isCorrect = false;
    
    if (currentExercise.type === 'MultipleChoice') {
      isCorrect = selectedOption === currentExercise.correctAnswer;
      completeExercise(currentExercise.id, isCorrect);
      setSelectedOption(null);
    } else if (currentExercise.type === 'Translation') {
      // Simple string comparison (a real app would use more sophisticated matching)
      isCorrect = answer.toLowerCase() === currentExercise.correctAnswer.toLowerCase();
      completeExercise(currentExercise.id, isCorrect);
      setAnswer('');
    } else {
      // For other exercise types, just mark as correct for demo
      completeExercise(currentExercise.id, true);
    }
  };
  
  // Render different exercise types
  const renderExerciseContent = () => {
    switch (currentExercise.type) {
      case 'MultipleChoice':
        return (
          <div className="space-y-4">
            {currentExercise.options.map((option, index) => (
              <div 
                key={index}
                className={`p-3 border rounded cursor-pointer ${
                  selectedOption === index ? 'bg-blue-100 border-blue-500' : 'bg-white'
                }`}
                onClick={() => setSelectedOption(index)}
              >
                {option}
              </div>
            ))}
          </div>
        );
        
      case 'Translation':
        return (
          <div>
            <input
              type="text"
              className="w-full p-3 border rounded mb-4"
              placeholder="Type your translation here"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>
        );
        
      case 'Listening':
        return (
          <div className="text-center">
            <button className="bg-blue-500 text-white p-3 rounded-full mb-4">
              🔊 Play Audio
            </button>
            <p className="text-gray-600 mb-4">Listen and type what you hear</p>
            <input
              type="text"