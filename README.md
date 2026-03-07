# 🐾 Pet Scrapbook (Pet Library)

A premium, interactive digital scrapbook for your favorite pet memories. Built with React, GSAP, and Supabase.

## ✨ Features
- **Dynamic Gallery**: Randomized masonry grid with silky-smooth GSAP animations.
- **Cat-Walk Background**: 400+ multi-colored cat paws scattered across the page.
- **Vibrant UX**: Full-screen lightbox, smooth weighted scrolling (Lenis), and responsive design.
- **Permanent Storage**: Powered by Supabase Storage for persistent memories.

## 🚀 Deployment (Vercel)

### 1. Prerequisites
- A GitHub account.
- A [Supabase](https://supabase.com/) project (with a public bucket named `memories`).

### 2. Environment Variables
You MUST add the following environment variables in your Vercel Project Settings:
- `VITE_SUPABASE_URL`: Your Supabase Project URL.
- `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.

### 3. Setup Steps
1. Push this code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and click **"Add New" > "Project"**.
3. Import your repository.
4. Open **"Environment Variables"** and add the keys above.
5. Click **"Deploy"**.

## 🛠️ Tech Stack
- **Frontend**: React + Vite
- **Animations**: GSAP + ScrollTrigger
- **Scrolling**: Lenis
- **Backend/Storage**: Supabase
- **Icons**: Lucide React
