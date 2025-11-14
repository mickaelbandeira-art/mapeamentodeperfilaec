import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { questions, Question } from "@/data/questions";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { WaveBackground } from "./WaveBackground";

interface QuizScreenProps {
  onComplete: (scores: { D: number; I: number; S: number; C: number }) => void;
  participantData: {
    registration: string;
    name: string;
    email: string;
  };
}

export const QuizScreen = ({ onComplete, participantData }: QuizScreenProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({ D: 0, I: 0, S: 0, C: 0 });
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(new Array(questions.length).fill(""));

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  const handleAnswer = (type: 'D' | 'I' | 'S' | 'C', optionIndex: number) => {
    // Update selected answer
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = `${currentQuestion}-${optionIndex}`;
    setSelectedAnswers(newAnswers);

    // Update scores
    const newScores = { ...scores };
    newScores[type]++;
    setScores(newScores);

    // Move to next question or complete
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      setTimeout(() => {
        onComplete(newScores);
      }, 500);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <WaveBackground />
      
      <div className="max-w-3xl w-full space-y-6 relative z-10 animate-fade-in">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>Pergunta {currentQuestion + 1} de {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="p-6 sm:p-8 md:p-10 glass-card shadow-2xl animate-slide-in">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-gradient-primary">
            {question.text}
          </h2>

          <div className="space-y-3 sm:space-y-4">
            {question.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(option.type, index)}
                variant="outline"
                className="w-full text-left justify-start h-auto p-4 sm:p-5 text-base sm:text-lg glass-card-hover hover:border-purple-500 transition-all duration-300 hover:scale-[1.02]"
              >
                <span className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center font-bold text-purple-400">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option.text}</span>
                </span>
              </Button>
            ))}
          </div>

          {currentQuestion > 0 && (
            <Button
              onClick={handlePrevious}
              variant="ghost"
              className="mt-6 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Pergunta Anterior
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
};
