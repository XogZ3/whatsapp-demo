import {
  DAILY_CREDITS_LIMIT,
  TRAINING_IMAGES_LOWER_LIMIT,
  TRAINING_IMAGES_UPPER_LIMIT,
} from './constants';

// Define supported languages
type LanguageCode = 'en' | 'pt' | 'ar';
export type Language = 'english' | 'portuguese' | 'arabic';

// Define a type for translation keys
export type TranslationKeys =
  | 'cancel'
  | 'bypass'
  | 'upload photos'
  | 'language'
  | 'english'
  | 'portuguese'
  | 'arabic'
  | 'tutorial'
  | 'pricing'
  | 'create photo'
  | 'prompt'
  | 'yes'
  | 'no'
  | 'retry'
  | 'notify pending photos 1'
  | 'notify pending photos 2'
  | 'select language'
  | 'language selected'
  | 'model already exists'
  | 'generating model'
  | 'model generation failed'
  | 'please wait generating model'
  | 'use prompt'
  | 'improve prompt'
  | 'please wait machine busy'
  | 'photo upload instruction'
  | 'invalid input'
  | 'intro message'
  | 'tutorial message'
  | 'generating image'
  | 'payment instructions'
  | 'payment confirmation'
  | 'prompting instruction'
  | 'prompt confirmation'
  | 'new prompt request'
  | 'upload photos'
  | 'main menu'
  | 'photo received'
  | 'finish upload'
  | 'model generated'
  | 'get membership'
  | 'payment confirmed'
  | 'paywall'
  | 'active membership'
  | 'reached limit'
  | 'unknown error'
  | 'support email'
  | 'payment failed'
  | 'new user paywall';

// Define the translation map structure directly using Record
export const TRANSLATION_MAP: Record<
  TranslationKeys,
  Record<LanguageCode, string>
> = {
  cancel: {
    en: 'Cancel',
    pt: 'Cancelar',
    ar: 'إلغاء',
  },
  bypass: {
    en: 'Bypass',
    pt: 'Ignorar',
    ar: 'تخطي',
  },
  'upload photos': {
    en: 'Upload Photos',
    pt: 'Carregar Fotos',
    ar: 'رفع الصور',
  },
  language: {
    en: 'Language',
    pt: 'Idioma',
    ar: 'اللغة',
  },
  tutorial: {
    en: 'Tutorial',
    pt: 'Tutorial',
    ar: 'دليل الاستخدام',
  },
  pricing: {
    en: `🎉 Special Offer: Get unlimited creativity with our exclusive deal! For just $9.99, enjoy 100 photos per day for 30 days. Show off your creations and impress your friends! Don’t miss out on this fantastic opportunity!`,
    pt: `🎉 Oferta Especial: Liberte sua criatividade com nossa oferta exclusiva! Por apenas $9,99, aproveite 100 fotos por dia durante 30 dias. Exiba suas criações e impressione seus amigos! Não perca esta oportunidade incrível!`,
    ar: `🎉 عرض خاص: أطلق العنان لإبداعك مع عرضنا الحصري! مقابل 9.99 دولار فقط، استمتع بإنشاء 100 صورة يوميًا لمدة 30 يومًا. اعرض إبداعاتك وأبهر أصدقائك! لا تفوت هذه الفرصة الرائعة!`,
  },
  'create photo': {
    en: 'Create Photo',
    pt: 'Criar Foto',
    ar: 'إنشاء صورة',
  },
  yes: {
    en: 'Yes',
    pt: 'Sim',
    ar: 'نعم',
  },
  no: {
    en: 'No',
    pt: 'Não',
    ar: 'لا',
  },
  'notify pending photos 1': {
    en: 'Please send',
    pt: 'Por favor, envie',
    ar: 'يرجى إرسال',
  },
  'notify pending photos 2': {
    en: 'more photos of you.',
    pt: 'mais fotos suas.',
    ar: 'مزيد من الصور لك',
  },
  'main menu': {
    en: 'Main Menu',
    pt: 'Menu Principal',
    ar: 'القائمة الرئيسية',
  },
  'get membership': {
    en: 'Get Membership',
    pt: 'Obter Assinatura',
    ar: 'احصل على العضوية',
  },
  'payment confirmed': {
    en: 'Payment Confirmed',
    pt: 'Pagamento Confirmado',
    ar: 'تم تأكيد الدفع',
  },
  prompt: {
    en: 'Prompt',
    pt: 'Prompt',
    ar: 'موجه',
  },
  'select language': {
    en: 'Select language | Selecione o idioma | اختر اللغة',
    pt: 'Select language | Selecione o idioma | اختر اللغة',
    ar: 'Select language | Selecione o idioma | اختر اللغة',
  },
  english: {
    en: 'English',
    pt: 'Inglês',
    ar: 'إنجليزي',
  },
  portuguese: {
    en: 'Portuguese',
    pt: 'Português',
    ar: 'برتغالي',
  },
  arabic: {
    en: 'Arabic',
    pt: 'Árabe',
    ar: 'عربي',
  },
  'language selected': {
    en: 'English selected',
    pt: 'Português selecionado',
    ar: 'العربية المختارة',
  },
  'generating model': {
    en: "Generating model... Will send message once it's ready. It may take 50-60 minutes.",
    pt: 'Gerando modelo... Enviaremos uma mensagem quando estiver pronto. Pode levar de 50 a 60 minutos.',
    ar: 'جاري إنشاء النموذج... سنرسل لك رسالة بمجرد أن يكون جاهزًا. قد يستغرق ذلك من 60 إلى 30 دقيقة.',
  },
  retry: {
    en: 'Retry',
    pt: 'Tentar novamente',
    ar: 'إعادة المحاولة',
  },
  'use prompt': {
    en: 'Use Prompt',
    pt: 'Usar Prompt',
    ar: 'استخدام الموجه',
  },
  'improve prompt': {
    en: 'Improve Prompt',
    pt: 'Melhorar Prompt',
    ar: 'تحسين الموجه',
  },
  'photo upload instruction': {
    en: `Please upload ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} high-quality photos of yourself. Ensure you are the only person in the photo, and that the images have good lighting.`,
    pt: `Por favor, envie ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} fotos de alta qualidade de você. Certifique-se de que você seja a única pessoa na foto e que as imagens tenham boa iluminação.`,
    ar: `يرجى تحميل ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} صورة عالية الجودة لنفسك. تأكد من أنك الشخص الوحيد في الصورة وأن تكون الصور ذات إضاءة جيدة.`,
  },
  'invalid input': {
    en: "⚠️ Oops!\n\nIt seems you've provided an invalid input.\n\nLet's give it another try.",
    pt: '⚠️ Opa!\n\nParece que você forneceu uma entrada inválida.\n\nVamos tentar novamente.',
    ar: '⚠️ عذرًا!\n\nيبدو أنك قدمت إدخالاً غير صالح.\n\nدعنا نحاول مرة أخرى.',
  },
  'intro message': {
    en: `👋 Welcome to FotoLabs.ai! Want to create cool AI photos like these? Make a payment of ~$29.99~ $19.99 using the link below and generate unlimited images for 30 days!`,
    pt: `👋 Bem-vindo ao FotoLabs.ai! Quer criar fotos incríveis de IA como essas? Faça um pagamento de ~$29,99~ $19,99 usando o link abaixo e gere imagens ilimitadas por 30 dias!`,
    ar: `👋 مرحبًا بك في FotoLabs.ai! هل تريد إنشاء صور رائعة بالذكاء الاصطناعي مثل هذه؟ قم بالدفع ~$29.99~ $19.99 باستخدام الرابط أدناه وابدأ في إنشاء صور غير محدودة لمدة 30 يومًا!`,
  },
  'tutorial message': {
    en: `📸 How to Use FotoLabs.ai\n\nMake Payment: Create unlimited photos of your AI self in any scenario you can imagine for just ~$29.99~ $19.99/month.\nUpload Photos: Send ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} photos of yourself to create your personalized model.\nGet Samples: Once your model is ready, you'll receive a few sample images.\nGenerate Images: Start generating images by sending prompts like "handsome man as a superhero" or "gorgeous woman in Paris."\nIt's that easy! Ready to explore? 😊`,
    pt: `📸 Como Usar o FotoLabs.ai\n\nFaça o Pagamento: Crie fotos ilimitadas de sua versão de IA em qualquer cenário que puder imaginar por apenas ~$29,99~ $19,99/mês.\nEnviar Fotos: Envie ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} fotos suas para criar seu modelo personalizado.\nObter Amostras: Quando seu modelo estiver pronto, você receberá algumas imagens de amostra.\nGerar Imagens: Comece a gerar imagens enviando prompts como "homem bonito como um super-herói" ou "mulher deslumbrante em Paris."\nÉ tão fácil! Pronto para explorar? 😊`,
    ar: `📸 كيفية استخدام FotoLabs.ai\n\nقم بالدفع: أنشئ صورًا غير محدودة لنسخة الذكاء الاصطناعي الخاصة بك في أي سيناريو يمكنك تخيله مقابل ~$29.99~ $19.99/شهر.\nتحميل الصور: أرسل ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} صورة لنفسك لإنشاء نموذجك المخصص.\nاحصل على عينات: بمجرد أن يصبح نموذجك جاهزًا، ستتلقى بعض الصور النموذجية.\nإنشاء الصور: ابدأ في إنشاء الصور عن طريق إرسال موجهات مثل "رجل وسيم كبطل خارق" أو "امرأة رائعة في باريس."\nالأمر بهذه السهولة! جاهز للاستكشاف؟ 😊`,
  },
  'generating image': {
    en: 'Generating image, please wait 30 seconds...',
    pt: 'Gerando imagem, por favor, aguarde 30 segundos...',
    ar: 'جارٍ إنشاء الصورة، يرجى الانتظار لمدة 30 ثانية...',
  },
  'please wait generating model': {
    en: 'Please wait while we are generating a customized model for you.',
    pt: 'Por favor, aguarde enquanto geramos um modelo personalizado para você.',
    ar: 'يرجى الانتظار بينما نقوم بإنشاء نموذج مخصص لك.',
  },
  'model generation failed': {
    en: `Oops. Your AI model generation has failed. Please click the button below to try again.`,
    pt: `Ops. A geração do seu modelo de IA falhou. Por favor, clique no botão abaixo para tentar novamente.`,
    ar: `عذرًا، فشلت عملية إنشاء نموذج الذكاء الاصطناعي الخاص بك. يرجى النقر على الزر أدناه للمحاولة مرة أخرى.`,
  },
  'model already exists': {
    en: 'Your custom AI model already exists. Send your prompt now!',
    pt: 'Seu modelo de IA personalizado já existe. Envie seu prompt agora!',
    ar: 'نموذج الذكاء الاصطناعي المخصص لك موجود بالفعل. أرسل موجهك الآن!',
  },
  'model generated': {
    en: `Your model has been successfully generated! :D\nSend your prompt now.`,
    pt: `Seu modelo foi gerado com sucesso! :D\nEnvie seu prompt agora.`,
    ar: `تم إنشاء نموذجك بنجاح! :D\nأرسل موجهك الآن.`,
  },
  'payment instructions': {
    en: 'Please complete payment using this link.',
    pt: 'Por favor, complete o pagamento usando este link.',
    ar: 'يرجى إكمال الدفع باستخدام هذا الرابط.',
  },
  'payment confirmation': {
    en: 'Payment successful. Enjoy creating awesome pictures until',
    pt: 'Pagamento realizado com sucesso. Aproveite para criar fotos incríveis até',
    ar: 'تم الدفع بنجاح. استمتع بإنشاء صور رائعة حتى',
  },
  'prompting instruction': {
    en: 'Send your prompt',
    pt: 'Envie sua solicitação',
    ar: 'أرسل طلبك',
  },
  'prompt confirmation': {
    en: `Do you want to generate image with following prompt?`,
    pt: `Você quer gerar uma imagem com a seguinte solicitação?`,
    ar: `هل تريد إنشاء صورة مع الطلب التالي؟`,
  },
  'please wait machine busy': {
    en: 'Please wait while FotoLabs AI is working...',
    pt: 'Por favor, aguarde enquanto o FotoLabs AI está processando...',
    ar: 'يرجى الانتظار بينما يعمل FotoLabs AI...',
  },
  'new prompt request': {
    en: 'Alright, send a new prompt. :)',
    pt: 'Tudo bem, envie uma nova solicitação. :)',
    ar: 'حسنًا، أرسل طلبًا جديدًا. :)',
  },
  'photo received': {
    en: 'Photos uploaded',
    pt: 'Fotos carregadas',
    ar: 'تم رفع الصور',
  },
  'finish upload': {
    en: 'Finish Upload',
    pt: 'Concluir Upload',
    ar: 'إنهاء الرفع',
  },
  'new user paywall': {
    en: `*Love these AI-generated photos of you?*
You can create unlimited photos of yourself in any scenario you can imagine for just ~$29.99~ $19.99/month.`,
    pt: `*Gostou dessas fotos geradas por IA de você?*
Você pode criar fotos ilimitadas de si mesmo em qualquer cenário que puder imaginar por apenas ~$29,99~ $19,99/mês.`,
    ar: `*أعجبتك هذه الصور التي تم إنشاؤها بواسطة الذكاء الاصطناعي لك؟*
يمكنك إنشاء صور غير محدودة لنفسك في أي سيناريو يمكنك تخيله مقابل ~$29.99~ $19.99/شهر.`,
  },
  paywall: {
    en: 'Your free trial/membership has expired. Please purchase a membership to continue using FotoLabs AI.',
    pt: 'Seu teste gratuito/assinatura expirou. Por favor, compre uma assinatura para continuar usando o FotoLabs AI.',
    ar: 'انتهت صلاحية النسخة التجريبية المجانية/العضوية الخاصة بك. يرجى شراء عضوية لمواصلة استخدام FotoLabs AI.',
  },
  'active membership': {
    en: 'You already have an existing membership. Send your prompt now. :)',
    pt: 'Você já tem uma assinatura existente. Envie seu prompt agora. :)',
    ar: 'لديك عضوية موجودة بالفعل. أرسل طلبك الآن. :)',
  },
  'reached limit': {
    en: `Woah, you've generated ${DAILY_CREDITS_LIMIT} images today! Take a break, you can start making images tomorrow :)`,
    pt: `Uau, você gerou ${DAILY_CREDITS_LIMIT} imagens hoje! Faça uma pausa, você pode começar a criar imagens novamente amanhã :)`,
    ar: `واو، لقد أنشأت ${DAILY_CREDITS_LIMIT} صورة اليوم! خذ استراحة، يمكنك البدء في إنشاء الصور مرة أخرى غدًا :)`,
  },
  'unknown error': {
    en: 'Uh-oh. Something went wrong, please try again after some time.',
    pt: 'Ops. Algo deu errado, por favor tente novamente mais tarde.',
    ar: 'أوه، حدث خطأ ما، يرجى المحاولة مرة أخرى بعد بعض الوقت.',
  },
  'payment failed': {
    en: 'Payment failed. Please try again or contact support if the issue persists.',
    pt: 'O pagamento falhou. Por favor, tente novamente ou entre em contato com o suporte se o problema persistir.',
    ar: 'فشل الدفع. يرجى المحاولة مرة أخرى أو الاتصال بالدعم إذا استمرت المشكلة.',
  },
  'support email': {
    en: `Please email us for support at ${process.env.NEXT_PUBLIC_EMAIL}`,
    pt: `Por favor, envie um e-mail para suporte em ${process.env.NEXT_PUBLIC_EMAIL}`,
    ar: `يرجى مراسلتنا عبر البريد الإلكتروني للدعم على ${process.env.NEXT_PUBLIC_EMAIL}`,
  },
};

function getLanguageCode(language: string | undefined): LanguageCode {
  const languageMap: { [key: string]: LanguageCode } = {
    english: 'en',
    portuguese: 'pt',
    arabic: 'ar',
  };

  // If language is undefined or empty, return 'en'
  if (!language) return 'en';
  // console.log('[!] language in getLanguageCode: ', language);

  // Convert input to lowercase and return the language code if it exists
  return languageMap[language.toLowerCase()] || 'en';
}

// Updated getTranslation function with specific types
export const getTranslation = (
  key: TranslationKeys,
  language: Language,
): string => {
  const languageCode = getLanguageCode(language);
  return TRANSLATION_MAP[key]?.[languageCode] || key;
};

// Helper function to find the translation key based on the message and language
const findTranslationKey = (
  message: string,
  languageCode: LanguageCode,
): TranslationKeys | undefined => {
  return (Object.keys(TRANSLATION_MAP) as TranslationKeys[]).find(
    (key) => TRANSLATION_MAP[key][languageCode] === message,
  );
};

// Updated translateSystemMessageToEnglish function
export const translateSystemMessageToEnglish = (
  message: string,
  language: Language,
): string => {
  const languageCode = getLanguageCode(language);
  const translationKey = findTranslationKey(message, languageCode);

  if (translationKey) {
    return getTranslation(translationKey, 'english');
  }

  return message; // Return the original message if no translation exists
};
