import { NextResponse } from 'next/server';

const QARI_RECITATIONS: Record<string, number> = {
  'ar.alafasy': 7,       // مشاري العفاسي
  'ar.minshawi': 8,      // محمد صديق المنشاوي
  'ar.abdulbasit': 2,    // عبد الباسط عبد الصمد
  'ar.sudais': 3,        // عبد الرحمن السديس
  'ar.maher': 12,        // ماهر المعيقلي
  'ar.dosari': 161,      // ياسر الدوسري
  'ar.husary': 6,        // محمود خليل الحصري
  'ar.shuraim': 10,      // سعود الشريم
  'ar.shatri': 4,        // أبو بكر الشاطري
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const surah = searchParams.get('surah') || '1';
    const fromVerse = parseInt(searchParams.get('fromVerse') || '1', 10);
    const toVerse = parseInt(searchParams.get('toVerse') || '7', 10);
    const qariKey = searchParams.get('qari') || 'ar.alafasy';

    const recitationId = QARI_RECITATIONS[qariKey] || 7;

    const apiUrl = `https://api.quran.com/api/v4/recitations/${recitationId}/by_chapter/${surah}?per_page=300`;
    const apiRes = await fetch(apiUrl, { cache: 'force-cache' });

    if (!apiRes.ok) {
      return NextResponse.json({ error: 'فشل جلب بيانات القارئ' }, { status: 400 });
    }

    const data = await apiRes.json();
    const audioFiles: { verse_key: string; url: string }[] = data.audio_files || [];

    const selectedVersesAudio = audioFiles
      .filter((file) => {
        const verseNum = parseInt(file.verse_key.split(':')[1], 10);
        return verseNum >= fromVerse && verseNum <= toVerse;
      })
      .map((file) => ({
        verseKey: file.verse_key,
        url: file.url.startsWith('http') ? file.url : `https://verses.quran.com/${file.url}`
      }));

    if (selectedVersesAudio.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على آيات في هذا النطاق' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      surah,
      fromVerse,
      toVerse,
      audioFiles: selectedVersesAudio
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'حدث خطأ في السيرفر' },
      { status: 500 }
    );
  }
}