import { useState } from "react";
import { LandingScreen } from "@/components/LandingScreen";
import { QuizScreen } from "@/components/QuizScreen";
import { ResultsScreen } from "@/components/ResultsScreen";

type Screen = 'landing' | 'quiz' | 'results';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [scores, setScores] = useState({ D: 0, I: 0, S: 0, C: 0 });

  const handleStart = () => {
    setCurrentScreen('quiz');
  };

  const handleComplete = (finalScores: { D: number; I: number; S: number; C: number }) => {
    setScores(finalScores);
    setCurrentScreen('results');
  };

  const handleRestart = () => {
    setScores({ D: 0, I: 0, S: 0, C: 0 });
    setCurrentScreen('landing');
  };

  return (
    <>
      {currentScreen === 'landing' && <LandingScreen onStart={handleStart} />}
      {currentScreen === 'quiz' && <QuizScreen onComplete={handleComplete} />}
      {currentScreen === 'results' && <ResultsScreen scores={scores} onRestart={handleRestart} />}
    </>
  );
};

export default Index;
