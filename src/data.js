/* ===== Dados de exemplo (protótipo) — nada aqui é número real da Monte Fuji ===== */
var TODAY=new Date(2026,9,7);
var MES=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
var MES3=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
var DIA3=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
var DIA_EXT=["domingo","segunda","terça","quarta","quinta","sexta","sábado"];
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function brl(v,dec){return "R$ "+v.toLocaleString("pt-BR",{minimumFractionDigits:dec===0?0:2,maximumFractionDigits:dec===0?0:2})}
function ymd(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function dmy(s){var p=s.split("-");return p[2]+"/"+p[1]+"/"+p[0]}
function addDays(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x}
function diffDays(a,b){return Math.round((new Date(a)-new Date(b))/864e5)}

var SERV={
  "Dedetização":{c:"#253C8D",g:"Controle de pragas",sh:"Dedetização"},
  "Desratização":{c:"#253C8D",g:"Controle de pragas",sh:"Desratização"},
  "Termonebulização":{c:"#253C8D",g:"Controle de pragas",sh:"Termonebulização"},
  "Limpeza dos reservatórios de água inferiores e superiores":{c:"#3872CF",g:"Reservatórios de água",sh:"Reservatórios inf. e sup."},
  "Limpeza dos reservatórios de água inferiores":{c:"#3872CF",g:"Reservatórios de água",sh:"Reservatórios inferiores"},
  "Limpeza dos reservatórios de água superiores":{c:"#3872CF",g:"Reservatórios de água",sh:"Reservatórios superiores"},
  "Limpeza preventiva da rede de esgoto":{c:"#B49B54",g:"Redes de esgoto e pluvial",sh:"Rede de esgoto"},
  "Limpeza preventiva da rede de água pluvial":{c:"#B49B54",g:"Redes de esgoto e pluvial",sh:"Rede pluvial"}
};
var SFAM=[["Controle de pragas","#253C8D"],["Reservatórios de água","#3872CF"],["Redes de esgoto e pluvial","#B49B54"]];
var TECS=["Carlos","Marcos","Rafael","Diego","Bruno"];

var CLIENTES=[
 {id:1,nome:"Cond. Jardim das Flores",razao:"Condomínio Residencial Jardim das Flores",doc:"12.345.678/0001-90",perfil:"Condomínio",contato:"Marina Alves (síndica)",tel:"(11) 99812-4410",email:"sindico@jardimdasflores.com.br",end:"Rua das Hortênsias, 210 · Jardim das Flores, Osasco/SP",hist:[["2026-09-30","Limpeza dos reservatórios de água inferiores e superiores","Inferior e superior, 10 mil L cada","Carlos"],["2026-07-12","Dedetização","Áreas comuns e garagem","Marcos"],["2026-03-28","Limpeza dos reservatórios de água superiores","2 reservatórios de 10 mil L","Carlos"]],gar:[["Limpeza dos reservatórios de água inferiores e superiores","2026-09-30",180],["Dedetização","2026-07-12",90]]},
 {id:2,nome:"Padaria Pão Dourado",razao:"Pão Dourado Panificadora Ltda.",doc:"23.456.789/0001-01",perfil:"Comércio",contato:"Sérgio Prado",tel:"(11) 3685-2290",email:"contato@paodourado.com.br",end:"Av. dos Autonomistas, 1880 · Centro, Osasco/SP",hist:[["2026-09-18","Dedetização","Cozinha industrial e estoque","Diego"],["2026-08-18","Desratização","Monitoramento mensal","Diego"],["2026-07-18","Dedetização","Cozinha industrial e estoque","Diego"]],gar:[["Dedetização","2026-09-18",30],["Desratização","2026-08-18",30]]},
 {id:3,nome:"Construtora Vila Yara",razao:"Vila Yara Empreendimentos Imobiliários S.A.",doc:"34.567.890/0001-12",perfil:"Construtora",contato:"Eng. Renata Campos",tel:"(11) 98420-1133",email:"obras@vilayara.com.br",end:"Rua Narciso Sturlini, 455 · Vila Yara, Osasco/SP",hist:[["2026-09-24","Termonebulização","Tratamento preventivo de madeiramento","Rafael"],["2026-05-10","Termonebulização","Bloco A, 12 unidades","Rafael"]],gar:[["Termonebulização","2026-09-24",365]]},
 {id:4,nome:"Residência Família Souza",razao:"Ana Paula Souza",doc:"CPF ***.482.117-**",perfil:"Residência",contato:"Ana Paula Souza",tel:"(11) 97733-0912",email:"anapsouza@email.com",end:"Rua Antônio Agú, 88 · Piratininga, Osasco/SP",hist:[["2026-09-28","Limpeza dos reservatórios de água superiores","Reservatório de 1.000 L","Marcos"],["2026-04-02","Dedetização","Casa térrea, 120 m²","Carlos"]],gar:[["Limpeza dos reservatórios de água superiores","2026-09-28",180]]},
 {id:5,nome:"Restaurante Sabor da Serra",razao:"Sabor da Serra Alimentação Ltda.",doc:"45.678.901/0001-23",perfil:"Comércio",contato:"Luiz Ferreira",tel:"(11) 3602-7781",email:"gerencia@sabordaserra.com.br",end:"Rua Primitiva Vianco, 640 · Centro, Osasco/SP",hist:[["2026-08-30","Dedetização","Cozinha e salão","Diego"],["2026-06-02","Limpeza preventiva da rede de esgoto","Caixa de gordura","Rafael"]],gar:[["Dedetização","2026-08-30",60]]},
 {id:6,nome:"Edifício Solar Piratininga",razao:"Condomínio Edifício Solar Piratininga",doc:"56.789.012/0001-34",perfil:"Condomínio",contato:"Roberto Lima (zelador)",tel:"(11) 99654-3021",email:"adm@solarpiratininga.com.br",end:"Rua Anhanguera, 1200 · Piratininga, Osasco/SP",hist:[["2026-04-15","Limpeza dos reservatórios de água superiores","Reservatório superior 20 mil L","Carlos"],["2025-10-14","Limpeza dos reservatórios de água superiores","Reservatório superior 20 mil L","Carlos"]],gar:[["Limpeza dos reservatórios de água superiores","2026-04-15",180]]},
 {id:7,nome:"Mercado Bom Preço",razao:"Bom Preço Comércio de Alimentos Ltda.",doc:"67.890.123/0001-45",perfil:"Comércio",contato:"Fernanda Rocha",tel:"(11) 3681-4455",email:"compras@bompreco.com.br",end:"Av. Maria Campos, 902 · Rochdale, Osasco/SP",hist:[["2026-09-12","Desratização","Doca e estoque","Bruno"],["2026-08-12","Desratização","Doca e estoque","Bruno"]],gar:[["Desratização","2026-09-12",30]]},
 {id:8,nome:"Escola Pequeno Saber",razao:"Pequeno Saber Educação Infantil Ltda.",doc:"78.901.234/0001-56",perfil:"Comércio",contato:"Cláudia Mendes (diretora)",tel:"(11) 3609-8812",email:"secretaria@pequenosaber.com.br",end:"Rua Erasmo Braga, 77 · Presidente Altino, Osasco/SP",hist:[["2026-07-04","Dedetização","Período de férias, sem alunos","Marcos"],["2026-07-04","Limpeza dos reservatórios de água superiores","Reservatório 5 mil L","Carlos"]],gar:[["Dedetização","2026-07-04",90],["Limpeza dos reservatórios de água superiores","2026-07-04",180]]}
];

var FUNC=[
 {id:1,nome:"Carlos Mendes",cargo:"Técnico em controle de pragas",setor:"Campo",adm:"2014-03-10",cpf:"***.215.448-**",rg:"**.481.226-*",nasc:"1971-06-18",tel:"(11) 98110-2244",end:"Osasco/SP",cnh:"B · 2028-11-02",aso:"2026-10-20",nr:"NR-33 · 2027-02-14",tam:["G","44","42","G"],obs:"Rosto do Tiozinho. Referência da equipe em caixa d'água."},
 {id:2,nome:"Marcos Lima",cargo:"Técnico de saneamento",setor:"Campo",adm:"2017-08-01",cpf:"***.903.112-**",rg:"**.338.901-*",nasc:"1984-02-09",tel:"(11) 97321-8890",end:"Carapicuíba/SP",cnh:"B · 2027-05-19",aso:"2027-01-12",nr:"NR-33 · 2026-11-03",tam:["M","42","41","M"],obs:""},
 {id:3,nome:"Rafael Costa",cargo:"Técnico em desentupimento",setor:"Campo",adm:"2019-01-14",cpf:"***.554.870-**",rg:"**.120.774-*",nasc:"1990-10-27",tel:"(11) 98877-1023",end:"Osasco/SP",cnh:"D · 2029-03-30",aso:"2027-03-08",nr:"NR-35 · 2027-06-01",tam:["G","46","43","G"],obs:"Dirige o caminhão de hidrojateamento."},
 {id:4,nome:"Diego Santos",cargo:"Técnico em controle de pragas",setor:"Campo",adm:"2021-05-03",cpf:"***.781.339-**",rg:"**.902.115-*",nasc:"1995-10-16",tel:"(11) 96540-3381",end:"Barueri/SP",cnh:"B · 2030-07-21",aso:"2026-10-02",nr:"—",tam:["M","40","40","M"],obs:""},
 {id:5,nome:"Bruno Alves",cargo:"Auxiliar técnico",setor:"Campo",adm:"2024-02-19",cpf:"***.120.664-**",rg:"**.557.208-*",nasc:"2001-10-27",tel:"(11) 95512-7740",end:"Osasco/SP",cnh:"—",aso:"2027-02-19",nr:"NR-33 · 2027-02-19",tam:["P","38","39","P"],obs:"Em formação com o Carlos."},
 {id:6,nome:"Juliana Rocha",cargo:"Atendimento e agendamento",setor:"Escritório",adm:"2020-09-08",cpf:"***.448.902-**",rg:"**.713.640-*",nasc:"1993-07-30",tel:"(11) 99021-5567",end:"Osasco/SP",cnh:"B · 2028-01-15",aso:"2027-04-22",nr:"—",tam:["P","36","36","—"],obs:""},
 {id:7,nome:"Patrícia Nunes",cargo:"Financeiro",setor:"Escritório",adm:"2016-04-04",cpf:"***.336.017-**",rg:"**.244.583-*",nasc:"1982-01-23",tel:"(11) 98234-6612",end:"São Paulo/SP",cnh:"B · 2027-09-09",aso:"2026-12-01",nr:"—",tam:["M","40","37","—"],obs:"Responsável pela Conta Azul."}
];

var OSL=[
 ["OS-2026-1248","2026-09-30","Cond. Jardim das Flores","Limpeza dos reservatórios de água superiores","Carlos",1850,"Concluída"],
 ["OS-2026-1247","2026-09-30","Padaria Pão Dourado","Dedetização","Diego",420,"Concluída"],
 ["OS-2026-1246","2026-09-29","Residência Família Souza","Limpeza dos reservatórios de água superiores","Marcos",480,"Concluída"],
 ["OS-2026-1245","2026-09-25","Restaurante Sabor da Serra","Limpeza preventiva da rede de esgoto","Rafael",350,"Aguardando assinatura"],
 ["OS-2026-1244","2026-09-24","Construtora Vila Yara","Termonebulização","Rafael",4200,"Concluída"],
 ["OS-2026-1243","2026-09-22","Mercado Bom Preço","Desratização","Bruno",680,"Concluída"],
 ["OS-2026-1242","2026-09-21","Edifício Solar Piratininga","Limpeza dos reservatórios de água superiores","Carlos",2400,"Cancelada"],
 ["OS-2026-1241","2026-09-19","Escola Pequeno Saber","Dedetização","Marcos",960,"Concluída"]
];

var EMAILS=[
 {id:1,cx:"comercial",f:"inbox",st:"responder",unread:true,de:"Marina Alves",em:"sindico@jardimdasflores.com.br",cli:1,ass:"Orçamento para dedetização das áreas comuns",hora:"09:42",data:"Hoje",
  body:"Bom dia!\n\nGostaríamos de um orçamento para a dedetização das áreas comuns do condomínio (garagem, salão de festas e casa de máquinas). Temos preferência por uma data na próxima semana, se possível pela manhã.\n\nObrigada,\nMarina Alves\nSíndica",
  sug:"Olá, Marina! Obrigado pelo contato.\n\nPara as áreas comuns (garagem, salão de festas e casa de máquinas), o valor fica em R$ 1.280,00, com garantia de 90 dias por escrito. Temos disponibilidade na segunda, 12/10, ou na terça, 13/10, às 8h.\n\nQual data fica melhor para vocês?\n\nEquipe Monte Fuji",ag:true},
 {id:2,cx:"atendimento",f:"inbox",st:"responder",unread:true,de:"Sérgio Prado",em:"contato@paodourado.com.br",cli:2,ass:"Certificado da dedetização de setembro",hora:"08:15",data:"Hoje",
  body:"Pessoal, a vigilância sanitária vem na sexta. Podem me mandar o certificado da dedetização de setembro?\n\nSérgio",
  sug:"Olá, Sérgio!\n\nSegue em anexo o certificado da dedetização realizada em 18/09/2026 (OS-2026-1238), válido até 18/10/2026. Se precisar, também enviamos a ficha técnica dos produtos utilizados.\n\nBoa fiscalização!\nEquipe Monte Fuji"},
 {id:3,cx:"comercial",f:"inbox",st:"responder",unread:false,de:"Eng. Renata Campos",em:"obras@vilayara.com.br",cli:3,ass:"Bloco B: cronograma de descupinização",hora:"Ontem",data:"06/10",
  body:"Olá, precisamos alinhar o tratamento do Bloco B. A entrega das chaves está prevista para 20/11. Conseguem executar antes?\n\nRenata",
  sug:"Olá, Renata!\n\nConseguimos executar o Bloco B entre 26 e 28/10, com folga para a entrega de 20/11. O tratamento leva 3 dias e a liberação do local ocorre 24 h após cada etapa.\n\nPodemos confirmar?\nEquipe Monte Fuji",ag:true},
 {id:4,cx:"atendimento",f:"inbox",st:"responder",unread:false,de:"Luiz Ferreira",em:"gerencia@sabordaserra.com.br",cli:5,ass:"Ralo da cozinha voltou a entupir",hora:"Ontem",data:"06/10",
  body:"Boa tarde. O ralo da cozinha voltou a dar problema. O serviço de junho tem garantia ainda?\n\nLuiz",
  sug:"Olá, Luiz!\n\nO desentupimento de 02/06 teve garantia de 90 dias, encerrada em 31/08. Mesmo assim, podemos fazer uma vistoria sem custo amanhã às 14h para identificar a causa e passar o orçamento.\n\nPode ser?\nEquipe Monte Fuji"},
 {id:5,cx:"comercial",f:"inbox",st:"pendente",unread:false,de:"Fernanda Rocha",em:"compras@bompreco.com.br",cli:7,ass:"Re: Renovação do contrato de desratização",hora:"02/10",data:"02/10",
  body:"Recebi a proposta, vou levar para a diretoria e retorno até o dia 10.\n\nFernanda",sug:""},
 {id:6,cx:"atendimento",f:"inbox",st:"pendente",unread:false,de:"Cláudia Mendes",em:"secretaria@pequenosaber.com.br",cli:8,ass:"Re: Datas para dedetização nas férias",hora:"30/09",data:"30/09",
  body:"Vou confirmar o calendário escolar e já aviso as datas de dezembro.\n\nCláudia",sug:""},
 {id:7,cx:"financeiro",f:"inbox",st:"lido",unread:false,de:"Conta Azul",em:"notificacoes@contaazul.com",cli:0,ass:"3 faturas vencem nesta semana",hora:"01/10",data:"01/10",
  body:"Você tem 3 contas a pagar com vencimento entre 05/10 e 11/10, somando R$ 8.732,40. Acesse o painel para conferir.",sug:""},
 {id:10,cx:"financeiro",f:"inbox",st:"responder",unread:true,de:"Patrícia Gomes",em:"financeiro@clinicavida.com.br",cli:0,ass:"Segunda via do boleto de setembro",hora:"10:05",data:"Hoje",
  body:"Olá! Não recebemos o boleto referente ao serviço de setembro. Podem enviar a segunda via?\n\nPatrícia\nClínica Vida",
  sug:"Olá, Patrícia!\n\nSegue em anexo a segunda via do boleto de setembro, com vencimento em 15/10/2026. Qualquer dúvida, estamos à disposição.\n\nFinanceiro Monte Fuji"},
 {id:11,cx:"financeiro",f:"inbox",st:"lido",unread:false,de:"Distribuidora Pragas Sul",em:"nfe@pragassul.com.br",cli:0,ass:"NF-e 48.211 emitida",hora:"Ontem",data:"06/10",
  body:"Prezado cliente, a nota fiscal eletrônica 48.211 no valor de R$ 3.420,00 foi emitida contra o CNPJ da Monte Fuji. Vencimento: 05/10/2026.",sug:""},
 {id:12,cx:"financeiro",f:"sent",st:"enviado",unread:false,de:"Para: Luiz Ferreira",em:"gerencia@sabordaserra.com.br",cli:5,ass:"Fatura de agosto em aberto",hora:"03/10",data:"03/10",
  body:"Olá, Luiz! Identificamos que a fatura de agosto (R$ 760,00) segue em aberto. Podemos enviar um novo boleto?\n\nFinanceiro Monte Fuji",sug:""},
 {id:8,cx:"atendimento",f:"sent",st:"enviado",unread:false,de:"Para: Roberto Lima",em:"adm@solarpiratininga.com.br",cli:6,ass:"Limpeza semestral da caixa d'água vence em outubro",hora:"29/09",data:"29/09",
  body:"Olá, Roberto!\n\nA última limpeza do reservatório foi em 15/04. Para manter a periodicidade de 6 meses, sugerimos agendar entre 13 e 17/10.\n\nEquipe Monte Fuji",sug:""},
 {id:9,cx:"atendimento",f:"sent",st:"enviado",unread:false,de:"Para: Ana Paula Souza",em:"anapsouza@email.com",cli:4,ass:"Certificado da limpeza da caixa d'água",hora:"28/09",data:"28/09",
  body:"Olá, Ana Paula! Segue o certificado da limpeza realizada hoje, com data da próxima visita recomendada: março de 2027.",sug:""}
];

var TAREFAS=[
 {id:1,col:"todo",t:"Enviar proposta ao Cond. Jardim das Flores",d:"Áreas comuns, usar resposta sugerida.",due:"2026-10-07",who:"JR",tag:"Comercial"},
 {id:2,col:"todo",t:"Renovar ASO do Diego",d:"Venceu em 02/10. Agendar clínica.",due:"2026-10-02",who:"PN",tag:"RH"},
 {id:3,col:"todo",t:"Comprar gel para baratas",d:"Estoque abaixo do mínimo.",due:"2026-10-09",who:"PB",tag:"Compras"},
 {id:4,col:"today",t:"Ligar para a Fernanda (Bom Preço)",d:"Retorno sobre renovação do contrato.",due:"2026-10-07",who:"JR",tag:"Comercial"},
 {id:5,col:"today",t:"Conferir rotas de amanhã",d:"5 técnicos, 18 visitas.",due:"2026-10-07",who:"PB",tag:"Operação",chk:"2/5"},
 {id:6,col:"doing",t:"Atualizar tabela de preços 2027",d:"Revisar valores por m².",due:"2026-10-15",who:"PB",tag:"Gestão"},
 {id:7,col:"doing",t:"Cobrar Restaurante Sabor da Serra",d:"Fatura de agosto em aberto.",due:"2026-10-05",who:"PN",tag:"Financeiro"},
 {id:8,col:"done",t:"Enviar certificado à Ana Paula",d:"",due:"2026-09-28",who:"JR",tag:"Atendimento",done:true},
 {id:9,col:"done",t:"Revisão do caminhão",d:"Troca de óleo e pneus.",due:"2026-10-03",who:"RF",tag:"Frota",done:true}
];

var FATURAS=[
 ["Distribuidora Pragas Sul","Produtos","2026-09-20","2026-10-05",3420.00,"Vencida"],
 ["Seguro da frota","Frota","2026-09-25","2026-10-08",1890.00,"A vencer"],
 ["Aluguel do galpão","Estrutura","2026-10-01","2026-10-10",6500.00,"A vencer"],
 ["Telefonia e internet","Administrativo","2026-10-01","2026-10-11",342.40,"A vencer"],
 ["Combustível · posto conveniado","Frota","2026-10-01","2026-10-15",2846.90,"A vencer"],
 ["Contabilidade","Administrativo","2026-10-01","2026-10-15",1450.00,"A vencer"],
 ["Uniformes e EPIs","Equipe","2026-09-15","2026-10-20",2180.00,"A vencer"],
 ["Energia elétrica","Estrutura","2026-09-28","2026-10-22",612.75,"A vencer"],
 ["Distribuidora Pragas Sul","Produtos","2026-09-02","2026-10-01",2950.00,"Paga"],
 ["Folha de pagamento","Equipe","2026-09-30","2026-10-05",58400.00,"Paga"]
];

var CONTRATOS=[
 ["Mercado Bom Preço","Desratização mensal",680,"2025-10-12","2026-10-12","Renovação pendente"],
 ["Padaria Pão Dourado","Dedetização + desratização",890,"2026-01-18","2027-01-18","Ativo"],
 ["Cond. Jardim das Flores","Reservatórios semestral + dedetização",410,"2026-03-28","2027-03-28","Ativo"],
 ["Escola Pequeno Saber","Plano anual escolar",520,"2026-02-01","2027-02-01","Ativo"],
 ["Edifício Solar Piratininga","Reservatórios superiores semestral",400,"2025-10-14","2026-10-14","Renovação pendente"],
 ["Restaurante Sabor da Serra","Dedetização bimestral",380,"2026-04-30","2027-04-30","Inadimplente"]
];
var INADIMP=[
 ["Restaurante Sabor da Serra","Fatura ago/2026",760,38],
 ["Oficina Duas Rodas","OS-2026-1199",450,26],
 ["Cond. Morada do Sol","Fatura set/2026",1240,12],
 ["Lanchonete Ponto Certo","OS-2026-1215",280,9]
];

var CF={M:["Out","Nov","Dez","Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set"],Y:["2025","2025","2025","2026","2026","2026","2026","2026","2026","2026","2026","2026"],
 rec:[205,199,221,182,176,195,201,188,214,226,219,238],des:[141,138,152,128,126,133,139,131,147,152,149,166]};

/* agenda: visitas de outubro geradas a partir de uma semente fixa (técnico é interno, só para não sobrepor horários) */
var GAR_OPC=[[0,"Sem garantia"],[1,"1 mês"],[3,"3 meses"],[6,"6 meses"],[12,"12 meses"]];
var EVENTS=(function(){
  var r=rng(20261007),out=[],sv=Object.keys(SERV),cl=CLIENTES.map(function(c){return c.nome}).concat(["Residência Oliveira","Cond. Bela Vista","Farmácia Central","Hotel Osasco Plaza","Igreja São José","Clínica Vida","Academia Corpo Ativo","Pet Shop Amigo Fiel"]);
  var OBS=["Portaria libera a partir das 7h30.","Avisar moradores com 48 h de antecedência.","Retirar pets durante a aplicação.","Acesso pela doca, falar com o encarregado.","",""];
  for(var d=1;d<=31;d++){
    var dt=new Date(2026,9,d),wd=dt.getDay();if(wd===0)continue;
    var n=wd===6?2+Math.floor(r()*2):3+Math.floor(r()*4),busy={};
    if(d===12||d===13)n=2;
    for(var k=0;k<n;k++){
      var tec=k%5,s=sv[Math.floor(r()*sv.length)],svs=[s];
      if(s==="Dedetização"&&r()<.4)svs.push("Desratização");
      var dur=s==="Termonebulização"?3:(s.indexOf("reservatórios")>0?2:1);
      var h=(d===12||d===13)?13+k*2:7+Math.floor(r()*9),ok=false;
      for(var tries=0;tries<12&&!ok;tries++){ok=true;for(var q=h;q<h+dur;q++)if(busy[tec+"-"+q]||q>18)ok=false;if(!ok)h=7+((h-6)%11)}
      if(!ok)continue;for(var q2=h;q2<h+dur;q2++)busy[tec+"-"+q2]=1;
      out.push({id:"e"+d+"-"+k,date:ymd(dt),h:h,dur:dur,s:s,svs:svs,cli:cl[Math.floor(r()*cl.length)],gar:GAR_OPC[Math.floor(r()*5)][0],obs:OBS[Math.floor(r()*OBS.length)]});
    }
  }
  out.push({id:"jf",date:"2026-10-07",h:14,dur:2,s:"Limpeza dos reservatórios de água inferiores e superiores",svs:["Limpeza dos reservatórios de água inferiores e superiores"],cli:"Cond. Jardim das Flores",gar:6,obs:"Falar com a síndica Marina na chegada.",grp:"jf"});
  out.push({id:"jf2",date:"2026-10-21",h:9,dur:1,s:"Dedetização",svs:["Dedetização","Desratização"],cli:"Cond. Jardim das Flores",gar:3,obs:"Áreas comuns e garagem.",grp:"jf2"});
  out.push({id:"jf3",date:"2026-10-28",h:9,dur:1,s:"Dedetização",svs:["Dedetização","Desratização"],cli:"Cond. Jardim das Flores",gar:3,obs:"Áreas comuns e garagem. Segunda aplicação.",grp:"jf2"});
  return out;
})();
function evOn(s){return EVENTS.filter(function(e){return e.date===s}).sort(function(a,b){return a.h-b.h})}

/* aniversários da equipe */
function bdaysOn(ds){var md=ds.slice(5);return FUNC.filter(function(f){return f.nasc&&f.nasc.slice(5)===md})}
function firstName(n){return n.split(" ")[0]}

/* Google Drive (simulado): pasta de cada cliente */
CLIENTES.forEach(function(c){if(c.id!==8)c.pasta="Clientes / "+c.nome});
var DRIVE_FOLDERS=CLIENTES.map(function(c){return c.nome}).concat(["Escola Pequeno Saber - Unidade 2","Hospital Santa Clara","Cond. Morada do Sol","Oficina Duas Rodas","Lanchonete Ponto Certo","Galpão Logístico Anhanguera"]);
function driveFiles(c){
  var os=osDoCliente(c).slice(0,4).map(function(o){return [o[0]+".pdf",o[1],"OS"]});
  var cert=c.hist.slice(0,2).map(function(h){return ["Certificado "+(SERV[h[1]]?SERV[h[1]].sh:h[1])+" "+dmy(h[0]).slice(3)+".pdf",h[0],"Certificado"]});
  return os.concat(cert).sort(function(a,b){return a[1]<b[1]?1:-1});
}
/* ordens de serviço do cliente: as da lista + as do histórico */
function osDoCliente(c){
  var a=OSL.filter(function(o){return o[2]===c.nome});
  c.hist.forEach(function(h,i){if(!a.some(function(o){return o[1]===h[0]&&o[3]===h[1]}))a.push(["OS-"+h[0].slice(0,4)+"-"+String(900+c.id*17+i*5).padStart(4,"0"),h[0],c.nome,h[1],h[3],0,"Concluída"])});
  return a.sort(function(x,y){return x[1]<y[1]?1:-1});
}
/* Conta Azul (simulado): pagamentos do cliente */
function pagamentos(c){
  if(!c.hist.length)return [];
  var r=rng(c.id*97),out=[],base={1:410,2:890,3:4200,4:480,5:380,6:400,7:680,8:520}[c.id]||450;
  for(var i=0;i<5;i++){var d=new Date(2026,8-i,c.id+5),st="Pago";
    if(c.id===5&&i<2)st=i===0?"Em aberto":"Vencido";
    out.push([ymd(d),(i===0&&c.id===5?"Fatura set/2026":"Fatura "+MES3[d.getMonth()].toLowerCase()+"/2026"),Math.round(base*(.9+r()*.2)),st,st==="Pago"?["Pix","Boleto","Boleto"][Math.floor(r()*3)]:"Boleto"]);}
  return out;
}
/* Receita Federal (simulado, no sistema real via BrasilAPI) */
var RECEITA={
 "11222333000181":{razao:"Hospital Santa Clara Ltda.",fantasia:"Hospital Santa Clara",end:"Av. Santo Antônio, 1500 · Vila Osasco, Osasco/SP",tel:"(11) 3699-4000",email:"compras@hsantaclara.com.br",perfil:"Comércio",situacao:"Ativa",abertura:"1998-03-12",cnae:"86.10-1-01 · Atividades de atendimento hospitalar"},
 "44555666000102":{razao:"Condomínio Residencial Morada do Sol",fantasia:"Cond. Morada do Sol",end:"Rua Dona Primitiva Vianco, 300 · Centro, Osasco/SP",tel:"(11) 3684-2210",email:"sindico@moradadosol.com.br",perfil:"Condomínio",situacao:"Ativa",abertura:"2009-08-01",cnae:"81.12-5-00 · Condomínios prediais"}
};
function consultaCNPJ(d){
  if(RECEITA[d])return RECEITA[d];
  var n=d.slice(8,12),nomes=["Comercial","Distribuidora","Indústria","Serviços"],k=+d[3]%4;
  return {razao:nomes[k]+" Exemplo "+n+" Ltda.",fantasia:nomes[k]+" Exemplo "+n,end:"Rua Exemplo, "+(+d.slice(0,3))+" · Centro, Osasco/SP",tel:"(11) 3600-"+n,email:"contato@exemplo"+n+".com.br",perfil:"Comércio",situacao:"Ativa",abertura:"2015-0"+(1+k)+"-10",cnae:"47.11-3-02 · Comércio varejista"};
}
function fmtCNPJ(d){return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,"$1.$2.$3/$4-$5")}

/* A receber: clientes avulsos (sem contrato) */
var RECEBER=[
 {id:1,nome:"Oficina Duas Rodas",doc:"31.442.118/0001-07",contato:"Rogério",tel:"(11) 97455-1203",email:"oficina2rodas@email.com",serv:"Desentupimento da caixa de gordura",os:"OS-2026-1199",valor:450,nf:"2318",nfData:"2026-09-10",cob:"2026-09-10",canal:"E-mail",forma:"Boleto",venc:"2026-09-11",pago:"",hist:[["2026-09-25","Lembrete enviado por WhatsApp"]],obs:"Disse que pagaria após o dia 15."},
 {id:2,nome:"Lanchonete Ponto Certo",doc:"28.910.334/0001-55",contato:"Dona Célia",tel:"(11) 98102-7781",email:"pontocerto@email.com",serv:"Dedetização da cozinha",os:"OS-2026-1215",valor:280,nf:"2341",nfData:"2026-09-27",cob:"2026-09-28",canal:"WhatsApp",forma:"Pix",venc:"2026-09-28",pago:"",hist:[],obs:""},
 {id:3,nome:"Cond. Morada do Sol",doc:"44.555.666/0001-02",contato:"Síndico Antônio",tel:"(11) 3684-2210",email:"sindico@moradadosol.com.br",serv:"Limpeza dos reservatórios de água superiores",os:"OS-2026-1236",valor:1240,nf:"2356",nfData:"2026-09-25",cob:"2026-09-25",canal:"E-mail",forma:"Boleto",venc:"2026-10-10",pago:"",hist:[],obs:""},
 {id:4,nome:"Clínica Vida",doc:"19.887.402/0001-90",contato:"Patrícia Gomes (financeiro)",tel:"(11) 3608-1144",email:"financeiro@clinicavida.com.br",serv:"Desratização e dedetização",os:"OS-2026-1240",valor:760,nf:"2370",nfData:"2026-10-01",cob:"",canal:"",forma:"Boleto",venc:"2026-10-15",pago:"",hist:[],obs:"Pediu segunda via do boleto por e-mail."},
 {id:5,nome:"Hotel Osasco Plaza",doc:"07.663.219/0001-48",contato:"Marcelo (manutenção)",tel:"(11) 3681-9000",email:"manutencao@osascoplaza.com.br",serv:"Termonebulização das áreas de serviço",os:"OS-2026-1243A",valor:1980,nf:"2375",nfData:"2026-10-03",cob:"2026-10-03",canal:"E-mail",forma:"Transferência",venc:"2026-10-18",pago:"",hist:[],obs:""},
 {id:6,nome:"Residência Oliveira",doc:"CPF ***.331.908-**",contato:"Sr. Oliveira",tel:"(11) 99230-4417",email:"oliveira.casa@email.com",serv:"Limpeza preventiva da rede de esgoto",os:"OS-2026-1238",valor:350,nf:"2366",nfData:"2026-09-30",cob:"2026-09-30",canal:"WhatsApp",forma:"Pix",venc:"2026-10-05",pago:"2026-10-02",hist:[],obs:""},
 {id:7,nome:"Farmácia Central",doc:"12.004.556/0001-31",contato:"Ricardo",tel:"(11) 3602-1150",email:"farmaciacentral@email.com",serv:"Dedetização do estoque",os:"OS-2026-1247B",valor:620,nf:"",nfData:"",cob:"",canal:"",forma:"Boleto",venc:"2026-10-20",pago:"",hist:[],obs:"Emitir NF com o CNPJ da matriz."},
 {id:8,nome:"Academia Corpo Ativo",doc:"33.718.205/0001-66",contato:"Fábio",tel:"(11) 97100-3329",email:"adm@corpoativo.com.br",serv:"Limpeza dos reservatórios de água inferiores",os:"OS-2026-1230",valor:890,nf:"2349",nfData:"2026-09-22",cob:"2026-09-22",canal:"E-mail",forma:"Boleto",venc:"2026-10-06",pago:"2026-10-05",hist:[],obs:""},
 {id:9,nome:"Pet Shop Amigo Fiel",doc:"40.112.873/0001-20",contato:"Juliana",tel:"(11) 98877-6655",email:"amigofiel@email.com",serv:"Dedetização",os:"OS-2026-1248B",valor:410,nf:"2380",nfData:"2026-10-06",cob:"2026-10-06",canal:"E-mail",forma:"Pix",venc:"2026-10-13",pago:"",hist:[],obs:""}
];
function recSt(r){if(r.pago)return["ok","Recebido"];if(!r.nf)return["ne","NF a emitir"];if(r.venc<"2026-10-07")return["er","Vencido"];if(!r.cob)return["al","Cobrança pendente"];return["in","A vencer"]}
