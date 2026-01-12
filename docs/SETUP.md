# 🚀 Discovery MVP - Complete Setup Guide

This guide will walk you through setting up the Discovery landing page from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- A code editor (VS Code recommended)

### Verify Installation

Open your terminal and run:

```bash
node --version  # Should show v18.0.0 or higher
npm --version   # Should show 9.0.0 or higher
```

## Step-by-Step Setup

### 1. Navigate to Project Directory

```bash
cd /Users/franciscoredondo/Documents/Universidade/JUNITEC/Discovery/MVP
```

### 2. Install Dependencies

This will install Next.js, React, Tailwind CSS, Shadcn UI components, and all required packages:

```bash
npm install
```

**Expected output:**

- Installation should complete in 1-3 minutes
- You'll see a progress bar and package count
- No major errors (some warnings are normal)

### 3. Verify Installation

Check that `node_modules` directory was created:

```bash
ls -la
```

You should see a `node_modules/` folder.

### 4. Start Development Server

```bash
npm run dev
```

**Expected output:**

```
> discovery-mvp@0.1.0 dev
> next dev

   ▲ Next.js 14.2.18
   - Local:        http://localhost:3000
   - ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 5. Open in Browser

Open your browser and navigate to:

```
http://localhost:3000
```

You should see the Discovery landing page! 🎉

## What You Should See

### Landing Page Structure:

1. ✅ **Navbar** - Fixed at top with "Discovery" logo, Login and "Registar" buttons
2. ✅ **Hero Section** - Yellow gradient background with main headline
3. ✅ **Features Section** - Three cards showing "Como funciona"
4. ✅ **Benefits Section** - Yellow background with checkmarks
5. ✅ **Footer** - Contact and links

### Color Verification:

- Primary buttons should be **mustard yellow** (#EAB308)
- Background sections alternate between **white** and **soft yellow** (#FEFCE8)
- All text should be **warm charcoal** (#1C1917), never pure black

## Troubleshooting

### Issue: `npm install` fails

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### Issue: Port 3000 is already in use

**Solution:**

```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

Then open `http://localhost:3001`

### Issue: TypeScript errors

**Solution:**

```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Styling not loading

**Solution:**

```bash
# Stop server (Ctrl+C)
# Delete .next folder
rm -rf .next

# Restart
npm run dev
```

## Development Workflow

### Making Changes

1. Edit files in `app/page.tsx` for content changes
2. Save the file (Cmd+S or Ctrl+S)
3. The page will **auto-reload** in the browser (Hot Module Replacement)

### Adding New Components

Create new components in `components/` folder:

```bash
mkdir -p components/sections
touch components/sections/Testimonials.tsx
```

### Customizing Colors

Edit `tailwind.config.ts` to adjust the color palette.

## Building for Production

When ready to deploy:

```bash
# Build optimized production bundle
npm run build

# Test production build locally
npm start
```

Production build will be in `.next/` folder.

## Next Steps

### Immediate Tasks:

- [ ] Replace placeholder images with real illustrations
- [ ] Add real demo screenshots
- [ ] Set up analytics (Google Analytics, Plausible, etc.)
- [ ] Add contact form functionality
- [ ] Connect authentication buttons to actual auth system

### Future Enhancements:

- [ ] Add pricing page
- [ ] Create blog section
- [ ] Add testimonials section
- [ ] Implement cookie consent banner
- [ ] Add multilingual support (English version)

## File Structure Reference

```
MVP/
├── app/
│   ├── page.tsx           👈 Main landing page (EDIT THIS for content)
│   ├── layout.tsx         👈 Site-wide layout and metadata
│   └── globals.css        👈 Global styles
│
├── components/
│   └── ui/
│       ├── button.tsx     👈 Reusable button component
│       └── card.tsx       👈 Reusable card component
│
├── lib/
│   └── utils.ts           👈 Utility functions
│
├── tailwind.config.ts     👈 Customize colors here
├── package.json           👈 Dependencies
└── README.md              👈 Project documentation
```

## Useful Commands

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm start`     | Run production build     |
| `npm run lint`  | Check for code issues    |

## Getting Help

### Common Questions:

**Q: How do I change the text/copy?**
A: Edit `app/page.tsx` - all text content is in this file.

**Q: How do I change colors?**
A: Edit `tailwind.config.ts` in the `colors` section.

**Q: How do I add more pages?**
A: Create new files in the `app/` directory (e.g., `app/about/page.tsx`).

**Q: The fonts look different from expected?**
A: Make sure you're connected to the internet - Inter font loads from Google Fonts.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Components](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

## Support

If you encounter issues not covered here, check:

1. Browser console for errors (F12 → Console tab)
2. Terminal output for build errors
3. Next.js documentation for specific features

---

**Happy coding! 🎨✨**

Need help? Review this guide or consult the resources above.
