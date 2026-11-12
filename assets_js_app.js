/* ==========================================================
   SIAC UNICO - Simuladores de Entrenamiento (Claro)
   Script compartido - assets_js_app.js
   JavaScript Vanilla. Compatible con SharePoint Online:
   sin document.write, sin <base>, sin scripts inline dinamicos.
   ========================================================== */

var SIAC = (function () {
  "use strict";

  /* ---------- Datos simulados (ENTRENAMIENTO) ---------- */
  var DATOS = {
    asesor: "C12640 - ASESOR DEMO ENTRENAMIENTO (SIMULADO)",
    sesion: "20261111160000001 (SIMULADO)",
    linea: "997320039",
    contrato: "22712561",
    customerId: "33691049",
    tipoCliente: "Consumer",
    cliente: "JUAN PEREZ SIMULADO",
    contacto: "JUAN PEREZ SIMULADO",
    documento: "42733861",
    repLegal: "JUAN PEREZ SIMULADO",
    cuenta: "8.15135802.00.00.100000",
    producto: "PostPago - Telefonia Movil",
    cicloFact: "04",
    limiteCredito: "160",
    estadoLinea: "Activo",
    email: "juan.perez@correo-simulado.com",
    pinValido: "1234",
    usuarioSupervisor: "SUPERVISOR01",
    claveSupervisor: "claro2026",
    lineas: [
      { plan: "Claro Max 99 (SF)", linea: "997320039", reintegro: "0.00" },
      { plan: "FULL EMPRESA RED i 95", linea: "986670223", reintegro: "2.24" },
      { plan: "FULL EMPRESA RED i 95", linea: "997500206", reintegro: "2.24" },
      { plan: "FULL EMPRESA RED i 95", linea: "997500212", reintegro: "2.24" },
      { plan: "Internet Movil(C)", linea: "989068234", reintegro: "2.24" }
    ],
    cuentasDestino: [
      { cuenta: "8.15135802.00.00.200000", titular: "JUAN PEREZ SIMULADO", estado: "Activo", ciclo: "04" },
      { cuenta: "8.15135802.00.00.300000", titular: "JUAN PEREZ SIMULADO", estado: "Activo", ciclo: "07" }
    ]
  };

  /* ---------- Registro del recorrido (sessionStorage) ---------- */
  var KEY_PASOS = "siac_ct_pasos";
  var KEY_ERRORES = "siac_ct_errores";
  var KEY_DATOS = "siac_ct_datos";

  function leer(key) {
    try { return JSON.parse(sessionStorage.getItem(key) || "[]"); }
    catch (e) { return []; }
  }
  function escribir(key, val) {
    try { sessionStorage.setItem(key, JSON.stringify(val)); } catch (e) { }
  }

  function registrarPaso(pantalla, accion) {
    var p = leer(KEY_PASOS);
    p.push({ pantalla: pantalla, accion: accion, hora: new Date().toLocaleTimeString() });
    escribir(KEY_PASOS, p);
  }
  function registrarError(pantalla, detalle, tipo) {
    var e = leer(KEY_ERRORES);
    e.push({ pantalla: pantalla, detalle: detalle, tipo: tipo || "Validacion", hora: new Date().toLocaleTimeString() });
    escribir(KEY_ERRORES, e);
  }
  function pasos() { return leer(KEY_PASOS); }
  function errores() { return leer(KEY_ERRORES); }
  function reiniciar() {
    try {
      sessionStorage.removeItem(KEY_PASOS);
      sessionStorage.removeItem(KEY_ERRORES);
      sessionStorage.removeItem(KEY_DATOS);
    } catch (e) { }
  }
  function guardarDato(k, v) {
    var d = {};
    try { d = JSON.parse(sessionStorage.getItem(KEY_DATOS) || "{}"); } catch (e) { d = {}; }
    d[k] = v;
    try { sessionStorage.setItem(KEY_DATOS, JSON.stringify(d)); } catch (e) { }
  }
  function obtenerDato(k, porDefecto) {
    var d = {};
    try { d = JSON.parse(sessionStorage.getItem(KEY_DATOS) || "{}"); } catch (e) { d = {}; }
    return (typeof d[k] === "undefined") ? porDefecto : d[k];
  }

  /* ---------- Utilidades DOM (createElement / appendChild) ---------- */
  function el(tag, clase, texto) {
    var n = document.createElement(tag);
    if (clase) { n.className = clase; }
    if (texto !== undefined && texto !== null) { n.appendChild(document.createTextNode(texto)); }
    return n;
  }
  function porId(id) { return document.getElementById(id); }

  /* ---------- Banda de entrenamiento ---------- */
  function banda(destino) {
    var d = destino || document.body;
    var b = el("div", "banda-entrenamiento",
      "ENTORNO DE ENTRENAMIENTO - SIAC UNICO - DATOS SIMULADOS - NO CONECTA A SISTEMAS REALES");
    d.insertBefore(b, d.firstChild);
  }

  /* ---------- Header corporativo ---------- */
  function header(contenedorId) {
    var cont = porId(contenedorId);
    if (!cont) { return; }

    var h = el("div", "siac-header");
    var logo = el("div", "logo", "Claro");
    var tit = el("div", "titulos");
    tit.appendChild(el("div", "t1", "SIAC UNICO"));
    tit.appendChild(el("div", "t2", "SISTEMA INTEGRADO DE ATENCION A CLIENTES"));
    var usr = el("div", "usuario");
    usr.appendChild(el("div", "nom", DATOS.asesor));
    usr.appendChild(el("div", "ses", "Session ID: " + DATOS.sesion));
    h.appendChild(logo);
    h.appendChild(tit);
    h.appendChild(usr);
    cont.appendChild(h);

    var bb = el("div", "siac-barrabusqueda");
    bb.appendChild(el("span", "adm", "Sistemas Administrativos"));
    var sel = el("select");
    sel.appendChild(new Option("Telefono", "t"));
    sel.appendChild(new Option("Documento", "d"));
    sel.appendChild(new Option("Cuenta", "c"));
    sel.style.width = "110px";
    var inp = el("input");
    inp.type = "text";
    inp.id = "txtBusquedaHeader";
    inp.value = DATOS.linea;
    inp.style.width = "180px";
    var btn = el("button", "btn-lupa", "Q");
    btn.onclick = function () { window.location.href = "./CambioTitularidad_BusquedaCliente.html"; };
    bb.appendChild(sel);
    bb.appendChild(inp);
    bb.appendChild(btn);
    cont.appendChild(bb);
  }

  /* ---------- Menu principal ---------- */
  var MENU = [
    { t: "Transacciones por Servicio", sub: [] },
    {
      t: "Transacciones por Cuenta", sub: [
        "A Servicios Masivos", "Activacion / Desactivacion Bolsa",
        "Activacion / Desactivacion Bolsa RPM/RPMe/Servicio",
        "Activacion / Desactivacion de Servicios", "Afiliacion Debito Automatico",
        "Afiliacion Debito Automatico NP", "Ajuste OCC Atencion Cliente",
        "Anulacion OCC", "Bolsa Compartida", "Calculo de Reintegro",
        "Cambio de Ciclo de Facturacion", "Cambio de Datos", "Cambio de Datos Menores",
        "Cambio de Direccion de Facturacion", "Cambio de Tipo de Cliente",
        "Cambio de Titularidad"
      ]
    },
    { t: "Gestion de Casos", sub: [] },
    { t: "Enlaces", sub: [] },
    { t: "Administracion", sub: [] },
    { t: "Consultas", sub: [] },
    { t: "Gestion de Acuerdos", sub: [] },
    { t: "Retencion o Fidelizacion", sub: [] },
    { t: "Reclamos SGA y No Cliente", sub: [] }
  ];

  function menu(contenedorId) {
    var cont = porId(contenedorId);
    if (!cont) { return; }
    var nav = el("div", "siac-menu");
    var ul = el("ul");
    MENU.forEach(function (m) {
      var li = el("li");
      var a = el("a", null, m.t);
      a.href = "javascript:void(0)";
      var mas = el("span", "mas", "+");
      a.appendChild(mas);
      li.appendChild(a);
      if (m.sub.length) {
        var sub = el("ul", "submenu");
        m.sub.forEach(function (s) {
          var sli = el("li");
          var sa = el("a", (s === "Cambio de Titularidad" ? "activo" : null), s);
          if (s === "Cambio de Titularidad") {
            sa.href = "./CambioTitularidad_CambioTitularidad.html";
          } else {
            sa.href = "javascript:void(0)";
            sa.onclick = function () {
              modal("Alerta", "Opcion no incluida en este simulador de entrenamiento.");
            };
          }
          sli.appendChild(sa);
          sub.appendChild(sli);
        });
        li.appendChild(sub);
      }
      ul.appendChild(li);
    });
    nav.appendChild(ul);
    cont.appendChild(nav);
  }

  /* ---------- Barra de transaccion ---------- */
  function trxBar(contenedorId, titulo) {
    var cont = porId(contenedorId);
    if (!cont) { return; }
    var b = el("div", "trx-bar", titulo);
    b.appendChild(el("span", "nodo", "Nodo Corporativo"));
    cont.appendChild(b);
  }

  /* ---------- Ruta de pasos ---------- */
  function ruta(contenedorId, pasoActual) {
    var cont = porId(contenedorId);
    if (!cont) { return; }
    var secuencia = [
      "Busqueda Cliente", "Cambio de Titularidad", "Validacion PIN",
      "Validacion Supervisor", "Lineas Cuenta Origen", "Datos Nuevo Titular",
      "Confirmacion", "Constancia"
    ];
    var d = el("div", "ruta");
    secuencia.forEach(function (s, i) {
      if (i > 0) { d.appendChild(document.createTextNode("  >  ")); }
      if (s === pasoActual) {
        d.appendChild(el("b", null, s));
      } else {
        d.appendChild(document.createTextNode(s));
      }
    });
    cont.appendChild(d);
  }

  /* ---------- Ficha del cliente ---------- */
  function fichaCliente(contenedorId) {
    var cont = porId(contenedorId);
    if (!cont) { return; }
    var filas = [
      ["Contrato:", DATOS.contrato],
      ["Customer ID:", DATOS.customerId],
      ["Tipo de Cliente:", DATOS.tipoCliente],
      ["Cliente:", DATOS.cliente],
      ["Contacto:", DATOS.contacto],
      ["DNI/RUC:", DATOS.documento],
      ["Representante Legal:", DATOS.repLegal],
      ["Plan Actual:", "Claro Max 99 (SF)"],
      ["Fecha de Activacion:", "21/12/2016 12:10:55 a.m."],
      ["Ciclo de Facturacion:", DATOS.cicloFact],
      ["Limite de Credito:", DATOS.limiteCredito],
      ["Tipo de Acuerdo:", "[POR DEFINIR]"],
      ["Estado de Linea:", DATOS.estadoLinea]
    ];
    var p = el("div", "panel ficha");
    p.appendChild(el("div", "panel-head", "Datos del Cliente"));
    var body = el("div", "panel-body");
    var t = el("table");
    filas.forEach(function (f) {
      var tr = el("tr");
      tr.appendChild(el("td", "lbl", f[0]));
      var td = el("td", null, f[1]);
      td.appendChild(el("span", "simulado", "DATO SIMULADO PARA ENTRENAMIENTO"));
      tr.appendChild(td);
      t.appendChild(tr);
    });
    body.appendChild(t);
    p.appendChild(body);
    cont.appendChild(p);
  }

  /* ---------- Modal ---------- */
  function modal(titulo, mensaje, onAceptar, conCancelar, onCancelar) {
    var fondo = el("div", "modal-fondo");
    var caja = el("div", "modal-caja");
    caja.appendChild(el("div", "modal-head", titulo));
    caja.appendChild(el("div", "modal-body", mensaje));
    var foot = el("div", "modal-foot");
    var ok = el("button", "btn", "Aceptar");
    ok.onclick = function () {
      document.body.removeChild(fondo);
      if (typeof onAceptar === "function") { onAceptar(); }
    };
    foot.appendChild(ok);
    if (conCancelar) {
      var ca = el("button", "btn secundario", "Cancelar");
      ca.onclick = function () {
        document.body.removeChild(fondo);
        if (typeof onCancelar === "function") { onCancelar(); }
      };
      foot.appendChild(ca);
    }
    caja.appendChild(foot);
    fondo.appendChild(caja);
    document.body.appendChild(fondo);
  }

  /* ---------- Modal de autorizacion Jefe/Supervisor ---------- */
  function modalAutorizacion(onOk) {
    var fondo = el("div", "modal-fondo");
    var caja = el("div", "modal-caja");
    caja.appendChild(el("div", "modal-head", "Autorizacion"));
    var body = el("div", "modal-body");
    var u = el("input"); u.type = "text"; u.placeholder = "Usuario";
    var c = el("input"); c.type = "password"; c.placeholder = "Password";
    c.style.marginTop = "8px";
    body.appendChild(u);
    body.appendChild(c);
    var av = el("div", "msg err oculto");
    body.appendChild(av);
    caja.appendChild(body);
    var foot = el("div", "modal-foot");
    var ok = el("button", "btn", "Aceptar");
    ok.onclick = function () {
      if (u.value === DATOS.usuarioSupervisor && c.value === DATOS.claveSupervisor) {
        document.body.removeChild(fondo);
        if (typeof onOk === "function") { onOk(); }
      } else {
        av.className = "msg err";
        av.innerHTML = "";
        av.appendChild(document.createTextNode("Usuario o clave de Jefe/Supervisor incorrectos."));
        registrarError("Validacion Supervisor", "Credencial de Jefe/Supervisor incorrecta", "Validacion");
      }
    };
    var ca = el("button", "btn secundario", "Cancelar");
    ca.onclick = function () { document.body.removeChild(fondo); };
    foot.appendChild(ok);
    foot.appendChild(ca);
    caja.appendChild(foot);
    fondo.appendChild(caja);
    document.body.appendChild(fondo);
  }

  /* ---------- Temporizador de PIN ---------- */
  function timer(spanId, segundos, alVencer) {
    var s = porId(spanId);
    if (!s) { return null; }
    var restante = segundos;
    function pintar() {
      var m = Math.floor(restante / 60);
      var sg = restante % 60;
      s.innerHTML = "";
      s.appendChild(document.createTextNode(
        "00:" + (m < 10 ? "0" + m : m) + ":" + (sg < 10 ? "0" + sg : sg)));
    }
    pintar();
    var id = setInterval(function () {
      restante--;
      if (restante <= 0) {
        clearInterval(id);
        restante = 0;
        pintar();
        if (typeof alVencer === "function") { alVencer(); }
      } else {
        pintar();
      }
    }, 1000);
    return id;
  }

  /* ---------- Mensajes en pantalla ---------- */
  function mensaje(contenedorId, tipo, texto) {
    var c = porId(contenedorId);
    if (!c) { return; }
    c.className = "msg " + tipo;
    c.innerHTML = "";
    c.appendChild(document.createTextNode(texto));
  }

  function ir(pagina, pantalla, accion) {
    if (pantalla) { registrarPaso(pantalla, accion || "Continuar"); }
    window.location.href = "./" + pagina;
  }

  /* ---------- Armado estandar de pagina ---------- */
  function layout(opciones) {
    banda();
    var top = porId(opciones.topId || "top");
    if (top) {
      header(opciones.topId || "top");
      menu(opciones.topId || "top");
      if (opciones.titulo) { trxBar(opciones.topId || "top", opciones.titulo); }
      if (opciones.paso) { ruta(opciones.topId || "top", opciones.paso); }
    }
    if (opciones.ficha) { fichaCliente(opciones.fichaId || "ficha"); }
    if (opciones.registrar) { registrarPaso(opciones.registrar, "Ingreso a pantalla"); }
  }

  return {
    DATOS: DATOS,
    el: el,
    porId: porId,
    banda: banda,
    header: header,
    menu: menu,
    trxBar: trxBar,
    ruta: ruta,
    fichaCliente: fichaCliente,
    modal: modal,
    modalAutorizacion: modalAutorizacion,
    timer: timer,
    mensaje: mensaje,
    ir: ir,
    layout: layout,
    registrarPaso: registrarPaso,
    registrarError: registrarError,
    pasos: pasos,
    errores: errores,
    reiniciar: reiniciar,
    guardarDato: guardarDato,
    obtenerDato: obtenerDato
  };
})();
