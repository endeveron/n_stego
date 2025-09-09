import { APP_NAME } from '@/core/constants';

const CardLogo = () => {
  return (
    <div className="relative w-full flex justify-center">
      <div className="absolute -top-20 text-5xl text-muted/20 leading-0 font-black dark:text-title/70 trans-c">
        {APP_NAME}
      </div>
    </div>
  );
};

export default CardLogo;
