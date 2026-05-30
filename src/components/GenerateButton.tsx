import React from 'react';

interface GenerateButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
  label: string;
  loadingLabel: string;
}

export default function GenerateButton({ onClick, loading, disabled, label, loadingLabel }: GenerateButtonProps) {
  return (
    <button
      type="button"
      className="btn-generate"
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '3px' }}></span>
          {loadingLabel}
        </>
      ) : (
        <>
          <span>⚡</span> {label}
        </>
      )}
    </button>
  );
}
