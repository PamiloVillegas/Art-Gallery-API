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
      `https://api.artic.edu/api/v1/artworks?page=${paginaActual}`,
    );

    //validar respuesta

    if (!respuesta.ok) {
      throw new Error("El servidor no responde");
    }

    //convertir respuesta a JSON

    const datos = await respuesta.json();
    pagina.textContent = `Página ${paginaActual} de ${datos.pages}`;

    //The Simpsons API utiliza results

    const listaObras = datos.results;

    //limpiar contenedor

    contenedor.innerHTML = "";

    console.log("Datos recibidos correctamente:", listaObras);

    //recorrer obras

    for (let i = 0; i < listaObras.length; i++) {
      const obra = listaObras[i];

      //crear tarjeta

      const tarjeta = document.createElement("div");

      tarjeta.className =
        "bg-slate-800 border border-yellow-200 p-4 text-center rounded";

      //crear imagen

      //const imagen = document.createElement("img");

      //imagen.src = `https://cdn.thesimpsonsapi.com/500${personaje.portrait_path}`;

      //imagen.alt = personaje.name;

      //imagen.className =
      // "w-32 h-32 mx-auto cursor-pointer hover:scale-110 transition";

      //crear número

      const numero = document.createElement("span");

      numero.className = "text-xs font-bold text-white block mt-2";

      numero.textContent = `#${String(personaje.id).padStart(3, "0")}`;

      //crear nombre

      const nombre = document.createElement("h2");

      nombre.className = "text-xl font-bold text-white mt-1";

      nombre.textContent = personaje.name;

      //agregar elementos a la tarjeta

      tarjeta.appendChild(nombre);

      tarjeta.appendChild(numero);

      tarjeta.appendChild(autor);

      //click en la imagen para abrir el modal con detalles de la obra

      imagen.addEventListener("click", () => {
        mostrarDetalle(personaje);
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

function mostrarDetalle(personaje) {
  const modal = document.getElementById("modal");

  const detalle = document.getElementById("detalle");

  detalle.innerHTML = `

    <img
    src="https://cdn.thesimpsonsapi.com/500${personaje.portrait_path}"
    class="w-48 h-48 mx-auto">

    <h2 class="text-3xl font-bold 
    text-center mt-4 text-red-500">

      ${personaje.name}

    </h2>

    <div class="mt-5 space-y-2 text-black">

      <p>
      <strong>ID:</strong> 
      ${personaje.id}
      </p>

      <p>
      <strong>Genero:</strong> 
      ${personaje.gender}
      </p>

      <p>
      <strong>Edad:</strong> 
      ${personaje.age}
      </p>

      <p>
      <strong>Ocupacion:</strong> 
      ${personaje.occupation}
      </p>

      <p>
      <strong>Frase:</strong> 
      ${personaje.phrases[0]}
      </p>

      <p>
      <strong>Estado:</strong> 
      ${personaje.status}
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
