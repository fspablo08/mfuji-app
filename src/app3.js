
/* ===== CONTA DO USUÁRIO, USUÁRIOS, MIGRAÇÃO E ATUALIZAÇÃO AUTOMÁTICA ===== */
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
var PAPEL_TXT={admin:"Administrador",colaborador:"Colaborador",leitura:"Somente consulta"};
function mfModal(id,html){var m=$("#"+id);if(!m){m=document.createElement("div");m.className="modal";m.id=id;document.body.appendChild(m);
  m.addEventListener("click",function(e){if(e.target===m||e.target.closest("[data-mx]"))m.hidden=true})}
  m.innerHTML='<div class="box" role="dialog" aria-modal="true">'+html+'</div>';m.hidden=false;return m}

/* topo: iniciais de quem está usando, com "Minha conta" */
(function(){var me=$("#me");if(!me)return;me.textContent=EU.iniciais||"?";me.title=EU.nome+" · "+(PAPEL_TXT[EU.papel]||"");me.setAttribute("aria-label","Minha conta: "+EU.nome);
  me.addEventListener("click",contaModal)})();
function contaModal(){
  var m=mfModal("contaModal",'<h3>Minha conta</h3><div class="kv2 one"><div><small>Nome</small><span>'+esc(EU.nome)+'</span></div><div><small>Acesso</small><span>'+esc(EU.email)+'</span></div><div><small>Perfil</small><span>'+(PAPEL_TXT[EU.papel]||EU.papel)+'</span></div></div>'
    +'<div class="form"><div class="fld full"><label for="pwA">Senha atual</label><input id="pwA" type="password" autocomplete="current-password"></div><div class="fld"><label for="pwN">Nova senha</label><input id="pwN" type="password" autocomplete="new-password" placeholder="Pelo menos 8 caracteres"></div><div class="fld"><label for="pwC">Repita a nova senha</label><input id="pwC" type="password" autocomplete="new-password"></div></div>'
    +'<div class="acts" style="flex-wrap:wrap"><button class="ghost" type="button" id="sairBt">Sair do sistema</button><span style="flex:1"></span><button class="ghost" type="button" data-mx>Fechar</button><button class="cta" type="button" id="pwBt">Trocar senha</button></div>');
  $("#sairBt",m).onclick=function(){dbSave();api("POST","/api/logout",{}).catch(function(){}).then(function(){location.href="/login"})};
  $("#pwBt",m).onclick=function(){var a=$("#pwA").value,n=$("#pwN").value;if(n!==$("#pwC").value){toast("A confirmação não confere com a nova senha.");return}
    api("POST","/api/senha",{atual:a,nova:n}).then(function(){m.hidden=true;toast("Senha alterada. Os outros aparelhos com a sua conta foram desconectados.")}).catch(function(e){toast(e.erro||"Não foi possível trocar a senha.")})};
}

/* Configurações › Usuários (o servidor só deixa o administrador ver e mudar os outros) */
function usuariosCard(alvo){
  alvo.innerHTML='<div class="ch"><h4>Usuários</h4>'+(EU.papel==="admin"?'<button class="cta" type="button" id="uNovo">'+ic("plus",13)+'Novo usuário</button>':'')+'</div><ul class="ls" id="uLs"><li class="mut">Carregando…</li></ul>'
    +'<p class="sub">'+(EU.papel==="admin"?'Cada colaborador entra com o próprio e-mail e senha. Ao criar ou redefinir, o sistema mostra uma senha temporária uma única vez; no primeiro acesso a pessoa define a dela.':'Para incluir colegas ou mudar permissões, fale com o administrador.')+'</p>';
  function lista(){api("GET","/api/usuarios").then(function(r){$("#uLs",alvo).innerHTML=r.usuarios.map(function(u){
      return '<li'+(EU.papel==="admin"?' class="lk" data-uid="'+u.id+'"':'')+'><span class="av" style="background:var(--trigo);color:var(--fluxo)">'+esc(u.iniciais)+'</span><span class="grow"><b>'+esc(u.nome)+(u.id===EU.id?' (você)':'')+'</b><small>'+esc(u.email)+' · '+(PAPEL_TXT[u.papel]||u.papel)+(u.ultimo_acesso?' · último acesso '+new Date(u.ultimo_acesso.replace(" ","T")+"Z").toLocaleDateString("pt-BR"):'')+'</small></span>'
        +(u.ativo===0?'<span class="pill ne">Desativado</span>':u.trocar_senha?'<span class="pill al">Primeiro acesso pendente</span>':'<span class="pill ok">Ativo</span>')+'</li>'}).join("");
      usuariosCard.dados=r.usuarios}).catch(function(e){$("#uLs",alvo).innerHTML='<li class="mut">'+esc(e.erro||"Não foi possível carregar os usuários.")+'</li>'})}
  function senhaMsg(nome,email,s){mfModal("uSenha",'<h3>Senha temporária de '+esc(nome)+'</h3><p class="txt">Passe para a pessoa por um canal seguro (WhatsApp ou pessoalmente). Ela aparece só agora; no primeiro acesso o sistema pede uma senha nova.</p>'
    +'<div class="kv2 one"><div><small>Endereço</small><span>'+esc(location.origin)+'</span></div><div><small>E-mail ou usuário</small><span>'+esc(email)+'</span></div><div><small>Senha temporária</small><span style="font-family:monospace;font-size:15px">'+esc(s)+'</span></div></div>'
    +'<div class="acts"><button class="ghost" type="button" id="uCp">'+ic("doc",12)+' Copiar instruções</button><button class="cta" type="button" data-mx>Pronto</button></div>');
    $("#uCp").onclick=function(){copyText("Acesso ao sistema Monte Fuji\nEndereço: "+location.origin+"\nLogin: "+email+"\nSenha temporária: "+s+"\nNo primeiro acesso, defina a sua senha.",function(ok){toast(ok?"Instruções copiadas.":"Não consegui copiar.")})}}
  function form(u){var novo=!u;
    var m=mfModal("uForm",'<h3>'+(novo?'Novo usuário':'Editar '+esc(u.nome))+'</h3><div class="form"><div class="fld full"><label for="uNome">Nome</label><input id="uNome" value="'+esc(novo?"":u.nome)+'"></div>'
      +'<div class="fld full"><label for="uEmail">E-mail ou usuário de acesso</label><input id="uEmail" autocapitalize="none" spellcheck="false" value="'+esc(novo?"":u.email)+'"'+(novo?'':' disabled')+'></div>'
      +'<div class="fld full"><label for="uPapel">Perfil</label><select id="uPapel">'+["colaborador","admin","leitura"].map(function(p){return '<option value="'+p+'"'+(!novo&&u.papel===p?' selected':'')+'>'+PAPEL_TXT[p]+'</option>'}).join("")+'</select></div></div>'
      +'<p class="sub">Colaborador: usa todo o sistema. Administrador: também cria usuários, baixa e restaura backups. Somente consulta: vê tudo, não altera nada.</p>'
      +'<div class="acts" style="flex-wrap:wrap">'+(novo?'':'<button class="ghost" type="button" id="uReset">Redefinir senha</button><button class="ghost" type="button" id="uAtivo">'+(u.ativo?'Desativar acesso':'Reativar acesso')+'</button>')+'<span style="flex:1"></span><button class="ghost" type="button" data-mx>Cancelar</button><button class="cta" type="button" id="uSalvar">Salvar</button></div>');
    function enviar(extra,msg){var b={nome:$("#uNome").value.trim(),papel:$("#uPapel").value};for(var k in extra)b[k]=extra[k];
      (novo?api("POST","/api/usuarios",{nome:b.nome,email:$("#uEmail").value.trim(),papel:b.papel}):api("POST","/api/usuarios/"+u.id,b)).then(function(r){m.hidden=true;lista();
        if(r.senha_temporaria)senhaMsg(b.nome,novo?$("#uEmail").value.trim():u.email,r.senha_temporaria);else toast(msg||"Usuário salvo.")}).catch(function(e){toast(e.erro||"Não foi possível salvar.")})}
    $("#uSalvar",m).onclick=function(){enviar({})};
    if(!novo){$("#uReset",m).onclick=function(){enviar({redefinir_senha:true})};$("#uAtivo",m).onclick=function(){enviar({ativo:!u.ativo},u.ativo?"Acesso desativado. A pessoa foi desconectada.":"Acesso reativado.")}}
    setTimeout(function(){$("#uNome").focus()},30)}
  alvo.onclick=function(e){if(e.target.closest("#uNovo")){form(null);return}var li=e.target.closest("[data-uid]");if(li){form((usuariosCard.dados||[]).find(function(x){return x.id===+li.dataset.uid}))}};
  lista();
}

/* Configurações › Banco de dados e backup */
function bancoCard(alvo){
  var tot=CLIENTES.length+FUNC.length+OSL.length+TAREFAS.length+EVENTS.length+RECEBER.length,adm=EU.papel==="admin";
  alvo.innerHTML='<div class="ch"><h4>Banco de dados e backup</h4><span class="pill ok">Compartilhado</span></div>'
    +'<p class="txt">Tudo o que a equipe cadastra fica no banco da Monte Fuji na Cloudflare (D1). As telas se atualizam sozinhas em poucos segundos. Uma cópia completa é guardada todo dia de madrugada'+(adm?', e você pode baixar outra quando quiser.':'.')+'</p>'
    +'<div class="kv2"><div><small>Registros</small><span>'+tot+'</span></div><div><small>Última sincronização</small><span id="bkSync">'+(SYNC.ultimo?SYNC.ultimo.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}):"—")+'</span></div></div>'
    +(adm?'<div class="acts" style="justify-content:flex-start;flex-wrap:wrap"><button class="cta" type="button" id="bkDown">'+ic("down",13)+' Baixar backup agora</button><button class="ghost" type="button" id="bkUp">'+ic("up",13)+' Restaurar de um arquivo</button><button class="ghost" type="button" id="bkList">Backups automáticos</button>'
      +(localTem()?'<button class="ghost" type="button" id="bkLocal">Importar dados deste navegador</button>':'')+'<input type="file" id="bkFile" accept=".json,application/json" hidden></div>'
      +'<p class="sub">Restaurar não apaga nada: só acrescenta o que estiver no arquivo e ainda não existir no banco.</p>':'');
  if(!adm)return;
  alvo.onclick=function(e){
    if(e.target.closest("#bkDown")){dbSave();fetch("/api/backup",{credentials:"same-origin"}).then(function(r){if(!r.ok)throw 0;return r.blob()}).then(function(b){saveFile("backup-monte-fuji-"+TD+".json",b,function(ok){if(ok)toast("Backup baixado.")})}).catch(function(){toast("Não foi possível gerar o backup.")});return}
    if(e.target.closest("#bkUp")){$("#bkFile").click();return}
    if(e.target.closest("#bkLocal")){migrarLocal(true);return}
    if(e.target.closest("#bkList")){api("GET","/api/backups").then(function(r){mfModal("bkMod",'<h3>Backups automáticos</h3><p class="txt">Uma cópia por dia, guardada por 60 dias, além de uma cópia feita antes de cada importação.</p><ul class="ls">'
      +(r.backups.length?r.backups.map(function(n){return '<li><span class="grow"><b>'+esc(n)+'</b></span><a class="ghost" href="/api/backups/'+encodeURIComponent(n)+'" download>'+ic("down",12)+' Baixar</a></li>'}).join(""):'<li class="mut">O primeiro backup automático sai na próxima madrugada.</li>')+'</ul><div class="acts"><button class="cta" type="button" data-mx>Fechar</button></div>')}).catch(function(e){toast(e.erro||"Não foi possível listar os backups.")});return}
  };
  alvo.onchange=function(e){if(e.target.id!=="bkFile"||!e.target.files[0])return;var rd=new FileReader();
    rd.onload=function(){var o;try{o=JSON.parse(rd.result);if(o.sistema!=="Monte Fuji")throw 0}catch(x){toast("Este arquivo não é um backup do sistema Monte Fuji.");return}importarModal(o,"arquivo")};
    rd.readAsText(e.target.files[0]);e.target.value=""};
}

/* ===== migração: dados que a versão anterior guardava neste navegador ===== */
function localDados(){var o={},n=0;DB_KEYS.forEach(function(k){try{var v=JSON.parse(localStorage.getItem("mfs-"+k));if(Array.isArray(v)&&v.length){o[k]=v;n+=v.length}}catch(e){}});return n?o:null}
function localTem(){return !!localDados()}
function migrarLocal(manual){if(EU.papel!=="admin")return;var o=localDados();if(!o){if(manual)toast("Não há dados da versão anterior neste navegador.");return}
  var feito=null;try{feito=localStorage.getItem("mfs-migrado")}catch(e){}if(feito&&!manual)return;
  importarModal(o,"navegador")}
var IMP_NOME={CLIENTES:"Clientes",FUNC:"Funcionários",OSL:"Ordens de serviço",TAREFAS:"Anotações",EVENTS:"Agendamentos",RECEBER:"A receber",EMAILS:"E-mails",VK:"Avisos de garantia"};
/* registros com cara de teste ou exemplo ficam de fora, a não ser que sejam marcados */
function parecemTeste(k,x){var t=k==="OSL"?x.join(" "):k==="VK"?String(x):[x.nome,x.razao,x.t,x.d,x.cli,x.obs,x.email].join(" ");return /\b(teste|testes|test|exemplo|demo|demonstra[cç][aã]o|fict[ií]cio|fulano|ciclano)\b/i.test(norm(t))}
function rotulo(k,x){if(k==="OSL")return x[0]+" · "+x[2];if(k==="VK")return String(x);if(k==="EVENTS")return dmy(x.date)+" · "+x.cli;if(k==="TAREFAS")return x.t;return x.nome||x.t||String(x.id)}
function importarModal(o,origem){
  var testes=[];DB_KEYS.forEach(function(k){(o[k]||[]).forEach(function(x,i){if(parecemTeste(k,x))testes.push({k:k,i:i,x:x})})});
  var m=mfModal("impLocal",'<h3>'+(origem==="navegador"?'Dados da versão anterior neste navegador':'Restaurar backup')+'</h3>'
    +'<p class="txt">'+(origem==="navegador"?'Antes do banco compartilhado, o sistema guardava os cadastros no navegador. Encontrei estes registros aqui. Confira e leve para o banco, para toda a equipe ver.':'Confira o que entra no banco. Nada existente é apagado ou alterado.')+' Registros iguais aos que já estão no banco são ignorados, então não há duplicação.</p>'
    +'<div id="impRes"><p class="mut">Conferindo com o banco…</p></div>'
    +(testes.length?'<div><b style="font-size:12.5px">Parecem testes ou exemplos ('+testes.length+')</b><p class="sub">Ficam de fora. Marque os que forem dados reais.</p><ul class="ls" style="max-height:180px;overflow:auto">'+testes.map(function(t,j){return '<li><label style="display:flex;gap:8px;align-items:center;width:100%"><input type="checkbox" data-ti="'+j+'"><span class="grow">'+esc(rotulo(t.k,t.x))+'<small> · '+IMP_NOME[t.k]+'</small></span></label></li>'}).join("")+'</ul></div>':'')
    +'<div class="acts"><button class="ghost" type="button" id="impDepois">'+(origem==="navegador"?'Agora não':'Cancelar')+'</button><button class="cta" type="button" id="impOk" disabled>Importar</button></div>');
  function escolhidos(){var out={},fora={};testes.forEach(function(t,j){var c=$('[data-ti="'+j+'"]',m);if(!c||!c.checked)fora[t.k+"#"+t.i]=1});
    DB_KEYS.forEach(function(k){if(o[k])out[k]=o[k].filter(function(x,i){return !fora[k+"#"+i]})});return out}
  function simular(){api("POST","/api/importar",{dados:escolhidos(),simular:true}).then(function(r){var novos=0;
      $("#impRes",m).innerHTML='<div class="scroll-x"><table class="tb"><thead><tr><th>Módulo</th><th class="r">Neste '+(origem==="navegador"?'navegador':'arquivo')+'</th><th class="r">Já no banco</th><th class="r">Vão entrar</th></tr></thead><tbody>'
        +Object.keys(r.resumo).map(function(k){var s=r.resumo[k];novos+=s.novos;return '<tr><td>'+IMP_NOME[k]+'</td><td class="r num">'+s.recebidos+'</td><td class="r num">'+s.duplicados+'</td><td class="r num"><b>'+s.novos+'</b></td></tr>'}).join("")+'</tbody></table></div>';
      var b=$("#impOk",m);b.disabled=!novos;b.textContent=novos?"Importar "+novos+" registro"+(novos>1?"s":""):"Nada novo para importar"})
    .catch(function(e){$("#impRes",m).innerHTML='<p class="mut">'+esc(e.erro||"Não foi possível conferir agora.")+'</p>'})}
  m.onchange=function(e){if(e.target.dataset.ti!==undefined)simular()};
  $("#impDepois",m).onclick=function(){m.hidden=true;if(origem==="navegador")toast("Tudo bem. Dá para importar depois em Configurações › Banco de dados.")};
  $("#impOk",m).onclick=function(){var b=this;b.disabled=true;b.textContent="Importando…";dbSave();
    api("POST","/api/importar",{dados:escolhidos()}).then(function(r){var n=0;Object.keys(r.resumo).forEach(function(k){n+=r.resumo[k].novos});
      if(origem==="navegador")try{localStorage.setItem("mfs-migrado",new Date().toISOString())}catch(e){}
      m.hidden=true;toast(n+" registro"+(n===1?"":"s")+" importado"+(n===1?"":"s")+" para o banco compartilhado.");dbPoll(true)})
    .catch(function(e){b.disabled=false;b.textContent="Tentar de novo";toast(e.erro||"A importação não foi concluída. Nada foi alterado.")})};
  simular();
}

/* ===== atualização automática: a cada 5 s com a tela em uso, 15 s parada, pausa com a aba escondida ===== */
var POLL={t:null,uso:Date.now()};
["click","keydown","mousemove","touchstart","scroll"].forEach(function(ev){document.addEventListener(ev,function(){POLL.uso=Date.now()},{passive:true})});
function pollLoop(){clearTimeout(POLL.t);if(document.hidden)return;
  dbPoll().then(function(){if(SYNC.render)dbRefresh();POLL.t=setTimeout(pollLoop,Date.now()-POLL.uso<120000?5000:15000)})}
document.addEventListener("visibilitychange",function(){if(!document.hidden){POLL.uso=Date.now();pollLoop()}});
document.addEventListener("focusout",function(){if(SYNC.render)setTimeout(function(){if(SYNC.render)dbRefresh()},300)});
window.addEventListener("online",function(){dbSave();pollLoop()});
syncStatus();POLL.t=setTimeout(pollLoop,5000);
setTimeout(function(){migrarLocal(false)},800);
