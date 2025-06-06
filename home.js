document.addEventListener('DOMContentLoaded', function () {
  const productForm = document.getElementById('productForm');
  const codigoInput = document.getElementById('codigo');
  const nombreInput = document.getElementById('nombre');
  const bodegaSelect = document.getElementById('bodega');
  const sucursalSelect = document.getElementById('sucursal');
  const monedaSelect = document.getElementById('moneda');
  const precioInput = document.getElementById('precio');
  const materialesCheckboxesContainer = document.getElementById('material-checkboxes');
  const descripcionInput = document.getElementById('descripcion');
  const submitButton = document.getElementById('submitBtn');
  const formMessage = document.getElementById('form-message');

  // mapeo de campos //
  const errorMessages = {
    codigo: document.getElementById('error-codigo'),
    nombre: document.getElementById('error-nombre'),
    bodega: document.getElementById('error-bodega'),
    sucursal: document.getElementById('error-sucursal'),
    moneda: document.getElementById('error-moneda'),
    precio: document.getElementById('error-precio'),
    materiales: document.getElementById('error-materiales'),
    descripcion: document.getElementById('error-descripcion'),
  }


  // Validacion del Codigo //
  let isCodigoUnique = false;

  /**
  * @param {string} field
  * @param {string} message
  */

  function showError(field, message) {
    if (errorMessages[field]) {
      errorMessages[field].textContent = message;
      errorMessages[field].style.display = 'block';
      const inputElement = document.getElementById(field);
      if (inputElement) {
        inputElement.classList.add('is-invalid');
      } else if (field === 'materiales' && materialesCheckboxesContainer) {
        materialesCheckboxesContainer.classList.add('is-invalid-group');
      }
    }
  }
  /**
  * @param {string} field
  */
  function hideError(field) {
    if (errorMessages[field]) {
      errorMessages[field].textContent = '';
      errorMessages[field].style.display = 'none';
      const inputElement = document.getElementById(field);
      if (inputElement) {
        inputElement.classList.remove('is-invalid');
      } else if (field === 'materiales' && materialesCheckboxesContainer) {
        materialesCheckboxesContainer.classList.remove('is-invalid-group');
      }
    }
  }
  /**
   * @param {string} message
   * @param {string} type
  */
  function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';
  }

  function hideFormMessage() {
    formMessage.textContent = '';
    formMessage.className = 'form-message';
    formMessage.style.display = 'none';
  }

  function clearAllErrors() {

    Object.keys(errorMessages).forEach(field => {
      hideError(field);
    });
    hideFormMessage();
  }

  // Validacion de campos individuales //

  async function validarCodigo() {

    const codigo = codigoInput.value.trim();
    const pattern = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{5,15}$/;

    hideError('codigo');
    isCodigoUnique = false;
    if (codigo === '') {
      showError('codigo', 'El campo codigo no puede estar vacio');
      return false;

    }
    if (!pattern.test(codigo)) {
      showError('codigo', 'El codigo debe contener entre 5 y 15 caracteres, incluyendo al menos una letra y un número');
      return false;
    }

    try {
      const response = await fetch(`api.php?accion=obtener_codigo&codigo=${encodeURIComponent(codigo)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (Object.keys(data).length > 0) {
        showError('codigo', 'El codigo ya existe');
        isCodigoUnique = false;
        return false;
      }
    } catch (error) {
      console.error('Error al validar el codigo:', error);
      showError('codigo', 'Error al validar el codigo');
      return false;
    }
    isCodigoUnique = true;
    return true;
  }

  function validarNombre() {
    const nombre = nombreInput.value.trim();
    hideError('nombre');
    if (nombre === '') {
      showError('nombre', 'El campo nombre no puede estar vacio');
      return false;
    }
    if (nombre.length < 2 || nombre.length > 50) {
      showError('nombre', 'El nombre debe tener entre 2 y 50 caracteres');
      return false;
    }
    return true;
  }

  function validarBodega() {
    hideError('bodega');
    if (bodegaSelect.value === '') {
      showError('bodega', 'Debe seleccionar una bodega');
      return false;
    }
    return true;
  }

  function validarSucursal() {
    hideError('sucursal');
    if (sucursalSelect.value === '') {
      showError('sucursal', 'Debe seleccionar una sucursal');
      return false;
    }
    return true;
  }
  function validarMoneda() {
    hideError('moneda');
    if (monedaSelect.value === '') {
      showError('moneda', 'Debe seleccionar una moneda');
      return false;
    }
    return true;
  }
  function validarPrecio() {
    const precio = precioInput.value.trim();
    const pattern = /^\d+(\.\d{1,2})?$/;
    hideError('precio');
    if (precio === '') {
      showError('precio', 'El campo precio no puede estar vacio');
      return false;
    }
    if (!pattern.test(precio) || parseFloat(precio) <= 0) {
      showError('precio', 'El precio debe ser un número positivo con hasta dos decimales');
      return false;
    }
    return true;
  }
  function validarMateriales() {
    const checkedMateriales = materialesCheckboxesContainer.querySelectorAll('input[type="checkbox"]:checked');
    hideError('materiales');
    if (checkedMateriales.length < 2) {
      showError('materiales', 'Debe seleccionar al menos 2 materiales');
      return false;
    }
    return true;
  }

  function validarDescripcion() {
    const descripcion = descripcionInput.value.trim();
    hideError('descripcion');
    if (descripcion === '') {
      showError('descripcion', 'El campo descripcion no puede estar vacio');
      return false;
    }
    if (descripcion.length < 10 || descripcion.length > 1000) {
      showError('descripcion', 'La descripcion debe tener entre 10 y 1000 caracteres');
      return false;
    }
    return true;
  }


  // Validacion del formulario //
  async function validarFormulario() {
    const isCodigoValid = await validarCodigo();
    const isNombreValid = validarNombre();
    const isBodegaValid = validarBodega();
    const isSucursalValid = validarSucursal();
    const isMonedaValid = validarMoneda();
    const isPrecioValid = validarPrecio();
    const isMaterialesValid = validarMateriales();
    const isDescripcionValid = validarDescripcion();

    // Solo es valido si todos los campos son validos
    return isCodigoValid && isNombreValid && isBodegaValid && isSucursalValid &&
      isMonedaValid && isPrecioValid && isMaterialesValid && isDescripcionValid && isCodigoUnique;
  }

  // Carga de datos //

  async function cargarMonedas() {
    try {
      const response = await fetch('api.php?accion=obtener_monedas');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 'error') {
        console.log(`Error API al cargar monedas: ${data.message}`, 'error');
        showFormMessage(`Error al cargar las monedas: ${data.message}`, 'error');
        return;
      }

      data.forEach(moneda => {
        monedaSelect.appendChild(new Option(moneda.nombre, moneda.id));
      });

    } catch (error) {
      console.error('Error al cargar las monedas:', error);
      showFormMessage('Error al cargar las monedas', 'error');
    }
  }

  async function cargarBodegas() {
    try {
      const response = await fetch('api.php?accion=obtener_bodegas')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 'error') {
        console.log(`Error API al cargar bodegas: ${data.message}`, 'error');
        showFormMessage(`Error al cargar las bodegas: ${data.message}`, 'error');
        return;
      }
      // bodegaSelect.innerHTML = '<option value="" disabled selected>Seleccione una bodega</option>';
      data.forEach(bodega => {
        bodegaSelect.appendChild(new Option(bodega.nombre, bodega.id));
      });
    } catch (error) {
      console.log('Error al cargar las bodegas:', error);
      showFormMessage('Error al cargar las bodegas', 'error');
    }
  }

  async function cargarSucursales(bodegaId) {
    sucursalSelect.innerHTML = '<option value="">Seleccione una sucursal</option>';
    sucursalSelect.disabled = true;
    hideError('sucursal');
    if (!bodegaId || bodegaId === '0') {
      sucursalSelect.innerHTML = '<option value="" disabled selected>Seleccione una sucursal</option>';
      return;
    }

    try {
      const response = await fetch('api.php?accion=obtener_sucursales&id_bodega=' + encodeURIComponent(bodegaId));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 'error') {
        console.log(`Error API al cargar sucursales: ${data.message}`, 'error');
        showError('sucursal', `Error al cargar las sucursales: ${data.message}`);
        sucursalSelect.innerHTML = '<option value="" disabled selected>No Disponibles</option>';
        return;
      }

      sucursalSelect.innerHTML = '<option value="" disabled selected>Seleccione una sucursal</option>';
      sucursalSelect.disabled = false;

      if (data.length > 0) {
        data.forEach(sucursal => {
          sucursalSelect.appendChild(new Option(sucursal.nombre, sucursal.id));
        });
      } else {
        console.log('Error al cargar las sucursales')
        showError('sucursal', 'No hay sucursales disponibles');
        sucursalSelect.innerHTML = '<option value="" disabled selected>No hay sucursales disponibles</option>';
        sucursalSelect.disabled = true;
      }

    } catch (error) {
      console.error('No se pudieron cargar las sucursales:', error);
      showError('sucursal', 'Error al cargar las sucursales');
      sucursalSelect.innerHTML = '<option value="" disabled selected>Error al cargar las sucursales</option>';
      sucursalSelect.disabled = true;
    }
  }

  // Event listeners
  codigoInput.addEventListener('blur', validarCodigo);
  nombreInput.addEventListener('blur', validarNombre);
  bodegaSelect.addEventListener('change', function () {
    validarBodega();
    cargarSucursales(bodegaSelect.value);
  });
  sucursalSelect.addEventListener('change', validarSucursal);
  monedaSelect.addEventListener('change', validarMoneda);
  precioInput.addEventListener('blur', validarPrecio);
  descripcionInput.addEventListener('blur', validarDescripcion);
  materialesCheckboxesContainer.addEventListener('change', validarMateriales);

  // Manejo del formulario
  productForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    clearAllErrors();

    submitButton.disabled = true;
    submitButton.textContent = 'Guardando...';

    const formIsValid = await validarFormulario();
    if (formIsValid) {
      const formData = new FormData(productForm);
      formData.append('accion', 'insertar_producto');

      try {
        const response = await fetch('api.php', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
          showFormMessage(result.message, 'success');
          productForm.reset();
          sucursalSelect.innerHTML = '<option value="" disabled selected>Seleccione una sucursal</option>';
          isCodigoUnique = false;
          cargarBodegas();
        } else {
          showFormMessage(result.message, 'error');
          
        }
      } catch (error) {
        console.error('Error al enviar el formulario:', error);
        showFormMessage(`Error al guardar el producto: ${error.message}`, 'error');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Guardar Producto';
      }
    } else {
      submitButton.disabled = false;
      submitButton.textContent = 'Guardar Producto';
      showFormMessage('Por favor, corrija los errores antes de enviar el formulario.', 'error');
    }
  });
  cargarBodegas();
  cargarMonedas();

});


