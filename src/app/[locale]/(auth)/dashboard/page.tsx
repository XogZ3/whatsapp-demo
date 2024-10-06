'use client';

import { type User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Container, Section } from '@/components/GeneralContainers';
import { auth } from '@/modules/firebase/FirebaseConfig';

import LoadingPage from '../../loading';
import WhatsAppMessagesUI from './wamsg';

export default function ChatsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null); // Define the type explicitly
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr: any) => {
      if (usr) {
        setUser(usr);
      } else {
        // setUser(null);
        router.push('/sign-in');
      }
    });
    return () => unsubscribe();
  }, [router]);

  return user ? (
    <Section>
      <Container noYPadding>
        <WhatsAppMessagesUI />
      </Container>
    </Section>
  ) : (
    <LoadingPage />
  );
}
