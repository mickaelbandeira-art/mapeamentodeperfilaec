import { useState } from "react";
import { Card } from "@/components/ui/card";
import { questions as discQuestions } from "@/data/questions";
import { mindsetQuestions } from "@/data/mindset_questions";
import { vacQuestions } from "@/data/vac_questions";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";

interface QuizScreenProps {
  type: 'DISC' | 'Mindset' | 'VAC';
  onComplete: (result: any) => void;
  participantData: {
    registration: string;
    name: string;
    email?: string;
    cpf: string;
  };
}

export const QuizScreen = ({ type, onComplete, participantData }: QuizScreenProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const getQuestions = () => {
    switch (type) {
      case 'Mindset': return mindsetQuestions;
      case 'VAC': return vacQuestions;
      default: return discQuestions;
    }
  };

  const currentQuestions = getQuestions();
  const [scores, setScores] = useState<any>(
    type === 'DISC' ? { D: 0, I: 0, S: 0, C: 0 } : {}
  );

  const progress = ((currentQuestion + 1) / currentQuestions.length) * 100;
  const question = currentQuestions[currentQuestion];

  const calculateFinalResult = (finalScores: any) => {
    if (type === 'DISC') return finalScores;
    const entries = Object.entries(finalScores);
    if (entries.length === 0) return "N/A";
    return entries.sort((a: any, b: any) => (b[1] as number) - (a[1] as number))[0][0];
  };

  const handleAnswer = (answerType: string) => {
    if (isTransitioning) return;

    const newScores = { ...scores };
    newScores[answerType] = (newScores[answerType] || 0) + 1;
    setScores(newScores);
    setIsTransitioning(true);

    if (currentQuestion < currentQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setIsTransitioning(false);
      }, 400);
    } else {
      setTimeout(() => {
        onComplete(calculateFinalResult(newScores));
      }, 600);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0 && !isTransitioning) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background font-sans overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
        <div className="absolute top-0 left-0 text-[20vw] font-black leading-none select-none uppercase italic">
          {type}
        </div>
        <div className="absolute bottom-0 right-0 text-[20vw] font-black leading-none select-none uppercase italic">
          STEP.{currentQuestion + 1}
        </div>
      </div>

      <div className="max-w-4xl w-full relative z-10 animate-fade-in border-4 border-foreground bg-background shadow-[15px_15px_0px_var(--primary)]">
        {/* Progress Tape */}
        <div className="bg-foreground text-background h-12 flex items-center overflow-hidden border-b-4 border-foreground relative">
          <div
            className="h-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-6 mix-blend-difference font-black text-xs uppercase italic tracking-widest text-background">
            <span>Progress // {Math.round(progress)}%</span>
            <span>AEC // ASSESSMENT_UNIT // v2.0</span>
          </div>
        </div>

        <div className="p-8 md:p-16">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Question Counter Card */}
            <div className="md:w-1/4">
              <div className="border-4 border-foreground p-6 brutal-card bg-secondary/10 rotate-[-3deg] shadow-sm">
                <p className="font-black text-[10px] uppercase opacity-50 mb-1">Question</p>
                <div className="text-6xl font-black italic leading-none">
                  {String(currentQuestion + 1).padStart(2, '0')}
                </div>
                <div className="mt-4 pt-4 border-t-4 border-foreground flex justify-between items-center">
                  <span className="font-black text-[10px] uppercase">Of {currentQuestions.length}</span>
                  <div className="w-3 h-3 bg-primary animate-pulse" />
                </div>
              </div>

              <div className="mt-12 hidden md:block">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0 || isTransitioning}
                  className="w-full border-4 border-foreground p-4 font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-foreground hover:text-background transition-colors disabled:opacity-20 translate-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
              </div>
            </div>

            {/* Question Content */}
            <div className={`flex-1 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <div className="mb-4">
                <span className="bg-foreground text-background px-3 py-1 text-[10px] font-black uppercase tracking-tighter italic">
                  Critical Assessment // {type}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-[0.9] uppercase italic mb-12 tracking-tighter">
                {question.text}
              </h2>

              <div className="grid gap-4">
                {question.options.map((option: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option.type)}
                    disabled={isTransitioning}
                    className="group relative w-full text-left border-4 border-foreground p-6 bg-background hover:bg-primary transition-all duration-200 shadow-[8px_8px_0px_var(--foreground)] hover:shadow-[4px_4px_0px_var(--foreground)] hover:translate-x-1 hover:translate-y-1 active:shadow-none active:translate-x-2 active:translate-y-2 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-6">
                      <span className="text-4xl font-black italic opacity-20 group-hover:opacity-100 transition-opacity">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="font-black text-lg md:text-xl uppercase leading-none group-hover:text-primary-foreground">
                        {option.text}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Ribbon */}
        <div className="border-t-4 border-foreground p-4 flex justify-between items-center bg-foreground/5 overflow-hidden">
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-tighter">
            <span className="text-primary italic">Live Session</span>
            <span className="opacity-30 self-center">•</span>
            <span>User: {participantData.name.split(' ')[0]}</span>
          </div>
          <div className="flex gap-1">
            {isTransitioning ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
