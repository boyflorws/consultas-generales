function buscarCita() {
  const dniInput = document.getElementById('dniInput').value.trim();
  const resultadoDiv = document.getElementById('resultado');
  resultadoDiv.innerHTML = '';

  // Validación de DNI
  if (!dniInput || dniInput.length !== 8 || isNaN(dniInput)) {
    resultadoDiv.innerHTML = `
      <div class="bg-yellow-700 text-white p-4 rounded-xl shadow-md text-center">
        <p class="font-semibold">Por favor, ingrese un DNI válido de 8 dígitos.</p>
      </div>
    `;
    return;
  }

  Papa.parse('../data/citas.csv?' + new Date().getTime(), {
    download: true,
    header: true,
    delimiter: ';',
    skipEmptyLines: true,
    complete: function (results) {
      const data = results.data;
      const coincidencias = data.filter(row => (row.dni || '').trim() === dniInput);

      if (coincidencias.length === 1) {
        const match = coincidencias[0];
        const esVirtual = (match.estado || '').toLowerCase() === 'virtual';
        const carrera = (match.carrera || 'No especificada').trim();

        const citaPendiente = (!match.fecha.trim() && !match.hora.trim() && !match.encargado.trim());

        if (citaPendiente) {
          resultadoDiv.innerHTML = `
            <div class="bg-blue-900 text-white rounded-2xl shadow-lg p-6 space-y-4 w-full max-w-md mx-auto">
              <p class="text-lg font-semibold text-center mb-4">🎓 Estimad@ ${match.nombre}</p>
              <p class="text-center">Usted se está postulando a la carrera de <span class="font-semibold text-yellow-400">${carrera}</span>.</p>
              <div class="mt-6 p-4 bg-yellow-400 text-black rounded-lg text-center">
                <p class="font-bold text-lg">Su cita psicológica será programada en las próximas fechas.</p>
              </div>
            </div>
          `;
          return;
        }

        // Procesar fecha y hora para comparación precisa
        const [day, month, year] = match.fecha.trim().split('/').map(Number);
        const [timePart, meridiem] = match.hora.trim().split(' ');
        let [hour, minute] = timePart.split(':').map(Number);
        if (meridiem.toLowerCase().includes('p.') && hour < 12) hour += 12;
        if (meridiem.toLowerCase().includes('a.') && hour === 12) hour = 0;

        const fechaEntrevistaTime = new Date(year, month - 1, day, hour, minute);
        const fechaEntrevistaMas2Horas = new Date(fechaEntrevistaTime.getTime() + 2 * 60 * 60 * 1000);

        const now = new Date();

        // Si ya pasaron 2 horas desde la cita
        if (now >= fechaEntrevistaMas2Horas) {
          resultadoDiv.innerHTML = `
            <div class="bg-green-900 text-white rounded-2xl shadow-lg p-6 space-y-4 w-full max-w-md mx-auto">
              <p class="text-lg font-semibold text-center mb-4">🎓 Estimad@ ${match.nombre}</p>
              <p class="text-center">Usted se está postulando a la carrera de <span class="font-semibold text-yellow-400">${carrera}</span>.</p>
              <div class="mt-6 p-4 bg-blue-500 text-white rounded-lg text-center">
                <p class="font-bold text-lg">✔️ Usted ya pasó la entrevista el día ${match.fecha} a las ${match.hora}.</p>
                <p class="mt-2">Gracias por su participación.</p>
              </div>
            </div>
          `;
          return;
        }

        // Si la cita es futura o aún no han pasado 2 horas
        let recomendaciones = '';
        let recordatorio = '';
        let infoAdicional = '';
        let imagenReferencia = '';

        if (esVirtual) {
          infoAdicional = `
            <div class="mt-6 p-4 bg-blue-500 text-white rounded-lg space-y-2">
              <p class="font-bold text-lg mb-2">Enlace de la Entrevista Virtual:</p>
              <p><a href="${match.enlace}" target="_blank" class="underline text-white break-words">${match.enlace}</a></p>
              <p class="font-bold mt-2">Filial:</p>
              <p>${match.filial}</p>
            </div>
          `;

          recomendaciones = `
            <div class="mt-6 p-4 bg-green-400 text-black rounded-lg space-y-2">
              <p class="font-bold text-lg mb-2">Se Recomienda:</p>
              <ul class="list-disc list-inside space-y-1">
                <li>Conectarse <span class="font-semibold">15 minutos antes</span> del horario programado.</li>
                <li>Contar con cámara encendida y audio habilitado durante toda la entrevista.</li>
                <li>Estar en un lugar tranquilo, sin interrupciones ni ruidos.</li>
                <li>Vestimenta formal adecuada para la entrevista virtual.</li>
                <li>Portar su DNI a la mano para su verificación.</li>
              </ul>
            </div>
          `;

          recordatorio = `
            <div class="mt-6 p-4 bg-yellow-400 text-black rounded-lg space-y-2">
              <p class="font-bold text-lg mb-2">RECUERDE:</p>
              <ol class="list-decimal list-inside space-y-1">
                <li>La entrevista no es reprogramable, debe conectarse puntual.</li>
                <li>La entrevista tiene un porcentaje de valor para su ingreso.</li>
                <li>Debe haber completado el test previamente enviado.</li>
              </ol>
            </div>
          `;
        } else {
          recomendaciones = `
            <div class="mt-6 p-4 bg-green-400 text-black rounded-lg space-y-2">
              <p class="font-bold text-lg mb-2">Se Recomienda:</p>
              <ul class="list-disc list-inside space-y-1">
                <li>Estar <span class="font-semibold">PUNTUAL</span> (15 min antes).</li>
                <li>Ropa adecuada para la entrevista presencial.</li>
                <li>Portar su DNI, un borrador y un lápiz.</li>
              </ul>
            </div>
          `;

          recordatorio = `
            <div class="mt-6 p-4 bg-yellow-400 text-black rounded-lg space-y-2">
              <p class="font-bold text-lg mb-2">RECUERDE:</p>
              <ol class="list-decimal list-inside space-y-1">
                <li>La entrevista no es reprogramable, debe estar puntual.</li>
                <li>La entrevista tiene un porcentaje de valor para su ingreso.</li>
                <li>Debe haber completado el test previamente enviado.</li>
              </ol>
              <p class="mt-4">Una vez pasada esta entrevista psicológica debe pasar la entrevista con la escuela en:</p>
              <ul class="list-disc list-inside space-y-1">
                <li class="text-lg font-bold">${match.edificio}</li>
              </ul>
            </div>
          `;

          imagenReferencia = `
            <div class="mt-6 text-center">
              <p class="text-indigo-400 font-semibold mb-2">Imagen de referencia:</p>
              <div id="zoomResultado" class="zoom-container inline-block overflow-hidden cursor-grab border border-indigo-500 rounded-xl p-2">
                <img id="imgResultado" src="../img/mapa.png" alt="Imagen de referencia" class="mx-auto rounded-lg shadow-lg max-h-80 object-contain select-none">
              </div>
            </div>
          `;
        }

        resultadoDiv.innerHTML = `
          <div class="bg-gray-900 text-white rounded-2xl shadow-lg p-6 space-y-4 w-full max-w-md mx-auto">
            <p class="text-lg font-semibold text-center mb-4">🎓 Estimad@ ${match.nombre}</p>
            <p class="text-center">Usted se está postulando a la carrera de <span class="font-semibold text-yellow-400">${carrera}</span>.</p>
            <div class="space-y-2 mt-4">
              <p><span class="font-semibold text-blue-400">Día:</span> ${match.fecha}</p>
              <p><span class="font-semibold text-blue-400">Hora:</span> ${match.hora}</p>
              <p><span class="font-semibold text-blue-400">Encargado:</span> ${match.encargado}</p>
              ${!esVirtual ? `<p><span class="font-semibold text-blue-400">Lugar:</span> ${match.lugar}</p>` : ''}
            </div>

            ${infoAdicional}
            ${recomendaciones}
            ${recordatorio}
            ${imagenReferencia}
          </div>
        `;

        // Activar zoom y arrastre
        const zoomResultado = document.getElementById('zoomResultado');
        const imgResultado = document.getElementById('imgResultado');
        let scaleRes = 1, isDraggingRes = false, startXRes = 0, startYRes = 0, currentXRes = 0, currentYRes = 0;

        if (zoomResultado && imgResultado) {
          imgResultado.addEventListener('mousedown', e => {
            isDraggingRes = true;
            startXRes = e.clientX - currentXRes;
            startYRes = e.clientY - currentYRes;
            zoomResultado.style.cursor = 'grabbing';
          });

          zoomResultado.addEventListener('mousemove', e => {
            if (isDraggingRes) {
              currentXRes = e.clientX - startXRes;
              currentYRes = e.clientY - startYRes;
              imgResultado.style.transform = `translate(${currentXRes}px, ${currentYRes}px) scale(${scaleRes})`;
            }
          });

          window.addEventListener('mouseup', () => {
            isDraggingRes = false;
            zoomResultado.style.cursor = 'grab';
          });

          zoomResultado.addEventListener('mouseleave', () => {
            isDraggingRes = false;
            zoomResultado.style.cursor = 'grab';
          });

          zoomResultado.addEventListener('wheel', e => {
            e.preventDefault();
            const zoomFactor = 0.1;
            if (e.deltaY < 0) scaleRes += zoomFactor;
            else scaleRes = Math.max(1, scaleRes - zoomFactor);
            imgResultado.style.transform = `translate(${currentXRes}px, ${currentYRes}px) scale(${scaleRes})`;
          });
        }

      } else if (coincidencias.length > 1) {
        resultadoDiv.innerHTML = `
          <div class="bg-red-700 text-white p-4 rounded-xl shadow-md text-center">
            <p class="font-semibold">Error: se encontraron múltiples registros con el mismo DNI (${dniInput}). Contacte a soporte.</p>
          </div>
        `;
        console.warn('Duplicados encontrados para DNI:', dniInput, coincidencias);
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
