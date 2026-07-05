import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, addDoc, deleteDoc, doc, updateDoc, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
let idProductoEditando = null;

// Definición inmediata para evitar ReferenceError
window.cambiarCantidad = function(btn, cambio) {
    const tarjeta = btn.closest('.tarjeta-producto');
    if (!tarjeta) return;
    const display = tarjeta.querySelector('.cantidad-valor');
    if (!display) return;
    
    // Obtenemos el valor actual (float para soportar decimales escritos)
    let valorActual = parseFloat(display.innerText) || 0;
    
    // Sumamos/Restamos el cambio (como los botones son enteros, funcionará bien)
    let nuevoValor = Math.max(0, Math.floor(valorActual) + cambio);
    
    display.innerText = nuevoValor;
};



 async function cargarCatalogo(esAdmin = false) {
    const contenedor = document.getElementById('contenedor-admin');
    if (!contenedor) return;

    contenedor.innerHTML = '<div class="loader"></div>';

    try {
        // --- NUEVA LÓGICA DE FILTRO ---
        const filtro = localStorage.getItem('filtro');
        let productosRef;

        if (filtro) {
            // Filtra por categoría en Firebase
            productosRef = query(collection(db, "productos"), where("categoria", "==", filtro));
        } else {
            // Trae todo si no hay filtro
            productosRef = collection(db, "productos");
        }
        // ------------------------------

        const querySnapshot = await getDocs(productosRef);
        
        contenedor.innerHTML = "";
        
        if (querySnapshot.empty) {
            contenedor.innerHTML = `<p style="text-align:center; color:#888;">No hay productos en ${filtro || 'esta sección'}.</p>`;
            return;
        }

        querySnapshot.forEach((doc) => {
            const p = doc.data();
            if (!esAdmin && p.oculto === true) return;

            const iconoOjo = esAdmin ? `
                <div class="icono-ojo" onclick="toggleOcultar('${doc.id}', ${!!p.oculto})" 
                     style="cursor:pointer; position:absolute; top:10px; right:10px; z-index:10; background: white; padding: 5px; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                    <i class="fa-solid ${p.oculto ? 'fa-eye-slash' : 'fa-eye'}"></i>
                </div>
            ` : "";

            const botonesAdmin = esAdmin ? `
                <div class="acciones-card">
                    <button class="btn-editar" onclick="prepararEdicion('${doc.id}', '${p.nombre}', ${p.precio}, '${p.descripcion}', '${p.categoria}')">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarProducto('${doc.id}')">Eliminar</button>
                </div>
            ` : "";
            
            const claseOscura = p.oculto ? 'producto-oculto' : '';

            contenedor.innerHTML += `
                <div class="tarjeta-producto ${claseOscura}" style="position: relative;">
                    ${iconoOjo}
                    <div class="img-container" onclick="verDetalle('${p.nombre}', ${p.precio}, '${p.descripcion}', '${p.imagen}', '${p.categoria}')">
                        <img src="${p.imagen}" alt="${p.nombre}">
                    </div>
                    <div class="info-producto">
                        <span class="etiqueta-cat">${p.categoria}</span>
                        <h3>${p.nombre}</h3>
                        <p class="precio">$${p.precio}</p>
                    </div>
                    ${!esAdmin ? `
                        <div class="selector-cantidad" onclick="event.stopPropagation()">
                            <button class="btn-restar" onclick="cambiarCantidad(this, -1)">-</button>
                            <span class="cantidad-valor" contenteditable="true">0</span>
                            <button class="btn-sumar" onclick="cambiarCantidad(this, 1)">+</button>
                        </div>
                        <button class="btn-agregar-carrito" onclick="agregarAlCarrito(this)">Agregar</button>
                    ` : ""}
                    ${botonesAdmin} 
                </div>
            `;
        });
        document.dispatchEvent(new CustomEvent('productosRenderizados'));
    } catch (error) {
        console.error("Error al cargar productos:", error);
        contenedor.innerHTML = `<p style="text-align:center;">Error de conexión. <button onclick="location.reload()">Reintentar</button></p>`;
    }
}


document.addEventListener('error', function(e) {
    if (e.target.tagName.toLowerCase() === 'img') {
        e.target.src = 'ruta/a/tu/imagen-placeholder.png';
    }
}, true);





// --- 2. INICIALIZACIÓN SEGURA ---
document.addEventListener('DOMContentLoaded', () => {
    
   





// --- LÓGICA DEL BUSCADOR ---
    const contenedorBusqueda = document.querySelector('.contenedor-busqueda');
    const inputBusqueda = document.querySelector('.input-busqueda');

    if (contenedorBusqueda && inputBusqueda) {
        // Abrir buscador
        contenedorBusqueda.addEventListener('click', (e) => {
            e.stopPropagation();
            contenedorBusqueda.classList.add('busqueda-activa');
            inputBusqueda.style.display = 'block';
            inputBusqueda.focus();
        });

        // Cerrar al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!contenedorBusqueda.contains(e.target)) {
                contenedorBusqueda.classList.remove('busqueda-activa');
                inputBusqueda.style.display = 'none';
            }
        });

        // Lógica de filtrado (ESTO ES LO QUE HACÍA FALTA)
        inputBusqueda.addEventListener('input', (e) => {
            const valorBusqueda = e.target.value.toLowerCase();
            const productos = document.querySelectorAll('.tarjeta-producto');

            productos.forEach(tarjeta => {
                const nombre = tarjeta.querySelector('h3')?.innerText.toLowerCase() || "";
                // Si el nombre coincide, se muestra, si no, se oculta
                tarjeta.style.display = nombre.includes(valorBusqueda) ? 'block' : 'none';
            });
        });
    }






// --- NUEVA LÓGICA DE ENCUESTA (EN index.html / script.js) ---
async function iniciarSistemaEncuesta() {
    
    const contenedor = document.getElementById('contenedor-encuesta-cliente');
    if (!contenedor) return;

    try {
        const q = query(collection(db, "encuestas"), orderBy("fecha", "desc"), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docEncuesta = querySnapshot.docs[0];
            const data = docEncuesta.data();
            const idEncuesta = docEncuesta.id; // Este es el ID único de la encuesta nueva

            // --- NUEVA LÓGICA DE VERIFICACIÓN ---
            // Recuperamos el ID de la última encuesta en la que el usuario votó
            const encuestaVotada = localStorage.getItem('encuesta_votada_id');

            // Si el ID de la encuesta actual es IGUAL al ID guardado, significa que ya votó
            if (encuestaVotada === idEncuesta) {
                console.log("Ya votó en esta encuesta específica.");
                contenedor.style.display = 'none';
                return;
            }
            // ------------------------------------

            // ... (resto de tu código: mostrar pregunta y opciones) ...
            const preguntaEl = document.getElementById('pregunta-cliente');
            if (preguntaEl) preguntaEl.innerText = data.pregunta;

            const opcionesCont = document.getElementById('opciones-cliente');
            if (opcionesCont) {
                opcionesCont.innerHTML = "";
                data.opciones.forEach(texto => {
                    const btn = document.createElement("button");
                    btn.innerText = texto;
                    btn.className = "btn-agregar-nuevo";
                    
                    btn.onclick = async () => {
                        await addDoc(collection(db, "votos"), { 
                            opcion: texto, 
                            encuestaId: idEncuesta, 
                            fecha: new Date() 
                        });
                        
                        // Guardamos EL ID de la encuesta, no solo un "true"
                        localStorage.setItem('encuesta_votada_id', idEncuesta);
                        contenedor.style.display = 'none';
                    };
                    opcionesCont.appendChild(btn);
                });
            }
            contenedor.style.display = 'flex';
        } else {
            contenedor.style.display = 'none';
        }
    } catch (error) {
        console.error("Error al cargar la encuesta:", error);
    }
}

const db = getFirestore(app);
console.log("El script ha iniciado correctamente"); // PON ESTO AQUÍ
iniciarSistemaEncuesta(); // Y LLÁMALO AQUÍ PARA PROBAR





















    const contenedor = document.getElementById('contenedor-admin');
    if (!contenedor) return;

    const btnGuardar = document.getElementById('btn-guardar-producto');
    const esAdmin = btnGuardar !== null;

    // 1. Cargamos el catálogo
    cargarCatalogo(esAdmin);

    // 2. Eventos de administrador
    if (esAdmin) {
        btnGuardar.addEventListener('click', procesarGuardado);
        document.getElementById('btn-cerrar-modal')?.addEventListener('click', cerrarEdicion);
        document.getElementById('btn-abrir-modal')?.addEventListener('click', abrirModalNuevo);
    }

    // 3. Input Archivo
    const inputArchivo = document.getElementById('input-archivo');
    if (inputArchivo) {
        inputArchivo.addEventListener('change', function() {
            const nombreArchivo = document.getElementById('nombre-archivo');
            if (nombreArchivo) nombreArchivo.textContent = this.files[0]?.name || "Ninguna foto";
        });
    }

 

});





// Función para manejar el guardado (tanto nuevo como edición)
async function procesarGuardado() {
    const btnGuardar = document.getElementById('btn-guardar-producto');
    const inputArchivo = document.getElementById('input-archivo');
    const archivo = inputArchivo.files[0];
    const nombre = document.getElementById('edit-nombre').value;
    const precio = parseFloat(document.getElementById('edit-precio').value);
    const desc = document.getElementById('edit-desc').value;
    const categoria = document.getElementById('edit-categoria').value;

    if (!nombre || isNaN(precio) || !categoria) {
        return alert("Por favor, completa todos los campos.");
    }

    btnGuardar.disabled = true;
    btnGuardar.innerText = "Optimizando imagen...";

    try {
        let urlImagen = "";

        // Si hay un archivo nuevo, lo comprimimos y subimos
        if (archivo) {
            const archivoComprimido = await comprimirImagen(archivo);
            btnGuardar.innerText = "Subiendo a la nube...";
            urlImagen = await subirImagenACloudinary(archivoComprimido);
        }

        if (idProductoEditando) {
            // --- MODO EDICIÓN ---
            const docRef = doc(db, "productos", idProductoEditando);
            const datosActualizar = { nombre, precio, descripcion: desc, categoria };
            if (urlImagen) datosActualizar.imagen = urlImagen;
            await updateDoc(docRef, datosActualizar);
            alert("Producto actualizado");
        } else {
            // --- MODO NUEVO ---
            if (!archivo) return alert("Selecciona una foto para el nuevo producto");
            await addDoc(collection(db, "productos"), {
                nombre, precio, descripcion: desc, categoria, imagen: urlImagen
            });
            alert("Producto creado con éxito");
        }
        
        location.reload();
    } catch (e) {
        console.error(e);
        alert("Error al procesar: " + e.message);
        btnGuardar.disabled = false;
        btnGuardar.innerText = idProductoEditando ? "Actualizar Producto" : "Guardar Producto";
    }
}

// Esta función convierte cualquier imagen en una versión ligera y rápida
async function comprimirImagen(archivo) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(archivo);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxW = 800; // Tamaño óptimo para web
                const scale = maxW / img.width;
                canvas.width = maxW;
                canvas.height = img.height * scale;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    resolve(new File([blob], archivo.name, { type: 'image/jpeg' }));
                }, 'image/jpeg', 0.7); // Calidad al 70%
            };
        };
    });
}




// Función auxiliar para no repetir código de Cloudinary
async function subirImagenACloudinary(archivo) {
    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("upload_preset", "subir_productos");
    const res = await fetch(`https://api.cloudinary.com/v1_1/druslhu1g/image/upload`, {
        method: "POST", body: formData
    });
    const data = await res.json();
    return data.secure_url;
}


async function crearNuevoProducto() {
    const inputArchivo = document.getElementById('input-archivo');
    const archivo = inputArchivo.files[0];

    // Validaciones
    if (!archivo) return alert("Selecciona una foto");
    const categoria = document.getElementById('edit-categoria').value;
    if (!categoria) return alert("Por favor, selecciona una categoría");

    // TUS DATOS
    const CLOUD_NAME = "druslhu1g"; 
    const UPLOAD_PRESET = "subir_productos"; 

    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData
        });
        
        const data = await res.json();
        const urlImagen = data.secure_url;

        // Guardamos en Firestore
        await addDoc(collection(db, "productos"), {
            nombre: document.getElementById('edit-nombre').value,
            precio: parseFloat(document.getElementById('edit-precio').value),
            descripcion: document.getElementById('edit-desc').value,
            categoria: categoria,
            imagen: urlImagen
        });

        alert("¡Producto guardado exitosamente!");
        location.reload(); 
    } catch (e) {
        console.error(e);
        alert("Error al subir: " + e.message);
    }
}


    // 4. Carrusel
    if (document.getElementById("pistaPublicidad")) iniciarCarrusel();






// Abrir/Cerrar Menú Lateral
window.toggleMenu = function() {
    const menu = document.getElementById('menu-lateral');
    const fondo = document.getElementById('fondo-oscuro-menu');
    menu.classList.toggle('carrito-activo');
    fondo.classList.toggle('fondo-activo');
};

// Abrir/Cerrar Submenú
window.toggleSubmenu = function(e) {
    e.preventDefault();
    const padre = e.currentTarget.closest('.categoria-padre');
    const submenu = padre.querySelector('.submenu');
    const flecha = e.currentTarget.querySelector('.flecha');
    
    const esVisible = submenu.style.display === 'block';
    submenu.style.display = esVisible ? 'none' : 'block';
    
    if (flecha) {
        flecha.style.transform = esVisible ? 'rotate(0deg)' : 'rotate(180deg)';
    }
};


// Función que prepara el modal
window.prepararEdicion = (id, nombre, precio, desc, categoria) => {
    idProductoEditando = id;
    document.getElementById('edit-nombre').value = nombre;
    document.getElementById('edit-precio').value = precio;
    document.getElementById('edit-desc').value = desc;
    document.getElementById('edit-categoria').value = categoria;
    
    document.getElementById('btn-guardar-producto').innerText = "Actualizar Producto";
    document.getElementById('modal-editar').classList.replace('modal-oculto', 'modal-abierto');
};




// Asegúrate de seleccionar el botón y el modal
const btnCerrar = document.getElementById('btn-cerrar-encuesta');
const modal = document.getElementById('modal-crear-encuesta');

if (btnCerrar) {
    btnCerrar.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}


function iniciarCarrusel() {
    const pista = document.getElementById("pistaPublicidad");
    const slides = document.querySelectorAll(".slide-publicidad");
    if (!pista || slides.length === 0) return;
    let i = 0;
    setInterval(() => {
        i = (i + 1) % slides.length;
        pista.style.transform = `translateX(-${i * (100 / slides.length)}%)`;
    }, 4000);
}



// --- FUNCIÓN VER DETALLE BLINDADA ---
function verDetalle(nombre, precio, descripcion, imagen, categoria) {
    const modal = document.getElementById('modal-detalle');
    
    // Si no existe el modal en la página (ej. index sin el código extra), no hacemos nada
    if (!modal) {
        console.warn("El modal de detalle no está en esta página.");
        return;
    }

    // Llenado seguro de datos
    const img = document.getElementById('modal-img');
    const nom = document.getElementById('modal-nombre');
    const pre = document.getElementById('modal-precio');
    const des = document.getElementById('modal-desc');
    const cat = document.getElementById('modal-categoria');

    if (img) img.src = imagen;
    if (nom) nom.innerText = nombre;
    if (pre) pre.innerText = "$" + precio;
    if (des) des.innerText = descripcion || "Sin descripción.";
    if (cat) cat.innerText = categoria || "";

    modal.classList.replace('modal-oculto', 'modal-abierto');
}
























async function eliminarProducto(id) {
    if (confirm("¿Seguro que quieres borrar este producto?")) {
        try {
            await deleteDoc(doc(db, "productos", id));
            cargarCatalogo();
        } catch (e) {
            alert("Error al borrar: " + e.message);
        }
    }
}

// --- CONEXIÓN DE EVENTOS ---
function abrirModalNuevo() {
    const modal = document.getElementById('modal-editar');
    if(modal) modal.classList.replace('modal-oculto', 'modal-abierto');
}

function cerrarEdicion() {
    const modal = document.getElementById('modal-editar');
    if(modal) {
        modal.classList.replace('modal-abierto', 'modal-oculto');
        
        // --- ESTO ES LO IMPORTANTE ---
        idProductoEditando = null; 
        const btnGuardar = document.getElementById('btn-guardar-producto');
        if (btnGuardar) {
            btnGuardar.innerText = "Guardar Producto";
        }
        // Limpiamos los inputs
        document.getElementById('edit-nombre').value = "";
        document.getElementById('edit-precio').value = "";
        document.getElementById('edit-desc').value = "";
    }
}






let carrito = [];

window.agregarAlCarrito = function(btn) {
    const tarjeta = btn.closest('.tarjeta-producto');
    const display = tarjeta.querySelector('.cantidad-valor');
    
    // parseFloat lee el número con decimales si el usuario escribió "0.5" o "1.5"
    const cantidad = parseFloat(display.innerText);

    if (cantidad > 0) {
        const nombre = tarjeta.querySelector('h3').innerText;
        // Limpiamos el precio para evitar errores de formato
        const precioTexto = tarjeta.querySelector('.precio').innerText.replace('$', '').replace(',', '.');
        const precio = parseFloat(precioTexto);
        const imagen = tarjeta.querySelector('img').src; 
        
        carrito.push({ nombre, precio, cantidad, imagen });
        actualizarCarritoHTML();
        alert(`Agregado: ${cantidad} al carrito.`);
    } else {
        alert("Por favor, ingresa una cantidad válida mayor a 0.");
    }
};



function actualizarCarritoHTML() {
    const lista = document.getElementById('lista-productos-carrito');
    const totalDiv = document.getElementById('total-pagar-carrito');
    const badge = document.querySelector('.contador-badge');
    
    lista.innerHTML = ""; 
    let total = 0;
    
    carrito.forEach((item, index) => {
        total += item.precio * item.cantidad;
        
        lista.innerHTML += `
            <div class="item-carrito">
                <img src="${item.imagen}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; margin-right: 12px;">
                <div style="line-height: 1.2;">
                    <strong style="display: block; font-size: 0.95rem;">${item.nombre}</strong>
                    <span style="color: #313131; font-size: 0.85rem;">${item.cantidad} x $${item.precio.toFixed(2)}</span>
                </div>
                <button class="btn-eliminar-item" onclick="eliminarDelCarrito(${index})">×</button>
            </div>
        `;
    });
    
    // Aplicamos una clase para darle el formato profesional
    totalDiv.innerHTML = `
        <div class="total-carrito-container">
            Total: <span style="color: #313131;">$${total.toFixed(2)}</span>
        </div>
    `;
    badge.innerText = carrito.length;
}
// Nueva función para borrar un producto específico
window.eliminarDelCarrito = function(index) {
    carrito.splice(index, 1); // Elimina el producto del array
    actualizarCarritoHTML();   // Refresca la vista
};


// --- FUNCIÓN PARA SUMAR/RESTAR ---

function cambiarCantidad(btn, cambio) {
    const tarjeta = btn.closest('.tarjeta-producto');
    if (!tarjeta) return; // Validación de seguridad
    const display = tarjeta.querySelector('.cantidad-valor');
    if (!display) return;
    
    let cantidad = parseInt(display.innerText) + cambio;
    if (cantidad < 0) cantidad = 0;
    display.innerText = cantidad;
}




window.vaciarCarrito = function() {
    if (carrito.length === 0) return; // Si ya está vacío, no hacemos nada

    if (confirm) {
        carrito = []; // Reiniciamos el array a vacío
        actualizarCarritoHTML(); // Refrescamos el panel para que se vea vacío
    }
};






// PEDIR WHATSAAP
window.enviarWhatsApp = function() {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío. Agrega productos antes de realizar tu pedido.");
        return;
    }

    // Tu número de teléfono (asegúrate de incluir el código de país, ej: 58 para Venezuela)
    const telefono = "584264373589"; 
    let mensaje = "¡Hola! Quiero realizar el siguiente pedido:\n\n";
    let totalGeneral = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        mensaje += `* ${item.nombre} (x${item.cantidad}) - $${subtotal.toFixed(2)}\n`;
        totalGeneral += subtotal;
    });

    mensaje += `\n*Total a pagar: $${totalGeneral.toFixed(2)}*`;
    mensaje += `\n\n¿Está disponible mi pedido?`;

    // Codificamos el mensaje para que sea una URL válida
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    
    // Abrir en una nueva pestaña
    window.open(url, '_blank');
};
















// --- LÓGICA DEL CARRITO (MODAL) ---
// Asegúrate de que este bloque esté en tu script.js
window.abrirCarrito = function() {
    console.log("Intentando abrir carrito..."); // MIRA LA CONSOLA (F12)
    const panel = document.getElementById('panel-carrito-lateral');
    const fondo = document.getElementById('fondo-oscuro-carrito');
    
    if (panel) {
        panel.classList.add('carrito-activo');
        fondo.classList.add('fondo-activo');
    } else {
        console.error("No se encontró el elemento panel-carrito-lateral");
    }
};

window.cerrarCarrito = function() {
    const panel = document.getElementById('panel-carrito-lateral');
    const fondo = document.getElementById('fondo-oscuro-carrito');
    
    panel.classList.remove('carrito-activo');
    fondo.classList.remove('fondo-activo');
};














// Función para cerrar el modal de detalle
function cerrarDetalle() {
    const modal = document.getElementById('modal-detalle');
    if (modal) {
        modal.classList.remove('modal-abierto');
        modal.classList.add('modal-oculto');
    }
}




// Función para validar el acceso al panel administrativo
function verificar() {
    const passwordInput = document.getElementById('pass').value;
    
    // Define aquí tu contraseña secreta
    const contrasenaCorrecta = "12345678"; 

    if (passwordInput === contrasenaCorrecta) {
        // Redirige al administrador a la página de gestión
        window.location.href = "admin.html"; 
    } else {
        alert("Contraseña incorrecta, intenta de nuevo.");
        document.getElementById('pass').value = ""; // Limpia el campo
    }
}



async function toggleOcultar(id, estadoActual) {
    try {
        const docRef = doc(db, "productos", id);
        await updateDoc(docRef, { oculto: !estadoActual });
        
        // Verifica si estamos en la página de admin buscando el botón
        const btnGuardar = document.getElementById('btn-guardar-producto');
        const esAdmin = btnGuardar !== null;
        
        // Llamada global segura
        if (window.cargarCatalogo) {
            window.cargarCatalogo(esAdmin);
        }
    } catch (e) {
        alert("Error al cambiar visibilidad: " + e.message);
    }
}



// Espera a que el documento cargue completamente

    const btnEncuesta = document.getElementById('btn-abrir-encuesta');
    
    if (btnEncuesta) {
        btnEncuesta.addEventListener('click', () => {
            // Esto muestra el modal al hacer clic
            const modal = document.getElementById('modal-crear-encuesta');
            if (modal) {
                modal.style.display = 'flex'; 
            } else {
                console.error("El modal 'modal-crear-encuesta' no existe en el HTML");
            }
        });
    }





// Al final de tu archivo script.js, añade esto:
window.limpiarFiltro = () => {
    localStorage.removeItem('filtro');
    location.reload(); // Recarga para limpiar el estado
};

window.filtrarPorCategoria = (categoria) => {
    localStorage.setItem('filtro', categoria);
    location.reload(); // Recarga para aplicar el nuevo filtro
};


// Función para subir la publicidad a Firebase
async function subirPublicidad() {
    const archivo = document.getElementById('input-archivo-pub').files[0];
    const link = document.getElementById('link-publicidad').value;
    const btn = document.getElementById('btn-guardar-pub');

    if (!archivo || !link) return alert("Selecciona imagen y pon un link");

    btn.innerText = "Subiendo...";
    btn.disabled = true;

    try {
        // 1. Subir a Cloudinary (usando tu función existente)
        const urlImagen = await subirImagenACloudinary(archivo);

        // 2. Guardar en Firestore en una colección llamada 'publicidad'
        await addDoc(collection(db, "publicidad"), {
            imagen: urlImagen,
            link: link,
            fecha: new Date()
        });

        alert("Publicidad agregada");
        location.reload(); // Recargamos para ver el nuevo slide
    } catch (e) {
        alert("Error: " + e.message);
        btn.disabled = false;
        btn.innerText = "Guardar y Publicar";
    }
}







window.abrirCarrito = abrirCarrito;
window.cerrarCarrito = cerrarCarrito;
window.verDetalle = verDetalle;
window.cerrarDetalle = cerrarDetalle;
window.prepararEdicion = prepararEdicion;
window.eliminarProducto = eliminarProducto;
window.verificar = verificar;
window.toggleOcultar = toggleOcultar;
window.vaciarCarrito = vaciarCarrito;
window.enviarWhatsApp = enviarWhatsApp;
window.cambiarCantidad = cambiarCantidad;
window.agregarAlCarrito = agregarAlCarrito;
window.cargarCatalogo = cargarCatalogo; // AGREGA ESTA LÍNEA