export const ASSESSMENT_QUESTIONS = {
  stress: [
    "I find it hard to wind down.",
    "I feel that I am using a lot of nervous energy.",
    "I tend to overreact to situations.",
    "I feel that I am rather touchy.",
    "I feel that I am getting agitated easily.",
    "I find it difficult to relax after work or school.",
    "I feel nervous or anxious without any apparent reason.",
    "I feel that I am under pressure in my daily life.",
    "I find it hard to control my irritations.",
    "I feel tense or 'on edge' frequently."
  ],
  anxiety: [
    "I feel nervous, anxious, or on edge.",
    "I have panic or sudden feelings of fear.",
    "I worry excessively about different things.",
    "I find it difficult to control my worrying.",
    "I have trouble relaxing.",
    "I feel restless or unable to sit still.",
    "I feel heart racing or palpitations.",
    "I feel short of breath or tense physically.",
    "I have irrational fears about certain situations.",
    "I feel impending doom or that something bad will happen."
  ],
  depression: [
    "I feel downhearted or blue.",
    "I have lost interest in things I usually enjoy.",
    "I feel that life is meaningless.",
    "I feel hopeless about the future.",
    "I feel that I am a failure.",
    "I have trouble sleeping or sleep too much.",
    "I feel fatigued or low on energy.",
    "I have difficulty concentrating on tasks.",
    "I feel that I am not worth much.",
    "I experience little pleasure in daily activities."
  ]
};

export const RESPONSE_OPTIONS = [
  { value: "Never", label: "Never", emoji: "😊", color: "#10b981" },
  { value: "Sometimes", label: "Sometimes", emoji: "😐", color: "#f59e0b" },
  { value: "Often", label: "Often", emoji: "😟", color: "#ef4444" },
  { value: "Almost Always", label: "Almost Always", emoji: "😰", color: "#7c3aed" }
];

export const MOOD_OPTIONS = [
  { value: "Happy", emoji: "😁", color: "#2b8aa7ff" },
  { value: "Calm", emoji: "😊", color: "#34d399" },
  { value: "Neutral", emoji: "😐", color: "#f59e0b" },
  { value: "Tired", emoji: "😔", color: "#913855ff" },
  { value: "Stressed", emoji: "😢", color: "#db51a2ff" },
  { value: "Angry", emoji: "😡", color: "#9c0c13ff" },
  { value: "Sad", emoji: "😞", color: "#ec4444ff" },
  { value: "Anxious", emoji: "😥", color: "#1f0a0aff" }
];

export const SCORE_THRESHOLDS = {
  low: 3,
  moderate: 6,
  high: 8
};

export const ACTIVITY_CATEGORIES = {
  'Stress Relief': { color: '#ff6b6b', icon: '🌊' },
  'Anxiety Reduction': { color: '#4d96ff', icon: '🧘' },
  'Depression Uplift': { color: '#6b48ff', icon: '🌞' },
  'Mood Enhancement': { color: '#10b981', icon: '😊' },
  'Focus & Productivity': { color: '#f59e0b', icon: '🎯' },
  'Sleep Improvement': { color: '#8b5cf6', icon: '😴' },
  'Physical Activity': { color: '#ef4444', icon: '🏃' }
};

export const INTENSITY_LEVELS = {
  'Low': { color: '#10b981', icon: '🐢' },
  'Medium': { color: '#f59e0b', icon: '🚶' },
  'High': { color: '#ef4444', icon: '⚡' }
};