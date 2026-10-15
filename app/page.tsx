'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Music,
  Pause,
  Play,
  Search,
  Send,
  Sliders,
  Sparkles,
  Type,
  Upload,
  Video,
} from 'lucide-react';

type Reader = {
  id: string;
  name: string;
  server: string;
  quality: string;
};

type Verse = {
  number: number;
  text: string;
};

type ThemeKey = 'gold' | 'blue' | 'green' | 'purple' | 'emerald' | 'night';
type MotionMode = 'none' | 'zoom' | 'pan' | 'orbit';
type EffectKey =
  | 'particles'
  | 'halos'
  | 'breathingFrame'
  | 'scanline'
  | 'fallingStars'
  | 'rays'
  | 'glow'
  | 'fog';
type VisibilityKey = 'title' | 'basmala' | 'verses' | 'reader' | 'ending';
type Notice = {
  kind: 'success' | 'error' | 'info';
  message: string;
};

type StudioSettings = {
  themeKey: ThemeKey;
  backgroundOpacity: number;
  motion: MotionMode;
  motionSpeed: number;
  effects: Record<EffectKey, boolean>;
  visibility: Record<VisibilityKey, boolean>;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  textColor: string;
  highlightColor: string;
};

type QuranApiResponse = {
  code?: number;
  status?: string;
  data?: {
    ayahs?: Array<{
      numberInSurah?: number;
      text?: string;
    }>;
  };
  message?: string;
};

const SURAH_NAMES = [
  'الفاتحة',
  'البقرة',
  'آل عمران',
  'النساء',
  'المائدة',
  'الأنعام',
  'الأعراف',
  'الأنفال',
  'التوبة',
  'يونس',
  'هود',
  'يوسف',
  'الرعد',
  'إبراهيم',
  'الحجر',
  'النحل',
  'الإسراء',
  'الكهف',
  'مريم',
  'طه',
  'الأنبياء',
  'الحج',
  'المؤمنون',
  'النور',
  'الفرقان',
  'الشعراء',
  'النمل',
  'القصص',
  'العنكبوت',
  'الروم',
  'لقمان',
  'السجدة',
  'الأحزاب',
  'سبأ',
  'فاطر',
  'يس',
  'الصافات',
  'ص',
  'الزمر',
  'غافر',
  'فصلت',
  'الشورى',
  'الزخرف',
  'الدخان',
  'الجاثية',
  'الأحقاف',
  'محمد',
  'الفتح',
  'الحجرات',
  'ق',
  'الذاريات',
  'الطور',
  'النجم',
  'القمر',
  'الرحمن',
  'الواقعة',
  'الحديد',
  'المجادلة',
  'الحشر',
  'الممتحنة',
  'الصف',
  'الجمعة',
  'المنافقون',
  'التغابن',
  'الطلاق',
  'التحريم',
  'الملك',
  'القلم',
  'الحاقة',
  'المعارج',
  'نوح',
  'الجن',
  'المزمل',
  'المدثر',
  'القيامة',
  'الإنسان',
  'المرسلات',
  'النبأ',
  'النازعات',
  'عبس',
  'التكوير',
  'الانفطار',
  'المطففين',
  'الانشقاق',
  'البروج',
  'الطارق',
  'الأعلى',
  'الغاشية',
  'الفجر',
  'البلد',
  'الشمس',
  'الليل',
  'الضحى',
  'الشرح',
  'التين',
  'العلق',
  'القدر',
  'البينة',
  'الزلزلة',
  'العاديات',
  'القارعة',
  'التكاثر',
  'العصر',
  'الهمزة',
  'الفيل',
  'قريش',
  'الماعون',
  'الكوثر',
  'الكافرون',
  'النصر',
  'المسد',
  'الإخلاص',
  'الفلق',
  'الناس',
] as const;

const READERS: Reader[] = [
  {
    id: 'shaateri',
    name: 'أبو بكر الشاطري',
    server: 'Abu_Bakr_Ash-Shaatree_128kbps',
    quality: '128 kbps',
  },
  {
    id: 'shuraim',
    name: 'سعود الشريم',
    server: 'Saood_ash-Shuraym_128kbps',
    quality: '128 kbps',
  },
  {
    id: 'basit',
    name: 'عبد الباسط عبد الصمد',
    server: 'Abdul_Basit_Murattal_192kbps',
    quality: '192 kbps',
  },
  {
    id: 'sudais',
    name: 'عبد الرحمن السديس',
    server: 'Abdurrahmaan_As-Sudais_192kbps',
    quality: '192 kbps',
  },
  {
    id: 'qasim',
    name: 'عبد المحسن القاسم',
    server: 'Muhsin_Al_Qasim_192kbps',
    quality: '192 kbps',
  },
  {
    id: 'minshawi',
    name: 'محمد صديق المنشاوي',
    server: 'Minshawy_Murattal_128kbps',
    quality: '128 kbps',
  },
  {
    id: 'muaiqly',
    name: 'ماهر المعيقلي',
    server: 'MaherAlMuaiqly128kbps',
    quality: '128 kbps',
  },
  {
    id: 'afasy',
    name: 'مشاري العفاسي',
    server: 'Alafasy_128kbps',
    quality: '128 kbps',
  },
  {
    id: 'husary',
    name: 'محمود خليل الحصري',
    server: 'Husary_128kbps',
    quality: '128 kbps',
  },
  {
    id: 'dussary',
    name: 'ياسر الدوسري',
    server: 'Yasser_Ad-Dussary_128kbps',
    quality: '128 kbps',
  },
];

const THEMES: Array<{
  id: ThemeKey;
  name: string;
  accent: string;
  secondary: string;
  description: string;
}> = [
  {
    id: 'gold',
    name: 'ذهبي ملكي',
    accent: '#fbbf24',
    secondary: '#92400e',
    description: 'وهج ذهبي دافئ',
  },
  {
    id: 'blue',
    name: 'أزرق عصري',
    accent: '#60a5fa',
    secondary: '#1d4ed8',
    description: 'تدرجات زرقاء هادئة',
  },
  {
    id: 'green',
    name: 'أخضر إسلامي',
    accent: '#86efac',
    secondary: '#166534',
    description: 'لمسات خضراء ناعمة',
  },
  {
    id: 'purple',
    name: 'بنفسجي',
    accent: '#c4b5fd',
    secondary: '#6d28d9',
    description: 'طابع بنفسجي ملكي',
  },
  {
    id: 'emerald',
    name: 'زمردي',
    accent: '#34d399',
    secondary: '#065f46',
    description: 'توهج زمردي عميق',
  },
  {
    id: 'night',
    name: 'سماء الليل',
    accent: '#7dd3fc',
    secondary: '#0c4a6e',
    description: 'سماء ليلية باردة',
  },
];

const EFFECT_OPTIONS: Array<{ key: EffectKey; label: string }> = [
  { key: 'particles', label: 'جزيئات متطايرة' },
  { key: 'halos', label: 'هالات ضوئية' },
  { key: 'breathingFrame', label: 'إطار متنفس' },
  { key: 'scanline', label: 'مسح ضوئي' },
  { key: 'fallingStars', label: 'نجوم متساقطة' },
  { key: 'rays', label: 'أشعة نورانية' },
  { key: 'glow', label: 'تألق النص' },
  { key: 'fog', label: 'ضباب ناعم' },
];

const VISIBILITY_OPTIONS: Array<{ key: VisibilityKey; label: string }> = [
  { key: 'title', label: 'اسم السورة' },
  { key: 'basmala', label: 'البسملة' },
  { key: 'verses', label: 'نص الآيات' },
  { key: 'reader', label: 'اسم القارئ' },
  { key: 'ending', label: 'صدق الله العظيم' },
];

const INITIAL_FATIHA: Verse[] = [
  { number: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
  { number: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
  { number: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ' },
  { number: 4, text: 'مَالِكِ يَوْمِ الدِّينِ' },
  { number: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
  { number: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ' },
  {
    number: 7,
    text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
  },
];

const INITIAL_SETTINGS: StudioSettings = {
  themeKey: 'gold',
  backgroundOpacity: 38,
  motion: 'zoom',
  motionSpeed: 1,
  effects: {
    particles: true,
    halos: true,
    breathingFrame: true,
    scanline: false,
    fallingStars: false,
    rays: true,
    glow: true,
    fog: false,
  },
  visibility: {
    title: true,
    basmala: true,
    verses: true,
    reader: true,
    ending: true,
  },
  fontSize: 20,
  fontFamily: "'Noto Naskh Arabic', 'Amiri', serif",
  fontWeight: 600,
  textColor: '#fffaf0',
  highlightColor: '#fbbf24',
};

function Panel({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/[0.07] bg-[#0b0e14] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.12)] ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-[11px] leading-5 text-slate-500">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-400">
        <span>{label}</span>
        <span className="font-mono text-amber-300">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-amber-400"
      />
    </label>
  );
}

function CheckRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-xs text-slate-300 transition hover:bg-white/[0.035]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-3.5 w-3.5 cursor-pointer rounded border-slate-600 bg-[#07090e] accent-amber-400"
      />
      <span>{label}</span>
    </label>
  );
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export default function QuranVideoStudioPage() {
  const [settings, setSettings] = useState<StudioSettings>(INITIAL_SETTINGS);
  const [surahId, setSurahId] = useState(1);
  const [fromAyah, setFromAyah] = useState(1);
  const [toAyah, setToAyah] = useState(7);
  const [readerId, setReaderId] = useState('afasy');
  const [readerSearch, setReaderSearch] = useState('');
  const [loadedVerses, setLoadedVerses] = useState<Verse[]>(INITIAL_FATIHA);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [surahPickerOpen, setSurahPickerOpen] = useState(false);
  const [surahSearch, setSurahSearch] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const selectedReader = READERS.find((reader) => reader.id === readerId) ?? READERS[7];
  const selectedTheme = THEMES.find((theme) => theme.id === settings.themeKey) ?? THEMES[0];
  const surahName = SURAH_NAMES[surahId - 1] ?? SURAH_NAMES[0];

  const audioUrl = useMemo(() => {
    const surahNumber = String(surahId).padStart(3, '0');
    const ayahNumber = String(Math.max(1, fromAyah)).padStart(3, '0');
    return `https://everyayah.com/data/${selectedReader.server}/${surahNumber}${ayahNumber}.mp3`;
  }, [fromAyah, selectedReader.server, surahId]);

  const visibleVerses = useMemo(
    () => loadedVerses.filter((verse) => verse.number >= fromAyah && verse.number <= toAyah),
    [fromAyah, loadedVerses, toAyah],
  );

  const filteredReaders = useMemo(() => {
    const query = readerSearch.trim().toLocaleLowerCase('ar');
    if (!query) return READERS;
    return READERS.filter((reader) => reader.name.toLocaleLowerCase('ar').includes(query));
  }, [readerSearch]);

  const filteredSurahs = useMemo(() => {
    const query = surahSearch.trim().toLocaleLowerCase('ar');
    return SURAH_NAMES.map((name, index) => ({ name, id: index + 1 })).filter((surah) => {
      return !query || surah.name.toLocaleLowerCase('ar').includes(query) || String(surah.id).includes(query);
    });
  }, [surahSearch]);

  const updateSettings = <K extends keyof StudioSettings,>(
    key: K,
    value: StudioSettings[K],
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const toggleEffect = (key: EffectKey, checked: boolean) => {
    setSettings((current) => ({
      ...current,
      effects: { ...current.effects, [key]: checked },
    }));
  };

  const toggleVisibility = (key: VisibilityKey, checked: boolean) => {
    setSettings((current) => ({
      ...current,
      visibility: { ...current.visibility, [key]: checked },
    }));
  };

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
  }, [audioUrl]);

  const handleLoadVerses = async () => {
    if (!Number.isInteger(fromAyah) || !Number.isInteger(toAyah) || fromAyah < 1 || toAyah < fromAyah) {
      setNotice({ kind: 'error', message: 'يرجى إدخال نطاق آيات صحيح يبدأ من 1 على الأقل.' });
      return;
    }

    setLoadingVerses(true);
    setNotice(null);
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/quran-uthmani`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`تعذر تحميل السورة (HTTP ${response.status}).`);
      }

      const payload = (await response.json()) as QuranApiResponse;
      const ayahs = payload.data?.ayahs;
      if (!Array.isArray(ayahs)) {
        throw new Error(payload.message || 'لم تُرجع خدمة القرآن نص الآيات المتوقع.');
      }

      const verses: Verse[] = ayahs
        .map((ayah, index) => ({
          number: Number(ayah.numberInSurah ?? index + 1),
          text: String(ayah.text ?? '').trim(),
        }))
        .filter((ayah) => ayah.number > 0 && ayah.text.length > 0);

      const inRange = verses.filter((verse) => verse.number >= fromAyah && verse.number <= toAyah);
      if (inRange.length === 0) {
        throw new Error('لا توجد آيات ضمن النطاق المحدد لهذه السورة.');
      }

      setLoadedVerses(verses);
      setNotice({
        kind: 'success',
        message: `تم تحميل ${inRange.length} آية من سورة ${surahName} بنجاح.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع أثناء تحميل الآيات.';
      setNotice({
        kind: 'error',
        message: `${message} تحقق من اتصال الإنترنت وحاول مرة أخرى.`,
      });
    } finally {
      setLoadingVerses(false);
    }
  };

  const handleTogglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) {
      setNotice({ kind: 'error', message: 'مشغل الصوت غير جاهز بعد.' });
      return;
    }

    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
      setNotice(null);
    } catch {
      setIsPlaying(false);
      setNotice({
        kind: 'error',
        message: 'تعذر تشغيل التلاوة. تحقق من اتصال الإنترنت أو اختر قارئاً آخر.',
      });
    }
  };

  const handleDownload = () => {
    try {
      const project = {
        application: 'Quran2Reels / Quran Video Studio',
        exportedAt: new Date().toISOString(),
        surah: { id: surahId, name: surahName },
        verses: { from: fromAyah, to: toAyah },
        reader: {
          id: selectedReader.id,
          name: selectedReader.name,
          audioUrl,
        },
        settings,
        backgroundImage,
      };
      const blob = new Blob([JSON.stringify(project, null, 2)], {
        type: 'application/json;charset=utf-8',
      });
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `quran2reels-surah-${surahId}-project.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      setNotice({
        kind: 'success',
        message: 'تم تنزيل إعدادات المشروع بصيغة JSON. يلزم ربط خدمة تصيير لإنتاج ملف فيديو MP4.',
      });
    } catch {
      setNotice({ kind: 'error', message: 'تعذر تصدير المشروع على هذا المتصفح.' });
    }
  };

  const handleInstantPublish = async () => {
    setPublishing(true);
    setNotice(null);
    try {
      const payload = {
        application: 'Quran2Reels',
        surah: { id: surahId, name: surahName },
        verses: visibleVerses,
        range: { from: fromAyah, to: toAyah },
        reader: {
          id: selectedReader.id,
          name: selectedReader.name,
          audioUrl,
        },
        settings,
        backgroundImage,
      };

      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as
        | { message?: string; error?: string; url?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          result?.error ||
            result?.message ||
            `خدمة النشر غير متاحة حالياً (HTTP ${response.status}). أضف Route في app/api/publish/route.ts.`,
        );
      }

      setNotice({
        kind: 'success',
        message: result?.url
          ? `تم النشر بنجاح: ${result.url}`
          : result?.message || 'استقبلت خدمة النشر المشروع بنجاح.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'تعذر إكمال النشر حالياً.';
      setNotice({ kind: 'error', message });
    } finally {
      setPublishing(false);
    }
  };

  const handleNewProject = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setSettings(INITIAL_SETTINGS);
    setSurahId(1);
    setFromAyah(1);
    setToAyah(7);
    setReaderId('afasy');
    setReaderSearch('');
    setLoadedVerses(INITIAL_FATIHA);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setBackgroundImage(null);
    setSurahPickerOpen(false);
    setSurahSearch('');
    setNotice({ kind: 'info', message: 'تم إنشاء مشروع جديد بالإعدادات الافتراضية.' });
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setNotice({ kind: 'error', message: 'اختر ملف صورة صالحاً بصيغة مدعومة.' });
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBackgroundImage(reader.result);
        setNotice({ kind: 'success', message: 'تم تحديث خلفية المعاينة.' });
      } else {
        setNotice({ kind: 'error', message: 'تعذر قراءة ملف الصورة المحدد.' });
      }
    };
    reader.onerror = () => {
      setNotice({ kind: 'error', message: 'تعذر فتح الصورة. جرّب ملفاً آخر.' });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const shiftAyahRange = (direction: -1 | 1) => {
    const nextFrom = Math.max(1, fromAyah + direction);
    const nextTo = Math.max(nextFrom, toAyah + direction);
    setFromAyah(nextFrom);
    setToAyah(nextTo);
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const motionClass =
    settings.motion === 'zoom'
      ? 'animate-pulse'
      : settings.motion === 'pan'
        ? 'animate-[bounce_18s_ease-in-out_infinite]'
        : settings.motion === 'orbit'
          ? 'animate-[spin_120s_linear_infinite]'
          : '';
  const backgroundStyle: CSSProperties = {
    backgroundImage: backgroundImage
      ? `url("${backgroundImage}")`
      : `radial-gradient(circle at 52% 27%, ${selectedTheme.accent}30 0%, transparent 27%), radial-gradient(circle at 20% 74%, ${selectedTheme.secondary}70 0%, transparent 32%), linear-gradient(145deg, #17202b 0%, #0b0e14 48%, #05070a 100%)`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    animationDuration: `${Math.max(1, settings.motionSpeed * 8)}s`,
  };

  return (
    <main dir="rtl" className="min-h-screen bg-[#07090e] text-slate-200 selection:bg-amber-400/30">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />

      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#07090e]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/[0.09] text-amber-300 shadow-[0_0_28px_rgba(251,191,36,0.07)]">
              <Sparkles size={20} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold tracking-wide text-white">Quran2Reels</div>
              <div className="mt-0.5 text-[9px] font-medium tracking-[0.22em] text-slate-500">QURAN VIDEO STUDIO</div>
            </div>
            <span className="hidden rounded-full border border-white/[0.08] px-2.5 py-1 text-[10px] text-slate-500 lg:inline-flex">
              مساحة العمل · 01
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              title="تنزيل إعدادات المشروع بصيغة JSON"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-amber-400/30 hover:bg-white/[0.06] hover:text-white"
            >
              <Download size={15} />
              <span>تحميل</span>
            </button>
            <button
              type="button"
              onClick={handleNewProject}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0b0e14] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              <Sparkles size={15} />
              <span>مشروع جديد</span>
            </button>
            <button
              type="button"
              onClick={handleInstantPublish}
              disabled={publishing}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300/20 bg-amber-400 px-3.5 py-2 text-xs font-bold text-[#17120a] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={14} />
              <span>{publishing ? 'جارٍ النشر…' : 'نشر فوري'}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-3 py-5 sm:px-6 sm:py-6">
        {notice ? (
          <div
            role="status"
            aria-live="polite"
            className={`mb-4 flex items-start gap-2 rounded-xl border px-3.5 py-3 text-xs leading-6 ${
              notice.kind === 'success'
                ? 'border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-200'
                : notice.kind === 'error'
                  ? 'border-rose-400/20 bg-rose-400/[0.06] text-rose-200'
                  : 'border-sky-400/20 bg-sky-400/[0.06] text-sky-100'
            }`}
          >
            <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
            <span>{notice.message}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="mr-auto rounded-md px-1 text-current/70 hover:text-current"
              aria-label="إخفاء التنبيه"
            >
              ×
            </button>
          </div>
        ) : null}

        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-[10px] font-semibold tracking-[0.22em] text-amber-400/80">CREATIVE WORKSPACE</p>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">استوديو فيديو القرآن الكريم</h1>
            <p className="mt-1.5 max-w-2xl text-xs leading-6 text-slate-500">
              صمّم معاينة عمودية للتلاوة، خصّص الهوية البصرية، ثم صدّر إعدادات المشروع أو اربطه بخدمة النشر.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-[#0b0e14] px-3 py-2 text-[10px] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,0.6)]" />
            المعاينة المباشرة مفعّلة
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
          {/* العمود الأيمن: إعدادات التلاوة */}
          <aside className="space-y-4 xl:col-span-3">
            <Panel title="إعدادات التلاوة" subtitle="اختر القارئ والسورة ونطاق الآيات.">
              <div className="relative">
                <Search size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="search"
                  value={readerSearch}
                  onChange={(event) => setReaderSearch(event.target.value)}
                  placeholder="ابحث عن قارئ…"
                  aria-label="ابحث عن قارئ"
                  className="w-full rounded-xl border border-white/[0.08] bg-[#07090e] py-2.5 pr-9 pl-3 text-xs text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-amber-400/40"
                />
              </div>

              <div className="mt-3 max-h-[310px] space-y-1 overflow-y-auto pl-1 [scrollbar-color:#303744_transparent] [scrollbar-width:thin]">
                {filteredReaders.map((reader) => {
                  const active = reader.id === readerId;
                  return (
                    <button
                      key={reader.id}
                      type="button"
                      onClick={() => setReaderId(reader.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-right transition ${
                        active
                          ? 'border-amber-400/25 bg-amber-400/[0.07]'
                          : 'border-transparent bg-transparent hover:border-white/[0.06] hover:bg-white/[0.025]'
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          active ? 'bg-amber-400/15 text-amber-300' : 'bg-white/[0.04] text-slate-500'
                        }`}
                      >
                        <Music size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-xs font-medium ${active ? 'text-amber-100' : 'text-slate-300'}`}>
                          {reader.name}
                        </span>
                        <span className="mt-1 block text-[10px] text-slate-600">خادم صوتي مباشر · {reader.quality}</span>
                      </span>
                      {active ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" /> : null}
                    </button>
                  );
                })}
                {filteredReaders.length === 0 ? (
                  <p className="rounded-lg px-3 py-5 text-center text-xs text-slate-500">لا توجد نتائج مطابقة.</p>
                ) : null}
              </div>
              <div className="mt-3 rounded-lg border border-white/[0.05] bg-black/20 px-3 py-2 text-[10px] leading-5 text-slate-500">
                القارئ الحالي: <span className="text-slate-300">{selectedReader.name}</span>
                <span className="mt-0.5 block break-all font-mono text-[9px] text-slate-600">everyayah.com/data/{selectedReader.server}/</span>
              </div>
            </Panel>

            <Panel title="السورة والآيات" subtitle="يمكنك تغيير النطاق ثم تحميل النص القرآني للسورة.">
              <div className="relative">
                <label className="mb-2 block text-[11px] text-slate-500">السورة</label>
                <button
                  type="button"
                  aria-expanded={surahPickerOpen}
                  onClick={() => setSurahPickerOpen((open) => !open)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#07090e] px-3 py-3 text-xs text-slate-200 transition hover:border-white/15"
                >
                  <span>{String(surahId).padStart(3, '0')} · سورة {surahName}</span>
                  <ChevronLeft size={15} className={`text-slate-500 transition ${surahPickerOpen ? '-rotate-90' : '-rotate-180'}`} />
                </button>

                {surahPickerOpen ? (
                  <div className="absolute inset-x-0 top-[68px] z-30 rounded-xl border border-white/10 bg-[#0b0e14] p-2 shadow-2xl">
                    <input
                      type="search"
                      value={surahSearch}
                      onChange={(event) => setSurahSearch(event.target.value)}
                      placeholder="ابحث عن سورة أو رقم…"
                      className="mb-2 w-full rounded-lg border border-white/[0.07] bg-[#07090e] px-3 py-2 text-xs outline-none focus:border-amber-400/40"
                    />
                    <div className="max-h-52 overflow-y-auto [scrollbar-width:thin]">
                      {filteredSurahs.map((surah) => (
                        <button
                          key={surah.id}
                          type="button"
                          onClick={() => {
                            setSurahId(surah.id);
                            setLoadedVerses([]);
                            setFromAyah(1);
                            setToAyah(7);
                            setSurahPickerOpen(false);
                            setSurahSearch('');
                            setNotice({ kind: 'info', message: `اخترت سورة ${surah.name}. حمّل الآيات لعرض نصها.` });
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition hover:bg-white/[0.05] ${surah.id === surahId ? 'text-amber-300' : 'text-slate-300'}`}
                        >
                          <span>{surah.name}</span>
                          <span className="font-mono text-[10px] text-slate-600">{String(surah.id).padStart(3, '0')}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-2 block text-[11px] text-slate-500">من آية</span>
                  <input
                    type="number"
                    min={1}
                    max={286}
                    value={fromAyah}
                    onChange={(event) => {
                      const next = Math.max(1, Number(event.target.value) || 1);
                      setFromAyah(next);
                      setToAyah((current) => Math.max(current, next));
                    }}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#07090e] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-amber-400/40"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] text-slate-500">إلى آية</span>
                  <input
                    type="number"
                    min={fromAyah}
                    max={286}
                    value={toAyah}
                    onChange={(event) => setToAyah(Math.max(fromAyah, Number(event.target.value) || fromAyah))}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#07090e] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-amber-400/40"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={handleLoadVerses}
                disabled={loadingVerses}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300/20 bg-amber-400 px-3 py-3 text-xs font-bold text-[#17120a] transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60"
              >
                {loadingVerses ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#17120a]/30 border-t-[#17120a]" /> : <Download size={15} />}
                {loadingVerses ? 'جارٍ تحميل الآيات…' : 'تحميل الآيات'}
              </button>
              <p className="mt-2 text-[10px] leading-5 text-slate-600">يتم جلب النص عند الطلب من خدمة alquran.cloud، مع إبقاء المعاينة متاحة إذا تعذر الاتصال.</p>
            </Panel>

            <Panel title="المصدر الصوتي" subtitle="التلاوة تُحمّل من خادم القارئ المختار عند التشغيل.">
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                  <Music size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-200">{selectedReader.name}</p>
                  <p className="mt-1 text-[10px] text-slate-500">سورة {surahName} · الآية {fromAyah}</p>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePlayback}
                  aria-label={isPlaying ? 'إيقاف التلاوة' : 'تشغيل التلاوة'}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[#17120a] transition hover:bg-amber-300"
                >
                  {isPlaying ? <Pause size={15} /> : <Play size={15} className="translate-x-[1px]" />}
                </button>
              </div>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-amber-400 transition-[width]" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between font-mono text-[9px] text-slate-600" dir="ltr">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </Panel>
          </aside>

          {/* العمود الأوسط: معاينة الفيديو */}
          <section className="space-y-4 xl:col-span-5">
            <Panel
              title="معاينة الفيديو"
              subtitle="Canvas عمودي بنسبة 9:16 — تتغير عناصره فور تعديل الإعدادات."
            >
              <div className="flex flex-col items-center">
                <div className="mb-3 flex w-full max-w-[420px] items-center justify-between gap-2 text-[10px] text-slate-500">
                  <span className="inline-flex items-center gap-1.5"><Video size={13} /> VERTICAL PREVIEW</span>
                  <span className="rounded-md border border-white/[0.08] px-2 py-1 font-mono">9:16 · 1080 × 1920</span>
                </div>

                <div
                  className={`relative h-[500px] w-[280px] max-w-full overflow-hidden rounded-[28px] border bg-[#05070a] shadow-[0_24px_70px_rgba(0,0,0,0.42)] ${settings.effects.breathingFrame ? 'animate-pulse' : ''}`}
                  style={{ borderColor: settings.effects.breathingFrame ? `${selectedTheme.accent}75` : 'rgba(255,255,255,0.12)' }}
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <div className={`absolute -inset-8 transition-transform duration-700 ${motionClass}`} style={backgroundStyle} />
                    <div
                      className="absolute inset-0"
                      style={{ backgroundColor: `rgba(5, 7, 10, ${settings.backgroundOpacity / 100})` }}
                    />
                    {settings.effects.halos ? (
                      <div
                        className="absolute inset-0 animate-pulse"
                        style={{
                          background: `radial-gradient(ellipse at 50% 34%, ${selectedTheme.accent}28, transparent 53%)`,
                          animationDuration: `${Math.max(2, settings.motionSpeed * 6)}s`,
                        }}
                      />
                    ) : null}
                    {settings.effects.rays ? (
                      <div
                        className="absolute inset-0 opacity-60"
                        style={{
                          background: `conic-gradient(from 205deg at 50% 36%, transparent 0deg, ${selectedTheme.accent}0b 18deg, transparent 38deg, ${selectedTheme.accent}12 58deg, transparent 82deg, ${selectedTheme.accent}09 106deg, transparent 145deg)`,
                        }}
                      />
                    ) : null}
                    {settings.effects.particles
                      ? Array.from({ length: 16 }, (_, index) => (
                          <span
                            key={`particle-${index}`}
                            className="absolute h-1 w-1 rounded-full bg-white/70 animate-pulse"
                            style={{
                              top: `${8 + ((index * 17) % 84)}%`,
                              left: `${7 + ((index * 29) % 86)}%`,
                              opacity: 0.2 + ((index % 4) * 0.14),
                              animationDelay: `${(index % 6) * 0.35}s`,
                              animationDuration: `${2.4 + (index % 5) * 0.7}s`,
                            }}
                          />
                        ))
                      : null}
                    {settings.effects.fallingStars
                      ? Array.from({ length: 5 }, (_, index) => (
                          <span
                            key={`star-${index}`}
                            className="absolute h-12 w-px rotate-45 bg-gradient-to-b from-transparent via-white/70 to-transparent animate-pulse"
                            style={{
                              top: `${8 + index * 14}%`,
                              left: `${18 + index * 15}%`,
                              animationDelay: `${index * 0.8}s`,
                              animationDuration: '3.5s',
                            }}
                          />
                        ))
                      : null}
                    {settings.effects.scanline ? (
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 4px, rgba(255,255,255,0.18) 5px)' }}
                      />
                    ) : null}
                    {settings.effects.fog ? (
                      <div className="absolute -inset-6 bg-white/[0.07] blur-2xl" />
                    ) : null}
                  </div>

                  <div className="absolute inset-x-0 top-0 z-10 px-4 pt-4">
                    <div className="mb-3 flex items-center justify-between gap-2 text-[8px] font-semibold tracking-[0.18em] text-white/70" dir="ltr">
                      <span>QURAN2REELS</span>
                      <span className="flex gap-1">
                        {Array.from({ length: 5 }, (_, index) => (
                          <span key={index} className="h-[2px] w-6 rounded-full" style={{ backgroundColor: index === 0 ? selectedTheme.accent : 'rgba(255,255,255,0.32)' }} />
                        ))}
                      </span>
                    </div>
                    {settings.visibility.title ? (
                      <div className="text-center">
                        <div className="mx-auto mb-2 h-px w-10" style={{ backgroundColor: selectedTheme.accent }} />
                        <h3 className="text-lg font-semibold text-white" style={{ textShadow: settings.effects.glow ? `0 0 22px ${selectedTheme.accent}80` : 'none' }}>
                          سورة {surahName}
                        </h3>
                        <p className="mt-1 text-[8px] tracking-[0.2em] text-white/55">THE HOLY QURAN</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="absolute inset-x-4 top-1/2 z-10 -translate-y-1/2">
                    {settings.visibility.basmala && surahId !== 1 && surahId !== 9 ? (
                      <p
                        className="mb-4 text-center text-[15px] leading-8"
                        style={{ color: settings.textColor, fontFamily: settings.fontFamily, fontWeight: settings.fontWeight, textShadow: settings.effects.glow ? `0 0 16px ${selectedTheme.accent}75` : 'none' }}
                      >
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </p>
                    ) : null}

                    {settings.visibility.verses ? (
                      <div
                        className="max-h-[218px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#05070a]/25 px-3 py-3 text-center backdrop-blur-[2px]"
                        style={{ color: settings.textColor, fontFamily: settings.fontFamily, fontSize: `${settings.fontSize}px`, fontWeight: settings.fontWeight, lineHeight: 1.9, textShadow: settings.effects.glow ? `0 0 18px ${selectedTheme.accent}55` : 'none' }}
                      >
                        {visibleVerses.length > 0 ? (
                          visibleVerses.map((verse) => (
                            <p key={verse.number} className="mb-1 last:mb-0">
                              {verse.text.split(/\s+/).map((word, index) => {
                                const highlighted = index % 5 === 2;
                                return (
                                  <span
                                    key={`${verse.number}-${index}`}
                                    className={highlighted ? 'rounded px-[1px]' : ''}
                                    style={highlighted ? { color: settings.highlightColor, textShadow: settings.effects.glow ? `0 0 15px ${settings.highlightColor}65` : 'none' } : undefined}
                                  >
                                    {word}{' '}
                                  </span>
                                );
                              })}
                              <span className="mx-1 inline-block text-[10px]" style={{ color: selectedTheme.accent }}>
                                ۞ {verse.number}
                              </span>
                            </p>
                          ))
                        ) : (
                          <p className="py-5 text-xs leading-7 text-white/70">
                            حمّل آيات سورة {surahName} لعرض النص القرآني هنا.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={handleTogglePlayback}
                    aria-label={isPlaying ? 'إيقاف المعاينة' : 'تشغيل المعاينة'}
                    className="absolute left-1/2 top-1/2 z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-black/35 text-white shadow-xl backdrop-blur-sm transition hover:scale-105 hover:bg-black/55"
                    style={{ borderColor: `${selectedTheme.accent}70`, boxShadow: `0 0 26px ${selectedTheme.accent}25` }}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-[1px]" />}
                  </button>

                  <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4 pt-10" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(5,7,10,0.38) 35%, rgba(5,7,10,0.78) 100%)' }}>
                    {settings.visibility.reader ? (
                      <div className="mb-3 text-center">
                        <p className="text-[8px] tracking-[0.18em] text-white/45">RECITER</p>
                        <p className="mt-1 text-xs font-medium text-white/90">{selectedReader.name}</p>
                      </div>
                    ) : null}
                    {settings.visibility.ending ? (
                      <p className="mb-3 text-center text-[11px] font-semibold" style={{ color: selectedTheme.accent, textShadow: settings.effects.glow ? `0 0 14px ${selectedTheme.accent}80` : 'none' }}>
                        صَدَقَ اللَّهُ الْعَظِيمُ
                      </p>
                    ) : null}
                    <div className="flex items-center gap-2" dir="ltr">
                      <span className="font-mono text-[8px] text-white/65">{formatTime(currentTime)}</span>
                      <input
                        type="range"
                        min={0}
                        max={Math.max(duration, 1)}
                        step={0.1}
                        value={Math.min(currentTime, Math.max(duration, 1))}
                        onChange={(event) => {
                          const nextTime = Number(event.target.value);
                          if (audioRef.current) audioRef.current.currentTime = nextTime;
                          setCurrentTime(nextTime);
                        }}
                        aria-label="موضع التلاوة"
                        className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/25 accent-amber-400"
                      />
                      <span className="font-mono text-[8px] text-white/65">{formatTime(duration)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[8px] text-white/45" dir="ltr">
                      <span className="inline-flex items-center gap-1"><Music size={10} /> AUDIO</span>
                      <span>QURAN VIDEO STUDIO</span>
                    </div>
                  </div>

                  {settings.effects.breathingFrame ? (
                    <div className="pointer-events-none absolute inset-2 z-30 rounded-[22px] border" style={{ borderColor: `${selectedTheme.accent}38` }} />
                  ) : null}
                </div>

                <div className="mt-4 flex w-full max-w-[320px] items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => shiftAyahRange(-1)}
                    aria-label="الانتقال إلى الآية السابقة"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] text-slate-400 transition hover:border-amber-400/30 hover:text-amber-300"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <div className="min-w-0 flex-1 text-center">
                    <p className="truncate text-[11px] font-medium text-slate-200">سورة {surahName}</p>
                    <p className="mt-1 text-[9px] text-slate-600">الآيات {fromAyah}–{toAyah}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => shiftAyahRange(1)}
                    aria-label="الانتقال إلى الآية التالية"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] text-slate-400 transition hover:border-amber-400/30 hover:text-amber-300"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>

                <div className="mt-4 grid w-full max-w-[420px] grid-cols-3 gap-2">
                  <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3 text-center">
                    <Video size={15} className="mx-auto mb-2 text-slate-500" />
                    <p className="text-[10px] text-slate-300">9:16 عمودي</p>
                    <p className="mt-1 text-[9px] text-slate-600">مهيأ للريلز</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3 text-center">
                    <Music size={15} className="mx-auto mb-2 text-slate-500" />
                    <p className="text-[10px] text-slate-300">تلاوة مباشرة</p>
                    <p className="mt-1 text-[9px] text-slate-600">{selectedReader.quality}</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3 text-center">
                    <Eye size={15} className="mx-auto mb-2 text-slate-500" />
                    <p className="text-[10px] text-slate-300">معاينة حيّة</p>
                    <p className="mt-1 text-[9px] text-slate-600">تحديث فوري</p>
                  </div>
                </div>
              </div>
            </Panel>
          </section>

          {/* العمود الأيسر: الهوية البصرية والتحكم */}
          <aside className="space-y-4 xl:col-span-4">
            <Panel title="الهوية البصرية" subtitle="اختر لوحة الألوان التي تظهر فوراً في شاشة المعاينة.">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
                {THEMES.map((theme) => {
                  const active = theme.id === settings.themeKey;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSettings((current) => ({ ...current, themeKey: theme.id, highlightColor: theme.accent }))}
                      className={`rounded-xl border p-2.5 text-right transition ${active ? 'border-amber-300/35 bg-white/[0.045]' : 'border-white/[0.06] bg-black/10 hover:border-white/[0.15]'}`}
                    >
                      <span className="mb-2 flex h-8 items-center gap-1 overflow-hidden rounded-lg p-1" style={{ background: `linear-gradient(120deg, #05070a, ${theme.secondary})` }}>
                        <span className="h-5 w-5 rounded-md" style={{ backgroundColor: theme.accent, boxShadow: `0 0 18px ${theme.accent}45` }} />
                        <span className="h-1.5 flex-1 rounded-full bg-white/15" />
                        <span className="h-1.5 w-4 rounded-full" style={{ backgroundColor: `${theme.accent}95` }} />
                      </span>
                      <span className="block text-[11px] font-medium text-slate-200">{theme.name}</span>
                      <span className="mt-1 block truncate text-[9px] text-slate-600">{theme.description}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-black/20 px-3 py-2.5 text-xs text-slate-300 transition hover:border-amber-400/30 hover:text-white"
                >
                  <Upload size={14} />
                  رفع خلفية
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBackgroundImage(null);
                    setNotice({ kind: 'info', message: 'تمت استعادة الخلفية التدرجية الافتراضية.' });
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-black/20 px-3 py-2.5 text-xs text-slate-400 transition hover:border-white/20 hover:text-slate-200"
                >
                  <Sparkles size={14} />
                  استعادة الخلفية
                </button>
                <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>

              <div className="mt-5 border-t border-white/[0.06] pt-4">
                <RangeField
                  label="تعتيم الخلفية"
                  value={settings.backgroundOpacity}
                  min={0}
                  max={100}
                  suffix="%"
                  onChange={(value) => updateSettings('backgroundOpacity', value)}
                />
                <div className="mt-2 flex justify-between text-[9px] text-slate-600">
                  <span>خلفية واضحة</span>
                  <span>تعتيم كامل</span>
                </div>
              </div>
            </Panel>

            <Panel title="حركة الصورة" subtitle="تحكم في نمط حركة الخلفية وسرعتها.">
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: 'none', label: 'ثابتة' },
                  { id: 'zoom', label: 'تقريب ناعم' },
                  { id: 'pan', label: 'حركة هادئة' },
                  { id: 'orbit', label: 'دوران بطيء' },
                ] as const).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => updateSettings('motion', mode.id)}
                    className={`rounded-xl border px-3 py-2.5 text-xs transition ${settings.motion === mode.id ? 'border-amber-400/30 bg-amber-400/[0.08] text-amber-200' : 'border-white/[0.07] bg-black/10 text-slate-400 hover:border-white/15 hover:text-slate-200'}`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <RangeField
                  label="سرعة الحركة"
                  value={settings.motionSpeed}
                  min={0.5}
                  max={2.5}
                  step={0.25}
                  suffix="×"
                  onChange={(value) => updateSettings('motionSpeed', value)}
                />
              </div>
            </Panel>

            <Panel title="التأثيرات البصرية" subtitle="فعّل التأثيرات التي تريد عرضها فوق الخلفية.">
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                {EFFECT_OPTIONS.map((effect) => (
                  <CheckRow
                    key={effect.key}
                    label={effect.label}
                    checked={settings.effects[effect.key]}
                    onChange={(checked) => toggleEffect(effect.key, checked)}
                  />
                ))}
              </div>
            </Panel>

            <Panel title="إعدادات النص" subtitle="خصّص الخط والوزن والألوان حسب تصميم الفيديو.">
              <div className="mb-4 flex items-center gap-2 text-[11px] text-slate-500">
                <Type size={14} className="text-amber-300" />
                إعدادات الخط القرآني
              </div>
              <div className="space-y-4">
                <RangeField
                  label="حجم الخط"
                  value={settings.fontSize}
                  min={14}
                  max={30}
                  suffix=" px"
                  onChange={(value) => updateSettings('fontSize', value)}
                />
                <label className="block">
                  <span className="mb-2 block text-xs text-slate-400">نوع الخط</span>
                  <select
                    value={settings.fontFamily}
                    onChange={(event) => updateSettings('fontFamily', event.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#07090e] px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-amber-400/40"
                  >
                    <option value="'Noto Naskh Arabic', 'Amiri', serif">نسخ عربي كلاسيكي</option>
                    <option value="'Amiri', 'Noto Naskh Arabic', serif">Amiri</option>
                    <option value="'Cairo', 'Tahoma', sans-serif">Cairo</option>
                    <option value="'Tahoma', Arial, sans-serif">Tahoma</option>
                    <option value="Arial, sans-serif">Arial</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs text-slate-400">سمك الخط</span>
                  <select
                    value={settings.fontWeight}
                    onChange={(event) => updateSettings('fontWeight', Number(event.target.value))}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#07090e] px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-amber-400/40"
                  >
                    <option value={400}>عادي · 400</option>
                    <option value={500}>متوسط · 500</option>
                    <option value={600}>شبه عريض · 600</option>
                    <option value={700}>عريض · 700</option>
                    <option value={800}>عريض جداً · 800</option>
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-2 block text-xs text-slate-400">لون النص</span>
                    <span className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#07090e] px-2.5 py-2">
                      <input
                        type="color"
                        value={settings.textColor}
                        onChange={(event) => updateSettings('textColor', event.target.value)}
                        aria-label="لون النص"
                        className="h-6 w-7 cursor-pointer border-0 bg-transparent p-0"
                      />
                      <span className="font-mono text-[10px] text-slate-500">{settings.textColor.toUpperCase()}</span>
                    </span>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs text-slate-400">لون التمييز</span>
                    <span className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#07090e] px-2.5 py-2">
                      <input
                        type="color"
                        value={settings.highlightColor}
                        onChange={(event) => updateSettings('highlightColor', event.target.value)}
                        aria-label="لون الكلمات المميزة"
                        className="h-6 w-7 cursor-pointer border-0 bg-transparent p-0"
                      />
                      <span className="font-mono text-[10px] text-slate-500">{settings.highlightColor.toUpperCase()}</span>
                    </span>
                  </label>
                </div>
              </div>
            </Panel>

            <Panel title="عناصر العرض" subtitle="إظهار أو إخفاء الأجزاء النصية داخل شاشة الفيديو.">
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                {VISIBILITY_OPTIONS.map((item) => (
                  <CheckRow
                    key={item.key}
                    label={item.label}
                    checked={settings.visibility[item.key]}
                    onChange={(checked) => toggleVisibility(item.key, checked)}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/[0.05] bg-black/20 px-3 py-2 text-[10px] text-slate-500">
                <Sliders size={13} className="shrink-0 text-amber-300/70" />
                جميع التعديلات تنعكس على المعاينة في المنتصف مباشرة.
              </div>
            </Panel>
          </aside>
        </div>

        <footer className="mt-6 flex flex-col gap-2 border-t border-white/[0.06] pt-4 text-[10px] leading-5 text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-1.5"><Sparkles size={12} className="text-amber-400/70" /> Quran2Reels · استوديو تصميم التلاوات</span>
          <span>تنزيل الإعدادات يعمل محلياً · النشر الفوري يحتاج endpoint في المشروع · لا يتم إنشاء MP4 دون خدمة تصيير فيديو.</span>
        </footer>
      </div>
    </main>
  );
}
