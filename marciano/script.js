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
function Animacion() {
  this.estado = CREACION;

  // Usamos objeto simple en lugar de Array para llaves por nombre
  this.imagenes = {};
  this.canvas = document.getElementById("canvas");
  this.contexto = this.canvas.getContext("2d");

  // Doble buffer (canvas auxiliar)
  this.auxcanvas = document.createElement("canvas");
  this.auxcontexto = this.auxcanvas.getContext("2d");

  // Ajuste a tamaño de la página
  this.canvas.width  = document.body.clientWidth;
  this.canvas.height = document.body.clientHeight;
  this.auxcanvas.width  = document.body.clientWidth;
  this.auxcanvas.height = document.body.clientHeight;

  this.nave = null;

  // Guardamos referencia a "this" para usar dentro de callbacks
  var objeto = this;

  // Cargar imágenes requeridas
  this.cargarImagenes = function () {
    objeto.imagenes["nave"] = new Image();
    objeto.imagenes["nave"].name = "nave";
    objeto.imagenes["nave"].src  = "img/nave.png";
  };

  // Un paso de actualización/redibujado
  this.actualizacion = function () {
    // Limpiamos ambos contextos
    objeto.auxcontexto.clearRect(0, 0, objeto.canvas.width, objeto.canvas.height);
    objeto.contexto.clearRect(0, 0, objeto.canvas.width, objeto.canvas.height);

    // Dibujamos en el buffer auxiliar
    objeto.nave.dibujar(objeto.auxcontexto);

    // Volcamos el buffer auxiliar al canvas visible (doble buffer)
    // drawImage(srcCanvas, sx, sy, sw, sh, dx, dy, dw, dh)
    objeto.contexto.drawImage(objeto.auxcanvas,
      0, 0, objeto.auxcanvas.width, objeto.auxcanvas.height,
      0, 0, objeto.canvas.width, objeto.canvas.height
    );

    // Avance en la dirección activa (x o y) usando punteros a métodos
    objeto.nave.sdireccion(objeto.nave.gdireccion() + objeto.nave.getVelocidad());
  };

  // Manejo de teclado (flechas)
  this.desplazamiento = function (e) {
    e = e || window.event;
    const code = e.keyCode; // 37, 38, 39, 40 (ver arriba)

    if (code === ARRIBA || code === ABAJO) {
      // Vertical: usar Y
      objeto.nave.sdireccion = objeto.nave.setY;
      objeto.nave.gdireccion = objeto.nave.getY;
      if (code === ARRIBA) {
        // Arriba (negativo)
        objeto.nave.setVelocidad(-3);
      } else {
        // Abajo
        objeto.nave.setVelocidad(3);
      }
    } else if (code === IZQ || code === DER) {
      // Horizontal: usar X
      objeto.nave.sdireccion = objeto.nave.setX;
      objeto.nave.gdireccion = objeto.nave.getX;
      if (code === IZQ) {
        // Izquierda
        objeto.nave.setVelocidad(-3);
      } else {
        // Derecha
        objeto.nave.setVelocidad(3);
      }
    }
  };

  // Máquina de estados simple: CREACION -> PRECARGA -> INICIO
  this.ejecutarMaquinadeEstados = function () {
    let imagenesCargadas = true;
    console.log("Estado:", objeto.estado);

    if (objeto.estado === CREACION) {
      objeto.cargarImagenes();
      objeto.estado = PRECARGA;
      setTimeout(objeto.ejecutarMaquinadeEstados, 100);
      return;
    }

    if (objeto.estado === PRECARGA) {
      //Validar
      for (const k in objeto.imagenes) {
        if (!objeto.imagenes[k].complete) {
          imagenesCargadas = false;
          break;
        }
      }

      if (imagenesCargadas) {
        // Crear la nave cuando la imagen está lista
        objeto.nave = new NaveEspacial(200, 100, objeto.imagenes["nave"]);

        // Dirección por defecto: eje X
        objeto.nave.gdireccion = objeto.nave.getX;
        objeto.nave.sdireccion = objeto.nave.setX;

        // Activar controles y pasar a INICIO
        objeto.estado = INICIO;
        document.onkeydown = objeto.desplazamiento;
      }

      setTimeout(objeto.ejecutarMaquinadeEstados, 100);
      return;
    }

    if (objeto.estado === INICIO) {
      objeto.actualizacion();
      setTimeout(objeto.ejecutarMaquinadeEstados, 100);
    }
  };
}

// --- Instanciar y arrancar ---
var animacion = new Animacion();
animacion.ejecutarMaquinadeEstados();

