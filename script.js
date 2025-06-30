// ==================================================================
// SCRIPT.JS - VERSIÓN FINAL CON MÉTODO FORMDATA (ANTI-CORS)
// ==================================================================

// ¡¡¡IMPORTANTE!!! ASEGÚRATE DE QUE ESTA URL SEA LA CORRECTA
const scriptURL = 'https://script.google.com/macros/s/AKfycbzndv2fIg1KT19jfys7kZhtFBff1Cl-MU4XIzum0t8Mvjdzd5pk2VWk9C84JZfo9-m6/exec';

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

    // --- LÓGICA DE INTERACTIVIDAD (SIN CAMBIOS) ---
    // ... (toda la lógica de acordeón, especialistas, etc. sigue aquí igual)
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
    document.querySelectorAll('.cerrado-check').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const parentContainer = e.target.closest('.cerrado-check-container');
            const inputTarde = parentContainer.previousElementSibling;
            const inputManana = inputTarde.previousElementSibling;
            inputManana.disabled = e.target.checked;
            inputTarde.disabled = e.target.checked;
            if (e.target.checked) {
                inputManana.value = '';
                inputTarde.value = '';
            }
        });
    });
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


    // ==================================================================
    // LÓGICA DE ENVÍO DEL FORMULARIO (¡¡¡MODIFICADA!!!)
    // ==================================================================
    form.addEventListener('submit', e => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        
        // 1. Usamos FormData, igual que en el proyecto CAME
        const formData = new FormData(form);

        // 2. Procesamos los datos complejos y los añadimos como texto al FormData
        
        // a) Horarios
        let horariosString = "";
        const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
        dias.forEach(dia => {
            if (!formData.get(`cerrado_${dia}`)) {
                const manana = formData.get(`horario_${dia}_manana`);
                const tarde = formData.get(`horario_${dia}_tarde`);
                if (manana || tarde) {
                    let diaCapitalizado = dia.charAt(0).toUpperCase() + dia.slice(1);
                    horariosString += `${diaCapitalizado}: ${manana || ''} ${tarde ? 'y ' + tarde : ''}. `;
                }
            }
        });
        formData.append("horarios_compilado", horariosString || "No especificado");

        // b) Redes Sociales
        let socialesString = "";
        const instagram = formData.get('instagram');
        const facebook = formData.get('facebook');
        if (instagram) socialesString += `Instagram: https://instagram.com/${instagram} | `;
        if (facebook) socialesString += `Facebook: ${facebook.startsWith('http') ? facebook : 'https://facebook.com/' + facebook} | `;
        if (socialesString.endsWith(' | ')) socialesString = socialesString.slice(0, -3);
        formData.append("redes_compilado", socialesString);
        
        // c) Foto (añadida como texto Base64)
        if (fotoBase64) {
            formData.append("foto_base64", fotoBase64);
        }

        // d) Especialistas (añadidos como un bloque de texto JSON)
        const especialistasData = [];
        document.querySelectorAll('.especialista-bloque').forEach(bloque => {
            const id = bloque.dataset.id;
            especialistasData.push({
                nombre: formData.get(`nombre_esp_${id}`),
                especialidad: formData.get(`especialidad_esp_${id}`),
                dias: formData.get(`dias_esp_${id}`),
                horarios: formData.get(`horarios_esp_${id}`),
                obras_sociales: formData.get(`obrasocial_esp_${id}`),
                contacto: formData.get(`contacto_esp_${id}`)
            });
        });
        if (especialistasData.length > 0) {
            formData.append("especialistas_json", JSON.stringify(especialistasData));
        }

        // 3. Hacemos el fetch, pero SIN headers de JSON
        fetch(scriptURL, { 
            method: 'POST',
            body: formData
        })
        .then(response => response.json()) // Esperamos una respuesta JSON de éxito/error
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
});

// Función para remover un especialista (debe estar en el scope global por el onclick)
function removeEspecialista(button) {
    button.closest('.especialista-bloque').remove();
}
