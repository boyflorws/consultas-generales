function buscarExamen() {
  const dni = document.getElementById('dniInput').value.trim();
  const resultadoDiv = document.getElementById('resultado');
  resultadoDiv.innerHTML = '';

  // Validar el formato del DNI (opcional pero recomendable)
  if (!dni || dni.length !== 8 || isNaN(dni)) {
    resultadoDiv.innerHTML = `
      <div class="bg-yellow-700 text-white p-4 rounded-xl shadow-md text-center">
        <p class="font-semibold">Por favor, ingrese un DNI válido de 8 dígitos.</p>
      </div>
    `;
    return;
  }

  Papa.parse('../data/examenes.csv?' + new Date().getTime(), {

    download: true,
    header: true,
    delimiter: ';', // Asegúrate que sea el correcto según tu CSV
    skipEmptyLines: true,
    complete: function(results) {
      const data = results.data;

      // Normalizar y filtrar coincidencias exactas por DNI
      const coincidencias = data.filter(row => (row.dni || '').trim() === dni);

      if (coincidencias.length === 1) {
        const match = coincidencias[0];

        resultadoDiv.innerHTML = `
          <div class="bg-gray-800 text-white rounded-2xl shadow-lg p-6 space-y-2 w-full max-w-md mx-auto">
            <p><span class="font-semibold text-indigo-400">Nombre:</span> ${match.nombre}</p>
            <p><span class="font-semibold text-indigo-400">DNI:</span> ${match.dni}</p>
            <p><span class="font-semibold text-indigo-400">Carrera:</span> ${match.carrera}</p>
            <p><span class="font-semibold text-indigo-400">Laboratorio:</span> ${match.lugar}</p>
            <p><span class="font-semibold text-indigo-400">Edificio:</span> ${match.edificio}</p>
            <p><span class="font-semibold text-indigo-400">Fecha:</span> ${match.fecha}</p>
            <p><span class="font-semibold text-indigo-400">Hora:</span> ${match.hora}</p>

            <p class="text-center text-lg font-bold text-red-400 mt-6">Imagen de Referencia</p>
            <div class="flex justify-center mt-4">
              <img src="../img/referencia1.jpg" alt="Referencia" class="rounded-xl ring-2 ring-indigo-400 max-w-full h-auto">
            </div>
          </div>
        `;
      } else if (coincidencias.length > 1) {
        resultadoDiv.innerHTML = `
          <div class="bg-red-700 text-white p-4 rounded-xl shadow-md text-center">
            <p class="font-semibold">Error: se encontraron múltiples registros con el mismo DNI (${dni}). Contacte a soporte.</p>
          </div>
        `;
        console.warn('DNI duplicado detectado:', dni, coincidencias);
      } else {
        resultadoDiv.innerHTML = `
          <div class="bg-red-800 text-white p-4 rounded-xl shadow-md text-center">
            <p class="font-semibold">No se encontró ningún registro con ese DNI.</p>
          </div>
        `;
      }
    }
  });
}
