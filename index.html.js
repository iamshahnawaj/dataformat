
// Shared account store: must match admin/index.html
var USER_KEY='pf_demo_users';
async function sha(s){var b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,'0')}).join('')}
var AT=0,LK=0;
try{AT=parseInt(localStorage.getItem('pf_at')||'0',10)||0;LK=parseInt(localStorage.getItem('pf_lk')||'0',10)||0}catch(x){}
function sv(){try{localStorage.setItem('pf_at',AT);localStorage.setItem('pf_lk',LK)}catch(x){}}
function readUsers(){try{var u=JSON.parse(localStorage.getItem(USER_KEY)||'[]');return Array.isArray(u)?u:[]}catch(x){return []}}
async function migrateUsers(){var users=readUsers(),changed=false;for(var i=0;i<users.length;i++){if(users[i].password&&!users[i].passwordHash){users[i].passwordHash=await sha(users[i].password);delete users[i].password;changed=true}}if(changed){try{localStorage.setItem(USER_KEY,JSON.stringify(users))}catch(x){}}return users}
function setLk(){var on=Date.now()<LK,e=document.getElementById('er');['un','pw','go'].forEach(function(i){document.getElementById(i).disabled=on});if(on){e.textContent='Too many failed attempts. Please try again in 5 minutes.'}else if(LK){LK=0;AT=0;sv();e.textContent=''}}
setInterval(setLk,1000);setLk();
async function login(){
  var u=document.getElementById('un').value.trim(),p=document.getElementById('pw').value,e=document.getElementById('er');
  if(Date.now()<LK)return;
  if(!u||!p){e.textContent='Enter both username and password.';return}
  try{
    var users=await migrateUsers(),hash=await sha(p);
    var found=users.find(function(x){return String(x.username||'').toLowerCase()===u.toLowerCase()&&x.passwordHash===hash&&x.enabled!==false});
    if(found){document.getElementById('lg').classList.add('hide');document.getElementById('app').classList.remove('hide');document.getElementById('pw').value='';ULK=true;LA=Date.now();AT=0;sv();document.getElementById('wl').textContent='Welcome back '+found.username}
    else{AT++;document.getElementById('pw').value='';if(AT>=5){LK=Date.now()+300000;AT=0;sv();setLk()}else{sv();e.textContent='Incorrect username or password, or this account is disabled.'}}
  }catch(x){e.textContent='Could not verify login in this browser. Please use a current browser and try again.'}
}
document.getElementById('go').onclick=login;
var ULK=false,LA=0;
function lock(msg){
  ULK=false;
  document.getElementById('in').value='';OV={};window._all='';run();
  document.getElementById('un').value='';document.getElementById('pw').value='';
  document.getElementById('er').textContent=msg||'';document.getElementById('wl').textContent='';
  document.getElementById('app').classList.add('hide');document.getElementById('lg').classList.remove('hide');
}
['mousemove','keydown','click','touchstart','scroll'].forEach(function(ev){window.addEventListener(ev,function(){if(ULK)LA=Date.now()},true)});
setInterval(function(){if(ULK&&Date.now()-LA>=1200000)lock('Locked after 20 minutes of inactivity. Please sign in again.')},10000);
document.getElementById('pw').onkeydown=function(e){if(e.key==='Enter')login()};
document.getElementById('un').onkeydown=function(e){if(e.key==='Enter')document.getElementById('pw').focus()};
var NA='N/A';
var KEYS={projectname:'name',studytype:'type',counts:'counts',age:'age',gender:'gender',jobtitle:'job',title:'job',industry:'industry',department:'dept',employees:'employees',brand:'brand',revenue:'revenue',company:'company',companyname:'company',county:'county',zipcode:'zip',zip:'zip',postalcode:'zip',nationality:'nationality',householdincome:'hhi',hhi:'hhi',hhiincome:'hhi',income:'hhi',personalincome:'pinc',ethnicity:'ethnicity',ethincity:'ethnicity',race:'ethnicity',occupation:'occupation',employmentstatus:'empstatus',maritalstatus:'marital',oppo:'oppo',country:'country',tnxprojectid:'tnx',parentid:'parent',childid:'child',respondentid:'resp',ipaddress:'ip',status:'status',note:'note',notes:'note'};
var B2B=[['Age','age'],['Gender','gender'],['Job title','job'],['Industry','industry'],['Department','dept'],['Employees','employees'],['Brand','brand'],['Revenue','revenue'],['Company','company'],['County','county'],['Zip code','zip'],['Nationality','nationality'],['Household Income','hhi']];
var B2C=[['Age','age'],['Gender','gender'],['ZIP Code','zip'],['Country','country'],['Nationality','nationality'],['Ethnicity','ethnicity'],['Household Income','hhi'],['Personal Income','pinc'],['Brand','brand'],['Company','company'],['Occupation','occupation'],['Employment Status','empstatus'],['Marital Status','marital']];
var IP=/\b\d{1,3}(?:\.\d{1,3}){3}\b/;
var OV={};
var PN=/^(\d+\s*[.)]\s*)?(GMS|TRN|IER)\b/i;
var HX=/\b(b2h|hcp|patients?|cancer|oncolog|tumou?r|prostate|leukemia|lymphoma|diabet|t1d|t2d|cardio|cardiac|heart|hypertension|asthma|copd|arthritis|psoria|migraine|alzheimer|parkinson|stroke|kidney|ckd|obesity|hiv|hepatitis|epilep|lupus|crohn|colitis|schizo|sclerosis|physician|doctor|nurse|surgeon|pharmac|dentist|clinician|urolog|neurolog|dermatolog|gastro|endocrin|rheumat|pediatric|radiolog|anesthes|caregiver|healthcare|health care|medical|hospital|clinical)/i;
var PROF=['age','gender','job','industry','dept','employees','brand','revenue','company','county','zip','nationality','hhi','pinc','ethnicity','occupation','empstatus','marital','oppo'];

function isHead(l){return !/:/.test(l)&&/[A-Za-z]/.test(l)&&l.length>3&&!/^(\d+\.\s*)?(B2B|B2C|B2H)\s*$/i.test(l)&&!/^(total|counts?|oppo)\b/i.test(l)}
function parse(text){
  var P=[],cur=null,inOp=false;
  function np(){cur={name:'',f:{},rows:[]};P.push(cur);return cur}
  text.split(/\r?\n/).forEach(function(raw){
    var l=raw.trim();if(!l)return;
    var m=l.match(/^([^:|]{2,30}?)\s*[:\-]\s*(.*)$/),k=null;
    if(m){k=KEYS[m[1].toLowerCase().replace(/[^a-z]/g,'')]||null}
    if(!IP.test(l)&&(PN.test(l)||(!k&&(!cur||(cur.rows.length&&!inOp))&&isHead(l)))){inOp=false;l=l.replace(/^\d+\s*[.)]\s*/,'');
      if(cur&&!cur.name&&!cur.rows.length&&!Object.keys(cur.f).length){cur.name=l}else{np().name=l}
      return;
    }
    if(inOp&&!k&&!IP.test(l)&&cur){if(!/^\d+[.)]?$/.test(l))cur.f.opl.push(l);return}
    if(IP.test(l)&&!k){
      cur=cur||np();
      var ip=l.match(IP)[0],i=l.indexOf(ip),bef=l.slice(0,i).trim(),aft=l.slice(i+ip.length).trim();
      var parts=bef.split(/\t+|\s{2,}/).filter(Boolean);
      if(parts.length<3){var t=bef.split(/\s+/);parts=[t[0],t[1],t.slice(2).join(' ')]}
      var r={child:parts[0],resp:parts[1],country:parts.slice(2).join(' '),ip:ip,status:aft};
      cur.rows.push(r);inOp=false;return;
    }
    if(k){
      cur=cur||np();
      if(k==='name'){if(cur.rows.length||Object.keys(cur.f).length)np();inOp=false;cur.name=m[2].trim().replace(/^\d+\s*[.)]\s*/,'');return}
      if(cur.rows.length&&PROF.indexOf(k)>-1){var nm=cur.name;np().name=nm}
      cur.f[k]=m[2].trim();inOp=false;if(k==='oppo'){inOp=true;cur.f.opl=m[2].trim()?[m[2].trim()]:[]}
    }
  });
  return P.filter(function(p){return p.name||p.rows.length||Object.keys(p.f).length});
}
function v(x){x=(x||'').trim();return x?x:NA}
function detect(p){
  var ft=(p.f.type||'').match(/B2[BCH]/i);if(ft)return ft[0].toUpperCase();
  var b=['job','industry','dept','employees','revenue','company'].some(function(k){return p.f[k]&&p.f[k]!==NA});
  if(HX.test([p.name,p.f.type,p.f.oppo,p.f.job,p.f.industry,p.f.dept,p.f.occupation].join(' ')))return 'B2H';
  if(/B2B/i.test(p.name||'')||/b2b/i.test(p.f.type||''))return 'B2B';
  if(/B2C/i.test(p.f.type||''))return 'B2C';
  return b?'B2B':'B2C';
}
function build(p,r,type,n,idx){
  var F=p.f,L=type==='B2C'?B2C:B2B,o;
  o=[idx+'. '+type,'','Project Name : '+v(p.name),'Study Type : '+type,'Counts : '+String(n).padStart(2,'0')];
  L.forEach(function(a){o.push(a[0]+' : '+v(F[a[1]]))});
  var op=F.opl||[];o.push('Oppo-');for(var q=0;q<Math.max(4,op.length);q++)o.push((q+1)+'.'+(op[q]?' '+op[q].replace(/^\d+[.)]\s*/,''):''));o.push('');
  var tnx=F.tnx||((p.name.match(/TNX\d+/i)||[''])[0]);
  o.push('TNX Project ID : '+v(tnx),'Parent ID : '+v(F.parent),'Child ID : '+v(r.child||F.child),'Respondent ID : '+v(r.resp||F.resp),'Country : '+v(r.country||(type!=='B2C'?F.country:'')),'IP Address : '+v(r.ip||F.ip),'Status : '+v(r.status||F.status),'Note : '+v(F.note));
  return o.join('\n');
}
function cnt(p,type,bh){var c=parseInt((p.f.counts||'').replace(/\D/g,''),10);if(c>0)return c;return type==='B2H'?parseInt(bh,10):1}
function run(){
  var P=parse(document.getElementById('in').value),sel=document.getElementById('ty').value,out=document.getElementById('out'),all=[],tot=0,bh=document.getElementById('bh').value;
  out.innerHTML='';
  if(!P.length){out.innerHTML='<div class="em">Formatted records will appear here.</div>';return}
  P.forEach(function(p){
    var base=sel==='auto'?detect(p):sel,rows=p.rows.length?p.rows:[{}];
    rows.forEach(function(r){
      var idx=all.length+1,type=OV[idx]||base,n=cnt(p,type,bh);tot+=n;var t=build(p,r,type,n,all.length+1);all.push(t);
      var d=document.createElement('div');d.className='rec';
      d.innerHTML='<div class="rh"><span class="tag '+type+'">'+all.length+'. '+type+'</span><span><select class="ts"><option>B2B</option><option>B2C</option><option>B2H</option></select> <button>Copy</button></span></div><pre></pre>';
      d.querySelector('pre').textContent=t;
      d.querySelector('button').onclick=function(e){cp(t,e.target)};
      var ts=d.querySelector('.ts');ts.value=type;ts.onchange=function(e){OV[idx]=e.target.value;run()};
      out.appendChild(d);
    });
  });
  var tl='TOTAL = '+String(tot).padStart(2,'0');
  var td=document.createElement('div');td.className='rec';td.innerHTML='<pre style="font-weight:700"></pre>';td.querySelector('pre').textContent=tl+'  ('+all.length+' records)';out.appendChild(td);
  window._all=all.join('\n\n\n')+'\n\n\n'+tl;
}
function cp(t,b){
  function ok(){var o=b.textContent;b.textContent='Copied';setTimeout(function(){b.textContent=o},1200)}
  try{navigator.clipboard.writeText(t).then(ok,fb)}catch(e){fb()}
  function fb(){var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');ok()}catch(e){}a.remove()}
}
document.getElementById('in').oninput=function(){OV={};run()};
document.getElementById('ty').onchange=run;
document.getElementById('bh').onchange=run;
document.getElementById('ca').onclick=function(e){if(window._all)cp(window._all,e.target)};
document.getElementById('cl').onclick=function(){document.getElementById('in').value='';run()};
document.getElementById('ex').onclick=function(){
  document.getElementById('in').value='GMS 80047 - US Military Audience | TNX1319\n\nAge : 50 to 64 years old\nGender : Male\nJob title : \nEmployment status :\nZip code :\nIndustry :\nDepartment :\nEthincity : Caucasian / White\nEmployees :\nHHI/Income : $150,000 to under $200,000\nRevenue :\nCompany name :\nOppo :\n\n80047\tysadsdgfdgytghday00shah\tUnited States\t73.35.73.7\tCompleted';
  run();
};
