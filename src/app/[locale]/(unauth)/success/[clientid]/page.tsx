import SuccessSection from '@/components/landingPage/SuccessSection';

export default function SuccessPage({ params }: { params: any }) {
  return <SuccessSection clientid={params.clientid} />;
}
