import { useState } from "react";
import { LandingScreen } from "@/components/LandingScreen";
import { RegistrationScreen } from "@/components/RegistrationScreen";
import { QuizScreen } from "@/components/QuizScreen";
import { ResultsScreen } from "@/components/ResultsScreen";

type Screen = 'landing' | 'registration' | 'quiz' | 'results';

interface ParticipantData {
  registration: string;
  name: string;
  email: string;
}

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [scores, setScores] = useState({ D: 0, I: 0, S: 0, C: 0 });
  const [participantData, setParticipantData] = useState<ParticipantData | null>(null);

  const handleStart = () => {
    setCurrentScreen('registration');
  };

  const handleRegistrationComplete = (data: ParticipantData) => {
    setParticipantData(data);
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
    <div className="pt-16">
      {currentScreen === 'landing' && <LandingScreen onStart={handleStart} />}
      {currentScreen === 'registration' && <RegistrationScreen onComplete={handleRegistrationComplete} />}
      {currentScreen === 'quiz' && participantData && <QuizScreen onComplete={handleComplete} participantData={participantData} />}
      {currentScreen === 'results' && participantData && <ResultsScreen scores={scores} participantData={participantData} onRestart={handleRestart} />}
    </div>
  );
};

export default Index;
