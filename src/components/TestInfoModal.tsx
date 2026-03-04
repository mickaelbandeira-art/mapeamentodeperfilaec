import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Brain, Zap, MessageSquare, Sparkles, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TestType = 'DISC' | 'Mindset' | 'VAC' | 'AI';

interface TestInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: TestType;
}

const testContent = {
  DISC: {
    title: 'Análise DISC',
    subtitle: 'Perfil Comportamental',
    icon: Zap,
    description: 'Ferramenta de análise de perfil comportamental baseada em Dominância, Influência, Estabilidade e Conformidade. Identifica como você age, reage e se comunica em diferentes situações e ambientes.',
    color: 'var(--primary)',
  },
  Mindset: {
    title: 'Mindset',
    subtitle: 'Mentalidade de Sucesso',
    icon: Brain,
    description: 'Avalia sua mentalidade em relação aos desafios: Fixa (crê em talentos imutáveis) ou de Crescimento (crê que habilidades podem ser desenvolvidas através de esforço e aprendizado).',
    color: 'var(--primary)',
  },
  VAC: {
    title: 'Canal VAC',
    subtitle: 'Estilos de Comunicação',
    icon: MessageSquare,
    description: 'Identifica seu canal predominante de comunicação e aprendizado: Visual (vê), Auditivo (ouve) ou Cinestésico (sente/faz). Essencial para otimizar sua interação com o mundo.',
    color: 'var(--primary)',
  },
  AI: {
    title: 'AI Consultiva',
    subtitle: 'Inteligência Estratégica',
    icon: Sparkles,
    description: 'Nossa Inteligência Artificial cruza seus dados de DISC, Mindset e VAC para gerar um plano de ação estratégico, personalizado e consultivo para sua jornada na AeC.',
    color: 'var(--secondary)',
  },
};

export const TestInfoModal = ({ isOpen, onClose, onConfirm, type }: TestInfoModalProps) => {
  const content = testContent[type];
  const Icon = content.icon;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] p-0 outline-none animate-in zoom-in-95 fade-in duration-300">
          <div className="relative border-4 border-foreground bg-background shadow-[20px_20px_0px_var(--foreground)] overflow-hidden">
            {/* Background Label */}
            <div className="absolute top-0 right-0 text-[12vw] font-black italic opacity-5 pointer-events-none select-none -mr-8 -mt-8 uppercase">
              {type}
            </div>

            {/* Header / Ribbon */}
            <div className="bg-foreground text-background px-6 py-2 flex justify-between items-center border-b-4 border-foreground">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">AEC // ASSESSMENT // INFO</span>
              <button 
                onClick={onClose}
                className="hover:rotate-90 transition-transform p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Icon Box */}
                <div 
                  className="w-24 h-24 shrink-0 border-4 border-foreground flex items-center justify-center bg-background shadow-[8px_8px_0px_var(--foreground)]"
                  style={{ borderColor: 'var(--foreground)' }}
                >
                  <Icon className="w-12 h-12" style={{ color: content.color }} />
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-4xl md:text-6xl font-black uppercase italic leading-[0.8] tracking-tighter">
                      {content.title}
                    </h2>
                    <p className="text-primary font-black uppercase text-sm mt-2 tracking-widest">
                      {content.subtitle}
                    </p>
                  </div>

                  <div className="pt-4 border-t-2 border-foreground/10">
                    <p className="text-lg font-bold leading-tight uppercase opacity-80">
                      {content.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-12 flex justify-end">
                <button
                  onClick={onConfirm}
                  className="group relative bg-foreground text-background px-8 py-4 font-black text-xl uppercase italic flex items-center gap-4 hover:bg-primary hover:text-primary-foreground transition-all shadow-[8px_8px_0px_var(--secondary)] active:shadow-none active:translate-x-1 active:translate-y-1"
                >
                  ESTOU PRONTO
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>

            {/* Bottom Meta */}
            <div className="bg-secondary/10 px-6 py-2 border-t-2 border-foreground/10 text-[10px] font-black uppercase opacity-40">
              PRÓXIMA ETAPA: {content.title} // CARREGANDO MÓDULO...
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
