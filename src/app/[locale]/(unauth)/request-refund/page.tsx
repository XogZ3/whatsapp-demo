// 'use client';

// import { AnimatePresence, motion } from 'framer-motion';
// import type { E164Number } from 'libphonenumber-js';
// import Link from 'next/link';
// import { useEffect, useState } from 'react';
// import Balancer from 'react-wrap-balancer';

// import { Container } from '@/components/GeneralContainers';
// import { PhoneInputShadcnUiPhoneInput } from '@/components/phone-input';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import { DotPattern } from '@/components/ui/magicui/dot';
// import { cn } from '@/libs/utils';
// import { CheckIcon } from 'lucide-react';
// import { useTranslations } from 'next-intl';

// export default function RequestRefundPage() {
//   const t = useTranslations('RequestRefund');
//   const [phoneNumber, setPhoneNumber] = useState<E164Number>();
//   const [subscriptionId, setSubscriptionId] = useState('');
//   const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');
//   const [cancellationStatus, setCancellationStatus] = useState(false);

//   // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   //   setPhone(e.target.value);
//   // };

//   useEffect(() => {
//     if (message === 'Subscription successfully canceled.')
//       setCancellationStatus(true);
//   }, [message]);

//   const getSubscription = async (clientid: any) => {
//     setLoading(true);
//     try {
//       const response = await fetch(
//         `/api/stripe/getSubscription?clientid=${clientid.replace('+', '')}`,
//       );
//       if (!response.ok) throw new Error('Failed to fetch subscription info');

//       const data = await response.json();
//       setSubscriptionId(data.subscriptionId);
//       setSubscriptionInfo(data);
//     } catch (error) {
//       console.error('Error fetching subscription:', error);
//       setMessage('Failed to retrieve subscription info.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const cancelSubscription = async () => {
//     if (!subscriptionId) {
//       setMessage('No subscription ID available.');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await fetch('/api/stripe/cancelSubscription', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ subscriptionId }),
//       });

//       if (!response.ok) throw new Error('Failed to cancel subscription');

//       const data = await response.json();
//       console.log('[!] cancellation res: ', JSON.stringify(data, null, 2));
//       setMessage('Subscription successfully canceled.');
//     } catch (error) {
//       console.error('Error canceling subscription:', error);
//       setMessage('Failed to cancel subscription.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-[calc(100vh-3.5rem)] w-full items-center justify-center">
//       <Container className="relative mx-4 flex h-[25rem] w-full flex-col items-center justify-center gap-y-2 rounded-2xl bg-zinc-50 text-center border-current border-[1px] dark:bg-zinc-900 sm:static sm:mx-0">
//         {!cancellationStatus && (
//           <>
//             <div className="flex w-full flex-row items-center justify-between">
//               <div className="!mb-1 w-full text-start text-2xl tracking-tight opacity-100 sm:!mb-0 sm:text-4xl">
//                 <Balancer>{t('header')}</Balancer>
//               </div>
//               <div className="flex min-w-fit items-center justify-center whitespace-normal rounded-lg border border-red-500 px-3 py-2 font-semibold tracking-normal text-red-500 sm:px-6 sm:py-4">
//               {t('danger')}
//               </div>
//             </div>
//             <hr className="my-2 h-px w-full border-0 bg-black dark:bg-white sm:my-6" />

//             {!subscriptionInfo && (
//               <>
//                 <h3 className="!mb-0 py-2 text-sm font-normal opacity-100 sm:py-4 sm:text-base">
//                   <Balancer>
//                   {t('instruction')}
//                   </Balancer>
//                 </h3>

//                 <Label htmlFor="mobile">
//                 {t('label')}
//                 </Label>
//                 <PhoneInputShadcnUiPhoneInput
//                   phoneNumber={phoneNumber}
//                   setPhoneNumber={setPhoneNumber}
//                   setMessage={setMessage}
//                 />
//                 <Button
//                   variant="default"
//                   className="min-w-[185px] text-sm font-semibold sm:text-base"
//                   onClick={() => getSubscription(phoneNumber)}
//                   disabled={loading}
//                 >
//                   {loading ? t('button_loading') : t('button_get_subscription_info')}
//                 </Button>
//               </>
//             )}

//             <AnimatePresence presenceAffectsLayout={false} mode="popLayout">
//               {subscriptionInfo && (
//                 <motion.div
//                   key="subscription-info"
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   exit={{ opacity: 0, height: 0 }}
//                   transition={{ duration: 0.3, type: 'tween' }}
//                   className="flex w-full flex-col items-center justify-center"
//                 >
//                   <h4 className="text-lg font-semibold">{t('subscription_header')}</h4>
//                   <p>
//                     {t('start_date')}{' '}
//                     {new Date(
//                       subscriptionInfo.membershipStartDate * 1000,
//                     ).toLocaleDateString()}
//                   </p>
//                   <p>
//                   {t('end_date')}{' '}
//                     {new Date(
//                       subscriptionInfo.membershipEndDate * 1000,
//                     ).toLocaleDateString()}
//                   </p>
//                   <br />
//                   <p>
//                     {t('subscription_note_1')}{' '}
//                     {new Date(
//                       subscriptionInfo.membershipEndDate * 1000,
//                     ).toLocaleDateString()}
//                     {t('subscription_note_2')}
//                   </p>
//                   <p>
//                   {t('subscription_note_3')}
//                   </p>

//                   <Button
//                     variant="destructive"
//                     className="mt-4 flex w-fit text-sm font-semibold sm:text-base"
//                     onClick={cancelSubscription}
//                     disabled={loading}
//                   >
//                     {loading ? t('button_cancelling') : t('button_cancel_subscription')}
//                   </Button>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {message && <p className="mt-4 text-red-500">{message}</p>}
//           </>
//         )}
//         <AnimatePresence presenceAffectsLayout={false} mode="popLayout">
//           {/* Cancellation Success */}
//           {cancellationStatus && (
//             <motion.div
//               key="cancel-success"
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: 'auto' }}
//               exit={{ opacity: 0, height: 0 }}
//               transition={{ duration: 0.3, type: 'tween' }}
//               className="flex flex-col w-full items-center justify-center"
//             >
//               <CheckIcon size={96}/>
//               {message && <p className="mt-4 text-red-500">{message}</p>}
//               <Link href="https://wa.me/971505072100">
//                 <Button
//                   variant="default"
//                   className="mt-4 min-w-[185px] text-sm font-semibold sm:text-lg"
//                 >
//                   {t('button_return_to_whatsapp')}
//                 </Button>
//               </Link>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </Container>
//       <DotPattern
//         className={cn(
//           '[mask-image:radial-gradient(800px_circle_at_center,white,transparent)] -z-10',
//         )}
//       />
//     </div>
//   );
// }
