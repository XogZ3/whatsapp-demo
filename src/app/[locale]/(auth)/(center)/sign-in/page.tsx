'use client';

import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword, type User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';

import {
  ErrorMessage,
  LabelInputContainer,
} from '@/components/GeneralContainers';
import { Spinner } from '@/components/Spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/modules/firebase/FirebaseConfig';
import { validateSignInData } from '@/utils/validation';

export default function Component() {
  const router = useRouter();
  const [, setUser] = useState<User | null>(null); // Define the type explicitly
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setErrors({});
  }, []);

  useEffect(() => {
    if (email) {
      setErrors((prevErrors) => ({ ...prevErrors, email: '' }));
    }
  }, [email]);

  useEffect(() => {
    if (password) {
      setErrors((prevErrors) => ({ ...prevErrors, password: '' }));
    }
  }, [password]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr: any) => {
      if (usr) {
        setUser(usr);
        // console.log('User logged in: ', usr.email, usr.name);
        router.push('/dashboard');
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignIn = async () => {
    const signInErrors = validateSignInData(email, password);
    if (Object.keys(signInErrors).length > 0) {
      setErrors(signInErrors);
      return;
    }
    if (Object.keys(signInErrors).length === 0) {
      try {
        setIsSubmitting(true);
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const { user } = userCredential;
        const userEmail = user.email;

        const tenantEmail = process.env.NEXT_PUBLIC_TENANT;

        if (tenantEmail !== 'admin@svdroptaxi.com') {
          if (userEmail !== tenantEmail) {
            // User doesn't belong to this tenant
            toast({
              title: 'Error',
              description: "You don't have access to this application.",
            });
            await auth.signOut();
            setIsSubmitting(false);
            return;
          }
        }

        setEmail('');
        setPassword('');
        setIsSubmitting(false);
      } catch (error) {
        setIsSubmitting(false);
        if (
          error instanceof FirebaseError &&
          error.code === 'auth/wrong-password'
        ) {
          setErrors({ password: 'Incorrect password' });
        }
        if (
          error instanceof FirebaseError &&
          error.code === 'auth/user-not-found'
        ) {
          setErrors({ email: 'Incorrect email' });
        }
        // console.error('Error signing in: ', error);
      }
    }
  };
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSignIn();
  };

  return (
    <section
      id="sign-in"
      className="flex h-screen w-full items-center justify-center"
    >
      <div className="mx-auto max-w-[400px] space-y-6 py-12">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="me@example.com"
              required
              type="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              maxLength={30}
            />
            {errors.email && <ErrorMessage message={errors.email} />}
          </LabelInputContainer>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              required
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <ErrorMessage message={errors.password} />}
          </div>
          <button
            className="group/btn relative flex w-full items-center justify-center rounded-md bg-gradient-to-br from-cyan-500 to-blue-500 px-4 py-2 font-medium text-white shadow-md shadow-cyan-500/30 transition duration-300 hover:bg-gradient-to-tl hover:shadow-lg hover:shadow-blue-500/30 dark:from-cyan-600 dark:to-blue-600 dark:shadow-cyan-700/30"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex flex-row items-center justify-center gap-2">
                <Spinner />
                Signing in...
              </div>
            ) : (
              'Sign in →'
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
