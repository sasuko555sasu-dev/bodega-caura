/* =========================================================
   OFERTAS EXTERNAS
   Módulo independiente
========================================================= */

import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    addDoc,
    deleteDoc,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";


/* =========================================================
   FIREBASE
========================================================= */

const firebaseConfigOfertas = {
    apiKey: "AIzaSyAP4RynOCmzuVfKNVUH9yTLn6zqbX-FpO8",
    authDomain: "bodegacaura.firebaseapp.com",
    projectId: "bodegacaura",
    storageBucket: "bodegacaura.firebasestorage.app",
    messagingSenderId: "122047399077",
    appId: "1:122047399077:web:59e6cad69ad96e7ff1f94c",
    measurementId: "G-35PWB70C08"
};


/*
 * Si Firebase ya está inicializado,
 * utilizamos la aplicación existente.
 */

const appOfertas =
    getApps().length > 0
        ? getApp()
        : initializeApp(firebaseConfigOfertas);


const dbOfertas =
    getFirestore(appOfertas);


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const COLECCION_OFERTAS =
    "ofertasExternas";

const DOCUMENTO_CONFIG =
    "configuracion";


/* =========================================================
   CLOUDINARY
========================================================= */

const CLOUD_NAME =
    "druslhu1g";

const UPLOAD_PRESET =
    "subir_productos";


/* =========================================================
   WHATSAPP
========================================================= */

const TELEFONO_WHATSAPP =
    "584264373589";


/* =========================================================
   VARIABLES
========================================================= */

let intervaloOfertas = null;


/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /*
         * INDEX
         */

        if (
            document.getElementById(
                "modulo-ofertas-externas"
            )
        ) {

            await iniciarModuloCliente();

        }


        /*
         * ADMIN
         */

        if (
            document.getElementById(
                "admin-ofertas-externas"
            )
        ) {

            await iniciarModuloAdministrador();

        }

    }
);


/* =========================================================
   CLIENTE
========================================================= */

async function iniciarModuloCliente() {

    const modulo =
        document.getElementById(
            "modulo-ofertas-externas"
        );

    if (!modulo) return;


    try {

        const referenciaConfig =
            doc(
                dbOfertas,
                COLECCION_OFERTAS,
                DOCUMENTO_CONFIG
            );


        const configuracion =
            await getDoc(
                referenciaConfig
            );


        /*
         * Si todavía no existe configuración,
         * el módulo permanece oculto.
         */

        if (!configuracion.exists()) {

            modulo.style.display =
                "none";

            return;

        }


        const datos =
            configuracion.data();


        /*
         * EL OJITO DEL ADMINISTRADOR
         * CONTROLA ESTO.
         */

        if (
            datos.mostrar !== true
        ) {

            /*
             * display:none elimina completamente
             * el espacio del módulo.
             */

            modulo.style.display =
                "none";

            return;

        }


        /*
         * Está activo.
         */

        modulo.style.display =
            "block";


        await cargarTarjetasCliente();

    } catch (error) {

        console.error(
            "Error iniciando ofertas externas:",
            error
        );

        modulo.style.display =
            "none";

    }

}


/* =========================================================
   CARGAR TARJETAS CLIENTE
========================================================= */

async function cargarTarjetasCliente() {

    const carrusel =
        document.getElementById(
            "carrusel-ofertas-externas"
        );

    if (!carrusel) return;


    try {

        const resultado =
            await getDocs(
                collection(
                    dbOfertas,
                    COLECCION_OFERTAS
                )
            );


        carrusel.innerHTML = "";


        const productos = [];


        resultado.forEach(
            documento => {

                /*
                 * El documento de configuración
                 * no es una tarjeta.
                 */

                if (
                    documento.id ===
                    DOCUMENTO_CONFIG
                ) {

                    return;

                }


                productos.push({

                    id: documento.id,

                    ...documento.data()

                });

            }
        );


        /*
         * No hay productos.
         */

        if (
            productos.length === 0
        ) {

            carrusel.innerHTML = `
                <div class="sin-ofertas-externas">
                    Próximamente nuevos productos.
                </div>
            `;

            return;

        }


        /*
         * Crear tarjetas.
         */

        productos.forEach(
            producto => {

                crearTarjetaCliente(
                    producto,
                    carrusel
                );

            }
        );


        /*
         * Iniciar movimiento automático.
         */

        iniciarMovimientoAutomatico();

    } catch (error) {

        console.error(
            "Error cargando tarjetas externas:",
            error
        );

    }

}


/* =========================================================
   CREAR TARJETA CLIENTE
========================================================= */

function crearTarjetaCliente(
    producto,
    contenedor
) {

    const tarjeta =
        document.createElement(
            "article"
        );


    tarjeta.className =
        "tarjeta-oferta-externa";


    const nombre =
        escaparHTML(
            producto.nombre || ""
        );


    const tipo =
        escaparHTML(
            producto.tipo || ""
        );


    const precio =
        Number(
            producto.precio || 0
        ).toFixed(2);


    const imagen =
        escaparHTML(
            producto.imagen || ""
        );


    tarjeta.innerHTML = `

        <div class="oferta-externa-imagen">

            <img
                src="${imagen}"
                alt="${nombre}"
                loading="lazy"
            >

        </div>


        <div class="oferta-externa-tipo">

            ${tipo}

        </div>


        <div class="oferta-externa-nombre">

            ${nombre}

        </div>


        <div class="oferta-externa-precio">

            $${precio}

        </div>


        <button
            type="button"
            class="btn-cotizar-oferta-externa"
        >

            COTIZAR

        </button>

    `;


    const boton =
        tarjeta.querySelector(
            ".btn-cotizar-oferta-externa"
        );


    boton.addEventListener(
        "click",
        () => {

            enviarCotizacionWhatsApp(
                producto
            );

        }
    );


    contenedor.appendChild(
        tarjeta
    );

}


/* =========================================================
   WHATSAPP
========================================================= */

function enviarCotizacionWhatsApp(
    producto
) {

    const nombre =
        producto.nombre || "producto";


    const tipo =
        producto.tipo || "producto externo";


    const precio =
        Number(
            producto.precio || 0
        ).toFixed(2);


    const mensaje =
        `Hola, estoy interesado en cotizar ` +
        `el producto "${nombre}" ` +
        `de ${tipo}. ` +
        `El precio mostrado es $${precio}. ` +
        `Quisiera obtener más información.`;


    const url =
        `https://wa.me/${TELEFONO_WHATSAPP}` +
        `?text=${encodeURIComponent(mensaje)}`;


    window.open(
        url,
        "_blank"
    );

}


/* =========================================================
   MOVIMIENTO AUTOMÁTICO
========================================================= */

function iniciarMovimientoAutomatico() {

    const carrusel =
        document.getElementById(
            "carrusel-ofertas-externas"
        );

    if (!carrusel) return;


    const tarjetas =
        carrusel.querySelectorAll(
            ".tarjeta-oferta-externa"
        );


    if (
        tarjetas.length <= 1
    ) {

        return;

    }


    /*
     * Evitamos intervalos duplicados.
     */

    if (
        intervaloOfertas
    ) {

        clearInterval(
            intervaloOfertas
        );

    }


    intervaloOfertas =
        setInterval(
            () => {

                moverCarruselDerecha(
                    carrusel
                );

            },
            7000
        );

}


/* =========================================================
   MOVER CARRUSEL
========================================================= */

function moverCarruselDerecha(
    carrusel
) {

    const tarjeta =
        carrusel.querySelector(
            ".tarjeta-oferta-externa"
        );


    if (!tarjeta) return;


    const ancho =
        tarjeta.offsetWidth;


    const estilos =
        getComputedStyle(
            carrusel
        );


    const espacio =
        parseFloat(
            estilos.gap
        ) || 10;


    const movimiento =
        ancho + espacio;


    const estaAlFinal =
        carrusel.scrollLeft +
        carrusel.clientWidth >=
        carrusel.scrollWidth - 5;


    if (estaAlFinal) {

        /*
         * Regresamos al principio.
         */

        carrusel.scrollTo({

            left: 0,

            behavior: "smooth"

        });

    } else {

        /*
         * Avanzamos exactamente una tarjeta.
         */

        carrusel.scrollBy({

            left: movimiento,

            behavior: "smooth"

        });

    }

}


/* =========================================================
   ADMINISTRADOR
========================================================= */

async function iniciarModuloAdministrador() {

    await cargarEstadoAdministrador();

    await cargarTarjetasAdministrador();

    configurarEventosAdministrador();

}


/* =========================================================
   ESTADO DEL MÓDULO
========================================================= */

async function cargarEstadoAdministrador() {

    const boton =
        document.getElementById(
            "btn-estado-ofertas-externas"
        );

    const icono =
        document.getElementById(
            "icono-estado-ofertas-externas"
        );

    const estado =
        document.getElementById(
            "estado-ofertas-externas"
        );


    if (
        !boton ||
        !icono ||
        !estado
    ) {

        return;

    }


    try {

        const referencia =
            doc(
                dbOfertas,
                COLECCION_OFERTAS,
                DOCUMENTO_CONFIG
            );


        const resultado =
            await getDoc(
                referencia
            );


        /*
         * Por seguridad, si todavía no existe,
         * lo creamos oculto.
         */

        if (
            !resultado.exists()
        ) {

            await setDoc(
                referencia,
                {
                    mostrar: false,
                    fechaActualizacion:
                        new Date()
                }
            );


            actualizarEstadoVisual(
                false
            );

            return;

        }


        const datos =
            resultado.data();


        actualizarEstadoVisual(
            datos.mostrar === true
        );

    } catch (error) {

        console.error(
            "Error cargando estado:",
            error
        );

    }

}


/* =========================================================
   CAMBIAR ESTADO
========================================================= */

async function cambiarEstadoModulo() {

    const boton =
        document.getElementById(
            "btn-estado-ofertas-externas"
        );


    if (!boton) return;


    try {

        boton.disabled =
            true;


        const referencia =
            doc(
                dbOfertas,
                COLECCION_OFERTAS,
                DOCUMENTO_CONFIG
            );


        const resultado =
            await getDoc(
                referencia
            );


        let estadoActual =
            false;


        if (
            resultado.exists()
        ) {

            estadoActual =
                resultado.data().mostrar === true;

        }


        const nuevoEstado =
            !estadoActual;


        await setDoc(

            referencia,

            {

                mostrar:
                    nuevoEstado,

                fechaActualizacion:
                    new Date()

            },

            {

                merge: true

            }

        );


        actualizarEstadoVisual(
            nuevoEstado
        );


    } catch (error) {

        console.error(
            "Error cambiando estado:",
            error
        );


        alert(
            "No se pudo cambiar el estado."
        );

    } finally {

        boton.disabled =
            false;

    }

}


/* =========================================================
   ACTUALIZAR ESTADO VISUAL
========================================================= */

function actualizarEstadoVisual(
    mostrar
) {

    const boton =
        document.getElementById(
            "btn-estado-ofertas-externas"
        );

    const icono =
        document.getElementById(
            "icono-estado-ofertas-externas"
        );

    const estado =
        document.getElementById(
            "estado-ofertas-externas"
        );


    if (
        !boton ||
        !icono ||
        !estado
    ) {

        return;

    }


    if (mostrar) {

        icono.className =
            "fa-solid fa-eye";


        boton.classList.remove(
            "oculto"
        );


        estado.textContent =
            "Módulo visible para los clientes.";

    } else {

        icono.className =
            "fa-solid fa-eye-slash";


        boton.classList.add(
            "oculto"
        );


        estado.textContent =
            "Módulo oculto para los clientes.";

    }

}


/* =========================================================
   CARGAR TARJETAS EN ADMIN
========================================================= */

async function cargarTarjetasAdministrador() {

    const lista =
        document.getElementById(
            "lista-ofertas-externas-admin"
        );


    if (!lista) return;


    try {

        const resultado =
            await getDocs(
                collection(
                    dbOfertas,
                    COLECCION_OFERTAS
                )
            );


        lista.innerHTML = "";


        let cantidad =
            0;


        resultado.forEach(
            documento => {

                if (
                    documento.id ===
                    DOCUMENTO_CONFIG
                ) {

                    return;

                }


                cantidad++;


                const producto =
                    documento.data();


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "item-oferta-externa-admin";


                item.innerHTML = `

                    <img
                        src="${escaparHTML(producto.imagen || "")}"
                        alt="${escaparHTML(producto.nombre || "")}"
                    >


                    <div
                        class="item-oferta-externa-info"
                    >

                        <strong>
                            ${escaparHTML(producto.nombre || "")}
                        </strong>

                        <small>
                            ${escaparHTML(producto.tipo || "")}
                        </small>

                        <span>
                            $${Number(producto.precio || 0).toFixed(2)}
                        </span>

                    </div>


                    <button
                        type="button"
                        class="btn-eliminar-oferta-externa"
                        data-id="${documento.id}"
                        title="Eliminar tarjeta"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                `;


                lista.appendChild(
                    item
                );

            }
        );


        if (
            cantidad === 0
        ) {

            lista.innerHTML = `

                <div class="sin-ofertas-externas">

                    No hay tarjetas agregadas todavía.

                </div>

            `;

        }

    } catch (error) {

        console.error(
            "Error cargando tarjetas del administrador:",
            error
        );

    }

}


/* =========================================================
   EVENTOS ADMIN
========================================================= */

function configurarEventosAdministrador() {

    const btnAgregar =
        document.getElementById(
            "btn-agregar-oferta-externa"
        );


    const btnCerrar =
        document.getElementById(
            "btn-cerrar-oferta-externa"
        );


    const btnGuardar =
        document.getElementById(
            "btn-guardar-oferta-externa"
        );


    const btnEstado =
        document.getElementById(
            "btn-estado-ofertas-externas"
        );


    const inputImagen =
        document.getElementById(
            "imagen-oferta-externa"
        );


    if (btnAgregar) {

        btnAgregar.addEventListener(
            "click",
            abrirModalOferta
        );

    }


    if (btnCerrar) {

        btnCerrar.addEventListener(
            "click",
            cerrarModalOferta
        );

    }


    if (btnGuardar) {

        btnGuardar.addEventListener(
            "click",
            guardarOfertaExterna
        );

    }


    if (btnEstado) {

        btnEstado.addEventListener(
            "click",
            cambiarEstadoModulo
        );

    }


    if (inputImagen) {

        inputImagen.addEventListener(
            "change",
            mostrarVistaPrevia
        );

    }


    /*
     * Delegación para eliminar tarjetas.
     */

    document.addEventListener(
        "click",
        event => {

            const boton =
                event.target.closest(
                    ".btn-eliminar-oferta-externa"
                );


            if (!boton) return;


            eliminarOfertaExterna(
                boton.dataset.id
            );

        }
    );


    /*
     * Cerrar modal tocando el fondo.
     */

    const modal =
        document.getElementById(
            "modal-oferta-externa"
        );


    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    cerrarModalOferta();

                }

            }
        );

    }

}


/* =========================================================
   ABRIR MODAL
========================================================= */

function abrirModalOferta() {

    const modal =
        document.getElementById(
            "modal-oferta-externa"
        );


    if (!modal) return;


    modal.classList.add(
        "activo"
    );

}


/* =========================================================
   CERRAR MODAL
========================================================= */

function cerrarModalOferta() {

    const modal =
        document.getElementById(
            "modal-oferta-externa"
        );


    if (!modal) return;


    modal.classList.remove(
        "activo"
    );


    limpiarFormularioOferta();

}


/* =========================================================
   LIMPIAR FORMULARIO
========================================================= */

function limpiarFormularioOferta() {

    const nombre =
        document.getElementById(
            "nombre-oferta-externa"
        );


    const precio =
        document.getElementById(
            "precio-oferta-externa"
        );


    const tipo =
        document.getElementById(
            "tipo-oferta-externa"
        );


    const imagen =
        document.getElementById(
            "imagen-oferta-externa"
        );


    const selector =
        document.getElementById(
            "selector-imagen-oferta-externa"
        );


    const texto =
        document.getElementById(
            "texto-imagen-oferta-externa"
        );


    const vista =
        document.getElementById(
            "vista-previa-oferta-externa"
        );


    if (nombre)
        nombre.value = "";


    if (precio)
        precio.value = "";


    if (tipo)
        tipo.value = "";


    if (imagen)
        imagen.value = "";


    if (selector)
        selector.classList.remove(
            "con-imagen"
        );


    if (texto)
        texto.textContent =
            "Seleccionar imagen";


    if (vista) {

        vista.src = "";

    }

}


/* =========================================================
   VISTA PREVIA
========================================================= */

function mostrarVistaPrevia(
    event
) {

    const archivo =
        event.target.files[0];


    if (!archivo) return;


    const selector =
        document.getElementById(
            "selector-imagen-oferta-externa"
        );


    const texto =
        document.getElementById(
            "texto-imagen-oferta-externa"
        );


    const vista =
        document.getElementById(
            "vista-previa-oferta-externa"
        );


    if (!selector || !vista)
        return;


    vista.src =
        URL.createObjectURL(
            archivo
        );


    selector.classList.add(
        "con-imagen"
    );


    if (texto) {

        texto.textContent =
            archivo.name;

    }

}


/* =========================================================
   GUARDAR
========================================================= */

async function guardarOfertaExterna() {

    const boton =
        document.getElementById(
            "btn-guardar-oferta-externa"
        );


    const archivo =
        document.getElementById(
            "imagen-oferta-externa"
        ).files[0];


    const nombre =
        document.getElementById(
            "nombre-oferta-externa"
        ).value.trim();


    const precio =
        parseFloat(
            document.getElementById(
                "precio-oferta-externa"
            ).value
        );


    const tipo =
        document.getElementById(
            "tipo-oferta-externa"
        ).value;


    /*
     * VALIDACIONES
     */

    if (!archivo) {

        alert(
            "Selecciona una imagen."
        );

        return;

    }


    if (!nombre) {

        alert(
            "Escribe el nombre del producto."
        );

        return;

    }


    if (
        isNaN(precio) ||
        precio < 0
    ) {

        alert(
            "Escribe un precio válido."
        );

        return;

    }


    if (!tipo) {

        alert(
            "Selecciona el tipo."
        );

        return;

    }


    try {

        boton.disabled =
            true;


        boton.textContent =
            "Optimizando imagen...";


        /*
         * 1. COMPRIMIR
         */

        const imagenComprimida =
            await comprimirImagenOferta(
                archivo
            );


        /*
         * 2. CLOUDINARY
         */

        boton.textContent =
            "Subiendo imagen...";


        const urlImagen =
            await subirImagenOferta(
                imagenComprimida
            );


        /*
         * 3. FIRESTORE
         */

        boton.textContent =
            "Guardando tarjeta...";


        await addDoc(

            collection(
                dbOfertas,
                COLECCION_OFERTAS
            ),

            {

                nombre:
                    nombre,

                precio:
                    precio,

                tipo:
                    tipo,

                imagen:
                    urlImagen,

                fecha:
                    new Date()

            }

        );


        alert(
            "¡Tarjeta guardada correctamente!"
        );


        cerrarModalOferta();


        /*
         * Actualizamos inmediatamente
         * la lista del administrador.
         */

        await cargarTarjetasAdministrador();


    } catch (error) {

        console.error(
            "Error guardando oferta externa:",
            error
        );


        alert(
            "Error al guardar: " +
            error.message
        );

    } finally {

        boton.disabled =
            false;


        boton.textContent =
            "Guardar tarjeta";

    }

}


/* =========================================================
   COMPRIMIR IMAGEN
========================================================= */

function comprimirImagenOferta(
    archivo
) {

    return new Promise(
        (resolve, reject) => {

            const lector =
                new FileReader();


            lector.onload =
                event => {

                    const imagen =
                        new Image();


                    imagen.onload =
                        () => {

                            const canvas =
                                document.createElement(
                                    "canvas"
                                );


                            const maxWidth =
                                800;


                            const escala =
                                Math.min(
                                    1,
                                    maxWidth /
                                    imagen.width
                                );


                            canvas.width =
                                imagen.width *
                                escala;


                            canvas.height =
                                imagen.height *
                                escala;


                            const contexto =
                                canvas.getContext(
                                    "2d"
                                );


                            contexto.drawImage(

                                imagen,

                                0,
                                0,

                                canvas.width,
                                canvas.height

                            );


                            canvas.toBlob(

                                blob => {

                                    if (!blob) {

                                        reject(
                                            new Error(
                                                "No se pudo comprimir la imagen."
                                            )
                                        );

                                        return;

                                    }


                                    resolve(

                                        new File(

                                            [blob],

                                            archivo.name,

                                            {
                                                type:
                                                    "image/jpeg"
                                            }

                                        )

                                    );

                                },

                                "image/jpeg",

                                0.75

                            );

                        };


                    imagen.onerror =
                        () => {

                            reject(
                                new Error(
                                    "No se pudo leer la imagen."
                                )
                            );

                        };


                    imagen.src =
                        event.target.result;

                };


            lector.onerror =
                () => {

                    reject(
                        new Error(
                            "No se pudo leer el archivo."
                        )
                    );

                };


            lector.readAsDataURL(
                archivo
            );

        }
    );

}


/* =========================================================
   CLOUDINARY
========================================================= */

async function subirImagenOferta(
    archivo
) {

    const formData =
        new FormData();


    formData.append(
        "file",
        archivo
    );


    formData.append(
        "upload_preset",
        UPLOAD_PRESET
    );


    const respuesta =
        await fetch(

            `https://api.cloudinary.com/v1_1/` +
            `${CLOUD_NAME}/image/upload`,

            {

                method:
                    "POST",

                body:
                    formData

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
            "Cloudinary no devolvió la URL."
        );

    }


    return datos.secure_url;

}


/* =========================================================
   ELIMINAR
========================================================= */

async function eliminarOfertaExterna(
    id
) {

    const confirmar =
        confirm(
            "¿Quieres eliminar esta tarjeta?"
        );


    if (!confirmar) return;


    try {

        await deleteDoc(

            doc(
                dbOfertas,
                COLECCION_OFERTAS,
                id
            )

        );


        await cargarTarjetasAdministrador();


    } catch (error) {

        console.error(
            "Error eliminando tarjeta:",
            error
        );


        alert(
            "No se pudo eliminar la tarjeta."
        );

    }

}


/* =========================================================
   SEGURIDAD HTML
========================================================= */

function escaparHTML(
    texto
) {

    return String(texto)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}