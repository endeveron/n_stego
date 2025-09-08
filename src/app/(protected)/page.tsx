import { redirect } from 'next/navigation';

import { SIGNIN_REDIRECT } from '@/core/constants';
import SecretEmbedder from '@/core/features/steganography/components/SecretEmbedder';
import SecretExtractor from '@/core/features/steganography/components/SecretExtractor';
import { auth } from '~/auth';

export default async function MainPage() {
  const session = await auth();
  if (!session?.user) return redirect(SIGNIN_REDIRECT);

  return (
    <main className="w-full lg:flex justify-center p-4">
      <div className="flex-center flex-1 lg:max-w-lg py-16 lg:py-8">
        <SecretEmbedder />
      </div>
      <div className="flex-center flex-1 lg:max-w-lg pb-16 lg:pb-8 pt-4">
        <SecretExtractor />
      </div>
    </main>
  );
}
