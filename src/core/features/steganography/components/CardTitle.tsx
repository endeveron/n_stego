import { PropsWithChildren } from 'react';

const CardTitle = ({ children }: PropsWithChildren) => {
  return (
    <div className="absolute -top-4.5 text-5xl text-muted/20 dark:text-muted/30 leading-0 font-black cursor-default trans-c">
      {children}
    </div>
  );
};

export default CardTitle;
