import React, { useState, useEffect, useRef } from 'react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface OutputCardProps {
  content: string | QuizQuestion[];
  feature: 'simplify' | 'summary' | 'important_points' | 'quiz';
  language?: 'en' | 'hi' | 'kn';
}

// Simple custom markdown-like renderer to avoid extra dependencies and maintain absolute visual control
const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let inList = false;

  const parseBoldText = (txt: string) => {
    // Regex to match **text**
    const parts = txt.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((part, index) => {
      // Odd indexes are the matched bold groups
      if (index % 2 === 1) {
        return <strong key={index}>{part}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();

    // Headers
    if (trimmedLine.startsWith('### ')) {
      if (inList) {
        renderedElements.push(<ul key={`list-${lineIndex}`}>{currentList}</ul>);
        currentList = [];
        inList = false;
      }
      renderedElements.push(
        <h3 key={`h3-${lineIndex}`}>{parseBoldText(trimmedLine.substring(4))}</h3>
      );
    } else if (trimmedLine.startsWith('## ')) {
      if (inList) {
        renderedElements.push(<ul key={`list-${lineIndex}`}>{currentList}</ul>);
        currentList = [];
        inList = false;
      }
      renderedElements.push(
        <h2 key={`h2-${lineIndex}`}>{parseBoldText(trimmedLine.substring(3))}</h2>
      );
    } else if (trimmedLine.startsWith('# ')) {
      if (inList) {
        renderedElements.push(<ul key={`list-${lineIndex}`}>{currentList}</ul>);
        currentList = [];
        inList = false;
      }
      renderedElements.push(
        <h1 key={`h1-${lineIndex}`}>{parseBoldText(trimmedLine.substring(2))}</h1>
      );
    }
    // Lists
    else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
      inList = true;
      currentList.push(
        <li key={`li-${lineIndex}`}>
          {parseBoldText(trimmedLine.substring(2))}
        </li>
      );
    }
    // Empty lines
    else if (trimmedLine === '') {
      if (inList) {
        renderedElements.push(<ul key={`list-${lineIndex}`}>{currentList}</ul>);
        currentList = [];
        inList = false;
      }
    }
    // Regular Paragraphs
    else {
      if (inList) {
        renderedElements.push(<ul key={`list-${lineIndex}`}>{currentList}</ul>);
        currentList = [];
        inList = false;
      }
      renderedElements.push(
        <p key={`p-${lineIndex}`}>{parseBoldText(trimmedLine)}</p>
      );
    }
  });

  // Flush remaining list items
  if (inList && currentList.length > 0) {
    renderedElements.push(<ul key="list-final">{currentList}</ul>);
  }

  return <div className="output-rendered-content accessible-content">{renderedElements}</div>;
};

const outputCardTranslations = {
  en: {
    simplify: 'Simplified Learning Material',
    summary: 'Study Summary Notes',
    important_points: 'Key Concepts & Definitions',
    quiz: 'Interactive Learning Quiz',
    listen: '🔊 Listen',
    pause: '⏸️ Pause',
    resume: '▶️ Resume',
    stop: '⏹️ Stop',
    copy: '📋 Copy',
    copied: '✅ Copied!',
    exportAudio: '💾 Export Audio Script',
    question: 'Question',
    of: 'of',
    correctAnswer: 'Correct Answer',
    yourChoice: 'Your Choice',
    quizCompleted: '🎉 Quiz Completed!',
    scoredPrefix: 'You scored ',
    scoredSuffix: ' out of ',
    perfect: 'Excellent job! Perfect score!',
    great: 'Great understanding of the content!',
    goodTry: 'Good effort! Review the material and try again.',
    retake: '🔄 Retake Quiz',
    ttsResumeTitle: 'Resume listening',
    ttsPauseTitle: 'Pause listening',
    ttsReadAloud: 'Read aloud',
    ttsStopTitle: 'Stop listening',
    ttsExportTitle: 'Download speech-ready plain text script',
  },
  hi: {
    simplify: 'सरलीकृत शिक्षण सामग्री',
    summary: 'अध्ययन सारांश नोट्स',
    important_points: 'प्रमुख अवधारणाएं और परिभाषाएं',
    quiz: 'इंटरैक्टिव लर्निंग प्रश्नोत्तरी',
    listen: '🔊 सुनें',
    pause: '⏸️ रोकें',
    resume: '▶️ फिर शुरू करें',
    stop: '⏹️ बंद करें',
    copy: '📋 कॉपी करें',
    copied: '✅ कॉपी हो गया!',
    exportAudio: '💾 ऑडियो स्क्रिप्ट निर्यात करें',
    question: 'प्रश्न',
    of: 'का',
    correctAnswer: 'सही उत्तर',
    yourChoice: 'आपका विकल्प',
    quizCompleted: '🎉 प्रश्नोत्तरी पूरी हुई!',
    scoredPrefix: 'आपने ',
    scoredSuffix: ' में से ',
    perfect: 'उत्कृष्ट कार्य! उत्तम स्कोर!',
    great: 'सामग्री की बहुत अच्छी समझ!',
    goodTry: 'अच्छा प्रयास! सामग्री की समीक्षा करें और पुनः प्रयास करें।',
    retake: '🔄 प्रश्नोत्तरी पुनः दें',
    ttsResumeTitle: 'सुनना फिर शुरू करें',
    ttsPauseTitle: 'सुनना रोकें',
    ttsReadAloud: 'ज़ोर से पढ़ें',
    ttsStopTitle: 'सुनना बंद करें',
    ttsExportTitle: 'भाषण-तैयार सादे पाठ की स्क्रिप्ट डाउनलोड करें',
  },
  kn: {
    simplify: 'ಸರಳಗೊಳಿಸಿದ ಕಲಿಕಾ ಸಾಮಗ್ರಿ',
    summary: 'ಅಧ್ಯಯನ ಸಾರಾಂಶ ಟಿಪ್ಪಣಿಗಳು',
    important_points: 'ಪ್ರಮುಖ ಪರಿಕಲ್ಪನೆಗಳು ಮತ್ತು ವ್ಯಾಖ್ಯಾನಗಳು',
    quiz: 'ಸಂವಾದಾತ್ಮಕ ಕಲಿಕಾ ರಸಪ್ರಶ್ನೆ',
    listen: '🔊 ಆಲಿಸಿ',
    pause: '⏸️ ವಿರಾಮಗೊಳಿಸಿ',
    resume: '▶️ ಮುಂದುವರಿಸಿ',
    stop: '⏹️ ನಿಲ್ಲಿಸಿ',
    copy: '📋 ನಕಲಿಸಿ',
    copied: '✅ ನಕಲಿಸಲಾಗಿದೆ!',
    exportAudio: '💾 ಆಡಿಯೋ ಸ್ಕ್ರಿಪ್ಟ್ ರಫ್ತುಮಾಡಿ',
    question: 'ಪ್ರಶ್ನೆ',
    of: 'ರಲ್ಲಿ',
    correctAnswer: 'ಸರಿಯಾದ ಉತ್ತರ',
    yourChoice: 'ನಿಮ್ಮ ಆಯ್ಕೆ',
    quizCompleted: '🎉 ರಸಪ್ರಶ್ನೆ ಪೂರ್ಣಗೊಂಡಿದೆ!',
    scoredPrefix: 'ನೀವು ',
    scoredSuffix: ' ರಲ್ಲಿ ',
    perfect: 'ಅತ್ಯುತ್ತಮ ಕೆಲಸ! ಪರಿಪೂರ್ಣ ಸ್ಕೋರ್!',
    great: 'ವಿಷಯದ ಉತ್ತಮ ತಿಳುವಳಿಕೆ!',
    goodTry: 'ಉತ್ತม ಪ್ರಯತ್ನ! ವಿಷಯವನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    retake: '🔄 ರಸಪ್ರಶ್ನೆ ಮತ್ತೆ ತೆಗೆದುಕೊಳ್ಳಿ',
    ttsResumeTitle: 'ಆಲಿಸುವುದನ್ನು ಮುಂದುವರಿಸಿ',
    ttsPauseTitle: 'ಆಲಿಸುವುದನ್ನು ವಿರಾಮಗೊಳಿಸಿ',
    ttsReadAloud: 'ಗಟ್ಟಿಯಾಗಿ ಓದಿ',
    ttsStopTitle: 'ಆಲಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿ',
    ttsExportTitle: 'ಭಾಷಣಕ್ಕೆ ಸಿದ್ಧವಾಗಿರುವ ಸರಳ ಪಠ್ಯ ಸ್ಕ್ರಿಪ್ಟ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
  }
};

export default function OutputCard({ content, feature, language = 'en' }: OutputCardProps) {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const t = outputCardTranslations[language] || outputCardTranslations.en;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Copy to clipboard handler
  const handleCopy = async () => {
    let textToCopy = '';
    if (typeof content === 'string') {
      textToCopy = content;
    } else {
      textToCopy = content
        .map((q, idx) => `${idx + 1}. ${q.question}\nOptions:\n${q.options.map((o, oIdx) => `   [${oIdx}] ${o}`).join('\n')}\nCorrect Answer: Option ${q.correctAnswer + 1}: ${q.options[q.correctAnswer]}`)
        .join('\n\n');
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Export clean speech-ready plain text audio script as file
  const handleExportTTSScript = () => {
    let plainText = '';
    if (typeof content === 'string') {
      // Strip markdown asterisks and format cleanly
      plainText = content.replace(/\*\*/g, '');
    } else {
      plainText = content
        .map((q, idx) => `Question ${idx + 1}: ${q.question}\nOptions:\n${q.options.map((o, oIdx) => `  ${String.fromCharCode(65 + oIdx)}. ${o}`).join('\n')}\nCorrect Answer: Option ${String.fromCharCode(65 + q.correctAnswer)}: ${q.options[q.correctAnswer]}`)
        .join('\n\n');
    }

    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `learning_material_audio_script.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Text to speech narration
  const toggleSpeech = () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      if (isPaused) {
        synthRef.current.resume();
        setIsPaused(false);
      } else {
        synthRef.current.pause();
        setIsPaused(true);
      }
    } else {
      synthRef.current.cancel();

      let plainText = '';
      if (typeof content === 'string') {
        // Strip markdown stars for cleaner reading
        plainText = content.replace(/\*\*/g, '');
      } else {
        plainText = "Quiz Mode. " + content
          .map((q, idx) => `Question ${idx + 1}: ${q.question}. Options are: ${q.options.join(', ')}.`)
          .join(' ');
      }

      const utterance = new SpeechSynthesisUtterance(plainText);
      
      // Select best voice match for languages
      const voices = synthRef.current.getVoices();
      if (language === 'hi') {
        const voice = voices.find(v => v.lang.startsWith('hi') || v.lang.startsWith('ne'));
        if (voice) utterance.voice = voice;
      } else if (language === 'kn') {
        const voice = voices.find(v => v.lang.startsWith('kn') || v.lang.startsWith('kan'));
        if (voice) utterance.voice = voice;
      }
      
      utteranceRef.current = utterance;

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      setIsPlaying(true);
      setIsPaused(false);
      synthRef.current.speak(utterance);
    }
  };

  const stopSpeech = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  // Quiz interactive elements
  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (quizAnswers[questionIndex] !== undefined) return; // already answered
    setQuizAnswers(prev => {
      const updated = { ...prev, [questionIndex]: optionIndex };
      // Check if all questions are answered
      if (Object.keys(updated).length === 5) {
        setQuizSubmitted(true);
      }
      return updated;
    });
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const getQuizScore = () => {
    if (typeof content === 'string') return 0;
    let score = 0;
    content.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="output-header">
        <h2 className="output-title">{t[feature]}</h2>
        <div className="output-actions">
          <button 
            type="button" 
            className="action-btn" 
            onClick={toggleSpeech}
            title={isPlaying ? (isPaused ? t.ttsResumeTitle : t.ttsPauseTitle) : t.ttsReadAloud}
          >
            {isPlaying ? (isPaused ? t.resume : t.pause) : t.listen}
          </button>
          {isPlaying && (
            <button 
              type="button" 
              className="action-btn" 
              onClick={stopSpeech}
              title={t.ttsStopTitle}
            >
              {t.stop}
            </button>
          )}
          <button 
            type="button" 
            className="action-btn" 
            onClick={handleCopy}
          >
            {copied ? t.copied : t.copy}
          </button>
          <button 
            type="button" 
            className="action-btn" 
            onClick={handleExportTTSScript}
            title={t.ttsExportTitle}
          >
            {t.exportAudio}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {feature !== 'quiz' && typeof content === 'string' ? (
          <MarkdownRenderer text={content} />
        ) : (
          <div className="quiz-container">
            {Array.isArray(content) && content.map((q, qIdx) => {
              const selectedAnswer = quizAnswers[qIdx];
              const isAnswered = selectedAnswer !== undefined;

              return (
                <div key={qIdx} className="quiz-question-card">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {t.question} {qIdx + 1} {t.of} {content.length}
                  </span>
                  <div className="quiz-question-text">{q.question}</div>
                  
                  <div className="quiz-options-list">
                    {q.options.map((option, oIdx) => {
                      let buttonClass = 'quiz-option-btn';
                      let labelBadge = null;

                      if (isAnswered) {
                        if (oIdx === q.correctAnswer) {
                          // This is the correct answer
                          buttonClass += ' correct';
                          labelBadge = <span className="quiz-badge badge-correct">{t.correctAnswer}</span>;
                        } else if (selectedAnswer === oIdx) {
                          // This is the selected WRONG answer
                          buttonClass += ' selected-wrong';
                          labelBadge = <span className="quiz-badge badge-wrong">{t.yourChoice}</span>;
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          className={buttonClass}
                          onClick={() => handleSelectOption(qIdx, oIdx)}
                          disabled={isAnswered}
                        >
                          <span>{String.fromCharCode(65 + oIdx)}. {option}</span>
                          {labelBadge}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {quizSubmitted && Array.isArray(content) && (
              <div className="quiz-score-banner">
                <div className="quiz-score-title">
                  {t.quizCompleted}
                </div>
                <div className="quiz-score-desc">
                  {t.scoredPrefix}<strong>{getQuizScore()}{t.scoredSuffix}{content.length}</strong>!
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {getQuizScore() === 5 
                    ? t.perfect 
                    : getQuizScore() >= 3 
                      ? t.great 
                      : t.goodTry}
                </p>
                <button
                  type="button"
                  className="control-btn"
                  onClick={handleResetQuiz}
                  style={{ marginTop: '0.75rem', padding: '0.6rem 1.2rem' }}
                >
                  {t.retake}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
