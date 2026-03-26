'use client';

import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import React from 'react';

import { Button } from '@/components/ui/button';

const LogoutButton = ({ buttonText }: { buttonText: string }) => {
  const router = useRouter();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect to home page or login page after successful logout
      router.push('/');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error logging out:', error);
    }
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleLogout}>
      {buttonText}
    </Button>
  );
};

export default LogoutButton;
