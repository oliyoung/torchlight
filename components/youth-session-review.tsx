"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface YouthSessionReviewProps {
  onReviewComplete: (transcript: string) => void;
  athleteAge?: number;
}

interface ReviewData {
  energyLevel: number;
  enjoyment: number;
  difficulty: number;
  focusAreas: string[];
  feelings: string[];
  highlights: string;
  challenges: string;
  improvements: string;
  additionalNotes: string;
}

const ENERGY_LEVELS = [
  { value: 1, emoji: "😴", label: "Very tired" },
  { value: 2, emoji: "😐", label: "A bit tired" },
  { value: 3, emoji: "🙂", label: "Normal" },
  { value: 4, emoji: "😄", label: "Energetic" },
  { value: 5, emoji: "⚡", label: "Super energetic" },
];

const ENJOYMENT_LEVELS = [
  { value: 1, emoji: "😞", label: "Didn't like it" },
  { value: 2, emoji: "😕", label: "It was okay" },
  { value: 3, emoji: "🙂", label: "Good" },
  { value: 4, emoji: "😊", label: "Really fun" },
  { value: 5, emoji: "🤩", label: "Loved it!" },
];

const DIFFICULTY_LEVELS = [
  { value: 1, emoji: "😎", label: "Too easy" },
  { value: 2, emoji: "🙂", label: "Just right" },
  { value: 3, emoji: "😅", label: "Challenging" },
  { value: 4, emoji: "😤", label: "Really hard" },
  { value: 5, emoji: "😵", label: "Too difficult" },
];

const FOCUS_OPTIONS = [
  "Technique", "Strength", "Speed", "Endurance", "Teamwork", 
  "Skills", "Strategy", "Flexibility", "Balance", "Coordination"
];

const FEELING_OPTIONS = [
  "Confident", "Proud", "Frustrated", "Excited", "Nervous", 
  "Focused", "Distracted", "Motivated", "Tired", "Strong", "Happy", "Worried"
];

export function YouthSessionReview({ onReviewComplete, athleteAge = 16 }: YouthSessionReviewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [reviewData, setReviewData] = useState<ReviewData>({
    energyLevel: 3,
    enjoyment: 3,
    difficulty: 2,
    focusAreas: [],
    feelings: [],
    highlights: "",
    challenges: "",
    improvements: "",
    additionalNotes: ""
  });

  const isYoungerAthlete = athleteAge < 14;

  const steps = [
    {
      title: "How did you feel today?",
      subtitle: "Rate your energy and enjoyment",
      component: "ratings"
    },
    {
      title: "What did you work on?",
      subtitle: "Pick the main areas you focused on",
      component: "focus"
    },
    {
      title: "How are you feeling?",
      subtitle: "Select words that describe how you feel",
      component: "feelings"
    },
    {
      title: "Tell us more",
      subtitle: "Share what went well and what was challenging",
      component: "details"
    }
  ];

  const handleRatingChange = (type: keyof Pick<ReviewData, 'energyLevel' | 'enjoyment' | 'difficulty'>, value: number) => {
    setReviewData(prev => ({ ...prev, [type]: value }));
  };

  const handleArrayToggle = (type: keyof Pick<ReviewData, 'focusAreas' | 'feelings'>, value: string) => {
    setReviewData(prev => ({
      ...prev,
      [type]: prev[type].includes(value) 
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };

  const handleTextChange = (field: keyof Pick<ReviewData, 'highlights' | 'challenges' | 'improvements' | 'additionalNotes'>, value: string) => {
    setReviewData(prev => ({ ...prev, [field]: value }));
  };

  const generateTranscript = () => {
    const energyLabel = ENERGY_LEVELS.find(e => e.value === reviewData.energyLevel)?.label || "Normal";
    const enjoymentLabel = ENJOYMENT_LEVELS.find(e => e.value === reviewData.enjoyment)?.label || "Good";
    const difficultyLabel = DIFFICULTY_LEVELS.find(e => e.value === reviewData.difficulty)?.label || "Just right";

    return `Energy Level: ${energyLabel} (${reviewData.energyLevel}/5)
Enjoyment: ${enjoymentLabel} (${reviewData.enjoyment}/5)
Difficulty: ${difficultyLabel} (${reviewData.difficulty}/5)

Focus Areas: ${reviewData.focusAreas.join(", ") || "None specified"}
Feelings: ${reviewData.feelings.join(", ") || "None specified"}

What went well: ${reviewData.highlights || "Not specified"}
What was challenging: ${reviewData.challenges || "Not specified"}
What I want to improve: ${reviewData.improvements || "Not specified"}

Additional notes: ${reviewData.additionalNotes || "None"}`;
  };

  const renderRatingsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Energy Level</h3>
        <div className="flex gap-2 flex-wrap">
          {ENERGY_LEVELS.map((level) => (
            <Button
              key={level.value}
              variant={reviewData.energyLevel === level.value ? "default" : "outline"}
              className="flex-col h-20 w-20"
              onClick={() => handleRatingChange('energyLevel', level.value)}
            >
              <span className="text-2xl mb-1">{level.emoji}</span>
              <span className="text-xs text-center">{level.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">How much did you enjoy it?</h3>
        <div className="flex gap-2 flex-wrap">
          {ENJOYMENT_LEVELS.map((level) => (
            <Button
              key={level.value}
              variant={reviewData.enjoyment === level.value ? "default" : "outline"}
              className="flex-col h-20 w-20"
              onClick={() => handleRatingChange('enjoyment', level.value)}
            >
              <span className="text-2xl mb-1">{level.emoji}</span>
              <span className="text-xs text-center">{level.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">How hard was it?</h3>
        <div className="flex gap-2 flex-wrap">
          {DIFFICULTY_LEVELS.map((level) => (
            <Button
              key={level.value}
              variant={reviewData.difficulty === level.value ? "default" : "outline"}
              className="flex-col h-20 w-16"
              onClick={() => handleRatingChange('difficulty', level.value)}
            >
              <span className="text-2xl mb-1">{level.emoji}</span>
              <span className="text-xs text-center">{level.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFocusStep = () => (
    <div>
      <h3 className="text-lg font-medium mb-3">What did you work on today?</h3>
      <p className="text-sm text-muted-foreground mb-4">Pick all that apply</p>
      <div className="flex gap-2 flex-wrap">
        {FOCUS_OPTIONS.map((focus) => (
          <Badge
            key={focus}
            variant={reviewData.focusAreas.includes(focus) ? "default" : "outline"}
            className="cursor-pointer px-3 py-2"
            onClick={() => handleArrayToggle('focusAreas', focus)}
          >
            {focus}
          </Badge>
        ))}
      </div>
    </div>
  );

  const renderFeelingsStep = () => (
    <div>
      <h3 className="text-lg font-medium mb-3">How are you feeling right now?</h3>
      <p className="text-sm text-muted-foreground mb-4">Pick all that describe how you feel</p>
      <div className="flex gap-2 flex-wrap">
        {FEELING_OPTIONS.map((feeling) => (
          <Badge
            key={feeling}
            variant={reviewData.feelings.includes(feeling) ? "default" : "outline"}
            className="cursor-pointer px-3 py-2"
            onClick={() => handleArrayToggle('feelings', feeling)}
          >
            {feeling}
          </Badge>
        ))}
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">
          What went really well today? ⭐
        </label>
        <Textarea
          placeholder={isYoungerAthlete ? "I did a great job with..." : "Describe what you're proud of from today's session..."}
          value={reviewData.highlights}
          onChange={(e) => handleTextChange('highlights', e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          What was challenging? 💪
        </label>
        <Textarea
          placeholder={isYoungerAthlete ? "Something that was hard was..." : "What did you find difficult or frustrating?"}
          value={reviewData.challenges}
          onChange={(e) => handleTextChange('challenges', e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          What do you want to get better at? 🎯
        </label>
        <Textarea
          placeholder={isYoungerAthlete ? "Next time I want to work on..." : "What would you like to improve or focus on next time?"}
          value={reviewData.improvements}
          onChange={(e) => handleTextChange('improvements', e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          Anything else to add? 💭
        </label>
        <Textarea
          placeholder="Any other thoughts about today..."
          value={reviewData.additionalNotes}
          onChange={(e) => handleTextChange('additionalNotes', e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );

  const renderStep = () => {
    switch (steps[currentStep].component) {
      case "ratings": return renderRatingsStep();
      case "focus": return renderFocusStep();
      case "feelings": return renderFeelingsStep();
      case "details": return renderDetailsStep();
      default: return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true; // Ratings always have defaults
      case 1: return reviewData.focusAreas.length > 0;
      case 2: return reviewData.feelings.length > 0;
      case 3: return true; // Details are optional
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onReviewComplete(generateTranscript());
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <p className="text-sm text-muted-foreground">{steps[currentStep].subtitle}</p>
          </div>
          <Badge variant="outline">
            {currentStep + 1} of {steps.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderStep()}
        
        <div className="flex gap-3 pt-4">
          {currentStep > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Back
            </Button>
          )}
          <Button 
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1"
          >
            {currentStep === steps.length - 1 ? "Complete Review" : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}