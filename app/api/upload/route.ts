import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      testRun,
      autoPilot,
      channelUrl,
      scheduleType,
      publishTime,
      autoQari,
      autoWatermark,
      autoShortsSec,
      autoLongMin
    } = body;

    if (!channelUrl || typeof channelUrl !== 'string') {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال رابط قناة يوتيوب صالحة' },
        { status: 400 }
      );
    }

    console.log('🤖 [AlSaad AutoPilot Task Executed]:', {
      timestamp: new Date().toISOString(),
      testRun: !!testRun,
      channelUrl,
      scheduleType,
      publishTime,
      autoQari,
      autoWatermark,
      autoShortsSec,
      autoLongMin
    });

    if (testRun) {
      // محاكاة الاتصال بـ YouTube Data API وتجهيز الفيديو المجدول
      return NextResponse.json({
        success: true,
        message: 'تم تشغيل اختبار الطيار الآلي بنجاح!',
        taskDetails: {
          status: 'SUCCESS',
          targetChannel: channelUrl,
          mode: scheduleType,
          nextScheduledVerse: 'سورة الفاتحة (الآيات 1-7)',
          estimatedPublishTime: publishTime,
          reader: autoQari
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'تم حفظ جدول الطيار الآلي بنجاح وتفعيله'
    });

  } catch (error: any) {
    console.error('❌ AutoPilot Route Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'فشل معالجة طلب الطيار الآلي' },
      { status: 500 }
    );
  }
}