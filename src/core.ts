import { useCallback, useEffect, useRef } from 'react';

interface BlankFn {
  (): void;
}

interface RenderFrameFn {
  (cb: BlankFn): FrameRequestCallback;
}

export const useAnimationFrame = <T>(
  callback: (...args: T[]) => void,
  wait: number,
): BlankFn => {
  const rafId = useRef(0);
  const rafStart = useRef(0);

  const renderFrame = useCallback<RenderFrameFn>(
    (cb) => (timeNow) => {
      if (rafStart.current === 0) rafStart.current = timeNow;

      // Call next rAF if time is not up
      if (timeNow - rafStart.current < wait) {
        rafId.current = requestAnimationFrame(renderFrame(cb));
        return;
      }

      cb();
    },
    [wait],
  );

  // Call cancel animation after umount
  useEffect(() => () => cancelAnimationFrame(rafId.current), []);

  return useCallback(
    (...args: T[]) => {
      // Reset previous animation before strart new animation
      cancelAnimationFrame(rafId.current);
      rafStart.current = 0;

      rafId.current = requestAnimationFrame(
        renderFrame(() => {
          callback(...args);
        }),
      );
    },
    [callback, renderFrame],
  );
};
