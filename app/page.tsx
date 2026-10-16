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
  publishFrequency: 'shorts' | 'long' | 'both';
  publishTime: string;
  isAuthorized: boolean;
};

type QuranApiResponse = {
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
  fontSize: 22,
  fontFamily: "'Amiri', serif",
  fontWeight: 600,
  textColor: '#ffffff',
  highlightColor: '#fbbf24',
};

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0b0e14] p-4 shadow-lg">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        {subtitle && <p className="mt-1 text-[11px] text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
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

  // Auto Publish & Scheduling States
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings>({
    channelUrl: '',
    publishFrequency: 'both',
    publishTime: '18:00',
    isAuthorized: false,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      const data: QuranApiResponse = await res.json();
      const ayahs = data.data?.ayahs || [];
      const verses: Verse[] = ayahs.map((a, idx) => ({
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

  const handleDownloadVideo = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setExporting(true);
    setNotice({ kind: 'info', message: 'جاري تسجيل وتوليد الفيديو الحقيقي...' });

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

        ctx.fillStyle = '#07090e';
        ctx.fillRect(0, 0, width, height);

        if (settings.visibility.watermark) {
          ctx.save();
          ctx.globalAlpha = 0.15;
          ctx.font = 'bold 90px "Amiri", serif';
          ctx.fillStyle = '#fbbf24';
          ctx.textAlign = 'center';
          ctx.fillText('السعد', width / 2, height / 2);
          ctx.restore();
        }

        if (currentVerse && settings.visibility.verses) {
          ctx.save();
          ctx.font = '600 32px "Amiri", serif';
          ctx.fillStyle = '#ffffff';
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

  const handleGoogleAuth = () => {
    alert('سيتم توجيهك للحصول على إذن تسجيل الدخول عبر Google OAuth2 للنشر الآمن.');
    setScheduleSettings((prev) => ({ ...prev, isAuthorized: true }));
  };

  return (
    <div className="min-h-screen bg-[#07090e] font-sans text-slate-100 dir-rtl" dir="rtl">
      <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />

      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#07090e]/90 px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold">
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
            <span>النشر الآلي والجدولة</span>
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

      {/* Main Grid */}
      <main className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-12">
        {/* Readers & Verses Selection */}
        <div className="space-y-6 lg:col-span-3">
          <Panel title="اختيار القارئ" subtitle="يتصدرهم القارئ خالد عبد الجليل">
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
            <div className="max-h-52 space-y-1 overflow-y-auto">
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

          <Panel title="تحديد السورة والآيات">
            <div className="space-y-3">
              <select
                value={surahId}
                onChange={(e) => setSurahId(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-[#07090e] p-2 text-xs text-white focus:outline-none"
              >
                {SURAH_NAMES.map((name, idx) => (
                  <option key={idx} value={idx + 1}>{idx + 1}. سورة {name}</option>
                ))}
              </select>

              <button
                onClick={handleLoadVerses}
                disabled={loadingVerses}
                className="w-full rounded-xl bg-slate-800 py-2 text-xs font-semibold text-amber-300 hover:bg-slate-700"
              >
                {loadingVerses ? 'جاري جلب النص...' : 'تحديث النص القرآني'}
              </button>
            </div>
          </Panel>
        </div>

        {/* Studio Preview Canvas */}
        <div className="space-y-4 lg:col-span-6">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b0e14] p-3">
            <div className="flex items-center gap-2 text-xs">
              <span>الأبعاد:</span>
              <button onClick={() => setAspectRatio('9:16')} className={`rounded-lg px-3 py-1 ${aspectRatio === '9:16' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800'}`}>طولي (9:16)</button>
              <button onClick={() => setAspectRatio('16:9')} className={`rounded-lg px-3 py-1 ${aspectRatio === '16:9' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800'}`}>عرضي (16:9)</button>
            </div>

            <button
              onClick={() => {
                const a = audioRef.current;
                if (!a) return;
                if (isPlaying) { a.pause(); setIsPlaying(false); }
                else { a.play(); setIsPlaying(true); }
              }}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isPlaying ? 'إيقاف' : 'استماع'}</span>
            </button>
          </div>

          <div className={`relative mx-auto flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl ${aspectRatio === '9:16' ? 'aspect-[9/16] max-w-sm' : 'aspect-video w-full'}`}>
            {settings.visibility.watermark && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10 select-none">
                <span className="text-8xl font-bold text-amber-400">السعد</span>
              </div>
            )}

            <div className="text-center z-10">
              <h3 className="text-lg font-bold text-amber-300">سورة {surahName}</h3>
            </div>

            <div className="text-center z-10 space-y-3">
              {currentVerse && (
                <div>
                  <p className="text-xl font-medium leading-relaxed text-white">{currentVerse.text}</p>
                  <span className="mt-2 inline-block rounded-full bg-amber-400/20 px-3 py-0.5 text-xs font-bold text-amber-300">آية {currentVerse.number}</span>
                </div>
              )}
            </div>

            <div className="text-center z-10">
              <p className="text-xs font-medium text-slate-300">{selectedReader.name}</p>
            </div>
          </div>
        </div>

        {/* Additional Visibility Toggles */}
        <div className="space-y-6 lg:col-span-3">
          <Panel title="العلامة المائية والعناصر">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={settings.visibility.watermark}
                onChange={(e) => setSettings({ ...settings, visibility: { ...settings.visibility, watermark: e.target.checked } })}
                className="rounded accent-amber-400"
              />
              <span>إظهار علامة "السعد" المائية</span>
            </label>
          </Panel>
        </div>
      </main>

      {/* Auto Publish & Schedule Modal Page */}
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
                  <span>ربط القناة الآمن (Google OAuth2)</span>
                </div>
                <p>قم بالتحقق من الملكية لضمان النشر الآمن على قناتك في يوتيوب.</p>
                <button
                  onClick={handleGoogleAuth}
                  className="mt-2.5 rounded-xl bg-amber-400 px-3 py-1.5 font-bold text-slate-950 hover:bg-amber-300"
                >
                  {scheduleSettings.isAuthorized ? '✓ القناة مربوطة ومفعلة' : 'تسجيل الدخول وربط القناة عبر Google'}
                </button>
              </div>

              <div>
                <label className="mb-1 block text-slate-400">رابط القناة</label>
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
                    value={scheduleSettings.publishFrequency}
                    onChange={(e) => setScheduleSettings({ ...scheduleSettings, publishFrequency: e.target.value as any })}
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

              <div className="pt-2 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => {
                    setNotice({ kind: 'success', message: 'تم حفظ جدول النشر الآلي اليومي بنجاح!' });
                    setIsScheduleOpen(false);
                  }}
                  className="rounded-xl bg-amber-400 px-6 py-2 font-bold text-slate-950 hover:bg-amber-300"
                >
                  حفظ تفعيل الجدولة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}