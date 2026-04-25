# 🎯 Guest Log System

A professional, production-ready Guest Management system built with **React.js** and **Google Apps Script**.

## ✨ Features
- 📸 **Camera/Selfie Capture**: Verify guest identity visually.
- 📱 **QR Code Integration**: Automated check-in/check-out tracking.
- 📊 **Real-time Admin Dashboard**: Track occupancy, view statistics, and detailed history.
- ☁️ **Google Sheets Backend**: Serverless, scalable, and easy-to-manage data storage.
- 💎 **Premium Design**: Modern, responsive UI with glassmorphism and smooth animations.

## 🚀 Quick Setup

### 1. Backend (Google Apps Script)
1. Create a new Google Sheet.
2. Go to `Extensions` > `Apps Script`.
3. Copy the contents of `backend/Code.gs` into the editor.
4. Click **Deploy** > **New Deployment**.
5. Select **Web App**.
6. Set "Execute as" to **Me** and "Who has access" to **Anyone**.
7. Deploy and Copy the **Web App URL**.

### 2. Frontend (React)
1. Create a `.env` file in the root directory.
2. Add your Web App URL:
   ```env
   VITE_GAS_URL=YOUR_APPS_SCRIPT_URL_HERE
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure
- `src/components/`: UI components for Entry, Exit, Admin, and Camera.
- `src/services/api.js`: Communication layer with Google Apps Script.
- `src/index.css`: Premium styling and design system.
- `backend/Code.gs`: Server-side logic for data persistence.

## 🛠 Tech Stack
- **Frontend**: React 18, Lucide React, React Webcam, QRCoder.
- **Backend**: Google Apps Script (JavaScript).
- **Storage**: Google Sheets.

---
Created with ❤️ for Modern Guest Management.
