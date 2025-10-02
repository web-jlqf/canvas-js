// Estados de la máquina
const CREACION = 100;
const PRECARGA = 200;
const INICIO   = 300;

// Movimientos
const ARRIBA	= 38;
const ABAJO	= 40;
const IZQ	= 37;
const DER	= 39;

// ---------------------------
// Clase NaveEspacial
// ---------------------------
class NaveEspacial {
  constructor(x, y, imagen) {
    this.x = x;
    this.y = y;
    this.velocidad = 10;
    this.imagen = imagen;

    // Punteros a "get" y "set" de la dirección activa (x o y)
    this.gdireccion = null;
    this.sdireccion = null;
  }

  // Getters
  getX() { 
  	return this.x; 
  }
  getY() { 
  	return this.y; 
  }
  getVelocidad() { 
  	return this.velocidad; 
  }

  // Setters
  setX(x) { 
  	this.x = x; 
  }
  setY(y) { 
  	this.y = y; 
  }
  setVelocidad(v) { 
  	this.velocidad = v; 
  }

  setImagen(imagen) { 
  	this.imagen = imagen; 
  }
  getImagen() { 
  	return this.imagen; 
  }

  // Dibuja la nave (recorte 100x50 sobre el canvas)
  // context.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
  dibujar(ctx) {
    ctx.drawImage(this.getImagen(), 0, 0, 100, 50, this.getX(), this.getY(), 100, 50);
  }
}

// ---------------------------
// Clase/función Animacion
// ---------------------------
class Animacion {
  constructor() {
    this.estado = CREACION;

    // Usamos objeto simple para almacenar imágenes
    this.imagenes = {};
    this.canvas = document.getElementById("canvas");
    this.contexto = this.canvas.getContext("2d");

    // Canvas auxiliar (doble buffer)
    this.auxcanvas = document.createElement("canvas");
    this.auxcontexto = this.auxcanvas.getContext("2d");

    // Ajustar a tamaño de ventana
    this.canvas.width  = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
    this.auxcanvas.width  = document.body.clientWidth;
    this.auxcanvas.height = document.body.clientHeight;

    this.nave = null;
  }

  // Cargar imágenes requeridas
  cargarImagenes() {
    this.imagenes["nave"] = new Image();
    this.imagenes["nave"].name = "nave";
    this.imagenes["nave"].src  = "img/nave.png";
  }

  // Un paso de actualización/redibujado
  actualizacion() {
    this.auxcontexto.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.contexto.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.nave.dibujar(this.auxcontexto);

    // Volcar buffer auxiliar al canvas principal
    this.contexto.drawImage(
      this.auxcanvas,
      0, 0, this.auxcanvas.width, this.auxcanvas.height,
      0, 0, this.canvas.width, this.canvas.height
    );

    // Mover nave usando punteros a métodos
    this.nave.sdireccion(this.nave.gdireccion() + this.nave.getVelocidad());
  }

  // Manejo de teclado
  desplazamiento(e) {
    e = e || window.event;
    const code = e.keyCode;

    if (code === ARRIBA || code === ABAJO) {
      this.nave.sdireccion = this.nave.setY;
      this.nave.gdireccion = this.nave.getY;
      this.nave.setVelocidad(code === ARRIBA ? -3 : 3);

    } else if (code === IZQ || code === DER) {
      this.nave.sdireccion = this.nave.setX;
      this.nave.gdireccion = this.nave.getX;
      this.nave.setVelocidad(code === IZQ ? -3 : 3);
    }
  }

  // Máquina de estados: CREACION -> PRECARGA -> INICIO
  ejecutarMaquinadeEstados() {
    console.log("Estado:", this.estado);

    if (this.estado === CREACION) {
      this.cargarImagenes();
      this.estado = PRECARGA;
      setTimeout(() => this.ejecutarMaquinadeEstados(), 100);
      return;
    }

    if (this.estado === PRECARGA) {
      let imagenesCargadas = true;
      for (const k in this.imagenes) {
        if (!this.imagenes[k].complete) {
          imagenesCargadas = false;
          break;
        }
      }

      if (imagenesCargadas) {
        this.nave = new NaveEspacial(200, 100, this.imagenes["nave"]);
        this.nave.gdireccion = this.nave.getX;
        this.nave.sdireccion = this.nave.setX;
        this.estado = INICIO;

        // Ojo: bind(this) para que "this" siga siendo la instancia
        document.onkeydown = this.desplazamiento.bind(this);
      }

      setTimeout(() => this.ejecutarMaquinadeEstados(), 100);
      return;
    }

    if (this.estado === INICIO) {
      this.actualizacion();
      setTimeout(() => this.ejecutarMaquinadeEstados(), 100);
    }
  }
}


// --- Instanciar y arrancar ---
var animacion = new Animacion();
animacion.ejecutarMaquinadeEstados();

