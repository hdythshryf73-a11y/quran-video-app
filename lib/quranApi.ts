// lib/quranApi.ts

export interface Reciter {
  id: number;
  name: string;
}

export interface VerseTimestamp {
  verse_key: string;
  timestamp_from: number; // بالمللي ثانية
  timestamp_to: number;   // بالمللي ثانية
  duration: number;
}

// 1. جلب قائمة أشهر القراء
export async function getReciters() {
  const res = await fetch('https://api.quran.com/api/v4/resources/recitations?language=ar');
  const data = await res.json();
  return data.recitations.map((r: any) => ({
    id: r.id,
    name: r.translated_name.name || r.reciter_name,
  }));
}

// 2. جلب نص الآيات لسورة معينة بالرسم العثماني
export async function getChapterVerses(chapterId: number) {
  const res = await fetch(
    `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${chapterId}`
  );
  const data = await res.json();
  return data.verses;
}

// 3. جلب رابط الصوت وتوقيتات الآيات (Timestamps)
export async function getAudioAndTimestamps(reciterId: number, chapterId: number) {
  const res = await fetch(
    `https://api.quran.com/api/v4/chapter_recitations/${reciterId}/${chapterId}`
  );
  const data = await res.json();
  const audioData = data.audio_file;

  return {
    audioUrl: audioData.audio_url,
    timestamps: audioData.timestamps as VerseTimestamp[],
  };
}