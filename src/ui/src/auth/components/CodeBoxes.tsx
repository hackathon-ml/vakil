import { useEffect, useRef, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from 'react';
import { useThemeParams } from '../useThemeParams';

const LENGTH = 6;

interface CodeBoxesProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
}

export function CodeBoxes({ value, onChange, error = false, disabled = false }: CodeBoxesProps) {
  const theme = useThemeParams();
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.split('').concat(Array(LENGTH).fill('')).slice(0, LENGTH);

  useEffect(() => {
    if (!error) return;
    refs.current[0]?.focus();
  }, [error]);

  function focusAt(index: number) {
    const next = Math.max(0, Math.min(LENGTH - 1, index));
    refs.current[next]?.focus();
    refs.current[next]?.select();
  }

  function handleChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const nextDigit = event.target.value.replace(/\D/g, '').slice(-1);
    const next = digits.slice();
    next[index] = nextDigit;
    const joined = next.join('').slice(0, LENGTH);
    onChange(joined);
    if (nextDigit) {
      focusAt(index + 1);
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index]) {
      event.preventDefault();
      const next = digits.slice();
      next[index - 1] = '';
      onChange(next.join('').replace(/\s/g, ''));
      focusAt(index - 1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusAt(index - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusAt(index + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    onChange(pasted);
    focusAt(Math.min(pasted.length, LENGTH - 1));
  }

  return (
    <div className={`auth-code-boxes${error ? ' auth-code-boxes--error' : ''}`}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          className="auth-code-box"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.currentTarget.select()}
          style={{
            color: theme.textColor,
            backgroundColor: theme.sectionBgColor ?? theme.bgColor,
            borderColor: error
              ? theme.destructiveTextColor
              : theme.hintColor,
          }}
        />
      ))}
    </div>
  );
}
