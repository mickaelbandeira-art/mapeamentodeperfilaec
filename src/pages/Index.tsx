import { useState } from "react";
import { LandingScreen } from "@/components/LandingScreen";
import { RegistrationScreen } from "@/components/RegistrationScreen";
import { QuizScreen } from "@/components/QuizScreen";
import { ResultsScreen } from "@/components/ResultsScreen";
import { InstructorSetup } from "@/components/InstructorSetup";
import { TestInfoModal, TestType } from "@/components/TestInfoModal";
import { cn } from "@/lib/utils";

type Screen = 'landing' | 'instructor_setup' | 'registration' | 'quiz_disc' | 'quiz_mindset' | 'quiz_vac' | 'results';

interface ParticipantData {
  registration: string;
  name: string;
  email: string;
  cpf: string;
  site: string;
  class_id?: string;
}

interface InstructorData {
  instructorName: string;
  instructorRegistration: string;
  instructorEmail: string;
  className: string;
}

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [infoModal, setInfoModal] = useState<TestType | null>(null);
  const [scores, setScores] = useState({ D: 0, I: 0, S: 0, C: 0 });
  const [mindsetResult, setMindsetResult] = useState<string>("");
  const [vacResult, setVacResult] = useState<string>("");
  const [participantData, setParticipantData] = useState<ParticipantData | null>(null);
  const [instructorData, setInstructorData] = useState<InstructorData | null>(null);
  const [userType, setUserType] = useState<'colaborador' | 'novato' | null>(null);

  const handleStart = (type: 'colaborador' | 'novato') => {
    setUserType(type);
    setCurrentScreen('registration');
  };

  const handleInstructorComplete = (data: InstructorData) => {
    setInstructorData(data);
    if (participantData) {
      setParticipantData({ ...participantData, class_id: data.className });
    }
    setInfoModal('DISC');
  };

  const handleRegistrationComplete = (data: { registration: string; name: string; email: string; cpf: string; site: string; class_id?: string }) => {
    setParticipantData(data);
    if (userType === 'colaborador' || data.class_id) {
      setInfoModal('DISC');
    } else {
      setCurrentScreen('instructor_setup');
    }
  };

  const handleDiscComplete = (finalScores: { D: number; I: number; S: number; C: number }) => {
    setScores(finalScores);
    setInfoModal('Mindset');
  };

  const handleMindsetComplete = (result: string) => {
    setMindsetResult(result);
    setInfoModal('VAC');
  };

  const handleVacComplete = (result: string) => {
    setVacResult(result);
    setInfoModal('AI');
  };

  const handleConfirmModal = () => {
    const nextModal = infoModal;
    setInfoModal(null);

    switch (nextModal) {
      case 'DISC':
        setCurrentScreen('quiz_disc');
        break;
      case 'Mindset':
        setCurrentScreen('quiz_mindset');
        break;
      case 'VAC':
        setCurrentScreen('quiz_vac');
        break;
      case 'AI':
        setCurrentScreen('results');
        break;
    }
  };

  const handleRestart = () => {
    setScores({ D: 0, I: 0, S: 0, C: 0 });
    setUserType(null);
    setCurrentScreen('landing');
    setInfoModal(null);
  };

  const handleBack = () => {
    console.log("🔙 Voltando de:", currentScreen);
    if (currentScreen === 'registration') {
      setCurrentScreen('landing');
      setUserType(null);
    } else if (currentScreen === 'instructor_setup') {
      setCurrentScreen('registration');
    }
  };

  return (
    <div className={cn(currentScreen !== 'results' && "pt-16")}>
      <TestInfoModal
        isOpen={!!infoModal}
        type={infoModal || 'DISC'}
        onClose={() => setInfoModal(null)}
        onConfirm={handleConfirmModal}
      />

      {currentScreen === 'landing' && <LandingScreen onStart={handleStart} />}
      {currentScreen === 'instructor_setup' && <InstructorSetup onComplete={handleInstructorComplete} onBack={handleBack} />}
      {currentScreen === 'registration' && (
        <RegistrationScreen
          onComplete={handleRegistrationComplete}
          initialMode={userType || 'colaborador'}
          onBack={handleBack}
        />
      )}
      {currentScreen === 'quiz_disc' && participantData && (
        <QuizScreen
          type="DISC"
          onComplete={handleDiscComplete}
          participantData={participantData}
        />
      )}
      {currentScreen === 'quiz_mindset' && participantData && (
        <QuizScreen
          type="Mindset"
          onComplete={handleMindsetComplete}
          participantData={participantData}
        />
      )}
      {currentScreen === 'quiz_vac' && participantData && (
        <QuizScreen
          type="VAC"
          onComplete={handleVacComplete}
          participantData={participantData}
        />
      )}
      {currentScreen === 'results' && participantData && (
        <ResultsScreen
          scores={scores}
          mindset={mindsetResult}
          vac={vacResult}
          participantData={participantData}
          instructorData={instructorData || {
            instructorName: "N/A",
            instructorRegistration: "N/A",
            instructorEmail: "N/A",
            className: "Geral"
          }}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};

export default Index;
