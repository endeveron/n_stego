import { redirect } from 'next/navigation';

import MainMenu from '@/core/components/ui/MainMenu';
import { APP_NAME, SIGNIN_REDIRECT } from '@/core/constants';
import TextEmbedder from '@/core/features/steganography/components/TextEmbedder';
import TextExtractor from '@/core/features/steganography/components/TextExtractor';
import { auth } from '~/auth';

export default async function MainPage() {
  const session = await auth();
  if (!session?.user) return redirect(SIGNIN_REDIRECT);

  return (
    <>
      {/* Header */}
      <div className="fixed z-10 top-6 left-6 flex">
        <MainMenu
          userData={{ name: session.user.name, email: session.user.email }}
        />
        <div className="ml-6 -mt-2 lg:-mt-3 cursor-default">
          <h1 className="font-black text-title dark:text-title/70 trans-c">
            {APP_NAME}
          </h1>
          <p className="relative z-20 mt-0 text-xs text-muted leading-3 bg-background lg:mt-1 lg:text-sm trans-c">
            Safe embed in image
          </p>
        </div>
      </div>

      <main className="relative h-full min-w-xs w-full m-auto lg:flex lg:justify-center p-4 py-28">
        <div className="flex-center flex-1 lg:max-w-lg py-8 lg:py-8">
          <TextEmbedder />
        </div>
        <div className="flex-center flex-1 lg:max-w-lg pb-8 lg:pb-8 pt-4">
          <TextExtractor />
        </div>
      </main>
    </>
  );
}
