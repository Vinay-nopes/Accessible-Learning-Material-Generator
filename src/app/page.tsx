'use client';

import React, { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import TextInput from '@/components/TextInput';
import FeatureSelector from '@/components/FeatureSelector';
import GenerateButton from '@/components/GenerateButton';
import OutputCard from '@/components/OutputCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import DocumentUpload from '@/components/DocumentUpload';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    title: 'Accessible Learning Material Generator',
    subtitle: 'AI-Powered Learning Support for Students with Dyslexia',
    dyslexiaFont: 'Dyslexia Font',
    standardFont: 'Standard Font',
    normalSpacing: 'Normal Spacing',
    extraSpacing: 'Extra Spacing',
    disableRuler: 'Disable Ruler',
    readingRuler: 'Reading Ruler',
    fontSizeNormal: 'Normal Size',
    fontSizeLarge: 'Large Size',
    fontSizeXLarge: 'Extra Large Size',
    themeLight: 'Light Mode',
    themeDark: 'Dark Mode',
    uploadTitle: 'Upload Educational Document',
    dragDropText: 'Drag and drop your document here, or',
    browse: 'browse',
    supportedFormats: 'Supported Formats: PDF, DOCX',
    readingDoc: 'Reading document & extracting text...',
    orLabel: '— OR —',
    inputLabel: 'Educational Content',
    clearText: 'Clear Text',
    textareaPlaceholder: 'Paste your chapter, notes, article, or study material here...',
    words: 'Words',
    exceedsLimit: 'Note: Content exceeds 5,000 words. Simplify might take slightly longer.',
    selectFeature: 'Select a Feature',
    simplifyTitle: 'Simplify Content',
    simplifyDesc: 'Rewrite the text using simpler language, short sentences, and a dyslexia-friendly structure.',
    summaryTitle: 'Generate Summary',
    summaryDesc: 'Condense the text into 5 to 10 clear, easy-to-read bullet points for quick revision.',
    pointsTitle: 'Important Points',
    pointsDesc: 'Highlight key concepts, definitions, and exam revision topics with visual emphasis.',
    quizTitle: 'Generate Quiz',
    quizDesc: 'Create an interactive 5-question multiple choice quiz to test your understanding of the material.',
    engineTitle: 'Simplification Engine',
    engineGemini: 'Gemini AI',
    engineFinetuned: 'Our Fine-Tuned Model',
    btnGenerate: 'Generate Dyslexia-Friendly Material',
    btnGenerating: 'Generating Learning Material...',
    placeholderTitle: 'Your Transformed Content Will Appear Here',
    placeholderDesc: 'Paste some study material on the left, choose how you want to transform it, and click generate to make it highly readable and interactive.',
    footerText: 'Accessible Learning Material Generator • Developed for students with dyslexia.',
    selectLanguage: 'Language',
    loadingSimplifyGemini: 'Simplifying language & grammar...',
    loadingSimplifyFinetuned: 'Generating simplified content using Fine-Tuned Model...',
    loadingSummary: 'Summarizing key revision notes...',
    loadingImportantPoints: 'Extracting core concepts...',
    loadingQuiz: 'Generating multiple-choice quiz...',
  },
  hi: {
    title: 'सुलभ शिक्षण सामग्री जनरेटर',
    subtitle: 'डिस्लेक्सिया वाले छात्रों के लिए एआई-संचालित शिक्षण सहायता',
    dyslexiaFont: 'डिस्लेक्सिया फ़ॉन्ट',
    standardFont: 'मानक फ़ॉन्ट',
    normalSpacing: 'सामान्य स्पेसिंग',
    extraSpacing: 'अतिरिक्त स्पेसिंग',
    disableRuler: 'रूलर बंद करें',
    readingRuler: 'पठन रूलर',
    fontSizeNormal: 'सामान्य आकार',
    fontSizeLarge: 'बड़ा आकार',
    fontSizeXLarge: 'अति बड़ा आकार',
    themeLight: 'लाइट मोड',
    themeDark: 'डार्क मोड',
    uploadTitle: 'शैक्षणिक दस्तावेज़ अपलोड करें',
    dragDropText: 'अपने दस्तावेज़ को यहाँ खींचें और छोड़ें, या',
    browse: 'ब्राउज़ करें',
    supportedFormats: 'समर्थित प्रारूप: PDF, DOCX',
    readingDoc: 'दस्तावेज़ पढ़ा जा रहा है और पाठ निकाला जा रहा है...',
    orLabel: '— या —',
    inputLabel: 'शैक्षणिक सामग्री',
    clearText: 'पाठ साफ़ करें',
    textareaPlaceholder: 'अपना अध्याय, नोट्स, लेख या अध्ययन सामग्री यहाँ पेस्ट करें...',
    words: 'शब्द',
    exceedsLimit: 'नोट: सामग्री 5,000 शब्दों से अधिक है। सरलीकरण में थोड़ा अधिक समय लग सकता है।',
    selectFeature: 'एक सुविधा चुनें',
    simplifyTitle: 'सामग्री सरल बनाएं',
    simplifyDesc: 'सरल भाषा, छोटे वाक्यों और डिस्लेक्सिया-अनुकूल संरचना का उपयोग करके पाठ को फिर से लिखें।',
    summaryTitle: 'सारांश उत्पन्न करें',
    summaryDesc: 'त्वरित पुनरीक्षण के लिए पाठ को 5 से 10 स्पष्ट, पढ़ने में आसान बुलेट बिंदुओं में संक्षिप्त करें।',
    pointsTitle: 'महत्वपूर्ण बिंदु',
    pointsDesc: 'दृश्य महत्व के साथ प्रमुख अवधारणाओं, परिभाषाओं और परीक्षा पुनरीक्षण विषयों को उजागर करें।',
    quizTitle: 'प्रश्नोत्तरी बनाएं',
    quizDesc: 'सामग्री के बारे में अपनी समझ का परीक्षण करने के लिए 5-प्रश्नों की एक इंटरैक्टिव बहुविकल्पीय प्रश्नोत्तरी बनाएं।',
    engineTitle: 'सरलीकरण इंजन',
    engineGemini: 'जेमिनी एआई',
    engineFinetuned: 'हमारा फाइन-ट्यून्ड मॉडल',
    btnGenerate: 'डिस्लेक्सिया-अनुकूल सामग्री उत्पन्न करें',
    btnGenerating: 'शिक्षण सामग्री उत्पन्न हो रही है...',
    placeholderTitle: 'आपकी रूपांतरित सामग्री यहाँ दिखाई देगी',
    placeholderDesc: 'बाईं ओर अध्ययन सामग्री पेस्ट करें, चुनें कि आप इसे कैसे रूपांतरित करना चाहते हैं, और इसे अत्यधिक पठनीय और इंटरैक्टिव बनाने के लिए जनरेट पर क्लिक करें।',
    footerText: 'सुलभ शिक्षण सामग्री जनरेटर • डिस्लेक्सिया वाले छात्रों के लिए विकसित।',
    selectLanguage: 'भाषा',
    loadingSimplifyGemini: 'भाषा और व्याकरण को सरल बनाया जा रहा है...',
    loadingSimplifyFinetuned: 'फाइन-ट्यून्ड मॉडल का उपयोग करके सरल सामग्री उत्पन्न की जा रही है...',
    loadingSummary: 'प्रमुख संशोधन नोट्स का सारांश तैयार किया जा रहा है...',
    loadingImportantPoints: 'मूल अवधारणाओं को निकाला जा रहा है...',
    loadingQuiz: 'बहुविकल्पीय प्रश्नोत्तरी बनाई जा रही है...',
  },
  kn: {
    title: 'ಸುಲಭ ಕಲಿಕಾ ಸಾಮಗ್ರಿ ಜನರೇಟರ್',
    subtitle: 'ಡಿಸ್ಲೆಕ್ಸಿಯಾ ಹೊಂದಿರುವ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಎಐ-ಚಾಲಿತ ಕಲಿಕಾ ಬೆಂಬಲ',
    dyslexiaFont: 'ಡಿಸ್ಲೆಕ್ಸಿಯಾ ಫಾಂಟ್',
    standardFont: 'ಸಾಮಾನ್ಯ ಫಾಂಟ್',
    normalSpacing: 'ಸಾಮಾನ್ಯ ಅಂತರ',
    extraSpacing: 'ಹೆಚ್ಚಿನ ಅಂತರ',
    disableRuler: 'ರೂಲರ್ ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಿ',
    readingRuler: 'ಓದುವ ರೂಲರ್',
    fontSizeNormal: 'ಸಾಮಾನ್ಯ ಗಾತ್ರ',
    fontSizeLarge: 'ದೊಡ್ಡ ಗಾತ್ರ',
    fontSizeXLarge: 'ಅತಿ ದೊಡ್ಡ ಗಾತ್ರ',
    themeLight: 'ಬೆಳಕಿನ ಮೋಡ್',
    themeDark: 'ಡಾರ್ಕ್ ಮೋಡ್',
    uploadTitle: 'ಶೈಕ್ಷಣಿಕ ದಾಖಲೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    dragDropText: 'ನಿಮ್ಮ ದಾಖಲೆಯನ್ನು ಇಲ್ಲಿ ಎಳೆಯಿರಿ ಮತ್ತು ಬಿಡಿ, ಅಥವಾ',
    browse: 'ಬ್ರೌಸ್ ಮಾಡಿ',
    supportedFormats: 'ಬೆಂಬಲಿತ ಸ್ವರೂಪಗಳು: PDF, DOCX',
    readingDoc: 'ದಾಖಲೆಯನ್ನು ಓದಲಾಗುತ್ತಿದೆ ಮತ್ತು ಪಠ್ಯವನ್ನು ಹೊರತೆಗೆಯಲಾಗುತ್ತಿದೆ...',
    orLabel: '— ಅಥವಾ —',
    inputLabel: 'ಶೈಕ್ಷಣಿಕ ಪಠ್ಯ',
    clearText: 'ಪಠ್ಯ ಅಳಿಸಿ',
    textareaPlaceholder: 'ನಿಮ್ಮ ಅಧ್ಯಾಯ, ಟಿಪ್ಪಣಿಗಳು, ಲೇಖನ ಅಥವಾ ಅಧ್ಯಯನ ಸಾಮಗ್ರಿಯನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ...',
    words: 'ಪದಗಳು',
    exceedsLimit: 'ಗಮನಿಸಿ: ವಿಷಯವು 5,000 ಪದಗಳನ್ನು ಮೀರಿದೆ. ಸರಳೀಕರಣಕ್ಕೆ ಸ್ವಲ್ಪ ಹೆಚ್ಚಿನ ಸಮಯ ತೆಗೆದುಕೊಳ್ಳಬಹುದು.',
    selectFeature: 'ಒಂದು ವೈಶಿಷ್ಟ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    simplifyTitle: 'ವಿಷಯವನ್ನು ಸರಳಗೊಳಿಸಿ',
    simplifyDesc: 'ಸರಳ ಭಾಷೆ, ಸಣ್ಣ ವಾಕ್ಯಗಳು ಮತ್ತು ಡಿಸ್ಲೆಕ್ಸಿಯಾ-ಸ್ನೇಹಿ ರಚನೆಯನ್ನು ಬಳಸಿ ಪಠ್ಯವನ್ನು ಪುನಃ ಬರೆಯಿರಿ.',
    summaryTitle: 'ಸಾರಾಂಶವನ್ನು ರಚಿಸಿ',
    summaryDesc: 'ತ್ವರಿತ ಪರಿಷ್ಕರಣೆಗಾಗಿ ಪಠ್ಯವನ್ನು 5 ರಿಂದ 10 ಸ್ಪಷ್ಟ, ಓದಲು ಸುಲಭವಾದ ಬುಲೆಟ್ ಪಾಯಿಂಟ್‌ಗಳಾಗಿ ಸಂಕ್ಷೇಪಿಸಿ.',
    pointsTitle: 'ಪ್ರಮುಖ ಅಂಶಗಳು',
    pointsDesc: 'ದೃಶ್ಯ ಒತ್ತು ನೀಡುವ ಮೂಲಕ ಪ್ರಮುಖ ಪರಿಕಲ್ಪನೆಗಳು, ವ್ಯಾಖ್ಯಾನಗಳು ಮತ್ತು ಪರೀಕ್ಷೆಯ ಪರಿಷ್ಕರಣೆ ವಿಷಯಗಳನ್ನು ಹೈಲೈಟ್ ಮಾಡಿ.',
    quizTitle: 'ಪ್ರಶ್ನೋತ್ತರ ರಚಿಸಿ',
    quizDesc: 'ಸಾಮಗ್ರಿಯ ಕುರಿತು ನಿಮ್ಮ ತಿಳುವಳಿಕೆಯನ್ನು ಪರೀಕ್ಷಿಸಲು 5-ಪ್ರಶ್ನೆಗಳ ಸಂವಾದಾತ್ಮಕ ಬಹು ಆಯ್ಕೆಯ ರಸಪ್ರಶ್ನೆ ರಚಿಸಿ.',
    engineTitle: 'ಸರಳೀಕರಣ ಇಂಜಿನ್',
    engineGemini: 'ಜೆಮಿನಿ ಎಐ',
    engineFinetuned: 'ನಮ್ಮ ಫೈನ್-ಟ್ಯೂನ್ಡ್ ಮಾಡೆಲ್',
    btnGenerate: 'ಡಿಸ್ಲೆಕ್ಸಿಯಾ-ಸ್ನೇಹಿ ಸಾಮಗ್ರಿಯನ್ನು ರಚಿಸಿ',
    btnGenerating: 'ಕಲಿಕಾ ಸಾಮಗ್ರಿಯನ್ನು ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    placeholderTitle: 'ನಿಮ್ಮ ರೂಪಾಂತರಗೊಂಡ ವಿಷಯವು ಇಲ್ಲಿ ಗೋಚರಿಸುತ್ತದೆ',
    placeholderDesc: 'ಎಡಭಾಗದಲ್ಲಿ ಕೆಲವು ಅಧ್ಯಯನ ಸಾಮಗ್ರಿಗಳನ್ನು ಅಂಟಿಸಿ, ಅದನ್ನು ಹೇಗೆ ರೂಪಾಂತರಿಸಬೇಕೆಂದು ಆಯ್ಕೆಮಾಡಿ, ತದನಂತರ ಅದನ್ನು ಹೆಚ್ಚು ಓದಬಲ್ಲದಾಗಿಸಲು ಮತ್ತು ಸಂವಾದಾತ್ಮಕವಾಗಿಸಲು ಜನರೇಟ್ ಕ್ಲಿಕ್ ಮಾಡಿ.',
    footerText: 'ಸುವ್ಯವಸ್ಥಿತ ಕಲಿಕಾ ಸಾಮಗ್ರಿ ಜನರೇಟರ್ • ಡಿಸ್ಲೆಕ್ಸಿಯಾ ಹೊಂದಿರುವ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಅಭಿವೃದ್ಧಿಪಡಿಸಲಾಗಿದೆ.',
    selectLanguage: 'ಭಾಷೆ',
    loadingSimplifyGemini: 'ಭಾಷೆ ಮತ್ತು व्याकरणವನ್ನು ಸರಳಗೊಳಿಸಲಾಗುತ್ತಿದೆ...',
    loadingSimplifyFinetuned: 'ಫೈನ್-ಟ್ಯೂನ್ಡ್ ಮಾಡೆಲ್ ಬಳಸಿ ಸರಳೀಕೃತ ವಿಷಯವನ್ನು ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    loadingSummary: 'ಪ್ರಮುಖ ಪರಿಷ್ಕರಣೆ ಟಿಪ್ಪಣಿಗಳನ್ನು ಸಂಕ್ಷೇಪಿಸಲಾಗುತ್ತಿದೆ...',
    loadingImportantPoints: 'ಮೂಲ ಪರಿಕಲ್ಪನೆಗಳನ್ನು ಹೊರತೆಗೆಯಲಾಗುತ್ತಿದೆ...',
    loadingQuiz: 'ಬಹು ಆಯ್ಕೆಯ ರಸಪ್ರಶ್ನೆ ರಚಿಸಲಾಗುತ್ತಿದೆ...',
  }
};

export default function Home() {
  // Input and settings state
  const [text, setText] = useState('');
  const [feature, setFeature] = useState<'simplify' | 'summary' | 'important_points' | 'quiz'>('simplify');
  const [engine, setEngine] = useState<'gemini' | 'finetuned'>('gemini');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Output result
  const [result, setResult] = useState<string | QuizQuestion[] | null>(null);
  const [resultFeature, setResultFeature] = useState<'simplify' | 'summary' | 'important_points' | 'quiz'>('simplify');

  // Accessibility States
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [extraSpacing, setExtraSpacing] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [rulerActive, setRulerActive] = useState(false);
  const [rulerY, setRulerY] = useState(0);

  // Localization and Dark Mode Theme
  const [language, setLanguage] = useState<'en' | 'hi' | 'kn'>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Sync dark-theme class on <html> so html, body, and all areas get the dark background
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, [theme]);

  const containerRef = useRef<HTMLDivElement>(null);
  const t = translations[language] || translations.en;

  // Monitor mouse movements for the reading ruler focus line
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerActive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    setRulerY(relativeY);
  };



  const handleGenerate = async () => {
    setError(null);
    setResult(null);

    if (!text.trim()) {
      setError(t.inputLabel + ' ' + (language === 'hi' ? 'आवश्यक है।' : language === 'kn' ? 'ಅಗತ್ಯವಿದೆ.' : 'is required.'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          feature,
          engine: feature === 'simplify' ? engine : undefined,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to generate response. Please try again.');
      }

      setResult(data.result);
      setResultFeature(feature);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Unable to generate response. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Dynamically build styles based on accessibility states
  const getContentFontSize = () => {
    switch (fontSize) {
      case 'large': return '1.25rem';
      case 'xlarge': return '1.4rem';
      default: return '1.05rem';
    }
  };

  const getContentLineHeight = () => {
    return extraSpacing ? '2.1' : '1.7';
  };

  const getContentLetterSpacing = () => {
    return extraSpacing ? '0.08em' : '0.01em';
  };

  return (
    <div 
      ref={containerRef}
      className={`font-outfit ${dyslexicFont ? 'font-lexend' : ''} ${theme === 'dark' ? 'dark-theme' : ''}`}
      onMouseMove={handleMouseMove}
      style={{ 
        position: 'relative', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: 'var(--bg-cream)',
        color: 'var(--text-main)',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      {/* 3D Floating Mesh Particles Ambient Backdrop */}
      <div className="mesh-gradient-container">
        <div className="mesh-blob blob-1"></div>
        <div className="mesh-blob blob-2"></div>
        <div className="mesh-blob blob-3"></div>
      </div>

      {/* Reading Ruler Focus Overlay */}
      {rulerActive && (
        <div
          style={{
            position: 'absolute',
            top: `${rulerY - 15}px`,
            left: 0,
            width: '100%',
            height: '35px',
            backgroundColor: 'rgba(253, 224, 71, 0.25)', // Semi-transparent yellow focus line
            borderTop: '2px dashed rgba(234, 179, 8, 0.6)',
            borderBottom: '2px dashed rgba(234, 179, 8, 0.6)',
            pointerEvents: 'none',
            zIndex: 99,
          }}
        />
      )}

      <div className="app-container" style={{ position: 'relative', zIndex: 1 }}>
        <Header title={t.title} subtitle={t.subtitle} />

        {/* Accessibility Toolbar */}
        <div className="accessibility-bar">
          {/* Language Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0 0.5rem' }}>
            <span style={{ fontSize: '0.95rem' }}>🌐</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'hi' | 'kn')}
              className="control-btn"
              style={{ border: 'none', background: 'none', boxShadow: 'none', padding: '0.5rem 0.25rem', cursor: 'pointer', outline: 'none', color: 'var(--text-main)', fontWeight: 500 }}
              title={t.selectLanguage}
            >
              <option value="en" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>English (EN)</option>
              <option value="hi" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>हिन्दी (HI)</option>
              <option value="kn" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>ಕನ್ನಡ (KN)</option>
            </select>
          </div>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            className={`control-btn ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title={theme === 'light' ? t.themeDark : t.themeLight}
          >
            {theme === 'light' ? '🌙' : '☀️'} {theme === 'light' ? t.themeDark : t.themeLight}
          </button>

          {/* Font togglers */}
          <button
            type="button"
            className={`control-btn ${dyslexicFont ? 'active' : ''}`}
            onClick={() => setDyslexicFont(!dyslexicFont)}
            title="Toggle dyslexia-friendly font"
          >
            ✏️ {dyslexicFont ? t.standardFont : t.dyslexiaFont}
          </button>
          
          <button
            type="button"
            className={`control-btn ${extraSpacing ? 'active' : ''}`}
            onClick={() => setExtraSpacing(!extraSpacing)}
            title="Toggle extra character & line spacing"
          >
            ↔️ {extraSpacing ? t.normalSpacing : t.extraSpacing}
          </button>

          <button
            type="button"
            className={`control-btn ${rulerActive ? 'active' : ''}`}
            onClick={() => setRulerActive(!rulerActive)}
            title="Toggle reading focus guide line"
          >
            📏 {rulerActive ? t.disableRuler : t.readingRuler}
          </button>

          {/* Font Size group controls */}
          <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
            <button
              type="button"
              className="control-btn"
              style={{ borderRadius: 0, border: 'none', borderRight: '1px solid var(--border-color)', background: fontSize === 'normal' ? 'var(--primary-light)' : 'var(--bg-card)' }}
              onClick={() => setFontSize('normal')}
              title={t.fontSizeNormal}
            >
              A
            </button>
            <button
              type="button"
              className="control-btn"
              style={{ borderRadius: 0, border: 'none', borderRight: '1px solid var(--border-color)', background: fontSize === 'large' ? 'var(--primary-light)' : 'var(--bg-card)', fontWeight: 600 }}
              onClick={() => setFontSize('large')}
              title={t.fontSizeLarge}
            >
              A+
            </button>
            <button
              type="button"
              className="control-btn"
              style={{ borderRadius: 0, border: 'none', background: fontSize === 'xlarge' ? 'var(--primary-light)' : 'var(--bg-card)', fontWeight: 800 }}
              onClick={() => setFontSize('xlarge')}
              title={t.fontSizeXLarge}
            >
              A++
            </button>
          </div>
        </div>

        {/* Main Grid Section */}
        <main className="grid-layout">
          {/* Input Side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card">
              <DocumentUpload
                onExtractSuccess={(extractedText) => {
                  setText(extractedText);
                  setError(null);
                }}
                onExtractError={(uploadError) => {
                  setError(uploadError);
                }}
                t={t}
              />
              <div style={{ textAlign: 'center', margin: '1rem 0', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                {t.orLabel}
              </div>
              <TextInput 
                value={text} 
                onChange={setText} 
                error={error} 
                label={t.inputLabel}
                clearTextLabel={t.clearText}
                placeholder={t.textareaPlaceholder}
                wordsLabel={t.words}
                exceedsLimitLabel={t.exceedsLimit}
              />
            </div>

            <div className="card">
              <FeatureSelector 
                selectedFeature={feature} 
                onSelect={setFeature} 
                t={t}
              />
              {feature === 'simplify' && (
                <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                  <h4 className="label-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>{t.engineTitle}</h4>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                      <input 
                        type="radio" 
                        name="simplification-engine" 
                        value="gemini" 
                        checked={engine === 'gemini'} 
                        onChange={() => setEngine('gemini')}
                        style={{ accentColor: 'var(--primary)', width: '1.1rem', height: '1.1rem' }}
                      />
                      {t.engineGemini}
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                      <input 
                        type="radio" 
                        name="simplification-engine" 
                        value="finetuned" 
                        checked={engine === 'finetuned'} 
                        onChange={() => setEngine('finetuned')}
                        style={{ accentColor: 'var(--primary)', width: '1.1rem', height: '1.1rem' }}
                      />
                      {t.engineFinetuned}
                    </label>
                  </div>
                </div>
              )}
              <div style={{ marginTop: '1.5rem' }}>
                <GenerateButton 
                  onClick={handleGenerate} 
                  loading={loading} 
                  disabled={text.trim() === ''} 
                  label={t.btnGenerate}
                  loadingLabel={t.btnGenerating}
                />
              </div>
            </div>
          </div>

          {/* Output Side */}
          <div style={{ minHeight: '400px' }}>
            {loading ? (
              <div className="card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LoadingSpinner 
                  message={
                    feature === 'simplify' 
                      ? (engine === 'finetuned'
                          ? t.loadingSimplifyFinetuned
                          : t.loadingSimplifyGemini)
                      : feature === 'summary' 
                        ? t.loadingSummary 
                        : feature === 'important_points' 
                          ? t.loadingImportantPoints 
                          : t.loadingQuiz
                  } 
                />
              </div>
            ) : result ? (
              <div 
                style={{ 
                  height: '100%',
                  fontSize: getContentFontSize(),
                  lineHeight: getContentLineHeight(),
                  letterSpacing: getContentLetterSpacing(),
                }}
              >
                <OutputCard 
                  content={result} 
                  feature={resultFeature} 
                  language={language}
                />
              </div>
            ) : (
              <div className="empty-result-placeholder">
                <div className="empty-result-icon">✨</div>
                <h3>{t.placeholderTitle}</h3>
                <p style={{ maxWidth: '400px', fontSize: '0.95rem' }}>
                  {t.placeholderDesc}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <footer style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '2rem 1rem', borderTop: '1px solid var(--border-color)', marginTop: '3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        {t.footerText}
      </footer>
    </div>
  );
}
