import type { InputImage } from "../type";
import vertexShaderSource from "../shader/vertex.vert";
import fragmentShaderSource from "../shader/fragment.frag";
import { createProgram } from "./createProgram";
import { measureRect } from "./measureRect";

function getImageSize(img: InputImage): { width: number; height: number } {
  if ("videoWidth" in img && img.videoWidth)
    return { width: img.videoWidth, height: img.videoHeight };
  if ("width" in img && "height" in img)
    return {
      width: (img as InputImage).width,
      height: (img as InputImage).height,
    };
  return { width: 0, height: 0 };
}

export function initGL(
  target: HTMLElement,
  gl: WebGLRenderingContext,
  img: InputImage,
  requestedDpr: number,
): { program: WebGLProgram; imageAspect: number; effectiveDpr: number } {
  const canvas = gl.canvas as HTMLCanvasElement;

  const { width: cssWidth, height: cssHeight, rect } = measureRect(target);

  const { width: imgW, height: imgH } = getImageSize(img);
  if (imgW === 0 || imgH === 0)
    throw new Error("이미지의 너비/높이를 가져올 수 없습니다.");

  const imageAspect = imgW / imgH;

  // 하드웨어/드라이버 한계 계산
  const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
  const maxViewport = gl.getParameter(gl.MAX_VIEWPORT_DIMS) as Int32Array;
  const maxViewportWidth = maxViewport ? maxViewport[0] : maxTex;
  const maxViewportHeight = maxViewport ? maxViewport[1] : maxTex;

  // 각 방향에서 허용되는 최대 dpr
  const maxDprByWidth = Math.floor(maxTex / Math.max(1, rect.width));
  const maxDprByHeight = Math.floor(maxTex / Math.max(1, rect.height));
  const maxDprByViewportW = Math.floor(
    maxViewportWidth / Math.max(1, rect.width),
  );
  const maxDprByViewportH = Math.floor(
    maxViewportHeight / Math.max(1, rect.height),
  );

  let effectiveDpr = Math.max(
    1,
    Math.min(
      requestedDpr,
      maxDprByWidth || requestedDpr,
      maxDprByHeight || requestedDpr,
      maxDprByViewportW || requestedDpr,
      maxDprByViewportH || requestedDpr,
    ),
  );

  if (effectiveDpr < requestedDpr) {
    console.warn(
      `[CreateStripeArt] requested dpr=${requestedDpr} reduced to effectiveDpr=${effectiveDpr} (MAX_TEXTURE_SIZE=${maxTex}, MAX_VIEWPORT_DIMS=[${maxViewportWidth},${maxViewportHeight}])`,
    );
  }

  canvas.width = Math.floor(cssWidth * effectiveDpr);
  canvas.height = Math.floor(cssHeight * effectiveDpr);

  gl.viewport(0, 0, canvas.width, canvas.height);

  // console.log(
  //   "[initGL] canvas backing",
  //   canvas.width,
  //   canvas.height,
  //   "maxTex",
  //   maxTex,
  //   "maxViewport",
  //   maxViewportWidth,
  //   maxViewportHeight
  // );

  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  gl.useProgram(program);

  const quad = new Float32Array([
    -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, -1, 1, 0, 1, 1, -1, 1, 0, 1, 1, 1,
    1,
  ]);

  const buffer = gl.createBuffer();
  if (!buffer) throw new Error("버퍼 생성 실패");
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

  const FSIZE = quad.BYTES_PER_ELEMENT;

  const a_position = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(a_position);
  gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, FSIZE * 4, 0);

  const a_uv = gl.getAttribLocation(program, "a_uv");
  gl.enableVertexAttribArray(a_uv);
  gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);

  const texture = gl.createTexture();
  if (!texture) throw new Error("텍스처 생성 실패");
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  return { program, imageAspect, effectiveDpr };
}
