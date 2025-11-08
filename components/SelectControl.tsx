import React from 'react';
import { ChevronDownIcon } from './icons';

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectControlProps<T extends string> {
  label: string;
  value: T;
  options: Readonly<SelectOption<T>[]>;
  onChange: (value: T) => void;
  icon?: React.ReactNode;
}

const SelectControl = <T extends string,>({ label, value, options, onChange, icon }: SelectControlProps<T>) => {
  return (
    <div>
      <label className="flex items-center text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
        {icon && <span className="mr-2 h-5 w-5">{icon}</span>}
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="w-full appearance-none bg-[rgb(var(--color-subtle))] border border-[rgb(var(--color-subtle))] text-white rounded-lg p-2.5 pr-8 focus:ring-2 focus:ring-[rgb(var(--color-accent))] focus:border-[rgb(var(--color-accent))] transition"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-[rgb(var(--color-surface))]">
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[rgb(var(--color-muted))]">
          <ChevronDownIcon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

export default SelectControl;