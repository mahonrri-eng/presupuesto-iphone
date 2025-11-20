// Presupuesto iPhone – Ingresos propios y Resumen solo lectura (PWA-ready)
(function () {
  // --- Navegación ---
  const views = {
    resumen: document.getElementById('viewResumen'),
    ingresos: document.getElementById('viewIngresos'),
    gastos: document.getElementById('viewGastos'),
    config: document.getElementById('viewConfig')
  };
  const tabButtons = document.querySelectorAll('.tab-btn');
  function showView(name) {
    Object.values(views).forEach(v => v.classList.remove('active'));
    views[name]?.classList.add('active');
    tabButtons.forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  }
  tabButtons.forEach(b => b.addEventListener('click', () => showView(b.dataset.tab)));

  // --- Elementos UI ---
  // Ingresos múltiples
  const conceptoIngresoInput = document.getElementById('conceptoIngreso');
  const montoIngresoInput = document.getElementById('montoIngreso');
  const agregarIngresoBtn = document.getElementById('agregarIngreso');
  const limpiarIngresosBtn = document.getElementById('limpiarIngresos');
  const buscarIngresoInput = document.getElementById('buscarIngreso');
  const listaIngresosEl = document.getElementById('listaIngresos');
  const totalIngresosTablaEl = document.getElementById('totalIngresosTabla');
  const prefixIngresoEl = document.getElementById('prefixIngreso');

  // Gastos
  const conceptoInput = document.getElementById('concepto');
  const cantidadInput = document.getElementById('cantidad');
  const agregarGastoBtn = document.getElementById('agregarGasto');
  const limpiarGastosBtn = document.getElementById('limpiarGastos');
  const buscarInput = document.getElementById('buscar');
  const listaGastosEl = document.getElementById('listaGastos');
  const totalGastosEl = document.getElementById('totalGastos');
  const prefixGastoEl = document.getElementById('prefixGasto');

  // Config
  const monedaSel = document.getElementById('moneda');
  const umbralLimiteInput = document.getElementById('umbralLimite');
  const umbralPequenoInput = document.getElementById('umbralPequeno');
  const objetivoInput = document.getElementById('objetivoAhorro');
  const guardarConfigBtn = document.getElementById('guardarConfig');
  const resetConfigBtn = document.getElementById('resetConfig');
  const prefixObjetivoEl = document.getElementById('prefixObjetivo');

  // Resumen/Gráfico/Recomendación
  const totalIngresosEl = document.getElementById('totalIngresos');
  const resumenGastosEl = document.getElementById('resumenGastos');
  const restanteEl = document.getElementById('restante');
  const barIngresosEl = document.getElementById('barIngresos');
  const barGastosEl = document.getElementById('barGastos');
  const barRestanteEl = document.getElementById('barRestante');
  const recomendacionEl = document.getElementById('recomendacion');

  // --- Storage ---
  const LS_KEY = 'presupuesto-iphone-v1';
  let state = {
    incomes: [], // { id, concepto, cantidad }
    gastos: [],  // { id, concepto, cantidad }
    config: { currency: 'ARS', limitPct: 5, smallPct: 15, savingsGoal: 0 }
  };

  // --- Utils ---
  const uid = () => Math.random().toString(36).slice(2, 9);
  const coerceNumber = (val) => {
    // Reemplaza coma por punto para iPhone teclado decimal
    if (typeof val === 'string') val = val.replace(',', '.');
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  };
  const getCurrencySymbol = (code) => {
    try {
      const parts = new Intl.NumberFormat('es-AR', { style: 'currency', currency: code }).formatToParts(1);
      const cur = parts.find(p => p.type === 'currency');
      return cur ? cur.value : '$';
    } catch (e) { return '$'; }
  };
  const fmtMoneda = (n) => {
    try {
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: state.config.currency, maximumFractionDigits: 2 }).format(n || 0);
    } catch (e) { return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(n || 0); }
  };
  const guardar = () => localStorage.setItem(LS_KEY, JSON.stringify(state));
  const cargar = () => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) { try { state = JSON.parse(raw); } catch (e) {} }
  };
  const actualizarPrefijos = () => {
    const symbol = getCurrencySymbol(state.config.currency);
    [prefixIngresoEl, prefixGastoEl, prefixObjetivoEl].forEach(el => el && (el.textContent = symbol));
  };

  // --- Ingresos ---
  const totalIngresos = () => state.incomes.reduce((acc, i) => acc + coerceNumber(i.cantidad), 0);
  const renderIngresos = (filtro = '') => {
    const term = (filtro || '').trim().toLowerCase();
    listaIngresosEl.innerHTML = '';
    const ingresos = state.incomes.filter(i => (i.concepto || '').toLowerCase().includes(term));
    if (ingresos.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 3; td.style.color = '#9aa3b2';
      td.textContent = term ? 'Sin resultados.' : 'Aún no registraste ingresos.';
      tr.appendChild(td); listaIngresosEl.appendChild(tr);
      totalIngresosTablaEl.textContent = fmtMoneda(totalIngresos());
      return;
    }
    ingresos.forEach(i => {
      const tr = document.createElement('tr');
      const tdConcepto = document.createElement('td');
      const tdMonto = document.createElement('td');
      const tdAcciones = document.createElement('td');
      tdConcepto.textContent = i.concepto;
      tdMonto.className = 'num'; tdMonto.textContent = fmtMoneda(coerceNumber(i.cantidad));
      tdAcciones.className = 'row-actions';
      const delBtn = document.createElement('button');
      delBtn.className = 'btn ghost'; delBtn.textContent = 'Eliminar';
      delBtn.addEventListener('click', () => eliminarIngreso(i.id));
      tdAcciones.appendChild(delBtn);
      tr.appendChild(tdConcepto); tr.appendChild(tdMonto); tr.appendChild(tdAcciones);
      listaIngresosEl.appendChild(tr);
    });
    totalIngresosTablaEl.textContent = fmtMoneda(totalIngresos());
  };
  const agregarIngreso = () => {
    const concepto = (conceptoIngresoInput.value || '').trim();
    const monto = coerceNumber(montoIngresoInput.value);
    if (!concepto) { conceptoIngresoInput.focus(); return; }
    if (monto <= 0) { montoIngresoInput.focus(); return; }
    state.incomes.push({ id: uid(), concepto, cantidad: monto });
    conceptoIngresoInput.value = ''; montoIngresoInput.value = '';
    guardar(); renderIngresos(buscarIngresoInput.value); actualizarResumen();
  };
  const eliminarIngreso = (id) => {
    state.incomes = state.incomes.filter(i => i.id !== id);
    guardar(); renderIngresos(buscarIngresoInput.value); actualizarResumen();
  };
  const limpiarIngresos = () => {
    if (confirm('¿Seguro que deseas eliminar todos los ingresos?')) {
      state.incomes = []; guardar(); renderIngresos(buscarIngresoInput.value); actualizarResumen();
    }
  };

  // --- Gastos ---
  const totalGastos = () => state.gastos.reduce((acc, g) => acc + coerceNumber(g.cantidad), 0);
  const renderGastos = (filtro = '') => {
    const term = (filtro || '').trim().toLowerCase();
    listaGastosEl.innerHTML = '';
    const gastos = state.gastos.filter(g => (g.concepto || '').toLowerCase().includes(term));
    if (gastos.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 3; td.style.color = '#9aa3b2';
      td.textContent = term ? 'Sin resultados.' : 'Aún no registraste gastos.';
      tr.appendChild(td); listaGastosEl.appendChild(tr);
      totalGastosEl.textContent = fmtMoneda(totalGastos());
      return;
    }
    gastos.forEach(g => {
      const tr = document.createElement('tr');
      const tdConcepto = document.createElement('td');
      const tdMonto = document.createElement('td');
      const tdAcciones = document.createElement('td');
      tdConcepto.textContent = g.concepto;
      tdMonto.className = 'num'; tdMonto.textContent = fmtMoneda(coerceNumber(g.cantidad));
      tdAcciones.className = 'row-actions';
      const delBtn = document.createElement('button');
      delBtn.className = 'btn ghost'; delBtn.textContent = 'Eliminar';
      delBtn.addEventListener('click', () => eliminarGasto(g.id));
      tdAcciones.appendChild(delBtn);
      tr.appendChild(tdConcepto); tr.appendChild(tdMonto); tr.appendChild(tdAcciones);
      listaGastosEl.appendChild(tr);
    });
    totalGastosEl.textContent = fmtMoneda(totalGastos());
  };
  const agregarGasto = () => {
    const concepto = (conceptoInput.value || '').trim();
    const cantidad = coerceNumber(cantidadInput.value);
    if (!concepto) { conceptoInput.focus(); return; }
    if (cantidad <= 0) { cantidadInput.focus(); return; }
    state.gastos.push({ id: uid(), concepto, cantidad });
    conceptoInput.value = ''; cantidadInput.value = '';
    guardar(); renderGastos(buscarInput.value); actualizarResumen();
  };
  const eliminarGasto = (id) => {
    state.gastos = state.gastos.filter(g => g.id !== id);
    guardar(); renderGastos(buscarInput.value); actualizarResumen();
  };
  const limpiarGastos = () => {
    if (confirm('¿Seguro que deseas eliminar todos los gastos?')) {
      state.gastos = []; guardar(); renderGastos(buscarInput.value); actualizarResumen();
    }
  };

  // --- Resumen & recomendación ---
  const actualizarResumen = () => {
    const ingresos = totalIngresos();
    const gastos = totalGastos();
    const restante = ingresos - gastos;
    totalIngresosEl.textContent = fmtMoneda(ingresos);
    resumenGastosEl.textContent = fmtMoneda(gastos);
    restanteEl.textContent = fmtMoneda(restante);
    const maxVal = Math.max(ingresos, gastos, Math.abs(restante));
    const pct = (v) => maxVal > 0 ? Math.min(100, Math.max(0, (v / maxVal) * 100)) : 0;
    requestAnimationFrame(() => {
      barIngresosEl.style.width = pct(ingresos) + '%';
      barGastosEl.style.width = pct(gastos) + '%';
      barRestanteEl.style.width = pct(Math.max(restante, 0)) + '%';
    });
    const limitPct = Number(state.config.limitPct || 5) / 100;
    const smallPct = Number(state.config.smallPct || 15) / 100;
    const ratio = ingresos > 0 ? (restante / ingresos) : 0;
    let statusMsg = '', tone = '', advice = '';
    if (ingresos <= 0) { statusMsg = 'Registra al menos un ingreso para comenzar.'; tone = 'note'; }
    else if (restante < 0) { statusMsg = '⚠️ Estás en números rojos. Tus gastos superan tus ingresos.'; tone = 'danger'; advice = 'Recorta gastos prescindibles y prioriza pagos esenciales. Renegocia servicios y evalúa ingresos adicionales.'; }
    else if (ratio <= limitPct) { statusMsg = '⚠️ Estás al límite. El margen restante es muy bajo.'; tone = 'danger'; advice = 'Aplica la regla 80/20 y fija topes semanales para variables.'; }
    else if (ratio <= smallPct) { statusMsg = '🙂 Tienes un pequeño margen de ahorro.'; tone = 'warn'; advice = 'Construye fondo de emergencia 3–6 meses y automatiza ahorro.'; }
    else { statusMsg = '🎉 ¡Vas ahorrando de forma saludable!'; tone = 'ok'; advice = 'Evalúa diversificar en índices amplios y bonos de corto plazo.'; }
    const goal = Number(state.config.savingsGoal || 0);
    let badgesHTML = '';
    if (goal > 0 && ingresos > 0) {
      if (restante >= goal) { badgesHTML += `<span class="badge ok">✅ Objetivo de ahorro cumplido</span>`; }
      else { const faltan = goal - Math.max(restante, 0); badgesHTML += `<span class="badge warn">🎯 Faltan ${fmtMoneda(faltan)} para alcanzar tu objetivo</span>`; }
    }
    if ((Number(state.config.smallPct||15)) <= (Number(state.config.limitPct||5))) {
      badgesHTML += `<span class="badge danger">⚠️ Revisa umbrales: “pequeño margen” debe ser mayor que “límite”.</span>`;
    }
    const investIdeas = restante > 0 ? [
      'Fondo de emergencia primero (3–6 meses).',
      'Instrumentos líquidos de bajo riesgo (p. ej., fondos money market).',
      'Índices amplios de bajo costo (≥ 5 años).',
      'Bonos gubernamentales corto/mediano plazo.'
    ] : [];
    recomendacionEl.innerHTML = `
      <div class="status ${tone}">${statusMsg}</div>
      <div class="note">${advice}</div>
      ${investIdeas.length ? `<div class="invest"><strong>Si estás ahorrando, podrías:</strong><br>${investIdeas.map(i => `<span class='pill'>${i}</span>`).join(' ')}</div>` : ''}
      ${badgesHTML ? `<div class="badges">${badgesHTML}</div>` : ''}
    `;
  };

  // --- Config ---
  const guardarConfig = () => {
    const currency = monedaSel.value || 'ARS';
    const limitPct = Number(umbralLimiteInput.value || 5);
    const smallPct = Number(umbralPequenoInput.value || 15);
    const goal = coerceNumber(objetivoInput.value);
    state.config.currency = currency;
    state.config.limitPct = Math.max(1, Math.min(50, limitPct));
    state.config.smallPct = Math.max(1, Math.min(50, smallPct));
    state.config.savingsGoal = Math.max(0, goal);
    actualizarPrefijos(); guardar(); renderIngresos(buscarIngresoInput.value); renderGastos(buscarInput.value); actualizarResumen();
  };
  const resetConfig = () => { monedaSel.value = 'ARS'; umbralLimiteInput.value = 5; umbralPequenoInput.value = 15; objetivoInput.value = 0; guardarConfig(); };

  // --- Eventos ---
  agregarIngresoBtn.addEventListener('click', agregarIngreso);
  limpiarIngresosBtn.addEventListener('click', limpiarIngresos);
  buscarIngresoInput.addEventListener('input', () => renderIngresos(buscarIngresoInput.value));
  agregarGastoBtn.addEventListener('click', agregarGasto);
  limpiarGastosBtn.addEventListener('click', limpiarGastos);
  buscarInput.addEventListener('input', () => renderGastos(buscarInput.value));
  guardarConfigBtn.addEventListener('click', guardarConfig);
  resetConfigBtn.addEventListener('click', resetConfig);
  monedaSel.addEventListener('change', () => { const symbol = getCurrencySymbol(monedaSel.value || 'ARS'); [prefixIngresoEl, prefixGastoEl, prefixObjetivoEl].forEach(el => el && (el.textContent = symbol)); });

  // --- Init ---
  cargar();
  actualizarPrefijos();
  renderIngresos(''); renderGastos(''); actualizarResumen();
  showView('resumen');
})();
