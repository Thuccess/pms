import { useState } from "react";

export function useModalState<T = null>(initialValue: T | null = null) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<T | null>(initialValue);

  const open = (value?: T) => {
    if (value !== undefined) {
      setSelected(value);
    }
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  const clear = () => {
    setSelected(null);
    setIsOpen(false);
  };

  return { isOpen, selected, setSelected, open, close, clear };
}
