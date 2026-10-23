import React, { createContext, useContext, useState, useEffect } from 'react';

export type Locale = 'fr' | 'ar';

export const WILAYAS_ALGERIA = [
  '01 - Adrar', '02 - Chlef', '03 - Laghouat', '04 - Oum El Bouaghi', '05 - Batna',
  '06 - Béjaïa', '07 - Biskra', '08 - Béchar', '09 - Blida', '10 - Bouira',
  '11 - Tamanrasset', '12 - Tébessa', '13 - Tlemcen', '14 - Tiaret', '15 - Tizi Ouzou',
  '16 - Alger (Algiers)', '17 - Djelfa', '18 - Jijel', '19 - Sétif', '20 - Saïda',
  '21 - Skikda', '22 - Sidi Bel Abbès', '23 - Annaba', '24 - Guelma', '25 - Constantine',
  '26 - Médéa', '27 - Mostaganem', '28 - M\'Sila', '29 - Mascara', '30 - Ouargla',
  '31 - Oran', '32 - El Bayadh', '33 - Illizi', '34 - Bordj Bou Arréridj', '35 - Boumerdès',
  '36 - El Tarf', '37 - Tindouf', '38 - Tissemsilt', '39 - El Oued', '40 - Khenchela',
  '41 - Souk Ahras', '42 - Tipaza', '43 - Mila', '44 - Aïn Defla', '45 - Naâma',
  '46 - Aïn Témouchent', '47 - Ghardaïa', '48 - Relizane', '49 - Timimoun', '50 - Bordj Badji Mokhtar',
  '51 - Ouled Djellal', '52 - Béni Abbès', '53 - In Salah', '54 - In Guezzam', '55 - Touggourt',
  '56 - Djanet', '57 - El M\'Ghair', '58 - El Meniaa'
];

export const BRANDS = [
  'Samsung', 'Apple', 'Xiaomi', 'Redmi', 'Oppo',
  'Huawei', 'Realme', 'Tecno', 'Infinix', 'Other'
];

export const PROBLEM_CATEGORIES = [
  'Broken screen',
  'Touchscreen malfunction',
  'Battery problems',
  'Charging port',
  'Phone does not turn on',
  'Software or operating system',
  'Camera',
  'Speaker or microphone',
  'Wi-Fi, SIM, or network',
  'Water damage',
  'Motherboard or electrical issue',
  'Other'
];

export const translations = {
  fr: {
    // Navigation & General
    siteName: 'PhoneTech Algérie',
    siteTagline: 'Plateforme Nationale de Réparation Mobile',
    home: 'Accueil',
    newRepair: 'Demander une réparation',
    trackRepair: 'Suivre ma réparation',
    customerPortal: 'Espace Client',
    technicianPortal: 'Atelier Technicien',
    adminPortal: 'Administration',
    login: 'Connexion',
    logout: 'Déconnexion',
    language: 'Langue',
    dzd: 'DZD',
    back: 'Retour',
    save: 'Enregistrer',
    submit: 'Soumettre',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    loading: 'Chargement...',
    actions: 'Actions',
    status: 'Statut',
    details: 'Détails',

    // Hero Section
    heroTitle: 'Faites réparer votre smartphone en toute transparence en Algérie',
    heroSubtitle: 'Diagnostic technique certifié, devis détaillé en dinars algériens (DZD) et validation obligatoire de votre part avant tout début de réparation.',
    heroCta: 'Demander un diagnostic',
    heroTrackBtn: 'Vérifier l\'état',
    trackInputPlaceholder: 'Ex: DZ-REP-100201',
    heroStatsRepairs: '15 000+ Réparations',
    heroStatsSatisfaction: '98% Clients Satisfaits',
    heroStatsWarranty: 'Garantie jusqu\'à 6 mois',

    // How it works
    howItWorksTitle: 'Comment fonctionne notre service ?',
    step1Title: '1. Demande en ligne',
    step1Desc: 'Remplissez le formulaire décrivant la marque, le modèle et les symptômes de votre téléphone.',
    step2Title: '2. Diagnostic en atelier',
    step2Desc: 'Nos techniciens inspectent minutieusement votre appareil pour identifier la panne exacte.',
    step3Title: '3. Devis & Approbation',
    step3Desc: 'Vous recevez un devis détaillé avec le coût des pièces et de la main d\'œuvre. Rien ne commence sans votre accord !',
    step4Title: '4. Réparation & Livraison',
    step4Desc: 'Une fois approuvé, le téléphone est réparé avec des pièces certifiées et restitué avec garantie.',

    // Supported brands & services
    brandsTitle: 'Toutes les grandes marques prises en charge',
    servicesTitle: 'Nos spécialités de réparation',

    // Status Names
    status_NEW: 'Nouvelle demande',
    status_UNDER_DIAGNOSIS: 'En cours de diagnostic',
    status_REPAIRABLE: 'Réparable',
    status_UNREPAIRABLE: 'Irréparable',
    status_REPAIR_NOT_ECONOMICAL: 'Non économique',
    status_WAITING_FOR_PARTS: 'En attente de pièces',
    status_QUOTE_PENDING: 'Devis en attente d\'approbation',
    status_QUOTE_ACCEPTED: 'Devis approuvé par le client',
    status_QUOTE_REJECTED: 'Devis refusé',
    status_IN_REPAIR: 'Réparation en cours',
    status_REPAIR_COMPLETED: 'Réparation terminée',
    status_READY_FOR_PICKUP: 'Prêt à être récupéré',
    status_DELIVERED: 'Appareil restitué',
    status_CANCELLED: 'Annulé',

    // Form labels
    fullName: 'Nom & Prénom',
    phone: 'Numéro de téléphone algérien',
    email: 'Adresse email (optionnel)',
    wilaya: 'Wilaya',
    brand: 'Marque de l\'appareil',
    model: 'Modèle exact',
    issueCategory: 'Catégorie principale de la panne',
    symptoms: 'Description détaillée des symptômes',
    isPoweringOn: 'Le téléphone s\'allume-t-il ?',
    wasDropped: 'L\'appareil a-t-il chuté ?',
    liquidExposure: 'A-t-il été exposé à un liquide ?',
    deviceCondition: 'État général extérieur',
    photos: 'Photos de l\'appareil (dégâts visibles)',

    // Quotation
    quotationTitle: 'Devis de réparation',
    quoteNumber: 'Numéro de devis',
    itemDescription: 'Description',
    unitPrice: 'Prix unitaire',
    quantity: 'Quantité',
    totalAmount: 'Montant total',
    approveQuote: 'Accepter le devis & lancer la réparation',
    rejectQuote: 'Refuser le devis',
    rejectionReason: 'Motif du refus (optionnel)',
    technicianNotes: 'Remarques du technicien',
    estimatedCompletion: 'Délai estimé d\'achèvement',

    // Dashboard
    dashboard: 'Tableau de bord',
    totalRequests: 'Total demandes',
    underDiag: 'En diagnostic',
    awaitingApproval: 'En attente d\'accord',
    inProgress: 'En réparation',
    readyPickup: 'Prêts au retrait',
    searchPlaceholder: 'Rechercher par référence, modèle ou nom...',
    filterStatus: 'Filtrer par statut',
    filterBrand: 'Filtrer par marque',
    exportCsv: 'Exporter CSV',

  },

  ar: {
    // Navigation & General
    siteName: 'فون تك الجزائر',
    siteTagline: 'المنصة الوطنية لإصلاح الهواتف الذكية',
    home: 'الرئيسية',
    newRepair: 'طلب إصلاح جديد',
    trackRepair: 'تتبع طلبي',
    customerPortal: 'فضاء الزبون',
    technicianPortal: 'ورشة التقني',
    adminPortal: 'لوحة الإدارة',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    language: 'اللغة',
    dzd: 'دج',
    back: 'رجوع',
    save: 'حفظ',
    submit: 'إرسال',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    loading: 'جاري التحميل...',
    actions: 'الإجراءات',
    status: 'الحالة',
    details: 'التفاصيل',

    // Hero Section
    heroTitle: 'إصلاح هاتفك الذكي بكل شفافية وأمان في الجزائر',
    heroSubtitle: 'تشخيص تقني معتمد، مقايسة أسعار مفصلة بالدينار الجزائري، وموافقتك الإلزامية قبل الشروع في أي إصلاح.',
    heroCta: 'طلب تشخيص الآن',
    heroTrackBtn: 'تتبع حالة الهاتف',
    trackInputPlaceholder: 'مثال: DZ-REP-100201',
    heroStatsRepairs: '+15 000 هاتف تم إصلاحه',
    heroStatsSatisfaction: '98% رضا الزبائن',
    heroStatsWarranty: 'ضمان يصل إلى 6 أشهر',

    // How it works
    howItWorksTitle: 'كيف تعمل خدمتنا ؟',
    step1Title: '1. تقديم الطلب',
    step1Desc: 'املأ الاستمارة موضحاً نوع الهاتف والموديل والأعراض التي يشتكي منها جهازك.',
    step2Title: '2. فحص تقني في الورشة',
    step2Desc: 'يقوم خبراؤنا بفحص دقيق للهاتف بالمجهر والأجهزة المتطورة لتحديد العطل بدقة.',
    step3Title: '3. عرض السعر والموافقة',
    step3Desc: 'تصلك مقايسة أسعار مفصلة بقطع الغيار واليد العاملة بالدينار، ولا نبدأ دون موافقتك الصريحة !',
    step4Title: '4. الإصلاح والاستلام',
    step4Desc: 'بعد موافقتك، يتم إصلاح الهاتف بقطع غيار أصلية ومضمونة ويسلم لك في الموعد.',

    // Supported brands & services
    brandsTitle: 'ندعم جميع الماركات العالمية',
    servicesTitle: 'مجالات تخصصنا في الصيانة',

    // Status Names
    status_NEW: 'طلب جديد',
    status_UNDER_DIAGNOSIS: 'قيد الفحص والتشخيص',
    status_REPAIRABLE: 'قابل للإصلاح',
    status_UNREPAIRABLE: 'غير قابل للإصلاح',
    status_REPAIR_NOT_ECONOMICAL: 'الإصلاح غير مجدٍ اقتصادياً',
    status_WAITING_FOR_PARTS: 'في انتظار قطع الغيار',
    status_QUOTE_PENDING: 'في انتظار موافقة الزبون على السعر',
    status_QUOTE_ACCEPTED: 'تمت موافقة الزبون',
    status_QUOTE_REJECTED: 'تم رفض السعر من الزبون',
    status_IN_REPAIR: 'عملية الإصلاح جارية',
    status_REPAIR_COMPLETED: 'تم اكتمال الإصلاح بنجاح',
    status_READY_FOR_PICKUP: 'جاهز للاستلام',
    status_DELIVERED: 'تم التسليم للزبون',
    status_CANCELLED: 'ملغى',

    // Form labels
    fullName: 'الاسم واللقب',
    phone: 'رقم الهاتف الجزائري',
    email: 'البريد الإلكتروني (اختياري)',
    wilaya: 'الولاية',
    brand: 'علامة الجهاز',
    model: 'الموديل الدقيق',
    issueCategory: 'نوع العطل الرئيسي',
    symptoms: 'وصف مفصل للأعراض والمشكلة',
    isPoweringOn: 'هل يشتغل الهاتف ؟',
    wasDropped: 'هل سقط الجهاز أو تعرض لصدمة ؟',
    liquidExposure: 'هل تعرض الجهاز للماء أو السوائل ؟',
    deviceCondition: 'الحالة الخارجية للجهاز',
    photos: 'صور الجهاز والأضرار الظاهرة',

    // Quotation
    quotationTitle: 'مقايسة أسعار الصيانة (الدفاتر التقديرية)',
    quoteNumber: 'رقم المقايسة',
    itemDescription: 'البيان والتفاصيل',
    unitPrice: 'سعر الوحدة',
    quantity: 'الكمية',
    totalAmount: 'المبلغ الإجمالي',
    approveQuote: 'الموافقة على السعر وبدء الإصلاح',
    rejectQuote: 'رفض عرض السعر',
    rejectionReason: 'سبب الرفض (اختياري)',
    technicianNotes: 'ملاحظات التقني للزبون',
    estimatedCompletion: 'الموعد التقريبي للاستلام',

    // Dashboard
    dashboard: 'لوحة التحكم',
    totalRequests: 'إجمالي الطلبات',
    underDiag: 'قيد التشخيص',
    awaitingApproval: 'في انتظار الموافقة',
    inProgress: 'قيد الإصلاح',
    readyPickup: 'جاهز للاستلام',
    searchPlaceholder: 'بحث بالرقم المرجعي، الموديل أو الاسم...',
    filterStatus: 'تصفية حسب الحالة',
    filterBrand: 'تصفية حسب العلامة',
    exportCsv: 'تصدير كملف CSV',

  }
};

interface I18nContextType {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: (key: keyof typeof translations['fr']) => string;
  dir: 'ltr' | 'rtl';
  formatDZD: (amount: number) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'ar',
  setLocale: () => {},
  t: (key) => key as string,
  dir: 'rtl',
  formatDZD: (amount) => `${amount} DZD`,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const savedLocale = localStorage.getItem('preferred_locale');
    return savedLocale === 'fr' || savedLocale === 'ar' ? savedLocale : 'ar';
  });

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
    localStorage.setItem('preferred_locale', locale);
  }, [locale, dir]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const t = (key: keyof typeof translations['fr']): string => {
    const dict = translations[locale] || translations.fr;
    return (dict as any)[key] || (translations.fr as any)[key] || (key as string);
  };

  const formatDZD = (amount: number): string => {
    const formatted = Math.round(amount).toLocaleString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ');
    return locale === 'ar' ? `${formatted} دج` : `${formatted} DZD`;
  };

  return React.createElement(
    I18nContext.Provider,
    { value: { locale, setLocale, t, dir, formatDZD } },
    children
  );
};

export const useI18n = () => useContext(I18nContext);
