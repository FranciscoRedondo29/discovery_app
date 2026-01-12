# ⚡ Quick Start - Discovery MVP

Get up and running in 3 minutes!

## 🎯 TL;DR

```bash
# 1. Navigate to project
cd /Users/franciscoredondo/Documents/Universidade/JUNITEC/Discovery/MVP

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Open browser
# http://localhost:3000
```

## ✅ Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] In project directory
- [ ] Run `npm install` (takes 1-3 min)
- [ ] Run `npm run dev`
- [ ] Open `http://localhost:3000`
- [ ] See the yellow Discovery landing page 🎉

## 🎨 What You'll See

**Landing Page Components:**

- **Navbar**: Sticky header with Login/Registar buttons
- **Hero**: "Leitura sem barreiras..." headline with CTA
- **Features**: 3 cards (Learning, Practice, Evolução)
- **Footer**: Links and copyright

**Color Scheme:**

- 🟡 Mustard Yellow (`#EAB308`) - buttons and accents
- 🟡 Soft Yellow (`#FEFCE8`) - section backgrounds
- ⚫ Warm Charcoal (`#1C1917`) - text

## 🔧 Quick Fixes

**Port already in use?**

```bash
npm run dev -- -p 3001
# Then open http://localhost:3001
```

**Something broke?**

```bash
rm -rf node_modules .next
npm install
npm run dev
```

## 📝 Key Files

- `app/page.tsx` - Main landing page (edit content here)
- `tailwind.config.ts` - Color customization
- `app/layout.tsx` - Site metadata

## 📚 Full Guide

See [SETUP.md](./SETUP.md) for detailed instructions.

---

**Ready to build something amazing! 🚀**
