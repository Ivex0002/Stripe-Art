# Stripe Art

A library that converts images into vertical stripe patterns using WebGL. Line thickness varies according to image brightness, creating an abstract representation of the original image's features.

inspired by [montana_engels](https://www.instagram.com/montana_engels)

[example project]()

## Features

- ✨ High-performance rendering based on WebGL

- 🎨 Generates stripes based on image brightness

- 🖼️ Automatic aspect ratio preservation (object-fit: contain)

- 🎯 Contrast control for fine detail expression

- 📱 High-resolution (DPR) support

- 🔄 Smooth transition effects integrated with Framer Motion

## Installation

```bash
npm i stripe-art
```

## Basic Usage

```typescript
import { CreateStripeArt } from "./logic";

CreateStripeArt({
  target: containerRef.current,
  image: "./path/to/image.jpg",
  backColor: "#000000",
  lineColor: "#FFFFFF",
  lineGap: 10,
  maxLineWidth: 8,
  // dpr must be 1~4(optional)
  dpr: 3,
  // brightness contrast(optional)
  contrastMidpoint = 0.5,
  contrastStrength = 1.5,
});
```

## API

### CreateStripeArt(options)

#### Parameters

| Property           | Type                   | Default      | Description                              |
| ------------------ | ---------------------- | ------------ | ---------------------------------------- |
| `target`           | `HTMLElement`          | **Required** | The target DOM element for rendering     |
| `image`            | `string \| InputImage` | **Required** | Image path or image object               |
| `backColor`        | `string`               | **Required** | Background color (hex)                   |
| `lineColor`        | `string`               | **Required** | Line color (hex)                         |
| `lineGap`          | `number`               | `15`         | Gap between lines (pixels)               |
| `maxLineWidth`     | `number`               | `8`          | Maximum line thickness (pixels)          |
| `dpr`              | `number`               | `3`          | Device Pixel Ratio (resolution)          |
| `contrastMidpoint` | `number`               | `0.5`        | Contrast adjustment midpoint (0.0 ~ 1.0) |
| `contrastStrength` | `number`               | `1.5`        | Contrast strength (1.0 = original)       |

## Parameter Guide

### lineGap

- **Range**: 5 ~ 20
- **Effect**: Smaller values result in denser lines and more detail.
- **Recommendation**: 10 ~ 15

### maxLineWidth

- **Range**: 5 ~ 15
- **Effect**: The maximum thickness of lines in bright areas.
- **Recommendation**: 70~80% of `lineGap`

### contrastStrength

- **Range**: 1.0 ~ 3.0
- **Effect**: Higher values increase contrast, making details sharper.
- **Recommendation**: 1.5 ~ 2.5
- **Tip**: Use 2.0 or higher to express fine details like lips or eyes.

### dpr (Device Pixel Ratio)

- **Range**: 1 ~ 4
- **Effect**: Rendering resolution (higher is sharper but may impact performance).
- **Recommendation**:
  - Mobile: 1 ~ 2
  - Desktop: 2 ~ 4

### InputImage Type

```typescript
type InputImage =
  | HTMLImageElement
  | HTMLCanvasElement
  | HTMLVideoElement
  | ImageBitmap;
image: InputImage | string;
```

## Advanced Usage

### React + Framer Motion Integration

[example project](https://github.com/Ivex0002/Stripe-Art-example)

```typescript
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import img1 from "./assets/진주_mimoffllffll.jpg";
import img2 from "./assets/bedbbfa49ec84c7365af2c5431bbcc83.jpg";
import img3 from "./assets/d8bebbd360d5df52dcd8a4aec255452a.jpg";

import { CreateStripeArt } from "stripe-art";

const colors = {
  darkTeal: "#002020",
  white: "#FFFFFF",
  darkRed: "#1a0000",
  gold: "#FFD700",
  darkBlue: "#000033",
  cyan: "#00FFFF",
} as const;

const images = [
  {
    id: "img1",
    src: img1,
    backColor: colors.darkTeal,
    lineColor: colors.white,
    lineGap: 10,
    maxLineWidth: 8,
    contrastMidpoint: 0.5,
    contrastStrength: 1.2,
  },
  {
    id: "img2",
    src: img2,
    backColor: colors.darkRed,
    lineColor: colors.gold,
    lineGap: 12,
    maxLineWidth: 9,
    contrastMidpoint: 0.5,
    contrastStrength: 2.5,
  },
  {
    id: "img3",
    src: img3,
    backColor: colors.darkBlue,
    lineColor: colors.cyan,
    lineGap: 8,
    maxLineWidth: 7,
    contrastMidpoint: 0.5,
    contrastStrength: 1.8,
  },
];

type ImageConfig = (typeof images)[0];

function StripeLayer({ config }: { config: ImageConfig }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    CreateStripeArt({
      target: containerRef.current,
      image: config.src,
      backColor: config.backColor,
      lineColor: config.lineColor,
      lineGap: config.lineGap,
      maxLineWidth: config.maxLineWidth,
      contrastMidpoint: config.contrastMidpoint,
      contrastStrength: config.contrastStrength,
      dpr: 4,
    });
  }, [config]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
      }}
    />
  );
}

export function Background() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: "0",
        width: "1950px",
        height: "930px",
        backgroundColor: "#000000",
      }}
    >
      <AnimatePresence mode="sync">
        <StripeLayer
          key={images[currentIndex].id}
          config={images[currentIndex]}
        />
      </AnimatePresence>
    </div>
  );
}
```

## Browser Support

Works on all modern browsers that support WebGL:

- Chrome 9+
- Firefox 4+
- Safari 5.1+
- Edge (All versions)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contribute

Issues and PRs are welcome!
