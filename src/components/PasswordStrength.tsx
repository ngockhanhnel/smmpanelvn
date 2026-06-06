import { useMemo } from 'react';

interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const info = useMemo(() => {
    if (!password) {
      return { score: 0, text: '', color: 'bg-transparent', textColor: 'text-gray-500' };
    }
    if (password.length < 5) {
      return { score: 1, text: 'Very Weak', color: 'bg-brand-danger', textColor: 'text-brand-danger' };
    }
    
    // Check strength parameters
    let score = 1;
    const hasLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const hasUpperAndLower = /[a-z]/.test(password) && /[A-Z]/.test(password);

    if (hasLength) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;
    if (hasUpperAndLower) score += 1;

    // Map score to rating
    if (score <= 2) {
      return { score: 2, text: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-500' };
    } else if (score <= 4) {
      return { score: 3, text: 'Medium', color: 'bg-brand-warning', textColor: 'text-brand-warning' };
    } else {
      return { score: 4, text: 'Strong', color: 'bg-brand-success', textColor: 'text-brand-success' };
    }
  }, [password]);

  if (!password) return null;

  return (
    <div className="flex flex-col gap-1.5 w-full mt-1 px-0.5">
      <div className="flex justify-between items-center text-[11px] font-semibold tracking-wide">
        <span className="text-brand-text-secondary">Password Security:</span>
        <span className={info.textColor}>{info.text}</span>
      </div>
      <div className="h-1.5 w-full bg-[#12141A] rounded-full overflow-hidden flex gap-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${info.color}`}
          style={{ width: `${(info.score / 4) * 100}%` }}
        />
      </div>
    </div>
  );
}
