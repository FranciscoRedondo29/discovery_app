# ✅ Discovery MVP - Verification Checklist

Use this checklist to verify your setup is complete and working correctly.

## 📋 Pre-Installation Checklist

- [ ] Node.js 18+ installed
  ```bash
  node --version  # Should show v18.0.0 or higher
  ```
- [ ] npm installed

  ```bash
  npm --version   # Should show 9.0.0 or higher
  ```

- [ ] In correct directory
  ```bash
  pwd  # Should show: /Users/franciscoredondo/Documents/Universidade/JUNITEC/Discovery/MVP
  ```

## 📦 Installation Checklist

- [ ] Dependencies installed

  ```bash
  npm install
  # Should complete without major errors
  # node_modules/ folder should exist
  ```

- [ ] Verify key files exist
  ```bash
  ls app/page.tsx           # ✅ Should exist
  ls components/ui/button.tsx  # ✅ Should exist
  ls tailwind.config.ts     # ✅ Should exist
  ```

## 🚀 Runtime Checklist

- [ ] Dev server starts successfully

  ```bash
  npm run dev
  # Should show: "ready started server on 0.0.0.0:3000"
  ```

- [ ] No TypeScript errors in terminal

  - Look for "compiled successfully" message
  - No red error messages

- [ ] Page loads in browser
  - Navigate to `http://localhost:3000`
  - Page should load within 2-3 seconds

## 🎨 Visual Verification Checklist

### Navbar (Top of Page)

- [ ] "Discovery" logo visible on left
- [ ] Sparkle icon next to logo (yellow)
- [ ] "Login" button on right (ghost style)
- [ ] "Registar" button on right (yellow background)
- [ ] Navbar stays fixed when scrolling

### Hero Section

- [ ] Yellow gradient background visible
- [ ] Main headline: "Leitura sem barreiras, aprendizagem com confiança."
- [ ] Subheadline text visible and readable
- [ ] "Experimentar Gratuitamente" button (large, yellow)
- [ ] Placeholder illustration box on right side
- [ ] "Sem necessidade de cartão de crédito" text with checkmark

### Features Section ("Como funciona")

- [ ] White background (contrast with hero)
- [ ] "Como funciona" heading centered
- [ ] Three feature cards visible
- [ ] Card 1: BookOpen icon (yellow) + "Modo Learning"
- [ ] Card 2: Mic icon (yellow) + "Modo Practice"
- [ ] Card 3: TrendingUp icon (yellow) + "Evolução Real"
- [ ] Cards have hover effect (border changes)
- [ ] "Começar Agora" button at bottom

### Benefits Section

- [ ] Soft yellow background (#FEFCE8)
- [ ] "Construído especialmente para dislexia" heading
- [ ] Three bullet points with checkmark icons
- [ ] Placeholder demo box on right

### Footer

- [ ] White background with top border
- [ ] Discovery logo on left
- [ ] Two columns: "Produto" and "Suporte"
- [ ] Links have hover effect (turn yellow)
- [ ] Copyright text at bottom (current year)

## 🎨 Color Verification

- [ ] Primary buttons are mustard yellow (`#EAB308`)
- [ ] Section backgrounds alternate white/soft yellow
- [ ] Text is warm charcoal (`#1C1917`), NOT pure black
- [ ] Icons are yellow (`text-primary-yellow`)

## 📱 Responsive Design Checklist

### Desktop (1200px+)

- [ ] Three feature cards in one row
- [ ] Hero content and image side-by-side
- [ ] Footer items in three columns

### Tablet (768px - 1199px)

- [ ] Feature cards in 2-3 column layout
- [ ] Hero content stacks vertically
- [ ] Footer items in three columns

### Mobile (< 768px)

- [ ] Feature cards stack vertically (one column)
- [ ] Hero content stacks vertically
- [ ] Buttons are full-width or properly sized
- [ ] Text is readable (not too small)
- [ ] All content fits without horizontal scroll

Test by resizing browser window or using browser dev tools (F12 → Toggle device toolbar)

## ♿ Accessibility Checklist

- [ ] All buttons have readable text
- [ ] Icons have `aria-hidden="true"`
- [ ] Images have `alt` text or are decorative
- [ ] Text contrast ratio is sufficient (use browser inspector)
- [ ] Can navigate with keyboard (Tab key)
- [ ] Focus indicators visible when tabbing through

## 🔧 Build Checklist

- [ ] Production build works

  ```bash
  npm run build
  # Should complete with "Compiled successfully"
  ```

- [ ] Production server runs
  ```bash
  npm start
  # Should start on port 3000
  ```

## 🐛 Common Issues

### Issue: Styles not loading

- [ ] Clear browser cache (Cmd/Ctrl + Shift + R)
- [ ] Delete `.next` folder and restart: `rm -rf .next && npm run dev`

### Issue: Port 3000 in use

- [ ] Use different port: `npm run dev -- -p 3001`
- [ ] Or kill process: `lsof -ti:3000 | xargs kill -9`

### Issue: TypeScript errors

- [ ] Check terminal for specific error messages
- [ ] Restart TypeScript server in VS Code: Cmd+Shift+P → "Restart TS Server"

### Issue: Hot reload not working

- [ ] Stop server (Ctrl+C)
- [ ] Delete `.next`: `rm -rf .next`
- [ ] Restart: `npm run dev`

## ✅ Final Verification

If you can check ALL of these, your setup is complete! 🎉

- [ ] Page loads at `http://localhost:3000`
- [ ] All sections visible (Navbar, Hero, Features, Benefits, Footer)
- [ ] Colors match design system (yellow, soft yellow, charcoal)
- [ ] No errors in browser console (F12 → Console)
- [ ] No errors in terminal
- [ ] Responsive design works (test mobile view)
- [ ] Hover effects work on buttons and cards

---

**Need help?** See [SETUP.md](./SETUP.md) for troubleshooting guide.

**Ready to customize?** Edit `app/page.tsx` to change content!
