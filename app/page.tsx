'use client';

import React, { useState, useRef, useEffect } from 'react';

const SURAHS = [
  { id: '1', name: 'الفاتحة', verses: 7 },
  { id: '2', name: 'البقرة', verses: 286 },
  { id: '3', name: 'آل عمران', verses: 200 },
  { id: '4', name: 'النساء', verses: 176 },
  { id: '5', name: 'المائدة', verses: 120 },
  { id: '6', name: 'الأنعام', verses: 165 },
  { id: '7', name: 'الأعراف', verses: 206 },
  { id: '8', name: 'الأنفال', verses: 75 },
  { id: '9', name: 'التوبة', verses: 129 },
  { id: '10', name: 'يونس', verses: 109 },
  { id: '11', name: 'هود', verses: 123 },
  { id: '12', name: 'يوسف', verses: 111 },
  { id: '13', name: 'الرعد', verses: 43 },
  { id: '14', name: 'إبراهيم', verses: 52 },
  { id: '15', name: 'الحجر', verses: 99 },
  { id: '16', name: 'النحل', verses: 128 },
  { id: '17', name: 'الإسراء', verses: 111 },
  { id: '18', name: 'الكهف', verses: 110 },
  { id: '19', name: 'مريم', verses: 98 },
  { id: '20', name: 'طه', verses: 135 },
  { id: '21', name: 'الأنبياء', verses: 112 },
  { id: '22', name: 'الحج', verses: 78 },
  { id: '23', name: 'المؤمنون', verses: 118 },
  { id: '24', name: 'النور', verses: 64 },
  { id: '25', name: 'الفرقان', verses: 77 },
  { id: '26', name: 'الشعراء', verses: 227 },
  { id: '27', name: 'النمل', verses: 93 },
  { id: '28', name: 'القصص', verses: 88 },
  { id: '29', name: 'العنكبوت', verses: 69 },
  { id: '30', name: 'الروم', verses: 60 },
  { id: '31', name: 'لقمان', verses: 34 },
  { id: '32', name: 'السجدة', verses: 30 },
  { id: '33', name: 'الأحزاب', verses: 73 },
  { id: '34', name: 'سبأ', verses: 54 },
  { id: '35', name: 'فاطر', verses: 45 },
  { id: '36', name: 'يس', verses: 83 },
  { id: '37', name: 'الصافات', verses: 182 },
  { id: '38', name: 'ص', verses: 88 },
  { id: '39', name: 'الزمر', verses: 75 },
  { id: '40', name: 'غافر', verses: 85 },
  { id: '41', name: 'فصلت', verses: 54 },
  { id: '42', name: 'الشورى', verses: 53 },
  { id: '43', name: 'الزخرف', verses: 89 },
  { id: '44', name: 'الدخان', verses: 59 },
  { id: '45', name: 'الجاثية', verses: 37 },
  { id: '46', name: 'الأحقاف', verses: 35 },
  { id: '47', name: 'محمد', verses: 38 },
  { id: '48', name: 'الفتح', verses: 29 },
  { id: '49', name: 'الحجرات', verses: 18 },
  { id: '50', name: 'ق', verses: 45 },
  { id: '51', name: 'الذاريات', verses: 60 },
  { id: '52', name: 'الطور', verses: 49 },
  { id: '53', name: 'النجم', verses: 62 },
  { id: '54', name: 'القمر', verses: 55 },
  { id: '55', name: 'الرحمن', verses: 78 },
  { id: '56', name: 'الواقعة', verses: 96 },
  { id: '57', name: 'الحديد', verses: 29 },
  { id: '58', name: 'المجادلة', verses: 22 },
  { id: '59', name: 'الحشر', verses: 24 },
  { id: '60', name: 'الممتحنة', verses: 13 },
  { id: '61', name: 'الصف', verses: 14 },
  { id: '62', name: 'الجمعة', verses: 11 },
  { id: '63', name: 'المنافقون', verses: 11 },
  { id: '64', name: 'التغابن', verses: 18 },
  { id: '65', name: 'الطلاق', verses: 12 },
  { id: '66', name: 'التحريم', verses: 12 },
  { id: '67', name: 'الملك', verses: 30 },
  { id: '68', name: 'القلم', verses: 52 },
  { id: '69', name: 'الحاقة', verses: 52 },
  { id: '70', name: 'المعارج', verses: 44 },
  { id: '71', name: 'نوح', verses: 28 },
  { id: '72', name: 'الجن', verses: 28 },
  { id: '73', name: 'المزمل', verses: 20 },
  { id: '74', name: 'المدثر', verses: 56 },
  { id: '75', name: 'القيامة', verses: 40 },
  { id: '76', name: 'الإنسان', verses: 31 },
  { id: '77', name: 'المرسلات', verses: 50 },
  { id: '78', name: 'النبأ', verses: 40 },
  { id: '79', name: 'النازعات', verses: 46 },
  { id: '80', name: 'عبس', verses: 42 },
  { id: '81', name: 'التكوير', verses: 29 },
  { id: '82', name: 'الإنفطار', verses: 19 },
  { id: '83', name: 'المطففين', verses: 36 },
  { id: '84', name: 'الإنشقاق', verses: 25 },
  { id: '85', name: 'البروج', verses: 22 },
  { id: '86', name: 'الطارق', verses: 17 },
  { id: '87', name: 'الأعلى', verses: 19 },
  { id: '88', name: 'الغاشية', verses: 26 },
  { id: '89', name: 'الفجر', verses: 30 },
  { id: '90', name: 'البلد', verses: 20 },
  { id: '91', name: 'الشمس', verses: 15 },
  { id: '92', name: 'الليل', verses: 21 },
  { id: '93', name: 'الضحى', verses: 11 },
  { id: '94', name: 'الشرح', verses: 8 },
  { id: '95', name: 'التين', verses: 8 },
  { id: '96', name: 'العلق', verses: 19 },
  { id: '97', name: 'القدر', verses: 5 },
  { id: '98', name: 'البينة', verses: 8 },
  { id: '99', name: 'الزلزلة', verses: 8 },
  { id: '100', name: 'العاديات', verses: 11 },
  { id: '101', name: 'القارعة', verses: 11 },
  { id: '102', name: 'التكاثر', verses: 8 },
  { id: '103', name: 'العصر', verses: 3 },
  { id: '104', name: 'الهمزة', verses: 9 },
  { id: '105', name: 'الفيل', verses: 5 },
  { id: '106', name: 'قريش', verses: 4 },
  { id: '107', name: 'الماعون', verses: 7 },
  { id: '108', name: 'الكوثر', verses: 3 },
  { id: '109', name: 'الكافرون', verses: 6 },
  { id: '110', name: 'النصر', verses: 3 },
  { id: '111', name: 'المسد', verses: 5 },
  { id: '112', name: 'الإخلاص', verses: 4 },
  { id: '113', name: 'الفلق', verses: 5 },
  { id: '114', name: 'الناس', verses: 6 }
];

const QARIS = [
  { id: 'ar.alafasy', name: 'مشاري بن راشد العفاسي' },
  { id: 'ar.minshawi', name: 'محمد صديق المنشاوي' },
  { id: 'ar.abdulbasit', name: 'عبد الباسط عبد الصمد' },
  { id: 'ar.sudais', name: 'عبد الرحمن السديس' },
  { id: 'ar.maher', name: 'ماهر المعيقلي' },
  { id: 'ar.dosari', name: 'ياسر الدوسري' },
  { id: 'ar.husary', name: 'محمود خليل الحصري' },
  { id: 'ar.shuraim', name: 'سعود الشريم' },
  { id: 'ar.shatri', name: 'أبو بكر الشاطري' }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'manual' | 'autopilot'>('manual');

  const [selectedSurahId, setSelectedSurahId] = useState<string>('1');
  const [fromVerse, setFromVerse] = useState<string>('1');
  const [toVerse, setToVerse] = useState<string>('7');
  const [qari, setQari] = useState<string>('ar.alafasy');
  const [aspectRatio, setAspectRatio] = useState<'portrait' | 'landscape'>('portrait');
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [bgImage, setBgImage] = useState<string>('https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa');
  const [versesText, setVersesText] = useState<string[]>([]);
  
  const [shortsDurationSec, setShortsDurationSec] = useState<number>(60);
  const [longDurationMin, setLongDurationMin] = useState<number>(10);

  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const [channelUrl, setChannelUrl] = useState<string>('');
  const [scheduleType, setScheduleType] = useState<string>('both_daily');
  const [publishTime, setPublishTime] = useState<string>('18:00');
  const [autoQari, setAutoQari] = useState<string>('ar.alafasy');
  const [autoWatermark, setAutoWatermark] = useState<boolean>(true);
  const [autoShortsSec, setAutoShortsSec] = useState<number>(45);
  const [autoLongMin, setAutoLongMin] = useState<number>(15);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentSurahObj = SURAHS.find(s => s.id === selectedSurahId) || SURAHS[0];

  const presets = [
    { name: 'المسجد النبوي', url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa' },
    { name: 'الكعبة المشرفة', url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523' },
    { name: 'زخارف إسلامية', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e' },
    { name: 'سماء ونجوم', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba' },
    { name: 'جبال وطبيعة', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05' },
    { name: 'صحراء وغروب', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9' },
    { name: 'أمواج البحر', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
    { name: 'غابة خضراء', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b' },
    { name: 'شلال طبيعي', url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9' },
    { name: 'سحب وسماء', url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda' },
    { name: 'بحيرة ومرتفعات', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
    { name: 'أشجار وشروق', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e' }
  ];

  useEffect(() => {
    setFromVerse('1');
    setToVerse(currentSurahObj.verses.toString());
  }, [selectedSurahId]);

  useEffect(() => {
    const fetchQuranText = async () => {
      try {
        const res = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${selectedSurahId}`);
        if (res.ok) {
          const data = await res.json();
          const allVerses = data.verses.map((v: any) => v.text_uthmani);
          const start = Math.max(1, parseInt(fromVerse) || 1) - 1;
          const end = Math.min(allVerses.length, parseInt(toVerse) || allVerses.length);
          setVersesText(allVerses.slice(start, end));
        }
      } catch (err) {
        console.error('فشل جلب نص الآيات:', err);
      }
    };
    fetchQuranText();
  }, [selectedSurahId, fromVerse, toVerse]);

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBgImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateVideo = async () => {
    setLoading(true);
    setStatusMessage(`جاري تحضير صوت القارئ والآيات المختارة...`);

    try {
      const res = await fetch(`/api/audio?surah=${selectedSurahId}&fromVerse=${fromVerse}&toVerse=${toVerse}&qari=${qari}`);
      const data = await res.json();

      if (!res.ok || !data.success || !data.audioFiles?.length) {
        throw new Error(data.error || 'تعذر جلب ملفات صوت الآيات.');
      }

      setStatusMessage('جاري معالجة الصوت المزدوج وتركيب الفيديو...');

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      // جلب وفك ضغط جميع أصوات الآيات
      const audioBuffers: AudioBuffer[] = [];
      for (const item of data.audioFiles) {
        const resp = await fetch(item.url);
        const arrayBuf = await resp.arrayBuffer();
        const decodedBuf = await audioCtx.decodeAudioData(arrayBuf);
        audioBuffers.push(decodedBuf);
      }

      // دمج جميع الآيات في AudioBuffer واحد متصل بدون أي تلف في الصوت
      const totalLength = audioBuffers.reduce((sum, b) => sum + b.length, 0);
      const mergedBuffer = audioCtx.createBuffer(
        audioBuffers[0].numberOfChannels,
        totalLength,
        audioBuffers[0].sampleRate
      );

      let offset = 0;
      for (const buf of audioBuffers) {
        for (let channel = 0; channel < buf.numberOfChannels; channel++) {
          mergedBuffer.getChannelData(channel).set(buf.getChannelData(channel), offset);
        }
        offset += buf.length;
      }

      const bufferSource = audioCtx.createBufferSource();
      bufferSource.buffer = mergedBuffer;

      const dest = audioCtx.createMediaStreamDestination();
      bufferSource.connect(dest);

      // صوت هادئ للغاية في السماعات
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 0.15;
      bufferSource.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const canvas = canvasRef.current || document.createElement('canvas');
      const isPortrait = aspectRatio === 'portrait';
      canvas.width = isPortrait ? 720 : 1280;
      canvas.height = isPortrait ? 1280 : 720;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('تعذر إعداد الكانفاس');

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = bgImage;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('فشل تحميل الصورة'));
      });

      const canvasStream = canvas.captureStream(30);
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks()
      ]);

      const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm;codecs=vp9,opus' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AlSaad-${currentSurahObj.name}-${fromVerse}-${toVerse}.webm`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        alert('✨ تم استخراج وتنزيل الفيديو بنجاح!');
        setLoading(false);
        setStatusMessage('');
      };

      let isPlaying = true;
      bufferSource.onended = () => {
        isPlaying = false;
        if (recorder.state === 'recording') recorder.stop();
      };

      bufferSource.start(0);
      recorder.start();

      const drawFrame = () => {
        if (!isPlaying) return;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (showWatermark) {
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 32px Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('✨ منصة السعد القرآنية ✨', canvas.width / 2, 70);
        }

        ctx.fillStyle = '#fcd34d';
        ctx.font = 'bold 28px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`سورة ${currentSurahObj.name} (الآيات ${fromVerse} - ${toVerse})`, canvas.width / 2, 130);

        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial, sans-serif';
        ctx.textAlign = 'center';
        
        const textToDisplay = versesText.length > 0 
          ? versesText.join(' ﴿﴾ ') 
          : 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

        const words = textToDisplay.split(' ');
        let line = '';
        let y = canvas.height / 2 - 40;
        const lineHeight = 42;
        const maxWidth = canvas.width - 120;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, canvas.width / 2, y);
            line = words[n] + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, canvas.width / 2, y);

        requestAnimationFrame(drawFrame);
      };

      drawFrame();

    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ أثناء معالجة الفيديو: ' + (err?.message || err));
      setLoading(false);
      setStatusMessage('');
    }
  };

  const handleSaveAutoPilot = async () => {
    if (!channelUrl.trim()) {
      alert('⚠️ يرجى إدخال رابط قناة يوتيوب أولاً.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoPilot: true,
          channelUrl,
          scheduleType,
          publishTime,
          autoQari,
          autoWatermark,
          autoShortsSec,
          autoLongMin
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل الاتصال بالسيرفر');
      }

      alert(`🚀 تم حفظ جدول الطيار الآلي بنجاح!\nسيقوم النظام بالنشر المجدول اليومي لقناتك من الفاتحة للناس الساعة ${publishTime}.`);
    } catch (err: any) {
      alert(`❌ حدث خطأ أثناء تفعيل الطيار الآلي: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestRunAutoPilot = async () => {
    if (!channelUrl.trim()) {
      alert('⚠️ يرجى إدخال رابط القناة أولاً لاختبار الطيار الآلي.');
      return;
    }
    setLoading(true);
    setStatusMessage('🧪 جاري تشغيل اختبار فوري لنظام الطيار الآلي...');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testRun: true,
          autoPilot: true,
          channelUrl,
          scheduleType,
          publishTime,
          autoQari,
          autoWatermark,
          autoShortsSec,
          autoLongMin
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل الاتصال بـ API الطيار الآلي');
      }

      alert(`✅ نجح اختبار الطيار الآلي المباشر بنجاح 100%!\n\nتفاصيل المهمة:\n- القناة: ${data.taskDetails.targetChannel}\n- القارئ: ${data.taskDetails.reader}\n- النمط: ${data.taskDetails.mode}\n- السورة القادمة: ${data.taskDetails.nextScheduledVerse}`);
    } catch (err: any) {
      alert(`❌ حدث خطأ في اختبار الطيار الآلي: ${err?.message || err}`);
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <main dir="rtl" className="relative min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans overflow-x-hidden">
      
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-0 opacity-10">
        <svg viewBox="0 0 500 500" className="w-[650px] h-[650px] text-amber-400 fill-current filter drop-shadow-[0_0_60px_rgba(245,158,11,0.3)]">
          <path d="M250,50 C200,120 120,200 120,300 C120,380 180,440 250,440 C320,440 380,380 380,300 C380,200 300,120 250,50 Z M250,120 C280,180 330,240 330,300 C330,345 295,380 250,380 C205,380 170,345 170,300 C170,240 220,180 250,120 Z" />
          <text x="250" y="320" textAnchor="middle" fontSize="65" fontWeight="bold" fontFamily="serif" fill="#f59e0b">السعد</text>
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900/90 p-6 md:p-8 rounded-3xl border border-amber-500/40 shadow-2xl backdrop-blur-md gap-6">
          <div className="flex items-center gap-4 text-center md:text-right">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-1 shadow-xl shadow-amber-950/80 flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center font-black text-amber-400 text-2xl">
                س
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 tracking-tight">
                منصة السعد (AlSaad)
              </h1>
              <p className="text-slate-400 text-sm md:text-base mt-1">
                المنظومة الذكية الشاملة لإنتاج وأتمتة فيديوهات القرآن الكريم
              </p>
            </div>
          </div>

          <div className="flex bg-slate-950/90 border border-amber-500/30 p-1.5 rounded-2xl gap-2">
            <button 
              onClick={() => setActiveTab('manual')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'manual' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <span>🎬</span> الإنتاج اليدوي
            </button>
            <button 
              onClick={() => setActiveTab('autopilot')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'autopilot' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <span>🤖</span> الطيار الآلي (الجدولة)
            </button>
          </div>
        </header>

        {activeTab === 'manual' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            
            <div className="lg:col-span-2 space-y-6 bg-slate-900/80 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-md">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                  📖 إعدادات السورة والآيات والقارئ
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">السورة الكريمة</label>
                  <select 
                    value={selectedSurahId} 
                    onChange={(e) => setSelectedSurahId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-slate-100 focus:outline-none focus:border-amber-500 transition-all"
                  >
                    {SURAHS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id}. سورة {s.name} ({s.verses} آية)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">من آية</label>
                  <input 
                    type="number" 
                    min="1"
                    max={currentSurahObj.verses}
                    value={fromVerse}
                    onChange={(e) => setFromVerse(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-slate-100 text-center font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">إلى آية</label>
                  <input 
                    type="number" 
                    min="1"
                    max={currentSurahObj.verses}
                    value={toVerse}
                    onChange={(e) => setToVerse(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-slate-100 text-center font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-amber-300">مدة الفيديو القصير (Shorts) بالثواني</label>
                  <input 
                    type="number"
                    min="15"
                    max={60}
                    value={shortsDurationSec}
                    onChange={(e) => setShortsDurationSec(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 text-sm text-center font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-amber-300">مدة الفيديو الطويل (Full HD) بالدقائق</label>
                  <input 
                    type="number"
                    min="1"
                    max={60}
                    value={longDurationMin}
                    onChange={(e) => setLongDurationMin(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 text-sm text-center font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">القارئ (Qari)</label>
                  <select 
                    value={qari} 
                    onChange={(e) => setQari(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {QARIS.map((q) => (
                      <option key={q.id} value={q.id}>{q.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">أبعاد الفيديو</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => setAspectRatio('portrait')}
                      className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all ${aspectRatio === 'portrait' ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-950' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                    >
                      📱 9:16 Shorts
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAspectRatio('landscape')}
                      className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all ${aspectRatio === 'landscape' ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-950' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                    >
                      💻 16:9 Full HD
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-300 text-sm block">✨ إظهار العلامة المائية (شعار السعد)</span>
                  <span className="text-xs text-slate-400">تضمين الشعار الذهبي أعلى مقطع الفيديو</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={showWatermark}
                  onChange={(e) => setShowWatermark(e.target.checked)}
                  className="w-6 h-6 accent-amber-500 rounded cursor-pointer"
                />
              </div>

            </div>

            <div className="space-y-6 bg-slate-900/80 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-md flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-lg font-bold text-amber-400">🎨 اختيار ورفع الخلفية</h2>
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5"
                  >
                    <span>📁</span> رفع من الجهاز
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleCustomBgUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                <div className="relative h-48 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl group">
                  <img src={bgImage} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-between p-4 text-center">
                    {showWatermark && <span className="text-xs font-bold text-amber-400">✨ منصة السعد ✨</span>}
                    <div className="space-y-1">
                      <p className="text-amber-300 font-extrabold text-xs">سورة {currentSurahObj.name} (الآيات {fromVerse} - {toVerse})</p>
                      <p className="text-slate-200 text-[11px] line-clamp-2">
                        {versesText.length > 0 ? versesText.join(' ') : 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                  {presets.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setBgImage(item.url)}
                      className={`cursor-pointer rounded-xl overflow-hidden border-2 h-14 transition-all relative ${bgImage === item.url ? 'border-amber-400 scale-105 shadow-md' : 'border-slate-800 opacity-60 hover:opacity-100'}`}
                    >
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {loading && (
                <div className="text-center p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs animate-pulse">
                  {statusMessage}
                </div>
              )}

              <div className="pt-2">
                <button 
                  onClick={handleGenerateVideo}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-lg py-4 px-6 rounded-2xl shadow-xl shadow-amber-950/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2 transform active:scale-95"
                >
                  {loading ? <span>⏳ جاري معالجة وتوليد فيديو الآيات...</span> : <span>🎬 استخراج وتنزيل فيديو MP4/WebM</span>}
                </button>
              </div>

            </div>

          </div>
        )}

        {activeTab === 'autopilot' && (
          <div className="space-y-6 bg-slate-900/80 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-md animate-fadeIn">
            
            <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-amber-400 flex items-center gap-2">
                  🤖 نظام الطيار الآلي والجدولة التلقائية الذكية (YouTube Auto-Pilot)
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  التنفيذ والنشر اليومي التلقائي بالتتابع من سورة الفاتحة إلى سورة الناس لقناتك على يوتيوب.
                </p>
              </div>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2"
              >
                <span>📁</span> تعيين خلفية مخصصة للأتمتة
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-amber-300">رابط قناة يوتيوب (YouTube Channel URL)</label>
                  <input 
                    type="url"
                    placeholder="https://www.youtube.com/@YourChannel"
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-slate-100 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">نمط النشر اليومي الآلي</label>
                  <select 
                    value={scheduleType}
                    onChange={(e) => setScheduleType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-slate-100 text-sm focus:outline-none"
                  >
                    <option value="shorts_daily">📱 فيديو قصير يومياً (Shorts)</option>
                    <option value="long_daily">💻 فيديو طويل يومياً (Full HD)</option>
                    <option value="both_daily">🔥 فيديو قصير + فيديو طويل يومياً (Shorts & Long Video)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">مدة الشورتس (ثواني)</label>
                    <input 
                      type="number"
                      value={autoShortsSec}
                      onChange={(e) => setAutoShortsSec(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 text-sm text-center font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">مدة الطويل (دقائق)</label>
                    <input 
                      type="number"
                      value={autoLongMin}
                      onChange={(e) => setAutoLongMin(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 text-sm text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">ميعاد النشر اليومي (بتوقيتك)</label>
                  <input 
                    type="time" 
                    value={publishTime}
                    onChange={(e) => setPublishTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-slate-100 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">القارئ المعين للنشر التلقائي</label>
                  <select 
                    value={autoQari} 
                    onChange={(e) => setAutoQari(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-slate-100 text-sm focus:outline-none"
                  >
                    {QARIS.map((q) => (
                      <option key={q.id} value={q.id}>{q.name}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-xs">علامة السعد المائية للطيار الآلي</span>
                  <input 
                    type="checkbox" 
                    checked={autoWatermark}
                    onChange={(e) => setAutoWatermark(e.target.checked)}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {loading && (
              <div className="text-center p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs animate-pulse">
                {statusMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <button 
                onClick={handleSaveAutoPilot}
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-base py-4 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
              >
                🚀 حفظ وتفعيل جدول الطيار الآلي
              </button>

              <button 
                onClick={handleTestRunAutoPilot}
                disabled={loading}
                className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold text-base py-4 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
              >
                🧪 تشغيل اختبار فوري للطيار الآلي (Test Run)
              </button>
            </div>

          </div>
        )}

      </div>

      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}