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
  SlidersHorizontal,
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
  { key: 'watermark', label: 'علامة السعد المائية' },
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
    watermark: true,
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
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [exporting, setExporting] = useState(false);
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
  const [autoPublishEnabled, setAutoPublishEnabled] = useState(true);
  const [surahPickerOpen, setSurahPickerOpen] = useState(false);
  const [surahSearch, setSurahSearch] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentVerseIndexRef = useRef(0);
  const autoContinuePlaybackRef = useRef(false);
  const previewAutoplayRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const isExportingRef = useRef(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const selectedReader = READERS.find((reader) => reader.id === readerId) ?? READERS[7];
  const selectedTheme = THEMES.find((theme) => theme.id === settings.themeKey) ?? THEMES[0];
  const surahName = SURAH_NAMES[surahId - 1] ?? SURAH_NAMES[0];

  const visibleVerses = useMemo(
    () => loadedVerses.filter((verse) => verse.number >= fromAyah && verse.number <= toAyah),
    [fromAyah, loadedVerses, toAyah],
  );

  const currentVerse = visibleVerses[currentVerseIndex] ?? visibleVerses[0] ?? null;

  const buildAudioUrl = (ayahNumber: number) => {
    const surahNumberPadded = String(surahId).padStart(3, '0');
    const ayahNumberPadded = String(Math.max(1, ayahNumber)).padStart(3, '0');
    return `https://everyayah.com/data/${selectedReader.server}/${surahNumberPadded}${ayahNumberPadded}.mp3`;
  };

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
    currentVerseIndexRef.current = currentVerseIndex;
  }, [currentVerseIndex]);

  useEffect(() => {
    currentVerseIndexRef.current = 0;
    setCurrentVerseIndex(0);
  }, [surahId, fromAyah, toAyah, loadedVerses]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isExportingRef.current) return;

    const shouldContinue = autoContinuePlaybackRef.current;
    audio.pause();
    if (audio.src !== audioUrl) audio.src = audioUrl;
    setCurrentTime(0);
    setDuration(0);

    const continueAfterLoad = () => {
      autoContinuePlaybackRef.current = false;
      void audio.play().then(() => setIsPlaying(true)).catch(() => {
        setIsPlaying(false);
        setNotice({ kind: 'error', message: 'تعذر متابعة التلاوة للآية التالية.' });
      });
    };

    if (shouldContinue) audio.addEventListener('canplay', continueAfterLoad, { once: true });
    else setIsPlaying(false);

    audio.load();
    return () => audio.removeEventListener('canplay', continueAfterLoad);
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
      previewAutoplayRef.current = false;
      autoContinuePlaybackRef.current = false;
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      previewAutoplayRef.current = true;
      await audio.play();
      setIsPlaying(true);
      setNotice(null);
    } catch {
      previewAutoplayRef.current = false;
      setIsPlaying(false);
      setNotice({
        kind: 'error',
        message: 'تعذر تشغيل التلاوة. تحقق من اتصال الإنترنت أو اختر قارئاً آخر.',
      });
    }
  };

  const renderVideoBlob = async (onProgress?: (completed: number, total: number) => void): Promise<Blob> => {
    if (!visibleVerses.length) {
      throw new Error('حمّل الآيات أولاً قبل تصدير الفيديو.');
    }
    if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
      throw new Error('تسجيل الفيديو غير مدعوم في هذا المتصفح. استخدم أحدث إصدار من Chrome أو Edge.');
    }

    const audio = audioRef.current;
    if (!audio) throw new Error('مشغل الصوت غير جاهز بعد.');

    const width = aspectRatio === '9:16' ? 1080 : 1920;
    const height = aspectRatio === '9:16' ? 1920 : 1080;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('تعذر إنشاء Canvas لتصيير الفيديو.');

    const backgroundImageObject = await new Promise<HTMLImageElement | null>((resolve) => {
      if (!backgroundImage) return resolve(null);
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = backgroundImage;
    });

    const activeTheme = selectedTheme;
    const videoFontScale = width / (aspectRatio === '9:16' ? 280 : 420);
    const drawText = (text: string, x: number, y: number, fontSize: number, color: string, weight = settings.fontWeight) => {
      context.save();
      context.direction = 'rtl';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = `${weight} ${fontSize}px ${settings.fontFamily}`;
      context.fillStyle = color;
      if (settings.effects.glow) {
        context.shadowColor = `${activeTheme.accent}99`;
        context.shadowBlur = fontSize * 0.22;
      }
      context.fillText(text, x, y);
      context.restore();
    };

    const drawWrappedVerse = (verse: Verse, centerY: number, maxWidth: number, fontSize: number, elapsedRatio: number) => {
      const words = verse.text.split(/\s+/).filter(Boolean);
      context.save();
      context.direction = 'rtl';
      context.textAlign = 'right';
      context.textBaseline = 'middle';
      context.font = `${settings.fontWeight} ${fontSize}px ${settings.fontFamily}`;
      const gap = Math.max(8, fontSize * 0.24);
      const lines: string[][] = [];
      let line: string[] = [];
      let lineWidth = 0;
      for (const word of words) {
        const wordWidth = context.measureText(word).width;
        const nextWidth = line.length ? lineWidth + gap + wordWidth : wordWidth;
        if (line.length && nextWidth > maxWidth) {
          lines.push(line);
          line = [word];
          lineWidth = wordWidth;
        } else {
          line.push(word);
          lineWidth = nextWidth;
        }
      }
      if (line.length) lines.push(line);
      const lineHeight = fontSize * 1.65;
      const totalHeight = lines.length * lineHeight;
      const firstY = centerY - totalHeight / 2 + lineHeight / 2;
      const highlightedWord = Math.min(words.length - 1, Math.floor(elapsedRatio * words.length));
      let wordOffset = 0;
      lines.forEach((lineWords, lineIndex) => {
        const widths = lineWords.map((word) => context.measureText(word).width);
        const fullWidth = widths.reduce((sum, value) => sum + value, 0) + gap * Math.max(0, lineWords.length - 1);
        let cursorX = (width + fullWidth) / 2;
        const y = firstY + lineIndex * lineHeight;
        lineWords.forEach((word, index) => {
          const wordWidth = widths[index];
          const isHighlighted = wordOffset === highlightedWord;
          context.fillStyle = isHighlighted ? settings.highlightColor : settings.textColor;
          context.shadowColor = settings.effects.glow ? `${isHighlighted ? settings.highlightColor : activeTheme.accent}88` : 'transparent';
          context.shadowBlur = settings.effects.glow ? fontSize * 0.25 : 0;
          context.fillText(word, cursorX, y);
          cursorX -= wordWidth + gap;
          wordOffset += 1;
        });
      });
      context.restore();
    };

    let animationFrameId = 0;
    let recorder: MediaRecorder | null = null;
    let videoStream: MediaStream | null = null;
    let audioCaptureStream: MediaStream | null = null;
    let outputStream: MediaStream | null = null;
    let recordingPromise: Promise<Blob> | null = null;
    let cancelled = false;
    let audioCaptureFromContext = false;

    const drawFrame = () => {
      const now = performance.now() / 1000;
      const activeIndex = Math.max(0, Math.min(visibleVerses.length - 1, currentVerseIndexRef.current));
      const verse = visibleVerses[activeIndex];
      const audioDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      const elapsedRatio = audioDuration > 0 ? Math.min(1, Math.max(0, audio.currentTime / audioDuration)) : 0;

      context.clearRect(0, 0, width, height);
      if (backgroundImageObject) {
        let imageScale = Math.max(width / backgroundImageObject.width, height / backgroundImageObject.height);
        let drawWidth = backgroundImageObject.width * imageScale;
        let drawHeight = backgroundImageObject.height * imageScale;
        let offsetX = (width - drawWidth) / 2;
        let offsetY = (height - drawHeight) / 2;
        const motionPhase = now * Math.max(0.2, settings.motionSpeed);
        if (settings.motion === 'zoom') {
          imageScale *= 1 + (0.018 * (0.5 + 0.5 * Math.sin(motionPhase)));
          drawWidth = backgroundImageObject.width * imageScale;
          drawHeight = backgroundImageObject.height * imageScale;
          offsetX = (width - drawWidth) / 2;
          offsetY = (height - drawHeight) / 2;
        } else if (settings.motion === 'pan') {
          offsetX += Math.sin(motionPhase * 0.22) * width * 0.018;
          offsetY += Math.cos(motionPhase * 0.19) * height * 0.012;
        } else if (settings.motion === 'orbit') {
          context.save();
          context.translate(width / 2, height / 2);
          context.rotate(Math.sin(motionPhase * 0.08) * 0.012);
          context.drawImage(backgroundImageObject, offsetX - width / 2, offsetY - height / 2, drawWidth, drawHeight);
          context.restore();
          drawWidth = 0;
        }
        if (settings.motion !== 'orbit') context.drawImage(backgroundImageObject, offsetX, offsetY, drawWidth, drawHeight);
      } else {
        const gradient = context.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#17202b');
        gradient.addColorStop(0.5, '#0b0e14');
        gradient.addColorStop(1, '#05070a');
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
        const halo = context.createRadialGradient(width * 0.52, height * 0.28, 10, width * 0.52, height * 0.28, width * 0.72);
        halo.addColorStop(0, `${activeTheme.accent}45`);
        halo.addColorStop(1, 'transparent');
        context.fillStyle = halo;
        context.fillRect(0, 0, width, height);
      }

      context.fillStyle = `rgba(5, 7, 10, ${settings.backgroundOpacity / 100})`;
      context.fillRect(0, 0, width, height);
      if (settings.effects.halos) {
        const pulse = 0.5 + Math.sin(now * Math.max(0.2, settings.motionSpeed)) * 0.12;
        const halo = context.createRadialGradient(width * 0.5, height * 0.32, 10, width * 0.5, height * 0.32, width * pulse);
        halo.addColorStop(0, `${activeTheme.accent}28`);
        halo.addColorStop(1, 'transparent');
        context.fillStyle = halo;
        context.fillRect(0, 0, width, height);
      }
      if (settings.effects.rays) {
        context.save();
        context.globalAlpha = 0.1;
        context.strokeStyle = activeTheme.accent;
        context.lineWidth = Math.max(1, width * 0.0015);
        for (let i = -5; i <= 5; i += 1) {
          context.beginPath();
          context.moveTo(width / 2, height * 0.24);
          context.lineTo(width / 2 + i * width * 0.16, height * 0.9);
          context.stroke();
        }
        context.restore();
      }
      if (settings.effects.particles || settings.effects.fallingStars) {
        context.save();
        context.fillStyle = '#ffffff';
        for (let i = 0; i < (settings.effects.particles ? 34 : 10); i += 1) {
          const x = (Math.sin(i * 91.7 + now * (0.18 + (i % 4) * 0.035)) * 0.5 + 0.5) * width;
          const y = ((i * 0.173 + now * (settings.effects.fallingStars ? 0.04 : 0.01)) % 1) * height;
          context.globalAlpha = 0.15 + (i % 5) * 0.09;
          context.beginPath();
          context.arc(x, y, Math.max(2, width * 0.0018), 0, Math.PI * 2);
          context.fill();
        }
        context.restore();
      }
      if (settings.effects.scanline) {
        context.save();
        context.fillStyle = 'rgba(255,255,255,0.08)';
        const lineHeight = Math.max(2, height * 0.0015);
        for (let y = 0; y < height; y += Math.max(10, height * 0.008)) context.fillRect(0, y, width, lineHeight);
        context.restore();
      }
      if (settings.effects.fog) {
        const fog = context.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, width * 0.8);
        fog.addColorStop(0, 'rgba(255,255,255,0.07)');
        fog.addColorStop(1, 'transparent');
        context.fillStyle = fog;
        context.fillRect(0, 0, width, height);
      }

      const compactLandscape = aspectRatio === '16:9';
      const titleFontSize = compactLandscape ? 48 : 66;
      const baseVerseFontSize = Math.min(settings.fontSize * videoFontScale, compactLandscape ? 62 : 80);
      const topY = compactLandscape ? height * 0.13 : height * 0.12;
      if (settings.visibility.title) {
        context.fillStyle = activeTheme.accent;
        context.fillRect(width * 0.46, topY - titleFontSize * 0.9, width * 0.08, Math.max(2, height * 0.002));
        drawText(`سورة ${surahName}`, width / 2, topY, titleFontSize, '#ffffff', 700);
        drawText('THE HOLY QURAN', width / 2, topY + titleFontSize * 0.9, Math.max(17, titleFontSize * 0.24), 'rgba(255,255,255,0.62)', 500);
      }

      const centerY = compactLandscape ? height * 0.52 : height * 0.51;
      if (settings.visibility.basmala && surahId !== 1 && surahId !== 9) {
        drawText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', width / 2, centerY - (compactLandscape ? 105 : 150), compactLandscape ? 34 : 42, settings.textColor);
      }
      if (settings.visibility.verses && verse) {
        drawWrappedVerse(verse, centerY + (compactLandscape ? 15 : 10), width * (compactLandscape ? 0.82 : 0.84), baseVerseFontSize, elapsedRatio);
        context.save();
        context.direction = 'rtl';
        context.textAlign = 'center';
        context.font = `600 ${compactLandscape ? 22 : 26}px ${settings.fontFamily}`;
        context.fillStyle = activeTheme.accent;
        context.fillText(`۞ ${verse.number}`, width / 2, centerY + (compactLandscape ? 175 : 280));
        context.restore();
      }

      if (settings.visibility.reader) {
        drawText(selectedReader.name, width / 2, height * (compactLandscape ? 0.82 : 0.88), compactLandscape ? 31 : 36, '#ffffff', 600);
      }
      if (settings.visibility.ending) {
        drawText('صَدَقَ اللَّهُ الْعَظِيمُ', width / 2, height * (compactLandscape ? 0.9 : 0.93), compactLandscape ? 28 : 32, activeTheme.accent, 700);
      }
      if (settings.visibility.watermark) {
        context.save();
        context.globalAlpha = 0.18;
        context.translate(width * 0.77, height * 0.76);
        context.rotate(-Math.PI / 12);
        context.direction = 'rtl';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = `700 ${compactLandscape ? 88 : 105}px ${settings.fontFamily}`;
        context.fillStyle = '#fbbf24';
        context.fillText('السعد', 0, 0);
        context.restore();
        context.save();
        context.globalAlpha = 0.82;
        context.direction = 'rtl';
        context.textAlign = 'right';
        context.font = `700 ${compactLandscape ? 28 : 34}px ${settings.fontFamily}`;
        context.fillStyle = '#fbbf24';
        context.fillText('السعد', width * 0.95, height * 0.055);
        context.restore();
      }
      if (settings.effects.breathingFrame) {
        context.save();
        context.strokeStyle = `${activeTheme.accent}88`;
        context.lineWidth = Math.max(3, width * 0.003);
        context.strokeRect(width * 0.018, height * 0.012, width * 0.964, height * 0.976);
        context.restore();
      }
      context.save();
      const progressWidth = width * 0.72;
      context.fillStyle = 'rgba(255,255,255,0.2)';
      context.fillRect((width - progressWidth) / 2, height * 0.965, progressWidth, Math.max(5, height * 0.003));
      context.fillStyle = activeTheme.accent;
      context.fillRect((width - progressWidth) / 2, height * 0.965, progressWidth * elapsedRatio, Math.max(5, height * 0.003));
      context.restore();
    };

    const waitForAudioReady = async () => {
      if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA && audio.error === null) return;
      await new Promise<void>((resolve, reject) => {
        let timer: ReturnType<typeof setTimeout>;
        const cleanup = () => {
          clearTimeout(timer);
          audio.removeEventListener('canplay', onReady);
          audio.removeEventListener('error', onError);
        };
        const onReady = () => { cleanup(); resolve(); };
        const onError = () => { cleanup(); reject(new Error('تعذر تحميل ملف التلاوة للآية الحالية من الخادم الصوتي.')); };
        audio.addEventListener('canplay', onReady, { once: true });
        audio.addEventListener('error', onError, { once: true });
        timer = setTimeout(() => { cleanup(); reject(new Error('انتهت مهلة انتظار تحميل التلاوة. تحقق من اتصال الإنترنت.')); }, 25000);
        if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA && audio.error === null) {
          cleanup(); resolve();
        } else audio.load();
      });
    };

    const playAudioUntilEnd = async () => {
      await new Promise<void>((resolve, reject) => {
        let timer: ReturnType<typeof setTimeout>;
        const cleanup = () => {
          clearTimeout(timer);
          audio.removeEventListener('ended', onEnded);
          audio.removeEventListener('error', onError);
        };
        const onEnded = () => { cleanup(); resolve(); };
        const onError = () => { cleanup(); reject(new Error('انقطع الصوت أثناء تسجيل الفيديو.')); };
        audio.addEventListener('ended', onEnded, { once: true });
        audio.addEventListener('error', onError, { once: true });
        timer = setTimeout(() => { cleanup(); reject(new Error('استغرق ملف صوتي وقتاً أطول من المتوقع.')); }, 180000);
        audio.play().catch((error: unknown) => {
          cleanup();
          reject(error instanceof Error ? error : new Error('تعذر تشغيل الصوت في أثناء التصدير.'));
        });
      });
    };

    try {
      isExportingRef.current = true;
      autoContinuePlaybackRef.current = false;
      previewAutoplayRef.current = false;
      audio.pause();
      currentVerseIndexRef.current = 0;
      setCurrentVerseIndex(0);
      setIsPlaying(false);
      audio.src = buildAudioUrl(visibleVerses[0].number);
      audio.load();
      await waitForAudioReady();

      videoStream = canvas.captureStream(30);
      const mediaAudio = audio as HTMLAudioElement & { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream };
      audioCaptureStream = mediaAudio.captureStream?.() ?? mediaAudio.mozCaptureStream?.() ?? null;
      if (!audioCaptureStream || audioCaptureStream.getAudioTracks().length === 0) {
        const AudioContextConstructor = window.AudioContext;
        if (!AudioContextConstructor) throw new Error('المتصفح لا يدعم التقاط الصوت لتصدير الفيديو.');
        const audioContext = audioContextRef.current ?? new AudioContextConstructor();
        audioContextRef.current = audioContext;
        const destination = audioDestinationRef.current ?? audioContext.createMediaStreamDestination();
        audioDestinationRef.current = destination;
        if (!audioSourceNodeRef.current) {
          const source = audioContext.createMediaElementSource(audio);
          audioSourceNodeRef.current = source;
          source.connect(destination);
          source.connect(audioContext.destination);
        }
        await audioContext.resume();
        audioCaptureFromContext = true;
        audioCaptureStream = destination.stream;
      }
      const audioTracks = audioCaptureStream.getAudioTracks();
      if (audioTracks.length === 0) throw new Error('لم يتمكن المتصفح من التقاط مسار الصوت للتصدير.');
      outputStream = new MediaStream([...videoStream.getVideoTracks(), ...audioTracks]);

      const mimeCandidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
      const supportedMime = mimeCandidates.find((mime) => MediaRecorder.isTypeSupported(mime));
      recorder = supportedMime ? new MediaRecorder(outputStream, { mimeType: supportedMime }) : new MediaRecorder(outputStream);
      const chunks: BlobPart[] = [];
      recordingPromise = new Promise<Blob>((resolve, reject) => {
        if (!recorder) return reject(new Error('تعذر بدء مسجل الفيديو.'));
        recorder.ondataavailable = (event: BlobEvent) => {
          if (event.data && event.data.size > 0) chunks.push(event.data);
        };
        recorder.onerror = () => reject(new Error('حدث خطأ في أثناء تسجيل الفيديو داخل المتصفح.'));
        recorder.onstop = () => resolve(new Blob(chunks, { type: recorder?.mimeType || supportedMime || 'video/webm' }));
      });
      // Attach a rejection handler now; awaiting the same promise below still propagates failures.
      void recordingPromise.catch(() => undefined);

      const animate = () => {
        if (cancelled) return;
        drawFrame();
        animationFrameId = window.requestAnimationFrame(animate);
      };
      animate();
      recorder.start(1000);

      for (let index = 0; index < visibleVerses.length; index += 1) {
        const verse = visibleVerses[index];
        currentVerseIndexRef.current = index;
        setCurrentVerseIndex(index);
        setIsPlaying(false);
        audio.pause();
        const verseUrl = buildAudioUrl(verse.number);
        if (audio.src !== verseUrl) audio.src = verseUrl;
        audio.load();
        await waitForAudioReady();
        onProgress?.(index + 1, visibleVerses.length);
        setIsPlaying(true);
        await playAudioUntilEnd();
        setIsPlaying(false);
      }

      cancelled = true;
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
      if (recorder.state !== 'inactive') recorder.stop();
      const blob = recordingPromise ? await recordingPromise : new Blob([], { type: 'video/webm' });
      if (blob.size === 0) throw new Error('تم إنهاء التسجيل من دون بيانات فيديو. حاول مرة أخرى في Chrome أو Edge.');
      return blob;
    } catch (error) {
      cancelled = true;
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
      if (recorder && recorder.state !== 'inactive') {
        try { recorder.stop(); } catch { /* تجاهل خطأ الإيقاف بعد فشل التسجيل */ }
      }
      throw error;
    } finally {
      isExportingRef.current = false;
      audio.pause();
      setIsPlaying(false);
      videoStream?.getVideoTracks().forEach((track) => track.stop());
      if (audioCaptureStream && !audioCaptureFromContext) {
        audioCaptureStream.getAudioTracks().forEach((track) => {
          if (track.readyState === 'live') track.stop();
        });
      }
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  };

  const handleDownloadVideo = async () => {
    if (exporting || publishing) return;
    setExporting(true);
    setNotice({ kind: 'info', message: 'جارٍ تصيير الفيديو وتسجيل صوت كل آية في شريحة مستقلة… لا تغلق الصفحة.' });
    try {
      const blob = await renderVideoBlob((completed, total) => {
        setNotice({ kind: 'info', message: `جارٍ تسجيل الآيات: ${completed} من ${total}…` });
      });
      downloadBlob(blob, `quran2reels-surah-${surahId}-${aspectRatio.replace(':', 'x')}.webm`);
      setNotice({ kind: 'success', message: 'تم إنشاء فيديو WebM حقيقي بالصورة والنص والصوت وتنزيله بنجاح.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'تعذر تصدير الفيديو.';
      setNotice({ kind: 'error', message });
    } finally {
      setExporting(false);
    }
  };

  const handleInstantPublish = async () => {
    if (publishing || exporting) return;
    if (!autoPublishEnabled) {
      setNotice({ kind: 'info', message: 'فعّل خيار النشر التلقائي من لوحة التحكم أولاً.' });
      return;
    }
    setPublishing(true);
    setNotice({ kind: 'info', message: 'جارٍ تجهيز الفيديو ثم رفعه إلى يوتيوب… قد تستغرق العملية عدة دقائق حسب طول التلاوة.' });
    try {
      const videoBlob = await renderVideoBlob((completed, total) => {
        setNotice({ kind: 'info', message: `جارٍ تجهيز الفيديو للنشر: الآية ${completed} من ${total}…` });
      });
      const formData = new FormData();
      formData.append('video', videoBlob, `quran2reels-surah-${surahId}.webm`);
      formData.append('metadata', JSON.stringify({
        title: `سورة ${surahName} | ${selectedReader.name} | Quran2Reels`,
        description: `تلاوة سورة ${surahName} من الآية ${fromAyah} إلى الآية ${toAyah}.\nالقارئ: ${selectedReader.name}\n\nتم إعداد الفيديو من استوديو التلاوات القرآنية.`,
        privacyStatus: 'unlisted',
        tags: ['القرآن الكريم', 'تلاوة', 'Quran', 'قرآن كريم'],
        surahId,
        range: { from: fromAyah, to: toAyah },
        aspectRatio,
      }));

      setNotice({ kind: 'info', message: 'اكتمل الفيديو، جارٍ رفعه إلى يوتيوب…' });
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });
      const result = await response.json().catch(() => null) as
        | { message?: string; error?: string; url?: string; videoId?: string }
        | null;
      if (!response.ok) {
        throw new Error(result?.error || result?.message || `فشل رفع الفيديو (HTTP ${response.status}).`);
      }
      setNotice({
        kind: 'success',
        message: result?.url ? 'تم رفع الفيديو بنجاح إلى يوتيوب.' : result?.message || 'تم رفع الفيديو بنجاح إلى يوتيوب.',
        url: result?.url,
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
    setCurrentVerseIndex(0);
    currentVerseIndexRef.current = 0;
    previewAutoplayRef.current = false;
    autoContinuePlaybackRef.current = false;
    setAspectRatio('9:16');
    setReaderId('afasy');
    setAutoPublishEnabled(true);
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
        crossOrigin="anonymous"
        playsInline
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
        onEnded={() => {
          if (isExportingRef.current) { setIsPlaying(false); return; }
          if (previewAutoplayRef.current && currentVerseIndex < visibleVerses.length - 1) {
            autoContinuePlaybackRef.current = true;
            const nextIndex = currentVerseIndex + 1;
            currentVerseIndexRef.current = nextIndex;
            setCurrentVerseIndex(nextIndex);
          } else {
            previewAutoplayRef.current = false;
            setIsPlaying(false);
          }
        }}
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
              onClick={handleDownloadVideo}
              disabled={exporting || publishing}
              title="تصدير فيديو WebM حقيقي يتضمن التلاوة الصوتية"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-amber-400/30 hover:bg-white/[0.06] hover:text-white disabled:cursor-wait disabled:opacity-60"
            >
              <Download size={15} />
              <span>{exporting ? 'جارٍ التصدير…' : 'تحميل الفيديو'}</span>
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
              disabled={publishing || exporting || !autoPublishEnabled}
              title={autoPublishEnabled ? 'تجهيز الفيديو ورفعه إلى يوتيوب' : 'فعّل النشر التلقائي من لوحة التحكم أولاً'}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300/20 bg-amber-400 px-3.5 py-2 text-xs font-bold text-[#17120a] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={14} />
              <span>{publishing ? 'جارٍ تجهيز الفيديو ورفعه…' : '⚡ النشر التلقائي على يوتيوب'}</span>
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
            {notice.url ? <a href={notice.url} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-2">فتح الفيديو على يوتيوب</a> : null}
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
              صمّم معاينة عمودية للتلاوة، خصّص الهوية البصرية، ثم صدّر فيديو حقيقياً بالصوت والصورة أو ارفعه مباشرة إلى يوتيوب.
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
              subtitle="اختر أبعاد الفيديو، ثم عاين الآية النشطة قبل التصدير."
            >
              <div className="flex flex-col items-center">
                <div className="mb-3 flex w-full max-w-[420px] items-center justify-between gap-2 text-[10px] text-slate-500">
                  <span className="inline-flex items-center gap-1.5"><Video size={13} /> {aspectRatio === '9:16' ? 'VERTICAL PREVIEW' : 'LANDSCAPE PREVIEW'}</span>
                  <span className="rounded-md border border-white/[0.08] px-2 py-1 font-mono">{aspectRatio} · {aspectRatio === '9:16' ? '1080 × 1920' : '1920 × 1080'}</span>
                </div>
                <div className="mb-3 grid w-full max-w-[420px] grid-cols-2 gap-2">
                  <button type="button" onClick={() => setAspectRatio('9:16')} className={`rounded-xl border px-3 py-2 text-xs transition ${aspectRatio === '9:16' ? 'border-amber-400/35 bg-amber-400/10 text-amber-200' : 'border-white/[0.08] bg-black/20 text-slate-400 hover:text-white'}`}>عمودي 9:16 · Reels / Shorts</button>
                  <button type="button" onClick={() => setAspectRatio('16:9')} className={`rounded-xl border px-3 py-2 text-xs transition ${aspectRatio === '16:9' ? 'border-amber-400/35 bg-amber-400/10 text-amber-200' : 'border-white/[0.08] bg-black/20 text-slate-400 hover:text-white'}`}>أفقي 16:9 · YouTube</button>
                </div>

                <div
                  className={`relative max-w-full shrink-0 overflow-hidden rounded-[28px] border bg-[#05070a] shadow-[0_24px_70px_rgba(0,0,0,0.42)] ${settings.effects.breathingFrame ? 'animate-pulse' : ''}`}
                  style={{ width: aspectRatio === '9:16' ? 'min(100%, 280px)' : 'min(100%, 420px)', aspectRatio: aspectRatio === '9:16' ? '9 / 16' : '16 / 9', borderColor: settings.effects.breathingFrame ? `${selectedTheme.accent}75` : 'rgba(255,255,255,0.12)' }}
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
                    <div className="mb-3 flex items-center justify-center gap-1.5" aria-hidden="true">
                      {Array.from({ length: 5 }, (_, index) => (
                        <span key={index} className="h-[2px] w-6 rounded-full" style={{ backgroundColor: index === 0 ? selectedTheme.accent : 'rgba(255,255,255,0.32)' }} />
                      ))}
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
                        {currentVerse ? (
                          <p key={currentVerse.number} className="mb-1 last:mb-0" aria-live="polite">
                            {currentVerse.text.split(/\s+/).map((word, index) => {
                              const highlighted = index === Math.min(currentVerse.text.split(/\s+/).length - 1, Math.floor((duration > 0 ? currentTime / duration : 0) * currentVerse.text.split(/\s+/).length));
                              return (
                                <span
                                  key={`${currentVerse.number}-${index}`}
                                  className={highlighted ? 'rounded px-[1px]' : ''}
                                  style={highlighted ? { color: settings.highlightColor, textShadow: settings.effects.glow ? `0 0 15px ${settings.highlightColor}65` : 'none' } : undefined}
                                >
                                  {word}{' '}
                                </span>
                              );
                            })}
                            <span className="mx-1 inline-block text-[10px]" style={{ color: selectedTheme.accent }}>۞ {currentVerse.number}</span>
                          </p>
                        ) : (
                          <p className="py-5 text-xs leading-7 text-white/70">حمّل آيات سورة {surahName} لعرض النص القرآني هنا.</p>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {settings.visibility.watermark ? (
                    <div aria-label="علامة السعد المائية" className="pointer-events-none absolute bottom-[22%] left-4 z-[15] -rotate-12 select-none font-bold text-amber-300/25" style={{ fontFamily: settings.fontFamily, fontSize: aspectRatio === '16:9' ? '28px' : '34px', textShadow: '0 0 18px rgba(251,191,36,0.12)' }}>السعد</div>
                  ) : null}

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
                    onClick={() => {
                      const nextIndex = Math.max(0, currentVerseIndex - 1);
                      currentVerseIndexRef.current = nextIndex;
                      autoContinuePlaybackRef.current = false;
                      previewAutoplayRef.current = false;
                      setCurrentVerseIndex(nextIndex);
                      setIsPlaying(false);
                      audioRef.current?.pause();
                    }}
                    aria-label="الانتقال إلى الآية السابقة"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] text-slate-400 transition hover:border-amber-400/30 hover:text-amber-300"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <div className="min-w-0 flex-1 text-center">
                    <p className="truncate text-[11px] font-medium text-slate-200">سورة {surahName}</p>
                    <p className="mt-1 text-[9px] text-slate-600">الآية {currentVerse?.number ?? fromAyah} · {Math.max(1, currentVerseIndex + 1)} من {Math.max(visibleVerses.length, 1)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextIndex = Math.min(Math.max(visibleVerses.length - 1, 0), currentVerseIndex + 1);
                      currentVerseIndexRef.current = nextIndex;
                      autoContinuePlaybackRef.current = false;
                      previewAutoplayRef.current = false;
                      setCurrentVerseIndex(nextIndex);
                      setIsPlaying(false);
                      audioRef.current?.pause();
                    }}
                    aria-label="الانتقال إلى الآية التالية"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] text-slate-400 transition hover:border-amber-400/30 hover:text-amber-300"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>

                <div className="mt-4 grid w-full max-w-[420px] grid-cols-3 gap-2">
                  <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3 text-center">
                    <Video size={15} className="mx-auto mb-2 text-slate-500" />
                    <p className="text-[10px] text-slate-300">{aspectRatio} {aspectRatio === '9:16' ? 'عمودي' : 'أفقي'}</p>
                    <p className="mt-1 text-[9px] text-slate-600">{aspectRatio === '9:16' ? 'مهيأ للريلز' : 'مهيأ ليوتيوب'}</p>
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
                <SlidersHorizontal size={13} className="shrink-0 text-amber-300/70" />
                جميع التعديلات تنعكس على المعاينة في المنتصف مباشرة.
              </div>
            </Panel>

            <Panel title="النشر التلقائي على يوتيوب" subtitle="تحكم في إتاحة زر النشر الموجود أعلى الصفحة.">
              <CheckRow
                checked={autoPublishEnabled}
                label="تفعيل النشر التلقائي على يوتيوب"
                onChange={setAutoPublishEnabled}
              />
              <p className="px-2 pb-1 text-[10px] leading-5 text-slate-500">
                عند الضغط على زر النشر، ينشئ التطبيق ملف فيديو بالصوت والصورة ثم يرسله إلى /api/publish. يجب إعداد OAuth2 على الخادم، وتكون الخصوصية الافتراضية للفيديو غير مدرج.
              </p>
            </Panel>
          </aside>
        </div>

        <footer className="mt-6 flex flex-col gap-2 border-t border-white/[0.06] pt-4 text-[10px] leading-5 text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-1.5"><Sparkles size={12} className="text-amber-400/70" /> Quran2Reels · استوديو تصميم التلاوات</span>
          <span>التصدير ينتج WebM فعلياً بالصوت والصورة · يتطلب النشر إعداد OAuth2 في متغيرات البيئة.</span>
        </footer>
      </div>
    </main>
  );
}
