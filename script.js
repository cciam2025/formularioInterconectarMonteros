// ==================================================================
// SCRIPT.JS - VERSIÓN FINAL REVISADA
// ==================================================================

// ¡¡¡IMPORTANTE!!! ASEGÚRATE DE QUE ESTA URL SEA LA CORRECTA
const scriptURL = 'https://script.google.com/macros/s/AKfycbxdQ24iUnyB4agAGLerf6zFxw2UmIEODK8rk8TIaPM889-Gxr_auwX-KflCzApOLb4m/exec';

// Se espera a que todo el contenido HTML de la página esté cargado antes de ejecutar el script.
// Esto previene errores de "elemento no encontrado".
document.addEventListener('DOMContentLoaded', function() {

    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
    const form = document.getElementById('registroForm');
    if (!form) {
        console.error("Error crítico: No se encontró el formulario con id 'registroForm'.");
        return; // Detiene el script si el formulario no existe.
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

    // Lógica para mostrar/ocultar el campo "Otro" rubro
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

    // Lógica para la vista previa de la foto
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

    // Lógica para quitar la foto seleccionada
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            fileUpload.value = '';
            imagePreview.src = '#';
            fotoBase64 = null;
            imagePreviewContainer.style.display = 'none';
        });
    }
    
    // Lógica para añadir un nuevo bloque de especialista
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

    // Lógica para la interactividad de los checkboxes "Cerrado"
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

    // Lógica para el despliegue del ACORDEÓN
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

    // --- LÓGICA DE ENVÍO DEL FORMULARIO ---
    form.addEventListener('submit', e => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        
        const formData = new FormData(form);
        const horariosData = {};
        const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
        dias.forEach(dia => {
            const isCerrado = formData.get(`cerrado_${dia}`);
            horariosData[dia] = {
                manana: isCerrado ? "Cerrado" : formData.get(`horario_${dia}_manana`) || "",
                tarde: isCerrado ? "Cerrado" : formData.get(`horario_${dia}_tarde`) || ""
            };
        });

        const socialesData = {
            instagram: formData.get('instagram') || "",
            facebook: formData.get('facebook') || "",
            whatsapp: formData.get('whatsapp') || ""
        };
        
        const especialistasData = [];
        document.querySelectorAll('.especialista-bloque').forEach(bloque => {
            const id = bloque.dataset.id;
            especialistasData.push({
                nombre: formData.get(`nombre_esp_${id}`), especialidad: formData.get(`especialidad_esp_${id}`),
                dias: formData.get(`dias_esp_${id}`), horarios: formData.get(`horarios_esp_${id}`),
                obras_sociales: formData.get(`obrasocial_esp_${id}`), contacto: formData.get(`contacto_esp_${id}`)
            });
        });
        
        const payload = {
            institucion: {
                nombre_establecimiento: formData.get('nombre_establecimiento'),
                rubro: formData.get('rubro') === 'Otro' ? formData.get('rubro_otro') : formData.get('rubro'),
                direccion: formData.get('direccion'),
                contacto_responsable: formData.get('contacto_responsable'),
                email_responsable: formData.get('email_responsable')
            },
            horarios: horariosData,
            sociales: socialesData,
            especialistas: especialistasData,
            foto: fotoBase64
        };
        
        fetch(scriptURL, { 
            method: 'POST', mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.result === "success"){
                mensajeDiv.style.color = "lightgreen";
                mensajeDiv.textContent = "¡Registro exitoso! Gracias por sumarte.";
                form.reset();
                if (especialistasContainer) especialistasContainer.innerHTML = '';
                if (rubroOtroInput) rubroOtroInput.style.display = 'none';
                if (removeImageBtn) removeImageBtn.click();
                especialistaCounter = 0;
                document.querySelectorAll('.acordeon-header.active').forEach(button => button.click());
            } else {
                throw new Error(data.message || 'Error desconocido.');
            }
        })
        .catch(error => {
            mensajeDiv.style.color = "tomato";
            mensajeDiv.textContent = `Error: ${error.message}. Por favor, intentá de nuevo.`;
            console.error('Error!', error);
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
