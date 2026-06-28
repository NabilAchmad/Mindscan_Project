<div align="center">
  <img src="https://img.icons8.com/?size=100&id=sMmdGdrJmUjG&format=png&color=2563EB" alt="MindScan Logo" width="80"/>
  <h1>MindScan - Mobile App</h1>
  <p><strong>Aplikasi Mobile Deteksi Dini Gejala Depresi & Kecemasan Berbasis AI</strong></p>
  
  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![Zustand](https://img.shields.io/badge/Zustand-State_Management-blue?style=for-the-badge)](#)
  [![NativeWind](https://img.shields.io/badge/NativeWind-TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css)](#)
</div>

---

## 🎯 Tentang Proyek
Repositori ini berisi **Frontend (Mobile App)** dari **MindScan**, sebuah *mobile chatbot* cerdas yang dirancang untuk membantu deteksi dini gejala gangguan kesehatan mental, khususnya Depresi dan Kecemasan. 

Dibangun sebagai *Capstone Project Semester 6*, aplikasi seluler ini berfungsi sebagai antarmuka utama yang berinteraksi langsung dengan pengguna (Mahasiswa) maupun para profesional (Psikolog). Aplikasi ini memadukan desain antarmuka yang bersih, modern, dan menenangkan (dengan dominasi warna biru yang elegan).

## ✨ Fitur Utama
Aplikasi MindScan menawarkan berbagai fitur unggulan bagi dua jenis pengguna (Mahasiswa dan Psikolog):

### Untuk Mahasiswa (Pasien)
- **Chatbot AI Tanpa Batas**: Layar percakapan *seamless* dengan kecerdasan buatan (Gemini AI) yang siap mendengarkan cerita dan keluhan kapan saja layaknya buku harian.
- **Deteksi Wajah Senyap (Picture-in-Picture)**: Dilengkapi dengan antarmuka kamera melayang (*floating camera*) yang menangkap ekspresi wajah secara tidak kentara selama sesi *chat* untuk meningkatkan akurasi diagnosa tanpa mengganggu kenyamanan.
- **Asesmen Max-Severity**: Skor tingkat stres pengguna dievaluasi berdasarkan deteksi emosi "terburuk" sepanjang sesi untuk mencegah kesalahan deteksi.
- **Live Chat Konsultasi**: Fitur langsung terhubung (melalui rujukan) dengan psikolog sungguhan jika tingkat stres terdeteksi berat. Terdapat halaman **Riwayat Chat Psikolog** untuk melanjutkan obrolan yang sudah ada.
- **UI Cerdas**: Dukungan *Auto-Scroll* dan *Keyboard Avoiding* sehingga pesan tidak tertutup *keyboard*.

### Untuk Psikolog
- **Dashboard Pasien Real-time**: Menampilkan daftar mahasiswa yang membutuhkan bantuan dengan status yang *up-to-date*.
- **Manajemen Sesi Cerdas**: Psikolog tidak akan bertabrakan dalam menangani satu pasien yang sama berkat arsitektur riwayat *active session*.
- **Room Chat Eksklusif**: Psikolog memiliki ruang obrolan (*room chat*) khusus untuk membalas pesan mahasiswa, lengkap dengan konteks level keparahan (*Anxiety Level*).

## 🛠️ Teknologi yang Digunakan
Sisi klien (Frontend) ini dibangun menggunakan tumpukan teknologi modern untuk memastikan aplikasi berjalan cepat, responsif, dan mudah dipelihara:

- **Framework**: React Native (berjalan di atas Expo SDK 51)
- **Bahasa Pemrograman**: TypeScript
- **Manajemen State**: Zustand (Ringan & Cepat)
- **Styling**: Tailwind CSS via NativeWind v4
- **Navigasi**: React Navigation (Native Stack & Bottom Tabs)
- **Kamera & Media**: `expo-camera` untuk fitur *Computer Vision PIP*

## 🚀 Cara Menjalankan Secara Lokal

Walaupun repositori ini hanya berisi *Frontend*, Anda tetap bisa menjalankan dan melihat antarmuka UI-nya di perangkat Anda. (Catatan: Agar fitur berjalan sepenuhnya, aplikasi ini memerlukan API Backend MindScan yang sedang aktif).

### 1. Kloning Repositori
```bash
git clone https://github.com/NabilAchmad/Mindscan_Project.git
cd Mindscan/frontend
```

### 2. Install Dependencies
Pastikan Anda sudah menginstal Node.js, lalu jalankan:
```bash
npm install
```

### 3. Konfigurasi Endpoint Backend
Secara bawaan, aplikasi ini mencari koneksi ke Backend melalui *Ngrok*. 
Cari variabel `API_BASE` (biasanya berada di file komponen seperti `DashboardScreen.tsx` atau direktori `viewmodels`) lalu arahkan ke URL API Backend Anda jika Anda menjalankannya secara lokal.

### 4. Mulai Aplikasi (Development Mode)
Jalankan perintah berikut:
```bash
npx expo start -c
```
Setelah *bundler* Expo Metro berjalan, **scan QR Code** yang muncul menggunakan aplikasi **Expo Go** (tersedia di Play Store) pada perangkat Android Anda.

---
