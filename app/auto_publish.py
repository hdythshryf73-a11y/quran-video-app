import time
import requests
from datetime import datetime

# ==========================================
# سكربت النشر والجدولة الآلية - استوديو السعد
# ==========================================

# رابط API النشر الخاص بموقعك على Vercel
API_URL = "https://quran-video-app.vercel.app/api/publish"

# بيانات القناة والتوليد اليومي
SCHEDULE_CONFIG = {
    "channelUrl": "https://youtube.com/@yourchannel",
    "videoType": "both",            # الخيارات: 'shorts' أو 'long' أو 'both'
    "publishTime": "18:00",          # موعد النشر اليومي
    "autoVersesMode": "fatiha_sequential", # البدء بالتسلسل من الفاتحة
    "readerId": "khalid-jaleel",     # القارئ الافتراضي: خالد عبد الجليل
    "maxDurationMinutes": 5
}

def run_daily_automation():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 🚀 بدء عملية توليد ونشر الفيديو اليومي...")
    
    try:
        # إرسال طلب التوليد والنشر لـ API الموقع
        response = requests.post(API_URL, json=SCHEDULE_CONFIG, timeout=120)
        
        if response.status_code == 200:
            res_data = response.json()
            print(f"✅ تم نشر الفيديو اليومي بنجاح!")
            print(f"🔗 رابط الفيديو: {res_data.get('videoUrl', 'تم النشر')}")
        else:
            print(f"❌ حدث خطأ أثناء النشر: (كود {response.status_code}) - {response.text}")
            
    except Exception as e:
        print(f"⚠️ فشل الاتصال بالخادم: {e}")

if __name__ == "__main__":
    run_daily_automation()