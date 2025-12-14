# Discovery MVP - Landing Page

An AI reading companion for dyslexic students built with Next.js 14+, Tailwind CSS, and Shadcn UI.

## 🎨 Design System

### Color Palette

- **Primary Yellow**: `#EAB308` - Used for CTAs and interactive elements
- **Soft Yellow**: `#FEFCE8` - Used for section backgrounds
- **Text Primary**: `#1C1917` - Main text color (warm charcoal, never pure black)

### Typography

- Font: Inter (system font stack)
- Optimized spacing and readability for dyslexic users

## 🚀 Getting Started

### Quick Start (3 minutes)

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) 🎉

### 📖 Complete Setup Guides

- **[QUICK_START.md](./QUICK_START.md)** - TL;DR version (3 minutes)
- **[SETUP.md](./SETUP.md)** - Full step-by-step guide with troubleshooting

### Prerequisites

- Node.js 18+ and npm installed
- Verify: `node --version` should show v18.0.0+

## 📁 Project Structure

```
MVP/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main landing page
│   └── globals.css         # Global styles with Tailwind
├── components/
│   └── ui/
│       ├── button.tsx      # Shadcn Button component
│       └── card.tsx        # Shadcn Card component
├── lib/
│   └── utils.ts            # Utility functions (cn helper)
├── tailwind.config.ts      # Tailwind configuration with custom colors
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies
```

## ✨ Features

### Landing Page Sections

1. **Navbar**: Sticky navigation with Login and Register buttons
2. **Hero Section**: Eye-catching headline with CTA
3. **Features Section**: Three key features (Learning, Practice, Evolution)
4. **Benefits Section**: Additional value propositions
5. **Footer**: Brand info and links

### Accessibility

- WCAG 2.1 AA compliant
- High contrast ratios (4.5:1 minimum)
- Semantic HTML structure
- Optimized for screen readers
- Keyboard navigation support

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI
- **Icons**: Lucide React
- **Language**: TypeScript
- **Font**: Inter (Google Fonts)

## 📦 Building for Production

```bash
npm run build
npm start
```

## 🎯 Design Principles

1. **Warm & Inviting**: Yellow tones create optimism
2. **High Readability**: Clear typography and spacing
3. **Accessibility First**: WCAG AA standards
4. **Mobile Responsive**: Works on all devices
5. **Performance**: Fast loading with Next.js optimizations

## 📝 License

© 2024 Discovery. All rights reserved.
