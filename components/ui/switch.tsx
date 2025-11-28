'use client';

import { Switch as HeadlessSwitch } from '@headlessui/react';

export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Switch = ({ checked = false, onChange, disabled, className }: SwitchProps) => {
  return (
    <HeadlessSwitch
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={`
        group relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent
        transition-colors duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-secondary
        disabled:cursor-not-allowed disabled:opacity-50
        bg-bg-tertiary data-[checked]:bg-accent
        ${className || ''}
      `}
    >
      <span 
        className="pointer-events-none block h-5 w-5 translate-x-1 rounded-full bg-white shadow-lg ring-0 transition-transform duration-300 ease-in-out group-data-[checked]:translate-x-6"
      />
    </HeadlessSwitch>
  );
};
