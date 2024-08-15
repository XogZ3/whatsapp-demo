import React, { useEffect, useRef, useState } from 'react';

import { cn } from '@/libs/utils';

import { Label } from './ui/label';

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('flex flex-col space-y-2 w-full', className)}>
      {children}
    </div>
  );
};

export interface DropdownProps {
  label: string;
  className?: string;
  options: string[];
  selectedOption: any;
  onSelectOption: (option: string) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  className,
  options,
  selectedOption,
  onSelectOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (option: string) => {
    onSelectOption(option);
    setIsOpen(false); // Close the dropdown after selecting an option
  };

  return (
    <LabelInputContainer className={cn(className)}>
      <Label htmlFor="type">{label}</Label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className={cn(
            'flex items-center justify-between w-full rounded-md border text-sm border-gray-300 bg-white px-3 py-2.5 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white',
            isOpen && 'rounded-b-none',
          )}
          onClick={toggleDropdown}
        >
          <span>{selectedOption || options[0]}</span>
          <svg
            className={cn(
              'h-5 w-5 text-gray-400',
              isOpen && 'rotate-180 transform',
            )}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute z-10 mt-1 h-40 w-full overflow-y-auto rounded-md bg-white shadow-lg dark:bg-zinc-800">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-200 dark:hover:bg-zinc-700"
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </LabelInputContainer>
  );
};
