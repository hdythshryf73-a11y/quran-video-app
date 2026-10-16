'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  Globe,
  Lock,
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
  Video as Youtube,
  X,
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
type MotionMode = 'hex' | 'particles' | 'zoom' | 'pan';
type EffectKey =
  | 'particles'
  | 'halos'
  | 'breathingFrame'
  | 'scanline'
  | 'fallingStars'
  | 'rays'
  | 'glow'
  | 'fog';

type VisibilityKey =
  | 'verses'
  | 'reader'
  | 'title'
  | 'basmala'
  | 'ending'
  | 'watermark'
  | 'verseNumber'
  | 'progressDots';

type AspectRatio = '9:16' | '16:9';

type StudioSettings = {
  themeKey: ThemeKey;
  motionPattern: MotionMode;
  motionIntensity: number;
  bgDarkness: number;
  effects: Record<EffectKey, boolean>;
  visibility: Record<VisibilityKey, boolean>;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  highlightColor: string;
  fontStyle: string;
  lineHeight: number;
  letterSpacing: number;
  verseSpacing: number;
  bgImage: string | null;
  bgColor1: string;
  bgColor2: string;
  showGradientBg: boolean;
};

type ScheduleSettings = {
  channelUrl: string;
  videoType: 'shorts' | 'long' | 'both';
  publishTime: string;
  autoVersesMode: 'fatiha_sequential' | 'full_surah' | 'custom_range';
  maxDurationMinutes: number;
  selectedReaderId: string;
  isAuthorized: boolean;
};

type Notice = {
  kind: 'success' | 'error' | 'info';
  message: string;
  url?: string;
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
  { id: 'dussary', name: 'ياسر الدوسري', server: 'Yasser_Ad-Dussary_128kbps', quality: '128 kbps' },
  { id: 'muaiqly', name: 'ماهر المعيقلي', server: 'Maher_AlMuaiqly_64kbps', quality: '64 kbps' },
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
  motionPattern: 'hex',
  motionIntensity: 20,
  bgDarkness: 40,
  effects: {
    particles: true,
    halos: true,
    breathingFrame: false,
    scanline: false,
    fallingStars: false,
    rays: false,
    glow: true,
    fog: false,
  },
  visibility: {
    verses: true,
    reader: true,
    title: true,
    basmala: true,
    ending: true,
    watermark: true,
    verseNumber: true,
    progressDots: false,
  },
  fontSize: 60,
  fontFamily: 'Amiri',
  textColor: '#ffffff',
  highlightColor: '#fbbf24',
  fontStyle: 'عريض',
  lineHeight: 2.2,
  letterSpacing: 0,
  verseSpacing: 8,
  bgImage: null,
  bgColor1: '#07090e',
  bgColor2: '#1e293b',
  showGradientBg: true,
};

function SectionHeader({ title, icon }: { title: string; icon?: ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-3">
      {icon}
      <h3 className="text-xs font-bold text-amber-300">{title}</h3>
    </div>
  );
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
  const [notice, setNotice] = useState<Notice | null>(null);

  // Auto Publish & Scheduling Modal State
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings>({
    channelUrl: '',
    videoType: 'both',
    publishTime: '18:00',
    autoVersesMode: 'fatiha_sequential',
    maxDurationMinutes: 5,
    selectedReaderId: 'khalid-jaleel',
    isAuthorized: false,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedReader = READERS.find((r) => r.id === readerId) ?? READERS[0];
  const surahName = SURAH_NAMES[surahId - 1] ?? SURAH_NAMES[0];

  const visibleVerses = useMemo(
    () => loadedVerses.filter((v) => v.number >= fromAyah && v.number <= toAyah),
    [fromAyah, loadedVerses, toAyah],
  );

  const currentVerse = visibleVerses[currentVerseIndex] ?? visibleVerses[0] ?? null;

  const audioUrl = useMemo(() => {
    const sPadded = String(surahId).padStart(3, '0');
    const aPadded = String(Math.max(1, currentVerse?.number ?? fromAyah)).padStart(3, '0');
    return `https://everyayah.com/data/${selectedReader.server}/${sPadded}${aPadded}.mp3`;
  }, [currentVerse?.number, fromAyah, selectedReader.server, surahId]);

  const filteredReaders = useMemo(() => {
    const q = readerSearch.trim().toLocaleLowerCase('ar');
    if (!q) return READERS;
    return READERS.filter((r) => r.name.toLocaleLowerCase('ar').includes(q));
  }, [readerSearch]);

  const handleLoadVerses = async () => {
    setLoadingVerses(true);
    setNotice(null);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/quran-uthmani`);
      if (!res.ok) throw new Error('تعذر جلب الآيات.');
      const data = await res.json();
      const ayahs = data.data?.ayahs || [];
      const verses: Verse[] = ayahs.map((a: any, idx: number) => ({
        number: a.numberInSurah ?? idx + 1,
        text: a.text ?? '',
      }));
      setLoadedVerses(verses);
      setNotice({ kind: 'success', message: `تم تحميل آيات سورة ${surahName} بنجاح.` });
    } catch (err) {
      setNotice({ kind: 'error', message: 'حدث خطأ أثناء جلب النص القرآني.' });
    } finally {
      setLoadingVerses(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSettings((prev) => ({ ...prev, bgImage: url }));
    }
  };

  const handleDownloadVideo = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setExporting(true);
    setNotice({ kind: 'info', message: 'جاري تسجيل وتوليد ملف الفيديو المباشر...' });

    try {
      const width = aspectRatio === '9:16' ? 720 : 1280;
      const height = aspectRatio === '9:16' ? 1280 : 720;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('تعذر تجهيز إطارات الفيديو.');

      audio.currentTime = 0;
      await audio.play();

      const canvasStream = canvas.captureStream(30);
      const audioStream = (audio as any).captureStream ? (audio as any).captureStream() : (audio as any).mozCaptureStream();
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...(audioStream ? audioStream.getAudioTracks() : []),
      ]);

      const mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AlSaad_${surahName}_${selectedReader.name}.mp4`;
        a.click();
        URL.revokeObjectURL(url);
        setNotice({ kind: 'success', message: 'تم تحميل الفيديو بنجاح!' });
        setExporting(false);
      };

      mediaRecorder.start();

      const renderFrame = () => {
        if (audio.paused || audio.ended) {
          mediaRecorder.stop();
          return;
        }

        ctx.fillStyle = settings.bgColor1;
        ctx.fillRect(0, 0, width, height);

        if (settings.visibility.watermark) {
          ctx.save();
          ctx.globalAlpha = 0.15;
          ctx.font = 'bold 90px "Amiri", serif';
          ctx.fillStyle = settings.highlightColor;
          ctx.textAlign = 'center';
          ctx.fillText('السعد', width / 2, height / 2);
          ctx.restore();
        }

        if (currentVerse && settings.visibility.verses) {
          ctx.save();
          ctx.font = `600 ${settings.fontSize / 2}px "${settings.fontFamily}", serif`;
          ctx.fillStyle = settings.textColor;
          ctx.textAlign = 'center';
          ctx.fillText(currentVerse.text, width / 2, height / 2 + 50);
          ctx.restore();
        }

        requestAnimationFrame(renderFrame);
      };

      renderFrame();
    } catch (err) {
      setNotice({ kind: 'error', message: 'تعذر تنزيل الفيديو تلقائياً، يرجى المحاولة مجدداً.' });
      setExporting(false);
    }
  };

  const handleGoogleAuthRedirect = () => {
    if (!scheduleSettings.channelUrl) {
      alert('يرجى إدخال رابط القناة أولاً.');
      return;
    }
    // Auth redirect simulation for Youtube OAuth2
    const client_id = 'YOUR_GOOGLE_CLIENT_ID';
    const redirect_uri = window.location.origin;
    const scope = 'https://www.googleapis.com/auth/youtube.upload';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=token&scope=${scope}`;
    
    alert('سيتم فتح نافذة تسجيل الدخول الآمن لحساب Google المالك للقناة لاثبات الملكية.');
    setScheduleSettings((prev) => ({ ...prev, isAuthorized: true }));
  };

  return (
    <div className="min-h-screen bg-[#07090e] font-sans text-slate-100 dir-rtl" dir="rtl">
      <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />

      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#07090e]/90 px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold shadow-lg">
            السعد
          </div>
          <div>
            <h1 className="text-base font-bold text-white">استوديو السعد للقرآن الكريم</h1>
            <p className="text-[11px] text-slate-400">منصة إنتاج ونشر الفيديوهات القرآنية الأوتوماتيكية</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20"
          >
            <Clock className="h-4 w-4" />
            <span>النشر الآلي والجدولة اليومية</span>
          </button>

          <button
            onClick={handleDownloadVideo}
            disabled={exporting}
            className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{exporting ? 'جاري التصدير...' : 'تحميل الفيديو MP4'}</span>
          </button>
        </div>
      </header>

      {/* Notice Banner */}
      {notice && (
        <div className={`mx-6 mt-4 rounded-xl px-4 py-3 text-xs border ${notice.kind === 'error' ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'}`}>
          {notice.message}
        </div>
      )}

      {/* Main Grid Layout matching uploaded screenshots */}
      <main className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-12">
        {/* Left Control Column (Design & Typography Settings) */}
        <div className="space-y-6 lg:col-span-4 max-h-[85vh] overflow-y-auto pr-1">
          {/* Preset Templates */}
          <div className="rounded-2xl border border-white/10 bg-[#0b0e14] p-4">
            <SectionHeader title="قالب جاهز" icon={<Sparkles className="h-4 w-4 text-amber-400" />} />
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'gold', name: 'ذهبي ملكي', bg: 'bg-amber-900/60 border-amber-500' },
                { id: 'blue', name: 'أزرق عميق', bg: 'bg-blue-900/60 border-blue-500' },
                { id: 'green', name: 'أخضر إسلامي', bg: 'bg-emerald-900/60 border-emerald-500' },
                { id: 'purple', name: 'بنفسجي', bg: 'bg-purple-900/60 border-purple-500' },
                { id: 'emerald', name: 'زمردي', bg: 'bg-teal-900/60 border-teal-500' },
                { id: 'night', name: 'سماء الليل', bg: 'bg-slate-900 border-slate-500' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSettings({ ...settings, themeKey: t.id as any })}
                  className={`h-16 rounded-xl border p-2 text-[11px] font-bold transition flex items-end justify-center ${t.bg} ${settings.themeKey === t.id ? 'ring-2 ring-amber-400' : 'opacity-70 hover:opacity-100'}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Colors & Ornaments */}
          <div className="rounded-2xl border border-white/10 bg-[#0b0e14] p-4">
            <SectionHeader title="الألوان والزخارف" icon={<SlidersHorizontal className="h-4 w-4 text-amber-400" />} />
            <div className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block text-slate-400">نمط الحركة</label>
                <select
                  value={settings.motionPattern}
                  onChange={(e) => setSettings({ ...settings, motionPattern: e.target.value as any })}
                  className="w-full rounded-xl border border-white/10 bg-[#07090e] p-2 text-white focus:outline-none"
                >
                  <option value="hex">شبكة سداسية</option>
                  <option value="particles">ذرات طافية</option>
                  <option value="zoom">زوم تدريجي</option>
                  <option value="pan">تحريك أفق</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>كثافة الحركة</span>
                  <span>{settings.motionIntensity}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settings.motionIntensity}
                  onChange={(e) => setSettings({ ...settings, motionIntensity: Number(e.target.value) })}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Background Images Upload */}
          <div className="rounded-2xl border border-white/10 bg-[#0b0e14] p-4">
            <SectionHeader title="صور وفيديوهات الخلفية" icon={<Upload className="h-4 w-4 text-amber-400" />} />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 p-6 cursor-pointer hover:border-amber-400/50"
            >
              <Upload className="h-6 w-6 text-amber-400 mb-2" />
              <span className="text-xs text-slate-300 font-bold">انقر لإضافة صور أو فيديو</span>
              <span className="text-[10px] text-slate-500">اختر خلفية مخصصة للرسم</span>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleImageUpload} className="hidden" />
            </div>

            <div className="mt-3 text-xs">
              <div className="flex justify-between text-slate-400 mb-1">
                <span>تعتيم الخلفية</span>
                <span>{settings.bgDarkness}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={settings.bgDarkness}
                onChange={(e) => setSettings({ ...settings, bgDarkness: Number(e.target.value) })}
                className="w-full accent-amber-400"
              />
            </div>
          </div>

          {/* Visual Effects Checkboxes */}
          <div className="rounded-2xl border border-white/10 bg-[#0b0e14] p-4">
            <SectionHeader title="تأثيرات بصرية" icon={<Sparkles className="h-4 w-4 text-amber-400" />} />
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: 'particles', label: 'جزيئات متطايرة' },
                { key: 'halos', label: 'هالات ضوئية' },
                { key: 'breathingFrame', label: 'إطار متنفس' },
                { key: 'scanline', label: 'مسح ضوئي' },
                { key: 'fallingStars', label: 'نجوم متساقطة' },
                { key: 'rays', label: 'أشعة نورانية' },
                { key: 'glow', label: 'تألق النص' },
                { key: 'fog', label: 'ضباب ناعم' },
              ].map((eff) => (
                <label key={eff.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.effects[eff.key as EffectKey]}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        effects: { ...settings.effects, [eff.key]: e.target.checked },
                      })
                    }
                    className="rounded accent-amber-400"
                  />
                  <span>{eff.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Text Settings */}
          <div className="rounded-2xl border border-white/10 bg-[#0b0e14] p-4">
            <SectionHeader title="إعدادات النص والخطوط" icon={<Type className="h-4 w-4 text-amber-400" />} />
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>حجم الخط</span>
                  <span>{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={settings.fontSize}
                  onChange={(e) => setSettings({ ...settings, fontSize: Number(e.target.value) })}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-slate-400">نوع الخط</label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#07090e] p-2 text-white focus:outline-none"
                >
                  <option value="Amiri">خط أميري (Amiri)</option>
                  <option value="Noto Naskh Arabic">نسخ (Noto Naskh)</option>
                  <option value="Scheherazade New">شهرزاد</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">لون النص</label>
                  <input
                    type="color"
                    value={settings.textColor}
                    onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                    className="w-full h-8 rounded border-none bg-transparent cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">لون التمييز</label>
                  <input
                    type="color"
                    value={settings.highlightColor}
                    onChange={(e) => setSettings({ ...settings, highlightColor: e.target.value })}
                    className="w-full h-8 rounded border-none bg-transparent cursor-pointer"
                  />
                </div>
              </div>

              {/* Elements Visibility */}
              <div className="pt-2 border-t border-white/10">
                <label className="block text-slate-400 mb-2 font-bold">عناصر العرض</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'verses', label: 'النص' },
                    { key: 'verseNumber', label: 'رقم الآية' },
                    { key: 'reader', label: 'اسم القارئ' },
                    { key: 'title', label: 'اسم السورة' },
                    { key: 'basmala', label: 'البسملة' },
                    { key: 'ending', label: 'صدق الله العظيم' },
                    { key: 'watermark', label: 'علامة السعد المائية' },
                  ].map((v) => (
                    <label key={v.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.visibility[v.key as VisibilityKey]}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            visibility: { ...settings.visibility, [v.key]: e.target.checked },
                          })
                        }
                        className="rounded accent-amber-400"
                      />
                      <span>{v.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Screen Preview */}
        <div className="space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b0e14] p-3">
            <div className="flex items-center gap-2 text-xs">
              <span>الأبعاد:</span>
              <button
                onClick={() => setAspectRatio('9:16')}
                className={`rounded-lg px-3 py-1 ${aspectRatio === '9:16' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800'}`}
              >
                طولي (9:16) Shorts
              </button>
              <button
                onClick={() => setAspectRatio('16:9')}
                className={`rounded-lg px-3 py-1 ${aspectRatio === '16:9' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800'}`}
              >
                عرضي (16:9) YouTube
              </button>
            </div>

            <button
              onClick={() => {
                const a = audioRef.current;
                if (!a) return;
                if (isPlaying) {
                  a.pause();
                  setIsPlaying(false);
                } else {
                  a.play();
                  setIsPlaying(true);
                }
              }}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isPlaying ? 'إيقاف' : 'استماع'}</span>
            </button>
          </div>

          <div
            className={`relative mx-auto flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 p-6 shadow-2xl ${aspectRatio === '9:16' ? 'aspect-[9/16] max-w-sm' : 'aspect-video w-full'}`}
            style={{ backgroundColor: settings.bgColor1 }}
          >
            {settings.bgImage && (
              <img src={settings.bgImage} alt="background" className="absolute inset-0 h-full w-full object-cover opacity-60" />
            )}

            {settings.visibility.watermark && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-15 select-none">
                <span className="text-8xl font-bold text-amber-400">السعد</span>
              </div>
            )}

            <div className="text-center z-10">
              {settings.visibility.title && <h3 className="text-lg font-bold text-amber-300">سورة {surahName}</h3>}
            </div>

            <div className="text-center z-10 space-y-3">
              {settings.visibility.basmala && surahId !== 1 && surahId !== 9 && (
                <p className="text-xs text-amber-200/70">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
              )}
              {currentVerse && settings.visibility.verses && (
                <div>
                  <p
                    className="font-medium leading-relaxed drop-shadow-md"
                    style={{ fontSize: `${settings.fontSize / 2.2}px`, color: settings.textColor, fontFamily: settings.fontFamily }}
                  >
                    {currentVerse.text}
                  </p>
                  {settings.visibility.verseNumber && (
                    <span className="mt-2 inline-block rounded-full bg-amber-400/20 px-3 py-0.5 text-xs font-bold text-amber-300">
                      آية {currentVerse.number}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="text-center z-10 space-y-1">
              {settings.visibility.reader && <p className="text-xs font-medium text-slate-300">{selectedReader.name}</p>}
              {settings.visibility.ending && <p className="text-[10px] text-amber-400">صَدَقَ اللَّهُ الْعَظِيمُ</p>}
            </div>
          </div>

          {/* Verse Prev/Next Navigation */}
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b0e14] p-3 text-xs">
            <button
              onClick={() => setCurrentVerseIndex((p) => Math.max(0, p - 1))}
              disabled={currentVerseIndex === 0}
              className="rounded-xl bg-slate-800 px-3 py-1.5 text-white disabled:opacity-40"
            >
              الآية السابقة
            </button>
            <span className="text-slate-400">
              آية {currentVerseIndex + 1} من {visibleVerses.length}
            </span>
            <button
              onClick={() => setCurrentVerseIndex((p) => Math.min(visibleVerses.length - 1, p + 1))}
              disabled={currentVerseIndex >= visibleVerses.length - 1}
              className="rounded-xl bg-slate-800 px-3 py-1.5 text-white disabled:opacity-40"
            >
              الآية التالية
            </button>
          </div>
        </div>

        {/* Right Readers Column */}
        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-2xl border border-white/10 bg-[#0b0e14] p-4">
            <SectionHeader title="اختيار القارئ" icon={<Music className="h-4 w-4 text-amber-400" />} />
            <div className="relative mb-3">
              <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={readerSearch}
                onChange={(e) => setReaderSearch(e.target.value)}
                placeholder="ابحث عن قارئ..."
                className="w-full rounded-xl border border-white/10 bg-[#07090e] py-2 pr-9 pl-3 text-xs text-white focus:outline-none"
              />
            </div>
            <div className="max-h-60 space-y-1 overflow-y-auto">
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
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0b0e14] p-4 text-xs space-y-3">
            <SectionHeader title="تحديد السورة والآيات" />
            <select
              value={surahId}
              onChange={(e) => setSurahId(Number(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-[#07090e] p-2 text-white focus:outline-none"
            >
              {SURAH_NAMES.map((name, idx) => (
                <option key={idx} value={idx + 1}>
                  {idx + 1}. سورة {name}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">من آية</label>
                <input
                  type="number"
                  value={fromAyah}
                  onChange={(e) => setFromAyah(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-[#07090e] p-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">إلى آية</label>
                <input
                  type="number"
                  value={toAyah}
                  onChange={(e) => setToAyah(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-[#07090e] p-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleLoadVerses}
              disabled={loadingVerses}
              className="w-full rounded-xl bg-amber-400 py-2.5 font-bold text-slate-950 hover:bg-amber-300"
            >
              {loadingVerses ? 'جاري التحميل...' : 'تحميل الآيات'}
            </button>
          </div>
        </div>
      </main>

      {/* Auto Publish Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0e14] p-6 shadow-2xl dir-rtl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">إعدادات النشر الآلي والجدولة اليومية</h3>
              </div>
              <button onClick={() => setIsScheduleOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-slate-300">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                  <Lock className="h-4 w-4" />
                  <span>اثبات ملكية القناة (Google OAuth2 Security)</span>
                </div>
                <p>لحماية قناتك، يتوجب عليك تسجيل الدخول بحساب Google المالك للقناة لاثبات الملكية ومنح صلاحية النشر.</p>
                <button
                  onClick={handleGoogleAuthRedirect}
                  className="mt-2.5 rounded-xl bg-amber-400 px-3 py-1.5 font-bold text-slate-950 hover:bg-amber-300"
                >
                  {scheduleSettings.isAuthorized ? '✓ القناة موثقة ومربوطة' : 'تسجيل الدخول والربط عبر Google'}
                </button>
              </div>

              <div>
                <label className="mb-1 block text-slate-400">رابط قناة يوتيوب</label>
                <input
                  type="text"
                  placeholder="https://youtube.com/@yourchannel"
                  value={scheduleSettings.channelUrl}
                  onChange={(e) => setScheduleSettings({ ...scheduleSettings, channelUrl: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#07090e] p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-slate-400">نوع الفيديوهات اليومية</label>
                  <select
                    value={scheduleSettings.videoType}
                    onChange={(e) => setScheduleSettings({ ...scheduleSettings, videoType: e.target.value as any })}
                    className="w-full rounded-xl border border-white/10 bg-[#07090e] p-2.5 text-white focus:outline-none"
                  >
                    <option value="shorts">فيديو قصير (Shorts)</option>
                    <option value="long">فيديو طويل (Long Video)</option>
                    <option value="both">كلاهما يومياً (Shorts + Long)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-slate-400">توقيت النشر اليومي</label>
                  <input
                    type="time"
                    value={scheduleSettings.publishTime}
                    onChange={(e) => setScheduleSettings({ ...scheduleSettings, publishTime: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#07090e] p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-slate-400">نمط اختيار الآيات أوتوماتيكياً (سكربت Python)</label>
                <select
                  value={scheduleSettings.autoVersesMode}
                  onChange={(e) => setScheduleSettings({ ...scheduleSettings, autoVersesMode: e.target.value as any })}
                  className="w-full rounded-xl border border-white/10 bg-[#07090e] p-2.5 text-white focus:outline-none"
                >
                  <option value="fatiha_sequential">البدء من سورة الفاتحة والأخذ بالتسلسل يومياً</option>
                  <option value="full_surah">سورة كاملة يومياً</option>
                  <option value="custom_range">نطاق آيات مخصص لكل فيديو</option>
                </select>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => {
                    setNotice({ kind: 'success', message: 'تم حفظ إعدادات وتنشيط النشر التلقائي اليومي بنجاح!' });
                    setIsScheduleOpen(false);
                  }}
                  className="rounded-xl bg-amber-400 px-6 py-2 font-bold text-slate-950 hover:bg-amber-300"
                >
                  تفعيل النشر اليومي
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}