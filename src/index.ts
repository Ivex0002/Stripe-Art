import type { DPR, InputImage } from "./type";
import { initGL } from "./webgl/initGL";
import { measureRect } from "./webgl/measureRect";
import { renderStripeArt } from "./webgl/renderStripeArt";

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function validateDPR(value: number): DPR {
  if (value < 1 || value > 4) {
    throw new Error(`dpr must be between 1 and 4 (inclusive). Got: ${value}`);
  }
  return value as DPR;
}

export async function CreateStripeArt({
  target,
  image,
  backColor,
  lineColor,
  lineGap = 15,
  maxLineWidth = 8,
  dpr = 3,
  contrastMidpoint = 0.5,
  contrastStrength = 1.5,
}: {
  target: HTMLElement;
  image: InputImage | string;
  backColor: `#${string}` | (string & {});
  lineColor: `#${string}` | (string & {});
  lineGap?: number;
  maxLineWidth?: number;
  dpr?: number;
  contrastMidpoint?: number;
  contrastStrength?: number;
}): Promise<void> {
  const validatedDpr = validateDPR(dpr ?? 3);

  // console.log(
  //   "[CreateStripeArt] target pre-append rect",
  //   target.getBoundingClientRect(),
  //   "client",
  //   target.clientWidth,
  //   target.clientHeight
  // );

  const canvas = document.createElement("canvas");

  canvas.style.display = "block";
  canvas.style.boxSizing = "border-box";

  target.innerHTML = "";
  target.appendChild(canvas);

  const img = typeof image === "string" ? await loadImage(image) : image;

  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  const { width: cssWidth, height: cssHeight, rect } = measureRect(target);

  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  const gl = canvas.getContext("webgl");
  if (!gl) throw new Error("WebGL initialization failed");

  const { program, imageAspect, effectiveDpr } = initGL(
    target,
    gl,
    img,
    validatedDpr
  );
  renderStripeArt(gl, program, rect, imageAspect, effectiveDpr, {
    backColor,
    lineColor,
    lineGap,
    maxLineWidth,
    contrastMidpoint,
    contrastStrength,
  });

  // console.log(
  //   "[CreateStripeArt] after append - canvas bbox",
  //   canvas.getBoundingClientRect(),
  //   "canvas props",
  //   canvas.width,
  //   canvas.height,
  //   canvas.style.width,
  //   canvas.style.height,
  //   "effectiveDpr",
  //   effectiveDpr
  // );

  if ((window as any).ResizeObserver) {
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        const m = measureRect(target);
        if (m.width <= 1 || m.height <= 1) return;
        canvas.style.width = `${m.width}px`;
        canvas.style.height = `${m.height}px`;
        const newInit = initGL(target, gl, img, validatedDpr);
        renderStripeArt(
          gl,
          newInit.program,
          { width: m.width, height: m.height },
          newInit.imageAspect,
          newInit.effectiveDpr,
          {
            backColor,
            lineColor,
            lineGap,
            maxLineWidth,
            contrastMidpoint,
            contrastStrength,
          }
        );
      });
    });
    ro.observe(target);
  }
}
