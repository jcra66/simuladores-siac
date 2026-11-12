/* ============================================================
   SIAC ÚNICO - Plataforma de Entrenamiento
   assets_js_app.js : utilitarios de navegación y UI del portal
   ============================================================ */
(function (global) {
  'use strict';

  var APP = {
    param: function (nombre) {
      var m = new RegExp('[?&]' + nombre + '=([^&]*)').exec(global.location.search);
      return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
    },

    esc: function (t) {
      return String(t === undefined || t === null ? '' : t)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    },

    mensaje: function (id, texto, tipo) {
      var el = document.getElementById(id);
      if (!el) return;
      if (!texto) { el.className = 'oculto'; el.innerHTML = ''; return; }
      el.className = 'msg msg-' + (tipo || 'info');
      el.innerHTML = texto;
      el.scrollIntoView({ block: 'nearest' });
    },

    hhmmss: function (segundos) {
      segundos = Math.max(0, Math.floor(segundos || 0));
      var h = Math.floor(segundos / 3600),
          m = Math.floor((segundos % 3600) / 60),
          s = segundos % 60;
      return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    },

    fecha: function (iso) {
      if (!iso) return '';
      var d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      function p(n) { return (n < 10 ? '0' : '') + n; }
      return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' +
             p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
    },

    soloFecha: function (iso) { return (iso || '').substring(0, 10); },

    confirmar: function (texto, onSi) {
      var back = document.createElement('div');
      back.className = 'modal-back';
      back.innerHTML =
        '<div class="modal-box"><div class="modal-head">Confirmación &mdash; SIAC ÚNICO (SIMULADO)</div>' +
        '<div class="modal-body">' + texto + '</div>' +
        '<div class="modal-foot">' +
        '<button type="button" class="btn" id="mdSi">Aceptar</button> ' +
        '<button type="button" class="btn btn-secondary" id="mdNo">Cancelar</button></div></div>';
      document.body.appendChild(back);
      back.querySelector('#mdSi').onclick = function () { document.body.removeChild(back); onSi(); };
      back.querySelector('#mdNo').onclick = function () { document.body.removeChild(back); };
    },

    alerta: function (texto, titulo) {
      var back = document.createElement('div');
      back.className = 'modal-back';
      back.innerHTML =
        '<div class="modal-box"><div class="modal-head">' + (titulo || 'Mensaje del sistema (SIMULADO)') + '</div>' +
        '<div class="modal-body">' + texto + '</div>' +
        '<div class="modal-foot"><button type="button" class="btn" id="mdOk">Aceptar</button></div></div>';
      document.body.appendChild(back);
      back.querySelector('#mdOk').onclick = function () { document.body.removeChild(back); };
    },

    /* Exportación CSV sin dependencias externas */
    exportarCSV: function (nombreArchivo, cabeceras, filas) {
      var sep = ';';
      var txt = cabeceras.join(sep) + '\n';
      filas.forEach(function (f) {
        txt += f.map(function (c) {
          var v = (c === null || c === undefined) ? '' : String(c);
          return '"' + v.replace(/"/g, '""') + '"';
        }).join(sep) + '\n';
      });
      var blob = new Blob(['\ufeff' + txt], { type: 'text/csv;charset=utf-8;' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = nombreArchivo;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }
  };

  global.APP = APP;
})(window);
