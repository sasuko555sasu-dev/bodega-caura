/* ============================================================
   BODEGA CAURA
   CARRUSEL DE PUBLICIDAD INDEPENDIENTE
   ============================================================ */

import {
    initializeApp as cauraPublicidadFirebaseApp
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";

import {
    getFirestore as cauraPublicidadGetFirestore,
    collection as cauraPublicidadCollection,
    getDocs as cauraPublicidadGetDocs,
    addDoc as cauraPublicidadAddDoc,
    deleteDoc as cauraPublicidadDeleteDoc,
    doc as cauraPublicidadDoc,
    query as cauraPublicidadQuery,
    orderBy as cauraPublicidadOrderBy,
    serverTimestamp as cauraPublicidadServerTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";


/* ============================================================
   FIREBASE
   ============================================================ */

const CAURA_PUBLICIDAD_FIREBASE_CONFIG = {

    apiKey: "AIzaSyAP4RynOCmzuVfKNVUH9yTLn6zqbX-FpO8",

    authDomain: "bodegacaura.firebaseapp.com",

    projectId: "bodegacaura",

    storageBucket: "bodegacaura.firebasestorage.app",

    messagingSenderId: "122047399077",

    appId: "1:122047399077:web:59e6cad69ad96e7ff1f94c",

    measurementId: "G-35PWB70C08"
};


/* ============================================================
   APP FIREBASE INDEPENDIENTE
   ============================================================ */

const cauraPublicidadApp =
    cauraPublicidadFirebaseApp(
        CAURA_PUBLICIDAD_FIREBASE_CONFIG,
        "cauraPublicidadApp"
    );

const cauraPublicidadDB =
    cauraPublicidadGetFirestore(
        cauraPublicidadApp
    );


/* ============================================================
   CONFIGURACIÓN CLOUDINARY
   ============================================================ */

const CAURA_PUBLICIDAD_CLOUDINARY_NAME = "druslhu1g";

const CAURA_PUBLICIDAD_UPLOAD_PRESET = "subir_productos";


/* ============================================================
   VARIABLES INTERNAS
   ============================================================ */

let cauraPublicidadLista = [];

let cauraPublicidadIndiceActual = 0;

let cauraPublicidadTemporizador = null;

let cauraPublicidadInicializado = false;


/* ============================================================
   ELEMENTOS
   ============================================================ */

let cauraPublicidadPista = null;

let cauraPublicidadInput = null;

let cauraPublicidadBotonAgregar = null;

let cauraPublicidadIndicadores = null;

let cauraPublicidadVacio = null;


/* ============================================================
   INICIALIZAR
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    cauraPublicidadInicializar
);


function cauraPublicidadInicializar() {

    if (cauraPublicidadInicializado) {
        return;
    }

    cauraPublicidadInicializado = true;


    cauraPublicidadPista =
        document.getElementById(
            "caura-pub-pista"
        );

    cauraPublicidadInput =
        document.getElementById(
            "caura-pub-input"
        );

    cauraPublicidadBotonAgregar =
        document.getElementById(
            "caura-pub-btn-agregar"
        );

    cauraPublicidadIndicadores =
        document.getElementById(
            "caura-pub-indicadores"
        );

    cauraPublicidadVacio =
        document.getElementById(
            "caura-pub-vacio"
        );


    if (
        !cauraPublicidadPista ||
        !cauraPublicidadInput ||
        !cauraPublicidadBotonAgregar
    ) {

        console.warn(
            "Carrusel publicidad: elementos HTML no encontrados."
        );

        return;
    }


    /*
     * Botón agregar
     */

    cauraPublicidadBotonAgregar.addEventListener(
        "click",
        cauraPublicidadAbrirSelector
    );


    /*
     * Cuando el usuario selecciona una imagen
     */

    cauraPublicidadInput.addEventListener(
        "change",
        cauraPublicidadProcesarArchivo
    );


    /*
     * Cargar publicidad desde Firebase
     */

    cauraPublicidadCargar();


    console.log(
        "Carrusel de publicidad independiente iniciado."
    );
}


/* ============================================================
   ABRIR SELECTOR DE IMAGEN
   ============================================================ */

function cauraPublicidadAbrirSelector() {

    cauraPublicidadInput.value = "";

    cauraPublicidadInput.click();
}


/* ============================================================
   PROCESAR IMAGEN
   ============================================================ */

async function cauraPublicidadProcesarArchivo(event) {

    const archivo = event.target.files[0];

    if (!archivo) {
        return;
    }


    /*
     * Validar tipo
     */

    if (!archivo.type.startsWith("image/")) {

        alert(
            "Por favor selecciona una imagen."
        );

        return;
    }


    /*
     * Validar tamaño
     *
     * Permitimos hasta 10 MB.
     */

    const maximoMB = 10;

    const maximoBytes =
        maximoMB * 1024 * 1024;


    if (archivo.size > maximoBytes) {

        alert(
            "La imagen no puede superar los 10 MB."
        );

        return;
    }


    try {

        cauraPublicidadMostrarCarga();


        /*
         * Preguntar enlace
         */

        let enlace = prompt(
            "Si quieres que la publicidad abra un enlace al tocarla, escríbelo aquí.\n\nPuedes dejarlo vacío."
        );


        if (enlace) {

            enlace = enlace.trim();

            /*
             * Si no tiene protocolo,
             * agregamos https://
             */

            if (
                enlace &&
                !enlace.startsWith("http://") &&
                !enlace.startsWith("https://")
            ) {

                enlace =
                    "https://" + enlace;
            }

        } else {

            enlace = "";
        }


        /*
         * Subir imagen
         */

        const urlImagen =
            await cauraPublicidadSubirCloudinary(
                archivo
            );


        /*
         * Guardar en Firebase
         */

        await cauraPublicidadGuardarFirebase(
            urlImagen,
            enlace
        );


        /*
         * Recargar carrusel
         */

        await cauraPublicidadCargar();


        alert(
            "Publicidad agregada correctamente."
        );


    } catch (error) {

        console.error(
            "Error agregando publicidad:",
            error
        );

        alert(
            "No se pudo agregar la publicidad.\n\n" +
            error.message
        );

    } finally {

        cauraPublicidadOcultarCarga();

        cauraPublicidadInput.value = "";
    }
}


/* ============================================================
   SUBIR IMAGEN A CLOUDINARY
   ============================================================ */

async function cauraPublicidadSubirCloudinary(
    archivo
) {

    const formulario =
        new FormData();


    formulario.append(
        "file",
        archivo
    );


    formulario.append(
        "upload_preset",
        CAURA_PUBLICIDAD_UPLOAD_PRESET
    );


    const respuesta =
        await fetch(
            `https://api.cloudinary.com/v1_1/${CAURA_PUBLICIDAD_CLOUDINARY_NAME}/image/upload`,
            {
                method: "POST",
                body: formulario
            }
        );


    if (!respuesta.ok) {

        throw new Error(
            "Cloudinary rechazó la imagen."
        );
    }


    const datos =
        await respuesta.json();


    if (!datos.secure_url) {

        throw new Error(
            "Cloudinary no devolvió la URL de la imagen."
        );
    }


    return datos.secure_url;
}


/* ============================================================
   GUARDAR EN FIRESTORE
   ============================================================ */

async function cauraPublicidadGuardarFirebase(
    urlImagen,
    enlace
) {

    await cauraPublicidadAddDoc(

        cauraPublicidadCollection(
            cauraPublicidadDB,
            "publicidad"
        ),

        {
            imagen: urlImagen,

            link: enlace,

            fecha:
                cauraPublicidadServerTimestamp()
        }
    );
}


/* ============================================================
   CARGAR PUBLICIDADES
   ============================================================ */

async function cauraPublicidadCargar() {

    try {

        cauraPublicidadMostrarCarga();


        const referencia =
            cauraPublicidadCollection(
                cauraPublicidadDB,
                "publicidad"
            );


        const consulta =
            cauraPublicidadQuery(
                referencia,
                cauraPublicidadOrderBy(
                    "fecha",
                    "asc"
                )
            );


        const resultado =
            await cauraPublicidadGetDocs(
                consulta
            );


        cauraPublicidadLista = [];


        resultado.forEach(
            documento => {

                const datos =
                    documento.data();


                if (!datos.imagen) {
                    return;
                }


                cauraPublicidadLista.push({

                    id: documento.id,

                    imagen: datos.imagen,

                    link: datos.link || "",

                    fecha: datos.fecha || null

                });

            }
        );


        /*
         * Reiniciar posición
         */

        cauraPublicidadIndiceActual = 0;


        /*
         * Crear HTML
         */

        cauraPublicidadRenderizar();


        /*
         * Iniciar movimiento
         */

        cauraPublicidadIniciarMovimiento();


    } catch (error) {

        console.error(
            "Error cargando publicidad:",
            error
        );


        cauraPublicidadLista = [];


        cauraPublicidadRenderizar();


    } finally {

        cauraPublicidadOcultarCarga();

    }
}


/* ============================================================
   RENDERIZAR
   ============================================================ */

function cauraPublicidadRenderizar() {

    if (!cauraPublicidadPista) {
        return;
    }


    cauraPublicidadPista.innerHTML = "";


    /*
     * No hay publicidades
     */

    if (
        cauraPublicidadLista.length === 0
    ) {

        cauraPublicidadPista.style.transform =
            "translateX(0)";


        if (cauraPublicidadVacio) {

            cauraPublicidadVacio.style.display =
                "flex";
        }


        if (cauraPublicidadIndicadores) {

            cauraPublicidadIndicadores.innerHTML =
                "";
        }


        return;
    }


    /*
     * Ocultar mensaje vacío
     */

    if (cauraPublicidadVacio) {

        cauraPublicidadVacio.style.display =
            "none";
    }


    /*
     * Crear slides
     */

    cauraPublicidadLista.forEach(
        publicidad => {

            const slide =
                document.createElement(
                    "div"
                );


            slide.className =
                "caura-pub-slide";


            /*
             * Imagen
             */

            const imagen =
                document.createElement(
                    "img"
                );


            imagen.src =
                publicidad.imagen;


            imagen.alt =
                "Publicidad Bodega Caura";


            imagen.loading =
                "lazy";


            /*
             * Enlace
             */

            if (publicidad.link) {

                slide.addEventListener(
                    "click",
                    () => {

                        window.open(
                            publicidad.link,
                            "_blank"
                        );

                    }
                );

            }


            /*
             * Botón X
             */

            const botonEliminar =
                document.createElement(
                    "button"
                );


            botonEliminar.type =
                "button";


            botonEliminar.className =
                "caura-pub-btn-eliminar";


            botonEliminar.title =
                "Eliminar publicidad";


            botonEliminar.innerHTML =
                '<i class="fa-solid fa-xmark"></i>';


            /*
             * Evitar que la X abra el enlace
             */

            botonEliminar.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();


                    cauraPublicidadEliminar(
                        publicidad.id
                    );

                }
            );


            slide.appendChild(
                imagen
            );


            slide.appendChild(
                botonEliminar
            );


            cauraPublicidadPista.appendChild(
                slide
            );

        }
    );


    /*
     * Crear indicadores
     */

    cauraPublicidadCrearIndicadores();


    /*
     * Posicionar
     */

    cauraPublicidadActualizarPosicion();
}


/* ============================================================
   INDICADORES
   ============================================================ */

function cauraPublicidadCrearIndicadores() {

    if (!cauraPublicidadIndicadores) {
        return;
    }


    cauraPublicidadIndicadores.innerHTML =
        "";


    cauraPublicidadLista.forEach(
        (_, indice) => {

            const indicador =
                document.createElement(
                    "span"
                );


            indicador.className =
                "caura-pub-indicador";


            if (
                indice ===
                cauraPublicidadIndiceActual
            ) {

                indicador.classList.add(
                    "activo"
                );
            }


            cauraPublicidadIndicadores.appendChild(
                indicador
            );

        }
    );
}


/* ============================================================
   ACTUALIZAR POSICIÓN
   ============================================================ */

function cauraPublicidadActualizarPosicion() {

    if (!cauraPublicidadPista) {
        return;
    }


    cauraPublicidadPista.style.transform =
        `translateX(-${cauraPublicidadIndiceActual * 100}%)`;


    const indicadores =
        document.querySelectorAll(
            ".caura-pub-indicador"
        );


    indicadores.forEach(
        (indicador, indice) => {

            indicador.classList.toggle(
                "activo",
                indice ===
                cauraPublicidadIndiceActual
            );

        }
    );
}


/* ============================================================
   MOVIMIENTO AUTOMÁTICO
   ============================================================ */

function cauraPublicidadIniciarMovimiento() {

    /*
     * Detener temporizador anterior
     */

    if (cauraPublicidadTemporizador) {

        clearInterval(
            cauraPublicidadTemporizador
        );

        cauraPublicidadTemporizador =
            null;
    }


    /*
     * Si hay 0 o 1 publicidad,
     * no necesitamos movimiento.
     */

    if (
        cauraPublicidadLista.length <= 1
    ) {

        return;
    }


    /*
     * Cambiar cada 4 segundos
     */

    cauraPublicidadTemporizador =
        setInterval(
            () => {

                cauraPublicidadIndiceActual++;


                if (
                    cauraPublicidadIndiceActual >=
                    cauraPublicidadLista.length
                ) {

                    cauraPublicidadIndiceActual =
                        0;
                }


                cauraPublicidadActualizarPosicion();

            },
            4000
        );
}


/* ============================================================
   ELIMINAR PUBLICIDAD
   ============================================================ */

async function cauraPublicidadEliminar(
    idPublicidad
) {

    const confirmar =
        confirm(
            "¿Seguro que quieres eliminar esta publicidad?"
        );


    if (!confirmar) {
        return;
    }


    try {

        cauraPublicidadMostrarCarga();


        await cauraPublicidadDeleteDoc(

            cauraPublicidadDoc(
                cauraPublicidadDB,
                "publicidad",
                idPublicidad
            )

        );


        /*
         * Volver a cargar
         */

        await cauraPublicidadCargar();


        alert(
            "Publicidad eliminada correctamente."
        );


    } catch (error) {

        console.error(
            "Error eliminando publicidad:",
            error
        );


        alert(
            "No se pudo eliminar la publicidad.\n\n" +
            error.message
        );


    } finally {

        cauraPublicidadOcultarCarga();

    }
}


/* ============================================================
   INDICADOR DE CARGA
   ============================================================ */

function cauraPublicidadMostrarCarga() {

    const carrusel =
        document.getElementById(
            "caura-publicidad-carrusel"
        );


    if (!carrusel) {
        return;
    }


    if (
        document.getElementById(
            "caura-pub-cargando"
        )
    ) {

        return;
    }


    const carga =
        document.createElement(
            "div"
        );


    carga.id =
        "caura-pub-cargando";


    carga.className =
        "caura-pub-cargando";


    carga.innerHTML =
        `
        <div class="caura-pub-spinner"></div>
        `;


    carrusel.appendChild(
        carga
    );
}


function cauraPublicidadOcultarCarga() {

    const carga =
        document.getElementById(
            "caura-pub-cargando"
        );


    if (carga) {

        carga.remove();
    }
}


/* ============================================================
   FIN DEL MÓDULO
   ============================================================ */





import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    orderBy,
    query
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";


// ==========================================
// FIREBASE
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyAP4RynOCmzuVfKNVUH9yTLn6zqbX-FpO8",
    authDomain: "bodegacaura.firebaseapp.com",
    projectId: "bodegacaura",
    storageBucket: "bodegacaura.firebasestorage.app",
    messagingSenderId: "122047399077",
    appId: "1:122047399077:web:59e6cad69ad96e7ff1f94c",
    measurementId: "G-35PWB70C08"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ==========================================
// VARIABLES
// ==========================================

let publicidades = [];
let posicionActual = 0;

let intervaloCarrusel = null;


// ==========================================
// CARGAR PUBLICIDADES
// ==========================================

async function cargarPublicidades() {

    const pista = document.getElementById("publicidad-slider");

    if (!pista) return;

    try {

        const referencia = query(
            collection(db, "publicidad"),
            orderBy("fecha", "asc")
        );

        const resultado = await getDocs(referencia);

        publicidades = [];

        resultado.forEach(documento => {

            publicidades.push({
                id: documento.id,
                ...documento.data()
            });

        });


        // Si no hay publicidad
        if (publicidades.length === 0) {

            pista.innerHTML = "";

            document.getElementById("pub-indicadores").innerHTML = "";

            return;
        }


        // Crear las imágenes
        construirCarrusel();

        // Mostrar primera
        moverCarrusel(false);

        // Crear puntos
        crearIndicadores();

        // Iniciar movimiento automático
        iniciarMovimiento();


    } catch (error) {

        console.error(
            "Error cargando publicidades:",
            error
        );

    }
}


// ==========================================
// CONSTRUIR CARRUSEL
// ==========================================

function construirCarrusel() {

    const pista =
        document.getElementById("publicidad-slider");

    pista.innerHTML = "";


    publicidades.forEach(publicidad => {

        const slide =
            document.createElement("div");

        slide.className =
            "publicidad-slide";


        const enlace =
            document.createElement("a");

        enlace.className =
            "publicidad-enlace";

        enlace.href =
            publicidad.link || "#";

        enlace.target =
            "_blank";

        enlace.rel =
            "noopener noreferrer";


        const imagen =
            document.createElement("img");

        imagen.className =
            "imagen-publicidad";

        imagen.src =
            publicidad.imagen;

        imagen.alt =
            "Publicidad";


        enlace.appendChild(imagen);

        slide.appendChild(enlace);

        pista.appendChild(slide);

    });

}


// ==========================================
// MOVER CARRUSEL
// ==========================================

function moverCarrusel(animacion = true) {

    const pista =
        document.getElementById("publicidad-slider");

    if (!pista) return;


    // Activar/desactivar transición
    if (animacion) {

        pista.classList.add("transicion-carrusel");

    } else {

        pista.classList.remove("transicion-carrusel");

    }


    const desplazamiento =
        posicionActual * 100;


    pista.style.transform =
        `translateX(-${desplazamiento}%)`;


    actualizarIndicadores();

}


// ==========================================
// SIGUIENTE
// ==========================================

function siguientePublicidad() {

    if (publicidades.length <= 1) return;


    posicionActual++;


    if (posicionActual >= publicidades.length) {

        posicionActual = 0;

    }


    moverCarrusel(true);

}


// ==========================================
// ANTERIOR
// ==========================================

function anteriorPublicidad() {

    if (publicidades.length <= 1) return;


    posicionActual--;


    if (posicionActual < 0) {

        posicionActual =
            publicidades.length - 1;

    }


    moverCarrusel(true);

}


// ==========================================
// MOVIMIENTO AUTOMÁTICO
// ==========================================

function iniciarMovimiento() {

    detenerMovimiento();


    if (publicidades.length <= 1) return;


    intervaloCarrusel =
        setInterval(() => {

            siguientePublicidad();

        }, 4000);

}


// ==========================================
// DETENER MOVIMIENTO
// ==========================================

function detenerMovimiento() {

    if (intervaloCarrusel) {

        clearInterval(intervaloCarrusel);

        intervaloCarrusel = null;

    }

}


// ==========================================
// INDICADORES
// ==========================================

function crearIndicadores() {

    const contenedor =
        document.getElementById("pub-indicadores");

    if (!contenedor) return;


    contenedor.innerHTML = "";


    publicidades.forEach((_, index) => {

        const punto =
            document.createElement("span");

        punto.className =
            "pub-punto";


        punto.addEventListener("click", () => {

            posicionActual = index;

            moverCarrusel(true);

            iniciarMovimiento();

        });


        contenedor.appendChild(punto);

    });


    actualizarIndicadores();

}


// ==========================================
// ACTUALIZAR INDICADORES
// ==========================================

function actualizarIndicadores() {

    const puntos =
        document.querySelectorAll(".pub-punto");


    puntos.forEach((punto, index) => {

        punto.classList.toggle(
            "activo",
            index === posicionActual
        );

    });

}


// ==========================================
// BOTONES
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const anterior =
        document.getElementById("pub-anterior");

    const siguiente =
        document.getElementById("pub-siguiente");


    if (anterior) {

        anterior.addEventListener("click", () => {

            anteriorPublicidad();

            iniciarMovimiento();

        });

    }


    if (siguiente) {

        siguiente.addEventListener("click", () => {

            siguientePublicidad();

            iniciarMovimiento();

        });

    }


    cargarPublicidades();

});



   