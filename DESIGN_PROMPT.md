# 🎨 Mystery Full - Design System & Page Specifications Prompt

این پرامپت برای استفاده در AIهای دیزاین (مثل Midjourney, DALL-E, Figma AI, Claude Artifacts) و همچنین برای مستندسازی تیم طراحی شده است.

---

## 📐 DESIGN SYSTEM

### رنگ‌ها (Color Palette)

```json
{
  "colors": {
    "background": {
      "primary": "#0f0f23",
      "secondary": "#1a1a2e",
      "tertiary": "#16213e",
      "description": "تم تاریک سرمه‌ای - primary برای body، secondary برای cards، tertiary برای inputs"
    },
    "accent": {
      "main": "#6c5ce7",
      "glow": "#a29bfe",
      "bright": "#c9c5ff",
      "description": "رنگ اصلی بنفش/ارغوانی - main برای buttons و borders، glow برای hover states، bright برای highlights"
    },
    "text": {
      "primary": "#ffffff",
      "secondary": "#b2bec3",
      "muted": "#6c757d",
      "description": "متن اصلی سفید، secondary برای توضیحات، muted برای placeholders"
    },
    "glow": {
      "primary": "rgba(108, 92, 231, 0.5)",
      "secondary": "rgba(162, 155, 254, 0.8)",
      "bright": "rgba(201, 197, 255, 0.6)",
      "description": "رنگ‌های glow برای shadow effects - primary برای glow معمولی، secondary برای glow قوی، bright برای glow شدید"
    },
    "semantic": {
      "success": "#4ecdc4",
      "warning": "#ffe66d",
      "error": "#ff6b6b",
      "info": "#6c5ce7"
    }
  }
}
```

### تایپوگرافی (Typography)

```json
{
  "typography": {
    "fontFamily": "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    "headings": {
      "h1": {
        "fontSize": "clamp(2rem, 5vw, 3.5rem)",
        "fontWeight": 700,
        "lineHeight": 1.2,
        "color": "var(--text-primary)",
        "textShadow": "0 0 10px var(--accent-glow), 0 0 20px var(--accent-glow), 0 0 30px var(--accent-glow)"
      },
      "h2": {
        "fontSize": "clamp(1.5rem, 4vw, 2.5rem)",
        "fontWeight": 700,
        "lineHeight": 1.2
      },
      "h3": {
        "fontSize": "clamp(1.25rem, 3vw, 2rem)",
        "fontWeight": 700,
        "lineHeight": 1.2
      }
    },
    "body": {
      "fontSize": "1rem",
      "lineHeight": 1.6,
      "color": "var(--text-primary)"
    },
    "glowText": {
      "class": "glow-text",
      "textShadow": "0 0 10px var(--accent-glow), 0 0 20px var(--accent-glow), 0 0 30px var(--accent-glow)"
    }
  }
}
```

### فاصله‌گذاری (Spacing)

```json
{
  "spacing": {
    "scale": [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128],
    "padding": {
      "card": "1.5rem (24px)",
      "button": "1rem 2rem (16px 32px)",
      "input": "0.75rem 1rem (12px 16px)",
      "section": "4rem 2rem (64px 32px) on desktop, 2rem 1rem (32px 16px) on mobile"
    },
    "gap": {
      "small": "0.5rem (8px)",
      "medium": "1rem (16px)",
      "large": "1.5rem (24px)",
      "xlarge": "2rem (32px)"
    },
    "margin": {
      "section": "2rem (32px)",
      "element": "1rem (16px)",
      "small": "0.5rem (8px)"
    }
  }
}
```

### Border Radius

```json
{
  "borderRadius": {
    "small": "0.5rem (8px)",
    "medium": "0.75rem (12px)",
    "large": "1rem (16px)",
    "xlarge": "1.5rem (24px)",
    "full": "9999px"
  }
}
```

### Shadows & Glow Effects

```json
{
  "shadows": {
    "glow": {
      "small": "0 0 10px var(--glow-primary)",
      "medium": "0 0 20px var(--glow-primary), 0 0 40px var(--glow-secondary)",
      "large": "0 0 30px var(--glow-primary), 0 0 60px var(--glow-secondary), 0 0 90px var(--glow-bright)"
    },
    "card": {
      "default": "0 4px 15px rgba(0, 0, 0, 0.3)",
      "hover": "0 0 20px var(--glow-primary), 0 6px 25px var(--glow-secondary)"
    },
    "button": {
      "default": "0 4px 15px var(--glow-primary)",
      "hover": "0 6px 25px var(--glow-secondary)"
    }
  }
}
```

---

## 🎬 ANIMATION PATTERNS

### اصول انیمیشن (Animation Principles)

```json
{
  "animationPrinciples": {
    "microFeedback": {
      "duration": "100-150ms",
      "purpose": "بازخورد فوری برای تعاملات کاربر",
      "easing": "ease-out برای entry، ease-in برای exit"
    },
    "naturalPhysics": {
      "easing": "easeInOut یا spring({ stiffness: 200, damping: 20 })",
      "duration": "150-300ms برای micro-interactions",
      "description": "استفاده از easing طبیعی برای حس واقعی"
    },
    "continuity": {
      "description": "انیمیشن‌ها باید پیوستگی بصری بین stateها حفظ کنند",
      "example": "Hover → Active → Default باید fluid باشد"
    },
    "purposeDriven": {
      "purposes": ["Inform (feedback)", "Focus (guide attention)", "Delight (emotional resonance)"],
      "rule": "اگر هیچکدام اعمال نمی‌شود → انیمیشن نباشد"
    },
    "hierarchy": {
      "primaryCTA": "scale(1.05) + shadow bloom",
      "secondary": "light opacity fade",
      "textLinks": "color change or underline slide"
    }
  }
}
```

### الگوهای انیمیشن (Animation Patterns)

```json
{
  "animationPatterns": {
    "pageEntry": {
      "initial": { "opacity": 0, "y": 20 },
      "animate": { "opacity": 1, "y": 0 },
      "transition": { "duration": 0.5, "ease": "easeOut" }
    },
    "fadeIn": {
      "initial": { "opacity": 0 },
      "animate": { "opacity": 1 },
      "transition": { "duration": 0.3 }
    },
    "scaleIn": {
      "initial": { "opacity": 0, "scale": 0.8 },
      "animate": { "opacity": 1, "scale": 1 },
      "transition": { "duration": 0.5, "type": "spring", "stiffness": 200, "damping": 20 }
    },
    "slideUp": {
      "initial": { "opacity": 0, "y": 30 },
      "animate": { "opacity": 1, "y": 0 },
      "transition": { "duration": 0.6 }
    },
    "buttonHover": {
      "whileHover": { "scale": 1.05, "y": -2 },
      "whileTap": { "scale": 0.95 },
      "transition": { "duration": 0.2 }
    },
    "cardHover": {
      "default": { "transform": "translateY(0)", "borderColor": "rgba(108, 92, 231, 0.3)" },
      "hover": { "transform": "translateY(-4px)", "borderColor": "var(--accent)", "boxShadow": "0 0 20px var(--glow-primary)" },
      "transition": { "duration": 0.3, "ease": "easeOut" }
    },
    "staggerChildren": {
      "staggerChildren": 0.1,
      "delayChildren": 0.2
    },
    "infiniteScroll": {
      "animation": "infiniteScroll 2s linear infinite",
      "keyframes": {
        "0%": { "transform": "translateX(0%)" },
        "100%": { "transform": "translateX(-50%)" }
      }
    },
    "pulse": {
      "animate": {
        "scale": [1, 1.05, 1],
        "opacity": [1, 0.8, 1]
      },
      "transition": {
        "duration": 2,
        "repeat": "Infinity",
        "ease": "easeInOut"
      }
    },
    "explosion": {
      "circle": {
        "initial": { "scale": 0, "opacity": 1 },
        "animate": { "scale": 4, "opacity": 0 },
        "transition": { "duration": 0.8, "ease": "easeOut" }
      },
      "particles": {
        "duration": 1,
        "ease": "easeOut",
        "delay": "random(0-0.5s)",
        "movement": "random angle, distance 200-500px"
      }
    }
  }
}
```

### Timing Functions

```json
{
  "timingFunctions": {
    "easeOut": "cubic-bezier(0.25, 0.1, 0.25, 1)",
    "easeInOut": "cubic-bezier(0.4, 0, 0.2, 1)",
    "spring": { "stiffness": 200, "damping": 20 },
    "bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
  }
}
```

---

## 📱 RESPONSIVE BREAKPOINTS

```json
{
  "breakpoints": {
    "mobile": "max-width: 768px",
    "tablet": "768px - 1024px",
    "desktop": "min-width: 1024px",
    "spacing": {
      "mobile": { "padding": "1rem", "gap": "1rem", "fontSize": "smaller" },
      "desktop": { "padding": "2rem", "gap": "1.5rem", "fontSize": "larger" }
    }
  }
}
```

---

## 🌍 INTERNATIONALIZATION

```json
{
  "i18n": {
    "languages": ["fa", "en"],
    "rtl": {
      "fa": true,
      "en": false
    },
    "direction": {
      "fa": "rtl",
      "en": "ltr"
    },
    "textAlignment": {
      "fa": "right",
      "en": "left"
    }
  }
}
```

---

## 🎯 PAGE SPECIFICATIONS

### 1. صفحه اصلی (Home Page) - `/`

#### ساختار Layout

```
┌─────────────────────────────────────┐
│         UserNavbar (Fixed Top)      │
├─────────────────────────────────────┤
│                                     │
│         Title: "Mystery Full"       │
│      (glow-text, center, large)     │
│                                     │
│    Subtitle: "چند نفر هستید؟"      │
│   (text-secondary, center, medium)  │
│                                     │
│    ┌─────────────────────────┐     │
│    │                         │     │
│    │    Number Display       │     │
│    │    (9xl, glow-text)     │     │
│    │                         │     │
│    │    "بازیکن" label      │     │
│    └─────────────────────────┘     │
│                                     │
│    ┌─────────────────────────┐     │
│    │    Slider (2-20+)       │     │
│    │    (accent gradient)    │     │
│    └─────────────────────────┘     │
│                                     │
│    Min: 2    Max: 20+               │
│                                     │
│    ┌─────────────────────────┐     │
│    │  "شروع بازی 🎮" Button │     │
│    │    (btn-primary, glow)   │     │
│    └─────────────────────────┘     │
│                                     │
└─────────────────────────────────────┘
```

#### جزئیات المان‌ها

```json
{
  "homePage": {
    "layout": {
      "container": {
        "minHeight": "100vh",
        "display": "flex",
        "flexDirection": "column",
        "alignItems": "center",
        "justifyContent": "center",
        "paddingTop": "5rem (80px) on mobile, 6rem (96px) on desktop",
        "padding": "1rem (16px) on mobile, 2rem (32px) on desktop"
      }
    },
    "title": {
      "text": "Mystery Full",
      "fontSize": "5xl (3rem) on mobile, 7xl (4.5rem) on desktop",
      "fontWeight": 700,
      "className": "glow-text",
      "marginBottom": "1rem (16px)",
      "textAlign": "center",
      "animation": {
        "initial": { "opacity": 0, "y": -50 },
        "animate": { "opacity": 1, "y": 0 },
        "transition": { "duration": 0.6, "ease": "easeOut" }
      }
    },
    "subtitle": {
      "text": "چند نفر هستید؟",
      "fontSize": "xl (1.25rem) on mobile, 2xl (1.5rem) on desktop",
      "color": "var(--text-secondary)",
      "marginBottom": "3rem (48px)",
      "animation": {
        "initial": { "opacity": 0 },
        "animate": { "opacity": 1 },
        "transition": { "delay": 0.3, "duration": 0.6 }
      }
    },
    "numberDisplay": {
      "fontSize": "9xl (8rem) on mobile, 12rem on desktop",
      "fontWeight": 700,
      "className": "glow-text",
      "textAlign": "center",
      "marginBottom": "2rem (32px)",
      "animation": {
        "key": "playerCount (برای re-render)",
        "initial": { "scale": 1.2, "opacity": 0 },
        "animate": { "scale": 1, "opacity": 1 },
        "transition": { "duration": 0.3 }
      }
    },
    "slider": {
      "width": "100%",
      "maxWidth": "32rem (512px)",
      "height": "0.5rem (8px)",
      "background": "linear-gradient(to right, var(--accent) 0%, var(--accent) [percentage]%, var(--bg-tertiary) [percentage]%, var(--bg-tertiary) 100%)",
      "borderRadius": "0.5rem (8px)",
      "thumb": {
        "width": "24px",
        "height": "24px",
        "background": "var(--accent)",
        "borderRadius": "50%",
        "border": "2px solid var(--accent-glow)",
        "boxShadow": "0 0 15px var(--glow-primary), 0 0 30px var(--glow-secondary)",
        "hover": {
          "boxShadow": "0 0 20px var(--glow-primary), 0 0 40px var(--glow-secondary)",
          "transform": "scale(1.15)"
        }
      }
    },
    "startButton": {
      "text": "شروع بازی 🎮",
      "className": "btn-primary glow-lg",
      "marginTop": "3rem (48px)",
      "animation": {
        "initial": { "opacity": 0, "y": 50 },
        "animate": { "opacity": 1, "y": 0 },
        "transition": { "delay": 0.8, "duration": 0.6 },
        "whileHover": { "scale": 1.05, "y": -2 },
        "whileTap": { "scale": 0.95 }
      }
    }
  }
}
```

---

### 2. صفحه انتخاب بازی (Games Roulette) - `/games?players={count}`

#### ساختار Layout

```
┌─────────────────────────────────────┐
│         UserNavbar (Fixed Top)      │
├─────────────────────────────────────┤
│                                     │
│    Title: "در حال انتخاب..."        │
│    (glow-text, center, large)       │
│                                     │
│    ┌─────────────────────────┐     │
│    │                         │     │
│    │  [Center Highlight Box] │     │
│    │  (border-accent, glow)   │     │
│    │                         │     │
│    │  [Game Boxes Scrolling] │     │
│    │  (infinite scroll)      │     │
│    │                         │     │
│    └─────────────────────────┘     │
│                                     │
│    [Loading Dots] (if spinning)     │
│                                     │
│    [Explosion Particles] (on select)│
│                                     │
└─────────────────────────────────────┘
```

#### جزئیات المان‌ها

```json
{
  "gamesRoulettePage": {
    "layout": {
      "container": {
        "minHeight": "100vh",
        "display": "flex",
        "flexDirection": "column",
        "alignItems": "center",
        "justifyContent": "center",
        "paddingTop": "5rem (80px) on mobile, 6rem (96px) on desktop",
        "padding": "1rem (16px)"
      }
    },
    "title": {
      "text": "در حال انتخاب...",
      "fontSize": "3xl (1.875rem) on mobile, 5xl (3rem) on desktop",
      "fontWeight": 700,
      "className": "glow-text",
      "marginBottom": "2rem (32px)",
      "animation": {
        "initial": { "opacity": 0, "y": -30 },
        "animate": { "opacity": 1, "y": 0 }
      }
    },
    "rouletteContainer": {
      "width": "100%",
      "maxWidth": "72rem (1152px)",
      "height": "200px",
      "position": "relative",
      "overflow": "hidden"
    },
    "centerHighlight": {
      "position": "absolute",
      "left": "50%",
      "top": "50%",
      "transform": "translate(-50%, -50%)",
      "width": "8rem (128px) on mobile, 10rem (160px) on desktop",
      "height": "8rem (128px) on mobile, 10rem (160px) on desktop",
      "border": "4px solid var(--accent)",
      "borderRadius": "0.75rem (12px)",
      "className": "glow-lg",
      "pointerEvents": "none",
      "zIndex": 10
    },
    "gameBoxes": {
      "display": "flex",
      "gap": "1rem (16px) on mobile, 1.5rem (24px) on desktop",
      "width": "200%",
      "direction": "rtl for fa, ltr for en",
      "animation": {
        "spinning": {
          "name": "infiniteScroll",
          "duration": "2s",
          "timing": "linear",
          "iteration": "infinite"
        },
        "stopped": {
          "transform": "translateX([calculated offset])",
          "transition": "transform 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)"
        }
      }
    },
    "gameBox": {
      "width": "8rem (128px) on mobile, 10rem (160px) on desktop",
      "height": "8rem (128px) on mobile, 10rem (160px) on desktop",
      "borderRadius": "0.75rem (12px)",
      "background": "linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))",
      "border": "2px solid rgba(108, 92, 231, 0.3)",
      "boxShadow": "0 4px 15px rgba(0, 0, 0, 0.3)",
      "selected": {
        "background": "linear-gradient(135deg, var(--accent), var(--accent-glow))",
        "border": "2px solid var(--accent-glow)",
        "boxShadow": "0 0 30px var(--glow-primary), 0 0 60px var(--glow-secondary)",
        "transform": "scale(1.15)",
        "transition": { "duration": 0.3 }
      },
      "decoration": {
        "ribbon": "gradient stripes on top/bottom/left/right (1/3 of box)",
        "bow": "circular center decoration with radial gradient",
        "sparkles": "4 small glowing dots on corners (if selected)"
      }
    },
    "loadingDots": {
      "display": "flex",
      "gap": "0.5rem (8px)",
      "marginTop": "2rem (32px)",
      "dots": [
        {
          "width": "12px",
          "height": "12px",
          "background": "var(--accent)",
          "borderRadius": "50%",
          "className": "glow",
          "animation": {
            "scale": [1, 1.2, 1],
            "opacity": [1, 0.8, 1],
            "duration": 0.6,
            "repeat": "Infinity",
            "repeatType": "reverse",
            "delay": 0
          }
        },
        {
          "delay": 0.2
        },
        {
          "delay": 0.4
        }
      ]
    },
    "explosion": {
      "trigger": "when game is selected",
      "circle": {
        "width": "24rem (384px)",
        "height": "24rem (384px)",
        "borderRadius": "50%",
        "background": "radial-gradient(circle, rgba(108, 92, 231, 0.8) 0%, transparent 70%)",
        "animation": {
          "initial": { "scale": 0, "opacity": 1 },
          "animate": { "scale": 4, "opacity": 0 },
          "transition": { "duration": 0.8, "ease": "easeOut" }
        }
      },
      "particles": {
        "count": 50,
        "size": "12px",
        "colors": ["#6c5ce7", "#a29bfe", "#c9c5ff", "#ff6b6b", "#4ecdc4", "#ffe66d"],
        "animation": {
          "duration": 1,
          "ease": "easeOut",
          "delay": "random(0-0.5s)",
          "movement": "random angle, distance 200-500px",
          "scale": [1, 1.5, 0],
          "opacity": [1, 1, 0]
        }
      },
      "gameName": {
        "fontSize": "5xl (3rem) on mobile, 7xl (4.5rem) on desktop",
        "fontWeight": 700,
        "className": "glow-text",
        "animation": {
          "initial": { "scale": 0, "opacity": 0 },
          "animate": { "scale": 1, "opacity": 1 },
          "transition": { "delay": 0.3, "duration": 0.5, "type": "spring", "stiffness": 200 },
          "pulse": {
            "scale": [1, 1.1, 1],
            "duration": 0.5,
            "repeat": 2
          }
        }
      }
    }
  }
}
```

---

### 3. صفحه جزئیات بازی (Game Details) - `/games/[id]`

#### ساختار Layout

```
┌─────────────────────────────────────┐
│         UserNavbar (Fixed Top)      │
├─────────────────────────────────────┤
│                                     │
│    ┌─────────────────────────┐     │
│    │                         │     │
│    │   Game Name (Large)      │     │
│    │   (glow-text, pulse)     │     │
│    │                         │     │
│    │   Game Name (English)    │     │
│    │   (text-secondary)       │     │
│    └─────────────────────────┘     │
│                                     │
│    ┌─────────────────────────┐     │
│    │  "این بازی برای شما     │     │
│    │   انتخاب شده است!"      │     │
│    │  (card, glow-lg)         │     │
│    └─────────────────────────┘     │
│                                     │
│    ┌──────┬──────┬──────┬──────┐   │
│    │ 👥   │ ⏱️   │ 📊   │ 🎯   │   │
│    │Players│Time │Diff  │Cat   │   │
│    └──────┴──────┴──────┴──────┘   │
│                                     │
│    ┌─────────────────────────┐     │
│    │ 📝 درباره بازی         │     │
│    │ (card, description)      │     │
│    └─────────────────────────┘     │
│                                     │
│    ┌─────────────────────────┐     │
│    │ 📋 قوانین بازی          │     │
│    │ (card, rules)            │     │
│    └─────────────────────────┘     │
│                                     │
│    ┌─────────────────────────┐     │
│    │ 💡 نکات مهم (optional)  │     │
│    │ (card, tips)             │     │
│    └─────────────────────────┘     │
│                                     │
│    [❤️ Add to Favorites] [🏠 Home]  │
│                                     │
└─────────────────────────────────────┘
```

#### جزئیات المان‌ها

```json
{
  "gameDetailsPage": {
    "layout": {
      "container": {
        "minHeight": "100vh",
        "paddingTop": "5rem (80px) on mobile, 6rem (96px) on desktop",
        "padding": "1rem (16px) on mobile, 2rem (32px) on desktop",
        "maxWidth": "64rem (1024px)",
        "margin": "0 auto"
      }
    },
    "header": {
      "textAlign": "center",
      "marginBottom": "2rem (32px)",
      "animation": {
        "initial": { "opacity": 0, "y": -30 },
        "animate": { "opacity": 1, "y": 0 },
        "transition": { "duration": 0.6 }
      }
    },
    "gameTitle": {
      "fontSize": "5xl (3rem) on mobile, 7xl (4.5rem) on desktop",
      "fontWeight": 700,
      "className": "glow-text",
      "marginBottom": "1rem (16px)",
      "animation": {
        "pulse": {
          "scale": [1, 1.05, 1],
          "duration": 2,
          "repeat": "Infinity",
          "ease": "easeInOut"
        }
      }
    },
    "gameSubtitle": {
      "fontSize": "xl (1.25rem) on mobile, 2xl (1.5rem) on desktop",
      "color": "var(--text-secondary)"
    },
    "selectedMessage": {
      "className": "card glow-lg",
      "padding": "1.5rem (24px) on mobile, 2rem (32px) on desktop",
      "textAlign": "center",
      "marginBottom": "2rem (32px)",
      "animation": {
        "initial": { "opacity": 0, "scale": 0.9 },
        "animate": { "opacity": 1, "scale": 1 },
        "transition": { "delay": 0.2, "duration": 0.5 }
      },
      "title": {
        "fontSize": "2xl (1.5rem) on mobile, 3xl (1.875rem) on desktop",
        "fontWeight": 700,
        "color": "var(--accent-glow)",
        "marginBottom": "0.5rem (8px)"
      },
      "message": {
        "fontSize": "lg (1.125rem) on mobile, xl (1.25rem) on desktop",
        "color": "var(--text-secondary)",
        "marginTop": "1rem (16px)"
      }
    },
    "infoCards": {
      "display": "grid",
      "gridTemplateColumns": "repeat(2, 1fr) on mobile, repeat(4, 1fr) on desktop",
      "gap": "1rem (16px)",
      "marginBottom": "2rem (32px)",
      "cards": [
        {
          "icon": "👥",
          "label": "تعداد بازیکن",
          "value": "minPlayers-maxPlayers",
          "animation": { "delay": 0.3 }
        },
        {
          "icon": "⏱️",
          "label": "مدت زمان",
          "value": "duration minutes",
          "animation": { "delay": 0.4 }
        },
        {
          "icon": "📊",
          "label": "سطح دشواری",
          "value": "easy/medium/hard",
          "color": {
            "easy": "#4ecdc4",
            "medium": "#ffe66d",
            "hard": "#ff6b6b"
          },
          "animation": { "delay": 0.5 }
        },
        {
          "icon": "🎯",
          "label": "دسته‌بندی",
          "value": "category",
          "animation": { "delay": 0.6 }
        }
      ],
      "cardStyle": {
        "className": "card",
        "textAlign": "center",
        "padding": "1rem (16px)",
        "animation": {
          "initial": { "opacity": 0, "y": 20 },
          "animate": { "opacity": 1, "y": 0 }
        }
      }
    },
    "descriptionCard": {
      "className": "card",
      "marginBottom": "1.5rem (24px)",
      "animation": {
        "initial": { "opacity": 0, "y": 20 },
        "animate": { "opacity": 1, "y": 0 },
        "transition": { "delay": 0.7 }
      },
      "title": {
        "fontSize": "2xl (1.5rem)",
        "fontWeight": 700,
        "className": "glow-text",
        "marginBottom": "1rem (16px)"
      },
      "content": {
        "fontSize": "lg (1.125rem)",
        "color": "var(--text-secondary)",
        "lineHeight": 1.75
      }
    },
    "rulesCard": {
      "className": "card",
      "marginBottom": "1.5rem (24px)",
      "animation": {
        "initial": { "opacity": 0, "y": 20 },
        "animate": { "opacity": 1, "y": 0 },
        "transition": { "delay": 0.8 }
      },
      "title": {
        "fontSize": "2xl (1.5rem)",
        "fontWeight": 700,
        "className": "glow-text",
        "marginBottom": "1rem (16px)"
      },
      "content": {
        "fontSize": "lg (1.125rem)",
        "color": "var(--text-secondary)",
        "lineHeight": 1.75,
        "whiteSpace": "pre-line"
      }
    },
    "tipsCard": {
      "className": "card",
      "marginBottom": "1.5rem (24px)",
      "animation": {
        "initial": { "opacity": 0, "y": 20 },
        "animate": { "opacity": 1, "y": 0 },
        "transition": { "delay": 0.9 }
      },
      "conditional": "only if game.tips exists"
    },
    "actionButtons": {
      "display": "flex",
      "flexDirection": "column on mobile, row on desktop",
      "gap": "1rem (16px)",
      "justifyContent": "center",
      "alignItems": "center",
      "animation": {
        "initial": { "opacity": 0, "y": 20 },
        "animate": { "opacity": 1, "y": 0 },
        "transition": { "delay": 1 }
      },
      "favoriteButton": {
        "padding": "0.75rem 1.5rem",
        "borderRadius": "0.75rem (12px)",
        "fontWeight": 600,
        "states": {
          "default": {
            "background": "var(--bg-secondary)",
            "color": "var(--text-primary)",
            "border": "1px solid var(--accent)"
          },
          "active": {
            "background": "var(--accent)",
            "color": "white",
            "className": "glow"
          }
        },
        "animation": {
          "whileHover": { "scale": 1.05, "y": -2 },
          "whileTap": { "scale": 0.95 }
        }
      },
      "homeButton": {
        "className": "btn-primary",
        "animation": {
          "whileHover": { "scale": 1.05, "y": -2 },
          "whileTap": { "scale": 0.95 }
        }
      }
    }
  }
}
```

---

### 4. صفحه علاقه‌مندی‌ها (Favorites) - `/favorites`

#### ساختار Layout

```
┌─────────────────────────────────────┐
│         UserNavbar (Fixed Top)      │
├─────────────────────────────────────┤
│                                     │
│    "علاقه‌مندی‌های من"             │
│    (glow-text, large)               │
│                                     │
│    "X علاقه‌مندی" or                │
│    "شما هنوز بازی‌ای اضافه..."      │
│    (text-secondary)                  │
│                                     │
│    ┌─────────┬─────────┬─────────┐ │
│    │  Game   │  Game   │  Game   │ │
│    │  Card   │  Card   │  Card   │ │
│    └─────────┴─────────┴─────────┘ │
│    ┌─────────┬─────────┬─────────┐ │
│    │  Game   │  Game   │  Game   │ │
│    │  Card   │  Card   │  Card   │ │
│    └─────────┴─────────┴─────────┘ │
│                                     │
│    OR (if empty):                    │
│                                     │
│    💔                                │
│    "شما هنوز بازی‌ای..."            │
│    [🏠 Home Button]                  │
│                                     │
└─────────────────────────────────────┘
```

#### جزئیات المان‌ها

```json
{
  "favoritesPage": {
    "layout": {
      "container": {
        "minHeight": "100vh",
        "paddingTop": "5rem (80px) on mobile, 6rem (96px) on desktop",
        "padding": "1rem (16px) on mobile, 2rem (32px) on desktop",
        "maxWidth": "80rem (1280px)",
        "margin": "0 auto"
      }
    },
    "header": {
      "marginBottom": "2rem (32px)",
      "animation": {
        "initial": { "opacity": 0, "y": -20 },
        "animate": { "opacity": 1, "y": 0 },
        "transition": { "duration": 0.5 }
      }
    },
    "title": {
      "fontSize": "4xl (2.25rem) on mobile, 5xl (3rem) on desktop",
      "fontWeight": 700,
      "className": "glow-text",
      "marginBottom": "1rem (16px)"
    },
    "subtitle": {
      "fontSize": "lg (1.125rem)",
      "color": "var(--text-secondary)"
    },
    "emptyState": {
      "textAlign": "center",
      "padding": "4rem (64px) 0",
      "animation": {
        "initial": { "opacity": 0, "scale": 0.9 },
        "animate": { "opacity": 1, "scale": 1 },
        "transition": { "duration": 0.5 }
      },
      "icon": {
        "fontSize": "6xl (3.75rem)",
        "marginBottom": "1rem (16px)"
      },
      "title": {
        "fontSize": "2xl (1.5rem)",
        "fontWeight": 700,
        "className": "glow-text",
        "marginBottom": "1rem (16px)"
      },
      "button": {
        "className": "btn-primary",
        "marginTop": "1rem (16px)",
        "animation": {
          "whileHover": { "scale": 1.05, "y": -2 },
          "whileTap": { "scale": 0.95 }
        }
      }
    },
    "gamesGrid": {
      "display": "grid",
      "gridTemplateColumns": "1fr on mobile, repeat(2, 1fr) on tablet, repeat(3, 1fr) on desktop",
      "gap": "1.5rem (24px)",
      "gameCard": {
        "className": "card group",
        "padding": "1.5rem (24px)",
        "animation": {
          "initial": { "opacity": 0, "y": 20 },
          "animate": { "opacity": 1, "y": 0 },
          "transition": { "delay": "index * 0.1", "duration": 0.5 }
        },
        "hover": {
          "borderColor": "var(--accent) with 50% opacity",
          "transition": "all 0.3s ease"
        },
        "header": {
          "display": "flex",
          "justifyContent": "space-between",
          "alignItems": "flex-start",
          "marginBottom": "1rem (16px)"
        },
        "gameTitle": {
          "fontSize": "xl (1.25rem)",
          "fontWeight": 700,
          "className": "glow-text",
          "marginBottom": "0.5rem (8px)",
          "hover": {
            "color": "var(--accent)",
            "transition": "color 0.3s"
          }
        },
        "gameSubtitle": {
          "fontSize": "sm (0.875rem)",
          "color": "var(--text-secondary)"
        },
        "removeButton": {
          "padding": "0.5rem (8px)",
          "borderRadius": "0.5rem (8px)",
          "background": "rgba(239, 68, 68, 0.2)",
          "border": "1px solid rgba(239, 68, 68, 0.5)",
          "color": "rgb(252, 165, 165)",
          "hover": {
            "background": "rgba(239, 68, 68, 0.3)"
          },
          "animation": {
            "whileHover": { "scale": 1.1 },
            "whileTap": { "scale": 0.9 }
          }
        },
        "gameInfo": {
          "display": "flex",
          "flexWrap": "wrap",
          "gap": "0.75rem (12px)",
          "marginBottom": "1rem (16px)",
          "infoItem": {
            "display": "flex",
            "alignItems": "center",
            "gap": "0.25rem (4px)",
            "fontSize": "sm (0.875rem)",
            "color": "var(--text-secondary)"
          }
        },
        "description": {
          "fontSize": "sm (0.875rem)",
          "color": "var(--text-secondary)",
          "lineClamp": 2,
          "overflow": "hidden",
          "textOverflow": "ellipsis"
        }
      }
    }
  }
}
```

---

### 5. صفحه ورود (Login) - `/login`

#### ساختار Layout

```
┌─────────────────────────────────────┐
│                                     │
│         [Centered Card]             │
│    ┌─────────────────────────┐     │
│    │                         │     │
│    │   "ورود به سیستم"       │     │
│    │   (glow-text, center)    │     │
│    │                         │     │
│    │   Subtitle text         │     │
│    │   (text-secondary)       │     │
│    │                         │     │
│    │   [Error Message]        │     │
│    │   (if error exists)      │     │
│    │                         │     │
│    │   STEP 1: Phone         │     │
│    │   ┌─────────────────┐   │     │
│    │   │ Phone Input     │   │     │
│    │   └─────────────────┘   │     │
│    │   [Send Code Button]     │     │
│    │                         │     │
│    │   OR                     │     │
│    │                         │     │
│    │   STEP 2: Code           │     │
│    │   ┌─┬─┬─┬─┬─┬─┐         │     │
│    │   │ │ │ │ │ │ │         │     │
│    │   └─┴─┴─┴─┴─┴─┘         │     │
│    │   "کد دیفالت: 111111"   │     │
│    │   [Back] [Verify]        │     │
│    │                         │     │
│    └─────────────────────────┘     │
│                                     │
└─────────────────────────────────────┘
```

#### جزئیات المان‌ها

```json
{
  "loginPage": {
    "layout": {
      "container": {
        "minHeight": "100vh",
        "display": "flex",
        "alignItems": "center",
        "justifyContent": "center",
        "padding": "1rem (16px)"
      }
    },
    "card": {
      "width": "100%",
      "maxWidth": "28rem (448px)",
      "background": "var(--bg-secondary) with 80% opacity",
      "backdropFilter": "blur(12px)",
      "borderRadius": "1rem (16px)",
      "padding": "2rem (32px)",
      "boxShadow": "0 20px 60px rgba(0, 0, 0, 0.5)",
      "border": "1px solid rgba(108, 92, 231, 0.2)",
      "animation": {
        "initial": { "opacity": 0, "y": 20 },
        "animate": { "opacity": 1, "y": 0 },
        "transition": { "duration": 0.5, "ease": "easeOut" }
      }
    },
    "title": {
      "fontSize": "3xl (1.875rem)",
      "fontWeight": 700,
      "textAlign": "center",
      "marginBottom": "0.5rem (8px)",
      "className": "glow-text",
      "animation": {
        "initial": { "opacity": 0, "y": -20 },
        "animate": { "opacity": 1, "y": 0 },
        "transition": { "delay": 0.1, "duration": 0.5 }
      }
    },
    "subtitle": {
      "textAlign": "center",
      "color": "var(--text-secondary)",
      "marginBottom": "2rem (32px)",
      "animation": {
        "initial": { "opacity": 0 },
        "animate": { "opacity": 1 },
        "transition": { "delay": 0.2, "duration": 0.5 }
      }
    },
    "errorMessage": {
      "padding": "0.75rem (12px)",
      "background": "rgba(239, 68, 68, 0.2)",
      "border": "1px solid rgba(239, 68, 68, 0.5)",
      "borderRadius": "0.5rem (8px)",
      "color": "rgb(252, 165, 165)",
      "fontSize": "sm (0.875rem)",
      "textAlign": "center",
      "marginBottom": "1rem (16px)",
      "animation": {
        "initial": { "opacity": 0, "scale": 0.9 },
        "animate": { "opacity": 1, "scale": 1 }
      }
    },
    "phoneInput": {
      "width": "100%",
      "padding": "0.75rem 1rem",
      "background": "var(--bg-tertiary)",
      "border": "1px solid rgba(108, 92, 231, 0.3)",
      "borderRadius": "0.5rem (8px)",
      "color": "var(--text-primary)",
      "direction": "ltr",
      "focus": {
        "outline": "none",
        "borderColor": "var(--accent)",
        "boxShadow": "0 0 0 3px rgba(108, 92, 231, 0.1)"
      }
    },
    "codeInputs": {
      "display": "flex",
      "gap": "0.5rem (8px) on mobile, 0.75rem (12px) on desktop",
      "justifyContent": "center",
      "marginBottom": "1rem (16px)",
      "direction": "rtl for fa, ltr for en",
      "input": {
        "width": "3rem (48px) on mobile, 3.5rem (56px) on desktop",
        "height": "3.5rem (56px) on mobile, 4rem (64px) on desktop",
        "background": "var(--bg-tertiary)",
        "border": "2px solid rgba(108, 92, 231, 0.3)",
        "borderRadius": "0.5rem (8px)",
        "textAlign": "center",
        "fontSize": "2xl (1.5rem) on mobile, 3xl (1.875rem) on desktop",
        "fontWeight": 700,
        "letterSpacing": "0.1em",
        "direction": "ltr",
        "focus": {
          "outline": "none",
          "borderColor": "var(--accent)",
          "boxShadow": "0 0 0 2px rgba(108, 92, 231, 0.5)",
          "transform": "scale(1.05)"
        },
        "animation": {
          "initial": { "scale": 0.8, "opacity": 0 },
          "animate": { "scale": 1, "opacity": 1 },
          "transition": { "delay": "index * 0.05" }
        }
      }
    },
    "defaultCodeHint": {
      "fontSize": "xs (0.75rem)",
      "color": "var(--text-muted)",
      "textAlign": "center",
      "marginTop": "0.5rem (8px)"
    },
    "sendCodeButton": {
      "width": "100%",
      "padding": "0.75rem",
      "background": "linear-gradient(135deg, var(--accent), var(--accent-glow))",
      "color": "white",
      "fontWeight": 600,
      "borderRadius": "0.5rem (8px)",
      "className": "glow",
      "disabled": {
        "opacity": 0.5,
        "cursor": "not-allowed"
      },
      "animation": {
        "whileHover": { "scale": 1.02 },
        "whileTap": { "scale": 0.98 }
      }
    },
    "actionButtons": {
      "display": "flex",
      "gap": "0.75rem (12px)",
      "backButton": {
        "flex": 1,
        "padding": "0.75rem",
        "background": "var(--bg-tertiary)",
        "color": "var(--text-primary)",
        "fontWeight": 600,
        "borderRadius": "0.5rem (8px)",
        "border": "1px solid rgba(108, 92, 231, 0.2)",
        "hover": {
          "background": "var(--bg-tertiary) with 80% opacity"
        },
        "animation": {
          "whileHover": { "scale": 1.02 },
          "whileTap": { "scale": 0.98 }
        }
      },
      "verifyButton": {
        "flex": 1,
        "padding": "0.75rem",
        "background": "linear-gradient(135deg, var(--accent), var(--accent-glow))",
        "color": "white",
        "fontWeight": 600,
        "borderRadius": "0.5rem (8px)",
        "className": "glow",
        "disabled": {
          "opacity": 0.5,
          "cursor": "not-allowed"
        },
        "animation": {
          "whileHover": { "scale": 1.02 },
          "whileTap": { "scale": 0.98 }
        }
      }
    }
  }
}
```

---

### 6. Navigation Bar (UserNavbar)

#### ساختار Layout

```
┌─────────────────────────────────────┐
│  🎮 Mystery Full  │  ❤️  🌐  🚪    │
│  (Logo/Home)      │  Fav Lang Logout│
└─────────────────────────────────────┘
```

#### جزئیات المان‌ها

```json
{
  "navbar": {
    "position": "fixed",
    "top": 0,
    "left": 0,
    "right": 0,
    "zIndex": 50,
    "background": "var(--bg-secondary) with 90% opacity",
    "backdropFilter": "blur(12px)",
    "borderBottom": "1px solid rgba(108, 92, 231, 0.2)",
    "boxShadow": "0 2px 20px rgba(108, 92, 231, 0.3)",
    "animation": {
      "initial": { "opacity": 0, "y": -20 },
      "animate": { "opacity": 1, "y": 0 },
      "transition": { "duration": 0.3 }
    },
    "container": {
      "maxWidth": "80rem (1280px)",
      "margin": "0 auto",
      "padding": "1rem (16px) on mobile, 1.5rem (24px) on desktop",
      "display": "flex",
      "justifyContent": "space-between",
      "alignItems": "center",
      "height": "4rem (64px) on mobile, 5rem (80px) on desktop"
    },
    "logo": {
      "fontSize": "2xl (1.5rem) on mobile, 3xl (1.875rem) on desktop",
      "fontWeight": 700,
      "className": "glow-text",
      "animation": {
        "whileHover": { "scale": 1.05 },
        "whileTap": { "scale": 0.95 }
      }
    },
    "actions": {
      "display": "flex",
      "alignItems": "center",
      "gap": "0.75rem (12px) on mobile, 1rem (16px) on desktop",
      "favoritesButton": {
        "display": "flex",
        "alignItems": "center",
        "gap": "0.5rem (8px)",
        "padding": "0.5rem 0.75rem on mobile, 0.5rem 1rem on desktop",
        "background": "var(--bg-tertiary) with 50% opacity",
        "border": "1px solid rgba(108, 92, 231, 0.2)",
        "borderRadius": "0.5rem (8px)",
        "color": "var(--text-primary)",
        "hover": {
          "background": "var(--bg-tertiary)",
          "borderColor": "rgba(108, 92, 231, 0.5)"
        },
        "animation": {
          "whileHover": { "scale": 1.05, "y": -2 },
          "whileTap": { "scale": 0.95 }
        },
        "icon": {
          "width": "1.25rem (20px)",
          "height": "1.25rem (20px)",
          "color": "var(--accent)"
        },
        "text": {
          "display": "none on mobile, inline on desktop",
          "fontWeight": 500
        }
      },
      "languageSwitcher": {
        "display": "flex",
        "background": "var(--bg-tertiary) with 50% opacity",
        "border": "1px solid rgba(108, 92, 231, 0.2)",
        "borderRadius": "0.5rem (8px)",
        "padding": "0.25rem (4px)"
      },
      "logoutButton": {
        "display": "flex",
        "alignItems": "center",
        "gap": "0.5rem (8px)",
        "padding": "0.5rem 0.75rem on mobile, 0.5rem 1rem on desktop",
        "background": "rgba(239, 68, 68, 0.2)",
        "border": "1px solid rgba(239, 68, 68, 0.5)",
        "borderRadius": "0.5rem (8px)",
        "color": "rgb(252, 165, 165)",
        "hover": {
          "background": "rgba(239, 68, 68, 0.3)",
          "borderColor": "rgba(239, 68, 68, 0.7)"
        },
        "animation": {
          "whileHover": { "scale": 1.05, "y": -2 },
          "whileTap": { "scale": 0.95 }
        },
        "text": {
          "display": "none on mobile, inline on desktop",
          "fontWeight": 500
        }
      }
    }
  }
}
```

---

## ♿ ACCESSIBILITY REQUIREMENTS

```json
{
  "accessibility": {
    "reducedMotion": {
      "mediaQuery": "@media (prefers-reduced-motion: reduce)",
      "rules": {
        "animationDuration": "0.01ms",
        "animationIterationCount": 1,
        "transitionDuration": "0.01ms"
      }
    },
    "keyboardNavigation": {
      "focusVisible": "outline with accent color",
      "tabOrder": "logical flow",
      "skipLinks": "for main content"
    },
    "contrast": {
      "textOnBackground": "WCAG AA compliant",
      "interactiveElements": "clear visual feedback"
    },
    "screenReaders": {
      "ariaLabels": "for all interactive elements",
      "semanticHTML": "proper heading hierarchy",
      "altText": "for all images/icons"
    }
  }
}
```

---

## 🎨 VISUAL STYLE GUIDELINES

### Background
- Animated gradient background with colors: `#0f0f23`, `#1a1a2e`, `#16213e`, `#0f0f23`
- Animation duration: 15s, infinite, ease
- Particle effects overlay (optional, subtle)

### Glass Morphism
- Use `backdrop-blur` for cards and navbar
- Opacity: 80-90% for backgrounds
- Border: subtle accent color with low opacity

### Glow Effects Hierarchy
1. **Small Glow**: For icons, small elements
2. **Medium Glow**: For buttons, cards on hover
3. **Large Glow**: For primary CTAs, selected items
4. **Text Glow**: For headings and important text

### Color Usage Rules
- **Primary Actions**: Use accent gradient (accent → accent-glow)
- **Secondary Actions**: Use bg-tertiary with accent border
- **Destructive Actions**: Use red-500 with opacity
- **Text Hierarchy**: Primary → Secondary → Muted

---

## 📝 NOTES FOR AI DESIGN TOOLS

1. **Structure First**: AI باید ابتدا ساختار layout را درک کند، سپس رنگ‌ها و انیمیشن‌ها را اعمال کند.

2. **Color Consistency**: همیشه از palette تعریف شده استفاده شود. رنگ‌های جدید اضافه نشود.

3. **Animation Timing**: تمام انیمیشن‌ها باید timing مشخص شده را رعایت کنند.

4. **Responsive**: همیشه mobile-first طراحی شود، سپس desktop enhancements اضافه شود.

5. **RTL Support**: برای زبان فارسی، تمام layout باید RTL باشد.

6. **Glow Effects**: Glow effects باید subtle و purposeful باشند، نه overwhelming.

7. **Accessibility**: همیشه reduced motion و contrast را در نظر بگیرید.

---

## 🚀 USAGE INSTRUCTIONS

این پرامپت را می‌توانید برای:
- **Figma AI**: برای ساخت design system و component library
- **Midjourney/DALL-E**: برای ساخت mockups و visual concepts
- **Claude Artifacts**: برای ساخت interactive prototypes
- **تیم توسعه**: به عنوان design specification document

استفاده کنید.

---

**نسخه**: 1.0  
**تاریخ**: 2024  
**پروژه**: Mystery Full - بازی‌های دورهمی

