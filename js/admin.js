const user = JSON.parse(localStorage.getItem('currentUser')||'null');
if(!user || user.role!=='admin'){ window.location.href='index.html'; }

// Theme
document.getElementById('themeToggle').addEventListener('click', ()=>{
  const dark=!document.documentElement.classList.contains('dark');
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.classList.toggle('light', !dark);
  localStorage.setItem('theme', dark?'dark':'light');
});
if(localStorage.getItem('theme')==='dark'){ document.documentElement.classList.add('dark'); }

document.getElementById('logoutBtn').addEventListener('click', ()=>{ localStorage.removeItem('currentUser'); window.location.href='index.html'; });
document.getElementById('today').textContent = new Date().toLocaleString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric' });

const tbody = document.querySelector('#adminTable tbody');
const filterDate = document.getElementById('filterDate');
const search = document.getElementById('search');
const resultCount = document.getElementById('resultCount');
const pager = document.getElementById('pager');
const pageSize = 10;

function getAll(){
  let rows = JSON.parse(localStorage.getItem('leaves')||'[]');
  // filter by date
  const date = filterDate.value;
  if(date){ rows = rows.filter(r=> r.from===date || r.to===date); }
  // search filter
  const q = search.value.trim().toLowerCase();
  if(q){
    rows = rows.filter(r=> (r.name+r.token+r.type+r.status).toLowerCase().includes(q) );
  }
  // sort by token numeric part
  rows.sort((a,b)=> parseInt(a.token.split('-')[1]) - parseInt(b.token.split('-')[1]) );
  return rows;
}

function stats(all){
  document.getElementById('stTotal').textContent = all.length;
  document.getElementById('stApproved').textContent = all.filter(r=>r.status==='Approved').length;
  document.getElementById('stPending').textContent = all.filter(r=>r.status!=='Approved').length;
  const today = new Date().toISOString().slice(0,10);
  document.getElementById('stToday').textContent = all.filter(r=> r.from===today || r.to===today).length;
}

function render(page=1){
  // skeleton
  document.getElementById('tableSkeleton').style.display='block';
  document.getElementById('tableWrap').style.display='none';

  setTimeout(()=>{
    const all = getAll();
    stats(all);
    const pages = Math.max(1, Math.ceil(all.length / pageSize));
    if(page>pages) page=pages;
    const start = (page-1)*pageSize;
    const rows = all.slice(start, start+pageSize);

    tbody.innerHTML='';
    rows.forEach(r=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.token}</td><td>${r.name}</td><td>${r.type}</td><td>${r.from}</td><td>${r.to}</td>
      <td>${r.status}</td>
      <td data-action-col>
        <button class="btn" onclick="updateStatus('${r.token}','Approved')">Approve</button>
        <button class="btn ghost" onclick="updateStatus('${r.token}','Not Approved')">Reject</button>
      </td>`;
      tbody.appendChild(tr);
    });

    // footer count
    resultCount.textContent = `Showing ${rows.length} of ${all.length} results • Page ${page} / ${pages}`;

    // pager
    pager.innerHTML='';
    for(let i=1;i<=pages;i++){
      const b = document.createElement('button');
      b.className = 'page-btn'+(i===page?' active':'');
      b.textContent = i;
      b.onclick = ()=> render(i);
      pager.appendChild(b);
    }

    document.getElementById('tableSkeleton').style.display='none';
    document.getElementById('tableWrap').style.display='block';
  }, 300);
}
window.updateStatus = function(tok, status){
  const all = JSON.parse(localStorage.getItem('leaves')||'[]');
  const i = all.findIndex(r=>r.token===tok);
  if(i>=0){ all[i].status=status; localStorage.setItem('leaves', JSON.stringify(all)); render(); }
};

filterDate.addEventListener('change', ()=>render(1));
search.addEventListener('input', ()=>render(1));
render(1);

// CSV export
document.getElementById('csvBtn').addEventListener('click', ()=>{
  const date = new Date().toISOString().slice(0,10);
  const all = getAll();
  let csv = 'Token,Faculty,Type,From,To,Status\\n';
  all.forEach(r=>{ csv += `"${r.token}","${r.name}","${r.type}","${r.from}","${r.to}","${r.status}"\\n`; });
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `faculty-leaves-${date}.csv`;
  a.click();
});

// PDF export (hide action col)
document.getElementById('pdfBtn').addEventListener('click', async ()=>{
  const table = document.getElementById('adminTable').cloneNode(true);
  table.querySelectorAll('[data-action-col]').forEach(el=>el.remove());
  table.querySelectorAll('th[data-action-col]').forEach(el=>el.remove());
  const temp = document.createElement('div');
  temp.style.position='fixed'; temp.style.left='-9999px'; temp.appendChild(table);
  document.body.appendChild(temp);
  const canvas = await html2canvas(table);
  document.body.removeChild(temp);
  const img = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l','pt','a4');
  doc.setFontSize(14);
  doc.text('Faculty Leave Report', 20, 30);
  const w = doc.internal.pageSize.getWidth() - 40;
  const h = canvas.height * (w / canvas.width);
  doc.addImage(img, 'PNG', 20, 40, w, h);
  doc.save('faculty-leave-report.pdf');
});

// Print view
document.getElementById('printBtn').addEventListener('click', ()=>{
  window.print();
});
