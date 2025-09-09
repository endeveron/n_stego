'use client';

import { RESET_TIMEOUT } from '@/core/features/steganography/constants';
import { useEffect, useState } from 'react';

interface CountdownProps {
  seconds?: number;
}

const Countdown = ({ seconds }: CountdownProps) => {
  const [counter, setCounter] = useState(seconds ?? RESET_TIMEOUT / 1000);

  useEffect(() => {
    const timeout = setInterval(() => {
      if (counter === 0) {
        clearInterval(timeout);
        return;
      }
      setCounter((prev) => prev - 1);
    }, 1000);

    return () => {
      clearInterval(timeout);
    };
  }, [counter]);

  if (counter === 0) return null;

  return (
    <div className="w-8 h-8 flex-center text-xs text-title font-extrabold rounded-full bg-card trans-c cursor-default">
      {counter}
    </div>
  );
};

export default Countdown;
