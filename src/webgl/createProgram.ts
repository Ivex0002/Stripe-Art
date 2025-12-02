export function createProgram(
  gl: WebGLRenderingContext,
  vertexSrc: string,
  fragmentSrc: string
) {
  function compile(type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Failed to create shader");

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      throw new Error("Shader compile failed");
    }

    return shader;
  }

  const vs = compile(gl.VERTEX_SHADER, vertexSrc);
  const fs = compile(gl.FRAGMENT_SHADER, fragmentSrc);

  const program = gl.createProgram();
  if (!program) throw new Error("Failed to create program");

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    throw new Error("Program link failed");
  }

  return program;
}
