/* ============================================================
   SIAC ÚNICO - Plataforma de Entrenamiento
   assets_js_auth.js : sesión y control de acceso (DEMOSTRACIÓN)
   ADVERTENCIA: mecanismo demostrativo. NO ofrece seguridad real.
   No conecta a directorios corporativos ni a sistemas productivos.
   ============================================================ */
(function (global) {
  'use strict';

  var BASE = (typeof global.SIAC_BASE === 'string') ? global.SIAC_BASE : '';
  var K = global.SIACDATA.K;

  function ahoraISO() { return new Date().toISOString(); }

  var SIACAUTH = {
    BASE: BASE,
    url: function (ruta) { return BASE + ruta; },

    /* ---- Autenticación simulada ---- */
    ingresar: function (usuario, clave) {
      usuario = (usuario || '').trim();
      clave = (clave || '');
      if (!usuario) return { ok: false, msg: 'Debe ingresar el usuario.' };
      if (!clave) return { ok: false, msg: 'Debe ingresar la contraseña.' };
      var lista = global.SIACDATA.usuarios();
      var u = null, i;
      for (i = 0; i < lista.length; i++) {
        if (lista[i].usuario.toLowerCase() === usuario.toLowerCase()) { u = lista[i]; break; }
      }
      if (!u) return { ok: false, msg: 'Usuario o contraseña incorrectos.' };
      if (u.clave !== clave) return { ok: false, msg: 'Usuario o contraseña incorrectos.' };
      if (u.estado !== 'Activo') return { ok: false, msg: 'El usuario se encuentra INACTIVO. Comuníquese con el administrador.' };
      var perfil = global.SIACDATA.perfilPorId(u.perfil);
      if (!perfil) return { ok: false, msg: 'El usuario no tiene un perfil válido asignado.' };
      var sesion = {
        usuarioId: u.id, usuario: u.usuario, nombre: u.nombre,
        perfilId: perfil.id, perfil: perfil.nombre,
        permisos: perfil.permisos.slice(),
        inicio: ahoraISO(),
        sessionId: 'SES-' + Date.now()
      };
      global.SIACDATA.grabar(K.SESION, sesion);
      return { ok: true, sesion: sesion };
    },

    sesion: function () { return global.SIACDATA.leer(K.SESION, null); },

    /* Refresca permisos si el administrador cambió el perfil del usuario */
    refrescar: function () {
      var s = this.sesion();
      if (!s) return null;
      var lista = global.SIACDATA.usuarios();
      for (var i = 0; i < lista.length; i++) {
        if (lista[i].id === s.usuarioId) {
          if (lista[i].estado !== 'Activo') { this.salir(); return null; }
          var p = global.SIACDATA.perfilPorId(lista[i].perfil);
          if (p) { s.perfilId = p.id; s.perfil = p.nombre; s.permisos = p.permisos.slice(); }
          s.nombre = lista[i].nombre;
          global.SIACDATA.grabar(K.SESION, s);
          return s;
        }
      }
      return s;
    },

    puede: function (permiso) {
      var s = this.refrescar();
      return !!(s && s.permisos.indexOf(permiso) >= 0);
    },

    /* Protege una página: valida sesión y permiso al cargar.
       No basta con ocultar enlaces del menú. */
    exigir: function (permiso) {
      var s = this.refrescar();
      if (!s) { global.location.href = BASE + 'login.html?msg=sesion'; return null; }
      if (permiso && s.permisos.indexOf(permiso) < 0) {
        global.location.href = BASE + 'index.html?msg=denegado';
        return null;
      }
      return s;
    },

    salir: function () {
      try { global.localStorage.removeItem(K.SESION); } catch (e) { }
      try { global.sessionStorage.removeItem(K.SESION); } catch (e) { }
    },

    cerrarSesion: function () {
      this.salir();
      global.location.href = BASE + 'login.html?msg=salida';
    },

    /* ---- Encabezado corporativo común ---- */
    pintarHeader: function (contenedorId, opciones) {
      opciones = opciones || {};
      var s = this.sesion();
      var cont = document.getElementById(contenedorId);
      if (!cont) return;
      var datosUsuario = s
        ? '<b>' + s.nombre + '</b><br>Perfil: ' + s.perfil + ' &nbsp;|&nbsp; Usuario: ' + s.usuario +
          '<br><button type="button" class="btn-logout" onclick="SIACAUTH.cerrarSesion()">Cerrar sesión</button>'
        : 'Sin sesión activa';
      cont.innerHTML =
        '<div class="training-bar">ENTORNO DE ENTRENAMIENTO &mdash; TODOS LOS DATOS SON SIMULADOS</div>' +
        '<div class="siac-header">' +
          '<div class="siac-brand">' +
            '<div class="siac-logo">Claro</div>' +
            '<div><div class="siac-title">SIAC ÚNICO</div>' +
            '<div class="siac-subtitle">SISTEMA INTEGRADO DE ATENCIÓN A CLIENTES &mdash; SIMULADOR DE CAPACITACIÓN</div></div>' +
          '</div>' +
          '<div class="siac-user">' + datosUsuario + '</div>' +
        '</div>' +
        (opciones.sinMenu ? '' : this.htmlMenu(opciones.activo));
    },

    htmlMenu: function (activo) {
      var s = this.sesion();
      if (!s) return '';
      var items = [{ k: 'portal', t: 'Portal', h: BASE + 'index.html' }];
      if (s.permisos.indexOf('usuarios.ver') >= 0) items.push({ k: 'usuarios', t: 'Mantenimiento de Usuarios', h: BASE + 'Mantenimiento/MantUsuario.html' });
      if (s.permisos.indexOf('perfiles.gestionar') >= 0) items.push({ k: 'perfiles', t: 'Mantenimiento de Perfiles', h: BASE + 'Mantenimiento/MantPerfil.html' });
      if (s.permisos.indexOf('reportes.ver') >= 0 || s.permisos.indexOf('reportes.propios') >= 0) items.push({ k: 'reportes', t: 'Reportes de Trazabilidad', h: BASE + 'Reporte/GesReporte.html' });
      var html = '<nav class="siac-menu">';
      for (var i = 0; i < items.length; i++) {
        html += '<a href="' + items[i].h + '"' + (items[i].k === activo ? ' class="active"' : '') + '>' + items[i].t + '</a>';
      }
      return html + '</nav>';
    }
  };

  global.SIACAUTH = SIACAUTH;
})(window);
