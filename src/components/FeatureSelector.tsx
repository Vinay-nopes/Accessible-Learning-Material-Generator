import React from 'react';

interface FeatureOption {
  id: 'simplify' | 'summary' | 'important_points' | 'quiz';
  title: string;
  description: string;
  icon: string;
}

interface FeatureSelectorProps {
  selectedFeature: 'simplify' | 'summary' | 'important_points' | 'quiz';
  onSelect: (feature: 'simplify' | 'summary' | 'important_points' | 'quiz') => void;
  t: Record<string, string>;
}

export default function FeatureSelector({ 
  selectedFeature, 
  onSelect, 
  t
}: FeatureSelectorProps) {
  const features: FeatureOption[] = [
    {
      id: 'simplify',
      title: t.simplifyTitle,
      description: t.simplifyDesc,
      icon: '✨',
    },
    {
      id: 'summary',
      title: t.summaryTitle,
      description: t.summaryDesc,
      icon: '📝',
    },
    {
      id: 'important_points',
      title: t.pointsTitle,
      description: t.pointsDesc,
      icon: '💡',
    },
    {
      id: 'quiz',
      title: t.quizTitle,
      description: t.quizDesc,
      icon: '❓',
    },
  ];

  return (
    <div>
      <h3 className="label-title" style={{ marginBottom: '0.75rem' }}>{t.selectFeature}</h3>
      <div className="feature-grid">
        {features.map((feature) => (
          <button
            key={feature.id}
            type="button"
            className={`feature-option ${selectedFeature === feature.id ? 'selected' : ''}`}
            onClick={() => onSelect(feature.id)}
            aria-pressed={selectedFeature === feature.id}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{feature.icon}</span>
              <span className="feature-title">{feature.title}</span>
            </div>
            <span className="feature-desc">{feature.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
