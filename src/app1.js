/* ===== casca: ícones, menu, rotas, assistente global ===== */
var NS="http://www.w3.org/2000/svg";
function el(t,a,p){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function store(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem("mf-"+k));localStorage.setItem("mf-"+k,JSON.stringify(v))}catch(e){return null}}
function toast(msg){var t=$("#toast");t.textContent=msg;t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(function(){t.classList.remove("on")},3200)}
var I={
 cake:'<path d="M2.5 14h11M3.5 14V9.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1V14M3.5 11.2c1.1.9 2.1.9 3.1 0 1 .9 2 .9 2.9 0 1 .9 2 .9 3 0M8 8.5V6.3M8 4.2c-.7-.6-.7-1.4 0-2.2.7.8.7 1.6 0 2.2z"/>',
 dash:'<path d="M2 7.2L8 2l6 5.2V14H10v-4H6v4H2z" fill="currentColor" stroke="none"/>',
 agenda:'<rect x="2" y="3" width="12" height="11" rx="2"/><path d="M2 6.5h12M5 1.5v3M11 1.5v3"/>',
 assist:'<path d="M8 2l1.4 3.6L13 7l-3.6 1.4L8 12l-1.4-3.6L3 7l3.6-1.4z"/>',
 notas:'<rect x="2" y="2.5" width="3.5" height="11" rx="1"/><rect x="6.3" y="2.5" width="3.5" height="7" rx="1"/><rect x="10.6" y="2.5" width="3.5" height="9" rx="1"/>',
 os:'<rect x="2.5" y="2" width="11" height="12" rx="2"/><path d="M5 5.5h6M5 8h6M5 10.5h3"/>',
 mail:'<rect x="2" y="3.5" width="12" height="9" rx="2"/><path d="M2.5 4.5L8 9l5.5-4.5"/>',
 cli:'<circle cx="6" cy="5" r="2.4"/><path d="M1.5 14c.5-3 2.3-4.5 4.5-4.5S10 11 10.5 14M11 3a2.3 2.3 0 010 4.5M12.5 9.7c1.2.6 1.8 2 2 4.3"/>',
 cart:'<rect x="2" y="4" width="12" height="9" rx="2"/><path d="M2 7h12M10.5 10h1.5"/>',
 rec:'<path d="M2 5.5h12v7H2z"/><circle cx="8" cy="9" r="1.6"/><path d="M4.5 3.5h7"/>',
 fat:'<path d="M4 2h6l3 3v9H4z"/><path d="M6 8h5M6 10.5h5"/>',
 rel:'<circle cx="8" cy="8" r="6"/><path d="M8 2v6h6"/>',
 func:'<circle cx="8" cy="5" r="2.6"/><path d="M3 14c.6-3.2 2.6-4.8 5-4.8s4.4 1.6 5 4.8"/>',
 cfg:'<circle cx="8" cy="8" r="2.2"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"/>',
 help:'<circle cx="8" cy="8" r="6"/><path d="M6.3 6.2a1.8 1.8 0 113 1.4c-.8.5-1.3.9-1.3 1.8M8 11.4v.2"/>',
 up:'<path d="M8 13V3M4 7l4-4 4 4"/>',down:'<path d="M8 3v10M4 9l4 4 4-4"/>',wallet:'<rect x="2.5" y="4" width="11" height="9" rx="2"/><path d="M2.5 7h11"/>',
 drive:'<path d="M5.5 2.5h5l4 7-2.5 4h-8l-2.5-4z"/><path d="M5.5 2.5l4 7M1.5 9.5h13M10.5 2.5l-4 7"/>',
 bell:'<path d="M4 11V7a4 4 0 018 0v4l1.5 1.5h-11zM6.5 14h3"/>',plus:'<path d="M8 3v10M3 8h10"/>',print:'<path d="M4.5 6V2h7v4M4.5 11.5H3a1 1 0 01-1-1V7a1 1 0 011-1h10a1 1 0 011 1v3.5a1 1 0 01-1 1h-1.5"/><rect x="4.5" y="9" width="7" height="5"/>',
 chk:'<path d="M3 8.5l3 3 7-7"/>',clock:'<circle cx="8" cy="8" r="6"/><path d="M8 4.5V8l2.5 1.5"/>',pin:'<path d="M8 14s5-4.2 5-8A5 5 0 003 6c0 3.8 5 8 5 8z"/><circle cx="8" cy="6" r="1.6"/>',
 shield:'<path d="M8 1.5l5 2v4c0 3.3-2.2 5.6-5 7-2.8-1.4-5-3.7-5-7v-4z"/>',search:'<circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/>',menu:'<path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"/>',x:'<path d="M4 4l8 8M12 4l-8 8"/>',
 mic:'<rect x="6" y="2" width="4" height="8" rx="2"/><path d="M3.5 8a4.5 4.5 0 009 0M8 12.5V14"/>',clip:'<path d="M11 5.5l-4.6 4.6a1.5 1.5 0 002.1 2.1l5-5a3 3 0 00-4.2-4.2L4.2 8.1a4.5 4.5 0 006.4 6.4"/>',
 doc:'<path d="M4 2h5l3 3v9H4z"/><path d="M9 2v3h3"/>',send:'<path d="M2 8l12-6-4 12-2.5-5z"/>',reply:'<path d="M6 4L2 8l4 4M2 8h8a4 4 0 014 4"/>'
};
function ic(n,s){return '<svg width="'+(s||15)+'" height="'+(s||15)+'" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+I[n]+'</svg>'}

var NAV=[
 ["Principal",[["dash","Dashboard","Início","“Proteção que evolui. Veja a operação de hoje num só lugar.”"],["agenda","Agenda","Agenda","Visitas e serviços do mês, por dia, semana, mês ou ano."],["assist","Assistente","Assistente","Pergunte, peça rascunhos de resposta e sugestões de datas."],["notas","Anotações","Anotações","O que fazer hoje, o que está pendente e o que ficou para trás."]]],
 ["Operação",[["os","Ordens de serviço","Ordens de serviço","Preencha o formulário e imprima a OS no modelo padrão da Monte Fuji."],["cli","Clientes","Clientes","Cadastro, histórico de serviços e garantias de cada cliente."],["mail","E-mails","E-mails","Caixa do Gmail: o que responder, o que está pendente e o que foi enviado."]]],
 ["Financeiro",[["rec","A receber","A receber","Cobranças de clientes avulsos: nota fiscal, envio da cobrança e recebimento."]]],
 ["RH",[["func","Funcionários","Funcionários","Dados, documentos, uniformes e EPIs de cada colaborador."]]],
 ["Preferências",[["cfg","Configurações","Configurações","Empresa, integrações, usuários e notificações."],["help","Central de ajuda","Central de ajuda","Dúvidas frequentes, atalhos e contato do suporte."]]]
];
var BADGE={},BADGER={notas:1,rec:1};
function calcBadges(){function n(x){return x?String(x):""}
  BADGE={agenda:n(evOn(TD).length),notas:n(TAREFAS.filter(isLate).length),mail:n(EMAILS.filter(function(m){return m.st==="responder"}).length),rec:n(RECEBER.filter(function(r){return recSt(r)[1]==="Vencido"}).length)}}
function avisos(){var a=[],l=TAREFAS.filter(isLate).length,r=RECEBER.filter(function(x){return recSt(x)[1]==="Vencido"}).length,h=evOn(TD).length,b=bdaysOn(TD);
  if(h)a.push(h+" visita"+(h>1?"s":"")+" hoje");if(l)a.push(l+" anotaç"+(l>1?"ões atrasadas":"ão atrasada"));if(r)a.push(r+" cobrança"+(r>1?"s vencidas":" vencida"));var w7=ymd(addDays(TODAY,7)),vh=vencList().filter(function(x){return x.venc>=TD&&x.venc<=w7}).length;if(vh)a.push(vh+" garantia"+(vh>1?"s vencendo":" vencendo")+" nos próximos 7 dias");if(b.length)a.push("aniversário de "+b.map(function(f){return firstName(f.nome)}).join(", "));return a}
function refreshSide(){var av=avisos(),d=$("#bellDot");if(d)d.hidden=!av.filter(function(x){return x.indexOf("hoje")<0}).length;calcBadges();var cur=(location.hash||"#dash").slice(1);renderSide();$$(".menu a").forEach(function(a){a.classList.toggle("on",a.dataset.v===cur);if(a.dataset.v===cur)a.setAttribute("aria-current","page")})}
var TITLES={};NAV.forEach(function(g){g[1].forEach(function(i){TITLES[i[0]]=i})});

function renderSide(){
  var h='<div class="logo"><img src="'+LOGO+'" alt="Monte Fuji Desentupidora e Dedetizadora"></div>'
   +'<button class="acc" type="button"><span class="av">MF</span><span><b>Matriz Osasco</b><small>Monte Fuji · desde 2000</small></span><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6l4 4 4-4"/></svg></button>';
  NAV.forEach(function(g){
    h+='<div class="grp">'+g[0]+'</div><nav class="menu" aria-label="'+g[0]+'">';
    g[1].forEach(function(i){h+='<a href="#'+i[0]+'" data-v="'+i[0]+'">'+ic(i[0])+i[1]+(BADGE[i[0]]?'<span class="bd'+(BADGER[i[0]]?' r':'')+'">'+BADGE[i[0]]+'</span>':'')+'</a>'});
    h+='</nav>';
  });
  h+='<div class="up">'+ic("shield",28).replace('stroke="currentColor"','stroke="#18275E"')+'<b>Plano Condomínio</b><p>“Contratos anuais com visitas programadas e garantia por escrito.”</p><button class="btn-dark" type="button" data-go="cli">Ver condomínios ↗</button></div>';
  $("#side").innerHTML=h;
}

var VIEWS={},done={};
function go(v){
  if(!TITLES[v])v="dash";
  $$(".view").forEach(function(s){s.classList.toggle("on",s.id==="v-"+v)});
  $$(".menu a").forEach(function(a){a.classList.toggle("on",a.dataset.v===v);if(a.dataset.v===v)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
  var t=TITLES[v];$("#ttl").innerHTML='<b>'+t[2]+'</b><p>'+t[3]+'</p>';
  if(!done[v]&&VIEWS[v]){VIEWS[v]($("#v-"+v));done[v]=1}
  if(VIEWS[v]&&VIEWS[v].show)VIEWS[v].show();
  $("#app").classList.remove("nav-open");
  AI.ctx(v);window.scrollTo(0,0);
  document.title="Monte Fuji · "+t[1];
}

/* ===== assistente global (gaveta) ===== */
var AI={
 sug:{
  dash:[["Por onde eu começo?","Comece cadastrando os <b>clientes</b> (digite o CNPJ e os dados vêm da Receita) e a <b>equipe</b> em Funcionários. Depois é só lançar os serviços na <b>Agenda</b>."]],
  agenda:[["Como cadastro uma visita?","Clique em <b>+ Novo agendamento</b>, digite o cliente, marque os serviços, adicione uma ou mais datas e escolha a garantia."],["Como mando os horários para a equipe?","Clique em <b>Horários de amanhã</b>, confira o texto e use <b>Copiar</b> para colar no grupo do WhatsApp."]],
  assist:[["O que você vai saber da Monte Fuji?","Quando você me enviar a tabela de preços, os procedimentos de cada serviço, as regras de garantia e modelos de resposta, eu passo a usar essas informações nas sugestões."]],
  notas:[["Como uso as anotações?","Clique em <b>+ Adicionar cartão</b> na coluna desejada, dê dois cliques no título para editar e arraste entre as colunas. O botão de data define o prazo."]],
  os:[["Como gero uma OS?","Escolha o cliente, descreva o serviço, preencha as observações e a data. A pré-visualização segue o modelo de vocês."]],
  cli:[["Como cadastro um cliente?","Clique em <b>Novo cliente</b> e digite o CNPJ: razão social, endereço e telefone vêm da Receita Federal."]],
  mail:[["Quando os e-mails aparecem aqui?","Assim que as caixas do Gmail (atendimento, financeiro e comercial) forem conectadas."]],
  rec:[["Como lanço uma cobrança?","Clique em <b>+ Novo lançamento</b>, digite o CNPJ do cliente avulso, o valor, a nota fiscal e quando a cobrança foi enviada."]],
  func:[["Por que cadastrar a data de nascimento?","Os aniversários da equipe aparecem coloridos na agenda."]],
  cfg:[["Como faço backup?","Em <b>Backup dos dados</b>, clique em <b>Baixar backup</b>. Guarde o arquivo: com ele dá para restaurar tudo em outro computador."]],
  help:[["Como cadastro uma nova visita?","Vá em Agenda e clique em <b>+ Novo agendamento</b>. Digite o nome do cliente, marque os serviços, adicione uma ou mais datas e escolha a garantia."]]
 },
 cur:"dash",
 ctx:function(v){
  AI.cur=v;$("#aiCtx").innerHTML='Contexto: <b>'+TITLES[v][1]+'</b>';
  $("#aiSugs").innerHTML=(AI.sug[v]||[]).map(function(s,i){return '<button class="chip" type="button" data-i="'+i+'">✦ '+s[0]+'</button>'}).join("");
 },
 add:function(who,html,box){var b=document.createElement("div");b.className="bub "+who;b.innerHTML=html;(box||$("#aiMsgs")).appendChild(b);(box||$("#aiMsgs")).scrollTop=1e6},
 reply:function(q){return "Entendi: “"+q.replace(/</g,"&lt;")+"”. Neste protótipo eu ainda não estou conectado aos dados nem à base de conhecimento. Quando o sistema estiver no ar, respondo com base nas informações da Monte Fuji que você me enviar."},
 open:function(){$("#drawer").classList.add("on");$("#dscrim").classList.add("on");setTimeout(function(){$("#aiIn").focus()},200)},
 close:function(){$("#drawer").classList.remove("on");$("#dscrim").classList.remove("on")}
};
function initAI(){
  $("#fab").addEventListener("click",AI.open);$("#aiX").addEventListener("click",AI.close);$("#dscrim").addEventListener("click",AI.close);
  document.addEventListener("keydown",function(e){if(e.key==="Escape"){AI.close();$$(".modal").forEach(function(m){m.hidden=true})}if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="j"){e.preventDefault();AI.open()}});
  $("#aiSugs").addEventListener("click",function(e){var b=e.target.closest(".chip");if(!b)return;var s=AI.sug[AI.cur][b.dataset.i];AI.add("me",s[0]);setTimeout(function(){AI.add("ai",s[1])},350)});
  function send(){var v=$("#aiIn").value.trim();if(!v)return;AI.add("me",v.replace(/</g,"&lt;"));$("#aiIn").value="";setTimeout(function(){AI.add("ai",AI.reply(v))},400)}
  $("#aiSend").addEventListener("click",send);
  $("#aiIn").addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}});
  AI.add("ai","Olá! Sou o assistente da Monte Fuji. Estou presente em todas as telas: abro com sugestões do que você está vendo. Atalho: <b>Ctrl + J</b>.");
}
function aiBox(txt,btn,act){return '<div class="aisug"><span class="orb" aria-hidden="true"></span><p><span class="lb">Sugestão do assistente</span>'+txt+'</p>'+(btn?'<button class="ghost" type="button" '+(act||'data-ai')+'>'+btn+'</button>':'')+'</div>'}


/* ===== cliente: campo digitável com sugestões + cadastro rápido ===== */
function norm(s){return String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase()}
function cliPick(id,val){return '<div class="cpick"><input id="'+id+'" autocomplete="off" placeholder="Digite o nome do cliente" value="'+(val||"")+'" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="'+id+'L"><ul class="cpl" id="'+id+'L" role="listbox" hidden></ul></div>'}
function bindPick(inp,onPick){
  var ul=inp.nextElementSibling,act=-1,items=[];
  function close(){ul.hidden=true;inp.setAttribute("aria-expanded","false");act=-1}
  function choose(i){var it=items[i];if(!it)return;if(it.novo){close();openCliModal(inp.value.trim(),function(c){inp.value=c.nome;onPick&&onPick(c)});return}inp.value=it.c.nome;close();onPick&&onPick(it.c)}
  function draw(){
    var q=norm(inp.value.trim());
    var qd=digits(q);items=CLIENTES.filter(function(c){return !q||norm(c.nome+" "+c.razao+" "+c.doc).indexOf(q)>=0||(qd.length>=4&&digits(c.doc).indexOf(qd)>=0)}).slice(0,6).map(function(c){return {c:c}});
    items.push({novo:true});
    ul.innerHTML=items.map(function(it,i){return it.novo?'<li role="option" class="nv'+(i===act?' on':'')+'" data-i="'+i+'">'+ic("plus",12)+(digits(inp.value).length===14?' Buscar CNPJ na Receita e cadastrar':' Cadastrar novo cliente'+(inp.value.trim()?' “'+inp.value.trim().replace(/</g,"&lt;")+'”':''))+'</li>':'<li role="option" class="'+(i===act?'on':'')+'" data-i="'+i+'"><b>'+it.c.nome+'</b><small>'+it.c.doc+' · '+it.c.end.split("·").pop().trim()+'</small></li>'}).join("");
    ul.hidden=false;inp.setAttribute("aria-expanded","true");
  }
  inp.addEventListener("input",function(){act=-1;draw()});
  inp.addEventListener("focus",draw);
  inp.addEventListener("blur",function(){setTimeout(close,120)});
  inp.addEventListener("keydown",function(e){
    if(ul.hidden&&e.key==="ArrowDown"){draw();return}
    if(e.key==="ArrowDown"){e.preventDefault();act=Math.min(items.length-1,act+1);draw()}
    else if(e.key==="ArrowUp"){e.preventDefault();act=Math.max(0,act-1);draw()}
    else if(e.key==="Enter"&&!ul.hidden&&act>=0){e.preventDefault();choose(act)}
    else if(e.key==="Escape"){close()}
  });
  ul.addEventListener("mousedown",function(e){e.preventDefault();var li=e.target.closest("li");if(li)choose(+li.dataset.i)});
}
var _cliCb=null;
function digits(s){return String(s||"").replace(/\D/g,"")}
function openCliModal(nome,cb){
  var m=$("#cliModal");
  if(!m){
    m=document.createElement("div");m.className="modal";m.id="cliModal";m.hidden=true;
    m.innerHTML='<div class="box" role="dialog" aria-modal="true" aria-labelledby="ncT"><h3 id="ncT">Novo cliente</h3>'
    +'<div class="fld"><label for="ncDoc">CNPJ ou CPF</label><div class="docrow"><input id="ncDoc" inputmode="numeric" placeholder="Digite o CNPJ e os dados aparecem sozinhos"><button class="ghost" type="button" id="ncBusca">'+ic("search",13)+' Buscar</button></div><div class="rfst" id="ncSt"><span class="mut">Digite os 14 números do CNPJ: razão social, endereço e telefone vêm da Receita Federal.</span></div></div>'
    +'<div class="form">'
    +'<div class="fld full"><label for="ncRaz">Razão social</label><input id="ncRaz"></div>'
    +'<div class="fld"><label for="ncNome">Nome do cliente</label><input id="ncNome" placeholder="Como aparece na agenda e nas OS"></div>'
    +'<div class="fld"><label for="ncPer">Perfil</label><select id="ncPer"><option>Condomínio</option><option>Comércio</option><option>Residência</option><option>Construtora</option><option>Indústria</option></select></div>'
    +'<div class="fld"><label for="ncCon">Contato</label><input id="ncCon" placeholder="Nome e função"></div>'
    +'<div class="fld"><label for="ncTel">Telefone</label><input id="ncTel" placeholder="(11) 00000-0000"></div>'
    +'<div class="fld full"><label for="ncEm">E-mail</label><input id="ncEm" type="email"></div>'
    +'<div class="fld full"><label for="ncEnd">Endereço</label><input id="ncEnd" placeholder="Rua, número · bairro, cidade/UF"></div></div>'
    +'<div class="drive">'+ic("drive",15)+'Pasta no Drive: <code>Clientes / <span id="ncPath">…</span></code></div>'
    +'<div class="acts"><button class="ghost" type="button" data-ncx>Cancelar</button><button class="cta rq" type="button" id="ncSave">Salvar cliente</button></div></div>';
    document.body.appendChild(m);
    m.addEventListener("click",function(e){
      if(e.target===m||e.target.closest("[data-ncx]")){m.hidden=true;return}
      if(e.target.closest("#ncBusca")){busca(true);return}
      if(e.target.closest("#ncSave")){
        var n=$("#ncNome").value.trim();if(!n){toast("Informe o nome do cliente.");$("#ncNome").focus();return}
        var c={id:nid(CLIENTES),nome:n,razao:$("#ncRaz").value.trim()||n,doc:$("#ncDoc").value.trim()||"—",perfil:$("#ncPer").value,contato:$("#ncCon").value.trim()||"—",tel:$("#ncTel").value.trim()||"—",email:$("#ncEm").value.trim()||"—",end:$("#ncEnd").value.trim()||"—",hist:[],gar:[],pasta:"Clientes / "+n};
        CLIENTES.push(c);if(DRIVE_FOLDERS.indexOf(n)<0)DRIVE_FOLDERS.push(n);m.hidden=true;toast(c.nome+" cadastrado.");if(_cliCb)_cliCb(c);
        if(VIEWS.cli&&VIEWS.cli.refresh)VIEWS.cli.refresh();
      }
    });
    m.addEventListener("input",function(e){$("#ncPath").textContent=$("#ncNome").value.trim()||"…";if(e.target.id==="ncDoc"){var d=digits(e.target.value);if(d.length===14)busca();else $("#ncSt").innerHTML=d.length===11?'<span class="mut">CPF: preencha os dados manualmente.</span>':'<span class="mut">Digite os 14 números do CNPJ.</span>'}});
  }
  function busca(force){
    var d=digits($("#ncDoc").value),st=$("#ncSt");
    if(d.length!==14){if(force)st.innerHTML='<span class="pill er">CNPJ incompleto</span> <span class="mut">São 14 números.</span>';return}
    var ja=CLIENTES.find(function(c){return digits(c.doc)===d});
    if(ja){st.innerHTML='<span class="pill al">Já cadastrado</span> <span class="mut">Este CNPJ é de '+ja.nome+'.</span>';return}
    st.innerHTML='<span class="spin"></span><span class="mut">Consultando a Receita Federal…</span>';
    consultaCNPJ(d,function(err,r){
      if(err){st.innerHTML='<span class="pill al">Sem resposta da Receita</span> <span class="mut">Confira o CNPJ ou preencha os dados à mão.</span>';return}
      $("#ncDoc").value=fmtCNPJ(d);$("#ncRaz").value=r.razao;$("#ncNome").value=r.fantasia||r.razao;$("#ncEnd").value=r.end;if(r.tel)$("#ncTel").value=r.tel;if(r.email)$("#ncEm").value=r.email;$("#ncPer").value=r.perfil;$("#ncPath").textContent=r.fantasia||r.razao;
      $$(".form input",m).forEach(function(i){if(i.value&&i.id!=="ncCon")i.classList.add("auto")});
      st.innerHTML='<span class="pill '+(r.situacao==="Ativa"?'ok':'al')+'">Situação '+r.situacao.toLowerCase()+'</span> <span class="mut">Dados da Receita Federal'+(r.abertura?' · aberta em '+dmy(r.abertura):'')+(r.cnae?' · '+r.cnae:'')+'</span>';
      $("#ncCon").focus();
    });
  }
  _cliCb=cb||null;
  $$("input",m).forEach(function(i){i.value="";i.classList.remove("auto")});$("#ncSt").innerHTML='<span class="mut">Digite os 14 números do CNPJ: razão social, endereço e telefone vêm da Receita Federal.</span>';
  var dd=digits(nome);
  if(dd.length>=11&&dd.length===String(nome).replace(/[\s.\/-]/g,"").length){$("#ncDoc").value=nome;$("#ncPath").textContent="…";m.hidden=false;if(dd.length===14)busca();setTimeout(function(){$("#ncDoc").focus()},30);return}
  $("#ncNome").value=nome||"";$("#ncPath").textContent=nome||"…";
  m.hidden=false;setTimeout(function(){$("#ncDoc").focus()},30);
}

/* ===== importar clientes do Conta Azul (planilha exportada: .xlsx, .xls ou .csv) ===== */
var IMP_CAMPOS=[
  ["nome","Nome do cliente",["nome","nome do cliente","cliente","nome / razao social","nome/razao social","nome ou razao social"]],
  ["fantasia","Nome fantasia",["nome fantasia","fantasia"]],
  ["razao","Razão social",["razao social","razao"]],
  ["doc","CNPJ / CPF",["cpf/cnpj","cnpj/cpf","cpf / cnpj","cnpj / cpf","cnpj","documento","cpf ou cnpj","cnpj ou cpf"]],
  ["cpf","CPF (coluna separada)",["cpf"]],
  ["tipo","Tipo de pessoa",["tipo de pessoa","tipo pessoa","pessoa","tipo"]],
  ["contato","Contato",["contato","nome do contato","pessoa de contato","responsavel","contato principal"]],
  ["tel","Telefone",["telefone","telefone comercial","fone","telefone 1","telefone principal","tel"]],
  ["cel","Celular",["celular","telefone celular","whatsapp","telefone 2"]],
  ["email","E-mail",["e-mail","email","e-mail principal","email principal","emails","e-mails"]],
  ["email2","E-mail do contato",["e-mail contato","email contato","e-mail do contato","email do contato"]],
  ["rua","Endereço (rua)",["endereco","logradouro","rua","endereco completo"]],
  ["num","Número",["numero","no","n","nro"]],
  ["comp","Complemento",["complemento"]],
  ["bairro","Bairro",["bairro"]],
  ["cidade","Cidade",["cidade","municipio"]],
  ["uf","Estado",["estado","uf"]]
];
function impKey(s){return norm(String(s||"")).replace(/[º°]/g,"o").replace(/[*:]/g,"").replace(/\s+/g," ").trim()}
/* acha a linha de cabeçalho e liga cada campo a uma coluna */
function impDetect(rows){
  var best={row:0,map:{},n:-1};
  rows.slice(0,15).forEach(function(r,ri){
    var hs=r.map(impKey),map={},used={},n=0;
    function take(f,j){if(j>=0){map[f[0]]=j;used[j]=1;n++}}
    /* primeiro os nomes exatos, depois os parecidos */
    IMP_CAMPOS.forEach(function(f){take(f,hs.findIndex(function(h,k){return !used[k]&&h&&f[2].indexOf(h)>=0}))});
    IMP_CAMPOS.forEach(function(f){if(map[f[0]]!==undefined||["num","tipo","uf"].indexOf(f[0])>=0)return;take(f,hs.findIndex(function(h,k){return !used[k]&&h&&f[2].some(function(s){return s.length>3&&h.indexOf(s)>=0})}))});
    if(n>best.n)best={row:ri,map:map,n:n};
  });
  return best;
}
function fmtCPF(d){return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/,"$1.$2.$3-$4")}
function impDoc(v,tipo){
  var d=digits(v),t=norm(tipo||"");if(!d)return "";
  /* planilhas do Excel costumam perder os zeros à esquerda */
  if(d.length>11&&d.length<14)d=d.padStart(14,"0");
  else if(d.length<11&&d.length>=9)d=/jur/.test(t)?d.padStart(14,"0"):d.padStart(11,"0");
  return d.length===14?fmtCNPJ(d):d.length===11?fmtCPF(d):String(v).trim();
}
function impTel(v){var d=digits(v);if(d.length>11&&d.slice(0,2)==="55")d=d.slice(2);return d.length===11?"("+d.slice(0,2)+") "+d.slice(2,7)+"-"+d.slice(7):d.length===10?"("+d.slice(0,2)+") "+d.slice(2,6)+"-"+d.slice(6):String(v||"").trim()}
function impPerfil(o){
  var t=norm(o.nome+" "+o.razao);
  if(/condom|edif|residencial|conjunto habitacional/.test(t))return "Condomínio";
  if(/constru|incorpora|engenharia/.test(t))return "Construtora";
  if(/industria/.test(t))return "Indústria";
  if(digits(o.doc).length===11||/fis/.test(norm(o.tipo||"")))return "Residência";
  return "Comércio";
}
/* transforma as linhas da planilha em clientes do sistema */
function impBuild(rows,hdr,map){
  function g(r,k){var j=map[k];return j===undefined||j===""||j===null?"":String(r[j]==null?"":r[j]).trim()}
  var out=[];
  rows.slice(hdr+1).forEach(function(r){
    if(!r||!r.some(function(x){return String(x==null?"":x).trim()}))return;
    var nome=g(r,"fantasia")||g(r,"nome")||g(r,"razao"),tipo=g(r,"tipo");
    var rua=[g(r,"rua"),g(r,"num")].filter(Boolean).join(", ")+(g(r,"comp")?" "+g(r,"comp"):"");
    var cid=g(r,"cidade")+(g(r,"uf")?"/"+g(r,"uf").toUpperCase():"");
    var loc=[g(r,"bairro"),cid].filter(Boolean).join(", ");
    var tels=[g(r,"tel"),g(r,"cel")].filter(Boolean).map(impTel).filter(function(t,i,a){return a.indexOf(t)===i});
    var o={nome:nome,razao:g(r,"razao")||g(r,"nome")||nome,doc:impDoc(g(r,"doc")||g(r,"cpf"),g(r,"doc")?tipo:"Física"),tipo:tipo,contato:g(r,"contato"),tel:tels.join(" / "),email:(g(r,"email")||g(r,"email2")).split(/[;,\s]+/).filter(Boolean)[0]||"",end:[rua,loc].filter(Boolean).join(" · ")};
    o.email=o.email.toLowerCase();o.perfil=impPerfil(o);out.push(o);
  });
  return out;
}
/* separa novos, já cadastrados (mesmo nome) e linhas sem nome;
   o mesmo CNPJ com outro nome conta como outra unidade do cliente */
function impPlan(list){
  var byNome={},seen={},plan={novos:[],existentes:[],semNome:0,repetidos:0};
  CLIENTES.forEach(function(c){byNome[norm(c.nome)]=c});
  list.forEach(function(o){
    if(!o.nome){plan.semNome++;return}
    var k=digits(o.doc)+"|"+norm(o.nome);
    if(seen[k]){plan.repetidos++;return}seen[k]=1;
    var c=byNome[norm(o.nome)];
    if(c)plan.existentes.push([c,o]);else plan.novos.push(o);
  });
  return plan;
}
function impApply(plan){
  var fill=0;
  plan.novos.forEach(function(o){
    CLIENTES.push({id:nid(CLIENTES),nome:o.nome,razao:o.razao||o.nome,doc:o.doc||"—",perfil:o.perfil,contato:o.contato||"—",tel:o.tel||"—",email:o.email||"—",end:o.end||"—",hist:[],gar:[],pasta:"Clientes / "+o.nome,origem:"Conta Azul"});
    if(DRIVE_FOLDERS.indexOf(o.nome)<0)DRIVE_FOLDERS.push(o.nome);
  });
  /* nos já cadastrados, só completa o que estava vazio */
  plan.existentes.forEach(function(p){var c=p[0],o=p[1],ch=0;["doc","contato","tel","email","end"].forEach(function(k){if((!c[k]||c[k]==="—")&&o[k]){c[k]=o[k];ch=1}});if(ch)fill++});
  dbSave();
  return fill;
}
/* lê CSV (separador ; ou , e acentos em UTF-8 ou Windows-1252) */
function impCSV(buf){
  var txt=new TextDecoder("utf-8").decode(buf);if(txt.indexOf("�")>=0)txt=new TextDecoder("windows-1252").decode(buf);
  txt=txt.replace(/^﻿/,"");
  var first=txt.split(/\r?\n/)[0]||"",sep=(first.split(";").length>=first.split(",").length)?";":(first.split("\t").length>first.split(",").length?"\t":",");
  var rows=[],row=[],cell="",q=false;
  for(var i=0;i<txt.length;i++){var ch=txt[i];
    if(q){if(ch==='"'){if(txt[i+1]==='"'){cell+='"';i++}else q=false}else cell+=ch}
    else if(ch==='"')q=true;
    else if(ch===sep){row.push(cell);cell=""}
    else if(ch==="\n"||ch==="\r"){if(ch==="\r"&&txt[i+1]==="\n")i++;row.push(cell);rows.push(row);row=[];cell=""}
    else cell+=ch}
  if(cell||row.length){row.push(cell);rows.push(row)}
  return rows;
}
var _xlsxP=null;
function loadXLSX(){
  if(window.XLSX)return Promise.resolve(window.XLSX);
  if(!_xlsxP)_xlsxP=new Promise(function(ok,no){var s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";s.onload=function(){window.XLSX?ok(window.XLSX):no()};s.onerror=function(){_xlsxP=null;no()};document.head.appendChild(s)});
  return _xlsxP;
}
function impRead(file,cb){
  var rd=new FileReader();
  rd.onerror=function(){cb("Não consegui ler o arquivo.")};
  rd.onload=function(){
    var buf=rd.result;
    if(/\.(csv|txt)$/i.test(file.name)){try{cb(null,impCSV(buf))}catch(e){cb("Não consegui ler este CSV.")}return}
    loadXLSX().then(function(X){
      try{var wb=X.read(new Uint8Array(buf),{type:"array"});
        /* usa a aba com mais linhas preenchidas */
        var best=[];wb.SheetNames.forEach(function(n){var r=X.utils.sheet_to_json(wb.Sheets[n],{header:1,raw:true,defval:""});if(r.length>best.length)best=r});
        cb(null,best.map(function(r){return r.map(function(x){return typeof x==="number"?String(Math.round(x)===x?x.toFixed(0):x):x})}))}
      catch(e){cb("Este arquivo não parece uma planilha do Excel.")}
    },function(){cb("Sem internet para abrir planilhas do Excel. Tente salvar como CSV.")});
  };
  rd.readAsArrayBuffer(file);
}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function openImpModal(done){
  var m=$("#impModal"),S={rows:null,hdr:0,map:{},file:""};
  if(m)m.remove();
  m=document.createElement("div");m.className="modal";m.id="impModal";
  m.innerHTML='<div class="box imp" role="dialog" aria-modal="true" aria-labelledby="imT"><h3 id="imT">Importar clientes do Conta Azul</h3>'
  +'<ol class="imsteps"><li>No Conta Azul, abra <b>Cadastros › Clientes</b>.</li><li>Clique em <b>Exportar</b> (ou <b>Mais ações › Exportar</b>) e baixe a planilha.</li><li>Escolha o arquivo aqui. Aceita .xlsx, .xls e .csv.</li></ol>'
  +'<label class="drop" id="imDrop">'+ic("up",16)+'<span><b>Escolher a planilha</b><small>ou arraste o arquivo para cá</small></span><input type="file" id="imFile" accept=".xlsx,.xls,.csv,.txt" hidden></label>'
  +'<div id="imBody"></div>'
  +'<div class="acts"><button class="ghost" type="button" data-imx>Cancelar</button><button class="cta rq" type="button" id="imGo" disabled>Importar</button></div></div>';
  document.body.appendChild(m);
  function close(){m.remove()}
  function plan(){return impPlan(impBuild(S.rows,S.hdr,S.map))}
  function draw(){
    var p=plan(),body=$("#imBody",m),cols=S.rows[S.hdr]||[];
    var opts=function(sel){return '<option value="">—</option>'+cols.map(function(h,j){return '<option value="'+j+'"'+(sel===j?' selected':'')+'>'+esc(h||("Coluna "+(j+1)))+'</option>'}).join("")};
    body.innerHTML='<div class="imsum"><span class="pill ok">'+p.novos.length+' novo'+(p.novos.length===1?'':'s')+'</span>'
      +(p.existentes.length?'<span class="pill ne">'+p.existentes.length+' já cadastrado'+(p.existentes.length===1?'':'s')+'</span>':'')
      +(p.semNome?'<span class="pill al">'+p.semNome+' sem nome</span>':'')+(p.repetidos?'<span class="pill al">'+p.repetidos+' repetido'+(p.repetidos===1?'':'s')+' na planilha</span>':'')
      +'<span class="mut">'+esc(S.file)+'</span></div>'
      +(p.existentes.length?'<p class="sub">Clientes já cadastrados com o mesmo nome não são duplicados: só os campos vazios deles são completados.</p>':'')
      +(p.novos.length?'<div class="scroll-x"><table class="tb"><thead><tr><th>Cliente</th><th>CNPJ / CPF</th><th>Perfil</th><th>Telefone</th><th>Cidade</th></tr></thead><tbody>'
        +p.novos.slice(0,5).map(function(o){return '<tr><td><b>'+esc(o.nome)+'</b><small>'+esc(o.email)+'</small></td><td class="num">'+esc(o.doc||"—")+'</td><td>'+o.perfil+'</td><td>'+esc(o.tel||"—")+'</td><td>'+esc(o.end.split("·").pop().trim()||"—")+'</td></tr>'}).join("")
        +'</tbody></table></div>'+(p.novos.length>5?'<p class="sub">E mais '+(p.novos.length-5)+'. O perfil é sugerido pelo nome e pelo tipo de pessoa; dá para mudar depois na ficha.</p>':'')
       :'<p class="sub">Nenhum cliente novo para importar com as colunas abaixo.</p>')
      +'<details class="immap"'+(S.map.nome===undefined&&S.map.fantasia===undefined?' open':'')+'><summary>Colunas da planilha</summary><div class="form">'
      +IMP_CAMPOS.map(function(f){return '<div class="fld"><label for="im_'+f[0]+'">'+f[1]+'</label><select id="im_'+f[0]+'" data-f="'+f[0]+'">'+opts(S.map[f[0]])+'</select></div>'}).join("")
      +'</div></details>';
    var go=$("#imGo",m);go.disabled=!(p.novos.length||p.existentes.length);go.textContent=p.novos.length?'Importar '+p.novos.length+' cliente'+(p.novos.length===1?'':'s'):'Atualizar cadastrados';
  }
  function load(file){
    if(!file)return;S.file=file.name;$("#imBody",m).innerHTML='<div class="rfst"><span class="spin"></span><span class="mut">Lendo a planilha…</span></div>';
    impRead(file,function(err,rows){
      if(err){$("#imBody",m).innerHTML='<div class="rfst"><span class="pill er">Erro</span> <span class="mut">'+err+'</span></div>';return}
      rows=rows.filter(function(r){return r&&r.length});
      if(!rows.length){$("#imBody",m).innerHTML='<div class="rfst"><span class="pill al">Planilha vazia</span></div>';return}
      var d=impDetect(rows);S.rows=rows;S.hdr=d.row;S.map=d.map;draw();
    });
  }
  m.addEventListener("click",function(e){
    if(e.target===m||e.target.closest("[data-imx]")){close();return}
    if(e.target.closest("#imGo")){var p=plan(),fill=impApply(p);close();
      toast(p.novos.length+" cliente"+(p.novos.length===1?" importado":"s importados")+" do Conta Azul"+(fill?" · "+fill+" atualizado"+(fill===1?"":"s"):"")+".");
      if(done)done(p);return}
  });
  m.addEventListener("change",function(e){
    if(e.target.id==="imFile"){load(e.target.files[0]);return}
    var f=e.target.dataset&&e.target.dataset.f;if(f){if(e.target.value==="")delete S.map[f];else S.map[f]=+e.target.value;draw()}
  });
  var dz=$("#imDrop",m);
  dz.addEventListener("dragover",function(e){e.preventDefault();dz.classList.add("on")});
  dz.addEventListener("dragleave",function(){dz.classList.remove("on")});
  dz.addEventListener("drop",function(e){e.preventDefault();dz.classList.remove("on");load(e.dataTransfer.files[0])});
}

/* ===== gráficos reutilizáveis ===== */
/* ===== DASHBOARD ===== */
VIEWS.dash=function(v){
  VIEWS.dash.show=function(){
  var hoje=evOn(TD),late=TAREFAS.filter(isLate),ab=RECEBER.filter(function(r){return !r.pago}),tot=ab.reduce(function(s,r){return s+r.valor},0),venc=ab.filter(function(r){return recSt(r)[1]==="Vencido"});
  var ini=addDays(TODAY,-TODAY.getDay()),sem=0;for(var i=0;i<7;i++)sem+=evOn(ymd(addDays(ini,i))).length;
  var mes=TD.slice(0,7),osMes=OSL.filter(function(o){return String(o[1]).slice(0,7)===mes}).length,bd=FUNC.filter(function(f){return f.nasc&&f.nasc.slice(5,7)===mes.slice(5)});
  var passos=[[CLIENTES.length>0,"Cadastrar os clientes","cli"],[FUNC.length>0,"Cadastrar a equipe","func"],[EVENTS.length>0,"Lançar os serviços na agenda","agenda"],[OSL.length>0,"Gerar a primeira ordem de serviço","os"],[RECEBER.length>0,"Lançar as cobranças avulsas","rec"]],feitos=passos.filter(function(p){return p[0]}).length;
  function vazio(t){return '<li class="mut">'+t+'</li>'}
  v.innerHTML='<div class="grid">'
  +'<div class="card hero c3"><div class="ring" aria-hidden="true"></div><div class="hh"><span>A receber em aberto</span><button class="plus" type="button" aria-label="Novo lançamento" data-go="rec">+</button></div><b class="num">'+brl(tot)+'</b><p class="hs">'+(ab.length?ab.length+' cobrança'+(ab.length>1?'s':'')+(venc.length?' · '+venc.length+' vencida'+(venc.length>1?'s':''):''):'Nenhuma cobrança em aberto')+'</p><div class="ha"><button class="w" type="button" data-go="rec">Ver cobranças</button></div></div>'
  +'<div class="card c9"><div class="ch"><h4>Resumo</h4><span class="sub">'+DIA_EXT[TODAY.getDay()].replace(/^./,function(m){return m.toUpperCase()})+', '+dmy(TD)+'</span></div><div class="kp" style="--n:4">'
   +'<div><span class="sq">'+ic("agenda",14)+'</span><span class="t">Visitas hoje</span><b class="num">'+hoje.length+'</b><span class="pill in">'+sem+' na semana</span></div>'
   +'<div><span class="sq">'+ic("os",14)+'</span><span class="t">OS emitidas no mês</span><b class="num">'+osMes+'</b><span class="pill ne">'+OSL.length+' no total</span></div>'
   +'<div><span class="sq">'+ic("cli",14)+'</span><span class="t">Clientes cadastrados</span><b class="num">'+CLIENTES.length+'</b><span class="pill ne">'+FUNC.length+' na equipe</span></div>'
   +'<div><span class="sq">'+ic("clock",14)+'</span><span class="t">Anotações atrasadas</span><b class="num">'+late.length+'</b><span class="pill '+(late.length?'er':'ok')+'">'+(late.length?'Ver quadro':'Em dia')+'</span></div></div></div>'
  +'<div class="card c4"><div class="ch"><h4>Agenda de hoje</h4><a class="ghost" href="#agenda">Abrir</a></div><span class="sub">'+hoje.length+' visita'+(hoje.length===1?'':'s')+(bd.filter(function(f){return f.nasc.slice(5)===TD.slice(5)}).length?' · aniversário de '+bd.filter(function(f){return f.nasc.slice(5)===TD.slice(5)}).map(function(f){return firstName(f.nome)}).join(", "):'')+'</span><ul class="ls">'
   +(hoje.length?hoje.slice(0,5).map(function(e){return '<li><span class="tm">'+hh(e.h)+'</span><span class="bar-t" style="background:'+SERV[e.s].c+'"></span><span class="grow"><b>'+e.cli+'</b><small>'+svShort(e)+'</small></span></li>'}).join(""):vazio('Nada agendado para hoje.'))+'</ul>'+(hoje.length>5?'<a class="more" href="#agenda">+ '+(hoje.length-5)+' visitas</a>':'')+'</div>'
  +'<div class="card c4"><div class="ch"><h4>Anotações</h4><a class="ghost" href="#notas">Quadro</a></div>'+(late.length?'<div class="kb-alert" style="padding:8px 10px"><b>'+late.length+' atrasada'+(late.length>1?'s':'')+'.</b> Não esqueça!</div>':'')
   +'<ul class="ls">'+(TAREFAS.filter(function(t){return !t.done}).length?TAREFAS.filter(function(t){return !t.done}).slice(0,5).map(function(t){var l=isLate(t);return '<li>'+(l?'<span class="sq" style="width:22px;height:22px;border-radius:6px;background:var(--erro-50);border-color:#F1C9C6;color:var(--erro)">'+ic("clock",12)+'</span>':'<span style="width:18px;height:18px;margin:2px;border-radius:5px;border:1.5px solid #CAC9C5;flex:none"></span>')+'<span class="grow"><b>'+t.t+'</b><small>'+(!t.due?'Sem data':l?'Venceu em '+dmy(t.due):'Prazo '+dmy(t.due))+'</small></span></li>'}).join(""):vazio('Nenhuma anotação pendente.'))+'</ul></div>'
  +'<div class="card c4"><div class="ch"><h4>Cobranças a vencer</h4><a class="ghost" href="#rec">A receber</a></div><ul class="ls">'
   +(ab.length?ab.slice().sort(function(a,b){return a.venc<b.venc?-1:1}).slice(0,5).map(function(r){var d=diffDays(r.venc,TD);return '<li><span class="grow"><b>'+r.nome+'</b><small>'+(d<0?'Vencida há '+(-d)+' dia'+(d===-1?'':'s'):d===0?'Vence hoje':'Vence em '+dmy(r.venc))+'</small></span><b class="num" style="flex:none;'+(d<0?'color:var(--erro)':'')+'">'+brl(r.valor)+'</b></li>'}).join(""):vazio('Nenhuma cobrança em aberto.'))+'</ul></div>'
  +'<div class="card c8"><div class="ch"><h4>Ordens de serviço recentes</h4><div class="r"><a class="ghost" href="#os">+ Nova OS</a></div></div>'
   +(OSL.length?'<div class="scroll-x"><table class="tb"><thead><tr><th>Número</th><th>Cliente</th><th>Serviço</th><th>Status</th></tr></thead><tbody>'+OSL.slice(0,5).map(function(o){return '<tr><td><b>'+o[0]+'</b><small>'+dmy(o[1])+'</small></td><td>'+o[2]+'</td><td>'+o[3]+'</td><td>'+stPill(o[6])+'</td></tr>'}).join("")+'</tbody></table></div>':'<p class="mut txt">Nenhuma OS emitida ainda.</p>')+'</div>'
  +'<div class="card c4"><div class="ch"><h4>Primeiros passos</h4><span class="pill '+(feitos===passos.length?'ok':'in')+'">'+feitos+' de '+passos.length+'</span></div><ul class="ls">'
   +passos.map(function(p){return '<li class="lk" data-go="'+p[2]+'"><span class="sq" style="'+(p[0]?'background:var(--ok);border-color:var(--ok);color:#fff':'')+'">'+ic(p[0]?"chk":p[2],13)+'</span><span class="grow"><b style="'+(p[0]?'text-decoration:line-through;color:var(--t3)':'')+'">'+p[1]+'</b></span><span class="chev">›</span></li>'}).join("")+'</ul></div>'
  +'</div>';
  };
};
function stPill(s){var m={"Concluída":"ok","Cancelada":"er","Aguardando assinatura":"al","Agendada":"in","Em execução":"in"};return '<span class="pill '+(m[s]||"ne")+'">'+s+'</span>'}

/* ===== AGENDA ===== */
function svShort(e){return (e.svs||[e.s]).map(function(s){return SERV[s]?SERV[s].sh:s}).join(" + ")}
function garTxt(n){return n?(n===1?"1 mês":n+" meses"):"Sem garantia"}
function addMonths(ds,n){var p=ds.split("-"),d=new Date(+p[0],+p[1]-1+n,+p[2]);return ymd(d)}
function hh(h){return String(h).padStart(2,"0")+":00"}
VIEWS.agenda=function(v){
  var st={view:"mes",d:new Date(TODAY),ev:null,gar:3};
  function amanha(){var a=addDays(TODAY,1);if(a.getDay()===0)a=addDays(a,1);return ymd(a)}
  var HRS=[7,8,9,10,11,12,13,14,15,16,17];
  function dateRow(d,h){return '<div class="drow"><input type="date" aria-label="Data" value="'+(d||"")+'"><select aria-label="Horário">'+HRS.map(function(x){return '<option value="'+x+'"'+(x===(h||8)?' selected':'')+'>'+hh(x)+'</option>'}).join("")+'</select><button class="dots" type="button" data-rmd aria-label="Remover data">×</button></div>'}
  v.innerHTML='<div class="grid"><div class="card c9" id="calCard"><div class="cal-h"><div class="nav2"><button type="button" id="cPrev" aria-label="Anterior">‹</button><button type="button" id="cNext" aria-label="Próximo">›</button></div><h4 id="cTitle"></h4><button class="ghost" type="button" id="cToday">Hoje</button><span style="flex:1"></span><button class="ghost wpb" type="button" id="cWpp">'+ic("clock",13)+' Horários de amanhã</button><button class="cta" type="button" id="cNew">'+ic("plus",13)+'Novo agendamento</button></div>'
   +'<div class="cal-2"><div class="seg" role="group" aria-label="Visualização"><button type="button" data-cv="dia">Dia</button><button type="button" data-cv="semana">Semana</button><button type="button" data-cv="mes">Mês</button><button type="button" data-cv="ano">Ano</button></div><div class="leg2">'+SFAM.map(function(f){return '<span><i style="background:'+f[1]+'"></i>'+f[0]+'</span>'}).join("")+'<span class="lg-bd">'+ic("cake",11)+'Aniversário da equipe</span><span><i style="background:repeating-linear-gradient(135deg,#FFF 0 3px,#DDD 3px 6px);border:1px solid #DDD"></i>Domingo · sem atendimento</span></div></div><div id="cBody"></div></div>'
   +'<div class="c3" style="display:flex;flex-direction:column;gap:10px"><div class="card" id="sdCard"></div><div class="card bdcard" id="bdCard" hidden></div><div class="card"><div class="ch"><h4>Melhores datas</h4><span class="pill in">Assistente</span></div><p class="txt">Dias úteis com menos visitas nos próximos dias:</p><ul class="ls" id="best"></ul></div><div class="card"><div class="ch"><h4>Carga do mês</h4></div><div class="kp" style="--n:2"><div><span class="t">Visitas</span><b class="num" id="mCount"></b></div><div><span class="t">Dia mais cheio</span><b class="num" id="mTop"></b></div></div></div></div></div>'
   +'<div class="modal" id="wpModal" hidden><div class="box" role="dialog" aria-modal="true" aria-labelledby="wpT"><div class="ch" style="margin:0"><h3 id="wpT">Horários de amanhã</h3><span class="pill ok">Para o grupo do WhatsApp</span></div>'
   +'<div class="wprow"><div class="fld"><label for="wpD">Dia</label><input id="wpD" type="date"></div><div class="fld"><label for="wpS">Saudação</label><select id="wpS"><option>Bom dia</option><option>Boa tarde</option><option>Boa noite</option></select></div></div>'
   +'<div class="wpbox"><textarea id="wpTxt" spellcheck="false" aria-label="Texto para o WhatsApp"></textarea></div><p class="sub" style="margin:0">Dá para editar o texto antes de copiar, por exemplo para incluir os técnicos. Os asteriscos deixam o texto em negrito no WhatsApp.</p>'
   +'<div class="acts"><button class="ghost" type="button" data-wpx>Fechar</button><button class="cta rq" type="button" id="wpCopy">'+ic("doc",13)+' Copiar</button></div></div></div>'
   +'<div class="modal" id="evModal" hidden><div class="box" role="dialog" aria-modal="true" aria-labelledby="evT"><h3 id="evT">Novo agendamento</h3><div class="form">'
   +'<div class="fld full"><label for="evCli">Cliente</label>'+cliPick("evCli")+'</div>'
   +'<div class="fld full"><span class="lbl">Serviços <small>· marque um ou mais</small></span><div class="svpick">'+Object.keys(SERV).map(function(s,i){return '<label><input type="checkbox" value="'+s+'"><i style="background:'+SERV[s].c+'"></i><span>'+s+'</span></label>'}).join("")+'</div></div>'
   +'<div class="fld full"><span class="lbl">Datas e horários</span><div id="evDates"></div><button class="add-d" type="button" id="evAddD">'+ic("plus",12)+' Adicionar outra data</button></div>'
   +'<div class="fld full"><span class="lbl">Garantia</span><div class="seg gar" role="group" aria-label="Garantia">'+GAR_OPC.map(function(g){return '<button type="button" data-gar="'+g[0]+'">'+g[1]+'</button>'}).join("")+'</div></div>'
   +'<div class="fld"><label for="evDur">Duração prevista</label><select id="evDur"><option value="1">1 hora</option><option value="2" selected>2 horas</option><option value="3">3 horas</option><option value="4">4 horas</option><option value="8">Dia inteiro</option></select></div>'
   +'<div class="fld full"><label for="evObs">Observações</label><textarea id="evObs" placeholder="Ex.: retirar pets por 2 horas"></textarea></div></div>'
   +'<div class="acts"><button class="ghost" type="button" data-close>Cancelar</button><button class="cta rq" type="button" id="evSave">Salvar na agenda</button></div></div></div>';
  function key(d){return ymd(d)}
  function render(){
    $$("[data-cv]",v).forEach(function(b){b.setAttribute("aria-pressed",b.dataset.cv===st.view?"true":"false")});
    var d=st.d,b=$("#cBody");
    if(st.view==="mes"){
      $("#cTitle").textContent=MES[d.getMonth()]+" "+d.getFullYear();
      var first=new Date(d.getFullYear(),d.getMonth(),1),start=addDays(first,-first.getDay()),h='<div class="mgrid">'+DIA3.map(function(x){return '<div class="wd">'+x+'</div>'}).join("");
      for(var i=0;i<42;i++){var c=addDays(start,i),evs=evOn(key(c)),out=c.getMonth()!==d.getMonth(),bd=bdaysOn(key(c)),mx=bd.length?2:3;
        h+='<div class="d'+(bd.length&&!out?' bday':'')+(!out&&vencOn(key(c)).length?' venc':'')+(out?' out':'')+(key(c)===TD?' today':'')+(c.getDay()===0?' sun':'')+(key(c)===st.sel?' selday':'')+'" data-day="'+key(c)+'"><span class="n"><span>'+c.getDate()+'</span>'+(evs.length?'<small class="mut" style="font-weight:400">'+evs.length+'</small>':'')+'</span>'+(bd.length&&!out?'<span class="bdc" title="Aniversário: '+bd.map(function(f){return f.nome}).join(", ")+'">'+ic("cake",11)+bd.map(function(f){return firstName(f.nome)}).join(", ")+'</span>':'')
         +(out?'':vencOn(key(c)).map(function(x){return '<button type="button" class="vencb" data-ev="'+x.ev+'" title="Garantia vence hoje: '+x.cli+'">'+ic("bell",10)+' Vence: '+x.cli+'</button>'}).join(""))+evs.slice(0,mx).map(function(e){return '<button type="button" class="ev'+(e.id===st.ev?' on':'')+'" data-ev="'+e.id+'" style="--c:'+SERV[e.s].c+'">'+String(e.h).padStart(2,"0")+'h '+e.cli+'</button>'}).join("")+(evs.length>mx?'<span class="more">+'+(evs.length-mx)+' mais</span>':'')+'</div>'}
      b.innerHTML=h+'</div>';
    }else if(st.view==="semana"||st.view==="dia"){
      var days=[];if(st.view==="dia")days=[d];else{var s=addDays(d,-d.getDay());for(var j=0;j<7;j++)days.push(addDays(s,j))}
      $("#cTitle").textContent=st.view==="dia"?DIA3[d.getDay()]+", "+d.getDate()+" de "+MES[d.getMonth()].toLowerCase():days[0].getDate()+" a "+days[6].getDate()+" de "+MES[days[6].getMonth()].toLowerCase();
      var hrs=[7,8,9,10,11,12,13,14,15,16,17,18],w='<div class="scroll-x"><div class="wk" style="--cols:'+days.length+';min-width:'+(days.length>1?640:0)+'px"><div class="hd" style="border-left:0"></div>'+days.map(function(x){var bd=bdaysOn(key(x));return '<div class="hd'+(key(x)===TD?' today':'')+(bd.length?' bday':'')+'" data-day="'+key(x)+'">'+DIA3[x.getDay()]+'<b>'+x.getDate()+'</b>'+(bd.length?'<span class="bdh">'+ic("cake",11)+bd.map(function(f){return firstName(f.nome)}).join(", ")+'</span>':'')+vencOn(key(x)).map(function(vx){return '<button type="button" class="vench" data-ev="'+vx.ev+'">'+ic("bell",10)+' Vence: '+vx.cli+'</button>'}).join("")+'</div>'}).join("");
      var LAY={};days.forEach(function(x){var evs=evOn(key(x)),ends=[];evs.forEach(function(e){var ln=0;while(ends[ln]>e.h)ln++;ends[ln]=e.h+e.dur;e._ln=ln});var tot=Math.max(1,ends.length);evs.forEach(function(e){e._n=tot});LAY[key(x)]=evs});
      hrs.forEach(function(hr){w+='<div class="hr">'+hr+':00</div>'+days.map(function(x){var evs=LAY[key(x)].filter(function(e){return e.h===hr});
        return '<div class="cell">'+evs.map(function(e){var wdt=100/e._n;return '<button type="button" class="blk'+(e.id===st.ev?' on':'')+'" data-ev="'+e.id+'" style="--c:'+SERV[e.s].c+';top:2px;height:'+(Math.min(e.dur,19-e.h)*44-4)+'px;left:calc('+(e._ln*wdt)+'% + 2px);width:calc('+wdt+'% - 4px);right:auto" title="'+hh(e.h)+' · '+e.cli+' · '+svShort(e)+'"><b>'+e.cli+'</b><small>'+svShort(e)+'</small></button>'}).join("")+'</div>'}).join("")});
      b.innerHTML=w+'</div></div>';
    }else{
      $("#cTitle").textContent=String(d.getFullYear());
      var yr=d.getFullYear(),y='<div class="yr">';
      for(var m=0;m<12;m++){var f=new Date(yr,m,1),n=new Date(yr,m+1,0).getDate(),tot=0,g="";
        for(var e=0;e<f.getDay();e++)g+="<i></i>";
        for(var dd=1;dd<=n;dd++){var dt=new Date(yr,m,dd),cnt=evOn(key(dt)).length;tot+=cnt;var bdy=bdaysOn(key(dt));g+='<i class="'+(cnt>=5?"l3":cnt>=3?"l2":cnt>0?"l1":"")+(key(dt)===TD?" td":"")+(bdy.length?" bd":"")+(vencOn(key(dt)).length?" vc":"")+'"'+(bdy.length?' title="Aniversário: '+bdy.map(function(f){return f.nome}).join(", ")+'"':'')+'>'+dd+'</i>'}
        y+='<div class="ym" data-m="'+m+'"><h5>'+MES[m]+'<span>'+tot+' visitas</span></h5><div class="g">'+g+'</div></div>'}
      b.innerHTML=y+'</div><div class="leg2" style="margin-top:4px"><span><i style="background:var(--hidra-50)"></i>1–2 visitas</span><span><i style="background:var(--hidra-100)"></i>3–4</span><span><i style="background:var(--hidra-400)"></i>5 ou mais</span><span class="lg-bd">'+ic("cake",11)+'Aniversário da equipe</span><span class="lg-vc">'+ic("bell",11)+'Vencimento de garantia</span></div>';
    }
    load();
    if(st.ev&&EVENTS.find(function(x){return x.id===st.ev}))card(st.ev);else side(st.sel||TD);
  }
  function mark(){$$("[data-ev]",v).forEach(function(x){x.classList.toggle("on",x.dataset.ev===st.ev)});$$(".mgrid .d",v).forEach(function(x){x.classList.toggle("selday",x.dataset.day===st.sel)})}
  function side(k){
    st.sel=k;st.ev=null;var evs=evOn(k),p=k.split("-"),dt=new Date(+p[0],+p[1]-1,+p[2]);
    $("#sdCard").innerHTML='<div class="ch"><h4>'+(k===TD?"Hoje · ":"")+DIA3[dt.getDay()]+", "+p[2]+"/"+p[1]+'</h4><span class="sub">'+evs.length+' visita'+(evs.length===1?'':'s')+'</span></div>'+bdaysOn(k).map(function(f){var idade=+k.slice(0,4)-+f.nasc.slice(0,4);return '<div class="bdbar">'+ic("cake",16)+'<span><b>Aniversário de '+f.nome+'</b><small>'+f.cargo+' · '+idade+' anos</small></span></div>'}).join("")+'<ul class="ls sdl">'
     +vencOn(k).map(function(x){return '<div class="vencbar" data-ev="'+x.ev+'" tabindex="0">'+ic("bell",16)+'<span><b>Vence a garantia de '+x.cli+'</b><small>'+x.svs.join(", ")+' · feito em '+dmy(x.last)+'. Ligar e agendar nova aplicação.</small></span></div>'}).join("")
     +(evs.length?evs.map(function(e){return '<li data-ev="'+e.id+'" tabindex="0"><span class="tm">'+hh(e.h)+'</span><span class="bar-t" style="background:'+SERV[e.s].c+'"></span><span class="grow"><b>'+e.cli+'</b><small>'+svShort(e)+' · '+e.dur+'h</small></span><span class="chev" aria-hidden="true">›</span></li>'}).join(""):'<li class="mut">Sem visitas neste dia.</li>')+'</ul>'
     +'<button class="ghost" type="button" data-newon="'+k+'">'+ic("plus",12)+' Agendar neste dia</button>';
    mark();
  }
  function card(id){
    var e=EVENTS.find(function(x){return x.id===id});if(!e)return side(st.sel);
    st.ev=id;st.sel=e.date;
    var c=CLIENTES.find(function(x){return x.nome===e.cli}),p=e.date.split("-"),dt=new Date(+p[0],+p[1]-1,+p[2]);
    var grp=e.grp?EVENTS.filter(function(x){return x.grp===e.grp}).sort(function(a,b){return a.date<b.date?-1:1}):[e];
    var last=grp[grp.length-1].date;
    $("#sdCard").innerHTML='<div class="evc"><div class="ch"><button class="ghost" type="button" data-back>‹ '+DIA3[dt.getDay()]+", "+p[2]+"/"+p[1]+'</button><button class="dots" type="button" data-back aria-label="Fechar">×</button></div>'
     +'<div class="evh" style="--c:'+SERV[e.s].c+'"><small>'+DIA3[dt.getDay()]+', '+dmy(e.date)+' · '+hh(e.h)+' às '+hh(Math.min(e.h+e.dur,19))+'</small><b>'+e.cli+'</b><span>'+(c?c.end:"Cliente sem cadastro completo")+'</span></div>'
     +'<div class="sub">Serviços</div><div class="svl">'+(e.svs||[e.s]).map(function(s){return '<span style="--c:'+SERV[s].c+'">'+s+'</span>'}).join("")+'</div>'
     +'<div class="kv2"><div><small>Garantia</small><span>'+garTxt(e.gar)+(e.gar?'<em>até '+dmy(addMonths(last,e.gar))+'</em>':'')+'</span></div><div><small>Duração</small><span>'+e.dur+(e.dur===1?' hora':' horas')+'</span></div>'
     +(c?'<div><small>Contato</small><span>'+c.contato+'</span></div><div><small>Telefone</small><span>'+c.tel+'</span></div>':'')+'</div>'
     +(grp.length>1?'<div class="sub">Datas deste agendamento</div><ul class="dlist">'+grp.map(function(x){return '<li'+(x.id===e.id?' class="on"':'')+' data-ev="'+x.id+'">'+DIA3[new Date(x.date+"T12:00").getDay()]+', '+dmy(x.date)+' · '+hh(x.h)+'</li>'}).join("")+'</ul>':'')
     +(e.obs?'<div class="sub">Observações</div><p class="txt">'+e.obs+'</p>':'')
     +'<div class="acts"><button class="cta rq" type="button" data-mkos>'+ic("os",13)+' Gerar OS</button><button class="ghost" type="button" data-com>'+ic("down",13)+' Baixar comunicado</button>'+(c?'<a class="ghost" href="#cli" data-cli="'+c.id+'">Ver cliente</a>':'')+'<button class="ghost" type="button" data-del>Excluir</button></div></div>';
    mark();
  }
  /* aniversários da equipe no mês em exibição */
  function bdMes(){var c=$("#bdCard"),m=st.d.getMonth(),y=st.d.getFullYear(),
    l=FUNC.filter(function(f){return f.nasc&&+f.nasc.slice(5,7)===m+1}).sort(function(a,b){return a.nasc.slice(8)<b.nasc.slice(8)?-1:1});
    c.hidden=!l.length;if(!l.length)return;
    c.innerHTML='<div class="ch"><h4>'+ic("cake",15)+' Aniversários de '+MES[m].toLowerCase()+'</h4><span class="pill go">'+l.length+'</span></div><ul class="bdl">'+l.map(function(f){var k=y+f.nasc.slice(4),hj=k===TD,ps=k<TD;
      return '<li data-day="'+k+'" tabindex="0" class="'+(hj?'hj':ps?'ps':'')+'"><span class="bdd"><b>'+f.nasc.slice(8)+'</b><small>'+MES3[m]+'</small></span><span class="grow"><b>'+f.nome+'</b><small>'+(f.cargo||"")+' · faz '+(y-+f.nasc.slice(0,4))+' anos'+(hj?' · é hoje!':'')+'</small></span></li>'}).join("")+'</ul>'}
  function load(){bdMes();
  var mk=ymd(st.d).slice(0,7),ms=EVENTS.filter(function(e){return e.date.slice(0,7)===mk}),byDay={};ms.forEach(function(e){byDay[e.date]=(byDay[e.date]||0)+1});
  var top=Object.keys(byDay).sort(function(a,b){return byDay[b]-byDay[a]})[0];
  $("#mCount").textContent=ms.length;$("#mTop").textContent=top?dmy(top).slice(0,5)+" · "+byDay[top]:"—";
  var cands=[];for(var i=1;cands.length<7;i++){var x=addDays(TODAY,i);if(x.getDay()!==0&&x.getDay()!==6)cands.push(x)}
  cands.sort(function(a,b){return evOn(key(a)).length-evOn(key(b)).length||a-b});
  $("#best").innerHTML=cands.slice(0,3).map(function(x){var n=evOn(key(x)).length;return '<li><span class="sq">'+ic("agenda",13)+'</span><span class="grow"><b>'+DIA3[x.getDay()]+', '+dmy(key(x)).slice(0,5)+'</b><small>'+n+' visitas agendadas</small></span><button class="ghost" type="button" data-pick="'+key(x)+'">Agendar</button></li>'}).join("");
  }
  function setGar(n){st.gar=n;$$("[data-gar]",v).forEach(function(b){b.setAttribute("aria-pressed",+b.dataset.gar===n?"true":"false")})}
  function svJoin(a){a=a.slice();var i=a.indexOf("Dedetização"),j=a.indexOf("Desratização");if(i>=0&&j>=0){a.splice(j,1);a[a.indexOf("Dedetização")]="Dedetização e Desratização"}return a.length===2?a.join(" e "):a.join(", ")}
  function wpFill(){
    var k=$("#wpD").value,dt=new Date(k+"T12:00"),am=ymd(addDays(TODAY,1)),evs=evOn(k);
    var dia=k===am?"amanhã":DIA_EXT[dt.getDay()]+", "+dmy(k).slice(0,5);
    var t="*"+$("#wpS").value+", horários de "+dia+"*\n\n";
    t+=evs.length?evs.map(function(e,i){return "*Serviço "+(i+1)+"*\n*Local:* "+e.cli+"\n*Serviço:* "+svJoin(e.svs||[e.s])+"\n*Horário:* "+hh(e.h)+"\n*Técnicos:* \n*OBS:* "+(e.obs||"")}).join("\n\n"):"Sem serviços agendados para este dia.";
    $("#wpTxt").value=t.replace(/[ ]+$/gm,function(m){return m}) ;
  }
  v.addEventListener("change",function(e){if(e.target.id==="wpD"||e.target.id==="wpS")wpFill()});
  function openNew(d){$("#evCli").value="";$$(".svpick input",v).forEach(function(x){x.checked=false});$("#evDates").innerHTML=dateRow(d||amanha(),8);$("#evObs").value="";$("#evDur").value="2";setGar(3);$("#evModal").hidden=false;$("#evCli").focus()}
  bindPick($("#evCli"));
  v.addEventListener("click",function(e){
    var t=e.target;
    if(t.closest("[data-cv]")){st.view=t.closest("[data-cv]").dataset.cv;render();return}
    if(t.closest("#cPrev")||t.closest("#cNext")){var dir=t.closest("#cNext")?1:-1,d=st.d;
      if(st.view==="mes")st.d=new Date(d.getFullYear(),d.getMonth()+dir,1);else if(st.view==="semana")st.d=addDays(d,7*dir);else if(st.view==="dia")st.d=addDays(d,dir);else st.d=new Date(d.getFullYear()+dir,0,1);render();return}
    if(t.closest("#cToday")){st.d=new Date(TODAY);render();return}
    var evb=t.closest("[data-ev]");if(evb&&!t.closest(".modal")){card(evb.dataset.ev);if(window.innerWidth<1100)$("#sdCard").scrollIntoView({behavior:"smooth",block:"nearest"});return}
    if(t.closest("[data-back]")){side(st.sel);return}
    if(t.closest("[data-mkos]")){var ev=EVENTS.find(function(x){return x.id===st.ev}),c=CLIENTES.find(function(x){return x.nome===ev.cli});go("os");location.hash="os";if(VIEWS.os.pre)VIEWS.os.pre(c?c.id:null,ev);return}
    var cl=t.closest("[data-cli]");if(cl){CLI_SEL=+cl.dataset.cli;CLI_OPEN=true;return}
    if(t.closest("[data-del]")){var ev2=EVENTS.find(function(x){return x.id===st.ev});EVENTS.splice(EVENTS.indexOf(ev2),1);st.ev=null;render();toast("Agendamento de "+ev2.cli+" excluído.");return}
    var nd=t.closest("[data-newon]");if(nd){openNew(nd.dataset.newon);return}
    var day=t.closest("[data-day]");if(day){if(e.detail===2||day.classList.contains("hd")){var p=day.dataset.day.split("-");st.d=new Date(+p[0],+p[1]-1,+p[2]);st.view="dia";st.sel=day.dataset.day;st.ev=null;render()}else side(day.dataset.day);return}
    var ym=t.closest(".ym");if(ym){st.d=new Date(st.d.getFullYear(),+ym.dataset.m,1);st.view="mes";render();return}
    if(t.closest("[data-com]")){var evc=EVENTS.find(function(x){return x.id===st.ev});if(evc)openComunicado(evc);return}
    if(t.closest("#cNew")){openNew();return}
    if(t.closest("#cWpp")){$("#wpD").value=amanha();var hr=new Date().getHours();$("#wpS").value=hr<12?"Bom dia":hr<18?"Boa tarde":"Boa noite";wpFill();$("#wpModal").hidden=false;return}
    if(t.closest("[data-wpx]")||t===$("#wpModal")){$("#wpModal").hidden=true;return}
    if(t.closest("#wpCopy")){var ta=$("#wpTxt"),ok=function(){var b=$("#wpCopy");b.innerHTML=ic("doc",13)+" Copiado!";setTimeout(function(){b.innerHTML=ic("doc",13)+" Copiar"},1800);toast("Texto copiado. É só colar no grupo do WhatsApp.")};
      try{navigator.clipboard.writeText(ta.value).then(ok,function(){ta.select();try{document.execCommand("copy");ok()}catch(x){toast("Selecione o texto e copie com Ctrl+C.")}})}catch(x){ta.select();try{document.execCommand("copy");ok()}catch(y){toast("Selecione o texto e copie com Ctrl+C.")}}return}
    var pk=t.closest("[data-pick]");if(pk){openNew(pk.dataset.pick);return}
    if(t.closest("[data-close]")||t===$("#evModal")){$("#evModal").hidden=true;return}
    if(t.closest("#evAddD")){var rows=$$("#evDates .drow",v),lastD=rows.length?$("input",rows[rows.length-1]).value:"";$("#evDates").insertAdjacentHTML("beforeend",dateRow(lastD?ymd(addDays(new Date(lastD+"T12:00"),7)):"",8));return}
    var rm=t.closest("[data-rmd]");if(rm){if($$("#evDates .drow",v).length>1)rm.parentNode.remove();else toast("O agendamento precisa de pelo menos uma data.");return}
    var gb=t.closest("[data-gar]");if(gb){setGar(+gb.dataset.gar);return}
    if(t.closest("#evSave")){
      var cli=$("#evCli").value.trim(),svs=$$(".svpick input:checked",v).map(function(x){return x.value}),ds=$$("#evDates .drow",v).map(function(r){return {d:$("input",r).value,h:+$("select",r).value}}).filter(function(x){return x.d});
      if(!cli){toast("Informe o cliente.");$("#evCli").focus();return}
      if(!svs.length){toast("Marque pelo menos um serviço.");return}
      if(!ds.length){toast("Escolha pelo menos uma data.");return}
      var grp="g"+Date.now(),first=null;
      ds.sort(function(a,b){return a.d<b.d?-1:1}).forEach(function(x,i){var ne={id:grp+"-"+i,grp:grp,date:x.d,h:x.h,dur:+$("#evDur").value,s:svs[0],svs:svs,cli:cli,gar:st.gar,obs:$("#evObs").value.trim()};EVENTS.push(ne);if(!first)first=ne});
      $("#evModal").hidden=true;var p2=first.date.split("-");st.d=new Date(+p2[0],+p2[1]-1,+p2[2]);st.ev=first.id;render();
      toast(ds.length>1?ds.length+" datas agendadas para "+cli+".":"Agendado para "+dmy(first.date)+".");}
  });
  v.addEventListener("keydown",function(e){if(e.key==="Enter"){var li=e.target.closest(".sdl [data-ev]");if(li)card(li.dataset.ev)}});
  VIEWS.agenda.show=function(){render()};
  render();
};

/* ===== ASSISTENTE (página) ===== */
VIEWS.assist=function(v){
  v.innerHTML='<div class="chatpage"><div class="card cv"><div class="ch"><h4>Conversas</h4><button class="dots" type="button" aria-label="Nova conversa">+</button></div><ul class="ls"><li class="mut">Nenhuma conversa ainda.</li></ul></div>'
  +'<div class="card chatmain"><div class="head"><span class="orb" style="width:30px;height:30px"></span><div class="grow" style="flex:1"><b style="font-size:13px">Assistente Monte Fuji</b><div class="sub">Responde mensagens, e-mails e dúvidas · sugere datas e próximos passos</div></div><span class="pill al">Em preparação</span></div>'
  +'<div class="msgs" id="pMsgs"><div class="hello"><span class="orb"></span><b>Como posso ajudar?</b><div class="sugs" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:520px">'
  +["Melhor data para uma dedetização","Resumo da semana","Dica de prevenção para o Instagram"].map(function(s){return '<button class="chip" type="button">✦ '+s+'</button>'}).join("")+'</div></div>'
  +'</div>'
  +'<div class="composer"><textarea id="pIn" rows="2" placeholder="Pergunte qualquer coisa…" aria-label="Mensagem para o assistente"></textarea><div class="b"><span class="tg">Operação</span><span class="tg">Escolher modelo ⌄</span><span class="sp"></span><span class="c">'+ic("mic",14)+'</span><span class="c">'+ic("clip",14)+'</span><button class="cta" type="button" id="pSend">↑ Enviar</button></div></div></div>'
  +'<div class="card kb"><div class="ch"><h4>Base de conhecimento</h4></div><p class="txt">O que o assistente vai usar para responder. Você vai enviar esse material depois.</p>'
  +[["Tabela de preços por serviço","Aguardando envio"],["Procedimentos técnicos","Aguardando envio"],["Regras de garantia","Aguardando envio"],["Modelos de e-mail e WhatsApp","Aguardando envio"],["Brand Guidelines v1.2 · tom de voz","Disponível"]].map(function(k){return '<div class="doc">'+ic("doc",16)+'<span class="grow"><b>'+k[0]+'</b><small>'+k[1]+'</small></span>'+(k[1]==="Disponível"?'<span class="pill ok">ok</span>':'<span class="pill ne">—</span>')+'</div>'}).join("")
  +'<button class="ghost" type="button" data-t="No sistema final, aqui você envia PDFs, planilhas e textos.">+ Enviar documentos</button><div class="sub" style="margin-top:6px">Onde ele aparece</div><div style="display:flex;flex-wrap:wrap;gap:6px"><span class="tag">Agenda · melhores datas</span><span class="tag">E-mails · respostas</span><span class="tag">Clientes · renovações</span><span class="tag">Anotações · lembretes</span><span class="tag">Todas as telas · botão flutuante</span></div></div></div>';
  var box=$("#pMsgs");
  function send(q){AI.add("me",q.replace(/</g,"&lt;"),box);setTimeout(function(){AI.add("ai",AI.reply(q),box)},400)}
  v.addEventListener("click",function(e){var c=e.target.closest(".chip");if(c){send(c.textContent.replace("✦ ",""));return}if(e.target.closest("#pSend")){var q=$("#pIn").value.trim();if(q){send(q);$("#pIn").value=""}}});
  $("#pIn").addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();$("#pSend").click()}});
};

/* ===== ANOTAÇÕES ===== */
function isLate(t){return !t.done&&!!t.due&&t.due<TD}
VIEWS.notas=function(v){
  var COLS=[["todo","A fazer","#9D9C99"],["today","Hoje","#3872CF"],["doing","Em andamento","#B49B54"],["done","Concluído","#2F8F5B"]];
  var FIL=["Todas","Para hoje","Esta semana","Atrasadas","Sem data"],st={f:"Todas"};
  function pass(t){var f=st.f;if(f==="Todas")return true;if(f==="Para hoje")return t.due===TD||t.col==="today";if(f==="Esta semana"){var w0=addDays(TODAY,-TODAY.getDay());return !!t.due&&t.due>=ymd(w0)&&t.due<=ymd(addDays(w0,6))}if(f==="Atrasadas")return isLate(t);return !t.due}
  function dueLbl(t){if(!t.due)return ic("agenda",11)+' Definir data';var l=isLate(t),d=dmy(t.due).slice(0,5);return ic("agenda",11)+' '+(t.due===TD?"Hoje":t.due===ymd(addDays(TODAY,1))?"Amanhã":d)+(l?' · atrasada':'')}
  function render(){
    var late=TAREFAS.filter(isLate);
    v.innerHTML=(late.length?'<div class="kb-alert">'+ic("bell",16)+'<span><b>Você esqueceu?</b> '+late.length+' tarefa'+(late.length>1?'s passaram':' passou')+' do prazo: '+late.map(function(t){return t.t}).join(" · ")+'</span><span style="flex:1"></span><button class="ghost" type="button" id="moveLate">Mover para Hoje</button></div>':'')
    +'<div class="card" style="flex-direction:row;align-items:center;flex-wrap:wrap;gap:10px;padding:10px 14px"><div class="filt" role="group" aria-label="Filtro">'+FIL.map(function(f){return '<button type="button" aria-pressed="'+(st.f===f)+'">'+f+'</button>'}).join("")+'</div><span style="flex:1"></span><span class="sub">Arraste entre as colunas · clique duas vezes no título para editar</span></div>'
    +'<div class="board">'+COLS.map(function(c){var ts=TAREFAS.filter(function(t){return t.col===c[0]&&pass(t)});
      return '<div class="col" data-col="'+c[0]+'"><div class="chd"><span class="pt" style="background:'+c[2]+'"></span><b>'+c[1]+'</b><span class="n">'+ts.length+'</span></div>'
      +ts.map(function(t){var l=isLate(t);return '<div class="tk'+(t.done?' done':'')+(t.vk&&!t.done?' vk':'')+'" draggable="true" data-id="'+t.id+'"><div class="tt"><input type="checkbox" aria-label="Concluir" '+(t.done?'checked':'')+'><b>'+t.t+'</b><button class="rm" type="button" data-rm aria-label="Apagar nota" title="Apagar nota">×</button></div>'+(t.d?'<p>'+t.d+'</p>':'')+(t.msg?'<div class="vmsg"><small>Mensagem pronta para o cliente</small><p>'+t.msg+'</p><button class="cta rq" type="button" data-cpmsg>'+ic("doc",12)+' Copiar mensagem</button></div>':'')
        +'<div class="ft"><span class="duew"><button class="due'+(l?' late':'')+(t.due?'':' none')+'" type="button" data-due>'+dueLbl(t)+'</button><input type="date" tabindex="-1" aria-label="Data da nota" value="'+(t.due||"")+'"></span>'+(t.chk?'<span class="chk">☑ '+t.chk+'</span>':'')+'<span class="sp"></span><span class="who">'+t.who+'</span></div></div>'}).join("")
      +'<button class="add" type="button" data-add="'+c[0]+'">+ Adicionar cartão</button></div>'}).join("")+'</div>';
  }
  function tk(el2){return TAREFAS.find(function(x){return x.id===+el2.closest(".tk").dataset.id})}
  var dragId=null;
  v.addEventListener("dragstart",function(e){var t=e.target.closest&&e.target.closest(".tk");if(!t)return;dragId=+t.dataset.id;t.classList.add("drag");try{e.dataTransfer.setData("text/plain",String(dragId))}catch(x){}});
  v.addEventListener("dragend",function(){dragId=null;$$(".col",v).forEach(function(c){c.classList.remove("over")});$$(".tk",v).forEach(function(c){c.classList.remove("drag")})});
  v.addEventListener("dragover",function(e){var c=e.target.closest(".col");if(!c||dragId===null)return;e.preventDefault();$$(".col",v).forEach(function(x){x.classList.toggle("over",x===c)})});
  v.addEventListener("drop",function(e){var c=e.target.closest(".col");if(!c||dragId===null)return;e.preventDefault();var t=TAREFAS.find(function(x){return x.id===dragId});t.col=c.dataset.col;t.done=t.col==="done";render()});
  v.addEventListener("change",function(e){
    if(e.target.type==="checkbox"){var t=tk(e.target);t.done=e.target.checked;t.col=t.done?"done":(t.col==="done"?"today":t.col);render();if(t.done)toast("Concluída: "+t.t);return}
    if(e.target.type==="date"){var t2=tk(e.target);t2.due=e.target.value;render();toast(t2.due?"Data definida: "+dmy(t2.due)+".":"Data removida.")}
  });
  v.addEventListener("click",function(e){
    var a=e.target.closest("[data-add]");if(a){var id=nid(TAREFAS);TAREFAS.push({id:id,col:a.dataset.add,t:"Nova tarefa",d:"",due:a.dataset.add==="today"?TD:"",who:"PB",done:a.dataset.add==="done"});render();var el2=$('.tk[data-id="'+id+'"] .tt b',v);if(el2){el2.contentEditable="true";el2.focus();document.execCommand&&document.execCommand("selectAll",false,null)}return}
    if(e.target.closest("[data-cpmsg]")){var tm=tk(e.target),bt=e.target.closest("[data-cpmsg]");copyText(tm.msg,function(ok){if(ok){bt.innerHTML=ic("chk",12)+" Copiada";toast("Mensagem copiada. É só colar no WhatsApp do cliente.")}else toast("Não deu para copiar. Selecione o texto e use Ctrl+C.")});return}
    if(e.target.closest("#moveLate")){TAREFAS.forEach(function(t){if(isLate(t))t.col="today"});render();toast("Tarefas atrasadas movidas para Hoje.");return}
    if(e.target.closest("[data-rm]")){var t=tk(e.target);TAREFAS.splice(TAREFAS.indexOf(t),1);render();toast("Nota apagada: "+t.t);return}
    var du=e.target.closest("[data-due]");if(du){var inp=du.nextElementSibling;try{inp.showPicker()}catch(x){inp.classList.add("vis");inp.focus()}return}
    var f=e.target.closest(".filt button");if(f){st.f=f.textContent;render()}
  });
  VIEWS.notas.show=function(){syncVenc();render()};
  v.addEventListener("dblclick",function(e){var b=e.target.closest(".tt b");if(b){b.contentEditable="true";b.focus()}});
  v.addEventListener("focusout",function(e){var b=e.target.closest(".tt b");if(b&&b.isContentEditable){b.contentEditable="false";var t=tk(b);t.t=b.textContent.trim()||"Sem título"}});
  v.addEventListener("keydown",function(e){var b=e.target.closest(".tt b");if(b&&e.key==="Enter"){e.preventDefault();b.blur()}});
  render();
};
