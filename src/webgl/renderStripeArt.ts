export function renderStripeArt(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  rect: { width: number; height: number },
  imageAspect: number,
  dpr: number,
  params: {
    lineGap: number;
    maxLineWidth: number;
    backColor: string;
    lineColor: string;
    contrastMidpoint: number;
    contrastStrength: number;
  }
) {
  const toRGB = (hex: string) => {
    const bigint = parseInt(hex.replace("#", ""), 16);
    return [
      ((bigint >> 16) & 255) / 255,
      ((bigint >> 8) & 255) / 255,
      (bigint & 255) / 255,
    ];
  };

  const uniform = createUniformSetter(gl, program);

  const canvasWidth = gl.canvas.width;
  const canvasHeight = gl.canvas.height;
  const canvasAspect = canvasWidth / canvasHeight;

  const imageWidth = Math.floor(
    imageAspect > canvasAspect ? canvasWidth : canvasHeight * imageAspect
  );
  const imageHeight = Math.floor(
    imageAspect > canvasAspect ? canvasWidth / imageAspect : canvasHeight
  );

  // console.log(
  //   "[renderStripeArt] canvas dims",
  //   canvasWidth,
  //   canvasHeight,
  //   "aspect",
  //   canvasAspect,
  //   "rect",
  //   rect.width,
  //   rect.height,
  //   "dpr",
  //   dpr
  // );
  // console.log(
  //   "[renderStripeArt] image dims",
  //   imageWidth,
  //   imageHeight,
  //   "input imageAspect",
  //   imageAspect
  // );

  uniform.set3fv("u_backColor", toRGB(params.backColor));
  uniform.set3fv("u_lineColor", toRGB(params.lineColor));
  uniform.set2f("u_resolution", canvasWidth, canvasHeight);
  uniform.set2f("u_imageArea", imageWidth, imageHeight);
  uniform.set1f("u_lineGap", params.lineGap * dpr);
  uniform.set1f("u_maxLineWidth", params.maxLineWidth * dpr);
  uniform.set1f("u_contrastMidpoint", params.contrastMidpoint);
  uniform.set1f("u_contrastStrength", params.contrastStrength);

  // console.log(
  //   "[renderStripeArt] uniforms",
  //   "u_resolution",
  //   [canvasWidth, canvasHeight],
  //   "u_imageArea",
  //   [imageWidth, imageHeight],
  //   "u_lineGap",
  //   params.lineGap * dpr,
  //   "u_maxLineWidth",
  //   params.maxLineWidth * dpr
  // );

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function createUniformSetter(gl: WebGLRenderingContext, program: WebGLProgram) {
  return {
    set1f: (name: string, value: number) => {
      gl.uniform1f(gl.getUniformLocation(program, name), value);
    },
    set2f: (name: string, x: number, y: number) => {
      gl.uniform2f(gl.getUniformLocation(program, name), x, y);
    },
    set3fv: (name: string, value: number[]) => {
      gl.uniform3fv(gl.getUniformLocation(program, name), value);
    },
  };
}
