// ==================================================================
// SCRIPT.JS - VERSIÓN FINAL CON HORARIOS RESPONSIVE
// ==================================================================

// ¡¡¡IMPORTANTE!!! ASEGÚRATE DE QUE ESTA URL SEA LA CORRECTA
const scriptURL = 'https://script.google.com/macros/s/AKfycbw3FNeUyvxNClsEa-khrD4t2q5ozfOJKlsAuZUGkV9eKmmMPKXjc-MmsXLAtsQd7tAE-Q/exec';

document.addEventListener('DOMContentLoaded', function() {

    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
    const form = document.getElementById('registroForm');
    if (!form) {
        console.error("Error crítico: No se encontró el formulario con id 'registroForm'.");
        return;
    }
    const submitBtn = document.getElementById('submit-btn');
    const mensajeDiv = document.getElementById('mensaje');
    const rubroSelect = document.getElementById('rubro_select');
    const rubroOtroInput = document.getElementById('rubro_otro_input');
    const addEspecialistaBtn = document.getElementById('add-especialista-btn');
    const especialistasContainer = document.getElementById('especialistas-container');
    const fileUpload = document.getElementById('file-upload');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image-btn');

    let especialistaCounter = 0;
    let fotoBase64 = null;

    // --- LÓGICA DE INTERACTIVIDAD ---
    const contenedorHorarios = document.querySelector('.horarios-lista-responsive');
    if (contenedorHorarios) {
        const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
        diasSemana.forEach(dia => {
            const diaId = dia.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const diaHtml = `
                <div class="dia-fila">
                    <div class="dia-control">
                        <input type="checkbox" id="abierto_${diaId}" name="abierto_${diaId}" class="abierto-check">
                        <label for="abierto_${diaId}">${dia}</label>
                    </div>
                    <div class="dia-inputs">
                        <input type="text" name="horario_${diaId}_manana" placeholder="Mañana (ej: 09-13)">
                        <input type="text" name="horario_${diaId}_tarde" placeholder="Tarde (ej: 17-21)">
                    </div>
                </div>
            `;
            contenedorHorarios.innerHTML += diaHtml;
        });

        document.querySelectorAll('.abierto-check').forEach(checkbox => {
            checkbox.addEventListener('change', e => {
                const inputsContainer = e.target.closest('.dia-fila').querySelector('.dia-inputs');
                if (inputsContainer) {
                    inputsContainer.style.display = e.target.checked ? 'flex' : 'none';
                }
            });
        });
    }

    if (rubroSelect) {
        rubroSelect.addEventListener('change', () => {
            if (rubroSelect.value === 'Otro') {
                rubroOtroInput.style.display = 'block';
                rubroOtroInput.required = true;
            } else {
                rubroOtroInput.style.display = 'none';
                rubroOtroInput.required = false;
                rubroOtroInput.value = '';
            }
        });
    }
    if (fileUpload) {
        fileUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    imagePreview.src = event.target.result;
                    fotoBase64 = event.target.result;
                    imagePreviewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            fileUpload.value = '';
            imagePreview.src = '#';
            fotoBase64 = null;
            imagePreviewContainer.style.display = 'none';
        });
    }
    if (addEspecialistaBtn) {
        addEspecialistaBtn.addEventListener('click', () => {
            especialistaCounter++;
            const newEspecialistaBloque = document.createElement('div');
            newEspecialistaBloque.classList.add('especialista-bloque');
            newEspecialistaBloque.setAttribute('data-id', especialistaCounter);
            newEspecialistaBloque.innerHTML = `
                <button type="button" class="btn-remove-especialista" onclick="removeEspecialista(this)">X</button>
                <h4>Especialista #${especialistaCounter}</h4>
                <input type="text" name="nombre_esp_${especialistaCounter}" placeholder="Nombre Completo" required>
                <input type="text" name="especialidad_esp_${especialistaCounter}" placeholder="Especialidad" required>
                <input type="text" name="dias_esp_${especialistaCounter}" placeholder="Días de Atención" required>
                <input type="text" name="horarios_esp_${especialistaCounter}" placeholder="Horarios" required>
                <input type="text" name="obrasocial_esp_${especialistaCounter}" placeholder="Obras Sociales">
                <input type="tel" name="contacto_esp_${especialistaCounter}" placeholder="Teléfono para Turnos">
            `;
            especialistasContainer.appendChild(newEspecialistaBloque);
        });
    }
    document.querySelectorAll('.acordeon-header').forEach(button => {
        button.addEventListener('click', () => {
            const acordeonContent = button.nextElementSibling;
            button.classList.toggle('active');
            if (button.classList.contains('active')) {
                acordeonContent.style.maxHeight = acordeonContent.scrollHeight + 'px';
                acordeonContent.style.padding = '15px';
            } else {
                acordeonContent.style.maxHeight = '0';
                acordeonContent.style.padding = '0 15px';
            }
        });
    });

    // --- LÓGICA DE ENVÍO DEL FORMULARIO PRINCIPAL (SIN CAMBIOS) ---
    form.addEventListener('submit', e => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        
        const formData = new FormData(form);
        
        let horariosString = "";
        const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
        dias.forEach(dia => {
            if (formData.get(`abierto_${dia}`)) {
                const manana = formData.get(`horario_${dia}_manana`);
                const tarde = formData.get(`horario_${dia}_tarde`);
                if (manana || tarde) {
                    let diaCapitalizado = dia.charAt(0).toUpperCase() + dia.slice(1);
                    horariosString += `${diaCapitalizado}: ${manana || ''} ${tarde ? 'y ' + tarde : ''}. `;
                }
            }
        });
        formData.append("horarios_compilado", horariosString || "Cerrado todos los días o no especificado");

        let socialesString = "";
        const instagram = formData.get('instagram');
        const facebook = formData.get('facebook');
        if (instagram) socialesString += `Instagram: https://instagram.com/${instagram} | `;
        if (facebook) socialesString += `Facebook: ${facebook.startsWith('http') ? facebook : 'https://facebook.com/' + facebook} | `;
        if (socialesString.endsWith(' | ')) socialesString = socialesString.slice(0, -3);
        formData.append("redes_compilado", socialesString);
        
        if (fotoBase64) {
            formData.append("foto_base64", fotoBase64);
        }

        const especialistasData = [];
        document.querySelectorAll('.especialista-bloque').forEach(bloque => {
            const id = bloque.dataset.id;
            especialistasData.push({ 
                nombre: formData.get(`nombre_esp_${id}`), especialidad: formData.get(`especialidad_esp_${id}`),
                dias: formData.get(`dias_esp_${id}`), horarios: formData.get(`horarios_esp_${id}`),
                obras_sociales: formData.get(`obrasocial_esp_${id}`), contacto: formData.get(`contacto_esp_${id}`)
             });
        });
        if (especialistasData.length > 0) {
            formData.append("especialistas_json", JSON.stringify(especialistasData));
        }

        fetch(scriptURL, { 
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.result === "success") {
                mensajeDiv.style.color = "lightgreen";
                mensajeDiv.textContent = "¡Registro exitoso! Gracias por sumarte.";
                form.reset();
                if (especialistasContainer) especialistasContainer.innerHTML = '';
                if (rubroOtroInput) rubroOtroInput.style.display = 'none';
                if (removeImageBtn) removeImageBtn.click();
                especialistaCounter = 0;
                document.querySelectorAll('.acordeon-header.active').forEach(button => button.click());
            } else {
               throw new Error(data.message || 'El script de Google devolvió un error.');
            }
        })
        .catch(error => {
            mensajeDiv.style.color = "tomato";
            mensajeDiv.textContent = `Error: ${error.message}. Por favor, intentá de nuevo.`;
            console.error('Error en el envío:', error);
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Registrar Establecimiento';
        });
    });

    // ==================================================================
    // LÓGICA PARA ENVIAR SUGERENCIAS (AÑADIDO)
    // ==================================================================
    const btnEnviarSugerencia = document.getElementById('btnEnviarSugerencia');
    const cajaSugerencias = document.getElementById('cajaSugerencias');
    const mensajeSugerencia = document.getElementById('mensajeSugerencia');

    if (btnEnviarSugerencia) {
        btnEnviarSugerencia.addEventListener('click', () => {
            const sugerencia = cajaSugerencias.value.trim();
            if (sugerencia.length < 10) {
                mensajeSugerencia.style.color = "tomato";
                mensajeSugerencia.textContent = "Por favor, escribí una sugerencia un poco más detallada.";
                return;
            }

            btnEnviarSugerencia.disabled = true;
            btnEnviarSugerencia.textContent = 'Enviando...';
            mensajeSugerencia.textContent = '';
            
            const sugerenciaData = new FormData();
            sugerenciaData.append("sugerencia", sugerencia);

            fetch(scriptURL, {
                method: 'POST',
                body: sugerenciaData,
            })
            .then(response => response.json())
            .then(data => {
                if (data.result === 'success') {
                    mensajeSugerencia.style.color = "lightgreen";
                    mensajeSugerencia.textContent = "¡Gracias! Tu sugerencia fue enviada.";
                    cajaSugerencias.value = '';
                } else {
                    throw new Error(data.message || 'Error desconocido');
                }
            })
            .catch(error => {
                mensajeSugerencia.style.color = "tomato";
                mensajeSugerencia.textContent = `Error al enviar: ${error.message}`;
            })
            .finally(() => {
                btnEnviarSugerencia.disabled = false;
                btnEnviarSugerencia.textContent = 'Enviar Sugerencia';
            });
        });
    }

});

// Función para remover un especialista (sin cambios)
function removeEspecialista(button) {
    button.closest('.especialista-bloque').remove();
}
