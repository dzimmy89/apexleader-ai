import { useRef } from "react";

/** Arrow, Home, and End keys for a `role="radiogroup"` of buttons with a roving tabindex. */
export function useRadioKeys<T extends string>(
  ids: readonly T[],
  value: T,
  onChange: (id: T) => void
) {
  const buttons = useRef(new Map<T, HTMLButtonElement>());

  const onKeyDown = (event: React.KeyboardEvent) => {
    const index = ids.indexOf(value);
    let next: number;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = (index + 1) % ids.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = (index - 1 + ids.length) % ids.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = ids.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const id = ids[next];
    if (id === undefined) return;
    onChange(id);
    buttons.current.get(id)?.focus();
  };

  const register = (id: T) => (el: HTMLButtonElement | null) => {
    if (el) buttons.current.set(id, el);
    else buttons.current.delete(id);
  };

  return { onKeyDown, register };
}
