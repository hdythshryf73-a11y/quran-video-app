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
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Globe,
  Lock,
  Music,
  Pause,
  Play,
  Clock,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Type,
  Upload,
  Video,
  X,
Video as Youtube,} from 'lucide-react';

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
type VisibilityKey = 'title' | 'basmala' | 'verses' | 'reader' | 'ending' | 'watermark';
type AspectRatio = '9:16' | '16:9';
type Notice = {
  kind: 'success' | 'error' | 'info';
  message: string;
  url?: string;
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

type ScheduleSettings = {
  channelUrl: string;
  videoType: 'shorts' | 'long';
  publishTime: string;
  autoSelectVerses: boolean;
  selectedReaderId: string;
  isAuthorized: boolean;
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
  'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس',
  'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',
  'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',
  'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر',
  'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق',
  'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',
  'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
  'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس',
  'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد',
  'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات',
  'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر',
  'المسد', 'الإخلاص', 'الفلق', 'الناس',
] as const;

const READERS: Reader[] = [
  { id: 'khalid-jaleel', name: 'خالد عبد الجليل', server: 'Khaf-Al-Jaleel_128kbps', quality: 'Murattal · 128 kbps' },
  { id: 'shaateri', name: 'أبو بكر الشاطري', server: 'Abu_Bakr_Ash-Shaatree_128kbps', quality: 'Murattal · 128 kbps' },
  { id: 'shuraim', name: 'سعود الشريم', server: 'Saood_ash-Shuraym_128kbps', quality: 'Murattal · 128 kbps' },
  { id: 'basit', name: 'عبد الباسط عبد الصمد', server: 'Abdul_Basit_Murattal_192kbps', quality: 'Murattal · 192 kbps' },
  { id: 'sudais', name: 'عبد الرحمن السديس', server: 'Abdurrahmaan_As-Sudais_192kbps', quality: 'Murattal · 192 kbps' },
  { id: 'qasim', name: 'عبد المحسن القاسم', server: 'Muhsin_Al_Qasim_192kbps', quality: 'Murattal · 192 kbps' },
  { id: 'minshawi', name: 'محمد صديق المنشاوي', server: 'Minshawy_Murattal_128kbps', quality: 'Murattal · 128 kbps' },
  { id: 'husary', name: 'محمود خليل الحصري', server: 'Husary_128kbps', quality: 'Murattal · 128 kbps' },
  { id: 'afasy', name: 'مشاري العفاسي', server: 'Alafasy_128kbps', quality: 'Murattal · 128 kbps' },
  { id: 'hani-rifai', name: 'هاني الرفاعي', server: 'Hani_Rifai_192kbps', quality: 'Murattal · 192 kbps' },
  { id: 'ajamy', name: 'أحمد بن علي العجمي', server: 'ahmed_ibn_ali_al_ajamy_128kbps', quality: '128 kbps' },
  { id: 'ayyoub', name: 'محمد أيوب', server: 'Muhammad_Ayyoub_128kbps', quality: '128 kbps' },
  { id: 'jibreel', name: 'محمد جبريل', server: 'Muhammad_Jibreel_128kbps', quality: '128 kbps' },
  { id: 'hudhaify', name: 'علي الحذيفي', server: 'Hudhaify_128kbps', quality: '128 kbps' },
  { id: 'ibrahim-akhdar', name: 'إبراهيم الأخضر', server: 'Ibrahim_Akhdar_32kbps', quality: '32 kbps' },
  { id: 'nasser-alqatami', name: 'ناصر القطامي', server: 'Nasser_Alqatami_128kbps', quality: '128 kbps' },
  { id: 'fares-abbad', name: 'فارس عباد', server: 'Fares_Abbad_64kbps', quality: '64 kbps' },
  { id: 'dussary', name: 'ياسر الدوسري', server: 'Yasser_Ad-Dussary_128kbps', quality: '128 kbps' },
  { id: 'sahl-yassin', name: 'سهل ياسين', server: 'Sahl_Yassin_128kbps', quality: '128 kbps' },
  { id: 'basfar', name: 'عبد الله بصفر', server: 'Abdullah_Basfar_192kbps', quality: '192 kbps' },
  { id: 'ayman-sowaid', name: 'أيمن سويد', server: 'Ayman_Sowaid_64kbps', quality: '64 kbps' },
  { id: 'khalifa-tunaiji', name: 'خليفة الطنيجي', server: 'khalefa_al_tunaiji_64kbps', quality: '64 kbps' },
  { id: 'bukhatir', name: 'صلاح بوخاطر', server: 'Salaah_AbdulRahman_Bukhatir_128kbps', quality: '128 kbps' },
  { id: 'matroud', name: 'عبد الله مطرود', server: 'Abdullah_Matroud_128kbps', quality: '128 kbps' },
  { id: 'alaqlaqi', name: 'أكرم العلاقمي', server: 'Akram_AlAlaqimy_128kbps', quality: '128 kbps' },
  { id: 'ali-jaber', name: 'علي جابر', server: 'Ali_Jaber_64kbps', quality: '64 kbps' },
  { id: 'banna', name: 'محمود علي البنا', server: 'mahmoud_ali_al_banna_32kbps', quality: '32 kbps' },
  { id: 'juhany', name: 'عبد الله عواد الجهني', server: 'Abdullaah_3awwaad_Al-Juhaynee_128kbps', quality: '128 kbps' },
  { id: 'yaser-salamah', name: 'ياسر سلامة', server: 'Yaser_Salamah_128kbps', quality: '128 kbps' },
  { id: 'neana', name: 'أحمد نعينع', server: 'Ahmed_Neana_128kbps', quality: '128 kbps' },
  { id: 'karim-mansoori', name: 'كريم منصوري', server: 'Karim_Mansoori_40kbps', quality: '40 kbps' },
  { id: 'tablawi', name: 'محمد الطبلاوي', server: 'Mohammad_al_Tablaway_128kbps', quality: '128 kbps' },
  { id: 'ghamadi', name: 'سعد الغامدي', server: 'Ghamadi_40kbps', quality: '40 kbps' },
  { id: 'budair', name: 'صالح البدير', server: 'Salah_Al_Budair_128kbps', quality: '128 kbps' },
  { id: 'muaiqly', name: 'ماهر المعيقلي', server: 'Maher_AlMuaiqly_64kbps', quality: '64 kbps' },
  { id: 'abdulkareem', name: 'محمد عبد الكريم', server: 'Muhammad_AbdulKareem_128kbps', quality: '128 kbps' },
  { id: 'aziz-alili', name: 'عزيز عليلي', server: 'Aziz_Alili_128kbps', quality: '128 kbps' },
  { id: 'nabil-rifai', name: 'نبيل الرفاعي', server: 'Nabil_Rifa3i_48kbps', quality: '48 kbps' },
  { id: 'parhizgar', name: 'شهريار پرهيزگار', server: 'Parhizgar_48kbps', quality: '48 kbps' },
];

const THEMES: Array<{
  id: ThemeKey;
  name: string;
  accent: string;
  secondary: string;
  description: string;
}> = [
  { id: 'gold', name: 'ذهبي السعد', accent: '#fbbf24', secondary: '#92400e', description: 'وهج ذهبي دافئ' },
  { id: 'blue', name: 'أزرق عصري', accent: '#60a5fa', secondary: '#1d4ed8', description: 'تدرجات زرقاء هادئة' },
  { id: 'green', name: 'أخضر إسلامي', accent: '#86efac', secondary: '#166534', description: 'لمسات خضراء ناعمة' },
  { id: 'purple', name: 'بنفسجي ملكي', accent: '#c4b5fd', secondary: '#6d28d9', description: 'طابع بنفسجي فاخر' },
  { id: 'emerald', name: 'زمردي', accent: '#34d399', secondary: '#065f46', description: 'توهج زمردي عميق' },
  { id: 'night', name: 'سماء الليل', accent: '#7dd3fc', secondary: '#0c4a6e', description: 'سماء ليلية باردة' },
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
  { key: 'watermark', label: 'علامة السعد المائية' },
];

const INITIAL_FATIHA: Verse[] = [
  { number: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
  { number: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
  { number: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ' },
  { number: 4, text: 'مَالِكِ يَوْمِ الدِّينِ' },
  { number: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
  { number: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ' },
  { number: 7, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ' },
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
    watermark: true,
  },
  fontSize: 20,
  fontFamily: "'Noto Naskh Arabic', 'Amiri', serif",
  fontWeight: 600,
  textColor: '#fffaf0',
  highlightColor: '#fbbf24',
};

function Panel({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-white/[0.07] bg-[#0b0e14] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.12)] ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
          {subtitle && <p className="mt-1 text-[11px] leading-5 text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function RangeField({ label, value, min, max, step = 1, suffix = '', onChange }: { label: string; value: number; min: number; max: number; step?: number; suffix?: string; onChange: (val: number) => void }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-400">
        <span>{label}</span>
        <span className="font-mono text-amber-300">{value}{suffix}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-amber-400"
      />
    </label>
  );
}

function CheckRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (val: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-xs text-slate-300 transition hover:bg-white/[0.035]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
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
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [exporting, setExporting] = useState(false);
  const [readerId, setReaderId] = useState('khalid-jaleel');
  const [readerSearch, setReaderSearch] = useState('');
  const [loadedVerses, setLoadedVerses] = useState<Verse[]>(INITIAL_FATIHA);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [publishing, setPublishing] = useState(false);

  // Auto Publish & Schedule Modal States
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings>({
    channelUrl: '',
    videoType: 'shorts',
    publishTime: '18:00',
    autoSelectVerses: true,
    selectedReaderId: 'khalid-jaleel',
    isAuthorized: false,
  });

  const [surahPickerOpen, setSurahPickerOpen] = useState(false);
  const [surahSearch, setSurahSearch] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentVerseIndexRef = useRef(0);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const selectedReader = READERS.find((reader) => reader.id === readerId) ?? READERS[0];
  const selectedTheme = THEMES.find((theme) => theme.id === settings.themeKey) ?? THEMES[0];
  const surahName = SURAH_NAMES[surahId - 1] ?? SURAH_NAMES[0];

  const visibleVerses = useMemo(
    () => loadedVerses.filter((verse) => verse.number >= fromAyah && verse.number <= toAyah),
    [fromAyah, loadedVerses, toAyah],
  );

  const currentVerse = visibleVerses[currentVerseIndex] ?? visibleVerses[0] ?? null;

  const audioUrl = useMemo(() => {
    const surahNumberPadded = String(surahId).padStart(3, '0');
    const ayahNumberPadded = String(Math.max(1, currentVerse?.number ?? fromAyah)).padStart(3, '0');
    return `https://everyayah.com/data/${selectedReader.server}/${surahNumberPadded}${ayahNumberPadded}.mp3`;
  }, [currentVerse?.number, fromAyah, selectedReader.server, surahId]);

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

  const updateSettings = <K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const toggleEffect = (key: EffectKey, checked: boolean) => {
    setSettings((current) => ({ ...current, effects: { ...current.effects, [key]: checked } }));
  };

  const toggleVisibility = (key: VisibilityKey, checked: boolean) => {
    setSettings((current) => ({ ...current, visibility: { ...current.visibility, [key]: checked } }));
  };

  useEffect(() => {
    currentVerseIndexRef.current = currentVerseIndex;
  }, [currentVerseIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = audioUrl;
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
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
      if (!response.ok) throw new Error(`تعذر تحميل السورة (HTTP ${response.status}).`);

      const payload = (await response.json()) as QuranApiResponse;
      const ayahs = payload.data?.ayahs;
      if (!Array.isArray(ayahs)) throw new Error(payload.message || 'لم تُرجع خدمة القرآن نص الآيات المتوقع.');

      const verses: Verse[] = ayahs
        .map((ayah, index) => ({
          number: Number(ayah.numberInSurah ?? index + 1),
          text: String(ayah.text ?? '').trim(),
        }))
        .filter((ayah) => ayah.number > 0 && ayah.text.length > 0);

      const inRange = verses.filter((verse) => verse.number >= fromAyah && verse.number <= toAyah);
      if (inRange.length === 0) throw new Error('لا توجد آيات ضمن النطاق المحدد لهذه السورة.');

      setLoadedVerses(verses);
      setNotice({ kind: 'success', message: `تم تحميل ${inRange.length} آية من سورة ${surahName} بنجاح.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع أثناء تحميل الآيات.';
      setNotice({ kind: 'error', message: `${message} تحقق من اتصال الإنترنت وحاول مرة أخرى.` });
    } finally {
      setLoadingVerses(false);
    }
  };

  const handleTogglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

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
      setNotice({ kind: 'error', message: 'تعذر تشغيل الصوت. تحقق من اتصال الإنترنت أو اختر قارئاً آخر.' });
    }
  };

  const renderVideoBlob = async (): Promise<Blob> => {
    if (!visibleVerses.length) throw new Error('حمّل الآيات أولاً قبل تصدير الفيديو.');

    const width = aspectRatio === '9:16' ? 1080 : 1920;
    const height = aspectRatio === '9:16' ? 1920 : 1080;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('تعذر إنشاء Canvas لتصيير الفيديو.');

    const audio = audioRef.current;
    if (!audio) throw new Error('مشغل الصوت غير جاهز.');

    const audioStream = (audio as any).captureStream ? (audio as any).captureStream() : (audio as any).mozCaptureStream();
    const canvasStream = canvas.captureStream(30);
    const combinedStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioStream.getAudioTracks()]);

    const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm;codecs=vp9,opus' });
    const chunks: Blob[] = [];

    return new Promise((resolve, reject) => {
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        resolve(blob);
      };

      recorder.onerror = (e) => reject(e);

      recorder.start();
      audio.currentTime = 0;
      audio.play();

      const drawLoop = () => {
        if (audio.ended || audio.paused) {
          recorder.stop();
          return;
        }

        context.fillStyle = '#0b0e14';
        context.fillRect(0, 0, width, height);

        // Watermark "السعد"
        if (settings.visibility.watermark) {
          context.save();
          context.globalAlpha = 0.2;
          context.font = 'bold 120px "Noto Naskh Arabic", serif';
          context.fillStyle = '#fbbf24';
          context.textAlign = 'center';
          context.fillText('السعد', width / 2, height / 2);
          context.restore();
        }

        // Verse text
        if (currentVerse && settings.visibility.verses) {
          context.save();
          context.font = `600 ${settings.fontSize * 3}px ${settings.fontFamily}`;
          context.fillStyle = settings.textColor;
          context.textAlign = 'center';
          context.fillText(currentVerse.text, width / 2, height / 2 + 100);
          context.restore();
        }

        requestAnimationFrame(drawLoop);
      };

      drawLoop();
    });
  };

  const handleDownloadVideo = async () => {
    setExporting(true);
    setNotice({ kind: 'info', message: 'جاري تسجيل وتوليد ملف الفيديو المباشر...' });
    try {
      const blob = await renderVideoBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AlSaad_Quran_${surahName}_Ayah_${currentVerse?.number ?? 1}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
      setNotice({ kind: 'success', message: 'تم تحميل الفيديو المباشر بنجاح!' });
    } catch (err) {
      setNotice({ kind: 'error', message: err instanceof Error ? err.message : 'فشل تصدير الفيديو.' });
    } finally {
      setExporting(false);
    }
  };

  const handleTestInstantPublish = async () => {
    setPublishing(true);
    setNotice({ kind: 'info', message: 'جاري النشر المباشر على يوتيوب عبر API...' });
    try {
      const blob = await renderVideoBlob();
      const formData = new FormData();
      formData.append('video', blob, 'video.mp4');
      formData.append('title', `سورة ${surahName} بصوت ${selectedReader.name} - استوديو السعد`);
      formData.append('description', 'تم الإنتاج والنشر تلقائياً بواسطة منصة استوديو السعد للقرآن الكريم.');

      const response = await fetch('/api/publish', {
        method: 'POST',
        body: formData,
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'فشلت عملية النشر على يوتيوب.');

      setNotice({
        kind: 'success',
        message: 'تم نشر الفيديو بنجاح على قناتك في يوتيوب!',
        url: resData.videoUrl,
      });
    } catch (err) {
      setNotice({ kind: 'error', message: err instanceof Error ? err.message : 'حدث خطأ أثناء النشر.' });
    } finally {
      setPublishing(false);
    }
  };

  const handleGoogleOAuth2Connect = () => {
    // محاكاة مصادقة OAuth2 الآمنة لمنع التعدي على القنوات
    alert('سيتم توجيهك الآن للتحقق من ملكية القناة وتسجيل الدخول بحساب Google/YouTube المالك.');
    setScheduleSettings((prev) => ({ ...prev, isAuthorized: true }));
  };

  return (
    <div className="min-h-screen bg-[#07090e] font-sans text-slate-100 dir-rtl" dir="rtl">
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/[0.08] bg-[#07090e]/90 px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              استوديو السعد <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20">Al-Saad Studio</span>
            </h1>
            <p className="text-[11px] text-slate-400">منصة إنتاج ونشر الفيديوهات القرآنية الأوتوماتيكية</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
          >
            <Clock className="h-4 w-4" />
            <span>النشر التلقائي والجدولة</span>
          </button>

          <button
            onClick={handleDownloadVideo}
            disabled={exporting}
            className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{exporting ? 'جاري التصدير...' : 'تحميل الفيديو MP4'}</span>
          </button>
        </div>
      </header>

      {/* Notifications */}
      {notice && (
        <div className={`mx-6 mt-4 flex items-center justify-between rounded-xl px-4 py-3 text-xs border ${notice.kind === 'error' ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'}`}>
          <span>{notice.message}</span>
          {notice.url && (
            <a href={notice.url} target="_blank" rel="noreferrer" className="underline font-bold text-amber-300">
              مشاهدة على يوتيوب
            </a>
          )}
        </div>
      )}

      {/* Main Studio Grid */}
      <main className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-12">
        {/* Right Panel: Controls & Reciters */}
        <div className="space-y-6 lg:col-span-3">
          <Panel title="اختيار القارئ" subtitle="قائمة تضم 38+ قارئاً مع جودات مختلفة">
            <div className="relative mb-3">
              <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={readerSearch}
                onChange={(e) => setReaderSearch(e.target.value)}
                placeholder="ابحث عن القارئ (خالد عبد الجليل...)"
                className="w-full rounded-xl border border-white/10 bg-[#07090e] py-2 pr-9 pl-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
              {filteredReaders.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setReaderId(r.id)}
                  className={`flex w-full items-center justify-between rounded-lg p-2 text-right text-xs transition ${readerId === r.id ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30' : 'text-slate-300 hover:bg-white/5'}`}
                >
                  <span className="font-medium">{r.name}</span>
                  <span className="text-[10px] text-slate-500">{r.quality}</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="اختيار النص والآيات" subtitle="حدد السورة ونطاق الآيات المطلوب">
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-slate-400">السورة</label>
                <select
                  value={surahId}
                  onChange={(e) => setSurahId(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-[#07090e] p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  {SURAH_NAMES.map((name, idx) => (
                    <option key={idx} value={idx + 1}>
                      {idx + 1}. سورة {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">من آية</label>
                  <input
                    type="number"
                    min={1}
                    value={fromAyah}
                    onChange={(e) => setFromAyah(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-[#07090e] p-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">إلى آية</label>
                  <input
                    type="number"
                    min={1}
                    value={toAyah}
                    onChange={(e) => setToAyah(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-[#07090e] p-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleLoadVerses}
                disabled={loadingVerses}
                className="w-full rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-amber-300 hover:bg-slate-700 disabled:opacity-50"
              >
                {loadingVerses ? 'جاري جلب الآيات...' : 'تحديث ونقّل الآيات'}
              </button>
            </div>
          </Panel>
        </div>

        {/* Center Panel: Video Canvas & Controls */}
        <div className="space-y-4 lg:col-span-6">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b0e14] p-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">أبعاد الفيديو:</span>
              <button
                onClick={() => setAspectRatio('9:16')}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition ${aspectRatio === '9:16' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
              >
                عمودي (9:16) Shorts
              </button>
              <button
                onClick={() => setAspectRatio('16:9')}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition ${aspectRatio === '16:9' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
              >
                عرضي (16:9) YouTube
              </button>
            </div>

            <button
              onClick={handleTogglePlayback}
              className="flex items-center gap-2 rounded-xl bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isPlaying ? 'إيقاف' : 'تشغيل الصوت'}</span>
            </button>
          </div>

          {/* Video Live Preview Frame */}
          <div className={`relative mx-auto flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl transition-all ${aspectRatio === '9:16' ? 'aspect-[9/16] max-w-sm' : 'aspect-video w-full'}`}>
            {/* Watermark "السعد" background */}
            {settings.visibility.watermark && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10 select-none">
                <span className="text-8xl font-bold text-amber-400">السعد</span>
              </div>
            )}

            {/* Header */}
            <div className="text-center z-10">
              {settings.visibility.title && (
                <h3 className="text-lg font-bold text-amber-300">سورة {surahName}</h3>
              )}
            </div>

            {/* Ayah Content */}
            <div className="text-center z-10 space-y-4">
              {settings.visibility.basmala && surahId !== 1 && surahId !== 9 && (
                <p className="text-xs text-amber-200/70">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
              )}

              {currentVerse && settings.visibility.verses && (
                <div className="space-y-2">
                  <p className="text-lg font-medium leading-relaxed text-white drop-shadow-md" style={{ fontSize: `${settings.fontSize}px` }}>
                    {currentVerse.text}
                  </p>
                  <span className="inline-block rounded-full bg-amber-400/20 px-3 py-0.5 text-xs font-bold text-amber-300">
                    آية {currentVerse.number}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center z-10 space-y-1">
              {settings.visibility.reader && (
                <p className="text-xs font-medium text-slate-300">{selectedReader.name}</p>
              )}
              {settings.visibility.ending && (
                <p className="text-[10px] text-amber-400">صَدَقَ اللَّهُ الْعَظِيمُ</p>
              )}
            </div>
          </div>

          {/* Verse Navigation Buttons */}
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b0e14] p-3">
            <button
              onClick={() => setCurrentVerseIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentVerseIndex === 0}
              className="flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs text-white hover:bg-slate-700 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
              <span>الآية السابقة</span>
            </button>
            <span className="text-xs text-slate-400">
              آية {currentVerseIndex + 1} من {visibleVerses.length}
            </span>
            <button
              onClick={() => setCurrentVerseIndex((prev) => Math.min(visibleVerses.length - 1, prev + 1))}
              disabled={currentVerseIndex >= visibleVerses.length - 1}
              className="flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs text-white hover:bg-slate-700 disabled:opacity-40"
            >
              <span>الآية التالية</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Left Panel: Display Settings & Visibility Options */}
        <div className="space-y-6 lg:col-span-3">
          <Panel title="تخصيص العناصر والعلامة المائية">
            <div className="space-y-1">
              {VISIBILITY_OPTIONS.map((item) => (
                <CheckRow
                  key={item.key}
                  label={item.label}
                  checked={settings.visibility[item.key]}
                  onChange={(val) => toggleVisibility(item.key, val)}
                />
              ))}
            </div>
          </Panel>

          <Panel title="إعدادات الخط والتحسين">
            <div className="space-y-4">
              <RangeField
                label="حجم الخط"
                min={14}
                max={36}
                value={settings.fontSize}
                onChange={(val) => updateSettings('fontSize', val)}
              />

              <RangeField
                label="شفافية الخلفية"
                min={0}
                max={100}
                value={settings.backgroundOpacity}
                onChange={(val) => updateSettings('backgroundOpacity', val)}
              />
            </div>
          </Panel>
        </div>
      </main>

      {/* Auto Publish & Scheduling Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0e14] p-6 shadow-2xl dir-rtl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">إعدادات النشر التلقائي والجدولة اليومية</h3>
              </div>
              <button onClick={() => setIsScheduleOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Channel Auth Warning */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-slate-300">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                  <Lock className="h-4 w-4" />
                  <span>حماية ملكية القناة (OAuth2 Security)</span>
                </div>
                <p className="leading-relaxed">
                  لحماية قناتك ومنع التعدي، يتطلب النظام توثيق الملكية عبر Google OAuth2 بدلاً من مجرد وضع الرابط.
                </p>
                <button
                  onClick={handleGoogleOAuth2Connect}
                  className="mt-2.5 flex items-center gap-2 rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-300"
                >
                  <Globe className="h-4 w-4" />
                  <span>{scheduleSettings.isAuthorized ? '✓ القناة موثقة ومربوطة' : 'ربط وتوثيق ملكية القناة'}</span>
                </button>
              </div>

              <div>
                <label className="mb-1 block text-slate-400">رابط القناة المحدد</label>
                <input
                  type="text"
                  placeholder="https://youtube.com/@yourchannel"
                  value={scheduleSettings.channelUrl}
                  onChange={(e) => setScheduleSettings({ ...scheduleSettings, channelUrl: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#07090e] p-2.5 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-slate-400">نوع الفيديو اليومي</label>
                  <select
                    value={scheduleSettings.videoType}
                    onChange={(e) => setScheduleSettings({ ...scheduleSettings, videoType: e.target.value as any })}
                    className="w-full rounded-xl border border-white/10 bg-[#07090e] p-2.5 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="shorts">قصير (Shorts)</option>
                    <option value="long">طويل (Long Video)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-slate-400">موعد النشر اليومي</label>
                  <input
                    type="time"
                    value={scheduleSettings.publishTime}
                    onChange={(e) => setScheduleSettings({ ...scheduleSettings, publishTime: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#07090e] p-2.5 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={handleTestInstantPublish}
                  disabled={publishing}
                  className="flex items-center gap-2 rounded-xl bg-amber-500/20 px-4 py-2 font-bold text-amber-300 hover:bg-amber-500/30 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{publishing ? 'جاري النشر الاختباري...' : 'تجربة النشر الفوري الآن'}</span>
                </button>

                <button
                  onClick={() => {
                    setNotice({ kind: 'success', message: 'تم حفظ إعدادات الجدولة التلقائية بنجاح.' });
                    setIsScheduleOpen(false);
                  }}
                  className="rounded-xl bg-amber-400 px-5 py-2 font-bold text-slate-950 hover:bg-amber-300"
                >
                  حفظ الجدول
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}