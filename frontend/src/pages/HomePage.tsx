import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  Check,
  Clock3,
  Cpu,
  Droplets,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Smartphone,
  Upload,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useI18n } from '../i18n';
import '../styles/landing.css';

const content = {
  ar: {
    navigation: [
      { href: '#home', label: 'الرئيسية' },
      { href: '#services', label: 'خدماتنا' },
      { href: '#about', label: 'من نحن' },
      { href: '#contact', label: 'اتصل بنا' },
    ],
    language: 'Français',
    request: 'اطلب إصلاحًا',
    eyebrow: 'إصلاح موثوق، دون تعقيد',
    heroTitle: 'هاتفك يستحق إصلاحًا',
    heroAccent: 'يبدأ من هنا',
    heroDescription:
      'أخبرنا عن هاتفك والمشكلة التي تواجهها. سيفحص فريقنا طلبك ويتواصل معك بالتشخيص والتكلفة التقديرية.',
    heroImageAlt: 'فني يصلح هاتفًا ذكيًا على طاولة عمل احترافية',
    heroNote: 'عناية دقيقة بكل تفصيل',
    heroBadge: 'خبرة يمكنك الوثوق بها',
    servicesEyebrow: 'ما الذي يمكننا إصلاحه؟',
    servicesTitle: 'حلول لمشكلات هاتفك اليومية',
    servicesDescription: 'من الشاشة المكسورة إلى أعطال البرامج، نساعدك على العودة لاستخدام هاتفك.',
    services: [
      { title: 'استبدال الشاشة', description: 'شاشة متشققة أو لمس لا يستجيب؟ نعيد لهاتفك وضوحه واستجابته.' },
      { title: 'استبدال البطارية', description: 'بطارية جديدة تمنحك أداءً أفضل ووقت استخدام أطول.' },
      { title: 'مشكلات الشحن', description: 'فحص منافذ الشحن والكوابل ومشكلات الطاقة.' },
      { title: 'مشكلات البرامج', description: 'معالجة أعطال النظام والتحديثات والأداء.' },
      { title: 'أضرار المياه', description: 'فحص وتنظيف احترافي بعد التعرض للسوائل.' },
      { title: 'إصلاحات أخرى', description: 'أخبرنا بما يحدث، وسنساعدك في معرفة الخطوة التالية.' },
    ],
    howEyebrow: 'خطوات واضحة',
    howTitle: 'كيف تسير عملية الإصلاح؟',
    howDescription: 'نبقيك على اطلاع، وتبقى أنت صاحب القرار في كل خطوة.',
    steps: [
      { title: 'أرسل معلومات هاتفك', description: 'أخبرنا بنوع الجهاز ووصف المشكلة عبر النموذج البسيط.' },
      { title: 'نراجع طلبك ونقدّم التشخيص', description: 'يفحص الفني التفاصيل ويتواصل معك بالتشخيص والتكلفة التقديرية.' },
      { title: 'أنت تقرر', description: 'تختار إن كنت ترغب في الموافقة على الإصلاح بعد معرفة التكلفة.' },
    ],
    formEyebrow: 'ابدأ من هنا',
    formTitle: 'اطلب إصلاح هاتفك',
    formDescription: 'أرسل التفاصيل الأساسية وسنتواصل معك لمناقشة الخطوة التالية.',
    privacyNote: 'هذا نموذج تجريبي فقط. لن يتم إرسال معلوماتك أو حفظها على خادم.',
    fullName: 'الاسم الكامل',
    phoneNumber: 'رقم الهاتف',
    phonePlaceholder: '+213 555 123 456',
    brand: 'ماركة الهاتف',
    chooseBrand: 'اختر الماركة',
    model: 'طراز الهاتف',
    modelPlaceholder: 'مثال: iPhone 14 أو Galaxy S23',
    category: 'نوع المشكلة',
    chooseCategory: 'اختر نوع المشكلة',
    categories: [
      'استبدال الشاشة',
      'استبدال البطارية',
      'مشكلة في الشحن',
      'مشكلة في البرامج',
      'ضرر بسبب المياه',
      'إصلاح آخر',
    ],
    description: 'وصف المشكلة',
    descriptionPlaceholder: 'متى بدأت المشكلة؟ وما الذي يحدث؟',
    photo: 'صورة للجهاز (اختياري)',
    upload: 'اختر صورة',
    fileHint: 'صورة واحدة، بحد أقصى 5 ميغابايت.',
    submit: 'إرسال طلب الإصلاح',
    required: 'مطلوب',
    invalidPhone: 'أدخل رقم هاتف صحيحًا يتضمن من 7 إلى 15 رقمًا.',
    invalidPhoto: 'اختر ملف صورة لا يتجاوز حجمه 5 ميغابايت.',
    errorSummary: 'يرجى مراجعة الحقول المطلوبة أدناه.',
    success: 'تم إرسال طلبك بنجاح. سيتواصل معك فريقنا قريبًا.',
    contactEyebrow: 'نحن هنا لمساعدتك',
    contactTitle: 'لديك سؤال؟ تواصل معنا',
    contactDescription: 'يسعدنا مساعدتك في معرفة الخطوة المناسبة لإصلاح هاتفك.',
    phoneLabel: 'الهاتف',
    addressLabel: 'العنوان',
    hoursLabel: 'ساعات العمل',
    contactPlaceholder: 'أضف رقم الهاتف',
    addressPlaceholder: 'أضف عنوان المتجر',
    hoursPlaceholder: 'أضف ساعات العمل',
    whatsapp: 'تواصل عبر واتساب',
    whatsappText: 'مرحبًا، أود الاستفسار عن إصلاح هاتف.',
    footerText: 'نمنح هاتفك عناية يستحقها.',
    copyright: 'جميع الحقوق محفوظة.',
    fileTooLarge: 'يجب ألا يتجاوز حجم الصورة 5 ميغابايت.',
  },
  fr: {
    navigation: [
      { href: '#home', label: 'Accueil' },
      { href: '#services', label: 'Services' },
      { href: '#about', label: 'À propos' },
      { href: '#contact', label: 'Contact' },
    ],
    language: 'العربية',
    request: 'Demander une réparation',
    eyebrow: 'Une réparation fiable, tout simplement',
    heroTitle: 'La réparation de votre téléphone',
    heroAccent: 'commence ici',
    heroDescription:
      'Parlez-nous de votre téléphone et de son problème. Notre équipe étudiera votre demande et vous contactera avec un diagnostic et une estimation.',
    heroImageAlt: 'Un technicien répare un smartphone sur un établi professionnel',
    heroNote: 'Chaque détail compte',
    heroBadge: 'Un savoir-faire de confiance',
    servicesEyebrow: 'Comment pouvons-nous vous aider ?',
    servicesTitle: 'Des solutions à vos problèmes de téléphone',
    servicesDescription: 'Écran cassé ou souci logiciel : nous vous aidons à retrouver un téléphone fonctionnel.',
    services: [
      { title: 'Remplacement d’écran', description: 'Écran fissuré ou tactile défaillant ? Retrouvez une image nette et réactive.' },
      { title: 'Remplacement de batterie', description: 'Une nouvelle batterie pour retrouver autonomie et fiabilité.' },
      { title: 'Problèmes de charge', description: 'Diagnostic des ports, câbles et problèmes d’alimentation.' },
      { title: 'Problèmes logiciels', description: 'Dépannage du système, des mises à jour et des performances.' },
      { title: 'Dégâts des eaux', description: 'Inspection et nettoyage après un contact avec un liquide.' },
      { title: 'Autres réparations', description: 'Décrivez le problème : nous vous guiderons vers la bonne solution.' },
    ],
    howEyebrow: 'En toute simplicité',
    howTitle: 'Comment ça marche ?',
    howDescription: 'Vous restez informé et gardez la maîtrise de chaque décision.',
    steps: [
      { title: 'Décrivez votre téléphone', description: 'Indiquez le modèle et le problème dans notre formulaire.' },
      { title: 'Nous étudions votre demande', description: 'Un technicien examine les détails et vous contacte avec un diagnostic et une estimation.' },
      { title: 'Vous choisissez', description: 'Vous décidez si vous souhaitez approuver la réparation après avoir reçu l’estimation.' },
    ],
    formEyebrow: 'Faisons connaissance',
    formTitle: 'Demander une réparation',
    formDescription: 'Partagez quelques informations et nous vous contacterons pour la suite.',
    privacyNote: 'Ceci est une démonstration. Vos informations et photos ne sont ni envoyées ni enregistrées sur un serveur.',
    fullName: 'Nom complet',
    phoneNumber: 'Numéro de téléphone',
    phonePlaceholder: '+33 6 12 34 56 78',
    brand: 'Marque du téléphone',
    chooseBrand: 'Choisir une marque',
    model: 'Modèle du téléphone',
    modelPlaceholder: 'Ex. : iPhone 14 ou Galaxy S23',
    category: 'Catégorie du problème',
    chooseCategory: 'Choisir une catégorie',
    categories: [
      'Remplacement d’écran',
      'Remplacement de batterie',
      'Problème de charge',
      'Problème logiciel',
      'Dégât des eaux',
      'Autre réparation',
    ],
    description: 'Description du problème',
    descriptionPlaceholder: 'Quand le problème a-t-il commencé ? Que se passe-t-il ?',
    photo: 'Photo du téléphone (facultatif)',
    upload: 'Choisir une photo',
    fileHint: 'Une image, 5 Mo maximum.',
    submit: 'Envoyer la demande',
    required: 'Obligatoire',
    invalidPhone: 'Saisissez un numéro valide de 7 à 15 chiffres.',
    invalidPhoto: 'Choisissez une image de 5 Mo maximum.',
    errorSummary: 'Veuillez vérifier les champs obligatoires ci-dessous.',
    success: 'Votre demande a été soumise avec succès. Notre équipe vous contactera bientôt.',
    contactEyebrow: 'À votre écoute',
    contactTitle: 'Une question ? Parlons-en',
    contactDescription: 'Nous sommes là pour vous aider à trouver la bonne solution.',
    phoneLabel: 'Téléphone',
    addressLabel: 'Adresse',
    hoursLabel: 'Horaires',
    contactPlaceholder: 'Ajoutez votre numéro',
    addressPlaceholder: 'Ajoutez votre adresse',
    hoursPlaceholder: 'Ajoutez vos horaires',
    whatsapp: 'Nous écrire sur WhatsApp',
    whatsappText: 'Bonjour, je souhaite me renseigner sur une réparation de téléphone.',
    footerText: 'Votre téléphone mérite le meilleur soin.',
    copyright: 'Tous droits réservés.',
    fileTooLarge: 'La photo ne doit pas dépasser 5 Mo.',
  },
} as const;

type PageCopy = (typeof content)[keyof typeof content];
type FormValues = {
  fullName: string;
  phoneNumber: string;
  brand: string;
  model: string;
  category: string;
  description: string;
};
type FieldName = keyof FormValues;
type ErrorKey = FieldName | 'photo';
const BUSINESS_WHATSAPP_NUMBER = '';

const initialValues: FormValues = {
  fullName: '',
  phoneNumber: '',
  brand: '',
  model: '',
  category: '',
  description: '',
};

const serviceIcons: LucideIcon[] = [
  Smartphone,
  BatteryCharging,
  Zap,
  Cpu,
  Droplets,
  Wrench,
];

function ServiceCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <article className="landing-service-card">
      <span className="landing-service-icon"><Icon size={22} aria-hidden="true" /></span>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="landing-field">
      <label htmlFor={id}>
        {label}
        {required && <span className="landing-required" aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && <span className="landing-field-error" id={`${id}-error`}>{error}</span>}
    </div>
  );
}

function RepairRequestForm({ copy }: { copy: PageCopy }) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [photo, setPhoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: FieldName, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitted(false);
  };

  const validate = () => {
    const nextErrors: Partial<Record<ErrorKey, string>> = {};
    (Object.keys(values) as FieldName[]).forEach((field) => {
      if (!values[field].trim()) nextErrors[field] = copy.required;
    });

    const normalizedPhone = values.phoneNumber.replace(/[\s().-]/g, '');
    if (values.phoneNumber && !/^\+?\d{7,15}$/.test(normalizedPhone)) {
      nextErrors.phoneNumber = copy.invalidPhone;
    }
    if (errors.photo || (photo && (!photo.type.startsWith('image/') || photo.size > 5 * 1024 * 1024))) {
      nextErrors.photo = copy.invalidPhoto;
    }
    return nextErrors;
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.currentTarget.files?.[0] ?? null;
    setErrors((current) => ({ ...current, photo: undefined }));
    setSubmitted(false);
    if (selectedFile && (!selectedFile.type.startsWith('image/') || selectedFile.size > 5 * 1024 * 1024)) {
      setPhoto(null);
      event.currentTarget.value = '';
      setErrors((current) => ({ ...current, photo: copy.invalidPhoto }));
      return;
    }
    setPhoto(selectedFile);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setSubmitted(false);

    const firstError = Object.keys(nextErrors)[0] as ErrorKey | undefined;
    if (firstError) {
      const firstFieldId: Record<ErrorKey, string> = {
        fullName: 'fullName',
        phoneNumber: 'phoneNumber',
        brand: 'brand',
        model: 'model',
        category: 'category',
        description: 'description',
        photo: 'photo',
      };
      document.getElementById(firstFieldId[firstError])?.focus();
      return;
    }

    setValues(initialValues);
    setPhoto(null);
    const fileInput = document.getElementById('photo');
    if (fileInput instanceof HTMLInputElement) fileInput.value = '';
    setSubmitted(true);
  };

  const fieldProps = (field: FieldName) => ({
    id: field,
    name: field,
    value: values[field],
    required: true,
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      updateField(field, event.currentTarget.value),
  });

  return (
    <form className="landing-form" onSubmit={handleSubmit} noValidate>
      {Object.values(errors).some(Boolean) && (
        <p className="landing-error-summary" role="alert">{copy.errorSummary}</p>
      )}
      <fieldset className="landing-fieldset">
        <legend className="landing-visually-hidden">{copy.formTitle}</legend>
        <div className="landing-form-grid">
        <Field id="fullName" label={copy.fullName} required error={errors.fullName}>
          <input {...fieldProps('fullName')} autoComplete="name" dir="auto" />
        </Field>
        <Field id="phoneNumber" label={copy.phoneNumber} required error={errors.phoneNumber}>
          <input
            {...fieldProps('phoneNumber')}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder={copy.phonePlaceholder}
            dir="ltr"
          />
        </Field>
        <Field id="brand" label={copy.brand} required error={errors.brand}>
          <select {...fieldProps('brand')}>
            <option value="">{copy.chooseBrand}</option>
            {['Samsung', 'Apple', 'Xiaomi', 'Huawei', 'Oppo', 'Other'].map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </Field>
        <Field id="model" label={copy.model} required error={errors.model}>
          <input {...fieldProps('model')} placeholder={copy.modelPlaceholder} dir="auto" />
        </Field>
        <Field id="category" label={copy.category} required error={errors.category}>
          <select {...fieldProps('category')}>
            <option value="">{copy.chooseCategory}</option>
            {copy.categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </Field>
        <div className="landing-field landing-field-wide">
          <Field id="description" label={copy.description} required error={errors.description}>
            <textarea
              {...fieldProps('description')}
              rows={4}
              placeholder={copy.descriptionPlaceholder}
              dir="auto"
            />
          </Field>
        </div>
        <Field id="photo" label={copy.photo} error={errors.photo}>
          <span className="landing-file-control">
            <Upload size={17} aria-hidden="true" />
            <span>{photo?.name ?? copy.upload}</span>
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              aria-invalid={errors.photo ? true : undefined}
              aria-describedby={errors.photo ? 'photo-error' : 'photo-hint'}
              onChange={handlePhotoChange}
            />
          </span>
          <span className="landing-hint" id="photo-hint">{copy.fileHint}</span>
        </Field>
        </div>
      </fieldset>
      <div className="landing-form-footer">
        <p className="landing-privacy-note">{copy.privacyNote}</p>
        <button className="landing-button landing-button-primary landing-submit" type="submit">
          {copy.submit}
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </div>
      {submitted && <p className="landing-success" role="status"><Check size={18} aria-hidden="true" />{copy.success}</p>}
    </form>
  );
}

export const HomePage: React.FC = () => {
  const { locale, setLocale } = useI18n();
  const copy = content[locale];
  const DirectionArrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const whatsappPath = BUSINESS_WHATSAPP_NUMBER ? `${BUSINESS_WHATSAPP_NUMBER}` : '';
  const whatsappHref = `https://wa.me/${whatsappPath}?text=${encodeURIComponent(copy.whatsappText)}`;

  return (
    <div className="landing-root" lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <header className="landing-header">
        <div className="landing-header-inner">
          <a className="landing-brand" href="#home" aria-label="PhoneFix">
            <span className="landing-brand-mark"><Smartphone size={21} aria-hidden="true" /></span>
            <span>PhoneFix</span>
          </a>
          <nav className="landing-nav" aria-label={locale === 'ar' ? 'التنقل الرئيسي' : 'Navigation principale'}>
            {copy.navigation.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
          </nav>
          <div className="landing-header-actions">
            <button
              className="landing-language"
              type="button"
              onClick={() => setLocale(locale === 'ar' ? 'fr' : 'ar')}
              aria-label={locale === 'ar' ? 'Passer en français' : 'التبديل إلى العربية'}
            >
              {copy.language}
            </button>
            <a className="landing-button landing-button-primary landing-header-cta" href="#request">
              {copy.request}<DirectionArrow size={16} aria-hidden="true" />
            </a>
            <button
              className="landing-menu-button"
              type="button"
              aria-label={mobileMenuOpen
                ? (locale === 'ar' ? 'إغلاق قائمة التنقل' : 'Fermer le menu de navigation')
                : (locale === 'ar' ? 'فتح قائمة التنقل' : 'Ouvrir le menu de navigation')}
              aria-expanded={mobileMenuOpen}
              aria-controls="landing-mobile-navigation"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav className="landing-mobile-nav" id="landing-mobile-navigation" aria-label={locale === 'ar' ? 'التنقل' : 'Navigation'}>
            {copy.navigation.map((item) => (
              <a href={item.href} key={item.href} onClick={() => setMobileMenuOpen(false)}>{item.label}</a>
            ))}
            <a href="#request" onClick={() => setMobileMenuOpen(false)}>{copy.request}</a>
          </nav>
        )}
      </header>

      <main>
        <section className="landing-hero landing-container" id="home">
          <div className="landing-hero-copy">
            <span className="landing-eyebrow"><span className="landing-eyebrow-dot" />{copy.eyebrow}</span>
            <h1 className="landing-title">{copy.heroTitle}<span>{copy.heroAccent}</span></h1>
            <p className="landing-hero-description">{copy.heroDescription}</p>
            <div className="landing-hero-actions">
              <a className="landing-button landing-button-primary" href="#request">{copy.request}<DirectionArrow size={17} aria-hidden="true" /></a>
              <a className="landing-text-link" href="#services">{copy.servicesTitle}<ArrowDown size={16} aria-hidden="true" /></a>
            </div>
            <div className="landing-trust"><span><Check size={16} aria-hidden="true" />{copy.heroBadge}</span></div>
          </div>
          <div className="landing-hero-visual">
            <img src="/assets/hero-repair.jpg" alt={copy.heroImageAlt} loading="eager" />
            <div className="landing-image-caption">
              <span className="landing-caption-icon"><Wrench size={19} aria-hidden="true" /></span>
              <span>{copy.heroNote}</span>
            </div>
            <span className="landing-image-orbit landing-image-orbit-one" aria-hidden="true" />
            <span className="landing-image-orbit landing-image-orbit-two" aria-hidden="true" />
          </div>
        </section>

        <section className="landing-section landing-services-section" id="services">
          <div className="landing-container">
            <div className="landing-section-heading">
              <span className="landing-section-eyebrow">{copy.servicesEyebrow}</span>
              <h2>{copy.servicesTitle}</h2>
              <p>{copy.servicesDescription}</p>
            </div>
            <div className="landing-services-grid">
              {copy.services.map((service, index) => (
                <ServiceCard key={service.title} icon={serviceIcons[index]} title={service.title} description={service.description} />
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section landing-how-section" id="about">
          <div className="landing-container">
            <div className="landing-section-heading">
              <span className="landing-section-eyebrow">{copy.howEyebrow}</span>
              <h2>{copy.howTitle}</h2>
              <p>{copy.howDescription}</p>
            </div>
            <div className="landing-steps-grid">
              {copy.steps.map((step, index) => (
                <article className="landing-step-card" key={step.title}>
                  <span className="landing-step-number">0{index + 1}</span>
                  <span className="landing-step-line" aria-hidden="true" />
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section landing-request-section" id="request">
          <div className="landing-container landing-request-layout">
            <div className="landing-request-intro">
              <span className="landing-section-eyebrow">{copy.formEyebrow}</span>
              <h2>{copy.formTitle}</h2>
              <p>{copy.formDescription}</p>
              <div className="landing-request-note">
                <span><Check size={18} aria-hidden="true" /></span>
                <p>{copy.privacyNote}</p>
              </div>
            </div>
            <div className="landing-form-card">
              <RepairRequestForm copy={copy} />
            </div>
          </div>
        </section>

        <section className="landing-contact-section" id="contact">
          <div className="landing-container landing-contact-inner">
            <div className="landing-contact-heading">
              <span className="landing-contact-eyebrow">{copy.contactEyebrow}</span>
              <h2>{copy.contactTitle}</h2>
              <p>{copy.contactDescription}</p>
              <a className="landing-button landing-button-white" href={whatsappHref} target="_blank" rel="noreferrer">
                <MessageCircle size={18} aria-hidden="true" />{copy.whatsapp}
              </a>
            </div>
            <div className="landing-contact-details">
              <div><span className="landing-contact-icon"><Phone size={19} aria-hidden="true" /></span><p><strong>{copy.phoneLabel}</strong><span>{copy.contactPlaceholder}</span></p></div>
              <div><span className="landing-contact-icon"><MapPin size={19} aria-hidden="true" /></span><p><strong>{copy.addressLabel}</strong><span>{copy.addressPlaceholder}</span></p></div>
              <div><span className="landing-contact-icon"><Clock3 size={19} aria-hidden="true" /></span><p><strong>{copy.hoursLabel}</strong><span>{copy.hoursPlaceholder}</span></p></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <a className="landing-brand landing-footer-brand" href="#home">
            <span className="landing-brand-mark"><Smartphone size={19} aria-hidden="true" /></span>
            <span>PhoneFix</span>
          </a>
          <p>{copy.footerText}</p>
          <span>© {new Date().getFullYear()} PhoneFix. {copy.copyright}</span>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
