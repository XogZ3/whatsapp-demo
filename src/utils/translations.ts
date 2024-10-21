import { AppConfig } from './appConfig';
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
  | 'uploading please wait'
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
  | 'intro message img'
  | 'tutorial message'
  | 'generating image'
  | 'payment instructions'
  | 'payment confirmation'
  | 'prompting instruction'
  | 'analyzing photo'
  | 'prompt confirmation'
  | 'new prompt request'
  | 'main menu'
  | 'photo received'
  | 'finish upload'
  | 'model generated'
  | 'get membership'
  | 'payment confirmed'
  | 'paywall'
  | 'discount message 1'
  | 'discount message 2'
  | 'active membership'
  | 'reached limit'
  | 'confirm cancellation 1'
  | 'confirm cancellation 2'
  | 'cancel subscription'
  | 'back to safety'
  | 'cancellation success'
  | 'cancellation fail'
  | 'cancellation cancelled'
  | 'already cancelled'
  | 'unknown error'
  | 'support email'
  | 'payment failed'
  | 'new user paywall'
  | 'referral 1'
  | 'referral 2'
  | 'nsfw error';

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
    en: "Generating model... Will send a message once it's ready. It will only take 2-3 minutes. ⚡",
    pt: 'Gerando modelo... Enviaremos uma mensagem quando estiver pronto. Isso levará apenas 2-3 minutos. ⚡',
    ar: 'جاري إنشاء النموذج... سنرسل لك رسالة بمجرد أن يصبح جاهزًا. سيستغرق الأمر دقيقتين إلى ثلاث دقائق فقط. ⚡',
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
    en: `👋 Welcome to FotoLabs.ai!
Want to create cool AI photos like these? Make a payment of ~$29.99~ $19.99 using the link below and generate unlimited images for 30 days!`,
    pt: `👋 Bem-vindo ao FotoLabs.ai!
Quer criar fotos incríveis de IA como essas? Faça um pagamento de ~$29,99~ $19,99 usando o link abaixo e gere imagens ilimitadas por 30 dias!`,
    ar: `👋 مرحبًا بك في FotoLabs.ai!
هل تريد إنشاء صور رائعة بالذكاء الاصطناعي مثل هذه؟ قم بالدفع ~$29.99~ $19.99 باستخدام الرابط أدناه وابدأ في إنشاء صور غير محدودة لمدة 30 يومًا!`,
  },
  'intro message img': {
    en: `👋 Welcome to FotoLabs.ai! Want to create cool AI photos like these?
Click 'Upload Photos' button to get started.`,
    pt: `👋 Bem-vindo ao FotoLabs.ai! Quer criar fotos incríveis de IA como essas?
Clique no botão 'Enviar Fotos' para começar.`,
    ar: `👋 مرحبًا بك في FotoLabs.ai! هل تريد إنشاء صور رائعة بالذكاء الاصطناعي مثل هذه؟
انقر على زر 'تحميل الصور' للبدء.`,
  },
  'tutorial message': {
    en: `📸 How to Use FotoLabs.ai\n\nUpload Photos: Send ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} photos of yourself to create your personalized model.\nMake Payment: Create unlimited photos of your AI self in any scenario you can imagine for just ~$29.99~ $19.99/month.\nGet Samples: Once your model is ready, you'll receive a few sample images.\nGenerate Images: Start generating images by sending prompts like "handsome man as a superhero" or "gorgeous woman in Paris."\nIt's that easy! Ready to explore? 😊`,
    pt: `📸 Como Usar o FotoLabs.ai\n\nEnviar Fotos: Envie ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} fotos suas para criar seu modelo personalizado.\nFaça o Pagamento: Crie fotos ilimitadas de sua versão de IA em qualquer cenário que puder imaginar por apenas ~$29,99~ $19,99/mês.\nObter Amostras: Quando seu modelo estiver pronto, você receberá algumas imagens de amostra.\nGerar Imagens: Comece a gerar imagens enviando prompts como "homem bonito como um super-herói" ou "mulher deslumbrante em Paris."\nÉ tão fácil! Pronto para explorar? 😊`,
    ar: `📸 كيفية استخدام FotoLabs.ai\n\nتحميل الصور: أرسل ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} صورة لنفسك لإنشاء نموذجك الشخصي.\nقم بالدفع: أنشئ صورًا غير محدودة لنسختك الذكية الاصطناعية في أي سيناريو يمكنك تخيله مقابل ~29.99~ 19.99 دولارًا فقط شهريًا.\nاحصل على عينات: بمجرد أن يكون نموذجك جاهزًا، ستتلقى بعض الصور كعينات.\nإنشاء الصور: ابدأ في إنشاء الصور عن طريق إرسال موجهات مثل "رجل وسيم كبطل خارق" أو "امرأة جميلة في باريس".\nإنه بهذه السهولة! هل أنت مستعد للاستكشاف؟ 😊`,
  },
  'generating image': {
    en: 'Generating image, please wait 30 seconds...',
    pt: 'Gerando imagem, por favor, aguarde 30 segundos...',
    ar: 'جارٍ إنشاء الصورة، يرجى الانتظار لمدة 30 ثانية...',
  },
  'please wait generating model': {
    en: `🧠✨ Please wait while we are generating a customized model for you. Relax, it won't be long! 😊`,
    pt: `🧠✨ Por favor, aguarde enquanto geramos um modelo personalizado para você. Relaxe, não vai demorar! 😊`,
    ar: `🧠✨ يرجى الانتظار بينما نقوم بإنشاء نموذج مخصص لك. استرخِ، لن يستغرق الأمر وقتًا طويلاً! 😊`,
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
    en: `🎉 Your model has been successfully generated! \nSend your prompt now. 😊`,
    pt: `🎉 Seu modelo foi gerado com sucesso! \nEnvie seu prompt agora. 😊`,
    ar: `🎉 تم إنشاء نموذجك بنجاح! \nأرسل موجهك الآن. 😊`,
  },
  'payment instructions': {
    en: 'Please complete payment using this link.',
    pt: 'Por favor, complete o pagamento usando este link.',
    ar: 'يرجى إكمال الدفع باستخدام هذا الرابط.',
  },
  'payment confirmation': {
    en: 'Thank you! Your payment was successful. ✅🎉',
    pt: 'Obrigado! Seu pagamento foi bem-sucedido. ✅🎉',
    ar: 'شكرًا لك! تم الدفع بنجاح. ✅🎉',
  },
  'analyzing photo': {
    en: 'Analyzing photo...',
    pt: 'Analisando a foto...',
    ar: 'جارٍ تحليل الصورة...',
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
    en: `🤖💭 Please wait while FotoLabs AI is working... Relax, we'll be ready soon! ☕️`,
    pt: `🤖💭 Por favor, aguarde enquanto o FotoLabs AI está processando... Relaxe, estaremos prontos em breve! ☕️`,
    ar: `🤖💭 يرجى الانتظار بينما يعمل FotoLabs AI... استرخِ، سنكون جاهزين قريبًا! ☕️`,
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
  'uploading please wait': {
    en: 'Some images are still being uploaded, please wait.\n\nClick "finish upload" button after all the images have been uploaded.',
    pt: 'Algumas imagens ainda estão sendo enviadas, por favor, aguarde.\n\nClique no botão "concluir upload" após o envio de todas as imagens.',
    ar: 'يتم تحميل بعض الصور، يرجى الانتظار.\n\nانقر على زر "إكمال التحميل" بعد تحميل جميع الصور.',
  },
  'new user paywall': {
    en: `We apologize to inform that we failed to generate your model for free. 😔 Due to high demand, we've had to pause our free model generation.

However, by becoming a *paid user*, you can continue creating your personalized AI model.
We appreciate your understanding and support! 🙏💖`,
    pt: `Sentimos muito informar que não conseguimos gerar o seu modelo gratuitamente. 😔 Devido à alta demanda, tivemos que pausar a geração de modelo gratuito.

No entanto, ao se tornar um usuário *pago*, você pode continuar criando seu modelo de IA personalizado.
Agradecemos seu entendimento e apoio! 🙏💖`,
    ar: `نحن نعتذر عن الإبلاغ عن أننا فشلنا في إنشاء نموذجك مجانيًا. 😔 بسبب الطلب العالي، كان علينا أن نؤقت إنشاء نموذج مجاني.

ومع ذلك، بالتحويل إلى مستخدم مدفوع، يمكنك الاستمرار في إنشاء نموذج الذكاء الاصطناعي المخصص الخاص بك.
نحن نشكر لكم فهمكم ودعمكم! 🙏💖`,
  },
  'discount message 1': {
    en: 'Hey! 🎉 You have been selected for a special discount. Use code',
    pt: 'Ei! 🎉 Você foi selecionado para um desconto especial. Use o código',
    ar: 'مرحبًا! 🎉 لقد تم اختيارك لخطة مخفضة. استخدم الرمز',
  },
  'discount message 2': {
    en: 'to get 50% off! 🚨 Use this code within 12 hours to get FotoLabs AI for only $9.99.',
    pt: 'para obter 50% de desconto! 🚨 Use este código dentro de 12 horas para obter FotoLabs AI por apenas $9.99.',
    ar: 'للحصول على 50% من الخطة الشهرية الخاصة بك! 🚨 استخدم هذا الرمز خلال 12 ساعة للحصول على FotoLabs AI بسعر $9.99 فقط.',
  },
  paywall: {
    en: 'Please pay using the link below to continue using FotoLabs AI.',
    pt: 'Por favor, pague usando o link abaixo para continuar usando o FotoLabs AI.',
    ar: 'يرجى الدفع باستخدام الرابط أدناه لمواصلة استخدام FotoLabs AI.',
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
  'confirm cancellation 1': {
    en: 'Please note that your subscription is valid till',
    pt: 'Observe que sua assinatura é válida até',
    ar: 'يرجى ملاحظة أن اشتراكك ساري حتى',
  },
  'confirm cancellation 2': {
    en: 'You will NOT receive any refunds.\nAfter successful cancellation, you will not be charged anything in the following month.\n\nClick "Cancel Subscription" button to confirm.\nClick "Back to Safety" button to return to generating awesome photos.',
    pt: 'Você NÃO receberá reembolsos.\nApós o cancelamento bem-sucedido, você não será cobrado no mês seguinte.\n\nClique no botão "Cancelar Assinatura" para confirmar.\nClique no botão "Voltar para Segurança" para continuar gerando fotos incríveis.',
    ar: 'لن تتلقى أي رد أموال.\nبعد إلغاء الاشتراك بنجاح، لن يتم خصم أي رسوم في الشهر التالي.\n\nانقر على زر "إلغاء الاشتراك" للتأكيد.\nانقر على زر "العودة إلى الأمان" للعودة إلى إنشاء صور رائعة.',
  },
  'cancel subscription': {
    en: 'Cancel Subscription',
    pt: 'Cancelar Assinatura',
    ar: 'إلغاء الاشتراك',
  },
  'back to safety': {
    en: 'Back to Safety',
    pt: 'Voltar seguro',
    ar: 'العودة إلى الأمان',
  },
  'cancellation success': {
    en: 'Your FotoLabs subscription has been cancelled successfully. 🤝',
    pt: 'Sua assinatura do FotoLabs foi cancelada com sucesso. 🤝',
    ar: 'تم إلغاء اشتراكك في FotoLabs بنجاح. 🤝',
  },
  'cancellation fail': {
    en: `There was an issue with the cancellation request. Please send an email to ${AppConfig.email}`,
    pt: `Houve um problema com o pedido de cancelamento. Por favor, envie um e-mail para ${AppConfig.email}`,
    ar: `حدثت مشكلة في طلب الإلغاء. يرجى إرسال بريد إلكتروني إلى ${AppConfig.email}`,
  },
  'cancellation cancelled': {
    en: 'Cool. Your cancellation request has been cancelled. You can safely continue enjoying FotoLabs. 😮‍💨',
    pt: 'Legal. Seu pedido de cancelamento foi cancelado. Você pode continuar aproveitando o FotoLabs com segurança. 😮‍💨',
    ar: 'رائع. تم إلغاء طلب الإلغاء الخاص بك. يمكنك الاستمرار في الاستمتاع بـ FotoLabs بأمان. 😮‍💨',
  },
  'already cancelled': {
    en: 'Your subscription has already been cancelled.',
    pt: 'Sua assinatura já foi cancelada.',
    ar: 'تم إلغاء اشتراكك بالفعل.',
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
  'referral 1': {
    en: `Hey! 🎉 Like these AI-generated images? Share this awesomeness! Feel free to forward this message to friends and family.

Try FotoLabs AI to create awesome AI photos of you in WhatsApp. Use promo code`,
    pt: `Ei! 🎉 Gostou dessas imagens geradas por IA? Compartilhe essa novidade! Sinta-se à vontade para encaminhar esta mensagem para amigos e familiares.

Experimente o FotoLabs AI para criar fotos incríveis de IA suas no WhatsApp. Use o código promocional`,
    ar: `مرحبًا! 🎉 هل أعجبتك هذه الصور المولدة بالذكاء الاصطناعي؟ شارك هذه الروعة! لا تتردد في إعادة توجيه هذه الرسالة إلى الأصدقاء والعائلة.

جرب FotoLabs AI لإنشاء صور رائعة لك بالذكاء الاصطناعي على WhatsApp. استخدم رمز العرض الترويجي`,
  },

  'referral 2': {
    en: `for your *first month FREE*! Just send message to https://wa.me/971505072100`,
    pt: `para o seu *primeiro mês GRATUITO*! Basta enviar uma mensagem para https://wa.me/971505072100`,
    ar: `للحصول على *الشهر الأول مجانًا*! فقط أرسل رسالة إلى https://wa.me/971505072100`,
  },

  'nsfw error': {
    en: `Uh-oh. Unsafe content detected 🚫. Please try a different prompt.`,
    pt: `Ops. Conteúdo inseguro detectado 🚫. Tente um prompt diferente.`,
    ar: `عذرًا. تم اكتشاف محتوى غير آمن 🚫. يرجى تجربة موجه آخر.`,
  },
};

export function getLanguageCode(language: string | undefined): LanguageCode {
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
