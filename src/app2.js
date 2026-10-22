/* ===== ORDENS DE SERVIÇO ===== */
/* Google Drive: estado da ligação e as pastas reais dos clientes (o servidor lê do Drive) */
var GDRIVE={st:null,pastas:null,ps:null,pp:null};
function gStatus(forcar){if(forcar||!GDRIVE.ps)GDRIVE.ps=api("GET","/api/google").then(function(r){GDRIVE.st=r;return r}).catch(function(){GDRIVE.ps=null;return GDRIVE.st||{configurado:false,conectado:false}});return GDRIVE.ps}
function gPastas(forcar){if(forcar||!GDRIVE.pp)GDRIVE.pp=api("GET","/api/drive/pastas"+(forcar?"?atualizar=1":"")).then(function(r){GDRIVE.pastas=r.pastas||[];return GDRIVE.pastas}).catch(function(e){GDRIVE.pp=null;throw e});return GDRIVE.pp}
function gLigado(){return !!(GDRIVE.st&&GDRIVE.st.conectado)}
function pastaUrl(id){return "https://drive.google.com/drive/folders/"+encodeURIComponent(id)}
function pastaNome(f){return f.grupo+" / "+f.nome}
/* nome da pasta x nome do cliente: "Cond. Ed. Paesaggio Villa Lobos" casa com "Condomínio Edifício Paesaggio Villa Lobos" */
var G_ABREV={cond:"condominio",ed:"edificio",edif:"edificio",res:"residencial",resid:"residencial",ap:"apartamento",apto:"apartamento",av:"avenida"};
var G_FORA={de:1,da:1,"do":1,das:1,dos:1,e:1,ltda:1,me:1,sa:1,eireli:1};
function gTok(s){return norm(String(s||"")).replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter(Boolean).map(function(w){return G_ABREV[w]||w}).filter(function(w){return !G_FORA[w]})}
function gNota(c,f){var ft=gTok(f.nome),ct={};if(!ft.length)return 0;gTok(c.nome+" "+(c.razao||"")).forEach(function(w){ct[w]=1});return ft.filter(function(w){return ct[w]}).length/ft.length}
/* pasta sugerida: só quando uma única pasta tem todas as palavras no nome do cliente */
function gSugestao(c){if(!GDRIVE.pastas||!c)return null;var l=GDRIVE.pastas.filter(function(f){return gNota(c,f)===1});return l.length===1?l[0]:null}
/* coluna "Arquivo" das listas de OS */
function osArquivo(o){var x=o[7];if(x&&x.doc)return '<a class="ghost" href="'+esc(x.doc.url)+'" target="_blank" rel="noopener">'+ic("drive",12)+' Abrir</a>';
  if(gLigado()&&EU.papel!=="leitura")return '<button class="ghost" type="button" data-osdrive="'+esc(o[0])+'">'+ic("drive",12)+' Salvar no Drive</button>';return '<span class="mut">—</span>'}
/* salva no Drive uma OS já registrada (a pasta vem do cliente ou é escolhida agora) */
function osSalvarDrive(num,pronto){var o=OSL.find(function(x){return x[0]===num});if(!o)return;
  var c=CLIENTES.find(function(x){return x.nome===o[2]}),pid=(o[7]&&o[7].pasta&&o[7].pasta.id)||(c&&c.pastaId)||"";
  function vai(id){toast("Salvando "+num+" no Google Drive…");api("POST","/api/os/drive",{numero:num,pastaId:id}).then(function(r){return dbPoll(true).then(function(){toast(num+" salva na pasta do cliente.");if(pronto)pronto()})}).catch(function(e){toast(e.erro||"Não consegui salvar no Google Drive.")})}
  if(pid){vai(pid);return}
  openDriveModal("",function(f){if(c&&!c.pastaId){c.pastaId=f.id;c.pasta=pastaNome(f);dbSave()}vai(f.id)},c)}
var _drvCb=null,_drvCli=null;
function openDriveModal(q,cb,cliAtual){
  var m=$("#drvModal");
  if(!m){
    m=document.createElement("div");m.className="modal";m.id="drvModal";m.hidden=true;
    m.innerHTML='<div class="box" role="dialog" aria-modal="true" aria-labelledby="dvT"><div class="ch" style="margin:0"><h3 id="dvT">Escolher pasta no Google Drive</h3><span class="pill go">Monte Fuji Dedetizadora e Desentupidora</span></div>'
    +'<div class="search">'+ic("search",14)+'<input id="dvQ" placeholder="Nome do cliente ou da pasta" aria-label="Buscar pasta"></div><ul class="dvl" id="dvL"></ul>'
    +'<div class="acts"><button class="ghost" type="button" data-dvr>Atualizar lista</button><button class="ghost" type="button" data-dvx>Fechar</button></div></div>';
    document.body.appendChild(m);
    m.addEventListener("click",function(e){
      if(e.target===m||e.target.closest("[data-dvx]")){m.hidden=true;return}
      if(e.target.closest("[data-dvr]")){$("#dvL").innerHTML='<li class="mut">Atualizando…</li>';gPastas(true).then(draw,erro);return}
      var li=e.target.closest("[data-fold]");if(li){var f=(GDRIVE.pastas||[]).find(function(x){return x.id===li.dataset.fold});if(f){m.hidden=true;_drvCb&&_drvCb(f)}}
    });
    m.addEventListener("keydown",function(e){var li=e.target.closest("[data-fold]");if(li&&e.key==="Enter")li.click()});
    m.addEventListener("input",draw);
  }
  function erro(e){$("#dvL").innerHTML='<li class="mut">'+esc(e&&e.erro||"Não consegui abrir o Google Drive.")+'</li>'}
  function draw(){
    if(!GDRIVE.pastas){$("#dvL").innerHTML='<li class="mut">Carregando as pastas do Google Drive…</li>';return}
    var qq=norm($("#dvQ").value.trim()),L=GDRIVE.pastas.filter(function(f){return !qq||norm(f.nome+" "+f.grupo).indexOf(qq)>=0});
    if(_drvCli&&!qq)L=L.map(function(f){return [f,gNota(_drvCli,f)]}).sort(function(a,b){return b[1]-a[1]}).map(function(x){return x[0]});
    $("#dvL").innerHTML=L.length?L.slice(0,150).map(function(f){var c=CLIENTES.find(function(x){return x.pastaId===f.id});return '<li data-fold="'+esc(f.id)+'" tabindex="0">'+ic("drive",16)+'<span class="grow"><b>'+esc(f.nome)+'</b><small>'+esc(f.grupo)+'</small></span>'+(c?'<span class="pill ok">'+esc(c.nome)+'</span>':'')+'</li>'}).join(""):'<li class="mut">Nenhuma pasta encontrada.</li>'}
  _drvCb=cb;_drvCli=cliAtual||null;$("#dvQ").value=q||"";draw();m.hidden=false;setTimeout(function(){$("#dvQ").focus()},30);
  gStatus().then(function(st){if(!st.conectado){erro({erro:"O Google Drive não está conectado. O administrador conecta em Configurações › Integrações."});return}gPastas().then(draw,erro)});
}
VIEWS.os=function(v){
  v.innerHTML='<div class="grid">'
  +'<div class="card c3 hero"><div class="ring" aria-hidden="true"></div><div class="hh"><span>Ordens neste mês</span><button class="plus" type="button" id="osNewTop" aria-label="Nova OS">+</button></div><b class="num" id="osMes"></b><p class="hs" id="osMesS"></p></div>'
  +'<div class="card c9"><div class="ch"><h4>Como funciona</h4><span class="pill go">Google Drive · Monte Fuji Dedetizadora e Desentupidora</span></div><div class="kp" style="--n:3">'
   +'<div><span class="sq">'+ic("drive",14)+'</span><span class="t">1. Busque</span><b style="font-size:13px;white-space:normal">O cliente: a pasta dele no Drive vem junto</b></div>'
   +'<div><span class="sq">'+ic("os",14)+'</span><span class="t">2. Preencha</span><b style="font-size:13px;white-space:normal">Serviço, observações e data</b></div>'
   +'<div><span class="sq">'+ic("print",14)+'</span><span class="t">3. Gere</span><b style="font-size:13px;white-space:normal">Termo de execução salvo na pasta do cliente</b></div></div></div>'
  +'<div class="card c6"><div class="ch"><h4>Nova ordem de serviço</h4><div class="steps"><span class="on" id="stp1"><i>1</i>Cliente</span><span id="stp2"><i>2</i>Serviço</span><span><i>3</i>Gerar e salvar</span></div></div>'
   +'<div class="fld"><div class="lrow"><label for="oCli">Cliente</label><span style="display:flex;gap:12px"><button class="lnk" type="button" id="oDrvBusca">'+ic("drive",11)+' Começar pela pasta do Drive</button><button class="lnk" type="button" id="oNewCli">'+ic("plus",11)+' Novo cliente</button></span></div>'+cliPick("oCli","")+'</div>'
   +'<div class="dbox" id="oDrive"></div>'
   +'<div class="form">'
   +'<div class="fld full"><label for="oSv">Serviço a ser executado</label><textarea id="oSv" rows="2" placeholder="Ex.: desobstrução dos vasos do banheiro feminino do 13º e 23º andar e PNE do 4º"></textarea><small class="hint">Sai em letras maiúsculas na OS, como no modelo.</small></div>'
   +'<div class="fld full"><label for="oObs">Observações</label><textarea id="oObs" placeholder="Opcional. Se ficar vazio, a OS mostra “-”"></textarea></div>'
   +'<div class="fld"><label for="oD">Data</label><input id="oD" type="date" value="'+TD+'"></div></div>'
   +'<div class="drive">'+ic("drive",15)+'Arquivo: <code id="oPath"></code></div>'
   +'<div class="acts"><button class="ghost" type="button" id="oPrint">'+ic("print",13)+' Imprimir</button><button class="cta" type="button" id="oGen">Gerar OS</button></div></div>'
  +'<div class="card c6"><div class="ch"><h4>Pré-visualização</h4><span class="pill ok">Modelo Monte Fuji · Termo de execução</span></div><div class="a4wrap"><div class="a4" id="oDoc"></div></div></div>'
  +'<div class="card c12"><div class="ch"><h4>Ordens emitidas</h4><div class="r"><div class="filt" role="group" aria-label="Status"><button type="button" aria-pressed="true">Todas</button><button type="button" aria-pressed="false">Concluída</button><button type="button" aria-pressed="false">Aguardando assinatura</button><button type="button" aria-pressed="false">Cancelada</button></div></div></div><div class="scroll-x"><table class="tb" id="osTb"><thead><tr><th>Número ⇅</th><th>Cliente</th><th>Serviço</th><th>Status</th><th>Arquivo</th></tr></thead><tbody></tbody></table></div></div>'
  +'</div>';
  function cli(){var n=$("#oCli").value.trim();return CLIENTES.find(function(c){return c.nome===n})}
  function svs(){var t=$("#oSv").value.trim();return t?[t]:[]}
  var _sug=null;
  function drive(){
    var c=cli(),b=$("#oDrive");_sug=null;
    if(!c){b.className="dbox";b.innerHTML='<div class="dh">'+ic("drive",16)+'<span class="grow"><b>Cliente não encontrado</b><small>Escolha um cliente da lista ou cadastre um novo.</small></span></div>';return}
    if(GDRIVE.st&&!GDRIVE.st.conectado){b.className="dbox none";b.innerHTML='<div class="dh">'+ic("drive",16)+'<span class="grow"><b>Google Drive não conectado</b><small>'+(EU.papel==="admin"?(GDRIVE.st.configurado?'Conecte em Configurações › Integrações para as OS irem direto para a pasta do cliente.':'Falta configurar a ligação com o Google (veja o guia).'):'Peça ao administrador para conectar em Configurações › Integrações.')+' A OS é registrada mesmo assim.</small></span>'+(EU.papel==="admin"?'<a class="ghost" href="#cfg">Configurações</a>':'')+'</div>';return}
    var pid=c.pastaId,pn=c.pasta,auto=false;
    if(!pid){_sug=gSugestao(c);if(_sug){pid=_sug.id;pn=pastaNome(_sug);auto=true}}
    if(!pid){b.className="dbox none";
      if(!GDRIVE.pastas&&gLigado())gPastas().then(function(){if(cli()===c)drive()},function(){});
      b.innerHTML='<div class="dh">'+ic("drive",16)+'<span class="grow"><b>'+(GDRIVE.pastas||!gLigado()?'Pasta do cliente não encontrada':'Procurando a pasta no Drive…')+'</b><small>'+(GDRIVE.pastas?'Nenhuma pasta com o nome de '+esc(c.nome)+'. Escolha a pasta uma vez e o sistema guarda.':'Pasta de '+esc(c.nome)+' no Google Drive.')+'</small></span><button class="ghost" type="button" id="oLink">Escolher pasta</button></div>';return}
    b.className="dbox";var fs=osDoCliente(c).filter(function(o){return o[7]&&o[7].doc});
    b.innerHTML='<div class="dh">'+ic("drive",16)+'<span class="grow"><b>'+esc(pn)+'</b><small>'+(auto?'Encontrada pelo nome do cliente. Confira antes de gerar.':'Pasta do cliente no Google Drive')+' · '+fs.length+' OS salva'+(fs.length===1?'':'s')+'</small></span><a class="ghost" href="'+pastaUrl(pid)+'" target="_blank" rel="noopener">Abrir pasta ↗</a><button class="dots" type="button" id="oLink" title="Trocar pasta" aria-label="Trocar pasta">⇄</button></div>'
     +(fs.length?'<ul class="fls">'+fs.slice(0,3).map(function(o){return '<li><span class="ft os">DOC</span><span class="grow"><a href="'+esc(o[7].doc.url)+'" target="_blank" rel="noopener">'+esc(o[7].doc.nome)+'</a></span><span class="sub">'+dmy(o[1])+'</span></li>'}).join("")+'</ul>':'');
  }
  function doc(){
    var c=cli()||{nome:$("#oCli").value.trim()||"Cliente",razao:$("#oCli").value.trim()||"—",doc:"—",contato:"—",tel:"—",end:"—"},d=$("#oD").value||TD,sv=svs();
    var pp=(cli()&&cli().pastaId)?c.pasta:_sug?pastaNome(_sug):"";
    $("#oPath").textContent=nextOS()+" - Termo de execução de serviço - "+c.nome+(gLigado()?(pp?" · pasta "+pp:" · escolha a pasta"):"");
    $("#oGen").textContent=gLigado()?"Gerar OS e salvar no Drive":"Registrar OS";
    $("#stp1").className=cli()?"ok":"on";$("#stp1").firstChild.textContent=cli()?"✓":"1";$("#stp2").className=cli()?"on":"";
    var dd=new Date(d+"T12:00"),dt=dd.getDate()+" de "+MES[dd.getMonth()]+" de "+dd.getFullYear(),esc=function(x){return String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;")};
    var resp=c.contato.split("(")[0].trim(),obs=$("#oObs").value.trim();
    $("#oDoc").innerHTML='<div class="tes"><img class="lg" alt="Monte Fuji Desentupidora e Dedetizadora" src="'+LOGO+'"><h1>Termo de execução de serviço</h1>'
    +'<table><colgroup><col style="width:22%"><col style="width:31%"><col></colgroup><tr><th colspan="3">1. Identificação do local tratado</th></tr><tr><td class="k">Nome:</td><td colspan="2">'+esc(c.nome)+'</td></tr><tr><td class="k">CPF/CNPJ:</td><td colspan="2">'+esc(c.doc)+'</td></tr><tr><td class="k">Endereço:</td><td colspan="2">'+esc(c.end.replace(" · ",", "))+'</td></tr><tr><td class="k">Responsável 1:</td><td>'+esc(resp)+'</td><td><span class="k">Celular/Tel:</span> '+esc(c.tel)+'</td></tr></table>'
    +'<table class="b2"><tr><th>2. Serviços a serem executados</th></tr></table><p class="sv">'+(sv.length?esc(sv[0]).toUpperCase():'<span class="ph">DESCREVA O SERVIÇO NO FORMULÁRIO</span>')+'</p>'
    +'<h2>Observações</h2><p class="ob">'+(obs?esc(obs).replace(/\n/g,"<br>"):"-")+'</p>'
    +'<p class="dec">A Monte Fuji Desentupidora e Dedetizadora vem por meio desta declarar que executou o(s) serviço(s) acima citado(s) no(s) Cliente(s)/endereço(s) informado(s), utilizando produto(s), equipamento(s) e técnica(s) adequada(s), garantindo a qualidade, segurança e eficácia na realização do(s) procedimento(s).</p><div class="ln"></div><div class="ln"></div><div class="ln"></div>'
    +'<table class="em"><colgroup><col style="width:22%"><col style="width:31%"><col></colgroup><tr><th colspan="3">3. Em caso de emergência, contatar:</th></tr><tr><td class="k">Bombeiros:</td><td colspan="2">193</td></tr><tr><td class="k">Samu:</td><td colspan="2">192</td></tr><tr><td class="k">Monte Fuji:</td><td colspan="2">(11) 9 9742-0106</td></tr></table>'
    +'<p class="dt">'+dt+'</p>'
    +'<div class="sg"><div><b>Responsável Técnico</b><div class="ass">assinatura digitalizada</div><span>Biólogo Tarcísio George - CRBio 94338/01-D</span></div><div><b>Assinatura do responsável pelo acompanhamento</b><div class="ass e"></div><span>Início ________ &nbsp;Término ________</span></div></div>'
    +'<div class="ft2">Monte Fuji DDT e DS | CNPJ: 05.889.593/0001-02 | R. Anhanguera, 549 - Piratininga, Osasco/SP | (11) 9 9742-0106 | (11) 3609-5222</div></div>';
  }
  function upd(){drive();doc()}
  function printOS(){if(!cli()){toast("Escolha um cliente cadastrado.");return}var w=window.open("","_blank");if(!w){toast("Libere as janelas pop-up para imprimir.");return}
    var css=Array.prototype.map.call(document.querySelectorAll("style"),function(x){return x.textContent}).join("\n");
    w.document.write('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>'+nextOS()+'</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@300;400;500;600;700&display=swap"><style>'+css+' body{background:#fff;margin:0;padding:0}.a4{max-width:none;box-shadow:none;border:0;margin:0 auto;width:190mm}@page{size:A4;margin:10mm}</style></head><body><div class="a4">'+$("#oDoc").innerHTML+'</div><script>setTimeout(function(){print()},500)<\/script></body></html>');w.document.close()}
  function table(f){
    var mk=TD.slice(0,7),om=OSL.filter(function(o){return String(o[1]).slice(0,7)===mk});$("#osMes").innerHTML=om.length+'<small>OS</small>';$("#osMesS").textContent=MES[TODAY.getMonth()]+" · "+OSL.length+" no total";
    $("#osTb tbody").innerHTML=OSL.filter(function(o){return !f||f==="Todas"||o[6]===f}).map(function(o){return '<tr><td><b>'+o[0]+'</b><small>'+dmy(o[1])+'</small></td><td>'+o[2]+'</td><td>'+o[3]+'</td><td>'+stPill(o[6])+'</td><td>'+osArquivo(o)+'</td></tr>'}).join("")||'<tr><td colspan="5" class="mut">Nenhuma ordem de serviço emitida ainda.</td></tr>';
  }
  /* começou pela pasta: acha o cliente dono dela, ou liga a pasta ao cliente escolhido */
  function pickFolder(f){
    var c=CLIENTES.find(function(x){return x.pastaId===f.id})||CLIENTES.filter(function(x){return !x.pastaId&&gNota(x,f)===1})[0];
    if(c){if(!c.pastaId){c.pastaId=f.id;c.pasta=pastaNome(f);dbSave()}$("#oCli").value=c.nome;upd();toast("Pasta de "+c.nome+" selecionada.");return}
    var cur=cli();
    if(cur&&!cur.pastaId){linkFolder(cur,f);return}
    openCliModal(f.nome,function(nc){nc.pastaId=f.id;nc.pasta=pastaNome(f);dbSave();$("#oCli").value=nc.nome;upd()});toast("Esta pasta ainda não tem cliente no sistema. Complete o cadastro.");
  }
  function linkFolder(c,f){var dono=CLIENTES.find(function(x){return x.pastaId===f.id&&x!==c});if(dono){toast("Essa pasta já é de "+dono.nome+".");return}
    c.pastaId=f.id;c.pasta=pastaNome(f);dbSave();upd();toast("Pasta “"+f.nome+"” ligada a "+c.nome+".")}
  function gerar(){var c=cli();if(!c){toast("Escolha um cliente cadastrado.");return}if(!svs().length){toast("Descreva o serviço a ser executado.");$("#oSv").focus();return}
    var pid=c.pastaId||(_sug&&_sug.id)||"",f=_sug;
    if(gLigado()&&!pid){toast("Escolha a pasta do cliente no Google Drive.");openDriveModal("",function(x){linkFolder(c,x);gerar()},c);return}
    var bt=$("#oGen");bt.disabled=true;bt.textContent=gLigado()?"Salvando no Drive…":"Registrando…";
    api("POST","/api/os",{cli:c.id,servico:svs()[0],obs:$("#oObs").value.trim(),data:$("#oD").value||TD,pastaId:pid,drive:gLigado()}).then(function(r){
      if(!c.pastaId&&f&&r.pasta&&r.pasta.id===f.id){c.pastaId=f.id;c.pasta=pastaNome(f);dbSave()}
      return dbPoll(true).then(function(){$("#oSv").value="";$("#oObs").value="";table();upd();
        toast(r.doc?r.numero+" salva na pasta do cliente no Drive.":r.numero+" registrada."+(r.aviso?" "+r.aviso:""))});
    }).catch(function(e){toast(e.erro||"Não consegui registrar a OS. Tente de novo.")}).then(function(){bt.disabled=false;doc()});
  }
  v.addEventListener("input",function(e){if(e.target.closest(".form")||e.target.id==="oCli")upd()});
  v.addEventListener("change",function(e){if(e.target.closest(".form"))doc()});
  v.addEventListener("click",function(e){
    if(e.target.closest("#oPrint")){printOS();return}
    if(e.target.closest("#osNewTop")){$("#oCli").focus();return}
    if(e.target.closest("#oDrvBusca")){openDriveModal("",pickFolder);return}
    if(e.target.closest("#oLink")){var c0=cli();if(c0)openDriveModal("",function(f){linkFolder(c0,f)},c0);return}
    var od=e.target.closest("[data-osdrive]");if(od){osSalvarDrive(od.dataset.osdrive,function(){table();upd()});return}
    if(e.target.closest("#oNewCli")){var t=$("#oCli").value.trim();openCliModal(t&&!cli()?t:"",function(c){$("#oCli").value=c.nome;upd()});return}
    if(e.target.closest("#oGen")){gerar();return}
    var f=e.target.closest(".filt button");if(f){$$(".filt button",v).forEach(function(b){b.setAttribute("aria-pressed",b===f?"true":"false")});table(f.textContent)}
  });
  VIEWS.os.pre=function(id,ev){var c=CLIENTES.find(function(x){return x.id===id});if(c)$("#oCli").value=c.nome;else if(ev)$("#oCli").value=ev.cli;
    if(ev){$("#oSv").value=(ev.svs||[ev.s]).join(" e ");$("#oD").value=ev.date;$("#oObs").value=ev.obs||"";toast("OS preenchida com os dados do agendamento.")}upd()};
  bindPick($("#oCli"),function(){upd()});
  table();upd();
  gStatus().then(function(){if(gLigado())gPastas().then(upd,function(){});upd();table()});
  VIEWS.os.show=function(){table();upd()};
};

/* ===== E-MAILS ===== */
VIEWS.mail=function(v){
  var st={f:"responder",id:null,cx:"todas"};
  var CX=[["todas","Todas as caixas","3 contas","#9D9C99"],["atendimento","Atendimento","atendimento@mfuji.com.br","#3872CF"],["financeiro","Financeiro","financeiro@mfuji.com.br","#B49B54"],["comercial","Comercial","comercial@mfuji.com.br","#253C8D"]];
  function inCx(m){return st.cx==="todas"||m.cx===st.cx}
  function cxOf(k){return CX.find(function(c){return c[0]===k})}
  var FOLD=[["inbox","Caixa de entrada"],["responder","A responder"],["pendente","Aguardando retorno"],["sent","Enviados"]];
  function list(){return EMAILS.filter(inCx).filter(function(m){return st.f==="inbox"?m.f==="inbox":st.f==="sent"?m.f==="sent":m.st===st.f})}
  function count(k){return EMAILS.filter(inCx).filter(function(m){return k==="inbox"?m.f==="inbox":k==="sent"?m.f==="sent":m.st===k}).length}
  function render(){
    var L=list();if(!L.find(function(m){return m.id===st.id}))st.id=L.length?L[0].id:null;
    var m=EMAILS.find(function(x){return x.id===st.id});
    v.innerHTML='<div class="mbox" role="tablist" aria-label="Caixas de e-mail">'+CX.map(function(c){var src=EMAILS.filter(function(m){return c[0]==="todas"||m.cx===c[0]}),n=src.filter(function(m){return m.st==="responder"}).length,u=src.filter(function(m){return m.unread}).length;
      return '<button type="button" role="tab" aria-selected="'+(st.cx===c[0])+'" data-cx="'+c[0]+'"><span class="dot" style="background:'+c[3]+'"></span><span class="grow"><b>'+c[1]+'</b><small>'+c[2]+'</small></span>'+(n?'<span class="pill er">'+n+' a responder</span>':'<span class="pill ok">em dia</span>')+(u?'<span class="nu" title="Não lidos">'+u+'</span>':'')+'</button>'}).join("")+'</div>'
    +'<div class="mail"><div class="card fold"><button class="cta" type="button" data-t="No sistema final, abre a escrita de um novo e-mail pelo Gmail.">'+ic("plus",13)+'Escrever</button><ul class="ls">'
    +FOLD.map(function(f){return '<li data-f="'+f[0]+'" class="'+(st.f===f[0]?"on":"")+'">'+f[1]+'<span class="n pill '+(f[0]==="responder"?"er":f[0]==="pendente"?"al":"ne")+'">'+count(f[0])+'</span></li>'}).join("")
    +'</ul><div class="intg" style="margin-top:auto"><span class="lg2" style="background:#C2413A">M</span><span class="grow"><b>Gmail</b><small>'+(st.cx==="todas"?"3 caixas":cxOf(st.cx)[2])+' · não conectado</small></span></div></div>'
    +'<div class="card mlist"><div class="search" style="flex:none">'+ic("search",14)+'<input placeholder="Buscar e-mails" aria-label="Buscar e-mails"></div>'
    +(L.length?L.map(function(x){return '<div class="it'+(x.id===st.id?' on':'')+(x.unread?' unread':'')+'" data-id="'+x.id+'"><div class="r1"><b>'+x.de+'</b><span class="sub">'+x.hora+'</span></div>'+(st.cx==="todas"?'<span class="cxt" style="--c:'+cxOf(x.cx)[3]+'">'+cxOf(x.cx)[1]+'</span>':'')+'<span class="s">'+x.ass+'</span><span class="p">'+x.body.split("\n").filter(Boolean)[0]+'</span>'+(x.st==="responder"?'<span><span class="pill er">A responder</span></span>':x.st==="pendente"?'<span><span class="pill al">Aguardando cliente</span></span>':'')+'</div>'}).join(""):'<p class="mut" style="padding:12px">'+(EMAILS.length?'Nada por aqui.':'As caixas do Gmail ainda não foram conectadas. Os e-mails aparecem aqui depois da integração.')+'</p>')+'</div>'
    +'<div class="card mread">'+(m?'<div class="meta"><span class="av" style="width:38px;height:38px;background:var(--hidra-50);color:var(--fluxo)">'+m.de.replace("Para: ","").split(" ").map(function(x){return x[0]}).join("").slice(0,2)+'</span><div class="grow"><b style="font-size:12.5px">'+m.de+'</b><div class="sub">'+m.em+' · '+m.data+' · '+(m.f==="sent"?"de ":"para ")+cxOf(m.cx)[2]+'</div></div>'+(m.cli?'<a class="ghost" href="#cli" data-cli="'+m.cli+'">Ver cliente</a>':'')+'<button class="ghost" type="button" data-t="Respondido pelo Gmail (protótipo).">'+ic("reply",13)+' Responder</button></div><h3>'+m.ass+'</h3><div class="body">'+m.body+'</div>'
      +(m.sug?'<div class="aisug" style="flex-direction:column"><div style="display:flex;gap:10px;align-items:center"><span class="orb" style="width:26px;height:26px"></span><b style="font-size:11px;color:var(--fluxo)">Resposta sugerida pelo assistente</b></div><div class="body" style="font-size:13px;background:var(--branco);border-radius:10px;padding:10px;width:100%">'+m.sug+'</div><div class="acts" style="justify-content:flex-start"><button class="cta rq" type="button" id="useSug">Usar e enviar</button><button class="ghost" type="button" data-t="Tom ajustado (protótipo).">Ajustar tom</button>'+(m.ag?'<a class="ghost" href="#agenda">Ver datas na agenda</a>':'')+'</div></div>':'')
      :'<p class="mut">Selecione um e-mail.</p>')+'</div></div>';
  }
  v.addEventListener("click",function(e){
    var cx=e.target.closest("[data-cx]");if(cx){st.cx=cx.dataset.cx;render();return}
    var f=e.target.closest("[data-f]");if(f){st.f=f.dataset.f;render();return}
    var it=e.target.closest(".it");if(it){st.id=+it.dataset.id;var m=EMAILS.find(function(x){return x.id===st.id});m.unread=false;render();return}
    if(e.target.closest("#useSug")){var m2=EMAILS.find(function(x){return x.id===st.id});m2.st="enviado";m2.f="sent";m2.de="Para: "+m2.de;m2.body=m2.sug;m2.sug="";toast("Resposta enviada (protótipo). Movida para Enviados.");render();return}
    var c=e.target.closest("[data-cli]");if(c){CLI_SEL=+c.dataset.cli;CLI_OPEN=true}
  });
  render();
};

/* ===== CLIENTES ===== */
var CLI_SEL=0,CLI_OPEN=false;
function garInfo(g){var fim=ymd(addDays(new Date(g[1]+"T12:00"),g[2])),left=diffDays(fim,TD);return {fim:fim,left:left,pct:Math.max(0,Math.min(100,100-left/g[2]*100))}}
function garTxtDias(n){return n>=365?Math.round(n/365)*12+" meses":n>=30?Math.round(n/30)+(Math.round(n/30)===1?" mês":" meses"):n+" dias"}
function proxVisita(c){return EVENTS.filter(function(e){return e.cli===c.nome&&e.date>=TD}).sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:a.h-b.h})}
function finSit(c){var p=pagamentos(c),ab=p.filter(function(x){return x[3]!=="Pago"});return {lista:p,aberto:ab.reduce(function(s,x){return s+x[2]},0),venc:ab.some(function(x){return x[3]==="Vencido"}),n:ab.length}}
VIEWS.cli=function(v){
  var st={p:"Todos",q:""};
  function list(){
    var gi=CLIENTES.map(function(c){return garOf(c).map(garInfo).filter(function(x){return x.left>=0})}),vig=gi.filter(function(a){return a.length}).length,v30=gi.filter(function(a){return a.some(function(x){return x.left<=30})}).length;
    var lim=ymd(addDays(TODAY,-182)),semv=CLIENTES.filter(function(c){var h=histOf(c)[0];return h&&h[0]<lim}).length;
    v.innerHTML='<div class="grid">'
    +'<div class="card c12" style="padding:12px"><div class="kp" style="--n:4">'
     +'<div><span class="sq">'+ic("cli",14)+'</span><span class="t">Clientes cadastrados</span><b class="num">'+CLIENTES.length+'</b><span class="pill ne">'+CLIENTES.filter(function(c){return c.perfil==="Condomínio"}).length+' condomínios</span></div>'
     +'<div><span class="sq">'+ic("shield",14)+'</span><span class="t">Com garantia vigente</span><b class="num">'+vig+'</b><span class="pill go">LEGADO</span></div>'
     +'<div><span class="sq">'+ic("clock",14)+'</span><span class="t">Garantias vencendo em 30 dias</span><b class="num">'+v30+'</b><span class="pill al">Oportunidade de renovação</span></div>'
     +'<div><span class="sq">'+ic("agenda",14)+'</span><span class="t">Sem visita há 6+ meses</span><b class="num">'+semv+'</b><span class="pill er">Reativar</span></div></div></div>'
    +'<div class="card c12"><div class="ch"><h4>Cadastro de clientes</h4><div class="r"><span class="srcs"><span>Drive</span><span>Agenda</span><span>Conta Azul</span><span>Gmail</span></span><button class="ghost" type="button" data-impcli>'+ic("up",13)+'Importar do Conta Azul</button><button class="cta" type="button" data-newcli>'+ic("plus",13)+'Novo cliente</button></div></div>'
     +'<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><div class="search" style="flex:1 1 260px">'+ic("search",14)+'<input id="cQ" placeholder="Nome, razão social ou CNPJ" aria-label="Buscar clientes" value="'+st.q.replace(/"/g,"&quot;")+'"></div><div class="filt" role="group" aria-label="Perfil">'+["Todos","Residência","Comércio","Condomínio","Construtora"].map(function(p){return '<button type="button" aria-pressed="'+(st.p===p)+'">'+p+'</button>'}).join("")+'</div></div>'
     +'<div class="scroll-x"><table class="tb" id="cTb"><thead><tr><th>Cliente</th><th>CNPJ / CPF</th><th>Último serviço</th><th>Garantia</th><th>Próxima visita</th><th>Financeiro</th><th></th></tr></thead><tbody></tbody></table></div><p class="sub">Clique num cliente para abrir a ficha completa. Último serviço, garantias e próximas visitas vêm da agenda.</p></div></div>';
    table();
    $("#cQ").addEventListener("input",function(e){st.q=e.target.value;table()});
  }
  function table(){
    if(!$("#cTb"))return;
    var q=norm(st.q.trim()),qd=digits(q);
    $("#cTb tbody").innerHTML=CLIENTES.filter(function(c){return (st.p==="Todos"||c.perfil===st.p)&&(!q||norm(c.nome+" "+c.doc+" "+c.contato+" "+c.razao).indexOf(q)>=0||(qd.length>=4&&digits(c.doc).indexOf(qd)>=0))}).map(function(c){
      var g=garOf(c).map(garInfo).sort(function(a,b){return a.left-b.left})[0],h=histOf(c)[0],pv=proxVisita(c)[0],f=finSit(c);
      return '<tr class="cl" data-id="'+c.id+'"><td><b>'+c.nome+'</b><small>'+c.contato+'</small></td><td class="num">'+c.doc+'</td>'
      +'<td>'+(h?'<b>'+(SERV[h[1]]?SERV[h[1]].sh:h[1])+'</b><small>'+dmy(h[0])+'</small>':'<span class="mut">Sem serviços</span>')+'</td>'
      +'<td>'+(!g?'<span class="pill ne">—</span>':g.left<0?'<span class="pill ne">Encerrada</span>':g.left<=30?'<span class="pill al">'+g.left+' dias</span>':'<span class="pill go">até '+dmy(g.fim)+'</span>')+'</td>'
      +'<td>'+(pv?'<b>'+dmy(pv.date).slice(0,5)+'</b><small>'+svShort(pv)+'</small>':'<span class="mut">—</span>')+'</td>'
      +'<td>'+(!f.lista.length?'<span class="pill ne">—</span>':f.n?'<span class="pill '+(f.venc?'er':'al')+'">'+brl(f.aberto)+(f.venc?' vencido':' em aberto')+'</span>':'<span class="pill ok">Em dia</span>')+'</td><td class="r"><span class="chev">›</span></td></tr>'}).join("")||'<tr><td colspan="7" class="mut">'+(CLIENTES.length?'Nenhum cliente encontrado.':'Nenhum cliente cadastrado ainda. <button class="lnk" type="button" data-impcli>Importe a planilha do Conta Azul</button> ou clique em Novo cliente e digite o CNPJ.')+(qd.length===14?' <button class="lnk" type="button" data-newcli>Buscar este CNPJ e cadastrar</button>':'')+'</td></tr>';
  }
  function prof(){
    var c=CLIENTES.find(function(x){return x.id===CLI_SEL});if(!c){CLI_OPEN=false;return list()}
    var os=osDoCliente(c),pv=proxVisita(c),f=finSit(c),em=EMAILS.filter(function(m){return m.cli===c.id}),fs=os.filter(function(o){return o[7]&&o[7].doc}),h=histOf(c)[0];
    var gs=garOf(c).map(function(g){return [g,garInfo(g)]}).sort(function(a,b){return a[1].left-b[1].left}),gv=gs.filter(function(x){return x[1].left>=0});
    var ini=c.nome.split(" ").filter(function(w){return w.length>2}).map(function(w){return w[0]}).join("").slice(0,2);
    v.innerHTML='<div class="grid">'
    +'<div class="card c12 phead"><div class="prof"><button class="ghost" type="button" data-cback>‹ Clientes</button><span class="bigav">'+ini+'</span><div style="flex:1;min-width:0"><h3>'+c.nome+'</h3><span class="sub">'+c.razao+' · '+c.doc+'</span><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:5px"><span class="tag">'+c.perfil+'</span>'+(gv.length?'<span class="pill go">Garantia vigente</span>':'')+(f.n?'<span class="pill '+(f.venc?'er':'al')+'">'+(f.venc?'Inadimplente':'Fatura em aberto')+'</span>':f.lista.length?'<span class="pill ok">Pagamentos em dia</span>':'')+'</div></div>'
     +'<div class="pacts"><button class="ghost" type="button" data-agd>'+ic("agenda",13)+' Agendar</button><button class="ghost" type="button" data-mail>'+ic("mail",13)+' E-mail</button><button class="cta" type="button" data-newos="'+c.id+'">'+ic("plus",13)+'Nova OS</button></div></div></div>'
    +'<div class="card c12" style="padding:12px"><div class="kp" style="--n:4">'
     +'<div><span class="sq">'+ic("os",14)+'</span><span class="t">Último serviço</span><b class="num" style="font-size:15px">'+(h?(SERV[h[1]]?SERV[h[1]].sh:h[1]):"—")+'</b><span class="pill ne">'+(h?dmy(h[0]):'Sem serviços')+'</span></div>'
     +'<div><span class="sq">'+ic("shield",14)+'</span><span class="t">Garantia</span><b class="num" style="font-size:15px">'+(gv.length?'até '+dmy(gv[0][1].fim):'Nenhuma vigente')+'</b><span class="pill '+(gv.length?(gv[0][1].left<=30?'al':'go'):'ne')+'">'+(gv.length?'faltam '+gv[0][1].left+' dias':'—')+'</span></div>'
     +'<div><span class="sq">'+ic("agenda",14)+'</span><span class="t">Próxima visita</span><b class="num" style="font-size:15px">'+(pv[0]?DIA3[new Date(pv[0].date+"T12:00").getDay()]+', '+dmy(pv[0].date).slice(0,5)+' · '+hh(pv[0].h):'Nada agendado')+'</b><span class="pill in">'+(pv[0]?svShort(pv[0]):'Agenda')+'</span></div>'
     +'<div><span class="sq">'+ic("fat",14)+'</span><span class="t">Em aberto</span><b class="num" style="font-size:15px">'+(f.n?brl(f.aberto):'R$ 0,00')+'</b><span class="pill '+(f.n?(f.venc?'er':'al'):'ok')+'">'+(f.n?f.n+' fatura'+(f.n>1?'s':''):'Em dia')+' · Conta Azul</span></div></div></div>'
    +'<div class="c8" style="display:flex;flex-direction:column;gap:10px">'
     +'<div class="card"><div class="ch"><h4>Ordens de serviço</h4><div class="r"><span class="src">Sistema · Drive</span><button class="ghost" type="button" data-newos="'+c.id+'">+ Nova OS</button></div></div>'
      +(os.length?'<div class="scroll-x"><table class="tb"><thead><tr><th>Número</th><th>Serviço</th><th>Status</th><th>Arquivo</th></tr></thead><tbody>'+os.slice(0,6).map(function(o){return '<tr><td><b>'+o[0]+'</b><small>'+dmy(o[1])+'</small></td><td>'+o[3]+'</td><td>'+stPill(o[6])+'</td><td>'+osArquivo(o)+'</td></tr>'}).join("")+'</tbody></table></div>':'<p class="mut txt">Nenhuma OS emitida ainda.</p>')+'</div>'
     +'<div class="card"><div class="ch"><h4>Pagamentos</h4><span class="src">Conta Azul</span></div>'
      +(f.lista.length?'<div class="scroll-x"><table class="tb"><thead><tr><th>Vencimento</th><th>Descrição</th><th>Forma</th><th class="r">Valor</th><th>Status</th></tr></thead><tbody>'+f.lista.map(function(p){return '<tr><td class="num">'+dmy(p[0])+'</td><td>'+p[1]+'</td><td>'+p[4]+'</td><td class="r num">'+brl(p[2])+'</td><td><span class="pill '+(p[3]==="Pago"?'ok':p[3]==="Vencido"?'er':'al')+'">'+p[3]+'</span></td></tr>'}).join("")+'</tbody></table></div>':'<p class="mut txt">A Conta Azul ainda não foi conectada. Os pagamentos deste cliente aparecem aqui depois da integração.</p>')+'</div>'
     +'<div class="card"><div class="ch"><h4>E-mails</h4><span class="src">Gmail · 3 caixas</span></div><ul class="ls">'
      +(em.length?em.map(function(m){return '<li data-em="'+m.id+'" class="lk"><span class="sq">'+ic(m.f==="sent"?"reply":"mail",13)+'</span><span class="grow"><b>'+m.ass+'</b><small>'+(m.f==="sent"?"Enviado · ":"Recebido · ")+m.data+' · '+m.cx+'@</small></span>'+(m.st==="responder"?'<span class="pill er">A responder</span>':m.st==="pendente"?'<span class="pill al">Aguardando</span>':'')+'</li>'}).join(""):'<li class="mut">Nenhum e-mail com este cliente.</li>')+'</ul></div>'
    +'</div>'
    +'<div class="c4" style="display:flex;flex-direction:column;gap:10px">'
     +'<div class="card"><div class="ch"><h4>Cadastro</h4><button class="ghost" type="button" data-cedit>Editar</button></div><div class="kv2 one"><div><small>Razão social</small><span>'+c.razao+'</span></div><div><small>CNPJ / CPF</small><span>'+c.doc+'</span></div><div><small>Contato</small><span>'+c.contato+' · '+c.tel+'</span></div><div><small>E-mail</small><span>'+c.email+'</span></div><div><small>Endereço</small><span>'+c.end+'</span></div></div></div>'
     +'<div class="card"><div class="ch"><h4>Garantias</h4></div>'+(gs.length?gs.map(function(x){var g=x[0],i=x[1];return '<div style="display:grid;gap:5px"><div style="display:flex;justify-content:space-between;gap:8px;font-size:12px"><b style="font-weight:600">'+(SERV[g[0]]?SERV[g[0]].sh:g[0])+' · '+garTxtDias(g[2])+'</b><span class="'+(i.left<0?'mut':'')+'" style="white-space:nowrap">'+(i.left<0?'Encerrada '+dmy(i.fim).slice(0,5):'até '+dmy(i.fim))+'</span></div><div class="gbar"><i style="width:'+i.pct+'%;'+(i.left<0?'background:#CAC9C5':i.left<=30?'background:var(--alerta)':'')+'"></i></div></div>'}).join(""):'<p class="mut txt">Nenhuma garantia registrada.</p>')+'</div>'
     +'<div class="card"><div class="ch"><h4>Agenda</h4><a class="ghost" href="#agenda">Abrir</a></div><ul class="ls">'+(pv.length?pv.slice(0,4).map(function(e){return '<li><span class="tm">'+dmy(e.date).slice(0,5)+'</span><span class="bar-t" style="background:'+SERV[e.s].c+'"></span><span class="grow"><b>'+svShort(e)+'</b><small>'+hh(e.h)+' · '+garTxt(e.gar)+'</small></span></li>'}).join(""):'<li class="mut">Nenhuma visita agendada.</li>')+'</ul></div>'
     +'<div class="card"><div class="ch"><h4>Pasta no Drive</h4>'+(c.pastaId?'<a class="ghost" href="'+pastaUrl(c.pastaId)+'" target="_blank" rel="noopener">Abrir ↗</a>':'<span class="src">Google Drive</span>')+'</div>'+(c.pastaId?'<div class="drive" style="margin:0">'+ic("drive",15)+'<code>'+esc(c.pasta)+'</code><button class="dots" type="button" data-clink title="Trocar pasta" aria-label="Trocar pasta">⇄</button></div><ul class="fls">'+fs.slice(0,5).map(function(o){return '<li><span class="ft os">DOC</span><span class="grow"><a href="'+esc(o[7].doc.url)+'" target="_blank" rel="noopener">'+esc(o[7].doc.nome)+'</a></span><span class="sub">'+dmy(o[1]).slice(0,5)+'</span></li>'}).join("")+'</ul>':'<p class="mut txt">Nenhuma pasta ligada. Ao gerar a primeira OS, o sistema procura a pasta pelo nome.</p><button class="ghost" type="button" data-clink>Escolher pasta do Drive</button>')+'</div>'
     +aiBox(nextTip(c),'Escrever e-mail','data-mail')
    +'</div></div>';
    window.scrollTo(0,0);
  }
  function nextTip(c){if(!garOf(c).length)return 'Cliente novo. Que tal agendar a primeira visita e já registrar a garantia?';var g=garOf(c).map(function(x){return [x[0],garInfo(x)]}).sort(function(a,b){return a[1].left-b[1].left})[0],f=finSit(c);
    return (f.venc?'Há <b>'+brl(f.aberto)+'</b> em aberto na Conta Azul, parte já vencida. Vale cobrar antes de agendar o próximo serviço. ':'')+(g[1].left<0?'A garantia de <b>'+g[0].toLowerCase()+'</b> terminou em '+dmy(g[1].fim)+'. Bom momento para oferecer uma nova visita preventiva.':'Próxima visita recomendada: <b>'+g[0].toLowerCase()+'</b> antes de '+dmy(g[1].fim)+', quando a garantia termina.')}
  function render(){if(CLI_OPEN)prof();else list()}
  v.addEventListener("click",function(e){
    var r=e.target.closest("tr.cl");if(r){CLI_SEL=+r.dataset.id;CLI_OPEN=true;prof();return}
    if(e.target.closest("[data-cback]")){CLI_OPEN=false;list();return}
    if(e.target.closest("[data-cedit]")){var ce=CLIENTES.find(function(x){return x.id===CLI_SEL});if(ce)editCli(ce,function(c){if(!c)CLI_OPEN=false;render()});return}
    var f=e.target.closest(".filt button");if(f){$$(".filt button",v).forEach(function(b){b.setAttribute("aria-pressed",b===f?"true":"false")});st.p=f.textContent;table();return}
    if(e.target.closest("[data-impcli]")){openImpModal(function(){CLI_OPEN=false;list()});return}
    if(e.target.closest("[data-newcli]")){openCliModal(digits(st.q).length===14?st.q:"",function(c){CLI_SEL=c.id;CLI_OPEN=true;prof()});return}
    if(e.target.closest("[data-clink]")){var c=CLIENTES.find(function(x){return x.id===CLI_SEL});openDriveModal("",function(fd){var dono=CLIENTES.find(function(x){return x.pastaId===fd.id&&x!==c});if(dono){toast("Essa pasta já é de "+dono.nome+".");return}c.pastaId=fd.id;c.pasta=pastaNome(fd);dbSave();prof();toast("Pasta ligada a "+c.nome+".")},c);return}
    var od=e.target.closest("[data-osdrive]");if(od){osSalvarDrive(od.dataset.osdrive,prof);return}
    var n=e.target.closest("[data-newos]");if(n){location.hash="#os";setTimeout(function(){VIEWS.os.pre&&VIEWS.os.pre(+n.dataset.newos)},30);return}
    if(e.target.closest("[data-agd]")){location.hash="#agenda";return}
    var em=e.target.closest("[data-em]");if(em||e.target.closest("[data-mail]")){location.hash="#mail";return}
  });
  document.addEventListener("click",function(e){if(e.target.closest('.menu a[data-v="cli"],[data-go="cli"]'))CLI_OPEN=false},true);
  VIEWS.cli.show=function(){render()};VIEWS.cli.refresh=function(){if(!CLI_OPEN)table()};
  render();
};

/* ===== A RECEBER ===== */
var REC_SEL=0;
VIEWS.rec=function(v){
  var st={f:"Em aberto",q:""};
  var FIL=["Em aberto","Vencidos","Cobrança pendente","NF a emitir","Recebidos","Todos"];
  function pass(r){var s=recSt(r)[1];if(st.f==="Todos")return true;if(st.f==="Em aberto")return !r.pago;if(st.f==="Vencidos")return s==="Vencido";if(st.f==="Recebidos")return !!r.pago;return s===st.f}
  function aberto(){return RECEBER.filter(function(r){return !r.pago})}
  v.innerHTML='<div class="grid">'
  +'<div class="card c3 hero"><div class="ring" aria-hidden="true"></div><div class="hh"><span>Total a receber</span><button class="plus" type="button" data-rnew aria-label="Novo lançamento">+</button></div><b class="num" id="rTot"></b><p class="hs" id="rTotS"></p><div class="ha"><button class="w" type="button" data-rnew style="white-space:nowrap">+ Novo</button></div></div>'
  +'<div class="card c9"><div class="ch"><h4>Clientes avulsos</h4><span class="sub">Serviços sem contrato, cobrados um a um</span></div><div class="kp" style="--n:4" id="rKp"></div></div>'
  +'<div class="split c12"><div class="card"><div class="ch"><h4>Cobranças</h4><button class="cta" type="button" data-rnew>'+ic("plus",13)+'Novo lançamento</button></div>'
   +'<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><div class="search" style="flex:1 1 220px">'+ic("search",14)+'<input id="rQ" placeholder="Cliente, CNPJ, nota fiscal ou OS" aria-label="Buscar cobranças"></div></div>'
   +'<div class="filt" role="group" aria-label="Situação" id="rFil"></div>'
   +'<div class="scroll-x"><table class="tb" id="rTb"><thead><tr><th>Cliente</th><th>Nota fiscal</th><th>Cobrança enviada</th><th>Vencimento</th><th class="r">Valor</th><th>Situação</th></tr></thead><tbody></tbody></table></div></div>'
   +'<div class="card" id="rDet"></div></div></div>'
  +'<div class="modal" id="rModal" hidden><div class="box" role="dialog" aria-modal="true" aria-labelledby="rmT"><h3 id="rmT">Novo lançamento a receber</h3>'
   +'<div class="sub" style="margin-bottom:-4px">Cliente avulso</div>'
   +'<div class="fld"><label for="rDoc">CNPJ ou CPF</label><div class="docrow"><input id="rDoc" inputmode="numeric" placeholder="Digite o CNPJ e os dados aparecem sozinhos"><button class="ghost" type="button" id="rBusca">'+ic("search",13)+' Buscar</button></div><div class="rfst" id="rSt"><span class="mut">Se o cliente já tiver cobranças aqui, os dados dele são reaproveitados.</span></div></div>'
   +'<div class="form"><div class="fld full"><label for="rNome">Nome ou razão social</label><input id="rNome"></div>'
   +'<div class="fld"><label for="rCon">Contato</label><input id="rCon"></div><div class="fld"><label for="rTel">Telefone</label><input id="rTel"></div>'
   +'<div class="fld full"><label for="rEm">E-mail para cobrança</label><input id="rEm" type="email"></div></div>'
   +'<div class="sub" style="margin:4px 0 -4px">Cobrança</div><div class="form">'
   +'<div class="fld full"><label for="rServ">Serviço realizado</label><input id="rServ" placeholder="Ex.: desobstrução do vaso do banheiro do 3º andar"></div>'
   +'<div class="fld"><label for="rOs">OS vinculada</label><input id="rOs" placeholder="OS-2026-0000"></div><div class="fld"><label for="rVal">Valor (R$)</label><input id="rVal" type="number" min="0" step="10" placeholder="0,00"></div>'
   +'<div class="fld"><label for="rNf">Nº da nota fiscal</label><input id="rNf" inputmode="numeric" placeholder="Deixe vazio se ainda não emitiu"></div><div class="fld"><label for="rNfD">Emissão da nota</label><input id="rNfD" type="date"></div>'
   +'<div class="fld"><label for="rVenc">Vencimento</label><input id="rVenc" type="date"></div><div class="fld"><label for="rForma">Forma de pagamento</label><select id="rForma"><option>Boleto</option><option>Pix</option><option>Transferência</option><option>Dinheiro</option></select></div>'
   +'<div class="fld"><label for="rCob">Cobrança enviada em</label><input id="rCob" type="date"></div><div class="fld"><label for="rCanal">Enviada por</label><select id="rCanal"><option value="">Ainda não enviada</option><option>E-mail</option><option>WhatsApp</option><option>Correio</option><option>Em mãos</option></select></div>'
   +'<div class="fld full"><label for="rObs">Observações</label><textarea id="rObs" placeholder="Ex.: pagar só após o dia 15"></textarea></div></div>'
   +'<div class="acts"><button class="ghost" type="button" data-rx>Cancelar</button><button class="cta rq" type="button" id="rSave">Salvar lançamento</button></div></div></div>';
  function kp(){
    var ab=aberto(),tot=ab.reduce(function(s,r){return s+r.valor},0),venc=ab.filter(function(r){return recSt(r)[1]==="Vencido"}),sem=ab.filter(function(r){return !r.cob}),sete=ab.filter(function(r){return r.venc>=TD&&r.venc<=ymd(addDays(TODAY,7))}),rec=RECEBER.filter(function(r){return r.pago&&r.pago.slice(0,7)===TD.slice(0,7)});
    function sum(a){return brl(a.reduce(function(s,r){return s+r.valor},0))}
    $("#rTot").innerHTML=brl(tot).replace("R$ ","R$ ")+'<small>BRL</small>';$("#rTotS").textContent=ab.length+" cobranças em aberto · "+venc.length+" vencidas";
    $("#rKp").innerHTML='<div><span class="sq" style="background:var(--erro-50);border-color:#F1C9C6;color:var(--erro)">'+ic("clock",14)+'</span><span class="t">Vencido</span><b class="num">'+sum(venc)+'</b><span class="pill er">'+venc.length+' cliente'+(venc.length===1?'':'s')+'</span></div>'
     +'<div><span class="sq">'+ic("agenda",14)+'</span><span class="t">Vence em 7 dias</span><b class="num">'+sum(sete)+'</b><span class="pill in">'+sete.length+' cobranças</span></div>'
     +'<div><span class="sq">'+ic("mail",14)+'</span><span class="t">Cobrança não enviada</span><b class="num">'+sem.length+'</b><span class="pill al">'+(sem.filter(function(r){return !r.nf}).length)+' sem nota fiscal</span></div>'
     +'<div><span class="sq">'+ic("up",14)+'</span><span class="t">Recebido em '+MES[TODAY.getMonth()].toLowerCase()+'</span><b class="num">'+sum(rec)+'</b><span class="pill ok">'+rec.length+' pagamentos</span></div>';
    
  }
  function table(){
    $("#rFil").innerHTML=FIL.map(function(f){return '<button type="button" aria-pressed="'+(st.f===f)+'">'+f+'</button>'}).join("");
    var q=norm(st.q.trim()),qd=digits(q);
    var L=RECEBER.filter(pass).filter(function(r){return !q||norm(r.nome+" "+r.doc+" "+r.nf+" "+r.os+" "+r.serv).indexOf(q)>=0||(qd.length>=3&&(digits(r.doc)+" "+r.nf).indexOf(qd)>=0)}).sort(function(a,b){return a.venc<b.venc?-1:1});
    $("#rTb tbody").innerHTML=L.map(function(r){var s=recSt(r),late=s[1]==="Vencido"?diffDays(TD,r.venc):0;
      return '<tr class="cl'+(r.id===REC_SEL?' pick':'')+'" data-id="'+r.id+'"><td><b>'+r.nome+'</b><small>'+r.doc+'</small></td><td>'+(r.nf?'<b>NF '+r.nf+'</b><small>'+dmy(r.nfData)+'</small>':'<span class="mut">A emitir</span>')+'</td><td>'+(r.cob?'<b>'+dmy(r.cob)+'</b><small>'+r.canal+'</small>':'<span class="pill al">Não enviada</span>')+'</td><td><b>'+dmy(r.venc)+'</b><small>'+(r.pago?'Pago em '+dmy(r.pago).slice(0,5):late?late+' dias de atraso':r.forma)+'</small></td><td class="r num">'+brl(r.valor)+'</td><td><span class="pill '+s[0]+'">'+s[1]+'</span></td></tr>'}).join("")||'<tr><td colspan="6" class="mut">'+(RECEBER.length?'Nenhuma cobrança neste filtro.':'Nenhuma cobrança lançada ainda. Clique em Novo lançamento.')+'</td></tr>';
  }
  function det(){
    var r=RECEBER.find(function(x){return x.id===REC_SEL});if(!r){$("#rDet").innerHTML='<p class="mut">'+(RECEBER.length?'Selecione uma cobrança.':'As cobranças lançadas aparecem aqui com o histórico: nota fiscal, envio da cobrança e pagamento.')+'</p>';return}
    var s=recSt(r),late=s[1]==="Vencido"?diffDays(TD,r.venc):0;
    var tl=[];tl.push([r.nfData||"",r.nf?"Nota fiscal "+r.nf+" emitida":"Nota fiscal ainda não emitida",r.nf?"ok":"ne"]);
    if(r.cob)tl.push([r.cob,"Cobrança enviada por "+r.canal.toLowerCase()+" ("+r.forma.toLowerCase()+")","in"]);
    r.hist.forEach(function(h){tl.push([h[0],h[1],"al"])});
    if(r.pago)tl.push([r.pago,"Pagamento recebido · "+brl(r.valor),"ok"]);else tl.push([r.venc,"Vencimento"+(late?" · "+late+" dias de atraso":""),late?"er":"ne"]);
    tl.sort(function(a,b){return (a[0]||"0")<(b[0]||"0")?-1:1});
    var ini=r.nome.split(" ").filter(function(w){return w.length>2}).map(function(w){return w[0]}).join("").slice(0,2);
    $("#rDet").innerHTML='<div class="prof"><span class="bigav">'+ini+'</span><div style="flex:1;min-width:0"><h3>'+r.nome+'</h3><span class="sub">'+r.doc+'</span></div><span class="pill '+s[0]+'">'+s[1]+'</span></div>'
    +'<div class="rval"><span class="sub">Valor</span><b class="num">'+brl(r.valor)+'</b><span class="sub">'+r.serv+(r.os?' · '+r.os:'')+'</span></div>'
    +'<div class="kv2"><div><small>Nota fiscal</small><span>'+(r.nf?'Nº '+r.nf+' · '+dmy(r.nfData):'A emitir')+'</span></div><div><small>Cobrança enviada</small><span>'+(r.cob?dmy(r.cob)+' · '+r.canal:'Não enviada')+'</span></div><div><small>Vencimento</small><span>'+dmy(r.venc)+' · '+r.forma+'</span></div><div><small>Recebido em</small><span>'+(r.pago?dmy(r.pago):'—')+'</span></div><div><small>Contato</small><span>'+r.contato+' · '+r.tel+'</span></div><div><small>E-mail</small><span>'+r.email+'</span></div></div>'
    +(!r.pago&&!r.nf?'<div class="nfrow"><div class="fld"><label for="dNf">Nº da nota fiscal</label><input id="dNf" inputmode="numeric" placeholder="Ex.: 2390"></div><button class="cta rq" type="button" data-dnf>Registrar nota</button></div>':'')
    +'<div class="ch"><h4>Histórico da cobrança</h4></div><ul class="tl">'+tl.map(function(t){return '<li><span class="pt" style="border-color:'+({ok:"var(--ok)",in:"var(--hidra)",al:"var(--alerta)",er:"var(--erro)",ne:"#CAC9C5"}[t[2]])+'"></span><span><b>'+t[1]+'</b></span><span class="sub num">'+(t[0]?dmy(t[0]):'')+'</span></li>'}).join("")+'</ul>'
    +(r.obs?'<p class="txt"><b style="font-weight:600">Observação:</b> '+r.obs+'</p>':'')
    +(!r.pago?'<div class="acts" style="justify-content:flex-start;flex-wrap:wrap">'+(r.nf?(r.cob?'<button class="ghost" type="button" data-dremind>'+ic("mail",13)+' Enviar lembrete</button>':'<button class="cta" type="button" data-dcob>'+ic("mail",13)+' Registrar envio da cobrança</button>'):'')+'<button class="cta rq" type="button" data-dpago>'+ic("up",13)+' Marcar como recebido</button></div>':'')
    +(late?aiBox('Está há <b>'+late+' dias</b> em atraso. Posso escrever uma mensagem de cobrança gentil para '+r.contato.split(" (")[0]+' com o boleto atualizado.','Escrever cobrança','data-dremind'):'');
  }
  function all(){kp();table();det()}
  function fillFrom(d){
    var ja=RECEBER.find(function(x){return digits(x.doc)===d})||CLIENTES.find(function(x){return digits(x.doc)===d});
    if(ja){$("#rNome").value=ja.razao||ja.nome;$("#rCon").value=ja.contato;$("#rTel").value=ja.tel;$("#rEm").value=ja.email;$("#rSt").innerHTML='<span class="pill in">Já conhecido</span> <span class="mut">Dados de '+ja.nome+' reaproveitados.</span>';return}
    if(d.length!==14){$("#rSt").innerHTML=d.length===11?'<span class="mut">CPF: preencha os dados manualmente.</span>':'<span class="mut">Digite os 14 números do CNPJ.</span>';return}
    $("#rSt").innerHTML='<span class="spin"></span><span class="mut">Consultando a Receita Federal…</span>';
    consultaCNPJ(d,function(err,x){if(err){$("#rSt").innerHTML='<span class="pill al">Sem resposta da Receita</span> <span class="mut">Confira o CNPJ ou preencha os dados à mão.</span>';return}$("#rDoc").value=fmtCNPJ(d);$("#rNome").value=x.fantasia||x.razao;if(x.tel)$("#rTel").value=x.tel;if(x.email)$("#rEm").value=x.email;$("#rSt").innerHTML='<span class="pill '+(x.situacao==="Ativa"?'ok':'al')+'">Situação '+x.situacao.toLowerCase()+'</span> <span class="mut">'+x.razao+' · '+x.end+'</span>';$("#rCon").focus()});
  }
  v.addEventListener("input",function(e){
    if(e.target.id==="rQ"){st.q=e.target.value;table();return}
    if(e.target.id==="rDoc"){var d=digits(e.target.value);if(d.length===14||d.length===11)fillFrom(d)}
  });
  v.addEventListener("click",function(e){
    var r0=e.target.closest("#rTb tr.cl");if(r0){REC_SEL=+r0.dataset.id;table();det();if(window.innerWidth<1100)$("#rDet").scrollIntoView({behavior:"smooth"});return}
    var f=e.target.closest("#rFil button");if(f){st.f=f.textContent;table();return}
    if(e.target.closest("[data-rnew]")){$$("#rModal input,#rModal textarea",v).forEach(function(i){i.value=""});$("#rVenc").value=ymd(addDays(TODAY,10));$("#rCanal").value="";$("#rSt").innerHTML='<span class="mut">Se o cliente já tiver cobranças aqui, os dados dele são reaproveitados.</span>';$("#rModal").hidden=false;$("#rDoc").focus();return}
    if(e.target.closest("[data-rx]")||e.target===$("#rModal")){$("#rModal").hidden=true;return}
    if(e.target.closest("#rBusca")){fillFrom(digits($("#rDoc").value));return}
    if(e.target.closest("#rSave")){
      var nome=$("#rNome").value.trim(),val=+$("#rVal").value;
      if(!nome){toast("Informe o cliente.");$("#rNome").focus();return}if(!val){toast("Informe o valor.");$("#rVal").focus();return}if(!$("#rVenc").value){toast("Informe o vencimento.");return}
      var cob=$("#rCob").value,canal=$("#rCanal").value;if(cob&&!canal)canal="E-mail";if(canal&&!cob)cob=TD;
      var n={id:nid(RECEBER),nome:nome,doc:$("#rDoc").value.trim()||"—",contato:$("#rCon").value.trim()||"—",tel:$("#rTel").value.trim()||"—",email:$("#rEm").value.trim()||"—",serv:$("#rServ").value.trim()||"Serviço avulso",os:$("#rOs").value.trim(),valor:val,nf:$("#rNf").value.trim(),nfData:$("#rNf").value.trim()?($("#rNfD").value||TD):"",cob:cob,canal:canal,forma:$("#rForma").value,venc:$("#rVenc").value,pago:"",hist:[],obs:$("#rObs").value.trim()};
      RECEBER.push(n);REC_SEL=n.id;st.f="Todos";$("#rModal").hidden=true;all();toast("Lançamento de "+brl(val)+" para "+nome+" salvo.");return}
    var r=RECEBER.find(function(x){return x.id===REC_SEL});
    if(e.target.closest("[data-dnf]")){var nf=$("#dNf").value.trim();if(!nf){toast("Informe o número da nota.");$("#dNf").focus();return}r.nf=nf;r.nfData=TD;all();toast("NF "+nf+" registrada.");return}
    if(e.target.closest("[data-dcob]")){r.cob=TD;r.canal="E-mail";all();toast("Envio da cobrança registrado.");return}
    if(e.target.closest("[data-dremind]")){r.hist.push([TD,"Lembrete de cobrança enviado"]);all();toast("Lembrete registrado no histórico.");return}
    if(e.target.closest("[data-dpago]")){r.pago=TD;all();toast("Pagamento de "+brl(r.valor)+" registrado.");return}
  });
  all();
  VIEWS.rec.show=all;
};

/* ===== FUNCIONÁRIOS ===== */
var FUN_SEL=0;
VIEWS.func=function(v){
  var fEd=null;
  function asoSt(f){if(!f.aso)return ['ne','ASO não informado'];var d=diffDays(f.aso,TD);return d<0?['er','ASO vencido']:d<=30?['al','ASO em '+d+' dias']:['ok','ASO em dia']}
  v.innerHTML='<div class="grid">'
  +'<div class="card c12" style="padding:12px"><div class="kp" style="--n:4">'
   +'<div><span class="sq">'+ic("func",14)+'</span><span class="t">Colaboradores</span><b class="num" id="fK1"></b><span class="pill in" id="fK1s"></span></div>'
   +'<div><span class="sq" style="background:var(--erro-50);border-color:#F1C9C6;color:var(--erro)">'+ic("doc",14)+'</span><span class="t">ASO vencido</span><b class="num" id="fK2"></b><span class="pill er" id="fK2s"></span></div>'
   +'<div><span class="sq">'+ic("clock",14)+'</span><span class="t">ASO vence em 30 dias</span><b class="num" id="fK3"></b><span class="pill al" id="fK3s"></span></div>'
   +'<div><span class="sq">'+ic("cake",14)+'</span><span class="t">Aniversariantes de '+MES[TODAY.getMonth()].toLowerCase()+'</span><b class="num" id="fBdN"></b><span class="pill go" id="fBdL"></span></div></div></div>'
  +'<div class="split c12"><div class="card"><div class="ch"><h4>Equipe</h4><button class="cta" type="button" id="fNew">'+ic("plus",13)+'Novo colaborador</button></div><div class="scroll-x"><table class="tb" id="fnTb"><thead><tr><th>Nome</th><th>Função</th><th>Admissão</th><th>Aniversário</th><th>Uniforme</th><th>Documentos</th></tr></thead><tbody>'
   +'</tbody></table></div></div>'
   +'<div class="card" id="fnDet"></div></div></div>'
  +'<div class="modal" id="fnModal" hidden><div class="box" role="dialog" aria-modal="true" aria-labelledby="fnT"><h3 id="fnT">Novo colaborador</h3><div class="form">'
   +'<div class="fld full"><label for="n1">Nome completo</label><input id="n1"></div><div class="fld"><label for="n2">CPF</label><input id="n2" inputmode="numeric" placeholder="000.000.000-00"></div><div class="fld"><label for="n3">RG</label><input id="n3"></div><div class="fld"><label for="n13">Data de nascimento</label><input id="n13" type="date"></div><div class="fld"><label for="n14">Setor</label><select id="n14"><option>Campo</option><option>Escritório</option></select></div>'
   +'<div class="fld"><label for="n4">Função</label><input id="n4"></div><div class="fld"><label for="n15">ASO válido até</label><input id="n15" type="date"></div><div class="fld"><label for="n5">Admissão</label><input id="n5" type="date"></div><div class="fld"><label for="n6">Telefone</label><input id="n6" inputmode="tel"></div><div class="fld"><label for="n7">CNH</label><input id="n7" placeholder="Categoria e validade"></div>'
   +'<div class="fld"><label for="n8">Camisa</label><select id="n8"><option>P</option><option selected>M</option><option>G</option><option>GG</option></select></div><div class="fld"><label for="n9">Calça</label><input id="n9" inputmode="numeric" placeholder="42"></div><div class="fld"><label for="n10">Bota</label><input id="n10" inputmode="numeric" placeholder="41"></div><div class="fld"><label for="n11">Luva</label><select id="n11"><option>P</option><option selected>M</option><option>G</option></select></div>'
   +'<div class="fld full"><label for="n12">Documentos</label><input id="n12" type="file" multiple></div></div><div class="acts"><button class="ghost" type="button" id="fDel" hidden>Excluir colaborador</button><span style="flex:1"></span><button class="ghost" type="button" data-close>Cancelar</button><button class="cta rq" type="button" id="fSave">Salvar</button></div></div></div>';
  function rows(){$("#fnTb tbody").innerHTML=FUNC.map(function(f){var s=asoSt(f);return '<tr class="cl'+(f.id===FUN_SEL?' pick':'')+'" data-id="'+f.id+'"><td><span style="display:flex;gap:9px;align-items:center"><span class="av" style="background:var(--trigo);color:var(--fluxo)">'+f.nome.split(" ").map(function(w){return w[0]}).join("")+'</span><span><b>'+f.nome+'</b><small>'+f.setor+'</small></span></span></td><td>'+f.cargo+'</td><td class="num">'+dmy(f.adm)+'</td><td>'+(f.nasc?(f.nasc.slice(5,7)===TD.slice(5,7)?'<span class="pill go">'+ic("cake",11)+' '+dmy(f.nasc).slice(0,5)+'</span>':'<span class="num">'+dmy(f.nasc).slice(0,5)+'</span>'):'—')+'</td><td class="num">'+f.tam[0]+' · '+f.tam[1]+' · '+f.tam[2]+'</td><td><span class="pill '+s[0]+'">'+s[1]+'</span></td></tr>'}).join("")||'<tr><td colspan="6" class="mut">Nenhum colaborador cadastrado ainda. Clique em Novo colaborador.</td></tr>';}
  function det(){
    var f=FUNC.find(function(x){return x.id===FUN_SEL})||FUNC[0];if(!f){$("#fnDet").innerHTML='<p class="mut">A ficha do colaborador aparece aqui: documentos, uniforme e EPIs. A data de nascimento coloca o aniversário na agenda.</p>';return}FUN_SEL=f.id;var s=asoSt(f),anos=Math.floor(diffDays(TD,f.adm)/365.25);
    $("#fnDet").innerHTML='<div class="prof"><span class="bigav" style="background:var(--trigo);color:var(--fluxo)">'+f.nome.split(" ").map(function(w){return w[0]}).join("")+'</span><div style="flex:1;min-width:0"><h3>'+f.nome+'</h3><span class="sub">'+f.cargo+' · '+anos+' ano'+(anos===1?'':'s')+' de casa</span></div><button class="ghost" type="button" data-fedit>Editar</button></div>'
    +'<div class="kv2"><div><small>CPF</small><span>'+f.cpf+'</span></div><div><small>RG</small><span>'+f.rg+'</span></div><div><small>Nascimento</small><span>'+(f.nasc?dmy(f.nasc):'—')+'</span></div><div><small>Telefone</small><span>'+f.tel+'</span></div><div><small>Cidade</small><span>'+f.end+'</span></div><div><small>Admissão</small><span>'+dmy(f.adm)+'</span></div></div>'
    +'<div class="ch"><h4>Uniforme e EPIs</h4></div><div class="sizes"><div><small>Camisa</small><b>'+f.tam[0]+'</b></div><div><small>Calça</small><b>'+f.tam[1]+'</b></div><div><small>Bota</small><b>'+f.tam[2]+'</b></div><div><small>Luva</small><b>'+f.tam[3]+'</b></div></div>'
    +'<div class="ch"><h4>Documentos</h4><button class="ghost" type="button" data-t="Abriria o envio de documentos.">+ Enviar</button></div>'
    +[["ASO",f.aso?dmy(f.aso):"Não informado",s],["CNH",f.cnh,['ne','—']],["Treinamento NR",f.nr,['ne','—']]].map(function(d){return '<div class="doc">'+ic("doc",16)+'<span class="grow"><b>'+d[0]+'</b><small>'+d[1]+'</small></span>'+(d[2][1]!=="—"?'<span class="pill '+d[2][0]+'">'+d[2][1]+'</span>':'')+'</div>'}).join("")
    +(f.obs?'<p class="txt">'+f.obs+'</p>':'');
  }
  v.addEventListener("click",function(e){
    var r=e.target.closest("tr.cl");if(r){FUN_SEL=+r.dataset.id;$$("#fnTb tr",v).forEach(function(x){x.classList.toggle("pick",x===r)});det();if(window.innerWidth<1100)$("#fnDet").scrollIntoView({behavior:"smooth"});return}
    if(e.target.closest("#fNew")){fEd=null;$("#fnT").textContent="Novo colaborador";$("#fDel").hidden=true;$$("#fnModal input",v).forEach(function(i){i.value=""});$("#n14").value="Campo";$("#fnModal").hidden=false;$("#n1").focus();return}
    if(e.target.closest("[data-fedit]")){fEd=FUNC.find(function(x){return x.id===FUN_SEL});if(!fEd)return;var f=fEd;function vv(x){return x&&x!=="—"?x:""}
      $$("#fnModal input",v).forEach(function(i){i.value=""});$("#fnT").textContent="Editar colaborador";$("#fDel").hidden=false;
      $("#n1").value=f.nome;$("#n2").value=vv(f.cpf);$("#n3").value=vv(f.rg);$("#n13").value=f.nasc||"";$("#n4").value=vv(f.cargo);$("#n15").value=f.aso||"";$("#n5").value=f.adm||"";$("#n6").value=vv(f.tel);$("#n7").value=vv(f.cnh);$("#n14").value=f.setor||"Campo";
      var t=f.tam||[];if(t[0])$("#n8").value=t[0];$("#n9").value=vv(t[1]);$("#n10").value=vv(t[2]);if(t[3])$("#n11").value=t[3];$("#fnModal").hidden=false;$("#n1").focus();return}
    var fd=e.target.closest("#fDel");if(fd&&fEd){if(!fd.dataset.ok){fd.dataset.ok="1";fd.textContent="Confirmar exclusão";setTimeout(function(){delete fd.dataset.ok;fd.textContent="Excluir colaborador"},4000);return}
      FUNC.splice(FUNC.indexOf(fEd),1);toast(fEd.nome+" excluído.");fEd=null;FUN_SEL=0;$("#fnModal").hidden=true;rows();det();kpi();return}
    if(e.target.closest("#fSave")){var nm=$("#n1").value.trim();if(!nm){toast("Informe o nome.");return}if(!$("#n13").value){toast("Informe a data de nascimento.");$("#n13").focus();return}
      if(fEd){var fe=fEd;fe.nome=nm;fe.cargo=$("#n4").value.trim()||"Colaborador";fe.setor=$("#n14").value;fe.adm=$("#n5").value||fe.adm;fe.cpf=$("#n2").value||"—";fe.rg=$("#n3").value||"—";fe.nasc=$("#n13").value;fe.tel=$("#n6").value||"—";fe.cnh=$("#n7").value||"—";fe.aso=$("#n15").value||"";fe.tam=[$("#n8").value,$("#n9").value||"—",$("#n10").value||"—",$("#n11").value];
        fEd=null;$("#fnModal").hidden=true;rows();det();kpi();toast("Cadastro de "+nm+" atualizado.");return}
      var nf={id:nid(FUNC),nome:nm,cargo:$("#n4").value.trim()||"Colaborador",setor:$("#n14").value,adm:$("#n5").value||TD,cpf:$("#n2").value||"—",rg:$("#n3").value||"—",nasc:$("#n13").value,tel:$("#n6").value||"—",end:"—",cnh:$("#n7").value||"—",aso:$("#n15").value||"",nr:"—",tam:[$("#n8").value,$("#n9").value||"—",$("#n10").value||"—",$("#n11").value],obs:""};
      FUNC.push(nf);FUN_SEL=nf.id;$("#fnModal").hidden=true;rows();det();kpi();toast(nm+" cadastrado. O aniversário já aparece na agenda.");return}
    if(e.target.closest("[data-close]")||e.target===$("#fnModal")){$("#fnModal").hidden=true}
  });
  function kpi(){var ven=FUNC.filter(function(f){return asoSt(f)[0]==="er"}),v30=FUNC.filter(function(f){return asoSt(f)[0]==="al"}),camp=FUNC.filter(function(f){return f.setor==="Campo"}).length;
    $("#fK1").textContent=FUNC.length;$("#fK1s").textContent=camp+" campo · "+(FUNC.length-camp)+" escritório";$("#fK2").textContent=ven.length;$("#fK2s").textContent=ven.map(function(f){return firstName(f.nome)}).join(" · ")||"Nenhum";$("#fK3").textContent=v30.length;$("#fK3s").textContent=v30.map(function(f){return firstName(f.nome)}).join(" · ")||"Nenhum";
    var b=FUNC.filter(function(f){return f.nasc&&f.nasc.slice(5,7)===TD.slice(5,7)}).sort(function(a,b){return a.nasc.slice(8)<b.nasc.slice(8)?-1:1});$("#fBdN").textContent=b.length;$("#fBdL").innerHTML=b.map(function(f){return firstName(f.nome)+' '+dmy(f.nasc).slice(0,5)}).join(" · ")||"—"}
  rows();det();kpi();
  VIEWS.func.show=function(){rows();det();kpi()};
};

/* ===== CONFIGURAÇÕES ===== */
var BANCOS=[["Bradesco",[["Banco","Bradesco (237)"],["Agência","0127"],["Conta","6782-2"],["CNPJ","05.889.593/0001-02"],["Pix","sac@mfuji.com.br"]]],["Conta Azul",[["Banco","775 - CONTAAZUL IP"],["Agência","0001"],["Conta","43039-0"],["CNPJ","05.889.593/0001-02"],["Pix","financeiro@mfuji.com.br"]]]];
var EMPRESA=[["Razão social","Monte Fuji Dedetizadora e Desentupidora"],["CNPJ","05.889.593/0001-02"],["Inscrição estadual","492.508.250.116"],["Endereço","Rua Anhanguera, 549 · Piratininga, Osasco/SP"],["Site","mfuji.com.br"],["Telefone","(11) 3609-5222"],["WhatsApp","(11) 99742-0106"],["E-mail","atendimento@mfuji.com.br"],["Instagram","@monte_fuji_dedetizadora"]];
function copyText(t,cb){function fb(){var ta=document.createElement("textarea");ta.value=t;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();var ok=false;try{ok=document.execCommand("copy")}catch(x){}ta.remove();cb(ok)}
  try{navigator.clipboard.writeText(t).then(function(){cb(true)},fb)}catch(x){fb()}}
VIEWS.cfg=function(v){
  function render(){
  v.innerHTML='<div class="grid">'
  +'<div class="card c6"><div class="ch"><h4>Empresa</h4><span class="sub">Clique em copiar para colar onde precisar</span></div><div class="kv2 emp">'+EMPRESA.map(function(x,i){return '<div><span class="g"><small>'+x[0]+'</small><span>'+x[1]+'</span></span><button class="cpb" type="button" data-cp="'+i+'" aria-label="Copiar '+x[0]+'" title="Copiar">'+ic("doc",13)+'</button></div>'}).join("")+'</div></div>'
  +'<div class="card c6"><div class="ch"><h4>Dados bancários</h4><span class="sub">Para enviar aos clientes</span></div>'+BANCOS.map(function(b,bi){return '<div class="bkh"><b>'+b[0]+'</b><button class="ghost" type="button" data-cpall="'+bi+'">'+ic("doc",12)+' Copiar todos</button></div><div class="kv2 emp">'+b[1].map(function(x,i){return '<div><span class="g"><small>'+x[0]+'</small><span>'+x[1]+'</span></span><button class="cpb" type="button" data-cpb="'+bi+'-'+i+'" aria-label="Copiar '+x[0]+' '+b[0]+'" title="Copiar">'+ic("doc",13)+'</button></div>'}).join("")+'</div>'}).join("")+'</div>'
  +'<div class="card c6" id="cfgBanco"></div>'
  +'<div class="card c6"><div class="ch"><h4>Integrações</h4><span class="sub">Próximas etapas</span></div>'
   +[["CF","#B49B54","Cloudflare","Hospedagem do sistema","Conectado"],["R","#2F8F5B","Receita Federal","Consulta de CNPJ pela BrasilAPI","Conectado"],["D1","#B49B54","Banco de dados (Cloudflare D1)","Dados compartilhados entre a equipe","Conectado"],["M","#C2413A","Gmail","3 caixas: atendimento, financeiro e comercial","Não conectado"],["CA","#253C8D","Conta Azul","Clientes importados por planilha (em Clientes); pagamentos ainda não","Por planilha"],["IA","#18275E","Assistente","Base de conhecimento da Monte Fuji","Aguardando conteúdo"]].map(function(x){return '<div class="intg"><span class="lg2" style="background:'+x[1]+'">'+x[0]+'</span><span class="grow"><b>'+x[2]+'</b><small>'+x[3]+'</small></span><span class="pill '+(x[4]==="Conectado"?"ok":x[4]==="Próxima etapa"||x[4]==="Por planilha"?"in":"al")+'">'+x[4]+'</span></div>'}).join("")+'<div class="intg" id="intG"></div></div>'
  +'<div class="card c6" id="cfgUsu"></div></div>';
  }
  v.addEventListener("click",function(e){
    var all=e.target.closest("[data-cpall]");if(all){var bk=BANCOS[+all.dataset.cpall];copyText(bk[1].map(function(x){return x[0]+": "+x[1]}).join("\n"),function(ok){toast(ok?"Dados do "+bk[0]+" copiados.":"Não consegui copiar. Selecione o texto e use Ctrl+C.")});return}
    var cp=e.target.closest("[data-cp],[data-cpb]");if(cp){var it=cp.dataset.cp!==undefined?EMPRESA[+cp.dataset.cp]:(function(p){var b=BANCOS[+p[0]];return [b[1][+p[1]][0]+" "+b[0],b[1][+p[1]][1]]})(cp.dataset.cpb.split("-"));copyText(it[1],function(ok){if(ok){cp.classList.add("ok");cp.innerHTML=ic("chk",13);setTimeout(function(){cp.classList.remove("ok");cp.innerHTML=ic("doc",13)},1500);toast(it[0]+" copiado.")}else toast("Não consegui copiar. Selecione o texto e use Ctrl+C.")});return}
  });
  /* Google Drive: o administrador conecta a conta da empresa uma vez */
  function googleCard(){var el=$("#intG");if(!el)return;var adm=EU.papel==="admin";
    el.innerHTML='<span class="lg2" style="background:#3872CF">G</span><span class="grow"><b>Google Drive</b><small>Verificando…</small></span>';
    gStatus(true).then(function(st){el=$("#intG");if(!el)return;
      el.innerHTML='<span class="lg2" style="background:#3872CF">G</span><span class="grow"><b>Google Drive</b><small>'+(st.conectado?'OS salvas na pasta de cada cliente · '+esc(st.conta||"conta conectada"):st.configurado?'OS salvas na pasta de cada cliente'+(adm?' · entre com a conta '+esc(st.conta||"atendimento@mfuji.com.br"):''):'Falta configurar a ligação com o Google')+'</small></span>'
        +(st.conectado?'<span class="pill ok">Conectado</span>'+(adm?'<button class="ghost" type="button" data-gdesc>Desconectar</button>':''):st.configurado?(adm?'<a class="cta" href="/api/google/conectar">Conectar</a>':'<span class="pill al">Não conectado</span>'):'<span class="pill al">Não configurado</span>')})}
  v.addEventListener("click",function(e){var d=e.target.closest("[data-gdesc]");if(!d)return;
    if(!d.dataset.ok){d.dataset.ok=1;d.textContent="Confirmar?";setTimeout(function(){if(d.isConnected){delete d.dataset.ok;d.textContent="Desconectar"}},4000);return}
    api("POST","/api/google/desconectar",{}).then(function(){GDRIVE.pastas=null;GDRIVE.pp=null;toast("Google Drive desconectado.");googleCard()}).catch(function(e){toast(e.erro||"Não consegui desconectar.")})});
  VIEWS.cfg.show=function(){render();bancoCard($("#cfgBanco"));usuariosCard($("#cfgUsu"));googleCard()};
};

/* volta da tela de autorização do Google */
(function(){var m=location.search.match(/[?&]google=(\w+)/);if(!m)return;try{history.replaceState(null,"",location.pathname+location.hash)}catch(e){}
  var t={ok:"Google Drive conectado. As OS já vão direto para a pasta de cada cliente.",cancelado:"Conexão com o Google cancelada.",permissoes:"Marque todas as permissões pedidas pelo Google e tente de novo.",erro:"Não consegui conectar o Google Drive. Tente de novo."}[m[1]];
  if(t)setTimeout(function(){toast(t)},800)})();

/* ===== CENTRAL DE AJUDA ===== */
VIEWS.help=function(v){
  v.innerHTML='<div class="grid"><div class="card c8"><div class="ch"><h4>Dúvidas frequentes</h4></div><div class="search" style="flex:none">'+ic("search",14)+'<input placeholder="Buscar ajuda" aria-label="Buscar ajuda"></div>'
  +[["Como trago os clientes do Conta Azul?","No Conta Azul, abra Cadastros › Clientes e use Exportar. Aqui, em Clientes, clique em Importar do Conta Azul e escolha a planilha. Clientes com o mesmo nome não são duplicados, então dá para importar de novo quando quiser."],["Como gero uma ordem de serviço?","Em Ordens de serviço, escolha o cliente, descreva o serviço e clique em Gerar OS e salvar no Drive. O termo de execução é criado como documento Google, no modelo da Monte Fuji, dentro da pasta do cliente. A pasta é encontrada pelo nome; se não for, escolha uma vez e o sistema guarda."],["Como cadastro uma visita na agenda?","Em Agenda, clique em + Novo agendamento ou em Agendar numa das melhores datas sugeridas. Os campos definitivos ainda serão definidos."],["O assistente lê meus e-mails?","No sistema final, sim: ele lê a caixa da empresa para sugerir respostas. Nada é enviado sem você clicar em enviar."],["Onde vejo as garantias de um cliente?","Em Clientes, selecione o cliente. As garantias aparecem com a barra de tempo restante e a data de término."],["Os dados financeiros são atualizados sozinhos?","Sim, quando a Conta Azul estiver conectada. A sincronização prevista é a cada hora."]].map(function(f,i){return '<details class="faq"'+(i?'':' open')+'><summary>'+f[0]+'</summary><p>'+f[1]+'</p></details>'}).join("")+'</div>'
  +'<div class="c4" style="display:flex;flex-direction:column;gap:10px"><div class="card hero"><div class="ring" aria-hidden="true"></div><div class="hh"><span>Falar com o suporte</span></div><b style="font-size:20px">atendimento@mfuji.com.br</b><p class="hs">(11) 3609-5222 · segunda a sábado</p></div>'
  +'<div class="card"><div class="ch"><h4>Atalhos</h4></div><ul class="ls"><li><span class="grow"><b style="font-weight:500">Abrir o assistente</b></span><span class="tag">Ctrl + J</span></li><li><span class="grow"><b style="font-weight:500">Fechar janelas</b></span><span class="tag">Esc</span></li><li><span class="grow"><b style="font-weight:500">Abrir um dia na agenda</b></span><span class="tag">Duplo clique</span></li></ul></div>'
  +'<div class="card"><div class="ch"><h4>Versão</h4><span class="pill ok">Versão 2</span></div><p class="txt">v2.0 · em uso desde '+dmy(TD)+'. Dados no banco compartilhado da Cloudflare, com login individual e atualização automática entre a equipe.</p></div></div></div>';
};

/* ===== início ===== */
document.addEventListener("click",function(e){
  var g=e.target.closest("[data-go]");if(g){location.hash="#"+g.dataset.go;return}
  var t=e.target.closest("[data-t]");if(t){toast(t.dataset.t);return}
  if(e.target.closest("[data-ai]")){AI.open();return}
});
$("#tlogo").src=LOGO;syncVenc();refreshSide();initAI();
$("#bell").addEventListener("click",function(){var a=avisos();toast(a.length?"Avisos: "+a.join(" · ")+".":"Nenhum aviso no momento.")});
var _sv=null;function persist(){clearTimeout(_sv);_sv=setTimeout(function(){dbSave();refreshSide()},250)}
["click","change","drop","focusout","keydown"].forEach(function(ev){document.addEventListener(ev,persist)});
window.addEventListener("pagehide",function(){dbSave(true)});document.addEventListener("visibilitychange",function(){if(document.hidden)dbSave()});
$("#burger").addEventListener("click",function(){$("#app").classList.add("nav-open")});
$("#scrim").addEventListener("click",function(){$("#app").classList.remove("nav-open")});
$("#gSearch").addEventListener("keydown",function(e){if(e.key==="Enter"&&this.value.trim()){var q=norm(this.value.trim()),c=CLIENTES.find(function(x){return norm(x.nome+" "+x.razao+" "+x.doc).indexOf(q)>=0});if(c){CLI_SEL=c.id;CLI_OPEN=true;location.hash="#cli";if(VIEWS.cli.show)VIEWS.cli.show()}else toast("Nenhum cliente encontrado para essa busca.")}});
window.addEventListener("hashchange",function(){go(location.hash.slice(1))});
window.addEventListener("resize",function(){var on=$(".view.on");if(on&&VIEWS[on.id.slice(2)]&&VIEWS[on.id.slice(2)].show)VIEWS[on.id.slice(2)].show()});
go(location.hash.slice(1)||"dash");

/* ===== COMUNICADO EM PDF ===== */
/* Salva um arquivo: no protótipo do Claude pede permissão ao visualizador; no site, baixa direto */
function saveFile(name,blob,cb){
  function direct(){var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},800);cb&&cb(true)}
  var c=window.claude;if(!c||!c.use)return direct();
  c.use("downloads").then(function(d){if(!d)return direct();d.save({filename:name,data:blob}).then(function(){cb&&cb(true)},function(er){cb&&cb(false,er&&er.code)})},direct)}
function comTextos(svs){var pr="Contamos com a compreensão e a colaboração de todos durante a execução dos serviços. Recomendamos manter as janelas fechadas e evitar a circulação e a permanência nas áreas sinalizadas por nossa equipe, especialmente de crianças, gestantes, idosos e animais de estimação.",
  ag="Contamos com a compreensão e a colaboração de todos durante a execução dos serviços. Recomendamos o uso consciente da água, a fim de evitar possíveis interrupções no abastecimento durante o período de manutenção.";
  var ps=[];svs.forEach(function(s){var t=SERV[s]&&SERV[s].g==="Reservatórios de água"?ag:pr;if(ps.indexOf(t)<0)ps.push(t)});
  if(ps.length>1)ps=[ps[0],ps[1].replace("Contamos com a compreensão e a colaboração de todos durante a execução dos serviços. ","")];return ps}
function listaPt(a){return a.length<2?a.join(""):a.slice(0,-1).join(", ")+" e "+a[a.length-1]}
function comDados(o){var p=o.date.split("-"),pub=o.pub==="col";
  return {nome:o.nome,tit:listaPt(o.svs).toUpperCase(),saud:pub?"PREZADOS COLABORADORES.":"SENHORES (A) CONDÔMINOS.",
    data:+p[2]+" de "+MES[+p[1]-1]+" de "+p[0],hora:o.h+"h",obs:o.obs,serv:listaPt(o.svs.map(function(s){return s.toLowerCase()})),onde:pub?"nas dependências da empresa":"nas áreas comuns do Condomínio",ps:comTextos(o.svs)}}
var COM_LOADED=null;
function comImgs(){if(COM_LOADED)return COM_LOADED;
  var fl=document.fonts&&document.fonts.load?Promise.all([document.fonts.load('700 20px "Lexend Deca"'),document.fonts.load('400 20px "Lexend Deca"')]).catch(function(){}):Promise.resolve();
  COM_LOADED=Promise.all(["top","mid","bot"].map(function(k){return new Promise(function(ok){var i=new Image();i.onload=function(){ok(i)};i.onerror=function(){ok(null)};i.src=COM_IMG[k]})}).concat([fl]));return COM_LOADED}
/* Desenha a página A4 (em pontos, como o modelo original) num canvas */
function comCanvas(o,sc){return comImgs().then(function(im){
  var W=595.28,H=841.89,cv=document.createElement("canvas");cv.width=Math.round(W*sc);cv.height=Math.round(H*sc);
  var tc=document.createElement("canvas");tc.width=cv.width;tc.height=cv.height;
  var mx=cv.getContext("2d"),x=tc.getContext("2d"),F='"Lexend Deca","Lexend",Arial,sans-serif',INK="#111827",AZ="#2F62B3",L=58.26,R=537;
  x.scale(sc,sc);mx.scale(sc,sc);
  function fnt(w,s){x.font=w+" "+s+"px "+F}
  function fit(t,w,s,max){fnt(w,s);while(x.measureText(t).width>max&&s>12){s-=.5;fnt(w,s)}return s}
  /* quebra de linha com trechos em negrito/azul */
  function para(segs,y,s,lh,col,lx,mw,dry){lx=lx||L;mw=mw||R-L;var words=[];segs.forEach(function(g){g.t.split(" ").forEach(function(w,i,a){if(w)words.push({w:w,b:g.b,sp:i<a.length-1})})});
    var lines=[[]],cx=0;words.forEach(function(wd){fnt(wd.b?700:400,s);var ww=x.measureText(wd.w).width,sp=x.measureText(" ").width;if(cx+ww>mw&&lines[lines.length-1].length){lines.push([]);cx=0}wd.x=cx;lines[lines.length-1].push(wd);cx+=ww+(wd.sp?sp:0)});
    if(!dry)lines.forEach(function(ln,i){ln.forEach(function(wd){fnt(wd.b?700:400,s);x.fillStyle=wd.b&&!col.b?AZ:(col.c||col);x.fillText(wd.w,lx+wd.x,y+i*lh)})});return y+(lines.length-1)*lh}
  x.textBaseline="alphabetic";x.fillStyle=INK;fnt(700,29);x.fillText("COMUNICADO",L,181.97);
  var s=fit(o.nome,700,21,R-L);x.fillStyle=INK;x.fillText(o.nome,L,208.97);
  var y=para([{t:o.tit,b:1}],243.97,12.5,16,AZ),d=y-243.97;
  x.strokeStyle=AZ;x.lineWidth=1.1;x.beginPath();x.moveTo(L,266.97+d);x.lineTo(413.25,266.97+d);x.stroke();
  x.fillStyle=INK;fnt(700,17.5);x.fillText(o.saud,L,302.97+d);
  y=para([{t:"No dia "},{t:o.data,b:1},{t:", a partir das "+o.hora+", realizaremos os serviços de "+o.serv+" "+o.onde+"."}],332.97+d,11.6,18,INK);
  o.ps.forEach(function(p){y=para([{t:p}],y+24,11.6,18,INK)});
  /* Observação em destaque, antes do Atenciosamente */
  var obs=(o.obs||"").split(/\n+/).map(function(t){return t.trim()}).filter(Boolean);
  if(obs.length){var bx=L+16,bw=R-L-30,top=y+22,yy=top+36,ys=[];
    obs.forEach(function(t,i){ys.push(yy);yy=para([{t:t,b:1}],yy,11.6,17,INK,bx,bw,true)+(i<obs.length-1?22:0)});
    var bh=yy-top+16;x.fillStyle="#DCE6F7";x.beginPath();if(x.roundRect)x.roundRect(L,top,R-L,bh,8);else x.rect(L,top,R-L,bh);x.fill();
    x.fillStyle=AZ;x.fillRect(L,top,4,bh);fnt(700,10.5);x.fillText("OBSERVAÇÃO IMPORTANTE",bx,top+18);
    obs.forEach(function(t,i){para([{t:t,b:1}],ys[i],11.6,17,{c:INK,b:1},bx,bw)});y=top+bh-20}
  fnt(400,11);x.fillStyle=INK;x.fillText("Atenciosamente,",L,y+44);x.fillText("Equipe Monte Fuji",L,y+60);
  /* fundo: o mascote encolhe (ancorado embaixo) quando o texto fica comprido */
  mx.fillStyle="#B5B5B5";mx.fillRect(0,0,W,H);
  if(im[0])mx.drawImage(im[0],12.26,12.04,571.71,99.51);
  mx.fillStyle="#EEEEEE";mx.beginPath();if(mx.roundRect)mx.roundRect(12.26,119.97,571.71,656.25,12);else mx.rect(12.26,119.97,571.71,656.25);mx.fill();
  var mh=Math.max(110,Math.min(270.34,(776.22-(y+60)-14)/.73)),mw2=571.71*mh/270.34;
  if(im[1]){mx.drawImage(im[1],12.26,505.88,571.71,270.34);
    if(mh<270.34){var cw=560/1400;mx.fillStyle="#EEEEEE";mx.fillRect(12.26,505.88,571.71*cw,270.34);mx.drawImage(im[1],0,0,1400*cw,662,12.26,776.22-mh,mw2*cw,mh)}}
  if(im[2])mx.drawImage(im[2],12.26,782.53,571.71,47.15);
  mx.setTransform(1,0,0,1,0,0);mx.drawImage(tc,0,0);
  return cv})}
/* PDF de uma página com a imagem JPEG ocupando o A4 */
function pdfJpeg(jpg,w,h){var te=new TextEncoder(),parts=[],len=0,offs=[];
  function put(d){var u=typeof d==="string"?te.encode(d):d;parts.push(u);len+=u.length}
  function obj(n,body){offs[n]=len;put(n+" 0 obj\n"+body+"\nendobj\n")}
  put("%PDF-1.4\n");obj(1,"<< /Type /Catalog /Pages 2 0 R >>");obj(2,"<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  obj(3,"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>");
  var cs="q 595.28 0 0 841.89 0 0 cm /Im0 Do Q";obj(4,"<< /Length "+cs.length+" >>\nstream\n"+cs+"\nendstream");
  offs[5]=len;put("5 0 obj\n<< /Type /XObject /Subtype /Image /Width "+w+" /Height "+h+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+jpg.length+" >>\nstream\n");put(jpg);put("\nendstream\nendobj\n");
  var xr=len,t="xref\n0 6\n0000000000 65535 f \n";for(var i=1;i<=5;i++)t+=String(offs[i]).padStart(10,"0")+" 00000 n \n";
  put(t+"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n"+xr+"\n%%EOF\n");return new Blob(parts,{type:"application/pdf"})}
function slug(t){return norm(t).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function openComunicado(e){
  var m=$("#cmModal");
  if(!m){document.body.insertAdjacentHTML("beforeend",'<div class="modal" id="cmModal" hidden><div class="box cmbox" role="dialog" aria-modal="true" aria-labelledby="cmT"><div class="ch" style="margin:0"><h3 id="cmT">Comunicado para o cliente</h3><span class="pill ok">PDF</span></div>'
    +'<div class="cmg"><div class="cmf"><div class="fld"><label for="cmNome">Nome no comunicado</label><input id="cmNome" type="text"></div>'
    +'<div class="fld"><label for="cmPub">Para quem</label><select id="cmPub"><option value="cond">Condôminos</option><option value="col">Colaboradores</option></select></div>'
    +'<div class="fld"><label for="cmData">Data do serviço</label><input id="cmData" type="date"></div>'
    +'<div class="fld"><label for="cmHora">A partir das</label><select id="cmHora">'+[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22].map(function(h){return '<option value="'+h+'">'+h+'h</option>'}).join("")+'</select></div>'
    +'<div class="fld"><label for="cmObs">Observação <small>· opcional, sai em destaque</small></label><textarea id="cmObs" rows="3" placeholder="Ex.: o acesso à garagem ficará fechado das 14h às 16h"></textarea></div>'
    +'<p class="sub" style="margin:0">O serviço e o texto de recomendações vêm do agendamento.</p></div>'
    +'<div class="cmprev"><img id="cmPrev" alt="Prévia do comunicado"></div></div>'
    +'<div class="acts"><button class="ghost" type="button" data-cmx>Cancelar</button><button class="cta rq" type="button" id="cmGo">'+ic("down",13)+' Baixar comunicado</button></div></div></div>');
    m=$("#cmModal");var tm=null;
    m.addEventListener("input",function(){clearTimeout(tm);tm=setTimeout(prev,200)});
    m.addEventListener("click",function(ev){
      if(ev.target===m||ev.target.closest("[data-cmx]")){m.hidden=true;return}
      if(ev.target.closest("#cmGo")){var o=cur(),bt=$("#cmGo");if(!o.nome){toast("Informe o nome que vai no comunicado.");return}bt.disabled=true;
        comCanvas(comDados(o),2.5).then(function(cv){var b64=cv.toDataURL("image/jpeg",.9).split(",")[1],bin=atob(b64),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
          saveFile("comunicado-"+slug(o.nome)+"-"+o.date+".pdf",pdfJpeg(u,cv.width,cv.height),function(ok,code){bt.disabled=false;if(ok){m.hidden=true;toast("Comunicado baixado.")}else if(code!=="declined")toast("Não foi possível baixar o arquivo aqui.")})})}
    });
  }
  function cur(){return {nome:$("#cmNome").value.trim(),pub:$("#cmPub").value,date:$("#cmData").value||e.date,h:+$("#cmHora").value,obs:$("#cmObs").value,svs:m._svs}}
  function prev(){var o=cur();comCanvas(comDados(o),.9).then(function(cv){$("#cmPrev").src=cv.toDataURL("image/png")})}
  m._svs=e.svs||[e.s];$("#cmNome").value=e.cli;$("#cmPub").value=/condom|cond\.|edif|resid/i.test(e.cli)||!/ltda|s\/a|eireli|\bme\b|empresa/i.test(e.cli)?"cond":"col";
  $("#cmData").value=e.date;$("#cmObs").value="";$("#cmHora").value=String(e.h);m.hidden=false;prev();
}
