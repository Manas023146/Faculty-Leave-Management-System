const user = JSON.parse(localStorage.getItem('currentUser')||'null');
if(!user || user.role!=='faculty'){ window.location.href='index.html'; }

// Header profile
const avatar = document.getElementById('avatar');
avatar.textContent = (user.name.split(' ').map(w=>w[0]).join('')||'U').slice(0,2).toUpperCase();
const menu = document.getElementById('profileMenu');
avatar.addEventListener('click', ()=>{ menu.style.display = menu.style.display==='block' ? 'none' : 'block'; });
document.addEventListener('click', (e)=>{ if(!avatar.contains(e.target) && !menu.contains(e.target)) menu.style.display='none'; });
document.getElementById('logoutBtn').addEventListener('click', ()=>{ localStorage.removeItem('currentUser'); window.location.href='index.html'; });
document.getElementById('myProfile').addEventListener('click', (e)=>{ e.preventDefault(); alert(user.name + "\\n" + user.dept); });

// Theme toggle
document.getElementById('themeToggle').addEventListener('click', ()=>{
  const dark=!document.documentElement.classList.contains('dark');
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.classList.toggle('light', !dark);
  localStorage.setItem('theme', dark?'dark':'light');
});
if(localStorage.getItem('theme')==='dark'){ document.documentElement.classList.add('dark'); }

// Today text
document.getElementById('today').textContent = new Date().toLocaleString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric' });

function nextToken(){
  let n = parseInt(localStorage.getItem('lastToken')||'0') + 1;
  localStorage.setItem('lastToken',''+n);
  return 'LV-'+String(n).padStart(4,'0');
}

const leaveForm = document.getElementById('leaveForm');
const formError = document.getElementById('formError');

leaveForm.addEventListener('submit', e=>{
  e.preventDefault();
  const from = document.getElementById('fromDate').value;
  const to = document.getElementById('toDate').value;
  const typeSel = document.getElementById('leaveType').value;
  const other = document.getElementById('otherLeave').value.trim();
  const reason = document.getElementById('reason').value.trim();

  if(!from || !to){ formError.textContent='Starting and Ending dates are required.'; return; }
  if(new Date(to) < new Date(from)){ formError.textContent='Ending date cannot be before starting date.'; return; }
  if(!reason){ formError.textContent='Reason is required.'; return; }

  let type = typeSel==='other' ? (other || 'Other') : typeSel;
  const token = nextToken();
  const entry = { token, username:user.username, name:user.name, type, from, to, reason, status:'Not Approved' };
  const leaves = JSON.parse(localStorage.getItem('leaves')||'[]');
  leaves.push(entry);
  localStorage.setItem('leaves', JSON.stringify(leaves));
  formError.style.color='#15803d';
  formError.textContent='Submitted! Your token is '+token;
  leaveForm.reset();
  setTimeout(()=>{ formError.textContent=''; }, 2500);
  render();
});

document.getElementById('printSlip').addEventListener('click', ()=>{
  window.print();
});

function render(){
  const rows = JSON.parse(localStorage.getItem('leaves')||'[]').filter(l=>l.username===user.username);
  document.getElementById('kpiTotal').textContent = rows.length;
  document.getElementById('kpiPending').textContent = rows.filter(r=>r.status==='Not Approved').length;
  document.getElementById('kpiApproved').textContent = rows.filter(r=>r.status==='Approved').length;

  const wrap = document.getElementById('historyTableWrap');
  const skel = document.getElementById('historySkeleton');
  skel.style.display='block'; wrap.style.display='none';
  setTimeout(()=>{
    const tbody = document.querySelector('#leaveTable tbody');
    tbody.innerHTML = '';
    rows.forEach(r=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.token}</td><td>${r.type}</td><td>${r.from}</td><td>${r.to}</td><td>${r.status}</td>`;
      tbody.appendChild(tr);
    });
    skel.style.display='none'; wrap.style.display='block';
  }, 400);
}
render();
