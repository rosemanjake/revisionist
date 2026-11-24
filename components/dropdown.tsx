import React, { useEffect, useRef, useState } from 'react';
import { useInputContext } from '@/context/inputcontext';
import styles from '@/styles/Dropdown.module.css';

interface DropdownProps<T extends string = string> {
  options: readonly T[];
  onChange: (option: T) => void;
  defaultValue: T;
  className?: string;
  activeOption: T;
}

export default function Dropdown<T extends string = string>({
  options,
  onChange,
  defaultValue,
  className,
  activeOption,
}: DropdownProps<T>): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selection, setSelection] = useState<string>(defaultValue);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { activeTab } = useInputContext();

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent): void {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    setSelection(activeTab);
    setIsOpen(false);
  }, [activeTab]);

  function handleToggle(): void {
    setIsOpen((prev) => !prev);
  }

  function handleSelect(event: React.MouseEvent<HTMLDivElement>, option: T): void {
    event.stopPropagation();
    onChange(option);
    setSelection(option);
    setIsOpen(false);
  }

  const rootClassName = className ? `${styles.dropdown} ${className}` : styles.dropdown;

  return (
    <div ref={dropdownRef} className={rootClassName} onClick={handleToggle}>
      <div className={`${styles.dropdownToggle} ${isOpen ? styles.open : ''}`}>
        {selection}
      </div>
      <div className={isOpen ? styles.arrowOpen : styles.arrow} />
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {options.map((option) => (
            <div
              key={option}
              className={
                activeOption === option ? styles.dropdownOptionActive : styles.dropdownOption
              }
              onClick={(event) => handleSelect(event, option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
