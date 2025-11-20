let ingresos = [];
let gastos = [];

function agregarIngreso() {
    const concepto = document.getElementById('conceptoIngreso').value;
    const monto = parseFloat(document.getElementById('montoIngreso').value);
    if (concepto && monto > 0) {
        ingresos.push(monto);
        actualizarResumen();
        document.getElementById('listaIngresos').innerHTML += `<li>${concepto}: $${monto.toLocaleString('es-AR', {minimumFractionDigits: 2})}</li>`;
    }
}

function agregarGasto() {
    const concepto = document.getElementById('conceptoGasto').value;
    const monto = parseFloat(document.getElementById('montoGasto').value);
    if (concepto && monto > 0) {
        gastos.push(monto);
        actualizarResumen();
        document.getElementById('listaGastos').innerHTML += `<li>${concepto}: $${monto.toLocaleString('es-AR', {minimumFractionDigits: 2})}</li>`;
    }
}

function actualizarResumen() {
    const totalIngresos = ingresos.reduce((a, b) => a + b, 0);
    const totalGastos = gastos.reduce((a, b) => a + b, 0);
    const restante = totalIngresos - totalGastos;

    document.getElementById('totalIngresos').textContent = `$ ${totalIngresos.toLocaleString('es-AR', {minimumFractionDigits: 2})}`;
    document.getElementById('totalGastos').textContent = `$ ${totalGastos.toLocaleString('es-AR', {minimumFractionDigits: 2})}`;
    document.getElementById('dineroRestante').textContent = `$ ${restante.toLocaleString('es-AR', {minimumFractionDigits: 2})}`;

    actualizarGrafico(totalIngresos, totalGastos, restante);
    actualizarRecomendacion(totalIngresos, restante);
}

function actualizarGrafico(ing, gas, rest) {
    if (!window.chart) {
        const ctx = document.getElementById('budgetChart').getContext('2d');
        window.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Ingresos', 'Gastos', 'Restante'],
                datasets: [{
                    label: 'Presupuesto',
                    data: [ing, gas, rest],
                    backgroundColor: ['#4caf50', '#f44336', '#2196f3']
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y',
                animation: {
                    duration: 1000
                }
            }
        });
    } else {
        window.chart.data.datasets[0].data = [ing, gas, rest];
        window.chart.update();
    }
}

function actualizarRecomendacion(totalIngresos, restante) {
    const recomendacion = document.getElementById('recomendacion');
    if (totalIngresos === 0) {
        recomendacion.textContent = 'Registra al menos un ingreso para comenzar.';
    } else if (restante < totalIngresos * 0.1) {
        recomendacion.innerHTML = '⚠️ Estás al límite, revisa tus gastos.';
    } else if (restante > totalIngresos * 0.2) {
        recomendacion.innerHTML = '🎉 ¡Vas ahorrando de forma saludable!<br>Evalúa diversificar en índices amplios y bonos de corto plazo.<br><br><strong>Si estás ahorrando, podrías:</strong><ul><li>Fondo de emergencia primero (3–6 meses).</li><li>Instrumentos líquidos de bajo riesgo (p.ej., fondos money market).</li><li>Bonos gubernamentales corto/mediano plazo.</li></ul>';
    } else {
        recomendacion.textContent = 'Buen equilibrio, sigue así.';
    }
}

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});
