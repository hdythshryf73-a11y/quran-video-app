import { Buffer } from 'node:buffer';
import { NextResponse } from 'next/server';


const MAX_VIDEO_BYTES = 512 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = new Set([
  'video/webm',
  'video/mp4',
  'video/quicktime',
]);

type PublishMetadata = {
  title?: unknown;
  description?: unknown;
  privacyStatus?: unknown;
  tags?: unknown;
};

type GoogleErrorPayload = {
  error?: string | { message?: string; status?: string };
  error_description?: string;
  message?: string;
};

type OAuthTokenPayload = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type YouTubeUploadPayload = {
  id?: string;
  error?: { message?: string; code?: number; status?: string };
  snippet?: { title?: string };
  status?: { privacyStatus?: string };
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

async function parseJsonSafe<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function getGoogleErrorMessage(payload: GoogleErrorPayload | null, fallback: string): string {
  if (!payload) return fallback;
  if (typeof payload.error === 'object' && payload.error?.message) return payload.error.message;
  if (typeof payload.error === 'string') return payload.error_description || payload.error;
  return payload.message || fallback;
}

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get('content-length') || '0');
  if (Number.isFinite(declaredLength) && declaredLength > MAX_VIDEO_BYTES + 2 * 1024 * 1024) {
    return jsonError('حجم طلب الرفع أكبر من الحد المسموح به (512 ميغابايت للفيديو).', 413);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError('تعذر قراءة النموذج. أرسل الفيديو كبيانات multipart/form-data.', 400);
  }

  const videoEntry = formData.get('video');
  const metadataEntry = formData.get('metadata');
  if (!videoEntry || typeof videoEntry === 'string') {
    return jsonError('حقل الفيديو مفقود. أرسل ملفاً في الحقل video.', 400);
  }

  const videoFile = videoEntry;
  if (videoFile.size <= 0) return jsonError('ملف الفيديو فارغ.', 400);
  if (videoFile.size > MAX_VIDEO_BYTES) {
    return jsonError('حجم الفيديو يتجاوز الحد المسموح به في هذا المسار (512 ميغابايت).', 413);
  }

  const videoMimeType = (videoFile.type || '').split(';')[0].trim().toLowerCase();
  if (!ALLOWED_VIDEO_TYPES.has(videoMimeType)) {
    return jsonError('صيغة الفيديو غير مدعومة. استخدم WebM أو MP4 أو QuickTime.', 415);
  }

  if (typeof metadataEntry !== 'string' || metadataEntry.trim().length === 0) {
    return jsonError('بيانات metadata مطلوبة وتتضمن عنوان الفيديو ووصفه.', 400);
  }

  let metadata: PublishMetadata;
  try {
    metadata = JSON.parse(metadataEntry) as PublishMetadata;
  } catch {
    return jsonError('حقل metadata ليس JSON صالحاً.', 400);
  }

  const title = typeof metadata.title === 'string' ? metadata.title.trim() : '';
  const description = typeof metadata.description === 'string' ? metadata.description.trim() : '';
  const privacyInput = typeof metadata.privacyStatus === 'string' ? metadata.privacyStatus : 'unlisted';
  const privacyStatus = ['private', 'unlisted', 'public'].includes(privacyInput) ? privacyInput : null;
  const tags = Array.isArray(metadata.tags)
    ? metadata.tags.filter((tag): tag is string => typeof tag === 'string').map((tag) => tag.trim()).filter(Boolean).slice(0, 30)
    : ['Quran2Reels', 'القرآن الكريم'];

  if (!title) return jsonError('عنوان الفيديو مطلوب.', 400);
  if (title.length > 100) return jsonError('عنوان يوتيوب يجب ألا يتجاوز 100 حرف.', 400);
  if (description.length > 5000) return jsonError('وصف الفيديو يجب ألا يتجاوز 5000 حرف.', 400);
  if (!privacyStatus) return jsonError('قيمة privacyStatus يجب أن تكون private أو unlisted أو public.', 400);

  const clientId = process.env.YOUTUBE_CLIENT_ID || process.env.CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET || process.env.CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN || process.env.REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return jsonError(
      'إعدادات YouTube OAuth2 غير مكتملة. عرّف CLIENT_ID وCLIENT_SECRET وREFRESH_TOKEN (أو متغيرات YOUTUBE_* المكافئة) في ملف البيئة ثم أعد تشغيل الخادم.',
      503,
    );
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
      cache: 'no-store',
    });

    const tokenPayload = await parseJsonSafe<OAuthTokenPayload & GoogleErrorPayload>(tokenResponse);
    if (!tokenResponse.ok || !tokenPayload?.access_token) {
      const message = getGoogleErrorMessage(tokenPayload, 'فشل تجديد رمز OAuth2 الخاص بيوتيوب.');
      return jsonError(`تعذر المصادقة مع يوتيوب: ${message}`, 502);
    }

    // Read the actual video bytes only after validating credentials and metadata.
    const videoBytes = Buffer.from(await videoFile.arrayBuffer());
    const uploadMetadata = {
      snippet: {
        title,
        description,
        tags,
        categoryId: '27',
      },
      status: {
        privacyStatus,
        selfDeclaredMadeForKids: false,
      },
    };

    const sessionResponse = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenPayload.access_token}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Type': videoMimeType,
          'X-Upload-Content-Length': String(videoBytes.byteLength),
        },
        body: JSON.stringify(uploadMetadata),
        cache: 'no-store',
      },
    );

    if (!sessionResponse.ok) {
      const failure = await parseJsonSafe<GoogleErrorPayload>(sessionResponse);
      return jsonError(
        `رفض يوتيوب بدء جلسة الرفع: ${getGoogleErrorMessage(failure, `HTTP ${sessionResponse.status}`)}`,
        sessionResponse.status === 401 ? 401 : 502,
      );
    }

    const uploadUrl = sessionResponse.headers.get('location');
    if (!uploadUrl) {
      return jsonError('لم يُرجع يوتيوب عنوان جلسة الرفع القابلة للاستئناف.', 502);
    }

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenPayload.access_token}`,
        'Content-Type': videoMimeType,
        'Content-Length': String(videoBytes.byteLength),
      },
      body: videoBytes as unknown as BodyInit,
      cache: 'no-store',
    });

    const uploadPayload = await parseJsonSafe<YouTubeUploadPayload>(uploadResponse);
    if (!uploadResponse.ok || !uploadPayload?.id) {
      const failureMessage = uploadPayload?.error?.message || `فشل يوتيوب في حفظ الفيديو (HTTP ${uploadResponse.status}).`;
      return jsonError(failureMessage, uploadResponse.status === 401 ? 401 : 502);
    }

    return NextResponse.json({
      ok: true,
      message: 'تم رفع الفيديو إلى يوتيوب بنجاح.',
      videoId: uploadPayload.id,
      url: `https://www.youtube.com/watch?v=${uploadPayload.id}`,
      title: uploadPayload.snippet?.title || title,
      privacyStatus: uploadPayload.status?.privacyStatus || privacyStatus,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ غير معروف أثناء الاتصال بيوتيوب.';
    return jsonError(`تعذر إكمال رفع الفيديو: ${message}`, 502);
  }
}
