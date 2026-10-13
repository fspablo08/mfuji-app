/* ===== ORDENS DE SERVIÇO ===== */
var _drvCb=null;
function openDriveModal(q,cb){
  var m=$("#drvModal");
  if(!m){
    m=document.createElement("div");m.className="modal";m.id="drvModal";m.hidden=true;
    m.innerHTML='<div class="box" role="dialog" aria-modal="true" aria-labelledby="dvT"><div class="ch" style="margin:0"><h3 id="dvT">Buscar pasta no Google Drive</h3><span class="pill go">Drive / Clientes</span></div>'
    +'<div class="search">'+ic("search",14)+'<input id="dvQ" placeholder="Nome do cliente ou da pasta" aria-label="Buscar pasta"></div><ul class="dvl" id="dvL"></ul>'
    +'<div class="acts"><button class="ghost" type="button" data-dvx>Fechar</button></div></div>';
    document.body.appendChild(m);
    m.addEventListener("click",function(e){
      if(e.target===m||e.target.closest("[data-dvx]")){m.hidden=true;return}
      var li=e.target.closest("[data-fold]");if(li){m.hidden=true;_drvCb&&_drvCb(li.dataset.fold)}
    });
    m.addEventListener("input",draw);
  }
  function draw(){var qq=norm($("#dvQ").value.trim());
    var L=DRIVE_FOLDERS.filter(function(f){return !qq||norm(f).indexOf(qq)>=0});
    $("#dvL").innerHTML=L.length?L.map(function(f){var c=CLIENTES.find(function(x){return x.pasta==="Clientes / "+f});return '<li data-fold="'+f.replace(/"/g,"&quot;")+'" tabindex="0">'+ic("drive",16)+'<span class="grow"><b>'+f+'</b><small>Drive / Clientes / '+f+'</small></span>'+(c?'<span class="pill ok">Vinculada a '+c.nome+'</span>':'<span class="pill ne">Sem cliente no sistema</span>')+'</li>'}).join(""):'<li class="mut">Nenhuma pasta encontrada.</li>'}
  _drvCb=cb;$("#dvQ").value=q||"";draw();m.hidden=false;setTimeout(function(){$("#dvQ").focus()},30);
}
VIEWS.os=function(v){
  var nextNo=1249;
  v.innerHTML='<div class="grid">'
  +'<div class="card c3 hero"><div class="ring" aria-hidden="true"></div><div class="hh"><span>Ordens em setembro</span><button class="plus" type="button" id="osNewTop" aria-label="Nova OS">+</button></div><b class="num">1.248<small>OS</small></b><p class="hs">▲ 9,2% vs. agosto · 1.106 concluídas</p></div>'
  +'<div class="card c9"><div class="ch"><h4>Como funciona</h4><span class="pill go">Substitui o fluxo manual no Google Drive</span></div><div class="kp" style="--n:3">'
   +'<div><span class="sq">'+ic("drive",14)+'</span><span class="t">1. Busque</span><b style="font-size:13px;white-space:normal">O cliente ou a pasta dele no Drive</b></div>'
   +'<div><span class="sq">'+ic("os",14)+'</span><span class="t">2. Preencha</span><b style="font-size:13px;white-space:normal">Serviço, observações e data</b></div>'
   +'<div><span class="sq">'+ic("print",14)+'</span><span class="t">3. Gere</span><b style="font-size:13px;white-space:normal">OS no modelo de vocês, salva na pasta do cliente</b></div></div></div>'
  +'<div class="card c6"><div class="ch"><h4>Nova ordem de serviço</h4><div class="steps"><span class="on" id="stp1"><i>1</i>Cliente</span><span id="stp2"><i>2</i>Serviço</span><span><i>3</i>Gerar e salvar</span></div></div>'
   +'<div class="fld"><div class="lrow"><label for="oCli">Cliente</label><span style="display:flex;gap:12px"><button class="lnk" type="button" id="oDrvBusca">'+ic("drive",11)+' Buscar pasta no Drive</button><button class="lnk" type="button" id="oNewCli">'+ic("plus",11)+' Novo cliente</button></span></div>'+cliPick("oCli",CLIENTES[0].nome)+'</div>'
   +'<div class="dbox" id="oDrive"></div>'
   +'<div class="form">'
   +'<div class="fld full"><label for="oSv">Serviço a ser executado</label><textarea id="oSv" rows="2" placeholder="Ex.: desobstrução dos vasos do banheiro feminino do 13º e 23º andar e PNE do 4º">Dedetização das áreas comuns: garagem, salão de festas e casa de máquinas</textarea><small class="hint">Sai em letras maiúsculas na OS, como no modelo.</small></div>'
   +'<div class="fld full"><label for="oObs">Observações</label><textarea id="oObs" placeholder="Opcional. Se ficar vazio, a OS mostra “-”"></textarea></div>'
   +'<div class="fld"><label for="oD">Data</label><input id="oD" type="date" value="2026-10-14"></div></div>'
   +'<div class="drive">'+ic("drive",15)+'Será salva em <code id="oPath"></code></div>'
   +'<div class="acts"><button class="ghost" type="button" id="oPrint">'+ic("print",13)+' Imprimir</button><button class="cta" type="button" id="oGen">Gerar OS e salvar no Drive</button></div></div>'
  +'<div class="card c6"><div class="ch"><h4>Pré-visualização</h4><span class="pill ok">Modelo Monte Fuji · Termo de execução</span></div><div class="a4wrap"><div class="a4" id="oDoc"></div></div></div>'
  +'<div class="card c12"><div class="ch"><h4>Ordens emitidas</h4><div class="r"><div class="filt" role="group" aria-label="Status"><button type="button" aria-pressed="true">Todas</button><button type="button" aria-pressed="false">Concluída</button><button type="button" aria-pressed="false">Aguardando assinatura</button><button type="button" aria-pressed="false">Cancelada</button></div></div></div><div class="scroll-x"><table class="tb" id="osTb"><thead><tr><th>Número ⇅</th><th>Cliente</th><th>Serviço</th><th>Status</th><th>Arquivo</th></tr></thead><tbody></tbody></table></div></div>'
  +'</div>';
  function cli(){var n=$("#oCli").value.trim();return CLIENTES.find(function(c){return c.nome===n})}
  function svs(){var t=$("#oSv").value.trim();return t?[t]:[]}
  function drive(){
    var c=cli(),b=$("#oDrive");
    if(!c){b.innerHTML='<div class="dh">'+ic("drive",16)+'<span class="grow"><b>Cliente não encontrado</b><small>Escolha um cliente da lista ou cadastre um novo.</small></span></div>';return}
    if(!c.pasta){b.className="dbox none";b.innerHTML='<div class="dh">'+ic("drive",16)+'<span class="grow"><b>Nenhuma pasta vinculada</b><small>'+c.nome+' ainda não tem pasta ligada no sistema.</small></span><button class="ghost" type="button" id="oLink">Vincular pasta do Drive</button></div>';return}
    b.className="dbox";var fs=driveFiles(c);
    b.innerHTML='<div class="dh">'+ic("drive",16)+'<span class="grow"><b>Drive / '+c.pasta+'</b><small>Pasta vinculada · '+fs.length+' arquivos</small></span><button class="ghost" type="button" data-t="No sistema final, abre a pasta no Google Drive.">Abrir pasta ↗</button><button class="dots" type="button" id="oLink" title="Trocar pasta" aria-label="Trocar pasta">⇄</button></div>'
     +(fs.length?'<ul class="fls">'+fs.slice(0,3).map(function(f){return '<li><span class="ft '+(f[2]==="OS"?"os":"ce")+'">PDF</span><span class="grow">'+f[0]+'</span><span class="sub">'+dmy(f[1])+'</span></li>'}).join("")+'</ul>':'<p class="mut txt" style="margin:0">Pasta vazia. A primeira OS deste cliente vai ficar aqui.</p>');
  }
  function doc(){
    var c=cli()||{nome:$("#oCli").value.trim()||"Cliente",razao:$("#oCli").value.trim()||"—",doc:"—",contato:"—",tel:"—",end:"—"},d=$("#oD").value||"2026-10-14",sv=svs();
    $("#oPath").textContent="Drive / "+(c.pasta||"Clientes / "+c.nome)+" / Ordens de serviço / OS-2026-"+nextNo+".pdf";
    $("#stp1").className=cli()?"ok":"on";$("#stp1").firstChild.textContent=cli()?"✓":"1";$("#stp2").className=cli()?"on":"";
    var dd=new Date(d+"T12:00"),dt=dd.getDate()+" de "+MES[dd.getMonth()]+" de "+dd.getFullYear(),esc=function(x){return String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;")};
    var resp=c.contato.split("(")[0].trim(),obs=$("#oObs").value.trim();
    $("#oDoc").innerHTML='<div class="tes"><img class="lg" alt="Monte Fuji Desentupidora e Dedetizadora" src="data:image/png;base64,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"><h1>Termo de execução de serviço</h1>'
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
  function table(f){
    $("#osTb tbody").innerHTML=OSL.filter(function(o){return !f||f==="Todas"||o[6]===f}).map(function(o){return '<tr><td><b>'+o[0]+'</b><small>'+dmy(o[1])+'</small></td><td>'+o[2]+'</td><td>'+o[3]+'</td><td>'+stPill(o[6])+'</td><td><button class="ghost" type="button" data-t="Abriria o PDF da '+o[0]+' na pasta do cliente.">'+ic("drive",12)+' PDF</button></td></tr>'}).join("");
  }
  function pickFolder(f){
    var c=CLIENTES.find(function(x){return x.pasta==="Clientes / "+f});
    if(c){$("#oCli").value=c.nome;upd();toast("Pasta de "+c.nome+" selecionada.");return}
    var cur=cli();
    if(cur&&!cur.pasta){cur.pasta="Clientes / "+f;upd();toast("Pasta “"+f+"” vinculada a "+cur.nome+".");return}
    openCliModal(f,function(nc){nc.pasta="Clientes / "+f;$("#oCli").value=nc.nome;upd()});toast("Esta pasta ainda não tem cliente no sistema. Complete o cadastro.");
  }
  v.addEventListener("input",function(e){if(e.target.closest(".form")||e.target.id==="oCli")upd()});
  v.addEventListener("change",function(e){if(e.target.closest(".form"))doc()});
  v.addEventListener("click",function(e){
    if(e.target.closest("#oPrint")){toast("No sistema final, abre a impressão da OS no modelo de vocês.");return}
    if(e.target.closest("#osNewTop")){$("#oCli").focus();return}
    if(e.target.closest("#oDrvBusca")){openDriveModal("",pickFolder);return}
    if(e.target.closest("#oLink")){var c0=cli();openDriveModal(c0?c0.nome.split(" ").slice(-1)[0]:"",function(f){var c1=cli();var dono=CLIENTES.find(function(x){return x.pasta==="Clientes / "+f&&x!==c1});if(dono){toast("Essa pasta já é de "+dono.nome+".");return}c1.pasta="Clientes / "+f;upd();toast("Pasta vinculada a "+c1.nome+".")});return}
    if(e.target.closest("#oNewCli")){var t=$("#oCli").value.trim();openCliModal(t&&!cli()?t:"",function(c){$("#oCli").value=c.nome;upd()});return}
    if(e.target.closest("#oGen")){var c=cli();if(!c){toast("Escolha um cliente cadastrado.");return}if(!svs().length){toast("Descreva o serviço a ser executado.");$("#oSv").focus();return}
      if(!c.pasta)c.pasta="Clientes / "+c.nome;
      OSL.unshift(["OS-2026-"+nextNo,$("#oD").value,c.nome,svs()[0].length>60?svs()[0].slice(0,58)+"…":svs()[0],"—",0,"Aguardando assinatura"]);toast("OS-2026-"+nextNo+" gerada e salva em Drive / "+c.pasta+" (protótipo).");nextNo++;table();upd();return}
    var f=e.target.closest(".filt button");if(f){$$(".filt button",v).forEach(function(b){b.setAttribute("aria-pressed",b===f?"true":"false")});table(f.textContent)}
  });
  VIEWS.os.pre=function(id,ev){var c=CLIENTES.find(function(x){return x.id===id});if(c)$("#oCli").value=c.nome;else if(ev)$("#oCli").value=ev.cli;
    if(ev){$("#oSv").value=(ev.svs||[ev.s]).join(" e ");$("#oD").value=ev.date;$("#oObs").value=ev.obs||"";toast("OS preenchida com os dados do agendamento.")}upd()};
  bindPick($("#oCli"),function(){upd()});
  table();upd();
};

/* ===== E-MAILS ===== */
VIEWS.mail=function(v){
  var st={f:"responder",id:1,cx:"todas"};
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
    +'</ul><div class="intg" style="margin-top:auto"><span class="lg2" style="background:#C2413A">M</span><span class="grow"><b>Gmail</b><small>'+(st.cx==="todas"?"3 caixas conectadas":cxOf(st.cx)[2])+' · exemplo</small></span></div></div>'
    +'<div class="card mlist"><div class="search" style="flex:none">'+ic("search",14)+'<input placeholder="Buscar e-mails" aria-label="Buscar e-mails"></div>'
    +(L.length?L.map(function(x){return '<div class="it'+(x.id===st.id?' on':'')+(x.unread?' unread':'')+'" data-id="'+x.id+'"><div class="r1"><b>'+x.de+'</b><span class="sub">'+x.hora+'</span></div>'+(st.cx==="todas"?'<span class="cxt" style="--c:'+cxOf(x.cx)[3]+'">'+cxOf(x.cx)[1]+'</span>':'')+'<span class="s">'+x.ass+'</span><span class="p">'+x.body.split("\n").filter(Boolean)[0]+'</span>'+(x.st==="responder"?'<span><span class="pill er">A responder</span></span>':x.st==="pendente"?'<span><span class="pill al">Aguardando cliente</span></span>':'')+'</div>'}).join(""):'<p class="mut" style="padding:12px">Nada por aqui.</p>')+'</div>'
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
var CLI_SEL=1,CLI_OPEN=false;
function garInfo(g){var fim=ymd(addDays(new Date(g[1]+"T12:00"),g[2])),left=diffDays(fim,"2026-10-07");return {fim:fim,left:left,pct:Math.max(0,Math.min(100,100-left/g[2]*100))}}
function garTxtDias(n){return n>=365?Math.round(n/365)*12+" meses":n>=30?Math.round(n/30)+(Math.round(n/30)===1?" mês":" meses"):n+" dias"}
function proxVisita(c){return EVENTS.filter(function(e){return e.cli===c.nome&&e.date>="2026-10-07"}).sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:a.h-b.h})}
function finSit(c){var p=pagamentos(c),ab=p.filter(function(x){return x[3]!=="Pago"});return {lista:p,aberto:ab.reduce(function(s,x){return s+x[2]},0),venc:ab.some(function(x){return x[3]==="Vencido"}),n:ab.length}}
VIEWS.cli=function(v){
  var st={p:"Todos",q:""};
  function list(){
    v.innerHTML='<div class="grid">'
    +'<div class="card c12" style="padding:12px"><div class="kp" style="--n:4">'
     +'<div><span class="sq">'+ic("cli",14)+'</span><span class="t">Clientes ativos</span><b class="num">1.898</b><span class="delta up">▲ 3,1%</span></div>'
     +'<div><span class="sq">'+ic("shield",14)+'</span><span class="t">Com garantia vigente</span><b class="num">412</b><span class="pill go">LEGADO</span></div>'
     +'<div><span class="sq">'+ic("clock",14)+'</span><span class="t">Garantias vencendo em 30 dias</span><b class="num">41</b><span class="pill al">Oportunidade de renovação</span></div>'
     +'<div><span class="sq">'+ic("agenda",14)+'</span><span class="t">Sem visita há 6+ meses</span><b class="num">87</b><span class="pill er">Reativar</span></div></div></div>'
    +'<div class="card c12"><div class="ch"><h4>Cadastro de clientes</h4><div class="r"><span class="srcs"><span>Drive</span><span>Agenda</span><span>Conta Azul</span><span>Gmail</span></span><button class="cta" type="button" data-newcli>'+ic("plus",13)+'Novo cliente</button></div></div>'
     +'<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><div class="search" style="flex:1 1 260px">'+ic("search",14)+'<input id="cQ" placeholder="Nome, razão social ou CNPJ" aria-label="Buscar clientes" value="'+st.q.replace(/"/g,"&quot;")+'"></div><div class="filt" role="group" aria-label="Perfil">'+["Todos","Residência","Comércio","Condomínio","Construtora"].map(function(p){return '<button type="button" aria-pressed="'+(st.p===p)+'">'+p+'</button>'}).join("")+'</div></div>'
     +'<div class="scroll-x"><table class="tb" id="cTb"><thead><tr><th>Cliente</th><th>CNPJ / CPF</th><th>Último serviço</th><th>Garantia</th><th>Próxima visita</th><th>Financeiro</th><th></th></tr></thead><tbody></tbody></table></div><p class="sub">Clique num cliente para abrir a ficha completa. Clientes de exemplo; os cadastrados aqui ficam só nesta sessão do protótipo.</p></div></div>';
    table();
    $("#cQ").addEventListener("input",function(e){st.q=e.target.value;table()});
  }
  function table(){
    if(!$("#cTb"))return;
    var q=norm(st.q.trim()),qd=digits(q);
    $("#cTb tbody").innerHTML=CLIENTES.filter(function(c){return (st.p==="Todos"||c.perfil===st.p)&&(!q||norm(c.nome+" "+c.doc+" "+c.contato+" "+c.razao).indexOf(q)>=0||(qd.length>=4&&digits(c.doc).indexOf(qd)>=0))}).map(function(c){
      var g=c.gar.map(garInfo).sort(function(a,b){return a.left-b.left})[0],h=c.hist[0],pv=proxVisita(c)[0],f=finSit(c);
      return '<tr class="cl" data-id="'+c.id+'"><td><b>'+c.nome+'</b><small>'+c.contato+'</small></td><td class="num">'+c.doc+'</td>'
      +'<td>'+(h?'<b>'+(SERV[h[1]]?SERV[h[1]].sh:h[1])+'</b><small>'+dmy(h[0])+'</small>':'<span class="mut">Sem serviços</span>')+'</td>'
      +'<td>'+(!g?'<span class="pill ne">—</span>':g.left<0?'<span class="pill ne">Encerrada</span>':g.left<=30?'<span class="pill al">'+g.left+' dias</span>':'<span class="pill go">até '+dmy(g.fim)+'</span>')+'</td>'
      +'<td>'+(pv?'<b>'+dmy(pv.date).slice(0,5)+'</b><small>'+svShort(pv)+'</small>':'<span class="mut">—</span>')+'</td>'
      +'<td>'+(!f.lista.length?'<span class="pill ne">—</span>':f.n?'<span class="pill '+(f.venc?'er':'al')+'">'+brl(f.aberto)+(f.venc?' vencido':' em aberto')+'</span>':'<span class="pill ok">Em dia</span>')+'</td><td class="r"><span class="chev">›</span></td></tr>'}).join("")||'<tr><td colspan="7" class="mut">Nenhum cliente encontrado.'+(qd.length===14?' <button class="lnk" type="button" data-newcli>Buscar este CNPJ e cadastrar</button>':'')+'</td></tr>';
  }
  function prof(){
    var c=CLIENTES.find(function(x){return x.id===CLI_SEL});if(!c){CLI_OPEN=false;return list()}
    var os=osDoCliente(c),pv=proxVisita(c),f=finSit(c),em=EMAILS.filter(function(m){return m.cli===c.id}),fs=c.pasta?driveFiles(c):[],h=c.hist[0];
    var gs=c.gar.map(function(g){return [g,garInfo(g)]}).sort(function(a,b){return a[1].left-b[1].left}),gv=gs.filter(function(x){return x[1].left>=0});
    var ini=c.nome.split(" ").filter(function(w){return w.length>2}).map(function(w){return w[0]}).join("").slice(0,2);
    v.innerHTML='<div class="grid">'
    +'<div class="card c12 phead"><div class="prof"><button class="ghost" type="button" data-cback>‹ Clientes</button><span class="bigav">'+ini+'</span><div style="flex:1;min-width:0"><h3>'+c.nome+'</h3><span class="sub">'+c.razao+' · '+c.doc+'</span><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:5px"><span class="tag">'+c.perfil+'</span>'+(gv.length?'<span class="pill go">Garantia vigente</span>':'')+(f.n?'<span class="pill '+(f.venc?'er':'al')+'">'+(f.venc?'Inadimplente':'Fatura em aberto')+'</span>':f.lista.length?'<span class="pill ok">Pagamentos em dia</span>':'')+'</div></div>'
     +'<div class="pacts"><button class="ghost" type="button" data-agd>'+ic("agenda",13)+' Agendar</button><button class="ghost" type="button" data-mail>'+ic("mail",13)+' E-mail</button><button class="cta" type="button" data-newos="'+c.id+'">'+ic("plus",13)+'Nova OS</button></div></div></div>'
    +'<div class="card c12" style="padding:12px"><div class="kp" style="--n:4">'
     +'<div><span class="sq">'+ic("os",14)+'</span><span class="t">Último serviço</span><b class="num" style="font-size:15px">'+(h?(SERV[h[1]]?SERV[h[1]].sh:h[1]):"—")+'</b><span class="pill ne">'+(h?dmy(h[0])+' · '+h[3]:'Sem serviços')+'</span></div>'
     +'<div><span class="sq">'+ic("shield",14)+'</span><span class="t">Garantia</span><b class="num" style="font-size:15px">'+(gv.length?'até '+dmy(gv[0][1].fim):'Nenhuma vigente')+'</b><span class="pill '+(gv.length?(gv[0][1].left<=30?'al':'go'):'ne')+'">'+(gv.length?'faltam '+gv[0][1].left+' dias':'—')+'</span></div>'
     +'<div><span class="sq">'+ic("agenda",14)+'</span><span class="t">Próxima visita</span><b class="num" style="font-size:15px">'+(pv[0]?DIA3[new Date(pv[0].date+"T12:00").getDay()]+', '+dmy(pv[0].date).slice(0,5)+' · '+hh(pv[0].h):'Nada agendado')+'</b><span class="pill in">'+(pv[0]?svShort(pv[0]):'Agenda')+'</span></div>'
     +'<div><span class="sq">'+ic("fat",14)+'</span><span class="t">Em aberto</span><b class="num" style="font-size:15px">'+(f.n?brl(f.aberto):'R$ 0,00')+'</b><span class="pill '+(f.n?(f.venc?'er':'al'):'ok')+'">'+(f.n?f.n+' fatura'+(f.n>1?'s':''):'Em dia')+' · Conta Azul</span></div></div></div>'
    +'<div class="c8" style="display:flex;flex-direction:column;gap:10px">'
     +'<div class="card"><div class="ch"><h4>Ordens de serviço</h4><div class="r"><span class="src">Sistema · Drive</span><button class="ghost" type="button" data-newos="'+c.id+'">+ Nova OS</button></div></div>'
      +(os.length?'<div class="scroll-x"><table class="tb"><thead><tr><th>Número</th><th>Serviço</th><th>Técnico</th><th>Status</th><th>Arquivo</th></tr></thead><tbody>'+os.slice(0,6).map(function(o){return '<tr><td><b>'+o[0]+'</b><small>'+dmy(o[1])+'</small></td><td>'+o[3]+'</td><td>'+o[4]+'</td><td>'+stPill(o[6])+'</td><td><button class="ghost" type="button" data-t="Abriria '+o[0]+'.pdf na pasta do cliente.">'+ic("drive",12)+' PDF</button></td></tr>'}).join("")+'</tbody></table></div>':'<p class="mut txt">Nenhuma OS emitida ainda.</p>')+'</div>'
     +'<div class="card"><div class="ch"><h4>Pagamentos</h4><span class="src">Conta Azul</span></div>'
      +(f.lista.length?'<div class="scroll-x"><table class="tb"><thead><tr><th>Vencimento</th><th>Descrição</th><th>Forma</th><th class="r">Valor</th><th>Status</th></tr></thead><tbody>'+f.lista.map(function(p){return '<tr><td class="num">'+dmy(p[0])+'</td><td>'+p[1]+'</td><td>'+p[4]+'</td><td class="r num">'+brl(p[2])+'</td><td><span class="pill '+(p[3]==="Pago"?'ok':p[3]==="Vencido"?'er':'al')+'">'+p[3]+'</span></td></tr>'}).join("")+'</tbody></table></div>':'<p class="mut txt">Nenhum lançamento na Conta Azul.</p>')+'</div>'
     +'<div class="card"><div class="ch"><h4>E-mails</h4><span class="src">Gmail · 3 caixas</span></div><ul class="ls">'
      +(em.length?em.map(function(m){return '<li data-em="'+m.id+'" class="lk"><span class="sq">'+ic(m.f==="sent"?"reply":"mail",13)+'</span><span class="grow"><b>'+m.ass+'</b><small>'+(m.f==="sent"?"Enviado · ":"Recebido · ")+m.data+' · '+m.cx+'@</small></span>'+(m.st==="responder"?'<span class="pill er">A responder</span>':m.st==="pendente"?'<span class="pill al">Aguardando</span>':'')+'</li>'}).join(""):'<li class="mut">Nenhum e-mail com este cliente.</li>')+'</ul></div>'
    +'</div>'
    +'<div class="c4" style="display:flex;flex-direction:column;gap:10px">'
     +'<div class="card"><div class="ch"><h4>Cadastro</h4><button class="ghost" type="button" data-t="Abriria a edição do cadastro.">Editar</button></div><div class="kv2 one"><div><small>Razão social</small><span>'+c.razao+'</span></div><div><small>CNPJ / CPF</small><span>'+c.doc+'</span></div><div><small>Contato</small><span>'+c.contato+' · '+c.tel+'</span></div><div><small>E-mail</small><span>'+c.email+'</span></div><div><small>Endereço</small><span>'+c.end+'</span></div></div></div>'
     +'<div class="card"><div class="ch"><h4>Garantias</h4></div>'+(gs.length?gs.map(function(x){var g=x[0],i=x[1];return '<div style="display:grid;gap:5px"><div style="display:flex;justify-content:space-between;gap:8px;font-size:12px"><b style="font-weight:600">'+(SERV[g[0]]?SERV[g[0]].sh:g[0])+' · '+garTxtDias(g[2])+'</b><span class="'+(i.left<0?'mut':'')+'" style="white-space:nowrap">'+(i.left<0?'Encerrada '+dmy(i.fim).slice(0,5):'até '+dmy(i.fim))+'</span></div><div class="gbar"><i style="width:'+i.pct+'%;'+(i.left<0?'background:#CAC9C5':i.left<=30?'background:var(--alerta)':'')+'"></i></div></div>'}).join(""):'<p class="mut txt">Nenhuma garantia registrada.</p>')+'</div>'
     +'<div class="card"><div class="ch"><h4>Agenda</h4><a class="ghost" href="#agenda">Abrir</a></div><ul class="ls">'+(pv.length?pv.slice(0,4).map(function(e){return '<li><span class="tm">'+dmy(e.date).slice(0,5)+'</span><span class="bar-t" style="background:'+SERV[e.s].c+'"></span><span class="grow"><b>'+svShort(e)+'</b><small>'+hh(e.h)+' · '+garTxt(e.gar)+'</small></span></li>'}).join(""):'<li class="mut">Nenhuma visita agendada.</li>')+'</ul></div>'
     +'<div class="card"><div class="ch"><h4>Pasta no Drive</h4><span class="src">Google Drive</span></div>'+(c.pasta?'<div class="drive" style="margin:0">'+ic("drive",15)+'<code>Drive / '+c.pasta+'</code></div><ul class="fls">'+fs.slice(0,5).map(function(x){return '<li><span class="ft '+(x[2]==="OS"?"os":"ce")+'">PDF</span><span class="grow">'+x[0]+'</span><span class="sub">'+dmy(x[1]).slice(0,5)+'</span></li>'}).join("")+'</ul>':'<p class="mut txt">Nenhuma pasta vinculada.</p><button class="ghost" type="button" data-clink>Vincular pasta do Drive</button>')+'</div>'
     +aiBox(nextTip(c),'Escrever e-mail','data-mail')
    +'</div></div>';
    window.scrollTo(0,0);
  }
  function nextTip(c){if(!c.gar.length)return 'Cliente novo. Que tal agendar a primeira visita e já registrar a garantia?';var g=c.gar.map(function(x){return [x[0],garInfo(x)]}).sort(function(a,b){return a[1].left-b[1].left})[0],f=finSit(c);
    return (f.venc?'Há <b>'+brl(f.aberto)+'</b> em aberto na Conta Azul, parte já vencida. Vale cobrar antes de agendar o próximo serviço. ':'')+(g[1].left<0?'A garantia de <b>'+g[0].toLowerCase()+'</b> terminou em '+dmy(g[1].fim)+'. Bom momento para oferecer uma nova visita preventiva.':'Próxima visita recomendada: <b>'+g[0].toLowerCase()+'</b> antes de '+dmy(g[1].fim)+', quando a garantia termina.')}
  function render(){if(CLI_OPEN)prof();else list()}
  v.addEventListener("click",function(e){
    var r=e.target.closest("tr.cl");if(r){CLI_SEL=+r.dataset.id;CLI_OPEN=true;prof();return}
    if(e.target.closest("[data-cback]")){CLI_OPEN=false;list();return}
    var f=e.target.closest(".filt button");if(f){$$(".filt button",v).forEach(function(b){b.setAttribute("aria-pressed",b===f?"true":"false")});st.p=f.textContent;table();return}
    if(e.target.closest("[data-newcli]")){openCliModal(digits(st.q).length===14?st.q:"",function(c){CLI_SEL=c.id;CLI_OPEN=true;prof()});return}
    if(e.target.closest("[data-clink]")){var c=CLIENTES.find(function(x){return x.id===CLI_SEL});openDriveModal(c.nome.split(" ").slice(-1)[0],function(fd){c.pasta="Clientes / "+fd;prof();toast("Pasta vinculada.")});return}
    var n=e.target.closest("[data-newos]");if(n){location.hash="#os";setTimeout(function(){VIEWS.os.pre&&VIEWS.os.pre(+n.dataset.newos)},30);return}
    if(e.target.closest("[data-agd]")){location.hash="#agenda";return}
    var em=e.target.closest("[data-em]");if(em||e.target.closest("[data-mail]")){location.hash="#mail";return}
  });
  document.addEventListener("click",function(e){if(e.target.closest('.menu a[data-v="cli"],[data-go="cli"]'))CLI_OPEN=false},true);
  VIEWS.cli.show=function(){render()};VIEWS.cli.refresh=function(){if(!CLI_OPEN)table()};
  render();
};

/* ===== CARTEIRA ===== */
VIEWS.cart=function(v){
  v.innerHTML='<div class="grid">'
  +'<div class="card c12" style="flex-direction:row;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 14px"><span class="lg2" style="width:34px;height:34px;border-radius:9px;background:#3872CF;color:#fff;display:grid;place-items:center;font-size:11px;font-weight:700">CA</span><span style="flex:1;min-width:200px"><b style="font-size:12.5px">Conta Azul</b><span class="sub" style="display:block">Integração prevista · dados de exemplo · última sincronização simulada hoje, 08:00</span></span><span class="pill al">Aguardando conexão</span><button class="ghost" type="button" data-t="Na fase de desenvolvimento, aqui entra o login da Conta Azul.">Configurar</button></div>'
  +'<div class="card hero c3"><div class="ring" aria-hidden="true"></div><div class="hh"><span>Saldo em caixa</span><button class="plus" type="button" aria-label="Lançar">+</button></div><b class="num">R$ 412.680<small>BRL</small></b><div class="ha"><button class="w" type="button" data-t="Lançaria um recebimento na Conta Azul.">Receber</button><button class="d" type="button" data-go="fat">Pagar ↗</button></div></div>'
  +'<div class="card c9"><div class="ch"><h4>Próximos 30 dias</h4><span class="sel">Outubro ⌄</span></div><div class="kp" style="--n:4">'
   +'<div><span class="sq">'+ic("up",14)+'</span><span class="t">A receber</span><b class="num">R$ 186.400</b><span class="delta up">▲ 6,2%</span></div>'
   +'<div><span class="sq">'+ic("down",14)+'</span><span class="t">A pagar</span><b class="num">R$ 92.180</b><span class="delta dn">▲ 4,8%</span></div>'
   +'<div><span class="sq">'+ic("os",14)+'</span><span class="t">Contratos ativos</span><b class="num">318</b><span class="delta up">▲ 4,0%</span></div>'
   +'<div><span class="sq">'+ic("clock",14)+'</span><span class="t">Inadimplência</span><b class="num">R$ 2.730</b><span class="pill er">4 clientes</span></div></div></div>'
  +'<div class="card c8"><div class="ch"><h4>Fluxo de caixa</h4><div class="r"><div class="lg"><span><i style="background:#18275E"></i>Receitas</span><span><i style="background:#5A8AD7"></i>Despesas</span></div></div></div><div class="chartbox"><svg id="kCf" viewBox="0 0 520 210" role="img" aria-label="Receitas e despesas mensais dos últimos 12 meses"></svg><div class="tip" id="kCfTip"></div></div></div>'
  +'<div class="card c4"><div class="ch"><h4>Inadimplentes</h4><span class="pill er">R$ 2.730,00</span></div><ul class="ls">'+INADIMP.map(function(i){return '<li><span class="grow"><b>'+i[0]+'</b><small>'+i[1]+' · '+i[3]+' dias em atraso</small></span><b class="num" style="flex:none;color:var(--erro)">'+brl(i[2])+'</b></li>'}).join("")+'</ul>'
   +aiBox('Escrevi uma mensagem de cobrança gentil para o <b>Restaurante Sabor da Serra</b>, com link do boleto atualizado.','Ver mensagem','data-ai')+'</div>'
  +'<div class="card c12"><div class="ch"><h4>Contratos</h4><div class="r"><div class="filt" role="group" aria-label="Status"><button type="button" aria-pressed="true">Todos</button><button type="button" aria-pressed="false">Ativo</button><button type="button" aria-pressed="false">Renovação pendente</button><button type="button" aria-pressed="false">Inadimplente</button></div></div></div><div class="scroll-x"><table class="tb" id="kTb"><thead><tr><th>Cliente</th><th>Plano</th><th class="r">Mensalidade</th><th>Início</th><th>Vencimento</th><th>Status</th></tr></thead><tbody></tbody></table></div></div>'
  +'</div>';
  function table(f){$("#kTb tbody").innerHTML=CONTRATOS.filter(function(c){return !f||f==="Todos"||c[5]===f}).map(function(c){return '<tr><td><b>'+c[0]+'</b></td><td>'+c[1]+'</td><td class="r num">'+brl(c[2])+'</td><td class="num">'+dmy(c[3])+'</td><td class="num">'+dmy(c[4])+'</td><td><span class="pill '+(c[5]==="Ativo"?"ok":c[5]==="Inadimplente"?"er":"al")+'">'+c[5]+'</span></td></tr>'}).join("")}
  v.addEventListener("click",function(e){var f=e.target.closest(".filt button");if(f){$$(".filt button",v).forEach(function(b){b.setAttribute("aria-pressed",b===f?"true":"false")});table(f.textContent)}});
  table();var show=cashflow($("#kCf"),$("#kCfTip"),11);VIEWS.cart.show=function(){setTimeout(function(){show(11)},20)};
};

/* ===== A RECEBER ===== */
var REC_SEL=1;
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
   +'<div class="fld"><label for="rVenc">Vencimento</label><input id="rVenc" type="date" value="2026-10-17"></div><div class="fld"><label for="rForma">Forma de pagamento</label><select id="rForma"><option>Boleto</option><option>Pix</option><option>Transferência</option><option>Dinheiro</option></select></div>'
   +'<div class="fld"><label for="rCob">Cobrança enviada em</label><input id="rCob" type="date"></div><div class="fld"><label for="rCanal">Enviada por</label><select id="rCanal"><option value="">Ainda não enviada</option><option>E-mail</option><option>WhatsApp</option><option>Correio</option><option>Em mãos</option></select></div>'
   +'<div class="fld full"><label for="rObs">Observações</label><textarea id="rObs" placeholder="Ex.: pagar só após o dia 15"></textarea></div></div>'
   +'<div class="acts"><button class="ghost" type="button" data-rx>Cancelar</button><button class="cta rq" type="button" id="rSave">Salvar lançamento</button></div></div></div>';
  function kp(){
    var ab=aberto(),tot=ab.reduce(function(s,r){return s+r.valor},0),venc=ab.filter(function(r){return recSt(r)[1]==="Vencido"}),sem=ab.filter(function(r){return !r.cob}),sete=ab.filter(function(r){return r.venc>="2026-10-07"&&r.venc<="2026-10-14"}),rec=RECEBER.filter(function(r){return r.pago&&r.pago.slice(0,7)==="2026-10"});
    function sum(a){return brl(a.reduce(function(s,r){return s+r.valor},0))}
    $("#rTot").innerHTML=brl(tot).replace("R$ ","R$ ")+'<small>BRL</small>';$("#rTotS").textContent=ab.length+" cobranças em aberto · "+venc.length+" vencidas";
    $("#rKp").innerHTML='<div><span class="sq" style="background:var(--erro-50);border-color:#F1C9C6;color:var(--erro)">'+ic("clock",14)+'</span><span class="t">Vencido</span><b class="num">'+sum(venc)+'</b><span class="pill er">'+venc.length+' cliente'+(venc.length===1?'':'s')+'</span></div>'
     +'<div><span class="sq">'+ic("agenda",14)+'</span><span class="t">Vence em 7 dias</span><b class="num">'+sum(sete)+'</b><span class="pill in">'+sete.length+' cobranças</span></div>'
     +'<div><span class="sq">'+ic("mail",14)+'</span><span class="t">Cobrança não enviada</span><b class="num">'+sem.length+'</b><span class="pill al">'+(sem.filter(function(r){return !r.nf}).length)+' sem nota fiscal</span></div>'
     +'<div><span class="sq">'+ic("up",14)+'</span><span class="t">Recebido em outubro</span><b class="num">'+sum(rec)+'</b><span class="pill ok">'+rec.length+' pagamentos</span></div>';
    BADGE.rec=String(RECEBER.filter(function(r){return recSt(r)[1]==="Vencido"}).length);var bd=$('.menu a[data-v="rec"] .bd');if(bd)bd.textContent=BADGE.rec;
  }
  function table(){
    $("#rFil").innerHTML=FIL.map(function(f){return '<button type="button" aria-pressed="'+(st.f===f)+'">'+f+'</button>'}).join("");
    var q=norm(st.q.trim()),qd=digits(q);
    var L=RECEBER.filter(pass).filter(function(r){return !q||norm(r.nome+" "+r.doc+" "+r.nf+" "+r.os+" "+r.serv).indexOf(q)>=0||(qd.length>=3&&(digits(r.doc)+" "+r.nf).indexOf(qd)>=0)}).sort(function(a,b){return a.venc<b.venc?-1:1});
    $("#rTb tbody").innerHTML=L.map(function(r){var s=recSt(r),late=s[1]==="Vencido"?diffDays("2026-10-07",r.venc):0;
      return '<tr class="cl'+(r.id===REC_SEL?' pick':'')+'" data-id="'+r.id+'"><td><b>'+r.nome+'</b><small>'+r.doc+'</small></td><td>'+(r.nf?'<b>NF '+r.nf+'</b><small>'+dmy(r.nfData)+'</small>':'<span class="mut">A emitir</span>')+'</td><td>'+(r.cob?'<b>'+dmy(r.cob)+'</b><small>'+r.canal+'</small>':'<span class="pill al">Não enviada</span>')+'</td><td><b>'+dmy(r.venc)+'</b><small>'+(r.pago?'Pago em '+dmy(r.pago).slice(0,5):late?late+' dias de atraso':r.forma)+'</small></td><td class="r num">'+brl(r.valor)+'</td><td><span class="pill '+s[0]+'">'+s[1]+'</span></td></tr>'}).join("")||'<tr><td colspan="6" class="mut">Nenhuma cobrança neste filtro.</td></tr>';
  }
  function det(){
    var r=RECEBER.find(function(x){return x.id===REC_SEL});if(!r){$("#rDet").innerHTML='<p class="mut">Selecione uma cobrança.</p>';return}
    var s=recSt(r),late=s[1]==="Vencido"?diffDays("2026-10-07",r.venc):0;
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
    setTimeout(function(){var x=consultaCNPJ(d);$("#rDoc").value=fmtCNPJ(d);$("#rNome").value=x.fantasia;$("#rTel").value=x.tel;$("#rEm").value=x.email;$("#rSt").innerHTML='<span class="pill ok">Situação '+x.situacao.toLowerCase()+'</span> <span class="mut">'+x.razao+' · '+x.end+'</span>';$("#rCon").focus()},500);
  }
  v.addEventListener("input",function(e){
    if(e.target.id==="rQ"){st.q=e.target.value;table();return}
    if(e.target.id==="rDoc"){var d=digits(e.target.value);if(d.length===14||d.length===11)fillFrom(d)}
  });
  v.addEventListener("click",function(e){
    var r0=e.target.closest("#rTb tr.cl");if(r0){REC_SEL=+r0.dataset.id;table();det();if(window.innerWidth<1100)$("#rDet").scrollIntoView({behavior:"smooth"});return}
    var f=e.target.closest("#rFil button");if(f){st.f=f.textContent;table();return}
    if(e.target.closest("[data-rnew]")){$$("#rModal input,#rModal textarea",v).forEach(function(i){i.value=""});$("#rVenc").value="2026-10-17";$("#rCanal").value="";$("#rSt").innerHTML='<span class="mut">Se o cliente já tiver cobranças aqui, os dados dele são reaproveitados.</span>';$("#rModal").hidden=false;$("#rDoc").focus();return}
    if(e.target.closest("[data-rx]")||e.target===$("#rModal")){$("#rModal").hidden=true;return}
    if(e.target.closest("#rBusca")){fillFrom(digits($("#rDoc").value));return}
    if(e.target.closest("#rSave")){
      var nome=$("#rNome").value.trim(),val=+$("#rVal").value;
      if(!nome){toast("Informe o cliente.");$("#rNome").focus();return}if(!val){toast("Informe o valor.");$("#rVal").focus();return}if(!$("#rVenc").value){toast("Informe o vencimento.");return}
      var cob=$("#rCob").value,canal=$("#rCanal").value;if(cob&&!canal)canal="E-mail";if(canal&&!cob)cob="2026-10-07";
      var n={id:Math.max.apply(null,RECEBER.map(function(x){return x.id}))+1,nome:nome,doc:$("#rDoc").value.trim()||"—",contato:$("#rCon").value.trim()||"—",tel:$("#rTel").value.trim()||"—",email:$("#rEm").value.trim()||"—",serv:$("#rServ").value.trim()||"Serviço avulso",os:$("#rOs").value.trim(),valor:val,nf:$("#rNf").value.trim(),nfData:$("#rNf").value.trim()?($("#rNfD").value||"2026-10-07"):"",cob:cob,canal:canal,forma:$("#rForma").value,venc:$("#rVenc").value,pago:"",hist:[],obs:$("#rObs").value.trim()};
      RECEBER.push(n);REC_SEL=n.id;st.f="Todos";$("#rModal").hidden=true;all();toast("Lançamento de "+brl(val)+" para "+nome+" salvo.");return}
    var r=RECEBER.find(function(x){return x.id===REC_SEL});
    if(e.target.closest("[data-dnf]")){var nf=$("#dNf").value.trim();if(!nf){toast("Informe o número da nota.");$("#dNf").focus();return}r.nf=nf;r.nfData="2026-10-07";all();toast("NF "+nf+" registrada.");return}
    if(e.target.closest("[data-dcob]")){r.cob="2026-10-07";r.canal="E-mail";all();toast("Cobrança enviada para "+r.email+" (protótipo).");return}
    if(e.target.closest("[data-dremind]")){r.hist.push(["2026-10-07","Lembrete enviado por e-mail"]);all();toast("Lembrete enviado para "+r.email+" (protótipo).");return}
    if(e.target.closest("[data-dpago]")){r.pago="2026-10-07";all();toast("Pagamento de "+brl(r.valor)+" registrado.");return}
  });
  all();
};

/* ===== FATURAS ===== */
VIEWS.fat=function(v){
  var open=FATURAS.filter(function(f){return f[5]!=="Paga"}),venc=open.filter(function(f){return f[3]<"2026-10-07"}),sem=open.filter(function(f){return f[3]>="2026-10-07"&&f[3]<="2026-10-11"});
  function sum(a){return a.reduce(function(s,f){return s+f[4]},0)}
  v.innerHTML='<div class="grid">'
  +'<div class="card c12" style="flex-direction:row;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 14px"><span style="width:34px;height:34px;border-radius:9px;background:#3872CF;color:#fff;display:grid;place-items:center;font-size:11px;font-weight:700">CA</span><span style="flex:1;min-width:200px"><b style="font-size:12.5px">Faturas recebidas no CNPJ</b><span class="sub" style="display:block">Importadas da Conta Azul · dados de exemplo</span></span><span class="pill al">Aguardando conexão</span></div>'
  +'<div class="card hero c3"><div class="ring" aria-hidden="true"></div><div class="hh"><span>A pagar em outubro</span></div><b class="num">'+brl(sum(open),0)+'</b><p class="hs">'+open.length+' contas em aberto</p></div>'
  +'<div class="card c9"><div class="kp" style="--n:3">'
   +'<div><span class="sq" style="background:var(--erro-50);border-color:#F1C9C6;color:var(--erro)">'+ic("clock",14)+'</span><span class="t">Vencidas</span><b class="num">'+brl(sum(venc))+'</b><span class="pill er">'+venc.length+' conta</span></div>'
   +'<div><span class="sq">'+ic("agenda",14)+'</span><span class="t">Vencem nesta semana</span><b class="num">'+brl(sum(sem))+'</b><span class="pill al">'+sem.length+' contas</span></div>'
   +'<div><span class="sq">'+ic("chk",14)+'</span><span class="t">Pagas no mês</span><b class="num">'+brl(sum(FATURAS.filter(function(f){return f[5]==="Paga"})))+'</b><span class="pill ok">2 contas</span></div></div></div>'
  +'<div class="card c12"><div class="ch"><h4>Próximos vencimentos</h4><span class="sub">14 dias</span></div><div class="chartbox"><svg id="fBar" viewBox="0 0 520 200" role="img" aria-label="Valor a pagar por dia nos próximos 14 dias"></svg><div class="tip" id="fTip" hidden></div></div></div>'
  +'<div class="card c12"><div class="ch"><h4>Faturas</h4><div class="r"><div class="filt" role="group" aria-label="Status">'+["Todas","Vencida","A vencer","Paga"].map(function(p,i){return '<button type="button" aria-pressed="'+(i?"false":"true")+'">'+p+'</button>'}).join("")+'</div></div></div><div class="scroll-x"><table class="tb" id="fTb"><thead><tr><th>Fornecedor ⇅</th><th>Categoria</th><th>Emissão</th><th>Vencimento ⇅</th><th class="r">Valor</th><th>Status</th><th></th></tr></thead><tbody></tbody></table></div></div>'
  +'</div>';
  function table(f){$("#fTb tbody").innerHTML=FATURAS.filter(function(x){return !f||f==="Todas"||x[5]===f}).sort(function(a,b){return a[3]<b[3]?-1:1}).map(function(x){var d=diffDays(x[3],"2026-10-07");
    return '<tr><td><b>'+x[0]+'</b></td><td><span class="tag">'+x[1]+'</span></td><td class="num">'+dmy(x[2])+'</td><td><b class="num">'+dmy(x[3])+'</b><small>'+(x[5]==="Paga"?"Paga":d<0?"Há "+(-d)+" dias":d===0?"Hoje":"Em "+d+" dias")+'</small></td><td class="r num" style="font-weight:600">'+brl(x[4])+'</td><td><span class="pill '+(x[5]==="Paga"?"ok":x[5]==="Vencida"?"er":d<=4?"al":"in")+'">'+x[5]+'</span></td><td>'+(x[5]!=="Paga"?'<button class="ghost" type="button" data-t="Marcaria como paga na Conta Azul.">Pagar</button>':'')+'</td></tr>'}).join("")}
  v.addEventListener("click",function(e){var f=e.target.closest(".filt button");if(f){$$(".filt button",v).forEach(function(b){b.setAttribute("aria-pressed",b===f?"true":"false")});table(f.textContent)}});
  var labs=[],vals=[];for(var i=0;i<14;i++){var d=addDays(TODAY,i),k=ymd(d);labs.push(String(d.getDate()).padStart(2,"0"));vals.push(open.filter(function(f){return f[3]===k}).reduce(function(s,f){return s+f[4]},0))}
  barsChart($("#fBar"),$("#fTip"),labs,vals,function(x,ax){return ax?(x>=1000?"R$ "+Math.round(x/1000)+"k":"R$ "+Math.round(x)):brl(x)},false);
  table();
};

/* ===== RELATÓRIOS ===== */
VIEWS.rel=function(v){
  var M9=MES3.slice(0,9);
  var R=[
   ["fin","Financeiro","Receitas por mês","R$ 1,84 mi",CF.rec.slice(3),function(x,ax){return ax?"R$ "+Math.round(x)+"k":"R$ "+x+" mil"},[["Receitas jan–set","R$ 1.839.000"],["Despesas jan–set","R$ 1.271.000"],["Resultado","R$ 568.000"],["Margem","30,9%"]]],
   ["emit","OS emitidas","Ordens emitidas por mês","10.420",[1080,1042,1150,1190,1120,1210,1236,1143,1248],function(x){return Math.round(x).toLocaleString("pt-BR")},[["Total jan–set","10.420"],["Média mensal","1.158"],["Maior mês","Set · 1.248"],["Por técnico (média)","232"]]],
   ["real","Serviços realizados","Serviços concluídos por mês","9.284",[962,931,1021,1062,996,1080,1101,1025,1106],function(x){return Math.round(x).toLocaleString("pt-BR")},[["Dedetização","3.412"],["Limpeza dos reservatórios de água superiores","2.268"],["Limpeza preventiva da rede de esgoto","2.501"],["Outros","1.103"]]],
   ["canc","Cancelados","Cancelamentos por mês","312",[38,35,31,29,40,34,33,34,38],function(x){return Math.round(x)},[["Cliente desmarcou","168"],["Chuva / acesso","74"],["Reagendado","51"],["Outros","19"]]],
   ["venc","Vencidos","OS não executadas no prazo","171",[24,19,21,18,15,17,16,19,22],function(x){return Math.round(x)},[["Em aberto hoje","22"],["Maior atraso","9 dias"],["Mais comum","Limpeza preventiva da rede de esgoto"],["Técnico com mais","—"]]],
   ["gar","Garantias","Garantias vencendo por mês","412 vigentes",[52,48,57,61,44,58,63,49,41],function(x){return Math.round(x)},[["Vigentes","412"],["Vencem em 30 dias","41"],["Renovadas no prazo","74%"],["Acionadas","18"]]]
  ],cur=0;
  v.innerHTML='<div class="grid"><div class="c12" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,180px),1fr));gap:10px" id="rCat">'
   +R.map(function(r,i){return '<button class="rep" type="button" data-r="'+i+'" aria-pressed="'+(i===0)+'"><span class="sq">'+ic(["cart","os","chk","x","clock","shield"][i],14)+'</span><b>'+r[1]+'</b><span class="v num">'+r[3]+'</span><small>'+r[2]+'</small></button>'}).join("")+'</div>'
   +'<div class="card c8"><div class="ch"><h4 id="rT"></h4><div class="r"><span class="sel">Jan – Set 2026 ⌄</span><button class="ghost" type="button" data-t="Exportaria em PDF.">PDF</button><button class="ghost" type="button" data-t="Exportaria em planilha.">Planilha</button></div></div><div class="chartbox" id="rBox"></div></div>'
   +'<div class="card c4"><div class="ch"><h4>Destaques</h4></div><div class="kv2" id="rKv" style="grid-template-columns:minmax(0,1fr)"></div><div id="rAi"></div></div></div>';
  function render(){
    var r=R[cur];$("#rT").textContent=r[2];
    $("#rBox").innerHTML='<svg viewBox="0 0 520 200" role="img" aria-label="'+r[2]+'"></svg><div class="tip" hidden></div>';
    barsChart($("#rBox svg"),$("#rBox .tip"),M9,r[4],r[5],true);
    $("#rKv").innerHTML=r[6].map(function(k){return '<div><small>'+k[0]+'</small><span style="font-size:15px;font-weight:600">'+k[1]+'</span></div>'}).join("");
    $("#rAi").innerHTML=aiBox(cur===0?'Setembro foi o melhor mês do ano em receita. O ticket médio caiu 2,1% por causa do aumento de desentupimentos residenciais.':'Quer que eu monte este relatório toda segunda-feira e envie por e-mail?','Configurar');
    $$(".rep",v).forEach(function(b){b.setAttribute("aria-pressed",+b.dataset.r===cur?"true":"false")});
  }
  v.addEventListener("click",function(e){var b=e.target.closest(".rep");if(b){cur=+b.dataset.r;render()}});
  render();
};

/* ===== FUNCIONÁRIOS ===== */
var FUN_SEL=1;
VIEWS.func=function(v){
  function asoSt(f){var d=diffDays(f.aso,"2026-10-07");return d<0?['er','ASO vencido']:d<=30?['al','ASO em '+d+' dias']:['ok','ASO em dia']}
  v.innerHTML='<div class="grid">'
  +'<div class="card c12" style="padding:12px"><div class="kp" style="--n:4">'
   +'<div><span class="sq">'+ic("func",14)+'</span><span class="t">Colaboradores</span><b class="num">'+FUNC.length+'</b><span class="pill in">5 campo · 2 escritório</span></div>'
   +'<div><span class="sq" style="background:var(--erro-50);border-color:#F1C9C6;color:var(--erro)">'+ic("doc",14)+'</span><span class="t">Documentos vencidos</span><b class="num">1</b><span class="pill er">ASO do Diego</span></div>'
   +'<div><span class="sq">'+ic("clock",14)+'</span><span class="t">Vencem em 30 dias</span><b class="num">2</b><span class="pill al">ASO Carlos · NR-33 Marcos</span></div>'
   +'<div><span class="sq">'+ic("cake",14)+'</span><span class="t">Aniversariantes de outubro</span><b class="num" id="fBdN"></b><span class="pill go" id="fBdL"></span></div></div></div>'
  +'<div class="split c12"><div class="card"><div class="ch"><h4>Equipe</h4><button class="cta" type="button" id="fNew">'+ic("plus",13)+'Novo colaborador</button></div><div class="scroll-x"><table class="tb" id="fnTb"><thead><tr><th>Nome</th><th>Função</th><th>Admissão</th><th>Aniversário</th><th>Uniforme</th><th>Documentos</th></tr></thead><tbody>'
   +'</tbody></table></div></div>'
   +'<div class="card" id="fnDet"></div></div></div>'
  +'<div class="modal" id="fnModal" hidden><div class="box" role="dialog" aria-modal="true" aria-labelledby="fnT"><h3 id="fnT">Novo colaborador</h3><div class="form">'
   +'<div class="fld full"><label for="n1">Nome completo</label><input id="n1"></div><div class="fld"><label for="n2">CPF</label><input id="n2" inputmode="numeric" placeholder="000.000.000-00"></div><div class="fld"><label for="n3">RG</label><input id="n3"></div><div class="fld"><label for="n13">Data de nascimento</label><input id="n13" type="date"></div><div class="fld"><label for="n14">Setor</label><select id="n14"><option>Campo</option><option>Escritório</option></select></div>'
   +'<div class="fld"><label for="n4">Função</label><input id="n4"></div><div class="fld"><label for="n5">Admissão</label><input id="n5" type="date"></div><div class="fld"><label for="n6">Telefone</label><input id="n6" inputmode="tel"></div><div class="fld"><label for="n7">CNH</label><input id="n7" placeholder="Categoria e validade"></div>'
   +'<div class="fld"><label for="n8">Camisa</label><select id="n8"><option>P</option><option selected>M</option><option>G</option><option>GG</option></select></div><div class="fld"><label for="n9">Calça</label><input id="n9" inputmode="numeric" placeholder="42"></div><div class="fld"><label for="n10">Bota</label><input id="n10" inputmode="numeric" placeholder="41"></div><div class="fld"><label for="n11">Luva</label><select id="n11"><option>P</option><option selected>M</option><option>G</option></select></div>'
   +'<div class="fld full"><label for="n12">Documentos</label><input id="n12" type="file" multiple></div></div><div class="acts"><button class="ghost" type="button" data-close>Cancelar</button><button class="cta rq" type="button" id="fSave">Salvar</button></div></div></div>';
  function rows(){$("#fnTb tbody").innerHTML=FUNC.map(function(f){var s=asoSt(f);return '<tr class="cl'+(f.id===FUN_SEL?' pick':'')+'" data-id="'+f.id+'"><td><span style="display:flex;gap:9px;align-items:center"><span class="av" style="background:var(--trigo);color:var(--fluxo)">'+f.nome.split(" ").map(function(w){return w[0]}).join("")+'</span><span><b>'+f.nome+'</b><small>'+f.setor+'</small></span></span></td><td>'+f.cargo+'</td><td class="num">'+dmy(f.adm)+'</td><td>'+(f.nasc?(f.nasc.slice(5,7)==="10"?'<span class="pill go">'+ic("cake",11)+' '+dmy(f.nasc).slice(0,5)+'</span>':'<span class="num">'+dmy(f.nasc).slice(0,5)+'</span>'):'—')+'</td><td class="num">'+f.tam[0]+' · '+f.tam[1]+' · '+f.tam[2]+'</td><td><span class="pill '+s[0]+'">'+s[1]+'</span></td></tr>'}).join("");}
  function det(){
    var f=FUNC.find(function(x){return x.id===FUN_SEL}),s=asoSt(f),anos=Math.floor(diffDays("2026-10-07",f.adm)/365.25);
    $("#fnDet").innerHTML='<div class="prof"><span class="bigav" style="background:var(--trigo);color:var(--fluxo)">'+f.nome.split(" ").map(function(w){return w[0]}).join("")+'</span><div style="flex:1;min-width:0"><h3>'+f.nome+'</h3><span class="sub">'+f.cargo+' · '+anos+' ano'+(anos===1?'':'s')+' de casa</span></div><button class="ghost" type="button" data-t="Abriria a edição do cadastro.">Editar</button></div>'
    +'<div class="kv2"><div><small>CPF</small><span>'+f.cpf+'</span></div><div><small>RG</small><span>'+f.rg+'</span></div><div><small>Nascimento</small><span>'+dmy(f.nasc)+'</span></div><div><small>Telefone</small><span>'+f.tel+'</span></div><div><small>Cidade</small><span>'+f.end+'</span></div><div><small>Admissão</small><span>'+dmy(f.adm)+'</span></div></div>'
    +'<div class="ch"><h4>Uniforme e EPIs</h4></div><div class="sizes"><div><small>Camisa</small><b>'+f.tam[0]+'</b></div><div><small>Calça</small><b>'+f.tam[1]+'</b></div><div><small>Bota</small><b>'+f.tam[2]+'</b></div><div><small>Luva</small><b>'+f.tam[3]+'</b></div></div>'
    +'<div class="ch"><h4>Documentos</h4><button class="ghost" type="button" data-t="Abriria o envio de documentos.">+ Enviar</button></div>'
    +[["ASO",dmy(f.aso),s],["CNH",f.cnh,['ne','—']],["Treinamento NR",f.nr,['ne','—']],["Contrato de trabalho","Assinado",['ok','ok']]].map(function(d){return '<div class="doc">'+ic("doc",16)+'<span class="grow"><b>'+d[0]+'</b><small>'+d[1]+'</small></span>'+(d[2][1]!=="—"?'<span class="pill '+d[2][0]+'">'+d[2][1]+'</span>':'')+'</div>'}).join("")
    +(f.obs?'<p class="txt">'+f.obs+'</p>':'');
  }
  v.addEventListener("click",function(e){
    var r=e.target.closest("tr.cl");if(r){FUN_SEL=+r.dataset.id;$$("#fnTb tr",v).forEach(function(x){x.classList.toggle("pick",x===r)});det();if(window.innerWidth<1100)$("#fnDet").scrollIntoView({behavior:"smooth"});return}
    if(e.target.closest("#fNew")){$$("#fnModal input",v).forEach(function(i){i.value=""});$("#fnModal").hidden=false;$("#n1").focus();return}
    if(e.target.closest("#fSave")){var nm=$("#n1").value.trim();if(!nm){toast("Informe o nome.");return}if(!$("#n13").value){toast("Informe a data de nascimento.");$("#n13").focus();return}
      var nf={id:Math.max.apply(null,FUNC.map(function(x){return x.id}))+1,nome:nm,cargo:$("#n4").value.trim()||"Colaborador",setor:$("#n14").value,adm:$("#n5").value||"2026-10-13",cpf:$("#n2").value||"—",rg:$("#n3").value||"—",nasc:$("#n13").value,tel:$("#n6").value||"—",end:"—",cnh:$("#n7").value||"—",aso:"2027-10-13",nr:"—",tam:[$("#n8").value,$("#n9").value||"—",$("#n10").value||"—",$("#n11").value],obs:""};
      FUNC.push(nf);FUN_SEL=nf.id;$("#fnModal").hidden=true;rows();det();kpi();toast(nm+" cadastrado. O aniversário já aparece na agenda.");return}
    if(e.target.closest("[data-close]")||e.target===$("#fnModal")){$("#fnModal").hidden=true}
  });
  function kpi(){var b=FUNC.filter(function(f){return f.nasc&&f.nasc.slice(5,7)==="10"}).sort(function(a,b){return a.nasc.slice(8)<b.nasc.slice(8)?-1:1});$("#fBdN").textContent=b.length;$("#fBdL").innerHTML=b.map(function(f){return firstName(f.nome)+' '+dmy(f.nasc).slice(0,5)}).join(" · ")||"—"}
  rows();det();kpi();
};

/* ===== CONFIGURAÇÕES ===== */
VIEWS.cfg=function(v){
  v.innerHTML='<div class="grid">'
  +'<div class="card c6"><div class="ch"><h4>Empresa</h4><button class="ghost" type="button" data-t="Edição dos dados da empresa (protótipo).">Editar</button></div><div class="kv2"><div><small>Razão social</small><span>Monte Fuji Dedetizadora e Desentupidora</span></div><div><small>Desde</small><span>2000</span></div><div><small>Endereço</small><span>Rua Anhanguera, 549 · Piratininga, Osasco/SP</span></div><div><small>Site</small><span>mfuji.com.br</span></div><div><small>Telefone</small><span>(11) 3609-5222</span></div><div><small>WhatsApp</small><span>(11) 99742-0106</span></div><div><small>E-mail</small><span>atendimento@mfuji.com.br</span></div><div><small>Instagram</small><span>@monte_fuji_dedetizadora</span></div></div></div>'
  +'<div class="card c6"><div class="ch"><h4>Integrações</h4><span class="sub">Conectadas na fase de desenvolvimento</span></div>'
   +[["G","#3872CF","Google Drive","Pastas de clientes e OS em PDF","Exemplo"],["M","#C2413A","Gmail","3 caixas: atendimento, financeiro e comercial","Exemplo"],["CA","#253C8D","Conta Azul","Carteira, contratos e faturas","Exemplo"],["CF","#B49B54","Cloudflare Workers","Hospedagem, banco de dados (D1) e e-mail","Planejado"],["IA","#18275E","Assistente","Base de conhecimento da Monte Fuji","Aguardando conteúdo"]].map(function(x){return '<div class="intg"><span class="lg2" style="background:'+x[1]+'">'+x[0]+'</span><span class="grow"><b>'+x[2]+'</b><small>'+x[3]+'</small></span><span class="pill '+(x[4]==="Planejado"?"in":"al")+'">'+x[4]+'</span></div>'}).join("")+'</div>'
  +'<div class="card c6"><div class="ch"><h4>Usuários e permissões</h4><button class="cta" type="button" data-t="Convite enviado (protótipo).">'+ic("plus",13)+'Convidar</button></div><ul class="ls">'
   +[["PB","Pablo","Administrador"],["PN","Patrícia Nunes","Financeiro"],["JR","Juliana Rocha","Atendimento"],["CM","Carlos Mendes","Técnico · só agenda e OS"]].map(function(u){return '<li><span class="av" style="background:var(--trigo);color:var(--fluxo)">'+u[0]+'</span><span class="grow"><b>'+u[1]+'</b><small>'+u[2]+'</small></span><button class="ghost" type="button" data-t="Editaria as permissões.">Permissões</button></li>'}).join("")+'</ul></div>'
  +'<div class="card c6"><div class="ch"><h4>Notificações</h4></div><ul class="ls">'
   +[["Resumo do dia às 7h, por e-mail",1],["Faturas que vencem em 3 dias",1],["Garantias vencendo em 30 dias",1],["Documentos de funcionários vencendo",1],["Sugestões do assistente nas telas",1],["Aviso a cada novo e-mail de cliente",0]].map(function(n,i){return '<li><span class="grow"><b style="font-weight:500">'+n[0]+'</b></span><button class="tgl" type="button" aria-label="'+n[0]+'" aria-pressed="'+(n[1]?"true":"false")+'"></button></li>'}).join("")+'</ul></div></div>';
  v.addEventListener("click",function(e){var t=e.target.closest(".tgl");if(t)t.setAttribute("aria-pressed",t.getAttribute("aria-pressed")==="true"?"false":"true")});
};

/* ===== CENTRAL DE AJUDA ===== */
VIEWS.help=function(v){
  v.innerHTML='<div class="grid"><div class="card c8"><div class="ch"><h4>Dúvidas frequentes</h4></div><div class="search" style="flex:none">'+ic("search",14)+'<input placeholder="Buscar ajuda" aria-label="Buscar ajuda"></div>'
  +[["Como gero uma ordem de serviço?","Em Ordens de serviço, escolha o cliente, preencha o serviço e clique em Gerar OS e salvar no Drive. O PDF sai no modelo padrão e vai para a pasta do cliente."],["Como cadastro uma visita na agenda?","Em Agenda, clique em + Novo agendamento ou em Agendar numa das melhores datas sugeridas. Os campos definitivos ainda serão definidos."],["O assistente lê meus e-mails?","No sistema final, sim: ele lê a caixa da empresa para sugerir respostas. Nada é enviado sem você clicar em enviar."],["Onde vejo as garantias de um cliente?","Em Clientes, selecione o cliente. As garantias aparecem com a barra de tempo restante e a data de término."],["Os dados financeiros são atualizados sozinhos?","Sim, quando a Conta Azul estiver conectada. A sincronização prevista é a cada hora."]].map(function(f,i){return '<details class="faq"'+(i?'':' open')+'><summary>'+f[0]+'</summary><p>'+f[1]+'</p></details>'}).join("")+'</div>'
  +'<div class="c4" style="display:flex;flex-direction:column;gap:10px"><div class="card hero"><div class="ring" aria-hidden="true"></div><div class="hh"><span>Falar com o suporte</span></div><b style="font-size:20px">atendimento@mfuji.com.br</b><p class="hs">(11) 3609-5222 · segunda a sábado</p></div>'
  +'<div class="card"><div class="ch"><h4>Atalhos</h4></div><ul class="ls"><li><span class="grow"><b style="font-weight:500">Abrir o assistente</b></span><span class="tag">Ctrl + J</span></li><li><span class="grow"><b style="font-weight:500">Fechar janelas</b></span><span class="tag">Esc</span></li><li><span class="grow"><b style="font-weight:500">Abrir um dia na agenda</b></span><span class="tag">Duplo clique</span></li></ul></div>'
  +'<div class="card"><div class="ch"><h4>Versão</h4><span class="pill al">Protótipo</span></div><p class="txt">v0.1 · estrutura visual de todas as telas. Próximo passo: desenvolvimento em Cloudflare Workers.</p></div></div></div>';
};

/* ===== início ===== */
document.addEventListener("click",function(e){
  var g=e.target.closest("[data-go]");if(g){location.hash="#"+g.dataset.go;return}
  var t=e.target.closest("[data-t]");if(t){toast(t.dataset.t);return}
  if(e.target.closest("[data-ai]")){AI.open();return}
});
renderSide();initAI();
$("#burger").addEventListener("click",function(){$("#app").classList.add("nav-open")});
$("#scrim").addEventListener("click",function(){$("#app").classList.remove("nav-open")});
$("#gSearch").addEventListener("keydown",function(e){if(e.key==="Enter"&&this.value.trim()){toast("Busca geral em clientes, OS e e-mails (protótipo).")}});
window.addEventListener("hashchange",function(){go(location.hash.slice(1))});
window.addEventListener("resize",function(){var on=$(".view.on");if(on&&VIEWS[on.id.slice(2)]&&VIEWS[on.id.slice(2)].show)VIEWS[on.id.slice(2)].show()});
go(location.hash.slice(1)||"dash");
