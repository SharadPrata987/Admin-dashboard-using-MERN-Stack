# 🎯 Nexus Admin Dashboard - Full Stack Application

A complete admin dashboard with **authentication**, **MongoDB database**, and **real-time data synchronization**.

## ⚡ Quick Start

### 1. Install MongoDB
- Download: https://www.mongodb.com/try/download/community
- Or use MongoDB Atlas (free cloud database)

### 2. Start Backend
```bash
# Windows: Double-click START-BACKEND.bat
# Or manually:
cd backend
npm install
npm start
```

### 3. Open Frontend
- Open `index.html` in your browser
- Register a new account
- Start using the dashboard!

## ✨ Features

- ✅ **JWT Authentication** - Secure login/register
- ✅ **MongoDB Database** - Persistent data storage
- ✅ **User Isolation** - Each user has separate data
- ✅ **Orders Management** - Sync and store orders
- ✅ **Customers Management** - Track customer data
- ✅ **Kanban Board** - Drag & drop task management
- ✅ **Real-time Sync** - All changes saved to database
- ✅ **Auto-login** - Stay logged in across sessions
- ✅ **Enhanced AI Chatbot** - Voice input/output, smart suggestions, chat history
  - 🎤 Voice input & output
  - 💡 Smart suggestions
  - 💾 Chat history save
  - 📥 Export conversations
  - ⚡ Quick actions
  - 🧠 Context memory

## 📚 Documentation

- **BACKEND-SETUP.md** - Complete setup instructions
- **IMPLEMENTATION-SUMMARY.txt** - Technical details
- **API-FIX-README.md** - API troubleshooting
- **AI-CHATBOT-GUIDE.md** - Complete AI chatbot feature guide
- **AI-QUICK-REF.md** - Quick reference for chatbot

## 🏗️ Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript
- Chart.js for analytics
- Toastify for notifications

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT for authentication
- bcrypt for password hashing

## 🔐 Default Test Account

After starting the backend, register your own account:
- Email: your-email@example.com
- Password: your-password

## 📁 Project Structure

```
├── index.html              # Main dashboard
├── script.js              # Frontend logic
├── api-config.js          # API configuration
├── backend/               # Express.js server
│   ├── server.js
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   └── middleware/       # Auth middleware
└── docs/                 # Documentation
```

## 🚀 Deployment

**Backend:** Deploy to Heroku, Railway, or Render
**Frontend:** Deploy to Netlify or Vercel
**Database:** Use MongoDB Atlas

## 🐛 Troubleshooting

**MongoDB not connecting?**
- Check MongoDB is running
- Verify connection string in `backend/.env`

**CORS errors?**
- Ensure backend is running on port 5000
- Check `api-config.js` has correct URL

**Token errors?**
- Logout and login again
- Clear browser localStorage

## 📞 Support

Check browser console (F12) and backend terminal for error messages.

---

**Built with ❤️ - Ready for production!**
