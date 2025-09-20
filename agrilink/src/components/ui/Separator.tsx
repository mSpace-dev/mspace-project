import React from 'react';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const Separator: React.FC<SeparatorProps> = ({ 
  orientation = 'horizontal', 
  className = '' 
}) => {
  const baseClasses = orientation === 'horizontal' 
    ? 'h-px w-full' 
    : 'w-px h-full';
  
  return (
    <div 
      className={`${baseClasses} bg-gray-200 ${className}`}
      role="separator"
      aria-orientation={orientation}
    />
  );
};

export default Separator;
