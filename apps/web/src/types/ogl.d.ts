declare module 'ogl' {
  export class Renderer {
    constructor(options?: Record<string, unknown>);
    gl: WebGLRenderingContext;
    setSize(width: number, height: number): void;
    render(options: { scene: Mesh }): void;
  }

  export class Triangle {
    constructor(gl: WebGLRenderingContext);
  }

  export class Program {
    constructor(gl: WebGLRenderingContext, options: Record<string, unknown>);
    uniforms: Record<string, { value: unknown }>;
  }

  export class Mesh {
    constructor(gl: WebGLRenderingContext, options: Record<string, unknown>);
  }
}
