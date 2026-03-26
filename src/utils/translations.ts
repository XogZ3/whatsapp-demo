import { AppConfig } from './appConfig';
import {
  DAILY_CREDITS_LIMIT,
  TRAINING_IMAGES_LOWER_LIMIT,
  TRAINING_IMAGES_UPPER_LIMIT,
} from './constants';

// Define supported languages
type LanguageCode = 'en' | 'pt' | 'ar' | 'ms';
export type Language = 'english' | 'portuguese' | 'arabic' | 'malay';

// Define a type for translation keys
export type TranslationKeys =
  | 'cancel'
  | 'bypass'
  | 'upload photos'
  | 'language'
  | 'english'
  | 'portuguese'
  | 'arabic'
  | 'malay'
  | 'tutorial'
  | 'pricing'
  | 'create photo'
  | 'prompt'
  | 'yes'
  | 'maybe'
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
  | 'uploaded images confirmation 1'
  | 'uploaded images confirmation 2'
  | 'confirm'
  | 'delete'
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
  | 'new paywall message 1'
  | 'new paywall message 2'
  | 'experiment paywall message'
  | 'membership expired'
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
    ms: 'Batalkan',
  },
  bypass: {
    en: 'Bypass',
    pt: 'Ignorar',
    ar: 'تخطي',
    ms: 'Abaikan',
  },
  'upload photos': {
    en: 'Upload Photos',
    pt: 'Carregar Fotos',
    ar: 'رفع الصور',
    ms: 'Muat Foto',
  },
  language: {
    en: 'Language',
    pt: 'Idioma',
    ar: 'اللغة',
    ms: 'Bahasa',
  },
  tutorial: {
    en: 'Tutorial',
    pt: 'Tutorial',
    ar: 'دليل الاستخدام',
    ms: 'Panduan Penggunaan',
  },
  pricing: {
    en: `🎉 Special Offer: Get unlimited creativity with our exclusive deal! For just $9.99, enjoy 100 photos per day for 30 days. Show off your creations and impress your friends! Don’t miss out on this fantastic opportunity!`,
    pt: `🎉 Oferta Especial: Liberte sua criatividade com nossa oferta exclusiva! Por apenas $9,99, aproveite 100 fotos por dia durante 30 dias. Exiba suas criações e impressione seus amigos! Não perca esta oportunidade incrível!`,
    ar: `🎉 عرض خاص: أطلق العنان لإبداعك مع عرضنا الحصري! مقابل 9.99 دولار فقط، استمتع بإنشاء 100 صورة يوميًا لمدة 30 يومًا. اعرض إبداعاتك وأبهر أصدقائك! لا تفوت هذه الفرصة الرائعة!`,
    ms: `🎉 Penawaran Khusus: Akseskan kreativitas tanpa batas dengan penawaran kami yang eksklusif! Untuk hanya $9.99, nikmati 100 foto per hari untuk 30 hari. Tampilkan karyamu dan mengagumkan teman-teman! Jangan lewatkan kesempatan ini yang fantastis!`,
  },
  'create photo': {
    en: 'Create Photo',
    pt: 'Criar Foto',
    ar: 'إنشاء صورة',
    ms: 'Buat Foto',
  },
  yes: {
    en: 'Yes',
    pt: 'Sim',
    ar: 'نعم',
    ms: 'Ya',
  },
  maybe: {
    en: 'Maybe',
    pt: 'Talvez',
    ar: 'ربما',
    ms: 'Mungkin',
  },
  no: {
    en: 'No',
    pt: 'Não',
    ar: 'لا',
    ms: 'Tidak',
  },
  'notify pending photos 1': {
    en: 'Please send',
    pt: 'Por favor, envie',
    ar: 'يرجى إرسال',
    ms: 'Sila hantar',
  },
  'notify pending photos 2': {
    en: 'more photos of you.',
    pt: 'mais fotos suas.',
    ar: 'مزيد من الصور لك',
    ms: 'Lebih banyak foto anda.',
  },
  'main menu': {
    en: 'Main Menu',
    pt: 'Menu Principal',
    ar: 'القائمة الرئيسية',
    ms: 'Menu Utama',
  },
  'get membership': {
    en: 'Get Membership',
    pt: 'Obter Assinatura',
    ar: 'احصل على العضوية',
    ms: 'Dapatkan Keahlian',
  },
  'payment confirmed': {
    en: 'Payment Confirmed',
    pt: 'Pagamento Confirmado',
    ar: 'تم تأكيد الدفع',
    ms: 'Pembayaran Dikonfirmasi',
  },
  prompt: {
    en: 'Prompt',
    pt: 'Prompt',
    ar: 'موجه',
    ms: 'Prompt',
  },
  'select language': {
    en: 'Select language | Selecione o idioma | Pilih Bahasa',
    pt: 'Select language | Selecione o idioma | Pilih Bahasa',
    ar: 'Select language | Selecione o idioma | Pilih Bahasa',
    ms: 'Select language | Selecione o idioma | Pilih Bahasa',
  },
  english: {
    en: 'English',
    pt: 'Inglês',
    ar: 'إنجليزي',
    ms: 'Inggeris',
  },
  portuguese: {
    en: 'Portuguese',
    pt: 'Português',
    ar: 'برتغالي',
    ms: 'Portugis',
  },
  arabic: {
    en: 'Arabic',
    pt: 'Árabe',
    ar: 'عربي',
    ms: 'Arab',
  },
  malay: {
    en: 'Malay',
    pt: 'Melayu',
    ar: 'مليسيا',
    ms: 'Melayu',
  },
  'language selected': {
    en: 'English selected',
    pt: 'Português selecionado',
    ar: 'العربية المختارة',
    ms: 'Bahasa Malaysia dipilih',
  },
  'generating model': {
    en: "Generating model... Will send a message once it's ready. It will only take 2-3 minutes. ⚡",
    pt: 'Gerando modelo... Enviaremos uma mensagem quando estiver pronto. Isso levará apenas 2-3 minutos. ⚡',
    ar: 'جاري إنشاء النموذج... سنرسل لك رسالة بمجرد أن يصبح جاهزًا. سيستغرق الأمر دقيقتين إلى ثلاث دقائق فقط. ⚡',
    ms: 'Membuat model... Kami akan mengirim pesan kepada Anda setelah selesai. Ini hanya akan membutuhkan 2-3 menit. ⚡',
  },
  retry: {
    en: 'Retry',
    pt: 'Tentar novamente',
    ar: 'إعادة المحاولة',
    ms: 'Coba lagi',
  },
  'use prompt': {
    en: 'Use Prompt',
    pt: 'Usar Prompt',
    ar: 'استخدام الموجه',
    ms: 'Gunakan Prompt',
  },
  'improve prompt': {
    en: 'Improve Prompt',
    pt: 'Melhorar Prompt',
    ar: 'تحسين الموجه',
    ms: 'Perbaikan Prompt',
  },
  'photo upload instruction': {
    en: `Please upload ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} high-quality photos of yourself. Ensure you are the only person in the photo, and that the images have good lighting.`,
    pt: `Por favor, envie ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} fotos de alta qualidade de você. Certifique-se de que você seja a única pessoa na foto e que as imagens tenham boa iluminação.`,
    ar: `يرجى تحميل ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} صورة عالية الجودة لنفسك. تأكد من أنك الشخص الوحيد في الصورة وأن تكون الصور ذات إضاءة جيدة.`,
    ms: `Mohon unggah ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} foto kualitas tinggi dari diri Anda. Pastikan Anda adalah orang yang hanya ada dalam foto dan bahwa gambar memiliki pencahayaan yang baik.`,
  },
  'invalid input': {
    en: "⚠️ Oops!\n\nIt seems you've provided an invalid input.\n\nLet's give it another try.",
    pt: '⚠️ Opa!\n\nParece que você forneceu uma entrada inválida.\n\nVamos tentar novamente.',
    ar: '⚠️ عذرًا!\n\nيبدو أنك قدمت إدخالاً غير صالح.\n\nدعنا نحاول مرة أخرى.',
    ms: `⚠️ Oops!\n\nTampaknya Anda telah memberikan input yang tidak valid.\n\nMari kita coba lagi.`,
  },
  'intro message': {
    en: `👋 Welcome to FotoLabs.ai!
Want to create cool AI photos like these? Make a payment of ~$29.99~ $19.99 using the link below and generate unlimited images for 30 days!`,
    pt: `👋 Bem-vindo ao FotoLabs.ai!
Quer criar fotos incríveis de IA como essas? Faça um pagamento de ~$29,99~ $19,99 usando o link abaixo e gere imagens ilimitadas por 30 dias!`,
    ar: `👋 مرحبًا بك في FotoLabs.ai!
هل تريد إنشاء صور رائعة بالذكاء الاصطناعي مثل هذه؟ قم بالدفع ~$29.99~ $19.99 باستخدام الرابط أدناه وابدأ في إنشاء صور غير محدودة لمدة 30 يومًا!`,
    ms: `👋 Selamat datang di FotoLabs.ai!
Apakah Anda ingin membuat foto AI yang keren seperti ini? Bayar ~$29.99~ $19.99 menggunakan tautan di bawah ini dan mulai membuat foto tak terbatas untuk 30 hari!`,
  },
  'intro message img': {
    en: `👋 Welcome to FotoLabs.ai! Want to create cool AI photos like these?
Click 'Upload Photos' button to get started.`,
    pt: `👋 Bem-vindo ao FotoLabs.ai! Quer criar fotos incríveis de IA como essas?
Clique no botão 'Enviar Fotos' para começar.`,
    ar: `👋 مرحبًا بك في FotoLabs.ai! هل تريد إنشاء صور رائعة بالذكاء الاصطناعي مثل هذه؟
انقر على زر 'تحميل الصور' للبدء.`,
    ms: `👋 Selamat datang di FotoLabs.ai! Apakah Anda ingin membuat foto AI yang keren seperti ini?
Klik tombol 'Unggah Foto' untuk memulai.`,
  },
  'tutorial message': {
    en: `📸 How to Use FotoLabs.ai\n\nUpload Photos: Send ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} photos of yourself to create your personalized model.\nMake Payment: Create unlimited photos of your AI self in any scenario you can imagine for just ~$29.99~ $19.99/month.\nGet Samples: Once your model is ready, you'll receive a few sample images.\nGenerate Images: Start generating images by sending prompts like "handsome man as a superhero" or "gorgeous woman in Paris."\nIt's that easy! Ready to explore? 😊`,
    pt: `📸 Como Usar o FotoLabs.ai\n\nEnviar Fotos: Envie ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} fotos suas para criar seu modelo personalizado.\nFaça o Pagamento: Crie fotos ilimitadas de sua versão de IA em qualquer cenário que puder imaginar por apenas ~$29,99~ $19,99/mês.\nObter Amostras: Quando seu modelo estiver pronto, você receberá algumas imagens de amostra.\nGerar Imagens: Comece a gerar imagens enviando prompts como "homem bonito como um super-herói" ou "mulher deslumbrante em Paris."\nÉ tão fácil! Pronto para explorar? 😊`,
    ar: `📸 كيفية استخدام FotoLabs.ai\n\nتحميل الصور: أرسل ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} صورة لنفسك لإنشاء نموذجك الشخصي.\nقم بالدفع: أنشئ صورًا غير محدودة لنسختك الذكية الاصطناعية في أي سيناريو يمكنك تخيله مقابل ~29.99~ 19.99 دولارًا فقط شهريًا.\nاحصل على عينات: بمجرد أن يكون نموذجك جاهزًا، ستتلقى بعض الصور كعينات.\nإنشاء الصور: ابدأ في إنشاء الصور عن طريق إرسال موجهات مثل "رجل وسيم كبطل خارق" أو "امرأة جميلة في باريس".\nإنه بهذه السهولة! هل أنت مستعد للاستكشاف؟ 😊`,
    ms: `📸 Cara Menggunakan FotoLabs.ai\n\nUnggah Foto: Kirim ${TRAINING_IMAGES_LOWER_LIMIT}-${TRAINING_IMAGES_UPPER_LIMIT} foto diri Anda untuk membuat model peribadi Anda.\nBuat Pembayaran: Cipta foto AI tanpa had dalam apa jua senario yang Anda boleh bayangkan dengan hanya ~$29.99~ $19.99/bulan.\nDapatkan Sampel: Setelah model Anda siap, Anda akan menerima beberapa gambar contoh.\nHasilkan Gambar: Mulakan menghasilkan gambar dengan menghantar arahan seperti "lelaki kacak sebagai superhero" atau "wanita cantik di Paris."\nSemudah itu! Bersedia untuk meneroka? 😊`,
  },
  'generating image': {
    en: 'Generating image, please wait 30 seconds...',
    pt: 'Gerando imagem, por favor, aguarde 30 segundos...',
    ar: 'جارٍ إنشاء الصورة، يرجى الانتظار لمدة 30 ثانية...',
    ms: 'Membuat gambar, sila tunggu 30 detik...',
  },
  'please wait generating model': {
    en: `🧠✨ Please wait while we are generating a customized model for you. Relax, it won't be long! 😊`,
    pt: `🧠✨ Por favor, aguarde enquanto geramos um modelo personalizado para você. Relaxe, não vai demorar! 😊`,
    ar: `🧠✨ يرجى الانتظار بينما نقوم بإنشاء نموذج مخصص لك. استرخِ، لن يستغرق الأمر وقتًا طويلاً! 😊`,
    ms: `🧠✨ Sila tunggu sementara kami membuat model khusus untuk Anda. Relaks, tidak akan lama! 😊`,
  },
  'model generation failed': {
    en: `Oops. Your AI model generation has failed. Please click the button below to try again.`,
    pt: `Ops. A geração do seu modelo de IA falhou. Por favor, clique no botão abaixo para tentar novamente.`,
    ar: `عذرًا، فشلت عملية إنشاء نموذج الذكاء الاصطناعي الخاص بك. يرجى النقر على الزر أدناه للمحاولة مرة أخرى.`,
    ms: `🧠✨ Sila tunggu sementara kami membuat model khusus untuk Anda. Relaks, tidak akan lama! 😊`,
  },
  'model already exists': {
    en: 'Your custom AI model already exists. Send your prompt now!',
    pt: 'Seu modelo de IA personalizado já existe. Envie seu prompt agora!',
    ar: 'نموذج الذكاء الاصطناعي المخصص لك موجود بالفعل. أرسل موجهك الآن!',
    ms: 'Model AI khusus Anda sudah ada. Kirim prompt Anda sekarang!',
  },
  'model generated': {
    en: `🎉 Your model has been successfully generated! 😊`,
    pt: `🎉 Seu modelo foi gerado com sucesso! 😊`,
    ar: `🎉 تم إنشاء نموذجك بنجاح! 😊`,
    ms: `🎉 Model AI khusus Anda sudah ada. Kirim prompt Anda sekarang!`,
  },
  'experiment paywall message': {
    en: `🚀 Ready to create even more stunning AI photos of yourself?`,
    pt: `🚀 Pronto para criar fotos de IA ainda mais incríveis de você?`,
    ar: `🚀 هل أنت مستعد لإنشاء صور ذكاء اصطناعي أكثر إبهارًا لنفسك؟`,
    ms: `🚀 Siap untuk membuat foto AI yang lebih menakjubkan dari diri Anda?`,
  },
  'payment instructions': {
    en: 'Please complete payment using this link.',
    pt: 'Por favor, complete o pagamento usando este link.',
    ar: 'يرجى إكمال الدفع باستخدام هذا الرابط.',
    ms: 'Sila lengkapkan pembayaran menggunakan tautan ini.',
  },
  'payment confirmation': {
    en: 'Thank you! Your payment was successful. ✅🎉',
    pt: 'Obrigado! Seu pagamento foi bem-sucedido. ✅🎉',
    ar: 'شكرًا لك! تم الدفع بنجاح. ✅🎉',
    ms: 'Terima kasih! Pembayaran Anda berhasil. ✅🎉',
  },
  'analyzing photo': {
    en: 'Analyzing photo...',
    pt: 'Analisando a foto...',
    ar: 'جارٍ تحليل الصورة...',
    ms: 'Menganalisis foto...',
  },
  'prompting instruction': {
    en: '✨ Send your prompt now.',
    pt: '✨ Envie sua solicitação agora.',
    ar: '✨ أرسل طلبك الآن.',
    ms: '✨ Kirim prompt Anda sekarang.',
  },
  'prompt confirmation': {
    en: `Do you want to generate image with following prompt?`,
    pt: `Você quer gerar uma imagem com a seguinte solicitação?`,
    ar: `هل تريد إنشاء صورة مع الطلب التالي؟`,
    ms: `Apakah Anda ingin membuat gambar dengan prompt berikut?`,
  },
  'please wait machine busy': {
    en: `🤖💭 Please wait while FotoLabs AI is working... Relax, we'll be ready soon! ☕️`,
    pt: `🤖💭 Por favor, aguarde enquanto o FotoLabs AI está processando... Relaxe, estaremos prontos em breve! ☕️`,
    ar: `🤖💭 يرجى الانتظار بينما يعمل FotoLabs AI... استرخِ، سنكون جاهزين قريبًا! ☕️`,
    ms: `🤖💭 Sila tunggu sementara FotoLabs AI bekerja... Relaks, kami akan siap segera! ☕️`,
  },
  'new prompt request': {
    en: 'Alright, send a new prompt. :)',
    pt: 'Tudo bem, envie uma nova solicitação. :)',
    ar: 'حسنًا، أرسل طلبًا جديدًا. :)',
    ms: 'Baiklah, kirim prompt baru. :)',
  },
  'photo received': {
    en: 'Photos uploaded',
    pt: 'Fotos carregadas',
    ar: 'تم رفع الصور',
    ms: 'Foto diunggah',
  },
  'finish upload': {
    en: 'Finish Upload',
    pt: 'Concluir Upload',
    ar: 'إنهاء الرفع',
    ms: 'Selesai Upload',
  },
  'uploaded images confirmation 1': {
    en: `You have uploaded`,
    pt: `Você enviou`,
    ar: `لقد قمت بإرفاق`,
    ms: `Anda telah mengunggah`,
  },
  'uploaded images confirmation 2': {
    en: `images.\nSelect "Confirm" to use them to create your AI model.\nSelect "Delete" to delete all the uploaded images, and then upload new / different set of images.`,
    pt: `imagens.\nSelecione "Confirmar" para usá-las para criar seu modelo de IA.\nSelecione "Excluir" para excluir todas as imagens enviadas e, em seguida, envie um novo conjunto de imagens.`,
    ar: `صور.\nحدد "تأكيد" لاستخدامها لإنشاء نموذج الذكاء الاصطناعي الخاص بك.\nحدد "حذف" لإزالة جميع الصور التي تم رفعها، ثم قم برفع مجموعة صور جديدة / مختلفة.`,
    ms: `Gambar.\nPilih "Konfirmasi" untuk menggunakan mereka untuk membuat model AI Anda.\nPilih "Hapus" untuk menghapus semua gambar yang telah diunggah, lalu unggah kumpulan gambar baru / berbeda.`,
  },
  confirm: {
    en: 'Confirm',
    pt: 'Confirmar',
    ar: 'تأكيد',
    ms: 'Konfirmasi',
  },
  delete: {
    en: 'Delete',
    pt: 'Excluir',
    ar: 'حذف',
    ms: 'Hapus',
  },
  'uploading please wait': {
    en: 'Some images are still being uploaded, please wait.\n\nClick "finish upload" button after all the images have been uploaded.',
    pt: 'Algumas imagens ainda estão sendo enviadas, por favor, aguarde.\n\nClique no botão "concluir upload" após o envio de todas as imagens.',
    ar: 'يتم تحميل بعض الصور، يرجى الانتظار.\n\nانقر على زر "إكمال التحميل" بعد تحميل جميع الصور.',
    ms: 'Beberapa gambar sedang diunggah, sila tunggu.\n\nKlik tombol "Selesai Upload" setelah semua gambar telah diunggah.',
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
    ms: `Kami minta maaf untuk memberitahu Anda bahwa kami tidak dapat menghasilkan model Anda secara gratis. 😔 Karena permintaan yang tinggi, kami harus menunda pembangunan model gratis.

Namun, dengan menjadi *pengguna bayar*, Anda dapat melanjutkan membuat model AI personal Anda.
Kami menghargai pemahaman dan dukungan Anda! 🙏💖`,
  },
  'discount message 1': {
    en: 'Hey! 🎉 You have been selected for a special discount. Use code',
    pt: 'Ei! 🎉 Você foi selecionado para um desconto especial. Use o código',
    ar: 'مرحبًا! 🎉 لقد تم اختيارك لخطة مخفضة. استخدم الرمز',
    ms: 'Hey! 🎉 Anda telah dipilih untuk diskon khusus. Gunakan kode',
  },
  'discount message 2': {
    en: 'to get 50% off! 🚨 Use this code within 12 hours to get FotoLabs AI for only $9.99.',
    pt: 'para obter 50% de desconto! 🚨 Use este código dentro de 12 horas para obter FotoLabs AI por apenas $9.99.',
    ar: 'للحصول على 50% من الخطة الشهرية الخاصة بك! 🚨 استخدم هذا الرمز خلال 12 ساعة للحصول على FotoLabs AI بسعر $9.99 فقط.',
    ms: 'untuk mendapatkan diskon 50%! 🚨 Gunakan kode ini dalam 12 jam untuk mendapatkan FotoLabs AI hanya $9.99.',
  },
  'new paywall message 1': {
    en: `🎉 WOW! Your Photos Look Amazing! 🌟
We're super excited about the potential of your AI model! 
✨ Your personal activation link is ready
⚡ Complete payment to start generating incredible photos

→ Complete & Start Generating Now 🚀`,
    pt: `🎉 UAU! Suas Fotos Estão Incríveis! 🌟
Estamos super empolgados com o potencial do seu modelo de IA!
✨ Seu link de ativação pessoal está pronto
⚡ Complete o pagamento para começar a gerar fotos incríveis`,
    ar: `🎉 واو! صورك تبدو مذهلة! 🌟
نحن متحمسون للغاية لإمكانيات نموذج الذكاء الاصطناعي الخاص بك!
✨ رابط التفعيل الشخصي الخاص بك جاهز
⚡ أكمل الدفع لتبدأ في إنشاء صور رائعة

→ أكمل وابدأ في الإنشاء الآن 🚀`,
    ms: `🎉 WAH! Foto-foto Anda Kelihatan Menakjubkan! 🌟
Kami sangat senang dengan potensi model AI Anda!
✨ Tautan aktivasi pribadi Anda siap
⚡ Lengkapi pembayaran untuk memulai membuat foto yang luar biasa

→ Lengkapi & Mulai Membuat Sekarang 🚀`,
  },
  'new paywall message 2': {
    en: `💎 Regular price: $29.99 ✨ Save $10

📱 Generate unlimited AI photos in WhatsApp for 30 days:
- 🎯 Create in just 3 minutes with 5-15 selfies
- 🔄 Unlimited high-quality AI photo generation
- ⚡ Super-fast results directly in WhatsApp
- ✅ High resemblance & photorealism guaranteed

🌟 Everything You Can Create:
- 👔 Professional LinkedIn headshots
- 💝 Stunning dating profile photos
- 🌴 Instagram-worthy travel pictures
- 👗 Virtual outfit try-ons before shopping
- 💇‍♀ Custom hairstyle transformations
- 🌎 Photos in any location worldwide
- 🎭 Personalized AI model that looks like you

🏆 Why FotoLabs AI is Better:
- 💫 Higher resemblance than Midjourney
- 🎯 Easier than ComfyUI - no tech skills needed
- 📱 Works right in WhatsApp - no apps needed
- ⚡ Super fast generation - get photos instantly
- 📸 Professional quality without photographers

🎯 You're just one step away:
1. 💳 Complete payment now
2. 🎨 Start generating unlimited photos immediately!

⏰ Secure link expires in 24 hours`,
    pt: `💎 Preço regular: R$29,99 ✨ Economize R$10

📱 Gere fotos ilimitadas de IA no WhatsApp por 30 dias:
- 🎯 Crie em apenas 3 minutos com 5-15 selfies
- 🔄 Geração ilimitada de fotos de alta qualidade
- ⚡ Resultados super rápidos diretamente no WhatsApp
- ✅ Alta semelhança e fotorrealismo garantidos

🌟 Tudo o que você pode criar:
- 👔 Fotos profissionais para o LinkedIn
- 💝 Fotos impressionantes para perfis de namoro
- 🌴 Fotos de viagem dignas de Instagram
- 👗 Experimentação virtual de roupas antes de comprar
- 💇‍♀ Transformações personalizadas de penteado
- 🌎 Fotos em qualquer lugar do mundo
- 🎭 Modelo de IA personalizado que se parece com você

🏆 Por que o FotoLabs AI é melhor:
- 💫 Semelhança maior que o Midjourney
- 🎯 Mais fácil que o ComfyUI - sem necessidade de habilidades técnicas
- 📱 Funciona direto no WhatsApp - sem necessidade de aplicativos
- ⚡ Geração super rápida - obtenha fotos instantaneamente
- 📸 Qualidade profissional sem precisar de fotógrafos

🎯 Você está apenas um passo longe:
1. 💳 Complete o pagamento agora
2. 🎨 Comece a gerar fotos ilimitadas imediatamente!

⏰ O link seguro expira em 24 horas`,
    ar: `💎 السعر العادي: $29.99 ✨ وفر $10

📱 توليد صور غير محدودة للذكاء الاصطناعي على WhatsApp لمدة 30 يومًا:
- 🎯 إنشاء في 3 دقائق فقط باستخدام 5-15 صورة شخصية
- 🔄 توليد صور AI عالية الجودة بدون حدود
- ⚡ نتائج فائقة السرعة مباشرةً على WhatsApp
- ✅ ضمان التشابه العالي والواقعية

🌟 كل ما يمكنك إنشاؤه:
- 👔 صور احترافية لرأس LinkedIn
- 💝 صور رائعة لملفات المواعدة الشخصية
- 🌴 صور جذابة على إنستغرام لمواقع سياحية
- 👗 تجريب افتراضي للأزياء قبل الشراء
- 💇‍♀️ تحولات مخصصة للشعر
- 🌎 صور في أي موقع حول العالم
- 🎭 نموذج ذكاء اصطناعي شخصي يشبهك

🏆 لماذا FotoLabs AI أفضل:
- 💫 تشابه أعلى من Midjourney
- 🎯 أسهل من ComfyUI - لا حاجة لمهارات تقنية
- 📱 يعمل مباشرةً على WhatsApp - لا حاجة للتطبيقات
- ⚡ توليد سريع جدًا - احصل على الصور فورًا
- 📸 جودة احترافية بدون مصورين

🎯 أنت على بعد خطوة واحدة:
1. 💳 أكمل الدفع الآن
2. 🎨 ابدأ توليد الصور غير المحدودة فورًا!

⏰ الرابط الآمن ينتهي بعد 24 ساعة`,
    ms: `💎 Harga biasa: $29.99 ✨ Jimat $10

📱 Jana foto AI tanpa had di WhatsApp selama 30 hari:
- 🎯 Cipta dalam masa 3 minit dengan 5-15 swafoto
- 🔄 Penjanaan foto AI berkualiti tinggi tanpa had
- ⚡ Hasil super pantas terus di WhatsApp
- ✅ Jaminan kemiripan & fotorealistik yang tinggi

🌟 Semua Yang Anda Boleh Cipta:
- 👔 Gambar profil LinkedIn profesional
- 💝 Foto profil dating yang menakjubkan
- 🌴 Gambar perjalanan yang layak untuk Instagram
- 👗 Cubaan pakaian maya sebelum membeli
- 💇‍♀ Transformasi gaya rambut tersuai
- 🌎 Foto di mana-mana lokasi di seluruh dunia
- 🎭 Model AI peribadi yang kelihatan seperti anda

🏆 Mengapa FotoLabs AI Lebih Baik:
- 💫 Kemiripan lebih tinggi berbanding Midjourney
- 🎯 Lebih mudah dari ComfyUI - tiada kemahiran teknikal diperlukan
- 📱 Berfungsi terus di WhatsApp - tiada aplikasi diperlukan
- ⚡ Penjanaan super pantas - dapatkan foto serta-merta
- 📸 Kualiti profesional tanpa jurugambar

🎯 Anda hanya selangkah lagi:
1. 💳 Selesaikan pembayaran sekarang
2. 🎨 Mula jana foto tanpa had dengan segera!

⏰ Pautan selamat tamat dalam masa 24 jam`,
  },

  paywall: {
    en: `🎉 WOW! Your Photos Look Amazing! 🌟
We're super excited about the potential of your AI model!
✨ Your personal activation link is ready
⚡ Complete payment to start generating incredible photos

📱 Generate unlimited AI photos in WhatsApp for 30 days:
•⁠  ⁠🎯 Create in just 3 minutes with 5-15 selfies
•⁠  ⁠🔄 Unlimited high-quality AI photo generation
•⁠  ⁠⚡ Super-fast results directly in WhatsApp
•⁠  ⁠✅ High resemblance & photorealism guaranteed

🌟 Everything You Can Create:
•⁠  ⁠👔 Professional LinkedIn headshots
•⁠  ⁠💝 Stunning dating profile photos
•⁠  ⁠🌴 Instagram-worthy travel pictures
•⁠  ⁠👗 Virtual outfit try-ons before shopping
•⁠  ⁠💇‍♀️ Custom hairstyle transformations
•⁠  ⁠🌎 Photos in any location worldwide
•⁠  ⁠🎭 Personalized AI model that looks like you

🏆 Why FotoLabs AI is Better:
•⁠  ⁠💫 Higher resemblance than Midjourney
•⁠  ⁠🎯 Easier than ComfyUI - no tech skills needed
•⁠  ⁠📱 Works right in WhatsApp - no apps needed
•⁠  ⁠⚡ Super fast generation - get photos instantly
•⁠  ⁠📸 Professional quality without photographers

🎯 You're just one step away:
1.⁠ ⁠💳 Complete payment now
2.⁠ ⁠🎨 Start generating unlimited photos immediately!

→ Complete & Start Generating Now 🚀
💎 Regular price: $29.99
✨ Save $10 now using this secure link, expires in 24 hours`,

    pt: `🎉 UAU! Suas Fotos Estão Incríveis! 🌟
Estamos super empolgados com o potencial do seu modelo de IA!
✨ Seu link de ativação pessoal está pronto
⚡ Complete o pagamento para começar a gerar fotos incríveis

📱 Gere fotos ilimitadas de IA no WhatsApp por 30 dias:
•⁠  ⁠🎯 Crie em apenas 3 minutos com 5-15 selfies
•⁠  ⁠🔄 Geração ilimitada de fotos de alta qualidade
•⁠  ⁠⚡ Resultados super rápidos diretamente no WhatsApp
•⁠  ⁠✅ Garantia de alta semelhança e fotorrealismo

🌟 Tudo o que Você Pode Criar:
•⁠  ⁠👔 Fotos profissionais para o LinkedIn
•⁠  ⁠💝 Fotos impressionantes para perfis de namoro
•⁠  ⁠🌴 Fotos dignas de Instagram em locais paradisíacos
•⁠  ⁠👗 Experimentação virtual de roupas antes de comprar
•⁠  ⁠💇‍♀️ Transformações personalizadas de penteado
•⁠  ⁠🌎 Fotos em qualquer lugar do mundo
•⁠  ⁠🎭 Modelo de IA personalizado que parece com você

🏆 Por que o FotoLabs AI é Melhor:
•⁠  ⁠💫 Semelhança maior que o Midjourney
•⁠  ⁠🎯 Mais fácil que o ComfyUI - sem necessidade de habilidades técnicas
•⁠  ⁠📱 Funciona direto no WhatsApp - sem aplicativos necessários
•⁠  ⁠⚡ Geração super rápida - obtenha fotos instantaneamente
•⁠  ⁠📸 Qualidade profissional sem precisar de fotógrafos

🎯 Você está a um passo:
1.⁠ ⁠💳 Complete o pagamento agora
2.⁠ ⁠🎨 Comece a gerar fotos ilimitadas imediatamente!

→ Complete e Comece a Gerar Agora 🚀
💎 Preço normal: $29,99
✨ Economize $10 agora usando este link seguro, expira em 24 horas`,

    ar: `🎉 واو! صورك تبدو مذهلة! 🌟
نحن متحمسون جدًا لإمكانيات نموذج الذكاء الاصطناعي الخاص بك!
✨ رابط التفعيل الشخصي جاهز
⚡ أكمل الدفع لبدء توليد الصور الرائعة

→ أكمل وابدأ التوليد الآن 🚀
[زر الدفع: $19.99]
💎 السعر العادي: $29.99 ✨ وفر $10

📱 توليد صور غير محدودة للذكاء الاصطناعي على WhatsApp لمدة 30 يومًا:
•⁠  ⁠🎯 أنشئ في 3 دقائق فقط باستخدام 5-15 صورة شخصية
•⁠  ⁠🔄 توليد صور AI عالية الجودة بدون حدود
•⁠  ⁠⚡ نتائج فائقة السرعة مباشرةً على WhatsApp
•⁠  ⁠✅ ضمان التشابه العالي والواقعية

🌟 كل ما يمكنك إنشاؤه:
•⁠  ⁠👔 صور احترافية لرأس LinkedIn
•⁠  ⁠💝 صور رائعة لملفات المواعدة الشخصية
•⁠  ⁠🌴 صور جذابة على إنستغرام لمواقع سياحية
•⁠  ⁠👗 تجريب افتراضي للأزياء قبل الشراء
•⁠  ⁠💇‍♀️ تحولات مخصصة للشعر
•⁠  ⁠🌎 صور في أي موقع حول العالم
•⁠  ⁠🎭 نموذج ذكاء اصطناعي شخصي يشبهك

🏆 لماذا FotoLabs AI أفضل:
•⁠  ⁠💫 تشابه أعلى من Midjourney
•⁠  ⁠🎯 أسهل من ComfyUI - لا حاجة لمهارات تقنية
•⁠  ⁠📱 يعمل مباشرةً على WhatsApp - لا حاجة للتطبيقات
•⁠  ⁠⚡ توليد سريع جدًا - احصل على الصور فورًا
•⁠  ⁠📸 جودة احترافية بدون مصورين

🎯 أنت على بعد خطوة واحدة:
1.⁠ ⁠💳 أكمل الدفع الآن
2.⁠ ⁠🎨 ابدأ توليد الصور غير المحدودة فورًا!

→ أكمل وابدأ التوليد الآن 🚀
💎 السعر العادي: $29.99
✨ وفر $10 الآن باستخدام هذا الرابط الآمن، ينتهي خلال 24 ساعة`,
    ms: `🎉 WAH! Foto Anda Kelihatan Mengagumkan! 🌟
Kami sangat teruja dengan potensi model AI anda!
✨ Pautan pengaktifan peribadi anda sudah sedia
⚡ Lengkapkan pembayaran untuk mula menjana foto yang menakjubkan

📱 Jana foto AI tanpa had di WhatsApp selama 30 hari:
•⁠  ⁠🎯 Cipta dalam masa 3 minit dengan 5-15 swafoto
•⁠  ⁠🔄 Penjanaan foto AI berkualiti tinggi tanpa had
•⁠  ⁠⚡ Hasil super pantas terus di WhatsApp
•⁠  ⁠✅ Kemiripan tinggi & fotorealisme dijamin

🌟 Semua Yang Anda Boleh Cipta:
•⁠  ⁠👔 Gambar profil LinkedIn profesional
•⁠  ⁠💝 Foto profil dating yang memukau
•⁠  ⁠🌴 Gambar perjalanan yang layak untuk Instagram
•⁠  ⁠👗 Cuba pakaian secara maya sebelum membeli
•⁠  ⁠💇‍♀️ Transformasi gaya rambut tersuai
•⁠  ⁠🌎 Foto di mana-mana lokasi di seluruh dunia
•⁠  ⁠🎭 Model AI peribadi yang kelihatan seperti anda

🏆 Mengapa FotoLabs AI Lebih Baik:
•⁠  ⁠💫 Kemiripan lebih tinggi berbanding Midjourney
•⁠  ⁠🎯 Lebih mudah dari ComfyUI - tiada kemahiran teknikal diperlukan
•⁠  ⁠📱 Berfungsi terus di WhatsApp - tiada aplikasi diperlukan
•⁠  ⁠⚡ Penjanaan super pantas - dapat foto serta-merta
•⁠  ⁠📸 Kualiti profesional tanpa jurugambar

🎯 Anda hanya selangkah lagi:
1.⁠ ⁠💳 Lengkapkan pembayaran sekarang
2.⁠ ⁠🎨 Mula jana foto tanpa had dengan serta-merta!

→ Lengkapkan & Mula Menjana Sekarang 🚀
💎 Harga biasa: $29.99
✨ Jimat $10 sekarang menggunakan pautan selamat ini, tamat dalam 24 jam`,
  },
  'active membership': {
    en: 'You already have an existing membership. Send your prompt now. :)',
    pt: 'Você já tem uma assinatura existente. Envie seu prompt agora. :)',
    ar: 'لديك عضوية موجودة بالفعل. أرسل طلبك الآن. :)',
    ms: 'Anda sudah memiliki keanggotaan yang sudah ada. Kirim prompt Anda sekarang. :)',
  },
  'reached limit': {
    en: `Woah, you've generated ${DAILY_CREDITS_LIMIT} images today! Take a break, you can start making images tomorrow :)`,
    pt: `Uau, você gerou ${DAILY_CREDITS_LIMIT} imagens hoje! Faça uma pausa, você pode começar a criar imagens novamente amanhã :)`,
    ar: `واو، لقد أنشأت ${DAILY_CREDITS_LIMIT} صورة اليوم! خذ استراحة، يمكنك البدء في إنشاء الصور مرة أخرى غدًا :)`,
    ms: `Wah, anda telah menjana ${DAILY_CREDITS_LIMIT} gambar hari ini! Rehat sebentar, anda boleh mula menjana gambar esok :)`,
  },
  'confirm cancellation 1': {
    en: 'Please note that your subscription is valid till',
    pt: 'Observe que sua assinatura é válida até',
    ar: 'يرجى ملاحظة أن اشتراكك ساري حتى',
    ms: 'Harap perhatikan bahwa keanggotaan Anda berlaku sampai',
  },
  'confirm cancellation 2': {
    en: 'You will NOT receive any refunds.\nAfter successful cancellation, you will not be charged anything in the following month.\n\nClick "Cancel Subscription" button to confirm.\nClick "Back to Safety" button to return to generating awesome photos.',
    pt: 'Você NÃO receberá reembolsos.\nApós o cancelamento bem-sucedido, você não será cobrado no mês seguinte.\n\nClique no botão "Cancelar Assinatura" para confirmar.\nClique no botão "Voltar para Segurança" para continuar gerando fotos incríveis.',
    ar: 'لن تتلقى أي رد أموال.\nبعد إلغاء الاشتراك بنجاح، لن يتم خصم أي رسوم في الشهر التالي.\n\nانقر على زر "إلغاء الاشتراك" للتأكيد.\nانقر على زر "العودة إلى الأمان" للعودة إلى إنشاء صور رائعة.',
    ms: 'Anda tidak akan menerima pengembalian apa pun.\nSetelah pembatalan berhasil, Anda tidak akan dikenakan biaya apa pun bulan depan.\n\nKlik tombol "Membatalkan Langganan" untuk mengonfirmasi.\nKlik tombol "Kembali ke Aman" untuk kembali membuat foto yang menakjubkan.',
  },
  'cancel subscription': {
    en: 'Cancel Subscription',
    pt: 'Cancelar Assinatura',
    ar: 'إلغاء الاشتراك',
    ms: 'Batalkan langganan',
  },
  'back to safety': {
    en: 'Back to Safety',
    pt: 'Voltar seguro',
    ar: 'العودة إلى الأمان',
    ms: 'Kembali selamat',
  },
  'cancellation success': {
    en: 'Your FotoLabs subscription has been cancelled successfully. 🤝',
    pt: 'Sua assinatura do FotoLabs foi cancelada com sucesso. 🤝',
    ar: 'تم إلغاء اشتراكك في FotoLabs بنجاح. 🤝',
    ms: 'Langganan FotoLabs Anda telah berhasil dibatalkan. 🤝',
  },
  'cancellation fail': {
    en: `There was an issue with the cancellation request. Please send an email to ${AppConfig.email}`,
    pt: `Houve um problema com o pedido de cancelamento. Por favor, envie um e-mail para ${AppConfig.email}`,
    ar: `حدثت مشكلة في طلب الإلغاء. يرجى إرسال بريد إلكتروني إلى ${AppConfig.email}`,
    ms: `Terjadi masalah dengan permintaan pembatalan. Silakan kirim email ke ${AppConfig.email}`,
  },
  'cancellation cancelled': {
    en: 'Cool. Your cancellation request has been cancelled. You can safely continue enjoying FotoLabs. 😮‍💨',
    pt: 'Legal. Seu pedido de cancelamento foi cancelado. Você pode continuar aproveitando o FotoLabs com segurança. 😮‍💨',
    ar: 'رائع. تم إلغاء طلب الإلغاء الخاص بك. يمكنك الاستمرار في الاستمتاع بـ FotoLabs بأمان. 😮‍💨',
    ms: 'Bagus. Permintaan pembatalan Anda telah dibatalkan. Anda dapat terus menikmati FotoLabs dengan aman. 😮‍💨',
  },
  'already cancelled': {
    en: 'Your subscription has already been cancelled.',
    pt: 'Sua assinatura já foi cancelada.',
    ar: 'تم إلغاء اشتراكك بالفعل.',
    ms: 'Langganan Anda sudah dibatalkan.',
  },
  'unknown error': {
    en: 'Uh-oh. Something went wrong, please try again after some time.',
    pt: 'Ops. Algo deu errado, por favor tente novamente mais tarde.',
    ar: 'أوه، حدث خطأ ما، يرجى المحاولة مرة أخرى بعد بعض الوقت.',
    ms: 'Wah, terjadi kesalahan, silakan coba lagi setelah beberapa waktu.',
  },
  'payment failed': {
    en: 'Payment failed. Please try again or contact support if the issue persists.',
    pt: 'O pagamento falhou. Por favor, tente novamente ou entre em contato com o suporte se o problema persistir.',
    ar: 'فشل الدفع. يرجى المحاولة مرة أخرى أو الاتصال بالدعم إذا استمرت المشكلة.',
    ms: 'Pembayaran gagal. Silakan coba lagi atau hubungi dukungan jika masalah ini berlanjut.',
  },
  'support email': {
    en: `Please email us for support at ${process.env.NEXT_PUBLIC_EMAIL}`,
    pt: `Por favor, envie um e-mail para suporte em ${process.env.NEXT_PUBLIC_EMAIL}`,
    ar: `يرجى مراسلتنا عبر البريد الإلكتروني للدعم على ${process.env.NEXT_PUBLIC_EMAIL}`,
    ms: `Silakan kirim email ke ${process.env.NEXT_PUBLIC_EMAIL} untuk dukungan`,
  },
  'referral 1': {
    en: `Hey! 🎉 Like these AI-generated images? Share this awesomeness! Feel free to forward this message to friends and family.

Try FotoLabs AI to create awesome AI photos of you in WhatsApp. Use promo code`,
    pt: `Ei! 🎉 Gostou dessas imagens geradas por IA? Compartilhe essa novidade! Sinta-se à vontade para encaminhar esta mensagem para amigos e familiares.

Experimente o FotoLabs AI para criar fotos incríveis de IA suas no WhatsApp. Use o código promocional`,
    ar: `مرحبًا! 🎉 هل أعجبتك هذه الصور المولدة بالذكاء الاصطناعي؟ شارك هذه الروعة! لا تتردد في إعادة توجيه هذه الرسالة إلى الأصدقاء والعائلة.

جرب FotoLabs AI لإنشاء صور رائعة لك بالذكاء الاصطناعي على WhatsApp. استخدم رمز العرض الترويجي`,
    ms: `Hai! 🎉 Suka dengan gambar yang dihasilkan AI ini? Kongsi kehebatan ini! Silakan teruskan mesej ini kepada rakan dan keluarga.

Cuba FotoLabs AI untuk mencipta foto AI anda yang mengagumkan di WhatsApp. Gunakan kod promo`,
  },

  'referral 2': {
    en: `for your *first month FREE*! Just send message to https://wa.me/971505072100`,
    pt: `para o seu *primeiro mês GRATUITO*! Basta enviar uma mensagem para https://wa.me/971505072100`,
    ar: `للحصول على *الشهر الأول مجانًا*! فقط أرسل رسالة إلى https://wa.me/971505072100`,
    ms: `untuk *bulan pertama GRATIS*! Cukup kirim pesan ke https://wa.me/971505072100`,
  },
  'membership expired': {
    en: 'Your membership has expired. Please contact us for support: hello@fotolabs.ai',
    pt: 'Sua assinatura expirou. Por favor, entre em contato conosco para suporte: hello@fotolabs.ai',
    ar: 'تم انتهاء اشتراكك. يرجى الاتصال بنا للدعم: hello@fotolabs.ai',
    ms: 'Langganan Anda telah berakhir. Silakan hubungi kami untuk dukungan: hello@fotolabs.ai',
  },
  'nsfw error': {
    en: `Uh-oh. Unsafe content detected 🚫. Please try a different prompt.`,
    pt: `Ops. Conteúdo inseguro detectado 🚫. Tente um prompt diferente.`,
    ar: `عذرًا. تم اكتشاف محتوى غير آمن 🚫. يرجى تجربة موجه آخر.`,
    ms: 'Wah, konten tidak aman terdeteksi 🚫. Silakan coba prompt lain.',
  },
};

export function getLanguageCode(language: string | undefined): LanguageCode {
  const languageMap: { [key: string]: LanguageCode } = {
    english: 'en',
    portuguese: 'pt',
    arabic: 'ar',
    malay: 'ms',
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
