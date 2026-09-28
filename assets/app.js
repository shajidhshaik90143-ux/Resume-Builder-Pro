const STORAGE_KEY = "resume-builder-pro-v1";

const blank = {
  personal:{name:"",title:"",email:"",phone:"",location:"",website:"",linkedin:"",github:""},
  summary:"",
  experience:[],
  education:[],
  skills:[],
  projects:[],
  certifications:[],
  languages:[],
  template:"modern"
};

let state = loadState();
let currentSection = "personal";
let zoom = 1;

function clone(x){ return JSON.parse(JSON.stringify(x)); }
function loadState(){
  try { const x=JSON.parse(localStorage.getItem(STORAGE_KEY)); return x ? normalize(x) : sampleState(); }
  catch(e){ return sampleState(); }
}
function normalize(x){
  const s=clone(blank);
  Object.assign(s,x);
  s.personal=Object.assign(clone(blank.personal),x.personal||{});
  ["experience","education","skills","projects","certifications","languages"].forEach(k=>s[k]=Array.isArray(x[k])?x[k]:[]);
  return s;
}
function sampleState(){
  return normalize({
    personal:{name:"Alex Morgan",title:"Full Stack Developer",email:"alex.morgan@email.com",phone:"+91 98765 43210",location:"Hyderabad, India",website:"alexmorgan.dev",linkedin:"linkedin.com/in/alexmorgan",github:"github.com/alexmorgan"},
    summary:"Full stack developer focused on building reliable, user-friendly web applications. Experienced with modern JavaScript, Python, REST APIs, databases, and cloud deployment. Strong problem solver who enjoys turning product requirements into measurable outcomes.",
    experience:[
      {role:"Software Developer Intern",company:"TechNova Solutions",location:"Hyderabad, India",start:"Jun 2025",end:"Aug 2025",description:"Built responsive dashboard features used by 300+ internal users.\nReduced API response time by 28% through query and caching improvements.\nCollaborated with a 5-person engineering team using Git and Agile workflows."}
    ],
    education:[{degree:"B.Tech in Computer Science",school:"QIS College of Engineering and Technology",location:"Andhra Pradesh, India",start:"2023",end:"2027",score:"CGPA 8.1 / 10"}],
    skills:["Python","JavaScript","HTML/CSS","React","FastAPI","SQL","Git","REST APIs"],
    projects:[
      {name:"Smart Task Manager",tech:"React, FastAPI, PostgreSQL",link:"github.com/alexmorgan/task-manager",description:"Developed a full-stack task management platform with authentication, filtering, analytics, and REST APIs. Added validation and reusable UI components for a consistent user experience."},
      {name:"Resume Builder Pro",tech:"HTML, CSS, JavaScript",link:"github.com/alexmorgan/resume-builder",description:"Created a browser-based resume builder with multiple templates, live preview, autosave, JSON import/export, and print-ready A4 output."}
    ],
    certifications:[{name:"Python Programming",issuer:"Professional Learning Institute",date:"2025",link:""}],
    languages:[{name:"English",level:"Professional"},{name:"Telugu",level:"Native"}],
    template:"modern"
  });
}

function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function link(v){if(!v)return ""; let u=/^https?:\/\//i.test(v)?v:"https://"+v; return `<a href="${esc(u)}">${esc(v.replace(/^https?:\/\//,""))}</a>`;}
function get(obj,path){return path.split(".").reduce((a,k)=>a?.[k],"");}
function set(obj,path,val){const parts=path.split(".");let cur=obj;parts.slice(0,-1).forEach(k=>cur=cur[k]);cur[parts.at(-1)]=val;}
function markDirty(){state.__saved=false; document.getElementById("saveStatus").textContent="Unsaved"; updateProgress(); renderPreview();}

document.querySelectorAll("[data-bind]").forEach(el=>{
  el.value=get(state,el.dataset.bind)||"";
  el.addEventListener("input",()=>{set(state,el.dataset.bind,el.value);markDirty();});
});

function renderRepeat(type){
  const list=document.getElementById(type+"List"); if(!list)return;
  list.innerHTML="";
  const tpl=document.getElementById(type+"Template");
  state[type].forEach((item,i)=>{
    const node=tpl.content.firstElementChild.cloneNode(true);
    node.dataset.index=i;
    node.querySelectorAll("[data-field]").forEach(el=>{
      el.value=item[el.dataset.field]||"";
      el.addEventListener("input",()=>{state[type][i][el.dataset.field]=el.value;markDirty();});
      el.addEventListener("change",()=>{state[type][i][el.dataset.field]=el.value;markDirty();});
    });
    node.querySelector("[data-remove]").addEventListener("click",()=>{state[type].splice(i,1);renderAll();markDirty();});
    list.appendChild(node);
  });
}
function renderSkills(){
  const chips=document.getElementById("skillChips"); chips.innerHTML="";
  state.skills.forEach((s,i)=>{
    const el=document.createElement("span");el.className="chip";el.innerHTML=`${esc(s)} <button aria-label="remove skill">×</button>`;
    el.querySelector("button").onclick=()=>{state.skills.splice(i,1);renderSkills();markDirty();};chips.appendChild(el);
  });
}
document.getElementById("skillInput").addEventListener("keydown",e=>{
  if(e.key==="Enter" || e.key===","){
    e.preventDefault(); const v=e.target.value.trim().replace(/,$/,"");
    if(v && !state.skills.some(s=>s.toLowerCase()===v.toLowerCase())){state.skills.push(v);e.target.value="";renderSkills();markDirty();}
  }
});

document.querySelectorAll("[data-add]").forEach(btn=>btn.addEventListener("click",()=>{
  const type=btn.dataset.add;
  const defaults={
    experience:{role:"",company:"",location:"",start:"",end:"",description:""},
    education:{degree:"",school:"",location:"",start:"",end:"",score:""},
    projects:{name:"",tech:"",link:"",description:""},
    certifications:{name:"",issuer:"",date:"",link:""},
    languages:{name:"",level:"Professional"}
  };
  state[type].push(defaults[type]); renderRepeat(type); markDirty();
}));

function renderPreview(){
  const p=state.personal;
  const contact=[p.email,p.phone,p.location,p.website,p.linkedin,p.github].filter(Boolean).map((x,i)=>{
    if(i===0 && x.includes("@"))return `<div>${esc(x)}</div>`;
    if(i>=3)return `<div>${link(x)}</div>`;
    return `<div>${esc(x)}</div>`;
  }).join("");
  let html=`<header class="resume-header">
    <div><h1 class="resume-name">${esc(p.name||"Your Name")}</h1><div class="resume-title">${esc(p.title||"Professional Title")}</div></div>
    <div class="contact-list">${contact||"<div>email@example.com</div><div>+91 00000 00000</div><div>City, Country</div>"}</div>
  </header>`;
  if(state.summary.trim()) html+=section("PROFILE",`<p>${esc(state.summary).replace(/\n/g,"<br>")}</p>`);
  if(state.experience.length) html+=section("EXPERIENCE",state.experience.map(x=>`<div class="resume-item"><div class="item-top"><div class="item-title">${esc(x.role||"Job Title")} <span class="item-meta">— ${esc(x.company||"Company")}</span></div><div class="item-meta">${esc(x.start)}${x.end?" – "+esc(x.end):""}</div></div><div class="item-meta">${esc(x.location)}</div>${x.description?`<div class="item-desc">${esc(x.description)}</div>`:""}</div>`).join(""));
  if(state.education.length) html+=section("EDUCATION",state.education.map(x=>`<div class="resume-item"><div class="item-top"><div class="item-title">${esc(x.degree||"Degree")}</div><div class="item-meta">${esc(x.start)}${x.end?" – "+esc(x.end):""}</div></div><div class="item-meta">${esc(x.school)}${x.location?" • "+esc(x.location):""}${x.score?" • "+esc(x.score):""}</div></div>`).join(""));
  if(state.skills.length) html+=section("SKILLS",`<div class="skill-list">${state.skills.map(s=>`<span class="skill-pill">${esc(s)}</span>`).join("")}</div>`);
  if(state.projects.length) html+=section("PROJECTS",state.projects.map(x=>`<div class="resume-item"><div class="item-top"><div class="item-title">${esc(x.name||"Project")}</div><div class="item-meta">${link(x.link)}</div></div><div class="item-meta">${esc(x.tech)}</div>${x.description?`<div class="item-desc">${esc(x.description)}</div>`:""}</div>`).join(""));
  const extras=[];
  if(state.certifications.length) extras.push(section("CERTIFICATIONS",state.certifications.map(x=>`<div class="resume-item"><div class="item-top"><div class="item-title">${esc(x.name)}</div><div class="item-meta">${esc(x.date)}</div></div><div class="item-meta">${esc(x.issuer)}${x.link?" • "+link(x.link):""}</div></div>`).join("")));
  if(state.languages.length) extras.push(section("LANGUAGES",state.languages.map(x=>`<div class="resume-item"><div class="item-top"><div class="item-title">${esc(x.name)}</div><div class="item-meta">${esc(x.level)}</div></div></div>`).join("")));
  if(extras.length) html+=`<div class="two-col">${extras.join("")}</div>`;
  const preview=document.getElementById("resumePreview"); preview.className="resume-paper template-"+state.template; preview.innerHTML=html;
}
function section(title,body){return `<section class="resume-section"><div class="resume-section-title">${title}</div>${body}</section>`;}

function renderAll(){
  renderRepeat("experience");renderRepeat("education");renderRepeat("projects");renderRepeat("certifications");renderRepeat("languages");renderSkills();
  document.querySelectorAll("[data-bind]").forEach(el=>el.value=get(state,el.dataset.bind)||"");
  document.querySelectorAll(".template-card").forEach(x=>x.classList.toggle("active",x.dataset.template===state.template));
  renderPreview();updateProgress();
}
function updateProgress(){
  const checks=[
    !!state.personal.name,!!state.personal.title,!!state.personal.email,!!state.personal.phone,
    !!state.summary.trim(),state.experience.length>0,state.education.length>0,state.skills.length>=3,
    state.projects.length>0,state.certifications.length>0,state.languages.length>0
  ];
  const pct=Math.round(checks.filter(Boolean).length/checks.length*100);
  document.getElementById("progressBar").style.width=pct+"%";document.getElementById("progressText").textContent=pct+"%";
}

document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>{
  currentSection=btn.dataset.section;
  document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x===btn));
  document.querySelectorAll(".section-panel").forEach(x=>x.classList.toggle("active",x.id==="panel-"+currentSection));
}));

document.querySelectorAll(".template-card").forEach(btn=>btn.addEventListener("click",()=>{
  state.template=btn.dataset.template;renderAll();markDirty();
}));

function save(){
  const clean=clone(state);delete clean.__saved;
  localStorage.setItem(STORAGE_KEY,JSON.stringify(clean));state.__saved=true;
  document.getElementById("saveStatus").textContent="Saved";
}
document.getElementById("saveBtn").onclick=()=>{save();flash("Resume saved locally");};
setInterval(()=>{if(state.__saved===false)save();},10000);

document.getElementById("newResumeBtn").onclick=()=>{
  if(confirm("Start a new resume? Your current local resume will be replaced.")){state=clone(blank);renderAll();save();}
};
document.getElementById("printBtn").onclick=()=>window.print();

document.getElementById("exportBtn").onclick=()=>{
  const clean=clone(state);delete clean.__saved;
  const blob=new Blob([JSON.stringify(clean,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="resume-data.json";a.click();URL.revokeObjectURL(a.href);
};
document.getElementById("importInput").addEventListener("change",e=>{
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{try{state=normalize(JSON.parse(reader.result));renderAll();save();flash("Resume imported successfully");}catch(err){alert("Invalid resume JSON file.");}};
  reader.readAsText(file);e.target.value="";
});
function flash(msg){const s=document.getElementById("saveStatus");const old=s.textContent;s.textContent=msg;s.style.background="#e0f2fe";s.style.color="#0369a1";setTimeout(()=>{s.textContent=old;s.style.background="";s.style.color="";},1800);}

document.getElementById("zoomBtn").onclick=()=>{
  zoom=zoom===1?0.9:zoom===0.9?0.8:1;
  document.getElementById("zoomBtn").textContent=Math.round(zoom*100)+"%";
  document.getElementById("resumePreview").style.transform=`scale(${zoom})`;
  document.getElementById("resumePreview").style.marginBottom=(zoom<1?-(1123*(1-zoom)):"0")+"px";
};

renderAll();
