interface DotPatternProps {
  position: 'top-right' | 'bottom-left';
}

export const DotPattern = ({ position }: DotPatternProps) => {
  const positionClasses = position === 'top-right'
    ? 'top-0 right-0'
    : 'bottom-0 left-0';

  return (
    <div className={`absolute ${positionClasses} w-64 h-64 opacity-40 pointer-events-none z-0`}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`dots-${position}`} x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
            <rect width="3" height="3" fill="var(--primary)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dots-${position})`} />
      </svg>
    </div>
  );
};
