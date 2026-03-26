import { LoadingSpinner } from '@/components/LoadingSpinner';

const LoadingPage = () => {
  return (
    <div
      role="status"
      className="flex min-h-screen w-screen items-center justify-center text-center"
    >
      <LoadingSpinner />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingPage;
