import { redirect } from 'next/navigation';

import { SIGNIN_REDIRECT } from '@/core/constants';
// import { getUserIdByEmail } from '@/core/features/auth/actions';

import { auth } from '~/auth';
import SecretEmbedder from '@/core/features/steganography/components/SecretEmbedder';

export default async function MainPage() {
  const session = await auth();
  if (!session?.user) return redirect(SIGNIN_REDIRECT);

  // const userId = session.user.id!;
  // const userEmail = session.user.email;

  // Handle case if the user id provided by google
  // if (userId.length !== 24) {
  //   const res = await getUserIdByEmail(userEmail);
  //   if (!res?.success || !res.data) {
  //     throw new Error('Could not retrieve user id.');
  //   }
  //   userId = res.data;
  // }

  return (
    <main className="flex-center flex-col">
      <SecretEmbedder />
    </main>
  );
}
