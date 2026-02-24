import { useState } from "react";
import { LandingScreen } from "@/components/LandingScreen";
import { RegistrationScreen } from "@/components/RegistrationScreen";
import { QuizScreen } from "@/components/QuizScreen";
import { ResultsScreen } from "@/components/ResultsScreen";
import { InstructorSetup } from "@/components/InstructorSetup";

type Screen = 'landing' | 'instructor_setup' | 'registration' | 'quiz' | 'results';

interface ParticipantData {
  registration: string;
  name: string;
  email: string;
  cpf: string;
}

interface InstructorData {
  instructorName: string;
  instructorRegistration: string;
  instructorEmail: string;
  className: string;
}

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [scores, setScores] = useState({ D: 0, I: 0, S: 0, C: 0 });
  const [participantData, setParticipantData] = useState<ParticipantData | null>(null);
  const [instructorData, setInstructorData] = useState<InstructorData | null>(null);

  const handleStart = () => {
    setCurrentScreen('instructor_setup');
  };

  const handleInstructorComplete = (data: InstructorData) => {
    setInstructorData(data);
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
      {currentScreen === 'instructor_setup' && <InstructorSetup onComplete={handleInstructorComplete} />}
      {currentScreen === 'registration' && <RegistrationScreen onComplete={handleRegistrationComplete} />}
      {currentScreen === 'quiz' && participantData && <QuizScreen onComplete={handleComplete} participantData={participantData} />}
      {currentScreen === 'results' && participantData && instructorData && (
        <ResultsScreen
          scores={scores}
          participantData={participantData}
          instructorData={instructorData}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};

export default Index;
