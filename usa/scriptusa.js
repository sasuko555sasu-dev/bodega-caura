function toggleMenu() {
    const sideMenu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');
    
    sideMenu.classList.toggle('open');
    overlay.classList.toggle('open');
}










const pistaPublicidad = document.getElementById("pistaPublicidad");
const inputImagen = document.getElementById("inputImagen");
const btnEliminar = document.getElementById("btnEliminar");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const indicadoresCarrusel = document.getElementById("indicadoresCarrusel");


// ==========================================
// IMÁGENES INICIALES
// ==========================================

const imagenesIniciales = [
    "Gemini_Generated_Image_fuf8jjfuf8jjfuf8.png",
    "IMG CARRUSEL 1/Gemini_Generated_Image_pucjmhpucjmhpucj.png",
    "IMG CARRUSEL 1/484484855_1115564883918618_8188765344780215297_n.jpg"
];


// ==========================================
// VARIABLES
// ==========================================

let imagenes = [];
let indiceActual = 0;
let intervaloCarrusel = null;

const tiempoCambio = 5000;


// ==========================================
// CARGAR IMÁGENES
// ==========================================

function cargarImagenes() {

    const guardadas = localStorage.getItem("imagenesCarrusel");

    if (guardadas) {

        try {

            imagenes = JSON.parse(guardadas);

        } catch (error) {

            console.error("Error leyendo imágenes:", error);

            imagenes = [...imagenesIniciales];
        }

    } else {

        imagenes = [...imagenesIniciales];

    }

    mostrarCarrusel();
}


// ==========================================
// MOSTRAR CARRUSEL
// ==========================================

function mostrarCarrusel() {

    pistaPublicidad.innerHTML = "";
    indicadoresCarrusel.innerHTML = "";

    if (imagenes.length === 0) {

        pistaPublicidad.innerHTML = `
            <div class="slide-publicidad">
                <div class="sin-imagenes">
                    No hay imágenes
                </div>
            </div>
        `;

        return;
    }


    imagenes.forEach(function(imagen, index) {

        const slide = document.createElement("div");

        slide.className = "slide-publicidad";


        const img = document.createElement("img");

        img.src = imagen;

        img.alt = "Publicidad";


        slide.appendChild(img);

        pistaPublicidad.appendChild(slide);


        // Indicador

        const indicador = document.createElement("span");

        indicador.className = "indicador";


        if (index === indiceActual) {

            indicador.classList.add("activo");

        }


        indicador.addEventListener("click", function() {

            indiceActual = index;

            actualizarCarrusel();

            reiniciarAutomatico();

        });


        indicadoresCarrusel.appendChild(indicador);

    });


    actualizarCarrusel();
}


// ==========================================
// ACTUALIZAR POSICIÓN
// ==========================================

function actualizarCarrusel() {

    if (imagenes.length === 0) {
        return;
    }


    if (indiceActual >= imagenes.length) {

        indiceActual = 0;

    }


    if (indiceActual < 0) {

        indiceActual = imagenes.length - 1;

    }


    const desplazamiento = indiceActual * 100;


    pistaPublicidad.style.transform =
        "translateX(-" + desplazamiento + "%)";


    const indicadores =
        document.querySelectorAll(".indicador");


    indicadores.forEach(function(indicador, index) {

        if (index === indiceActual) {

            indicador.classList.add("activo");

        } else {

            indicador.classList.remove("activo");

        }

    });
}


// ==========================================
// SIGUIENTE
// ==========================================

function siguienteImagen() {

    if (imagenes.length === 0) {
        return;
    }

    indiceActual++;

    if (indiceActual >= imagenes.length) {

        indiceActual = 0;

    }

    actualizarCarrusel();
}


// ==========================================
// ANTERIOR
// ==========================================

function imagenAnterior() {

    if (imagenes.length === 0) {
        return;
    }

    indiceActual--;

    if (indiceActual < 0) {

        indiceActual = imagenes.length - 1;

    }

    actualizarCarrusel();
}


// ==========================================
// AUTOMÁTICO
// ==========================================

function iniciarAutomatico() {

    detenerAutomatico();

    intervaloCarrusel = setInterval(function() {

        siguienteImagen();

    }, tiempoCambio);
}


function detenerAutomatico() {

    if (intervaloCarrusel !== null) {

        clearInterval(intervaloCarrusel);

        intervaloCarrusel = null;
    }
}


function reiniciarAutomatico() {

    detenerAutomatico();

    iniciarAutomatico();
}


// ==========================================
// BOTÓN SIGUIENTE
// ==========================================

btnNext.addEventListener("click", function() {

    siguienteImagen();

    reiniciarAutomatico();

});


// ==========================================
// BOTÓN ANTERIOR
// ==========================================

btnPrev.addEventListener("click", function() {

    imagenAnterior();

    reiniciarAutomatico();

});


// ==========================================
// AGREGAR IMÁGENES
// ==========================================

inputImagen.addEventListener("change", function() {

    const archivos = Array.from(this.files);


    if (archivos.length === 0) {
        return;
    }


    archivos.forEach(function(archivo) {

        if (!archivo.type.startsWith("image/")) {

            return;
        }


        const lector = new FileReader();


        lector.onload = function(evento) {

            const imagenBase64 = evento.target.result;


            imagenes.push(imagenBase64);


            guardarImagenes();


            indiceActual = imagenes.length - 1;


            mostrarCarrusel();


            actualizarCarrusel();


            reiniciarAutomatico();

        };


        lector.readAsDataURL(archivo);

    });


    // Permite seleccionar nuevamente el mismo archivo

    this.value = "";

});


// ==========================================
// GUARDAR
// ==========================================

function guardarImagenes() {

    try {

        localStorage.setItem(
            "imagenesCarrusel",
            JSON.stringify(imagenes)
        );

    } catch (error) {

        console.error(
            "No se pudieron guardar las imágenes:",
            error
        );

        alert(
            "No hay suficiente espacio para guardar más imágenes."
        );
    }
}


// ==========================================
// ELIMINAR
// ==========================================

btnEliminar.addEventListener("click", function() {

    if (imagenes.length === 0) {

        alert("No hay imágenes para eliminar.");

        return;
    }


    const confirmar = confirm(
        "¿Quieres eliminar la imagen actual?"
    );


    if (!confirmar) {
        return;
    }


    imagenes.splice(indiceActual, 1);


    if (imagenes.length === 0) {

        indiceActual = 0;

    } else if (indiceActual >= imagenes.length) {

        indiceActual = imagenes.length - 1;

    }


    guardarImagenes();

    mostrarCarrusel();

    reiniciarAutomatico();

});


// ==========================================
// PAUSAR CON MOUSE
// ==========================================

const carruselPublicidad =
    document.querySelector(".carousel-publicidad");


if (carruselPublicidad) {

    carruselPublicidad.addEventListener(
        "mouseenter",
        detenerAutomatico
    );


    carruselPublicidad.addEventListener(
        "mouseleave",
        iniciarAutomatico
    );

}


// ==========================================
// INICIAR
// ==========================================

cargarImagenes();

iniciarAutomatico();