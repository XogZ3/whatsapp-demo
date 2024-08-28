import {
  DAILY_CREDITS_LIMIT,
  TRAINING_IMAGES_LOWER_LIMIT,
  TRAINING_IMAGES_UPPER_LIMIT,
} from './constants';

// Define supported languages
type LanguageCode = 'en' | 'pt' | 'ar';
export type Language = 'english' | 'portuguese' | 'arabic';

// Define a type for translation keys
type TranslationKeys =
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
  | 'notify pending photos 1'
  | 'notify pending photos 2'
  | 'select language'
  | 'language selected'
  | 'model already exists'
  | 'generating model'
  | 'please wait generating model'
  | 'processing payment'
  | 'prompt photos'
  | 'use prompt'
  | 'improve prompt'
  | 'please wait machine busy'
  | 'photo upload instruction'
  | 'invalid input'
  | 'intro message'
  | 'tutorial message'
  | 'generating image'
  | 'sample photos'
  | 'unpaid user options'
  | 'payment instructions'
  | 'payment confirmation'
  | 'prompting instruction'
  | 'prompt confirmation'
  | 'new prompt request'
  | 'credits remaining'
  | 'upload photos'
  | 'pricing message'
  | 'main menu'
  | 'photo received'
  | 'finish upload'
  | 'model generated'
  | 'model generated request prompt'
  | 'buy credits'
  | 'get membership'
  | 'payment confirmed'
  | 'paywall'
  | 'active membership'
  | 'reached limit'
  | 'unknown error';

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
    en: 'Pricing',
    pt: 'Preços',
    ar: 'التسعير',
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
    en: 'more photos.',
    pt: 'mais fotos.',
    ar: 'صورًا إضافية.',
  },
  'main menu': {
    en: 'Main Menu',
    pt: 'Menu Principal',
    ar: 'القائمة الرئيسية',
  },
  'buy credits': {
    en: 'Buy Credits',
    pt: 'Comprar Créditos',
    ar: 'شراء رصيد',
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
  'processing payment': {
    en: 'Processing your payment...',
    pt: 'Processando seu pagamento...',
    ar: 'جارٍ معالجة الدفع الخاص بك...',
  },
  'prompt photos': {
    en: 'You can now prompt for your own photos!',
    pt: 'Agora você pode solicitar suas próprias fotos!',
    ar: 'يمكنك الآن طلب صورك الخاصة!',
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
    en: `Send ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} photos...`,
    pt: `Envie ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} fotos...`,
    ar: `أرسل ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} صورًا...`,
  },
  'invalid input': {
    en: "⚠️ Oops!\n\nIt seems you've provided an invalid input.\n\nLet's give it another try.",
    pt: '⚠️ Opa!\n\nParece que você forneceu uma entrada inválida.\n\nVamos tentar novamente.',
    ar: '⚠️ عذرًا!\n\nيبدو أنك قدمت إدخالاً غير صالح.\n\nدعنا نحاول مرة أخرى.',
  },
  'intro message': {
    en: `👋 Welcome to FotoLabs.ai! Click *'Upload Photos'* to send us ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} photos of yourself. We'll create a personalized model and provide some images for free. Follow the instructions to get started!`,
    pt: `👋 Bem-vindo ao FotoLabs.ai! Clique em 'Carregar Fotos' para nos enviar ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} fotos suas. Criaremos um modelo personalizado e forneceremos algumas imagens gratuitamente. Siga as instruções para começar!`,
    ar: `👋 مرحبًا بك في FotoLabs.ai! اضغط على 'رفع الصور' لإرسال ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} صورة لنفسك. سنقوم بإنشاء نموذج شخصي وتزويدك ببعض الصور مجانًا. اتبع التعليمات للبدء!`,
  },
  'pricing message': {
    en: `After creating your personalized model, you can get a membership to generate more amazing images.\n\n$9.99 only, create 100 images per day for 1 month! Ready to unlock more creativity?`,
    pt: `Após criar seu modelo personalizado, você pode obter uma assinatura para gerar mais imagens incríveis.\n\nApenas $9,99, crie 100 imagens por dia durante 1 mês! Pronto para liberar mais criatividade?`,
    ar: `بعد إنشاء نموذجك الشخصي، يمكنك الحصول على عضوية لإنشاء المزيد من الصور الرائعة.\n\nفقط 9.99 دولار، إنشاء 100 صورة يوميًا لمدة شهر! هل أنت مستعد لإطلاق المزيد من الإبداع؟`,
  },
  'tutorial message': {
    en: `📸 How to Use FotoLabs.ai\n\nUpload Photos: Send 15 photos of yourself to create your personalized model.\nGet Samples: Once your model is ready, you'll receive a few sample images for free.\nGenerate Images: Purchase credits and start generating images by simply sending prompts like "handsome man as a superhero" or "gorgeous woman in Paris."\nIt's that easy! Ready to explore? 😊`,
    pt: '📸 Como usar o FotoLabs.ai\n\nEnvie fotos: Envie 15 fotos suas para criar seu modelo personalizado.\nReceba Amostras: Quando seu modelo estiver pronto, você receberá algumas imagens de amostra gratuitamente.\nGere Imagens: Compre créditos e comece a gerar imagens simplesmente enviando solicitações como "homem bonito como super-herói" ou "mulher linda em Paris."\nÉ tão fácil! Pronto para explorar? 😊',
    ar: '📸 كيفية استخدام FotoLabs.ai\n\nتحميل الصور: أرسل 15 صورة لنفسك لإنشاء النموذج الشخصي الخاص بك.\nاحصل على عينات: بمجرد أن يكون النموذج جاهزًا، ستتلقى بعض الصور النموذجية مجانًا.\nإنشاء الصور: اشترِ أرصدة وابدأ بإنشاء الصور ببساطة عن طريق إرسال الطلبات مثل "رجل وسيم كالبطل الخارق" أو "امرأة رائعة في باريس."\nإنه سهل جدًا! هل أنت مستعد للاستكشاف؟ 😊',
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
  'model already exists': {
    en: 'Your custom AI model already exists. Send your prompt now!',
    pt: 'Seu modelo de IA personalizado já existe. Envie seu prompt agora!',
    ar: 'نموذج الذكاء الاصطناعي المخصص لك موجود بالفعل. أرسل موجهك الآن!',
  },
  'model generated': {
    en: 'Your model has been successfully generated! :D',
    pt: 'Seu modelo foi gerado com sucesso! :D',
    ar: 'تم إنشاء النموذج الخاص بك بنجاح! :D',
  },
  'model generated request prompt': {
    en: `Your model has been successfully generated! :D
Send a prompt and watch the magic happen.

Example: man sitting on a park bench or woman posing for a candid photo at office`,
    pt: `Seu modelo foi gerado com sucesso! :D
Envie um prompt e veja a mágica acontecer.

Exemplo: homem sentado em um banco de parque ou mulher posando para uma foto espontânea no escritório`,
    ar: `تم إنشاء النموذج الخاص بك بنجاح! :D
أرسل موجهًا وشاهد السحر يحدث.

مثال: رجل يجلس على مقعد في الحديقة أو امرأة تتظاهر لالتقاط صورة عفوية في المكتب`,
  },
  'sample photos': {
    en: 'Here you go, some sample photos, some blurred..',
    pt: 'Aqui estão algumas fotos de amostra, algumas desfocadas...',
    ar: 'إليك بعض الصور النموذجية، بعضها ضبابية..',
  },
  'unpaid user options': {
    en: 'Wanna make your own photos?',
    pt: 'Quer fazer suas próprias fotos?',
    ar: 'هل تريد إنشاء صورك الخاصة؟',
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
  'credits remaining': {
    en: 'Credits remaining',
    pt: 'Créditos restantes',
    ar: 'الرصيد المتبقي',
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
  paywall: {
    en: 'Your free trial/membership has expired. Please purchase a membership to continue using FotoLabs AI.',
    pt: 'Seu teste gratuito/assinatura expirou. Por favor, compre uma assinatura para continuar usando o FotoLabs AI.',
    ar: 'انتهت صلاحية النسخة التجريبية المجانية/العضوية الخاصة بك. يرجى شراء عضوية لمواصلة استخدام FotoLabs AI.',
  },
  'active membership': {
    en: 'You already have an existing membership',
    pt: 'Você já tem uma assinatura existente',
    ar: 'لديك بالفعل عضوية قائمة',
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
