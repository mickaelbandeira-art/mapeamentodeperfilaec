import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { questions as discQuestions } from "@/data/questions";
import { mindsetQuestions } from "@/data/mindset_questions";
import { vacQuestions } from "@/data/vac_questions";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { WaveBackground } from "./WaveBackground";

interface QuizScreenProps {
  type: 'DISC' | 'Mindset' | 'VAC';
  onComplete: (result: any) => void;
  participantData: {
    registration: string;
    name: string;
    email: string;
    cpf: string;
  };
}

export const QuizScreen = ({ type, onComplete, participantData }: QuizScreenProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Get the correct questions based on type
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
    
    // For Mindset and VAC, return the type with the highest score
    const entries = Object.entries(finalScores);
    if (entries.length === 0) return "N/A";
    
    return entries.sort((a: any, b: any) => b[1] - a[1])[0][0];
  };

  const handleAnswer = (answerType: string) => {
    const newScores = { ...scores };
    newScores[answerType] = (newScores[answerType] || 0) + 1;
    setScores(newScores);

    if (currentQuestion < currentQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      setTimeout(() => {
        onComplete(calculateFinalResult(newScores));
      }, 500);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0A0A0B]">
      <WaveBackground />

      <div className="max-w-3xl w-full space-y-6 relative z-10 animate-fade-in">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-purple-400 font-medium mb-1 tracking-wider uppercase text-xs">Mapeamento {type}</p>
              <h3 className="text-white text-xl font-bold">Pergunta {currentQuestion + 1} de {currentQuestions.length}</h3>
            </div>
            <span className="text-gray-400 text-sm font-medium">{Math.round(progress)}% concluído</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Card className="p-8 sm:p-10 glass-card border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-3xl -mr-16 -mt-16 group-hover:bg-purple-600/20 transition-colors duration-700" />
          
          <h2 className="text-2xl sm:text-3xl font-bold mb-10 text-white leading-tight relative z-10">
            {question.text}
          </h2>

          <div className="space-y-4 relative z-10">
            {question.options.map((option: any, index: number) => (
              <Button
                key={index}
                onClick={() => handleAnswer(option.type)}
                variant="outline"
                className="w-full text-left justify-start h-auto p-5 text-lg bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/50 hover:text-white transition-all duration-300 group/btn"
              >
                <div className="flex items-center gap-4 w-full">
                  <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center font-bold text-purple-400 group-hover/btn:bg-purple-600 group-hover/btn:text-white transition-all duration-300">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 text-gray-300 group-hover/btn:text-white">{option.text}</span>
                </div>
              </Button>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="ghost"
              className="text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            
            <div className="flex gap-1">
              {[...Array(currentQuestions.length)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === currentQuestion ? 'bg-purple-500 scale-125' : 
                    i < currentQuestion ? 'bg-purple-500/40' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
