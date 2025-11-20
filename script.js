const LS_KEYS = { ingresos:'ingresos', gastos:'gastos', config:'config' };
let ingresos = JSON.parse(localStorage.getItem(LS_KEYS.ingresos)||'[]');
let gastos = JSON.parse(localStorage.getItem(LS_KEYS.gastos)||'[]');
let config = JSON.parse(localStorage.getItem(LS_KEYS.config)||'{"currency":"ARS","limitPct":5,"marginPct":15,"goal":50000}');
function save(){ localStorage.setItem(LS_KEYS.ingresos,JSON.stringify(ingresos)); localStorage.setItem(LS_KEYS.gastos,JSON.stringify(gastos)); localStorage.setItem(LS_KEYS.config,JSON.stringify(config)); }
function sum(arr){ return arr.reduce((a,b)=>a+(+b.monto||0),0); }
function fmt(v){ return new Intl.NumberFormat('es-AR',{style:'currency',currency:config.currency}).format(v); }
function render(){
  const ti=sum(ingresos), tg=sum(gastos), tr=ti-tg;
  document.getElementById('m-ingresos').textContent=fmt(ti);
  document.getElementById('m-gastos').textContent=fmt(tg);
  document.getElementById('m-restante').textContent=fmt(tr);
  renderChart(ti,tg,tr); renderLists(); renderReco(ti,tg,tr);
}
function renderChart(ti,tg,tr){
  const ctx=document.getElementById('bars').getContext('2d');
  if(window.chart){ chart.data.datasets[0].data=[ti,tg,tr]; chart.update(); return;}
  window.chart=new Chart(ctx,{type:'bar',data:{labels:['Ingresos','Gastos','Restante'],datasets:[{data:[ti,tg,tr],backgroundColor:['#2ccf86','#ffaf47','#7c5cff']}]},options:{indexAxis:'y',plugins:{legend:{display:false}}}});
}
function renderLists(){
  document.getElementById('list-ingresos').innerHTML=ingresos.map((x,i)=>`<li>${x.concepto} ${fmt(x.monto)} <button onclick='delItem("ing",${i})'>X</button></li>`).join('');
  document.getElementById('list-gastos').innerHTML=gastos.map((x,i)=>`<li>${x.concepto} ${fmt(x.monto)} <button onclick='delItem("gas",${i})'>X</button></li>`).join('');
}
function delItem(t,i){ if(t==='ing') ingresos.splice(i,1); else gastos.splice(i,1); save(); render(); }
document.getElementById('form-ingreso').onsubmit=e=>{e.preventDefault(); ingresos.push({concepto:ing-concepto.value,monto:+ing-monto.value}); ing-concepto.value=''; ing-monto.value=''; save(); render();};
document.getElementById('form-gasto').onsubmit=e=>{e.preventDefault(); gastos.push({concepto:gas-concepto.value,monto:+gas-monto.value}); gas-concepto.value=''; gas-monto.value=''; save(); render();};
document.getElementById('form-config').onsubmit=e=>{e.preventDefault(); config.currency=cfg-currency.value; config.limitPct=+cfg-limit.value; config.marginPct=+cfg-margin.value; config.goal=+cfg-goal.value; save(); render();};
document.getElementById('btn-reset').onclick=()=>{config={currency:'ARS',limitPct:5,marginPct:15,goal:50000}; save(); render();};
function renderReco(ti,tg,tr){
  let msg=''; const lim=ti*(config.limitPct/100), mar=ti*(config.marginPct/100);
  if(tr<0) msg='⚠️ Presupuesto negativo'; else if(tr<=lim) msg='🚨 Estás al límite'; else if(tr<=mar) msg='🙂 Pequeño margen'; else msg='🎉 ¡Vas ahorrando!';
  document.getElementById('reco-text').textContent=msg;
}
render();
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.getElementById(b.dataset.tab).classList.add('active');});
