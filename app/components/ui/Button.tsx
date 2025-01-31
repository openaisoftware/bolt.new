import { type ButtonHTMLAttributes } from 'react';
import { classNames } from '~/utils/classNames';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={classNames(
        'px-4 py-2 text-sm rounded-md transition-colors duration-200',
        {
          'bg-bolt-elements-background-depth-3 hover:bg-bolt-elements-background-depth-4 disabled:opacity-50':
            variant === 'primary',
          'bg-bolt-elements-background-depth-1 hover:bg-bolt-elements-background-depth-3': variant === 'secondary',
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
} 