import { ComponentPropsWithoutRef, ReactNode, useId } from 'react';
import { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  rightElement?: ReactNode;
}

export default function Input({
  label,
  icon: Icon,
  error,
  rightElement,
  className = '',
  ...props
}: InputProps) {
  const id = useId();

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <div className="flex justify-between items-center px-0.5">
        <label
          htmlFor={id}
          className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wider"
        >
          {label}
        </label>
      </div>

      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-3.5 text-gray-400 group-focus-within:text-brand-primary transition-colors pointer-events-none">
            <Icon size={18} />
          </div>
        )}

        <input
          id={id}
          className={`w-full bg-[#12141A] text-white text-sm font-medium rounded-xl leading-relaxed py-3.5 transition-all outline-none border hover:border-gray-700/60 focus:border-brand-primary placeholder:text-gray-600
            ${Icon ? 'pl-11' : 'pl-4'}
            ${rightElement ? 'pr-12' : 'pr-4'}
            ${
              error
                ? 'border-brand-danger/60 focus:border-brand-danger shadow-[0_0_12px_rgba(255,71,87,0.08)]'
                : 'border-brand-border/60 focus:shadow-[0_0_12px_rgba(108,99,255,0.08)]'
            }`}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3.5 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>

      {/* Error text animate height slide */}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 3 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="text-xs font-medium text-brand-danger px-0.5 flex items-center h-4"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
