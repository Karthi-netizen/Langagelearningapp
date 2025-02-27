import { useState } from "react";
import "./App.css";

export default function App() {
  const languages = ["Spanish", "French", "German", "Japanese", "Chinese"];
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const lessons = {
    Spanish: "Hola! Bienvenido a la lección de español.",
    French: "Bonjour! Bienvenue à la leçon de français.",
    German: "Hallo! Willkommen zur Deutschstunde.",
    Japanese: "こんにちは！日本語のレッスンへようこそ。",
    Chinese: "你好！欢迎来到中文课程。"
  };

  const speakLesson = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="container">
      <h1 className="title">Language Learning Hub</h1>
      <div className="button-group">
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => {
              setSelectedLanguage(lang);
              speakLesson(lessons[lang]);
            }}
            className="language-button"
          >
            {lang}
          </button>
        ))}
      </div>
      {selectedLanguage && (
        <div className="lesson-box">
          <h2 className="lesson-title">{selectedLanguage} Lesson</h2>
          <p className="lesson-content">{lessons[selectedLanguage]}</p>
          <button className="speak-button" onClick={() => speakLesson(lessons[selectedLanguage])}>🔊 Listen</button>
        </div>
      )}
    </div>
  );
}

/* CSS Code Inside the Same File */
const styles = `
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background-color: #f0f8ff;
    min-height: 100vh;
  }
  .title {
    font-size: 2rem;
    color: #333;
    margin-bottom: 20px;
  }
  .button-group {
    display: flex;
    gap: 10px;
  }
  .language-button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    transition: 0.3s;
  }
  .language-button:hover {
    background-color: #0056b3;
  }
  .lesson-box {
    margin-top: 20px;
    padding: 15px;
    background-color: white;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    text-align: center;
    width: 50%;
  }
  .lesson-title {
    font-size: 1.5rem;
    color: #007bff;
  }
  .lesson-content {
    color: #333;
    margin-top: 10px;
  }
  .speak-button {
    margin-top: 10px;
    background-color: #28a745;
    color: white;
    border: none;
    padding: 8px 16px;
    cursor: pointer;
    border-radius: 5px;
  }
  .speak-button:hover {
    background-color: #218838;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);