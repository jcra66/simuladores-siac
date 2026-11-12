/* ============================================================
   SIAC ÚNICO - Simulador CAMBIO DE TITULARIDAD (paquete autónomo)
   assets_js_app.js
   - Encabezado y menú SIAC ÚNICO
   - Temporizador visible (Tiempo transcurrido HH:MM:SS) por EJECUCIÓN
   - Registro de pasos, errores, validaciones omitidas y puntaje
   - Persistencia local (localStorage/sessionStorage) del mismo origen
   ENTORNO DE ENTRENAMIENTO - TODOS LOS DATOS SON SIMULADOS
   ============================================================ */
(function (global) {
  'use strict';

  var K_SESION = 'SIAC_SESION';          // sesión del portal (demo)
  var K_EJEC = 'SIAC_EJEC_ACTUAL';       // ejecución de simulación en curso
  var K_SESIONES = 'SIAC_DB_SESIONES';   // historial consultado por el reporte
  var K_DATOS = 'SIAC_CAMTIT_DATOS';     // datos capturados durante el flujo
  var TRX_ID = 'CAMTIT';
  var TRX_NOMBRE = 'Cambio de Titularidad';

  /* Rúbrica didáctica de DEMOSTRACIÓN y CONFIGURABLE.
     El MDU no documenta criterios de evaluación: [POR DEFINIR]. */
  var RUBRICA = { base: 100, porError: 10, porOmision: 5, aprobado: 85, observado: 70 };

  /* ---------- Cliente y datos ficticios del MDU (SIMULADOS) ---------- */
  var CLIENTE = {
    contrato: '22712561', customerId: '33691049', tipoCliente: 'Consumer',
    cliente: 'JUAN PEREZ SIMULADO', contacto: 'JUAN PEREZ SIMULADO',
    documento: '12345678', tipoDocumento: 'DNI', representante: 'JUAN PEREZ SIMULADO',
    planActual: 'Claro Max 99 (SF)', fechaActivacion: '12/03/2024', cicloFacturacion: '04',
    limiteCredito: '160', tipoAcuerdo: 'Particular', estadoLinea: 'Activo',
    linea: '987654321', cuenta: '8.15135802.00', producto: 'PostPago - Telefonía Móvil',
    email: 'juan.perez1509@correo-simulado.com', pin: '1234'
  };
  var PIN_VALIDO = '1234';                       // PIN SIMULADO PARA ENTRENAMIENTO
  var SUP_USUARIO = 'supervisor01';              // USUARIO SIMULADO
  var SUP_CLAVE = 'Super123!';                   // CLAVE SIMULADA
  var MAX_ENVIOS_PIN = 3;

  function almacenamientoOK() {
    try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return true; }
    catch (e) { return false; }
  }
  function leer(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function grabar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function quitar(k) { try { localStorage.removeItem(k); } catch (e) { } }

  function hhmmss(seg) {
    seg = Math.max(0, Math.floor(seg || 0));
    var h = Math.floor(seg / 3600), m = Math.floor((seg % 3600) / 60), s = seg % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  function esc(t) {
    return String(t === undefined || t === null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fechaTxt(iso) {
    var d = new Date(iso); if (isNaN(d.getTime())) return iso || '';
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }

  var SIAC = {
    TRX_ID: TRX_ID, TRX_NOMBRE: TRX_NOMBRE, CLIENTE: CLIENTE,
    PIN_VALIDO: PIN_VALIDO, SUP_USUARIO: SUP_USUARIO, SUP_CLAVE: SUP_CLAVE,
    MAX_ENVIOS_PIN: MAX_ENVIOS_PIN, RUBRICA: RUBRICA,
    hhmmss: hhmmss, esc: esc, fechaTxt: fechaTxt, almacenamientoOK: almacenamientoOK,

    /* ===================== SESIÓN ===================== */
    sesion: function () { return leer(K_SESION, null); },

    /* Sesión autónoma del paquete (cuando se abre sin el portal) */
    ingresoAutonomo: function (usuario, clave) {
      var demo = [
        { usuarioId: 'U0002', usuario: 'asesor01', clave: 'Asesor123!', nombre: 'Juan Perez (SIMULADO)', perfilId: 'ASESOR', perfil: 'Asesor' },
        { usuarioId: 'U0003', usuario: 'asesor02', clave: 'Asesor123!', nombre: 'Maria Lopez (SIMULADO)', perfilId: 'ASESOR', perfil: 'Asesor' },
        { usuarioId: 'U0001', usuario: 'admin.demo', clave: 'Admin123!', nombre: 'Ana Quispe (SIMULADO)', perfilId: 'ADMIN', perfil: 'Administrador' }
      ];
      if (!usuario) return { ok: false, msg: 'Debe ingresar el usuario.' };
      if (!clave) return { ok: false, msg: 'Debe ingresar la contraseña.' };
      var u = demo.filter(function (x) { return x.usuario.toLowerCase() === String(usuario).toLowerCase(); })[0];
      if (!u || u.clave !== clave) return { ok: false, msg: 'Usuario o contraseña incorrectos.' };
      grabar(K_SESION, {
        usuarioId: u.usuarioId, usuario: u.usuario, nombre: u.nombre, perfilId: u.perfilId, perfil: u.perfil,
        permisos: u.perfilId === 'ADMIN'
          ? ['usuarios.ver', 'usuarios.crear', 'usuarios.editar', 'usuarios.eliminar', 'perfiles.gestionar', 'reportes.ver', 'reportes.propios', 'transaccion.CAMTIT.ejecutar']
          : ['reportes.propios', 'transaccion.CAMTIT.ejecutar'],
        inicio: new Date().toISOString(), sessionId: 'SES-' + Date.now()
      });
      return { ok: true };
    },

    exigirSesion: function () {
      var s = this.sesion();
      if (!s) { global.location.href = 'login.html?msg=sesion'; return null; }
      if (s.permisos && s.permisos.indexOf('transaccion.' + TRX_ID + '.ejecutar') < 0) {
        global.location.href = 'login.html?msg=denegado'; return null;
      }
      return s;
    },

    cerrarSesionPaquete: function () {
      quitar(K_SESION);
      global.location.href = 'login.html?msg=salida';
    },

    /* ===================== EJECUCIÓN / TEMPORIZADOR ===================== */
    ejecucion: function () { return leer(K_EJEC, null); },

    iniciarEjecucion: function () {
      var s = this.sesion();
      if (!s) return null;
      var previa = this.ejecucion();
      if (previa) this.cerrarEjecucion('Incompleta', true); // cierra con el último evento verificado
      var ahora = new Date();
      var ej = {
        id: 'SIM-' + ahora.getFullYear() + String(ahora.getMonth() + 1).padStart(2, '0') +
            String(ahora.getDate()).padStart(2, '0') + '-' + String(ahora.getTime()).slice(-5),
        usuarioId: s.usuarioId, usuario: s.usuario, asesor: s.nombre, perfil: s.perfilId,
        trxId: TRX_ID, trx: TRX_NOMBRE,
        inicio: ahora.toISOString(), inicioMs: ahora.getTime(),
        estado: 'En curso', errores: 0, omitidas: 0,
        pantallas: [], eventos: [], recorrido: [], tokens: []
      };
      grabar(K_EJEC, ej);
      grabar(K_DATOS, {});
      this.registrar('Acceso al Sistema', 'Inicio de prueba', 'OK');
      return this.ejecucion();
    },

    asegurarEjecucion: function () {
      return this.ejecucion() || this.iniciarEjecucion();
    },

    registrar: function (pantalla, accion, resultado) {
      var ej = this.ejecucion();
      if (!ej) return;
      ej.eventos.push({ ts: new Date().toISOString(), pantalla: pantalla, accion: accion, resultado: resultado });
      if (String(resultado).indexOf('ERROR') === 0) ej.errores++;
      grabar(K_EJEC, ej);
    },

    registrarOmision: function (pantalla, detalle) {
      var ej = this.ejecucion();
      if (!ej) return;
      ej.omitidas++;
      ej.eventos.push({ ts: new Date().toISOString(), pantalla: pantalla, accion: detalle, resultado: 'OMITIDA: validación no realizada' });
      grabar(K_EJEC, ej);
    },

    /* Suma el tiempo de permanencia de una pantalla evitando doble conteo */
    acumular: function (nombre, token, desdeMs) {
      var ej = this.ejecucion();
      if (!ej) return;
      if (ej.tokens.indexOf(token) >= 0) return;  // ya fue contabilizado (recarga/evento duplicado)
      ej.tokens.push(token);
      var seg = Math.max(0, Math.round((Date.now() - desdeMs) / 1000));
      var fila = ej.pantallas.filter(function (p) { return p.pantalla === nombre; })[0];
      if (fila) fila.seg += seg; else ej.pantallas.push({ pantalla: nombre, seg: seg });
      grabar(K_EJEC, ej);
    },

    /* Inicializa una pantalla operativa: cabecera + barra + temporizador */
    initPantalla: function (cfg) {
      cfg = cfg || {};
      var s = this.exigirSesion();
      if (!s) return null;
      var ej = cfg.iniciar ? this.iniciarEjecucion() : this.asegurarEjecucion();
      if (!ej) return null;

      if (ej.recorrido[ej.recorrido.length - 1] !== cfg.nombre) {
        ej.recorrido.push(cfg.nombre);
        grabar(K_EJEC, ej);
      }

      this.pintarHeader(cfg);
      this.pintarRuta(cfg);

      /* Temporizador: se calcula SIEMPRE desde la marca de inicio de la ejecución,
         por lo que sobrevive a recargas, botón Volver y cambios de pestaña. */
      var self = this;
      function tick() {
        var e = self.ejecucion();
        if (!e) return;
        var el = document.getElementById('siacTimer');
        if (el) el.textContent = hhmmss((Date.now() - e.inicioMs) / 1000);
      }
      tick();
      global.setInterval(tick, 1000);
      document.addEventListener('visibilitychange', tick);

      /* Medición de permanencia por pantalla */
      var token = 'TK' + Date.now() + '-' + Math.floor(Math.random() * 100000);
      var desde = Date.now();
      global.__siacToken = token; global.__siacDesde = desde; global.__siacPantalla = cfg.nombre;
      function flush() { self.acumular(cfg.nombre, token, desde); }
      global.addEventListener('pagehide', flush);
      global.addEventListener('beforeunload', flush);

      if (!almacenamientoOK()) {
        var m = document.getElementById('msgGlobal');
        if (m) {
          m.className = 'msg msg-warn';
          m.innerHTML = 'El navegador bloquea el almacenamiento local (frecuente al abrir con <code>file://</code> en algunos navegadores). ' +
            'La navegación funciona, pero el tiempo y la trazabilidad podrían no conservarse entre pantallas.';
        }
      }
      return { sesion: s, ejecucion: ej };
    },

    /* Navegación interna: descarga el tiempo de la pantalla antes de salir */
    ir: function (url, pantallaDestino) {
      if (global.__siacToken) this.acumular(global.__siacPantalla, global.__siacToken, global.__siacDesde);
      if (pantallaDestino) this.registrar(global.__siacPantalla || '', 'Navega a ' + pantallaDestino, 'OK');
      global.location.href = url;
    },

    /* ===================== CIERRE Y EVALUACIÓN ===================== */
    cerrarEjecucion: function (estado, usarUltimoEvento) {
      var ej = this.ejecucion();
      if (!ej) return null;
      if (global.__siacToken) {
        var seg = Math.max(0, Math.round((Date.now() - global.__siacDesde) / 1000));
        if (ej.tokens.indexOf(global.__siacToken) < 0) {
          ej.tokens.push(global.__siacToken);
          var f = ej.pantallas.filter(function (p) { return p.pantalla === global.__siacPantalla; })[0];
          if (f) f.seg += seg; else ej.pantallas.push({ pantalla: global.__siacPantalla, seg: seg });
        }
      }
      var finMs;
      if (usarUltimoEvento && ej.eventos.length) {
        finMs = new Date(ej.eventos[ej.eventos.length - 1].ts).getTime(); // tiempo verificado, no el abandono
      } else {
        finMs = Date.now();
      }
      ej.fin = new Date(finMs).toISOString();
      ej.duracion = Math.max(0, Math.round((finMs - ej.inicioMs) / 1000));
      ej.estado = estado;
      var p = Math.max(0, RUBRICA.base - ej.errores * RUBRICA.porError - ej.omitidas * RUBRICA.porOmision);
      ej.puntaje = p;
      ej.resultado = p >= RUBRICA.aprobado ? 'Aprobado' : (p >= RUBRICA.observado ? 'Observado' : 'Reforzar capacitación');
      ej.demo = false;

      var hist = leer(K_SESIONES, []);
      hist = hist.filter(function (x) { return x.id !== ej.id; });
      hist.unshift(ej);
      grabar(K_SESIONES, hist);
      quitar(K_EJEC);
      grabar('SIAC_ULTIMA_EJEC', ej);
      return ej;
    },

    cancelar: function () {
      var self = this;
      this.confirmar('¿Desea cancelar la práctica? Se registrará el estado <b>Cancelada</b> y se conservarán los datos capturados.', function () {
        self.registrar(global.__siacPantalla || '', 'Cancelar transacción', 'Cancelada por el asesor');
        self.cerrarEjecucion('Cancelada', false);
        global.location.href = 'CambioTitularidad_EvaluacionAsesor.html';
      });
    },

    /* ===================== DATOS DEL FLUJO ===================== */
    datos: function () { return leer(K_DATOS, {}); },
    guardarDatos: function (obj) {
      var d = this.datos();
      Object.keys(obj).forEach(function (k) { d[k] = obj[k]; });
      grabar(K_DATOS, d);
      return d;
    },

    /* ===================== UI ===================== */
    pintarHeader: function (cfg) {
      var s = this.sesion() || {};
      var ej = this.ejecucion() || {};
      var cont = document.getElementById('hdr');
      if (!cont) return;
      cont.innerHTML =
        '<div class="training-bar">ENTORNO DE ENTRENAMIENTO &mdash; SIMULADOR SIAC ÚNICO · TODOS LOS DATOS SON SIMULADOS</div>' +
        '<div class="siac-header">' +
          '<div class="siac-brand"><div class="siac-logo">Claro</div>' +
          '<div><div class="siac-title">SIAC ÚNICO</div>' +
          '<div class="siac-subtitle">SISTEMA INTEGRADO DE ATENCIÓN A CLIENTES</div></div></div>' +
          '<div class="siac-sesion"><b>' + esc(s.usuarioId || '') + ' - ' + esc(s.nombre || 'SIN SESIÓN') + '</b><br>' +
          'Session ID: ' + esc(s.sessionId || '') + ' &nbsp;|&nbsp; Perfil: ' + esc(s.perfil || '') + '<br>' +
          '<button type="button" class="btn-logout" onclick="SIAC.cerrarSesionPaquete()">Cerrar sesión</button></div>' +
        '</div>' +
        this.htmlBuscador(cfg) +
        this.htmlMenu(cfg) +
        '<div class="trx-bar">' +
          '<span>Asesor: <b>' + esc(s.nombre || '') + '</b></span>' +
          '<span>Transacción: <b>' + esc(TRX_NOMBRE) + '</b></span>' +
          '<span>Ejecución: <b>' + esc(ej.id || '') + '</b></span>' +
          '<span>Tiempo transcurrido: <span class="trx-timer" id="siacTimer">00:00:00</span></span>' +
          '<span class="trx-estado" id="siacEstado">' + esc(ej.estado || 'En curso') + '</span>' +
          '<button type="button" class="btn-cancelar" onclick="SIAC.cancelar()">Cancelar prueba</button>' +
        '</div>';
    },

    htmlBuscador: function (cfg) {
      var valor = (cfg && cfg.linea) ? cfg.linea : '';
      return '<div class="siac-tools">' +
        '<span>&#9881; Sistemas Administrativos</span>' +
        '<select disabled><option>Teléfono</option></select>' +
        '<input type="text" value="' + esc(valor) + '" readonly style="width:150px">' +
        '<button type="button" class="btn-buscar" disabled>&#128269;</button></div>';
    },

    htmlMenu: function (cfg) {
      var activo = cfg && cfg.menu;
      var items = [
        { t: 'Transacciones por Servicio', sub: [] },
        {
          t: 'Transacciones por Cuenta', k: 'cuenta', sub: [
            { t: 'A Servicios Masivos', h: '#' },
            { t: 'Activación / Desactivación Bolsa', h: '#' },
            { t: 'Activación / Desactivación de Servicios', h: '#' },
            { t: 'Afiliación Débito Automático', h: '#' },
            { t: 'Ajuste OCC Atención Cliente', h: '#' },
            { t: 'Anulación OCC', h: '#' },
            { t: 'Bolsa Compartida', h: '#' },
            { t: 'Cambio de Titularidad', h: 'CambioTitularidad_CambioTitularidad.html', destacado: true }
          ]
        },
        { t: 'Gestión de Casos', sub: [] }, { t: 'Enlaces', sub: [] },
        { t: 'Administración', sub: [] }, { t: 'Consultas', sub: [] },
        { t: 'Gestión de Acuerdos', sub: [] }, { t: 'Retención o Fidelización', sub: [] }
      ];
      var html = '<nav class="siac-menu">';
      items.forEach(function (it, i) {
        html += '<div>';
        if (it.sub.length) {
          html += '<a class="mi' + (it.k === activo ? ' abierto' : '') + '" href="javascript:void(0)" onclick="SIAC.toggleMenu(' + i + ')">' + it.t + ' +</a>';
          html += '<div class="submenu' + (it.k === activo ? ' visible' : '') + '" id="sub' + i + '">';
          it.sub.forEach(function (x) {
            var click = x.h === '#'
              ? 'javascript:SIAC.opcionNoCubierta(\'' + x.t.replace(/'/g, '') + '\')'
              : 'javascript:SIAC.ir(\'' + x.h + '\',\'Cambio de Titularidad\')';
            html += '<a href="' + click + '"' + (x.destacado ? ' class="destacado"' : '') + '>' + x.t + '</a>';
          });
          html += '</div>';
        } else {
          html += '<a class="mi" href="javascript:SIAC.opcionNoCubierta(\'' + it.t + '\')">' + it.t + ' +</a>';
        }
        html += '</div>';
      });
      return html + '</nav>';
    },

    toggleMenu: function (i) {
      var el = document.getElementById('sub' + i);
      if (!el) return;
      var visible = el.className.indexOf('visible') >= 0;
      Array.prototype.forEach.call(document.querySelectorAll('.submenu'), function (s) { s.className = 'submenu'; });
      if (!visible) el.className = 'submenu visible';
    },

    opcionNoCubierta: function (nombre) {
      this.alerta('La opción <b>' + esc(nombre) + '</b> no forma parte del alcance de este simulador.<br><br>' +
        'Alcance documentado: MDU_SIAC_UNICO_CambioTitularidad _v2.docx &mdash; transacción <b>Cambio de Titularidad</b>.', 'Fuera de alcance del MDU');
    },

    pintarRuta: function (cfg) {
      var el = document.getElementById('ruta');
      if (!el) return;
      el.innerHTML = 'Transacciones por Cuenta &gt; Cambio de Titularidad &gt; <b>' + esc(cfg.nombre) + '</b>' +
        (cfg.paso ? ' &nbsp;&nbsp;|&nbsp;&nbsp; Paso MDU: <b>' + esc(cfg.paso) + '</b>' : '');
    },

    fichaCliente: function (idContenedor) {
      var el = document.getElementById(idContenedor);
      if (!el) return;
      var c = CLIENTE;
      el.innerHTML =
        '<div class="panel"><div class="panel-header"><span class="icono">&#128100;</span>Datos del Cliente</div>' +
        '<div class="panel-body" style="padding:0">' +
        '<table class="ficha">' +
        fila('Contrato:', c.contrato) + fila('Customer ID:', c.customerId) + fila('Tipo de Cliente:', c.tipoCliente) +
        fila('Cliente:', c.cliente) + fila('Contacto:', c.contacto) + fila('DNI/RUC:', c.documento) +
        fila('Representante Legal:', c.representante) + fila('Plan Actual:', c.planActual) +
        fila('Fecha de Activación:', c.fechaActivacion) + fila('Ciclo de Facturación:', c.cicloFacturacion) +
        fila('Límite de Crédito:', c.limiteCredito) + fila('Tipo de Acuerdo:', c.tipoAcuerdo) +
        fila('Estado de Linea:', c.estadoLinea) + fila('Línea:', c.linea) + fila('Cuenta:', c.cuenta) +
        '</table></div>' +
        '<div class="panel-body" style="border-top:1px solid #eee"><span class="badge badge-sim">DATO SIMULADO PARA ENTRENAMIENTO</span></div></div>';
      function fila(k, v) { return '<tr><td class="k">' + k + '</td><td class="v">' + esc(v) + '</td></tr>'; }
    },

    mensaje: function (id, texto, tipo) {
      var el = document.getElementById(id);
      if (!el) return;
      if (!texto) { el.className = 'oculto'; el.innerHTML = ''; return; }
      el.className = 'msg msg-' + (tipo || 'info');
      el.innerHTML = texto;
    },

    alerta: function (texto, titulo, onOk) {
      var back = document.createElement('div');
      back.className = 'modal-back';
      back.innerHTML = '<div class="modal-box"><div class="modal-head">' + (titulo || 'Mensaje SIAC ÚNICO (SIMULADO)') + '</div>' +
        '<div class="modal-body">' + texto + '</div>' +
        '<div class="modal-foot"><button type="button" class="btn" id="mOk">Aceptar</button></div></div>';
      document.body.appendChild(back);
      back.querySelector('#mOk').onclick = function () { document.body.removeChild(back); if (onOk) onOk(); };
    },

    confirmar: function (texto, onSi) {
      var back = document.createElement('div');
      back.className = 'modal-back';
      back.innerHTML = '<div class="modal-box"><div class="modal-head">Confirmación (SIMULADO)</div>' +
        '<div class="modal-body">' + texto + '</div>' +
        '<div class="modal-foot"><button type="button" class="btn" id="mSi">Aceptar</button> ' +
        '<button type="button" class="btn btn-claro" id="mNo">Cancelar</button></div></div>';
      document.body.appendChild(back);
      back.querySelector('#mSi').onclick = function () { document.body.removeChild(back); onSi(); };
      back.querySelector('#mNo').onclick = function () { document.body.removeChild(back); };
    }
  };

  global.SIAC = SIAC;
})(window);
