//capturar elementos del DOM
let paginaActual = 1;

const btnCargarObras = document.getElementById("btnCargarObras");
const contenedor = document.getElementById("obra-contenedor");

//Botones paginacion
const btnAnterior = document.getElementById("btnAnterior");
const btnSiguiente = document.getElementById("btnSiguiente");
const pagina = document.getElementById("pagina");

//función para obtener obras de arte

async function obtenerObras() {
  console.log("Obteniendo obras de arte de la API...");
  try {
    //mensaje mientras carga

    contenedor.innerHTML = `
      <p class="text-center col-span-full font-bold 
      text-red-600 animate-pulse text-lg">
      Obteniendo Información de Obras de Arte...
      </p>
    `;

    //consumir API

    const respuesta = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/search?q=*&hasImages=true`,
    );

    //validar respuesta

    if (!respuesta.ok) {
      throw new Error("El servidor no responde");
    }

    //convertir respuesta a JSON

    const datos = await respuesta.json();
    console.log("Datos recibidos correctamente:", datos);
    pagina.textContent = `Página ${paginaActual} de ${Math.ceil(datos.total / 20)}`;

    // la API MET utiliza objectsIDs para identificar las obras de arte

    const listaIDs = datos.objectIDs.slice(
      (paginaActual - 1) * 20,
      paginaActual * 20,
    );

    //limpiar contenedor

    contenedor.innerHTML = "";

    //recorrer IDs
    for (let i = 0; i < listaIDs.length; i++) {
      const id = listaIDs[i];
      const respuestaObra = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`,
      );

      const obra = await respuestaObra.json();

      // Saltar a la siguiente iteración si no hay imagen
      if (!obra.primaryImageSmall) {
        continue;
      }

      //crear tarjeta
      const tarjeta = document.createElement("div");

      tarjeta.className =
        "bg-slate-800 border border-yellow-200 p-4 text-center rounded";

      //crear imagen
      const imagen = document.createElement("img");

      imagen.src = `${obra.primaryImageSmall}`;

      imagen.className =
        "w-32 h-32 mx-auto cursor-pointer hover:scale-110 transition";

      //crear número

      const numero = document.createElement("span");

      numero.className = "text-xs font-bold text-white block mt-2";

      numero.textContent = `#${String(obra.objectID)}`;

      //crear nombre

      const nombre = document.createElement("h2");

      nombre.className = "line-clamp-2 text-xl font-bold text-white mt-1";

      nombre.textContent = obra.title;

      //agregar elementos a la tarjeta

      tarjeta.appendChild(nombre);

      tarjeta.appendChild(numero);

      tarjeta.appendChild(imagen);

      //click en la imagen para abrir el modal con detalles de la obra

      imagen.addEventListener("click", () => {
        mostrarDetalle(obra);
      });

      //mostrar tarjeta

      contenedor.appendChild(tarjeta);
    }
  } catch (error) {
    contenedor.innerHTML = `

      <p class="text-red-600 font-bold">
      Error al cargar obras de arte
      </p>

    `;

    console.error(error);
  }
}

//Funcion para Modal

function mostrarDetalle(obra) {
  const modal = document.getElementById("modal");

  const detalle = document.getElementById("detalle");

  detalle.innerHTML = `

    <img
    src="${obra.primaryImage}"
    class="w-48 h-48 mx-auto">

    <h2 class="text-3xl font-bold 
    text-center mt-4 text-red-500">

      ${obra.title}

    </h2>

    <div class="mt-5 space-y-2 text-black">

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
      <strong>Area Gallery:</strong> 
      ${obra.department || "Desconocido"}
      </p>

      <p>
      <strong>Tipo de obra:</strong> 
      ${obra.classification || "Desconocido"}
      </p>

    </div>
  `;

  //mostrar modal

  modal.classList.remove("hidden");
}

//BOTÓN CERRAR MODAL

const btnCerrar = document.getElementById("btnCerrar");

const modal = document.getElementById("modal");

btnCerrar.addEventListener("click", () => {
  modal.classList.add("hidden");
});

//cerrar dando click al fondo oscuro

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

//evento botón cargar

btnCargarObras.addEventListener("click", obtenerObras);
btnSiguiente.addEventListener("click", () => {
  paginaActual++;
  obtenerObras();
});
btnAnterior.addEventListener("click", () => {
  paginaActual--;
  obtenerObras();
});
