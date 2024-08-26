import { TRAINING_IMAGES_LIMIT } from './constants';

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
  | 'please wait'
  | 'processing payment'
  | 'prompt photos'
  | 'photo upload instruction'
  | 'invalid input'
  | 'intro message'
  | 'tutorial message'
  | 'generating image'
  | 'sample photos'
  | 'unpaid user options'
  | 'payment instructions'
  | 'payment confirmation'
  | 'paid user options'
  | 'prompting instruction'
  | 'prompt confirmation'
  | 'new prompt request'
  | 'credits remaining'
  | 'upload photos'
  | 'pricing message'
  | 'main menu'
  | 'photo received'
  | 'model generated'
  | 'model generated request prompt'
  | 'buy credits'
  | 'payment confirmed'
  | 'paywall';

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
  'photo upload instruction': {
    en: `Send ${TRAINING_IMAGES_LIMIT} photos...`,
    pt: `Envie ${TRAINING_IMAGES_LIMIT} fotos...`,
    ar: `أرسل ${TRAINING_IMAGES_LIMIT} صورًا...`,
  },
  'invalid input': {
    en: "⚠️ Oops!\n\nIt seems you've provided an invalid input.\n\nLet's give it another try.",
    pt: '⚠️ Opa!\n\nParece que você forneceu uma entrada inválida.\n\nVamos tentar novamente.',
    ar: '⚠️ عذرًا!\n\nيبدو أنك قدمت إدخالاً غير صالح.\n\nدعنا نحاول مرة أخرى.',
  },
  'intro message': {
    en: `👋 Welcome to FotoLabs.ai! Click *'Upload Photos'* to send us ${TRAINING_IMAGES_LIMIT} photos of yourself. We'll create a personalized model and provide some images for free. Follow the instructions to get started!`,
    pt: `👋 Bem-vindo ao FotoLabs.ai! Clique em 'Carregar Fotos' para nos enviar ${TRAINING_IMAGES_LIMIT} fotos suas. Criaremos um modelo personalizado e forneceremos algumas imagens gratuitamente. Siga as instruções para começar!`,
    ar: `👋 مرحبًا بك في FotoLabs.ai! اضغط على 'رفع الصور' لإرسال ${TRAINING_IMAGES_LIMIT} صورة لنفسك. سنقوم بإنشاء نموذج شخصي وتزويدك ببعض الصور مجانًا. اتبع التعليمات للبدء!`,
  },
  'pricing message': {
    en: `After creating your personalized model, you can purchase credits to generate more amazing images.\n\n5 Credits: $5 (5 images)\n15 Credits: $12 (15 images)\n30 Credits: $20 (30 images)\n\nCredits can be used anytime by sending a prompt. Ready to unlock more creativity?`,
    pt: 'Após criar seu modelo personalizado, você pode comprar créditos para gerar mais imagens incríveis.\n\n5 Créditos: $5 (5 imagens)\n15 Créditos: $12 (15 imagens)\n30 Créditos: $20 (30 imagens)\n\nOs créditos podem ser usados a qualquer momento enviando uma solicitação. Pronto para desbloquear mais criatividade?',
    ar: 'بعد إنشاء النموذج الشخصي الخاص بك، يمكنك شراء أرصدة لإنشاء المزيد من الصور الرائعة.\n\n5 أرصدة: $5 (5 صور)\n15 أرصدة: $12 (15 صور)\n30 أرصدة: $20 (30 صور)\n\nيمكن استخدام الأرصدة في أي وقت عن طريق إرسال طلب. هل أنت مستعد لإطلاق المزيد من الإبداع؟',
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
  'please wait': {
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
    en: 'STRIPE link..',
    pt: 'Link do STRIPE..',
    ar: 'رابط STRIPE..',
  },
  'payment confirmation': {
    en: 'Payment success.. you have xxx credits',
    pt: 'Pagamento bem-sucedido.. você tem xxx créditos',
    ar: 'نجاح الدفع.. لديك xxx أرصدة',
  },
  'paid user options': {
    en: 'Whatcha wanna see your ai self do?',
    pt: 'O que você quer ver sua versão de IA fazer?',
    ar: 'ماذا تريد أن ترى نفسك بالذكاء الاصطناعي يفعل؟',
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
    en: 'Number of photos received',
    pt: 'Número de fotos recebidas',
    ar: 'عدد الصور المستلمة',
  },
  paywall: {
    en: 'You have 0 credits. Please buy credits to continue using FotoLabs AI.',
    pt: 'Você tem 0 créditos. Por favor, compre créditos para continuar usando o FotoLabs AI.',
    ar: 'لديك 0 رصيد. يرجى شراء رصيد لمواصلة استخدام FotoLabs AI.',
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
