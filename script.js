// Datos
typeof ingresos==='undefined' && (ingresos=[]);
typeof gastos==='undefined' && (gastos=[]);

function agregarIngreso(){
  const concepto = document.getElementById('conceptoIngreso').value.trim();
  const monto = parseFloat(document.getElementById('montoIngreso').value);
  if(concepto && monto>0){
    ingresos.push(monto);
    document.getElementById('listaIngresos').innerHTML += `<li>${concepto}: $ ${monto.toLocaleString('es-AR',{minimumFractionDigits:2})}</li>`;
    actualizarResumen();
  }
}

function agregarGasto(){
  const concepto = document.getElementById('conceptoGasto').value.trim();
  const monto = parseFloat(document.getElementById('montoGasto').value);
  if(concepto && monto>0){
    gastos.push(monto);
    document.getElementById('listaGastos').innerHTML += `<li>${concepto}: $ ${monto.toLocaleString('es-AR',{minimumFractionDigits:2})}</li>`;
    actualizarResumen();
  }
}

function actualizarResumen(){
  const totalIngresos = ingresos.reduce((a,b)=>a+b,0);
  const totalGastos = gastos.reduce((a,b)=>a+b,0);
  const restante = totalIngresos - totalGastos;
  document.getElementById('totalIngresos').textContent = `$ ${totalIngresos.toLocaleString('es-AR',{minimumFractionDigits:2})}`;
  document.getElementById('totalGastos').textContent   = `$ ${totalGastos.toLocaleString('es-AR',{minimumFractionDigits:2})}`;
  document.getElementById('dineroRestante').textContent= `$ ${restante.toLocaleString('es-AR',{minimumFractionDigits:2})}`;
  actualizarGrafico(totalIngresos,totalGastos,restante);
  actualizarRecomendacion(totalIngresos,restante);
}

function actualizarGrafico(ing,gas,rest){
  const ctx = document.getElementById('budgetChart').getContext('2d');
  if(!window.chart){
    window.chart = new Chart(ctx,{
      type:'bar',
      data:{
        labels:['Ingresos','Gastos','Restante'],
        datasets:[{data:[ing,gas,rest],backgroundColor:['#2ecc71','#f39c12','#3498db']}]
      },
      options:{
        responsive:true,
        indexAxis:'y',
        animation:{duration:900},
        plugins:{legend:{display:false}},
        scales:{x:{grid:{color:'#1f2a3d'}},y:{grid:{color:'#1f2a3d'}}}
      }
    });
  }else{
    window.chart.data.datasets[0].data=[ing,gas,rest];
    window.chart.update();
  }
}

def_emoji = "🎉"  # 🎉

function actualizarRecomendacion(totalIngresos,restante){
  const el = document.getElementById('recomendacion');
  if(totalIngresos===0){
    el.textContent = 'Registra al menos un ingreso para comenzar.';
    return;
  }
  const ratio = restante/Math.max(totalIngresos,1);
  if(ratio < 0.10){
    el.innerHTML = '⚠️ <strong>Estás al límite</strong>. Revisa tus gastos y prioriza necesidades.';
  }else if(ratio >= 0.20){
    el.innerHTML = `${def_emoji} <strong>¡Vas ahorrando de forma saludable!</strong><br>Evalúa diversificar en índices amplios y bonos de corto plazo.<br><br><strong>Si estás ahorrando, podrías:</strong><ul><li>Fondo de emergencia primero (3–6 meses).</li><li>Instrumentos líquidos de bajo riesgo (p.ej., fondos money market).</li><li>Bonos gubernamentales corto/mediano plazo.</li></ul>`;
  }else{
    el.textContent = 'Buen equilibrio, sigue así.';
  }
}

// Tabs
Array.from(document.querySelectorAll('.tab')).forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});
