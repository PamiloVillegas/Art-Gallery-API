//capturar elementos del DOM
let paginaActual = 1;

// URL de la búsqueda actual (se utilizará para la paginación y los filtros)
let urlBusqueda =
  "https://collectionapi.metmuseum.org/public/collection/v1/search?q=*&hasImages=true";

// Texto del título que se está buscando
let filtroTitulo = "";

// Obras marcadas como favoritas
const favoritos = [];

// Contenedor donde se mostrarán las tarjetas
const contenedor = document.getElementById("obra-contenedor");

// Botones paginación
const btnAnterior = document.getElementById("btnAnterior");
const btnSiguiente = document.getElementById("btnSiguiente");
const pagina = document.getElementById("pagina");

// Obtiene el resultado de una búsqueda
async function obtenerResultadoBusqueda(url) {
  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error("El servidor no responde");
  }

  return await respuesta.json();
}

// Obtiene el detalle de las obras y las muestra en pantalla
async function obtenerDetalleObras(listaIDs) {
  // Limpiar el contenedor antes de comenzar
  contenedor.innerHTML = "";

  for (let i = 0; i < listaIDs.length; i++) {
    const respuesta = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${listaIDs[i]}`,
    );

    const obra = await respuesta.json();

    if (!obra.primaryImageSmall) {
      continue;
    }

    // Si existe un filtro por título,
    // verificar que el título lo contenga.

    if (filtroTitulo !== "") {
      if (!obra.title.toLowerCase().includes(filtroTitulo)) {
        continue;
      }
    }

    mostrarObra(obra);
  }
}

// Muestra una obra en pantalla
function mostrarObra(obra) {
  // Crear tarjeta
  const tarjeta = document.createElement("div");

  tarjeta.className =
    "bg-zinc-500 border border-stone-900 p-4 text-center rounded";

  // Imagen
  const imagen = document.createElement("img");

  imagen.src = obra.primaryImageSmall;

  imagen.className =
    "w-32 h-32 mx-auto cursor-pointer hover:scale-110 transition";

  imagen.addEventListener("click", () => {
    mostrarDetalle(obra);
  });

  // Número
  const numero = document.createElement("span");

  numero.className = "text-xs font-bold text-white block mt-2";

  numero.textContent = "#" + obra.objectID;

  // Nombre
  const nombre = document.createElement("h2");

  nombre.className = "line-clamp-2 text-xl font-bold text-white mt-1";

  nombre.textContent = obra.title;

  // Agregar elementos

  tarjeta.appendChild(nombre);
  tarjeta.appendChild(numero);
  tarjeta.appendChild(imagen);

  contenedor.appendChild(tarjeta);
}

// Cargar departamentos
async function cargarDepartamentos() {
  const respuesta = await fetch(
    "https://collectionapi.metmuseum.org/public/collection/v1/departments",
  );

  const datos = await respuesta.json();

  const select = document.getElementById("departamento");

  for (let i = 0; i < datos.departments.length; i++) {
    const departamento = datos.departments[i];

    const option = document.createElement("option");

    option.value = departamento.departmentId;

    option.textContent = departamento.displayName;

    select.appendChild(option);
  }
}

// Buscar por departamento
function buscarPorDepartamento() {
  const departamento = document.getElementById("departamento").value;

  paginaActual = 1;

  // Limpiar el filtro por título
  filtroTitulo = "";

  // Limpiar el cuadro de texto
  document.getElementById("titulo").value = "";

  if (departamento === "") {
    urlBusqueda =
      "https://collectionapi.metmuseum.org/public/collection/v1/search?q=*&hasImages=true";
  } else {
    urlBusqueda = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=*&hasImages=true&departmentId=${departamento}`;
  }

  obtenerObras();
}

// Buscar por título
function buscarPorTitulo() {
  const titulo = document.getElementById("titulo").value.trim();

  paginaActual = 1;

  filtroTitulo = titulo.toLowerCase();
  if (titulo === "") {
    urlBusqueda =
      "https://collectionapi.metmuseum.org/public/collection/v1/search?q=*&hasImages=true";
  } else {
    urlBusqueda = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(titulo)}&hasImages=true`;
  }
  // Restablecer el departamento
  document.getElementById("departamento").value = "";
  obtenerObras();
}

// Obtiene las obras de arte
async function obtenerObras() {
  try {
    contenedor.innerHTML = `
      <p class="text-center col-span-full font-bold
      text-red-600 animate-pulse text-lg">
      Obteniendo Información de Obras de Arte...
      </p>
    `;

    const datos = await obtenerResultadoBusqueda(urlBusqueda);

    pagina.textContent = `Página ${paginaActual} de ${Math.ceil(datos.total / 20)}`;

    const listaIDs = datos.objectIDs.slice(
      (paginaActual - 1) * 20,
      paginaActual * 20,
    );

    await obtenerDetalleObras(listaIDs);
  } catch (error) {
    console.error(error);

    contenedor.innerHTML = `
      <p class="text-red-600 font-bold">
      Error al cargar obras de arte
      </p>
    `;
  }
}

// Modal

function mostrarDetalle(obra) {
  const modal = document.getElementById("modal");

  const detalle = document.getElementById("detalle");

  detalle.innerHTML = `

    <img
      src="${obra.primaryImage}"
      class="w-48 h-48 mx-auto">

    <h2 class="text-2xl text-center mt-2 text-black">
      ${obra.title}
    </h2>

    <div class="mt-5 text-black">

      <p>
        <strong>ID:</strong>
        ${obra.objectID}
      </p>

      <p>
        <strong>Artista:</strong>
        ${obra.artistDisplayName || "Desconocido"}
      </p>

      <p>
        <strong>Origen:</strong>
        ${obra.artistNationality || "Desconocido"}
      </p>

      <p>
        <strong>Año de la obra:</strong>
        ${obra.objectDate || "Desconocido"}
      </p>

      <p>
        <strong>Departamento:</strong>
        ${obra.department || "Desconocido"}
      </p>

      <p>
        <strong>Clasificación:</strong>
        ${obra.classification || "Desconocido"}
      </p>

    </div>

  `;
  const btnFavorito = document.getElementById("btnFavorito");

  // Agregar o quitar de favoritos al presionar el botón
  btnFavorito.addEventListener("click", () => {
    cambiarFavorito(obra);
    if (esFavorito(obra.objectID)) {
      btnFavorito.src = "estrella-llena.png";
    } else {
      btnFavorito.src = "estrella-vacia.png";
    }
  });
  modal.classList.remove("hidden");
}

// Cerrar modal
const btnCerrar = document.getElementById("btnCerrar");

const modal = document.getElementById("modal");

btnCerrar.addEventListener("click", () => {
  modal.classList.add("hidden");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

// Agregar o quitar de favoritos
function cambiarFavorito(obra) {
  for (let i = 0; i < favoritos.length; i++) {
    if (favoritos[i].objectID === obra.objectID) {
      favoritos.splice(i, 1);
      return;
    }
  }
  favoritos.push(obra);
}

// Verifica si una obra es favorita
function esFavorito(id) {
  for (let i = 0; i < favoritos.length; i++) {
    if (favoritos[i].objectID === id) {
      return true;
    }
  }
  return false;
}

// Muestra las obras favoritas
function mostrarFavoritos() {
  pagina.textContent = "Favoritos";
  contenedor.innerHTML = "";
  for (let i = 0; i < favoritos.length; i++) {
    mostrarObra(favoritos[i]);
  }
}

// Eventos de paginación
btnSiguiente.addEventListener("click", () => {
  paginaActual++;

  obtenerObras();
});

btnAnterior.addEventListener("click", () => {
  if (paginaActual > 1) {
    paginaActual--;

    obtenerObras();
  }
});

// Cargar departamentos al inicio
const selectDepartamento = document.getElementById("departamento");
selectDepartamento.addEventListener("change", buscarPorDepartamento);

// Buscar por título al presionar Buscar
const btnBuscar = document.getElementById("btnBuscar");
btnBuscar.addEventListener("click", buscarPorTitulo);

// Mostrar favoritos al presionar el botón
document
  .getElementById("btnFavoritos")
  .addEventListener("click", mostrarFavoritos);

// Inicio de la aplicación
obtenerObras();
cargarDepartamentos();
