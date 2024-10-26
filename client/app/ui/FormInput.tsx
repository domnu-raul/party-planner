// FormInput.tsx
import React, { useState } from 'react';
import VisibilityButton from './VisibilityButton';

interface InputProps {
  type?: string;
  name: string;
  placeholder?: string; 
  value: string; 
  className?: string; 
  onChange: (value: string) => void; 
}

const FormInput: React.FC<InputProps> = ({
  type = 'text', 
  name,
  placeholder,
  value,
  className = '',
  onChange,
}) => {
  const isPassword = type === 'password';
  const [viewPassword, setViewPassword] = useState(false);

  const inputType = isPassword && !viewPassword ? 'password' : 'text';

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const handleToggleVisibility = () => {
    setViewPassword(prev => !prev);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type={inputType}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={handleInputChange}
        className="w-full pr-14 bg-stone-50 px-3 py-5 rounded-lg placeholder:text-gray-400 placeholder:font-roboto placeholder:text-xl caret-slate-900 text-slate-900 text-xl"
        id={name}
      />
      {isPassword && (
        <VisibilityButton 
          isVisible={viewPassword} 
          onToggle={handleToggleVisibility} 
          id={name} 
        />
      )}
    </div>
  );
};

export default FormInput;

