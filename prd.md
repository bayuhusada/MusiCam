PRD (Product Requirements Document)
Gesture Music Player Web
1. Informasi Proyek
Nama Proyek

Gesture Music Player

Versi

V1.0 (MVP)

Platform
Web Browser Desktop
Google Chrome (utama)
Microsoft Edge
Metodologi
Waterfall
Tujuan

Membangun aplikasi web music player interaktif yang memungkinkan pengguna mengontrol musik menggunakan gesture tangan melalui webcam secara real-time tanpa menyentuh mouse atau keyboard.

2. Latar Belakang

Sebagian besar music player masih menggunakan klik mouse atau sentuhan layar untuk mengontrol musik.

Dengan memanfaatkan Computer Vision menggunakan MediaPipe dan OpenCV, pengguna dapat melakukan kontrol musik hanya dengan gerakan tangan sehingga memberikan pengalaman yang lebih modern dan interaktif.

Proyek ini juga dapat menjadi portofolio yang menunjukkan kemampuan pada:

Front-End Development
Python Development
Computer Vision
Real-Time Communication
AI Interaction
3. Tujuan Produk
Tujuan Utama
Memutar musik dari playlist lokal.
Mengontrol musik menggunakan gesture tangan.
Menampilkan kamera pengguna sebagai background.
Menampilkan card lagu secara modern dan interaktif.
Memberikan pengalaman seperti "Minority Report" atau "Apple Vision Pro".
4. Target User
Primary User
Mahasiswa IT
Programmer
Penggemar teknologi
Pengguna yang ingin pengalaman music player unik
Secondary User
Content Creator
Pengguna Smart Home
Pengguna IoT
5. Teknologi yang Digunakan
Frontend
ReactJS
TailwindCSS
Framer Motion
Howler.js
Backend
Python
FastAPI
OpenCV
MediaPipe
NumPy
Komunikasi
WebSocket
6. Arsitektur Sistem
┌─────────────────┐
│ React Frontend  │
└────────┬────────┘
         │
         │ WebSocket
         │
         ▼
┌─────────────────┐
│ FastAPI Server  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ MediaPipe Hands │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Gesture Engine  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Music Control   │
└─────────────────┘
7. Fitur Utama
F1 - Kamera Fullscreen
Deskripsi

Saat website dibuka:

Webcam aktif otomatis
Kamera tampil fullscreen
User tampil sebagai background utama
Acceptance Criteria
Kamera tampil tanpa refresh halaman
Video memenuhi layar
F2 - Music Card Carousel
Deskripsi

Menampilkan daftar lagu dalam bentuk card.

Informasi Card
Cover Lagu
Judul Lagu
Nama Artist
Acceptance Criteria
Card tampil horizontal
Responsive
Dapat bergeser otomatis ke lagu aktif
F3 - Music Player
Deskripsi

Memutar lagu dari playlist.

Fitur
Play
Pause
Next
Previous
Progress Bar
Acceptance Criteria
Musik dapat diputar tanpa reload
Lagu berikutnya otomatis dimainkan
F4 - Gesture Recognition
Deskripsi

Mendeteksi gesture tangan menggunakan MediaPipe.

Gesture yang Didukung
Gesture	Aksi
👍	Play
✋	Pause
👉 Swipe Right	Next Song
👈 Swipe Left	Previous Song
Acceptance Criteria
Gesture dikenali minimal 80%
Respon kurang dari 1 detik
F5 - Real-Time WebSocket
Deskripsi

Mengirim hasil deteksi gesture ke React secara real-time.

Acceptance Criteria
Tidak menggunakan refresh halaman
Event diterima secara instan
8. Flow Pengguna
Flow 1 - Memutar Musik
User Buka Website
       │
       ▼
Izin Kamera
       │
       ▼
Kamera Aktif
       │
       ▼
Playlist Tampil
       │
       ▼
Gesture 👍
       │
       ▼
Musik Diputar
Flow 2 - Lagu Berikutnya
Gesture Swipe Kanan
       │
       ▼
Backend Deteksi
       │
       ▼
WebSocket
       │
       ▼
React Terima Event
       │
       ▼
Next Song
9. UI Layout
Home Screen
┌─────────────────────────────────────┐
│                                     │
│          LIVE CAMERA                │
│                                     │
│                                     │
│ [Album1][Album2][Album3][Album4]    │
│                                     │
│       NOW PLAYING                   │
│       Alan Walker                   │
│                                     │
│    ▶ Progress Bar                   │
│                                     │
└─────────────────────────────────────┘
10. Struktur Folder
Frontend
frontend/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── Camera.jsx
│   │   ├── MusicCard.jsx
│   │   ├── MusicPlayer.jsx
│   │   ├── ProgressBar.jsx
│   │
│   ├── hooks/
│   │   ├── useWebSocket.js
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │
│   ├── data/
│   │   └── songs.js
│   │
│   └── App.jsx
Backend
backend/
│
├── app/
│   │
│   ├── main.py
│   ├── websocket.py
│   ├── gesture_detector.py
│   ├── mediapipe_engine.py
│   └── config.py
│
├── requirements.txt
│
└── models/
11. Database

Karena MVP hanya memutar playlist lokal:

Tidak menggunakan database.

Data lagu disimpan dalam:

songs.js

Contoh:

export const songs = [
{
 id:1,
 title:"Faded",
 artist:"Alan Walker",
 cover:"cover.jpg",
 audio:"faded.mp3"
}
]
12. Non Functional Requirements
Performance
FPS kamera minimal 24 FPS
Delay gesture < 1 detik
Security
Kamera hanya aktif setelah izin user
Tidak menyimpan video pengguna
Compatibility
Chrome
Edge

13. Roadmap Development
Phase 1 (MVP)
Setup React
Setup FastAPI
Setup MediaPipe
Webcam Background
Playlist
Play/Pause Gesture
Next/Previous Gesture



Phase 2
Volume Control Gesture
Hover Card Dengan Jari
Gesture Pilih Lagu


Phase 3
AI Song Recommendation
Spotify Integration
Beat Visualizer
Multi-Hand Detection


Deliverable Akhir

Aplikasi web yang memungkinkan pengguna:

✅ Melihat dirinya melalui webcam fullscreen
✅ Memutar musik dari playlist
✅ Mengontrol musik menggunakan gesture tangan
✅ Berinteraksi secara real-time tanpa mouse atau keyboard
✅ Menampilkan UI modern ala Spotify + Vision Pro + Computer Vision AI




https://youtu.be/HrLZwh-kxcA?si=6pxoRFqWvWHoptQz
https://youtu.be/sYfzcAKzB3Y?si=vbr_XL8e-eKoKXqR
https://youtu.be/D7qDcurxu_o?si=H4NS85kVEDlPL7K2
https://youtu.be/_N6vSc_mT6I?si=6j3w9L_YaleEYWAB
https://youtu.be/9gY0vpjbDuA?si=J6blfP6qh8rwGIO4
https://youtu.be/zxNHpxtP-Fg?si=Xfok-2eY7-Tnsdj_
https://youtu.be/e2NbAsNX8c4?si=30xWnSMJoQhMCoj9
https://youtu.be/s64jSik9-XA?si=MU8Z4pGxwV2sKMxf
https://youtu.be/e2NbAsNX8c4?si=_xHyRAVtOmvci148
https://youtu.be/aT2eNMXbzaI?si=uDqXGcHipZwe0Ap-

