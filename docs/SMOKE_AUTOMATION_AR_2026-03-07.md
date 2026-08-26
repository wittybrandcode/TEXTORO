# Smoke Automation (مبسطة) - TEXTORO

التاريخ: 2026-03-07

## الهدف
فحص سريع قبل أي تسليم للتأكد من:
1. عدم وجود أخطاء Syntax في ملفات الواجهة.
2. عدم وجود استدعاء HostBridge مفقود في الـHost.

## أمر التشغيل
```powershell
powershell -ExecutionPolicy Bypass -File tools/smoke/run-smoke-checks.ps1
```

## ماذا يفحص؟
- `tools/smoke/check-ui-syntax.js`
- `tools/smoke/check-hostbridge-contract.js`

## نتيجة التشغيل الحالية
- PASS بتاريخ 2026-03-07.
