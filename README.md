# 🎯 Attendance System

מערכת ניהול נוכחות מלאה עם דיווח בברקוד, צילום, ומיקום GPS

## ✨ תכונות

- ✅ **דיווח כניסה/יציאה** - עם סריקת ברקוד
- ✅ **צילום אוטומטי** - לכידת תמונה בזמן דיווח
- ✅ **GPS/מיקום** - רישום מיקום הדיווח
- ✅ **לוחת בקרה ניהול** - ניהול עובדים ודוחות
- ✅ **זמן אמת** - WebSocket לעדכונים מידיים

## 🏗️ מבנה

```
attendance-system/
├── frontend/          # React App
├── backend/           # Node.js + Express API
└── docker-compose.yml # Docker setup
```

## 🚀 התחלה מהירה

### דרישות
- Node.js v18+
- MongoDB
- Docker (אופציונלי)

### התקנה

```bash
# Clone repository
git clone https://github.com/avihaiy/attendance-system.git
cd attendance-system

# Backend setup
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend setup (בחלון חדש)
cd frontend
npm install
npm start
```

## 📱 שימוש

### עמוד דיווח (עובדים)
- גש ל: `http://localhost:3000`
- סרוק את הברקוד או הקד שלך
- אתה תישמע לצילום אוטומטי
- המיקום יוקלט באופן אוטומטי

### לוחת בקרה (מנהלים)
- גש ל: `http://localhost:3000/admin`
- התחבר עם חשבון מנהל
- בדוק דוחות, עובדים ודיווחים

## 🔐 אבטחה

- JWT authentication
- Password hashing (bcrypt)
- CORS protection
- Role-based access control

## 📊 API Endpoints

### Auth
- `POST /api/auth/register` - הרשמה
- `POST /api/auth/login` - התחברות

### Attendance
- `POST /api/attendance/report` - דיווח כניסה/יציאה
- `GET /api/attendance/today` - דוחות היום
- `GET /api/attendance/employee/:id` - דוחות עובד

### Admin
- `GET /api/admin/employees` - רשימת עובדים
- `GET /api/admin/reports` - כל הדוחות
- `POST /api/admin/employee` - הוספת עובד

## 📄 ליסנס

MIT
