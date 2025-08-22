import { useCallback } from "react";

type KeyboardHandler = (e: React.KeyboardEvent<HTMLElement>) => number | void;

type UseKeyBoardManagerParams = {
  handler: KeyboardHandler;
  deps?: unknown[];
};

export default function useKeyBoardManager({ handler, deps = [] }: UseKeyBoardManagerParams) {
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      const result = handler(e);

      if (result === 0) {
        e.preventDefault();
        e.stopPropagation();
      } else if (result === 1) {
        e.preventDefault();
      } else if (result === 2) {
        e.stopPropagation();
      }
    },
    deps
  );

  // Trả ra props để bạn spread vào element
  return { onKeyDown };
}
