const demoUsers=[
  {username:'manas', password:'12345', name:'Manas Bhatt', dept:'Computer Science', role:'faculty'},
  {username:'priya', password:'priya123', name:'Priya Sharma', dept:'Electrical', role:'faculty'},
  {username:'luvkush', password:'luv123', name:'Luvkush', dept:'Mechanical', role:'faculty'},
  {username:'admin', password:'admin123', name:'Admin Officer', role:'admin'}
];

function seed(){
  if(!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify(demoUsers));
  if(!localStorage.getItem('leaves')){
    const sample=[
      {token:'LV-0001', username:'manas', name:'Manas Bhatt', type:'Casual Leave', from:'2025-10-01', to:'2025-10-02', reason:'Family event', status:'Approved'},
      {token:'LV-0002', username:'priya', name:'Priya Sharma', type:'Sick Leave', from:'2025-10-05', to:'2025-10-06', reason:'Fever', status:'Not Approved'},
      {token:'LV-0003', username:'luvkush', name:'Luvkush', type:'On Duty', from:'2025-10-07', to:'2025-10-07', reason:'Seminar', status:'Approved'}
    ];
    localStorage.setItem('leaves', JSON.stringify(sample));
    localStorage.setItem('lastToken','3');
  }
  const pref = localStorage.getItem('theme')||'light';
  document.documentElement.classList.toggle('dark', pref==='dark');
  document.documentElement.classList.toggle('light', pref==='light');
}
seed();

document.getElementById('themeToggle').addEventListener('click', ()=>{
  const dark = !document.documentElement.classList.contains('dark');
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.classList.toggle('light', !dark);
  localStorage.setItem('theme', dark ? 'dark' : 'light');
});

document.getElementById('loginBtn').addEventListener('click', ()=>{
  const role = document.getElementById('role').value;
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const users = JSON.parse(localStorage.getItem('users')||'[]');
  const u = users.find(x=>x.username===username && x.password===password && x.role===role);
  if(!u){
    document.getElementById('loginError').innerText='Invalid credentials for selected role.';
    return;
  }
  localStorage.setItem('currentUser', JSON.stringify(u));
  window.location.href = role==='admin' ? 'admin.html' : 'faculty.html';
});
