import React from 'react';

interface TextInputProps {
  value: string;
  onChange: (val: string) => void;
  error: string | null;
  label: string;
  clearTextLabel: string;
  placeholder: string;
  wordsLabel: string;
  exceedsLimitLabel: string;
}

export default function TextInput({ 
  value, 
  onChange, 
  error,
  label,
  clearTextLabel,
  placeholder,
  wordsLabel,
  exceedsLimitLabel
}: TextInputProps) {
  const wordCount = value.trim() === '' ? 0 : value.trim().split(/\s+/).length;

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="textarea-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label htmlFor="education-input" className="label-title">
          {label}
        </label>
        {value && (
          <button 
            type="button" 
            onClick={handleClear} 
            className="action-btn"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
          >
            {clearTextLabel}
          </button>
        )}
      </div>
      
      <textarea
        id="education-input"
        className="custom-textarea"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={error ? "input-error" : undefined}
      />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-0.25rem' }}>
        <span className="word-count">
          {wordsLabel}: {wordCount}
        </span>
        {wordCount > 5000 && (
          <span style={{ fontSize: '0.8rem', color: '#D97706', fontWeight: 600 }}>
            {exceedsLimitLabel}
          </span>
        )}
      </div>
      
      {error && (
        <div id="input-error" className="error-box" role="alert" style={{ marginTop: '0.5rem' }}>
          <span>⚠️</span> {error}
        </div>
      )}
    </div>
  );
}
