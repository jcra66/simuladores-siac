/* ============================================================
   SIAC ÚNICO - Plataforma de Entrenamiento
   assets_js_data.js : repositorio local de demostración
   TODOS LOS DATOS SON FICTICIOS - DATO SIMULADO PARA ENTRENAMIENTO
   Almacenamiento: localStorage del navegador (NO es una base de datos
   centralizada ni un mecanismo de seguridad de producción).
   ============================================================ */
(function (global) {
  'use strict';

  var K = {
    USUARIOS: 'SIAC_DB_USUARIOS',
    PERFILES: 'SIAC_DB_PERFILES',
    TRX: 'SIAC_DB_TRX',
    SESIONES: 'SIAC_DB_SESIONES',   // historial de simulaciones (trazabilidad)
    SESION: 'SIAC_SESION',          // sesión de usuario autenticado (demo)
    EJEC: 'SIAC_EJEC_ACTUAL'        // ejecución de simulación en curso
  };

  /* ---------- Permisos del modelo de demostración ---------- */
  var PERMISOS = [
    { id: 'usuarios.ver', cat: 'Gestión de usuarios', desc: 'Consultar usuarios' },
    { id: 'usuarios.crear', cat: 'Gestión de usuarios', desc: 'Crear usuarios' },
    { id: 'usuarios.editar', cat: 'Gestión de usuarios', desc: 'Editar usuarios' },
    { id: 'usuarios.eliminar', cat: 'Gestión de usuarios', desc: 'Eliminar usuarios' },
    { id: 'perfiles.gestionar', cat: 'Gestión de perfiles', desc: 'Administrar perfiles y permisos' },
    { id: 'reportes.ver', cat: 'Reportes', desc: 'Consultar reportes de trazabilidad' },
    { id: 'reportes.propios', cat: 'Reportes', desc: 'Consultar solo sus propios resultados' },
    { id: 'transaccion.CAMTIT.ejecutar', cat: 'Transacciones', desc: 'Ejecutar simulación Cambio de Titularidad' }
  ];

  /* ---------- Catálogo de transacciones efectivamente exportadas ---------- */
  var TRX_INI = [{
    id: 'CAMTIT',
    nombre: 'Cambio de Titularidad',
    mdu: 'MDU_SIAC_UNICO_CambioTitularidad _v2.docx',
    carpeta: 'Transaccion/CambioTitularidad/',
    entrada: 'index.html',
    loginPropio: 'login.html',
    permiso: 'transaccion.CAMTIT.ejecutar',
    pantallas: [
      'CambioTitularidad_AccesoSistema.html',
      'CambioTitularidad_DiagramaProceso.html',
      'CambioTitularidad_BusquedaCliente.html',
      'CambioTitularidad_MenuTransaccionesCuenta.html',
      'CambioTitularidad_CambioTitularidad.html',
      'CambioTitularidad_ValidacionPin.html',
      'CambioTitularidad_ValidacionSupervisor.html',
      'CambioTitularidad_LineasCuentaOrigen.html',
      'CambioTitularidad_TransferirCuentaExistente.html',
      'CambioTitularidad_CrearCuenta.html',
      'CambioTitularidad_DatosIdentificacionPersonal.html',
      'CambioTitularidad_DatosContacto.html',
      'CambioTitularidad_DireccionFacturacion.html',
      'CambioTitularidad_ConfirmacionOperacion.html',
      'CambioTitularidad_Constancia.html',
      'CambioTitularidad_EvaluacionAsesor.html'
    ]
  }];

  /* ---------- Perfiles iniciales ---------- */
  var PERFILES_INI = [
    {
      id: 'ADMIN', nombre: 'Administrador',
      descripcion: 'Acceso total al entorno de entrenamiento (SIMULADO)',
      permisos: ['usuarios.ver', 'usuarios.crear', 'usuarios.editar', 'usuarios.eliminar',
        'perfiles.gestionar', 'reportes.ver', 'reportes.propios', 'transaccion.CAMTIT.ejecutar'],
      sistema: true
    },
    {
      id: 'ASESOR', nombre: 'Asesor',
      descripcion: 'Ejecuta únicamente las transacciones de simulación autorizadas (SIMULADO)',
      permisos: ['reportes.propios', 'transaccion.CAMTIT.ejecutar'],
      sistema: true
    }
  ];

  /* ---------- Usuarios iniciales (SOLO DEMOSTRACIÓN) ---------- */
  var USUARIOS_INI = [
    { id: 'U0001', usuario: 'admin.demo', clave: 'Admin123!', nombre: 'Ana Quispe (SIMULADO)', perfil: 'ADMIN', estado: 'Activo', creado: '2026-01-15', protegido: true },
    { id: 'U0002', usuario: 'asesor01', clave: 'Asesor123!', nombre: 'Juan Perez (SIMULADO)', perfil: 'ASESOR', estado: 'Activo', creado: '2026-02-03', protegido: false },
    { id: 'U0003', usuario: 'asesor02', clave: 'Asesor123!', nombre: 'Maria Lopez (SIMULADO)', perfil: 'ASESOR', estado: 'Activo', creado: '2026-02-10', protegido: false },
    { id: 'U0004', usuario: 'asesor03', clave: 'Asesor123!', nombre: 'Luis Ramos (SIMULADO)', perfil: 'ASESOR', estado: 'Inactivo', creado: '2026-03-01', protegido: false }
  ];

  /* ---------- Sesiones de simulación de muestra (FICTICIAS) ---------- */
  function sesionesIniciales() {
    return [
      {
        id: 'SIM-20261110-0001', demo: true, usuarioId: 'U0002', usuario: 'asesor01',
        asesor: 'Juan Perez (SIMULADO)', perfil: 'ASESOR', trxId: 'CAMTIT', trx: 'Cambio de Titularidad',
        inicio: '2026-11-10T09:12:00', fin: '2026-11-10T09:21:35', duracion: 575,
        estado: 'Completada', errores: 1, omitidas: 0, puntaje: 90, resultado: 'Aprobado',
        pantallas: [
          { pantalla: 'Acceso al Sistema', seg: 32 }, { pantalla: 'Búsqueda de Cliente', seg: 48 },
          { pantalla: 'Transacciones por Cuenta', seg: 25 }, { pantalla: 'Cambio de Titularidad', seg: 71 },
          { pantalla: 'Validación de PIN', seg: 96 }, { pantalla: 'Líneas de la Cuenta Origen', seg: 83 },
          { pantalla: 'Datos de Identificación Personal', seg: 74 }, { pantalla: 'Datos de Contacto', seg: 68 },
          { pantalla: 'Dirección de Facturación', seg: 45 }, { pantalla: 'Confirmación de Operación', seg: 21 },
          { pantalla: 'Constancia', seg: 12 }
        ],
        eventos: [
          { ts: '2026-11-10T09:12:00', pantalla: 'Acceso al Sistema', accion: 'Inicio de prueba', resultado: 'OK' },
          { ts: '2026-11-10T09:13:20', pantalla: 'Búsqueda de Cliente', accion: 'Consulta de línea 997320039', resultado: 'OK' },
          { ts: '2026-11-10T09:15:10', pantalla: 'Validación de PIN', accion: 'PIN incorrecto ingresado', resultado: 'ERROR: PIN inválido o incorrecto. Ingrese un PIN válido' },
          { ts: '2026-11-10T09:16:02', pantalla: 'Validación de PIN', accion: 'Validar PIN 4821', resultado: 'OK: Validación de PIN Conforme' },
          { ts: '2026-11-10T09:18:40', pantalla: 'Líneas de la Cuenta Origen', accion: 'Transferir en Cuenta Existente', resultado: 'OK' },
          { ts: '2026-11-10T09:21:35', pantalla: 'Constancia', accion: 'Fin de prueba', resultado: 'Completada' }
        ]
      },
      {
        id: 'SIM-20261110-0002', demo: true, usuarioId: 'U0003', usuario: 'asesor02',
        asesor: 'Maria Lopez (SIMULADO)', perfil: 'ASESOR', trxId: 'CAMTIT', trx: 'Cambio de Titularidad',
        inicio: '2026-11-10T11:02:10', fin: '2026-11-10T11:14:50', duracion: 760,
        estado: 'Completada', errores: 3, omitidas: 2, puntaje: 72, resultado: 'Observado',
        pantallas: [
          { pantalla: 'Acceso al Sistema', seg: 40 }, { pantalla: 'Búsqueda de Cliente', seg: 65 },
          { pantalla: 'Cambio de Titularidad', seg: 110 }, { pantalla: 'Validación de PIN', seg: 180 },
          { pantalla: 'Validación de Jefe/Supervisor', seg: 95 }, { pantalla: 'Líneas de la Cuenta Origen', seg: 120 },
          { pantalla: 'Crear Cuenta', seg: 90 }, { pantalla: 'Confirmación de Operación', seg: 40 },
          { pantalla: 'Constancia', seg: 20 }
        ],
        eventos: [
          { ts: '2026-11-10T11:02:10', pantalla: 'Acceso al Sistema', accion: 'Inicio de prueba', resultado: 'OK' },
          { ts: '2026-11-10T11:05:30', pantalla: 'Validación de PIN', accion: 'PIN incorrecto (2 intentos)', resultado: 'ERROR: PIN inválido o incorrecto' },
          { ts: '2026-11-10T11:07:12', pantalla: 'Validación de Jefe/Supervisor', accion: 'Aceptar con usuario supervisor', resultado: 'OK: Puede continuar con la transacción' },
          { ts: '2026-11-10T11:09:45', pantalla: 'Líneas de la Cuenta Origen', accion: 'Guardar sin seleccionar línea', resultado: 'ERROR: Debe seleccionar al menos una línea' },
          { ts: '2026-11-10T11:14:50', pantalla: 'Constancia', accion: 'Fin de prueba', resultado: 'Completada' }
        ]
      },
      {
        id: 'SIM-20261111-0003', demo: true, usuarioId: 'U0002', usuario: 'asesor01',
        asesor: 'Juan Perez (SIMULADO)', perfil: 'ASESOR', trxId: 'CAMTIT', trx: 'Cambio de Titularidad',
        inicio: '2026-11-11T15:40:00', fin: '2026-11-11T15:46:12', duracion: 372,
        estado: 'Cancelada', errores: 2, omitidas: 3, puntaje: 55, resultado: 'Reforzar capacitación',
        pantallas: [
          { pantalla: 'Acceso al Sistema', seg: 30 }, { pantalla: 'Búsqueda de Cliente', seg: 52 },
          { pantalla: 'Cambio de Titularidad', seg: 140 }, { pantalla: 'Validación de PIN', seg: 150 }
        ],
        eventos: [
          { ts: '2026-11-11T15:40:00', pantalla: 'Acceso al Sistema', accion: 'Inicio de prueba', resultado: 'OK' },
          { ts: '2026-11-11T15:43:18', pantalla: 'Cambio de Titularidad', accion: 'Enviar PIN sin seleccionar motivo', resultado: 'ERROR: Debe seleccionar motivo' },
          { ts: '2026-11-11T15:46:12', pantalla: 'Validación de PIN', accion: 'Cerrar transacción', resultado: 'Cancelada' }
        ]
      }
    ];
  }

  /* ---------- Acceso a almacenamiento con manejo de errores ---------- */
  function leer(clave, porDefecto) {
    try {
      var v = global.localStorage.getItem(clave);
      return v ? JSON.parse(v) : porDefecto;
    } catch (e) {
      console.warn('[SIAC] Almacenamiento local no disponible:', e.message);
      return porDefecto;
    }
  }
  function grabar(clave, valor) {
    try {
      global.localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch (e) {
      console.warn('[SIAC] No se pudo grabar en almacenamiento local:', e.message);
      return false;
    }
  }

  function init() {
    if (!leer(K.USUARIOS, null)) grabar(K.USUARIOS, USUARIOS_INI);
    if (!leer(K.PERFILES, null)) grabar(K.PERFILES, PERFILES_INI);
    if (!leer(K.TRX, null)) grabar(K.TRX, TRX_INI);
    if (!leer(K.SESIONES, null)) grabar(K.SESIONES, sesionesIniciales());
  }

  var SIACDATA = {
    K: K,
    PERMISOS: PERMISOS,
    init: init,
    leer: leer,
    grabar: grabar,
    almacenamientoDisponible: function () {
      try { global.localStorage.setItem('__siac_test', '1'); global.localStorage.removeItem('__siac_test'); return true; }
      catch (e) { return false; }
    },
    usuarios: function () { return leer(K.USUARIOS, USUARIOS_INI); },
    guardarUsuarios: function (l) { return grabar(K.USUARIOS, l); },
    perfiles: function () { return leer(K.PERFILES, PERFILES_INI); },
    guardarPerfiles: function (l) { return grabar(K.PERFILES, l); },
    transacciones: function () { return leer(K.TRX, TRX_INI); },
    guardarTransacciones: function (l) { return grabar(K.TRX, l); },
    sesiones: function () { return leer(K.SESIONES, []); },
    guardarSesiones: function (l) { return grabar(K.SESIONES, l); },
    perfilPorId: function (id) {
      var p = this.perfiles().filter(function (x) { return x.id === id; });
      return p.length ? p[0] : null;
    },
    restaurar: function () {
      grabar(K.USUARIOS, USUARIOS_INI); grabar(K.PERFILES, PERFILES_INI);
      grabar(K.TRX, TRX_INI); grabar(K.SESIONES, sesionesIniciales());
    },
    /* Rúbrica didáctica de DEMOSTRACIÓN y CONFIGURABLE.
       El MDU no documenta criterios de puntaje: [POR DEFINIR] por el área de capacitación. */
    RUBRICA: {
      base: 100, porError: 10, porOmision: 5,
      aprobado: 85, observado: 70,
      nota: 'Rúbrica didáctica de demostración configurable. No es una regla de negocio del MDU.'
    },
    calificar: function (errores, omitidas) {
      var r = this.RUBRICA;
      var p = Math.max(0, r.base - (errores * r.porError) - (omitidas * r.porOmision));
      var res = p >= r.aprobado ? 'Aprobado' : (p >= r.observado ? 'Observado' : 'Reforzar capacitación');
      return { puntaje: p, resultado: res };
    }
  };

  init();
  global.SIACDATA = SIACDATA;
})(window);
