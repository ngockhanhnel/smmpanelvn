import { motion } from 'motion/react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      className={`border-t-brand-cyan border-r-transparent border-b-transparent border-l-brand-primary rounded-full inline-block ${sizeClasses[size]} ${className}`}
      style={{ borderStyle: 'solid' }}
    />
  );
}
