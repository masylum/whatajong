/**
 * Stolen and modified from https://github.com/michaelbrusegard/WebGL-Fluid-Enhanced
 *
 * Removed mouse tracking, sunrays, bloom filters and shading.
 */
type RGBColor = {
  r: number
  g: number
  b: number
}

type FBO = {
  texture: WebGLTexture | null
  fbo: WebGLFramebuffer | null
  width: number
  height: number
  texelSizeX: number
  texelSizeY: number
  attach: (id: number) => number
}

type DoubleFBO = {
  width: number
  height: number
  texelSizeX: number
  texelSizeY: number
  read: FBO
  write: FBO
  swap: () => void
}

type ExtraContext = {
  formatRGBA: { internalFormat: number; format: number }
  formatRG: { internalFormat: number; format: number }
  formatR: { internalFormat: number; format: number }
  halfFloatTexType: number
  supportLinearFiltering: OES_texture_float_linear
}

const defaultConfig = {
  simResolution: 64,
  dyeResolution: 512,
  densityDissipation: 2.5,
  velocityDissipation: 1,
  pressure: 0.6,
  pressureIterations: 5,
  curl: 20,
  splatRadius: 15,
  color: { r: 0.2, g: 0.2, b: 0.2 },
}

export class WebGLFluidEnhanced {
  private container: HTMLElement
  private simulation: Simulation

  constructor(container: HTMLElement = document.body) {
    this.container = container
    this.container.style.outline = "none"
    this.container.style.position = "relative"
    this.container.style.display = "flex"
    this.container.style.justifyContent = "center"
    this.container.style.alignItems = "center"

    this.simulation = new Simulation(container)
  }

  public start() {
    if (this.simulation.hasStarted) return
    this.simulation.start()
  }

  public stop() {
    if (!this.simulation.hasStarted) return
    this.simulation.stop()
  }

  public setPause(value: boolean) {
    if (!this.simulation.hasStarted) return
    this.simulation.paused = value
  }

  public splatAtLocation(x: number, y: number, dx: number, dy: number) {
    if (!this.simulation.hasStarted) return

    const normalizedX = x / this.simulation.canvas.width
    const normalizedY = 1.0 - y / this.simulation.canvas.clientHeight
    const color = defaultConfig.color

    this.simulation.splat(normalizedX, normalizedY, dx, dy, {
      r: color.r * 10,
      g: color.g * 10,
      b: color.b * 10,
    })
  }
}

class Simulation {
  public hasStarted = false
  public simResolution = defaultConfig.simResolution
  public dyeResolution = defaultConfig.dyeResolution
  public densityDissipation = defaultConfig.densityDissipation
  public velocityDissipation = defaultConfig.velocityDissipation
  public pressure = defaultConfig.pressure
  public pressureIterations = defaultConfig.pressureIterations
  public curl = defaultConfig.curl
  public splatRadius = defaultConfig.splatRadius
  public paused = false
  public canvas: HTMLCanvasElement
  private gl: WebGL2RenderingContext
  private ext: ExtraContext
  private programs: Programs
  private displayMaterial: Material
  private lastUpdateTime: number = Date.now()
  private lastResizeTime = 0
  private _dye!: DoubleFBO
  private _velocity!: DoubleFBO
  private _divergence!: FBO
  private _curl!: FBO
  private _pressure!: DoubleFBO
  private animationFrameId!: number

  constructor(container: HTMLElement) {
    let canvas = container.querySelector("canvas")
    if (!canvas) {
      canvas = document.createElement("canvas")
      container.appendChild(canvas)
    }
    this.canvas = canvas
    this.canvas.style.width = "100%"
    this.canvas.style.height = "100%"
    this.resizeCanvas()

    const { gl, ext } = this.getWebGLContext()
    this.gl = gl
    this.ext = ext

    const shaders = new Shaders(this.gl, this.ext)

    this.blitInit()

    this.programs = new Programs(this.gl, shaders)

    this.displayMaterial = new Material(
      shaders.baseVertexShader,
      shaders.displayShaderSource,
      this.gl,
    )

    this.update = this.update.bind(this)
  }

  public start() {
    this.displayMaterial.init()
    this.initFramebuffers()

    this.update()

    this.hasStarted = true
  }

  public stop() {
    cancelAnimationFrame(this.animationFrameId)

    this.hasStarted = false
  }

  private scaleByPixelRatio(input: number): number {
    const pixelRatio = window.devicePixelRatio || 1
    return Math.floor(input * pixelRatio)
  }

  private resizeCanvas(): boolean {
    const now = performance.now()
    if (now - this.lastResizeTime < 200) {
      return false // Skip this resize check
    }

    const width = this.scaleByPixelRatio(this.canvas.clientWidth)
    const height = this.scaleByPixelRatio(this.canvas.clientHeight)

    this.canvas.width = width
    this.canvas.height = height
    this.lastResizeTime = now
    return true
  }

  private supportRenderTextureFormat(
    gl: WebGL2RenderingContext,
    internalFormat: number,
    format: number,
    type: number,
  ): boolean {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null)

    const fbo = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0,
    )

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
    return status === gl.FRAMEBUFFER_COMPLETE
  }

  private getSupportedFormat(
    gl: WebGL2RenderingContext,
    internalFormat: number,
    format: number,
    type: number,
  ): { internalFormat: number; format: number } | null {
    if (!this.supportRenderTextureFormat(gl, internalFormat, format, type)) {
      switch (internalFormat) {
        case gl.R16F:
          return this.getSupportedFormat(gl, gl.RG16F, gl.RG, type)
        case gl.RG16F:
          return this.getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type)
        default:
          return null
      }
    }

    return {
      internalFormat,
      format,
    }
  }

  private getWebGLContext(): { gl: WebGL2RenderingContext; ext: ExtraContext } {
    const params = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    }

    let gl = this.canvas.getContext("webgl2", params) as WebGL2RenderingContext
    const isWebGL2 = !!gl
    if (!isWebGL2)
      gl =
        (this.canvas.getContext("webgl", params) as WebGL2RenderingContext) ??
        (this.canvas.getContext(
          "experimental-webgl",
          params,
        ) as WebGLRenderingContext)

    let halfFloat
    let supportLinearFiltering
    if (isWebGL2) {
      gl.getExtension("EXT_color_buffer_float")
      supportLinearFiltering = gl.getExtension("OES_texture_float_linear")!
    } else {
      halfFloat = gl.getExtension("OES_texture_half_float")
      supportLinearFiltering = gl.getExtension("OES_texture_half_float_linear")!
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0)

    const halfFloatTexType = isWebGL2
      ? gl.HALF_FLOAT
      : halfFloat
        ? halfFloat.HALF_FLOAT_OES
        : 0
    let formatRGBA
    let formatRG
    let formatR

    if (isWebGL2) {
      formatRGBA = this.getSupportedFormat(
        gl,
        gl.RGBA16F,
        gl.RGBA,
        halfFloatTexType,
      )!
      formatRG = this.getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType)!
      formatR = this.getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType)!
    } else {
      formatRGBA = this.getSupportedFormat(
        gl,
        gl.RGBA,
        gl.RGBA,
        halfFloatTexType,
      )!
      formatRG = this.getSupportedFormat(
        gl,
        gl.RGBA,
        gl.RGBA,
        halfFloatTexType,
      )!
      formatR = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType)!
    }

    return {
      gl,
      ext: {
        formatRGBA,
        formatRG,
        formatR,
        halfFloatTexType,
        supportLinearFiltering,
      },
    }
  }

  public initFramebuffers() {
    const simRes = this.getResolution(this.simResolution)
    const dyeRes = this.getResolution(this.dyeResolution)

    const texType = this.ext.halfFloatTexType
    const rgba = this.ext.formatRGBA
    const rg = this.ext.formatRG
    const r = this.ext.formatR
    const filtering = this.ext.supportLinearFiltering
      ? this.gl.LINEAR
      : this.gl.NEAREST

    this.gl.disable(this.gl.BLEND)

    if (!this._dye)
      this._dye = this.createDoubleFBO(
        dyeRes.width,
        dyeRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering,
      )
    else
      this._dye = this.resizeDoubleFBO(
        this._dye,
        dyeRes.width,
        dyeRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering,
      )

    if (!this._velocity)
      this._velocity = this.createDoubleFBO(
        simRes.width,
        simRes.height,
        rg.internalFormat,
        rg.format,
        texType,
        filtering,
      )
    else
      this._velocity = this.resizeDoubleFBO(
        this._velocity,
        simRes.width,
        simRes.height,
        rg.internalFormat,
        rg.format,
        texType,
        filtering,
      )

    this._divergence = this.createFBO(
      simRes.width,
      simRes.height,
      r.internalFormat,
      r.format,
      texType,
      this.gl.NEAREST,
    )
    this._curl = this.createFBO(
      simRes.width,
      simRes.height,
      r.internalFormat,
      r.format,
      texType,
      this.gl.NEAREST,
    )
    this._pressure = this.createDoubleFBO(
      simRes.width,
      simRes.height,
      r.internalFormat,
      r.format,
      texType,
      this.gl.NEAREST,
    )
  }

  private getResolution(resolution: number): {
    width: number
    height: number
  } {
    let aspectRatio = this.gl.drawingBufferWidth / this.gl.drawingBufferHeight
    if (aspectRatio < 1) {
      aspectRatio = 1.0 / aspectRatio
    }

    const min = Math.round(resolution)
    const max = Math.round(resolution * aspectRatio)

    if (this.gl.drawingBufferWidth > this.gl.drawingBufferHeight)
      return { width: max, height: min }

    return { width: min, height: max }
  }

  private createDoubleFBO(
    w: number,
    h: number,
    internalFormat: number,
    format: number,
    type: number,
    param: number,
  ): DoubleFBO {
    let fbo1 = this.createFBO(w, h, internalFormat, format, type, param)
    let fbo2 = this.createFBO(w, h, internalFormat, format, type, param)

    return {
      width: w,
      height: h,
      texelSizeX: fbo1.texelSizeX,
      texelSizeY: fbo1.texelSizeY,
      get read() {
        return fbo1
      },
      set read(value) {
        fbo1 = value
      },
      get write() {
        return fbo2
      },
      set write(value) {
        fbo2 = value
      },
      swap() {
        const temp = fbo1
        fbo1 = fbo2
        fbo2 = temp
      },
    }
  }

  private resizeFBO(
    target: FBO,
    w: number,
    h: number,
    internalFormat: number,
    format: number,
    type: number,
    param: number,
  ): FBO {
    const newFBO = this.createFBO(w, h, internalFormat, format, type, param)
    this.programs.copyProgram.bind()
    this.gl.uniform1i(
      this.programs.copyProgram.uniforms.uTexture!,
      target.attach(0),
    )
    this.blit(newFBO)
    return newFBO
  }

  private resizeDoubleFBO(
    target: DoubleFBO,
    w: number,
    h: number,
    internalFormat: number,
    format: number,
    type: number,
    param: number,
  ): DoubleFBO {
    if (target.width === w && target.height === h) return target
    target.read = this.resizeFBO(
      target.read,
      w,
      h,
      internalFormat,
      format,
      type,
      param,
    )
    target.write = this.createFBO(w, h, internalFormat, format, type, param)
    target.width = w
    target.height = h
    target.texelSizeX = 1.0 / w
    target.texelSizeY = 1.0 / h
    return target
  }

  private createFBO(
    w: number,
    h: number,
    internalFormat: number,
    format: number,
    type: number,
    param: number,
  ): FBO {
    this.gl.activeTexture(this.gl.TEXTURE0)
    const texture = this.gl.createTexture()
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, param)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, param)
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE,
    )
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE,
    )
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      internalFormat,
      w,
      h,
      0,
      format,
      type,
      null,
    )

    const fbo: WebGLFramebuffer | null = this.gl.createFramebuffer()
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbo)
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      texture,
      0,
    )
    this.gl.viewport(0, 0, w, h)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)

    const texelSizeX = 1.0 / w
    const texelSizeY = 1.0 / h

    const gl = this.gl
    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX,
      texelSizeY,
      attach(id) {
        gl.activeTexture(gl.TEXTURE0 + id)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        return id
      },
    }
  }

  private blitInit() {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer())
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      this.gl.STATIC_DRAW,
    )
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.gl.createBuffer())
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array([0, 1, 2, 0, 2, 3]),
      this.gl.STATIC_DRAW,
    )
    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0)
    this.gl.enableVertexAttribArray(0)
  }

  private blit(target: FBO | null, clear = false) {
    if (target === null) {
      this.gl.viewport(
        0,
        0,
        this.gl.drawingBufferWidth,
        this.gl.drawingBufferHeight,
      )
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
    } else {
      this.gl.viewport(0, 0, target.width, target.height)
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, target.fbo)
    }
    if (clear) {
      this.gl.clearColor(0.0, 0.0, 0.0, 1.0)
      this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    }
    this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0)
  }

  public splat(x: number, y: number, dx: number, dy: number, color: RGBColor) {
    this.programs.splatProgram.bind()
    this.gl.uniform1i(
      this.programs.splatProgram.uniforms.uTarget!,
      this._velocity.read.attach(0),
    )
    this.gl.uniform1f(
      this.programs.splatProgram.uniforms.aspectRatio!,
      this.canvas.width / this.canvas.height,
    )
    this.gl.uniform2f(this.programs.splatProgram.uniforms.point!, x, y)
    this.gl.uniform3f(this.programs.splatProgram.uniforms.color!, dx, dy, 0.0)
    this.gl.uniform1f(
      this.programs.splatProgram.uniforms.radius!,
      this.correctRadius(this.splatRadius / 100.0),
    )
    this.blit(this._velocity.write)
    this._velocity.swap()

    this.gl.uniform1i(
      this.programs.splatProgram.uniforms.uTarget!,
      this._dye.read.attach(0),
    )
    this.gl.uniform3f(
      this.programs.splatProgram.uniforms.color!,
      color.r,
      color.g,
      color.b,
    )
    this.blit(this._dye.write)
    this._dye.swap()
  }

  private correctRadius(radius: number): number {
    const aspectRatio = this.canvas.width / this.canvas.height
    if (aspectRatio > 1) {
      return radius * aspectRatio
    }
    return radius
  }

  private update() {
    const dt = this.calcDeltaTime()
    if (this.resizeCanvas()) this.initFramebuffers()

    if (!this.paused) this.step(dt)

    this.render(null)

    // This is bound in the constructor, so it's safe to call here
    // eslint-disable-next-line
    this.animationFrameId = requestAnimationFrame(this.update)
  }

  private calcDeltaTime(): number {
    const now = Date.now()
    let dt = (now - this.lastUpdateTime) / 1000
    dt = Math.min(dt, 0.016666)
    this.lastUpdateTime = now
    return dt
  }

  private step(dt: number) {
    this.gl.disable(this.gl.BLEND)

    this.programs.curlProgram.bind()
    this.gl.uniform2f(
      this.programs.curlProgram.uniforms.texelSize!,
      this._velocity.texelSizeX,
      this._velocity.texelSizeY,
    )
    this.gl.uniform1i(
      this.programs.curlProgram.uniforms.uVelocity!,
      this._velocity.read.attach(0),
    )
    this.blit(this._curl)

    this.programs.vorticityProgram.bind()
    this.gl.uniform2f(
      this.programs.vorticityProgram.uniforms.texelSize!,
      this._velocity.texelSizeX,
      this._velocity.texelSizeY,
    )
    this.gl.uniform1i(
      this.programs.vorticityProgram.uniforms.uVelocity!,
      this._velocity.read.attach(0),
    )
    this.gl.uniform1i(
      this.programs.vorticityProgram.uniforms.uCurl!,
      this._curl.attach(1),
    )
    this.gl.uniform1f(this.programs.vorticityProgram.uniforms.curl!, this.curl)
    this.gl.uniform1f(this.programs.vorticityProgram.uniforms.dt!, dt)
    this.blit(this._velocity.write)
    this._velocity.swap()

    this.programs.divergenceProgram.bind()
    this.gl.uniform2f(
      this.programs.divergenceProgram.uniforms.texelSize!,
      this._velocity.texelSizeX,
      this._velocity.texelSizeY,
    )
    this.gl.uniform1i(
      this.programs.divergenceProgram.uniforms.uVelocity!,
      this._velocity.read.attach(0),
    )
    this.blit(this._divergence)

    this.programs.clearProgram.bind()
    this.gl.uniform1i(
      this.programs.clearProgram.uniforms.uTexture!,
      this._pressure.read.attach(0),
    )
    this.gl.uniform1f(this.programs.clearProgram.uniforms.value!, this.pressure)
    this.blit(this._pressure.write)
    this._pressure.swap()

    this.programs.pressureProgram.bind()
    this.gl.uniform2f(
      this.programs.pressureProgram.uniforms.texelSize!,
      this._velocity.texelSizeX,
      this._velocity.texelSizeY,
    )
    this.gl.uniform1i(
      this.programs.pressureProgram.uniforms.uDivergence!,
      this._divergence.attach(0),
    )
    for (let i = 0; i < this.pressureIterations; i++) {
      this.gl.uniform1i(
        this.programs.pressureProgram.uniforms.uPressure!,
        this._pressure.read.attach(1),
      )
      this.blit(this._pressure.write)
      this._pressure.swap()
    }

    this.programs.gradienSubtractProgram.bind()
    this.gl.uniform2f(
      this.programs.gradienSubtractProgram.uniforms.texelSize!,
      this._velocity.texelSizeX,
      this._velocity.texelSizeY,
    )
    this.gl.uniform1i(
      this.programs.gradienSubtractProgram.uniforms.uPressure!,
      this._pressure.read.attach(0),
    )
    this.gl.uniform1i(
      this.programs.gradienSubtractProgram.uniforms.uVelocity!,
      this._velocity.read.attach(1),
    )
    this.blit(this._velocity.write)
    this._velocity.swap()

    this.programs.advectionProgram.bind()
    this.gl.uniform2f(
      this.programs.advectionProgram.uniforms.texelSize!,
      this._velocity.texelSizeX,
      this._velocity.texelSizeY,
    )
    if (!this.ext.supportLinearFiltering)
      this.gl.uniform2f(
        this.programs.advectionProgram.uniforms.dyeTexelSize!,
        this._velocity.texelSizeX,
        this._velocity.texelSizeY,
      )
    const velocityId = this._velocity.read.attach(0)
    this.gl.uniform1i(
      this.programs.advectionProgram.uniforms.uVelocity!,
      velocityId,
    )
    this.gl.uniform1i(
      this.programs.advectionProgram.uniforms.uSource!,
      velocityId,
    )
    this.gl.uniform1f(this.programs.advectionProgram.uniforms.dt!, dt)
    this.gl.uniform1f(
      this.programs.advectionProgram.uniforms.dissipation!,
      this.velocityDissipation,
    )
    this.blit(this._velocity.write)
    this._velocity.swap()

    if (!this.ext.supportLinearFiltering)
      this.gl.uniform2f(
        this.programs.advectionProgram.uniforms.dyeTexelSize!,
        this._dye.texelSizeX,
        this._dye.texelSizeY,
      )
    this.gl.uniform1i(
      this.programs.advectionProgram.uniforms.uVelocity!,
      this._velocity.read.attach(0),
    )
    this.gl.uniform1i(
      this.programs.advectionProgram.uniforms.uSource!,
      this._dye.read.attach(1),
    )
    this.gl.uniform1f(
      this.programs.advectionProgram.uniforms.dissipation!,
      this.densityDissipation,
    )
    this.blit(this._dye.write)
    this._dye.swap()
  }

  private render(target: FBO | null) {
    if (target === null) {
      this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA)
      this.gl.enable(this.gl.BLEND)
    } else {
      this.gl.disable(this.gl.BLEND)
    }

    this.drawDisplay(target)
  }

  private drawDisplay(target: FBO | null) {
    this.displayMaterial.bind()
    this.gl.uniform1i(
      this.displayMaterial.uniforms.uTexture!,
      this._dye.read.attach(0),
    )
    this.blit(target)
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
class Shader {
  public static getUniforms(
    program: WebGLProgram,
    gl: WebGL2RenderingContext,
  ): Record<string, WebGLUniformLocation> {
    const uniforms: Record<string, WebGLUniformLocation> = {}
    const uniformCount = gl.getProgramParameter(
      program,
      gl.ACTIVE_UNIFORMS,
    ) as number
    for (let i = 0; i < uniformCount; i++) {
      const uniformName = gl.getActiveUniform(program, i)!.name
      uniforms[uniformName] = gl.getUniformLocation(program, uniformName)!
    }
    return uniforms
  }

  public static createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
    gl: WebGL2RenderingContext,
  ): WebGLProgram {
    const program = gl.createProgram()!
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      console.trace(gl.getProgramInfoLog(program))

    return program
  }

  public static compileShader(
    gl: WebGL2RenderingContext,
    type: GLenum,
    source: string,
    keywords?: string[] | null,
  ): WebGLShader | null {
    const newSource = Shader.addKeywords(source, keywords)

    const shader = gl.createShader(type)!
    gl.shaderSource(shader, newSource)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.trace(gl.getShaderInfoLog(shader))
      return null
    }

    return shader
  }

  private static addKeywords(
    source: string,
    keywords?: string[] | null,
  ): string {
    if (keywords == null) return source
    let keywordsString = ""
    for (const keyword of keywords) {
      keywordsString += `#define ${keyword}\n`
    }
    return keywordsString + source
  }
}

class Program {
  public gl: WebGL2RenderingContext
  public program: WebGLProgram
  public uniforms: Record<string, WebGLUniformLocation>

  constructor(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
    gl: WebGL2RenderingContext,
  ) {
    this.gl = gl
    this.uniforms = {}
    this.program = Shader.createProgram(vertexShader, fragmentShader, gl)
    this.uniforms = Shader.getUniforms(this.program, gl)
  }

  public bind() {
    this.gl.useProgram(this.program)
  }
}

class Programs {
  public copyProgram: Program
  public clearProgram: Program
  public splatProgram: Program
  public advectionProgram: Program
  public divergenceProgram: Program
  public curlProgram: Program
  public vorticityProgram: Program
  public pressureProgram: Program
  public gradienSubtractProgram: Program

  constructor(gl: WebGL2RenderingContext, shaders: Shaders) {
    this.copyProgram = new Program(
      shaders.baseVertexShader,
      shaders.copyShader,
      gl,
    )

    this.clearProgram = new Program(
      shaders.baseVertexShader,
      shaders.clearShader,
      gl,
    )

    this.splatProgram = new Program(
      shaders.baseVertexShader,
      shaders.splatShader,
      gl,
    )

    this.advectionProgram = new Program(
      shaders.baseVertexShader,
      shaders.advectionShader,
      gl,
    )

    this.divergenceProgram = new Program(
      shaders.baseVertexShader,
      shaders.divergenceShader,
      gl,
    )

    this.curlProgram = new Program(
      shaders.baseVertexShader,
      shaders.curlShader,
      gl,
    )

    this.vorticityProgram = new Program(
      shaders.baseVertexShader,
      shaders.vorticityShader,
      gl,
    )

    this.pressureProgram = new Program(
      shaders.baseVertexShader,
      shaders.pressureShader,
      gl,
    )

    this.gradienSubtractProgram = new Program(
      shaders.baseVertexShader,
      shaders.gradientSubtractShader,
      gl,
    )
  }
}

class Shaders {
  public displayShaderSource: string
  public baseVertexShader: WebGLShader
  public copyShader: WebGLShader
  public clearShader: WebGLShader
  public splatShader: WebGLShader
  public advectionShader: WebGLShader
  public divergenceShader: WebGLShader
  public curlShader: WebGLShader
  public vorticityShader: WebGLShader
  public pressureShader: WebGLShader
  public gradientSubtractShader: WebGLShader

  constructor(gl: WebGL2RenderingContext, ext: ExtraContext) {
    this.displayShaderSource = `
      precision highp float;
      precision highp sampler2D;
  
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      uniform vec2 texelSize;
  
      vec3 linearToGamma (vec3 color) {
      color = max(color, vec3(0));
      return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
      }
  
      void main () {
      vec3 c = texture2D(uTexture, vUv).rgb;
  
      float a = max(c.r, max(c.g, c.b));
      gl_FragColor = vec4(c, a);
      }
      `

    this.baseVertexShader = Shader.compileShader(
      gl,
      gl.VERTEX_SHADER,
      `
      precision highp float;
  
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;
  
      void main () {
          vUv = aPosition * 0.5 + 0.5;
          vL = vUv - vec2(texelSize.x, 0.0);
          vR = vUv + vec2(texelSize.x, 0.0);
          vT = vUv + vec2(0.0, texelSize.y);
          vB = vUv - vec2(0.0, texelSize.y);
          gl_Position = vec4(aPosition, 0.0, 1.0);
      }
  `,
    )!

    this.copyShader = Shader.compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      precision mediump sampler2D;
  
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
  
      void main () {
          gl_FragColor = texture2D(uTexture, vUv);
      }
  `,
    )!

    this.clearShader = Shader.compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      precision mediump sampler2D;
  
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;
  
      void main () {
          gl_FragColor = value * texture2D(uTexture, vUv);
      }
  `,
    )!

    this.splatShader = Shader.compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
      precision highp float;
      precision highp sampler2D;
  
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;
  
      void main () {
          vec2 p = vUv - point.xy;
          p.x *= aspectRatio;
          vec3 splat = exp(-dot(p, p) / radius) * color;
          vec3 base = texture2D(uTarget, vUv).xyz;
          gl_FragColor = vec4(base + splat, 1.0);
      }
  `,
    )!

    this.advectionShader = Shader.compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
      precision highp float;
      precision highp sampler2D;
  
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform vec2 dyeTexelSize;
      uniform float dt;
      uniform float dissipation;
  
      vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
          vec2 st = uv / tsize - 0.5;
  
          vec2 iuv = floor(st);
          vec2 fuv = fract(st);
  
          vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
          vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
          vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
          vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
  
          return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }
  
      void main () {
      #ifdef MANUAL_FILTERING
          vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
          vec4 result = bilerp(uSource, coord, dyeTexelSize);
      #else
          vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
          vec4 result = texture2D(uSource, coord);
      #endif
          float decay = 1.0 + dissipation * dt;
          gl_FragColor = result / decay;
      }`,
      ext.supportLinearFiltering ? null : ["MANUAL_FILTERING"],
    )!

    this.divergenceShader = Shader.compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      precision mediump sampler2D;
  
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;
  
      void main () {
          float L = texture2D(uVelocity, vL).x;
          float R = texture2D(uVelocity, vR).x;
          float T = texture2D(uVelocity, vT).y;
          float B = texture2D(uVelocity, vB).y;
  
          vec2 C = texture2D(uVelocity, vUv).xy;
          if (vL.x < 0.0) { L = -C.x; }
          if (vR.x > 1.0) { R = -C.x; }
          if (vT.y > 1.0) { T = -C.y; }
          if (vB.y < 0.0) { B = -C.y; }
  
          float div = 0.5 * (R - L + T - B);
          gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
  `,
    )!

    this.curlShader = Shader.compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      precision mediump sampler2D;
  
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;
  
      void main () {
          float L = texture2D(uVelocity, vL).y;
          float R = texture2D(uVelocity, vR).y;
          float T = texture2D(uVelocity, vT).x;
          float B = texture2D(uVelocity, vB).x;
          float vorticity = R - L - T + B;
          gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
  `,
    )!

    this.vorticityShader = Shader.compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
      precision highp float;
      precision highp sampler2D;
  
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;
  
      void main () {
          float L = texture2D(uCurl, vL).x;
          float R = texture2D(uCurl, vR).x;
          float T = texture2D(uCurl, vT).x;
          float B = texture2D(uCurl, vB).x;
          float C = texture2D(uCurl, vUv).x;
  
          vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
          force /= length(force) + 0.0001;
          force *= curl * C;
          force.y *= -1.0;
  
          vec2 velocity = texture2D(uVelocity, vUv).xy;
          velocity += force * dt;
          velocity = min(max(velocity, -1000.0), 1000.0);
          gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
  `,
    )!

    this.pressureShader = Shader.compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      precision mediump sampler2D;
  
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
  
      void main () {
          float L = texture2D(uPressure, vL).x;
          float R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).x;
          float B = texture2D(uPressure, vB).x;
          float C = texture2D(uPressure, vUv).x;
          float divergence = texture2D(uDivergence, vUv).x;
          float pressure = (L + R + B + T - divergence) * 0.25;
          gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
  `,
    )!

    this.gradientSubtractShader = Shader.compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      precision mediump sampler2D;
  
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
  
      void main () {
          float L = texture2D(uPressure, vL).x;
          float R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).x;
          float B = texture2D(uPressure, vB).x;
          vec2 velocity = texture2D(uVelocity, vUv).xy;
          velocity.xy -= vec2(R - L, T - B);
          gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
  `,
    )!
  }
}

class Material {
  public gl: WebGL2RenderingContext
  public vertexShader: WebGLShader
  public fragmentShaderSource: string
  public programs: WebGLProgram[]
  public activeProgram: WebGLProgram | null
  public uniforms: Record<string, WebGLUniformLocation>

  constructor(
    vertexShader: WebGLShader,
    fragmentShaderSource: string,
    gl: WebGL2RenderingContext,
  ) {
    this.gl = gl
    this.vertexShader = vertexShader
    this.fragmentShaderSource = fragmentShaderSource
    this.programs = []
    this.activeProgram = null
    this.uniforms = {}
  }

  public init() {
    const fragmentShader = Shader.compileShader(
      this.gl,
      this.gl.FRAGMENT_SHADER,
      this.fragmentShaderSource,
      [],
    )!

    this.activeProgram = Shader.createProgram(
      this.vertexShader,
      fragmentShader,
      this.gl,
    )

    this.uniforms = Shader.getUniforms(this.activeProgram, this.gl)
  }

  public bind() {
    this.gl.useProgram(this.activeProgram)
  }
}
