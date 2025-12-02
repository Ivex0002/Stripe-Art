export type InputImage =
  | HTMLImageElement
  | HTMLCanvasElement
  | HTMLVideoElement
  | ImageBitmap;

export type DPR = number & { __brand: "DPR" };
