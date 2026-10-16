var G = [{ id: 'c', name: 'Cabo de dia' }, { id: 'p', name: 'Plantões' }], cfg = { c: 'c', p: 'p' };
var S = [["09/10/26", "Sexta-feira"], ["10/10/26", "Sábado"], ["11/10/26", "Domingo"], ["12/10/26", "Segunda-feira", 1], ["13/10/26", "Terça-feira"], ["14/10/26", "Quarta-feira"], ["15/10/26", "Quinta-feira"], ["16/10/26", "Sexta-feira"]].map(function (r) { return { d: r[0], w: r[1], f: !!r[2], c: null, p: [] } });
var LG = [], prevLG = null, lanc = '', UL = [];
var SM = S, SA = [], cur = 'm', lancs = { m: '', a: '' }, prs = { m: null, a: null }, AP = { n: 5, k: 3 }, autoSig = '', autoStale = false, autoBak = null;
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") }
function isWk(x) { return x.w === "Sábado" || x.w === "Domingo" || x.f }
function item(o, cls, i, k) {
    if (!o) return '<span class="vago">Vago</span>';
    var h = !!o.a;
    return '<span class="' + cls + (h ? ' has' : '') + '">' + esc(o.n) + (h ? '<span class="wn" tabindex="0" role="button" data-r="' + esc(o.a) + '" aria-label="Ver motivo do aviso"><i class="warn">!</i></span>' : '') + '<button type="button" class="swb" data-sw="1" data-i="' + i + '" data-k="' + k + '" title="Troca de serviço: outro militar assume e ganha a folga" aria-label="Trocar serviço de ' + esc(o.n) + '">⇄</button><button type="button" class="rm" data-i="' + i + '" data-k="' + k + '" title="Retirar ' + esc(o.n) + '" aria-label="Retirar ' + esc(o.n) + '">×</button></span>';
}
function render() {
    renderHead();
    if (typeof $ === 'function') fillPrint();
    save();
    document.getElementById("rows").innerHTML = S.map(function (x, di) {
    return '<tr class="' + (isWk(x) ? 'wk' : 'wd') + '">' + dateCell(x, di) + (cfg.c ? '<td data-l="' + esc(gnm(cfg.c)) + '">' + item(x.c, "cabo", di, "c") + cadd("c", di) + '</td>' : '') + (cfg.p ? '<td data-l="' + esc(gnm(cfg.p)) + '"><div class="pl">' + (x.p.map(function (o, k) { return item(o, "p", di, k) }).join("") || '<span class="vago">Sem plantões</span>') + cadd("p", di) + '</div></td>' : '') + '</tr>';
    }).join("");
}
render();

var WD = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"], editing = -1;
function dateCell(x, di) {
    if (di === editing) {
    return '<td class="date"><div class="ed"><input type="text" id="ed-d" value="' + esc(x.d) + '" maxlength="10" placeholder="dd/mm/aa" aria-label="Data"><select id="ed-w" aria-label="Dia da semana">' + WD.map(function (w) { return '<option' + (w === x.w ? ' selected' : '') + '>' + w + '</option>' }).join("") + '</select><label><input type="checkbox" id="ed-f"' + (x.f ? ' checked' : '') + '> Feriado</label><div class="row"><button type="button" class="b2" data-act="ok">Salvar</button><button type="button" class="b2 ghost" data-act="no">Cancelar</button><button type="button" class="b2 ghost" data-act="del">Excluir dia</button></div></div></td>';
    }
    return '<td class="date">' + x.d + '<button type="button" class="ed-btn" data-ed="' + di + '" title="Editar data e dia da semana" aria-label="Editar data e dia da semana">✎</button><button type="button" class="ed-btn" data-rd="' + di + '" title="Remover dia" aria-label="Remover dia">✕</button><span class="dow">' + x.w + '</span></td>';
}
function saveEd() {
    var d = document.getElementById("ed-d"), v = d.value.trim();
    if (!/^\d{2}\/\d{2}\/(\d{2}|\d{4})$/.test(v)) { d.className = "bad"; d.focus(); return }
    var x = S[editing]; x.d = v; x.w = document.getElementById("ed-w").value; x.f = document.getElementById("ed-f").checked;
    editing = -1; render();
}
function cancelEd() { editing = -1; render() }
document.getElementById("rows").addEventListener("click", function (e) {
    var t = e.target.closest("[data-ed],[data-act],[data-rd],[data-add]"); if (!t) return;
    if (t.hasAttribute("data-add")) { openM(t.getAttribute("data-add"), +t.getAttribute("data-di")); return }
    if (t.hasAttribute("data-rd")) { delDay(+t.getAttribute("data-rd")); return }
    if (t.hasAttribute("data-ed")) { editing = +t.getAttribute("data-ed"); render(); var i = document.getElementById("ed-d"); if (i) { i.focus(); i.select() } }
    else if (t.getAttribute("data-act") === "ok") saveEd(); else if (t.getAttribute("data-act") === "del") delDay(); else cancelEd();
});
document.getElementById("rows").addEventListener("keydown", function (e) {
    if (editing < 0 || !e.target.closest(".ed")) return;
    if (e.key === "Enter") { e.preventDefault(); saveEd() } else if (e.key === "Escape") { cancelEd() }
});
document.getElementById("rows").addEventListener("click", function (e) {
    var b = e.target.closest(".rm"); if (!b) return;
    var i = +b.getAttribute("data-i"), k = b.getAttribute("data-k"), d = S[i], o, pos;
    if (k === "c") { o = d.c; d.c = null } else { pos = +k; o = d.p.splice(pos, 1)[0] }
    render();
    toastUndo(o.n + " retirado de " + d.d, function () { if (k === "c") d.c = o; else d.p.splice(pos, 0, o); render() });
});
function toastUndo(t, fn) {
    var e = document.getElementById("toast"); e.innerHTML = "";
    var s = document.createElement("span"); s.textContent = t;
    var b = document.createElement("button"); b.type = "button"; b.textContent = "Desfazer";
    b.style.cssText = "margin-left:14px;background:none;border:0;color:inherit;text-decoration:underline;font-weight:700;cursor:pointer";
    b.onclick = function () { fn(); e.hidden = true };
    e.appendChild(s); e.appendChild(b); e.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(function () { e.hidden = true }, 5000);
}
var mode = "p", selP = {}, selD = {};
var $ = function (i) { return document.getElementById(i) };
var M = [];
function addM(n, g) { if (!M.some(function (m) { return m.n === n })) M.push({ n: n, g: g, prev: g, dest: '', dp: '' }) }
function names(g) { return M.filter(function (m) { return m.g === g }).map(function (m) { return m.n }) }
/* Dispensa: m.g==='d' = dispensa total; m.dp==='b' = só dias de semana (escala preta); m.dp==='r' = só fim de semana e feriados (escala vermelha) */
function isD(m) { return m.g === 'd' || !!m.dp }
function blk(m, t) { return m.g === 'd' || (!!m.dp && m.dp === t) }
function dScope(m) { return (m.g === 'd' || !m.dp) ? 'Total · todas as escalas' : m.dp === 'b' ? 'Somente dias de semana (escala preta) · continua na escala vermelha' : 'Somente fim de semana e feriados (escala vermelha) · continua na escala preta' }
function dpb(m) { return (m.g !== 'd' && m.dp) ? '<span class="rb rr" title="' + esc(dScope(m)) + '">DISP. ' + (m.dp === 'b' ? 'SEMANA' : 'FDS') + '</span>' : '' }
var dOpen = false, OP = { c: true, p: true, n: true, dg: true };
function renderM() {
    save();
    buildCols(); gids().concat(['n', 'dg']).forEach(function (g) {
    var l = M.filter(function (m) { return g === 'dg' ? isD(m) : m.g === g });
    $('n-' + g).textContent = l.length + (g === 'dg' && l.some(function (m) { return retMsg(m) }) ? ' ⚠' : '');
    $('l-' + g).hidden = !OP[g]; var hb = $('n-' + g).parentNode; hb.setAttribute('aria-expanded', OP[g]); hb.querySelector('.ar').textContent = OP[g] ? '▾' : '▸';
    $('l-' + g).innerHTML = l.length ? l.map(function (m) { var i = M.indexOf(m); if (g === 'dg') return dRow(m, i); return '<li class="mi"><b>' + esc(m.n) + rbadge(m) + dpb(m) + '</b><span class="acts"><select class="sm gsel" data-a="gp" data-i="' + i + '" aria-label="Grupo de ' + esc(m.n) + '">' + gopts(g) + '</select><button type="button" class="sm" data-a="fg" data-i="' + i + '">Folga</button><button type="button" class="sm" data-a="ds" data-i="' + i + '">Dispensar</button><button type="button" class="sm del" data-a="rm" data-i="' + i + '">Excluir</button></span></li>' }).join('') : '<li class="emp">Nenhum militar neste grupo.</li>';
    if (g === 'dg') $('l-dg').insertAdjacentHTML('beforeend', '<li class="mi"><button type="button" class="sm" data-a="dnew">+ Adicionar à dispensa</button></li>');
    });
    var d = M.filter(isD);
    $('tab-d').textContent = 'Dispensados (' + d.length + ')' + (d.some(function (m) { return retMsg(m) }) ? ' ⚠' : '');
    $('l-d').innerHTML = d.length ? d.map(function (m) { var i = M.indexOf(m); return '<li class="mi"><b>' + esc(m.n) + ' ' + retWarn(m) + '</b><span class="acts"><button type="button" class="sm" data-a="fg" data-i="' + i + '">Folga</button><button type="button" class="sm" data-a="ret" data-i="' + i + '">Retornar</button></span><span class="dest"><strong>Abrangência:</strong> ' + esc(dScope(m)) + '<br><strong>Destino:</strong> ' + esc(m.dest) + (m.ini && m.fim ? ' · <strong>Dispensa:</strong> ' + fmtI(m.ini) + ' a ' + fmtI(m.fim) : '') + '</span></li>' }).join('') : '<li class="emp">Ninguém dispensado.</li>';
}
function gname(g) { return gnm(g) }
$('sec-m').addEventListener('click', function (e) { var b = e.target.closest('.gt'); if (!b) return; var g = b.getAttribute('data-g'); OP[g] = !OP[g]; renderM() });
$('sec-m').addEventListener('change', function (e) { var b = e.target.closest('[data-a="gp"]'); if (!b) return; var m = M[+b.getAttribute('data-i')]; m.g = b.value; m.prev = b.value; renderM(); toast(m.n + ' → ' + gname(m.g)) });
function mAct(e) {
    var b = e.target.closest('[data-a]'); if (!b) return;
    var i = +b.getAttribute('data-i'), m = M[i], a = b.getAttribute('data-a');
    if (a === 'fg') openF(i);
    else if (a === 'mv') { m.g = m.g === 'c' ? 'p' : 'c'; m.prev = m.g; renderM(); toast(m.n + ' movido para ' + gname(m.g)) }
    else if (a === 'ds') openD(m.n); else if (a === 'dnew') openD();
    else if (a === 'ret') { var par = m.g !== 'd'; if (!par) m.g = m.prev; m.dp = ''; m.dest = ''; m.ini = ''; m.fim = ''; renderM(); toast(m.n + (par ? ' retornou à escala' : ' retornou para ' + gname(m.g))) }
    else if (a === 'rm') { M.splice(i, 1); renderM(); toastUndo(m.n + ' excluído', function () { M.splice(i, 0, m); renderM() }) }
}
$('sec-m').addEventListener('click', mAct); $('sec-d').addEventListener('click', mAct); $('sec-s').addEventListener('click', mAct);
var fIdx = -1;
function openF(i) { fIdx = i; var m = M[i]; $('fN').textContent = m.n; $('fb').value = restT(m, 'b'); $('fr').value = restT(m, 'r'); $('ovf').hidden = false; $('fb').focus(); $('fb').select() }
function closeF() { $('ovf').hidden = true; fIdx = -1 }
function confirmF(clear) {
    var m = M[fIdx]; if (!m) return; var o = m.o || (m.o = {});
    [['b', 'fb'], ['r', 'fr']].forEach(function (p) {
    var v = parseInt($(p[1]).value, 10); if (isNaN(v) || v < 0) v = 0;
    var d = clear ? 0 : v - restT(m, p[0], 1);
    if (d === 0) delete o[p[0]]; else o[p[0]] = { v: d, q: LSEQ };
    });
    var n = m.n; closeF(); renderM(); renderSug(); renderMini(); save();
    toast(clear ? 'Ajustes de folga removidos de ' + n : 'Folga de ' + n + ' ajustada');
}
$('fok').onclick = function () { confirmF(false) };
$('fcl').onclick = function () { confirmF(true) };
$('ovf').addEventListener('click', function (e) { if (e.target === $('ovf')) closeF() });
$('ovf').addEventListener('keydown', function (e) { if (e.key === 'Enter') confirmF(false); if (e.key === 'Escape') closeF() });
function createM() {
    var gu = $('nn').value.trim().replace(/\s+/g, ' ').toUpperCase(), n = $('np').value + ' ' + gu;
    if (!gu) { $('nn').focus(); return }
    if (!$('np').value) { toast('Cadastre um cargo em "Cargos" antes de criar o militar'); return }
    if (M.some(function (m) { return m.n === n })) { toast('Já existe um militar com esse nome'); return }
    var g = 'n'; OP.n = true; M.push({ n: n, g: g, prev: g, dest: '', dp: '', base: LG.length });
    $('nn').value = ''; $('nn').focus(); renderM(); toast(n + ' criado em ' + gname(g));
}
var tip = document.createElement('div'); tip.id = 'tip'; tip.hidden = true; document.body.appendChild(tip);
var pin = null;
function showTip(el) {
    tip.innerHTML = '<small>Aviso</small><span></span>';
    tip.lastChild.textContent = el.getAttribute('data-r');
    tip.hidden = false;
    var r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
    var top = r.top - h - 8; if (top < 8) top = r.bottom + 8;
    var left = Math.max(8, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 8));
    tip.style.top = top + 'px'; tip.style.left = left + 'px';
}
function hideTip() { tip.hidden = true; pin = null }
function wnOf(e) { return e.target.closest ? e.target.closest('.wn') : null }
document.addEventListener('mouseover', function (e) { var w = wnOf(e); if (w && !pin) showTip(w) });
document.addEventListener('mouseout', function (e) { if (wnOf(e) && !pin) tip.hidden = true });
document.addEventListener('focusin', function (e) { var w = wnOf(e); if (w && !pin) showTip(w) });
document.addEventListener('focusout', function (e) { if (wnOf(e) && !pin) tip.hidden = true });
document.addEventListener('click', function (e) { var w = wnOf(e); if (w) { if (pin === w) { hideTip() } else { pin = w; showTip(w) } } else hideTip() });
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hideTip();
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('wn')) { e.preventDefault(); e.target.click() }
});
window.addEventListener('scroll', hideTip, true);
function upS() {
    var n = $('sn').value.trim(), p = $('sp').value, f = $('sf').value.trim();
    $('s1').textContent = (n ? n.toUpperCase() : 'NOME COMPLETO') + (p ? ' – ' + p : '');
    $('s2').textContent = f || 'Função';
    save();
}
['sn', 'sp', 'sf'].forEach(function (i) { $(i).addEventListener('input', upS); $(i).addEventListener('change', upS) });
var MS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
function pd(s) { var p = s.split('/'); return { d: p[0], m: MS[(+p[1]) - 1] || p[1], y: (p[2] || '').slice(-2) } }
function rng(a, b) {
    var x = pd(a), y = pd(b);
    if (a === b) return x.d + ' ' + x.m + ' ' + x.y;
    if (x.y !== y.y) return x.d + ' ' + x.m + ' ' + x.y + ' a ' + y.d + ' ' + y.m + ' ' + y.y;
    if (x.m !== y.m) return x.d + ' ' + x.m + ' a ' + y.d + ' ' + y.m + ' ' + y.y;
    return x.d + ' a ' + y.d + ' ' + x.m + ' ' + x.y;
}
var TT = { 1: 'Escala de Serviço de', 2: 'Previsão da Escala de Serviço de' };
function ttl(k) { var v = ($('tt' + k).value || '').trim().replace(/\s+/g, ' '); return esc(v || TT[k]) }
['tt1', 'tt2'].forEach(function (i) { $(i).addEventListener('input', save) });
$('tt-r').onclick = function () { $('tt1').value = ''; $('tt2').value = ''; save(); toast('Títulos restaurados para o padrão') };
function pn(o) { return o ? esc(o.n) + (o.a ? '*' : '') : 'VAGO' }
function ptab(rows, third) {
    var two = !!(cfg.c && cfg.p);
    var cg = '<col style="width:11%"><col style="width:17%">' + (two ? '<col style="width:17%">' : '') + '<col>';
    var hd = '<th colspan="2">DATA</th>' + (cfg.c ? '<th>' + esc(gnm(cfg.c).toUpperCase()) + '</th>' : '') + (cfg.p ? '<th>' + esc(gnm(cfg.p).toUpperCase()) + '</th>' : '');
    return '<table><colgroup>' + cg + '</colgroup><thead><tr>' + hd + '</tr></thead><tbody>' + rows.map(function (x) {
    return '<tr' + (isWk(x) ? ' class="g"' : '') + '><td>' + esc(x.d) + '</td><td>' + esc(x.w.toUpperCase()) + '</td>' +
        (cfg.c ? '<td>' + pn(x.c) + '</td>' : '') +
        (cfg.p ? '<td>' + (x.p.map(pn).join(' – ') || '—') + '</td>' : '') + '</tr>';
    }).join('') + '</tbody></table>';
}

function printHTML() { return '<div class="sty s' + PST + '">' + printHTML0() + '</div>' }
function printHTML0() {
    var e1 = +$('e1').value, e2 = +$('e2').value, p1 = +$('p1').value, p2 = +$('p2').value, t;
    if (e2 < e1) { t = e1; e1 = e2; e2 = t } if (p2 < p1) { t = p1; p1 = p2; p2 = t }
    var a = S.slice(e1, e2 + 1), b = p1 < 0 ? [] : S.slice(p1, p2 + 1), h = '';
    h += '<h2>' + ttl(1) + '<br>' + rng(a[0].d, a[a.length - 1].d) + '</h2>' + ptab(a, 'PLANTÃO');
    if (b.length) h += '<h2 class="h2b">' + ttl(2) + '<br>' + rng(b[0].d, b[b.length - 1].d) + '</h2>' + ptab(b, 'PLANTÃO');
    var sn = $('sn').value.trim(), sp = $('sp').value, sf = $('sf').value.trim();
    if (sn || sp || sf) h += '<div class="ps"><b>' + (sn ? esc(sn.toUpperCase()) : '') + (sn && sp ? ' – ' : '') + (sp ? esc(sp) : '') + '</b>' + (sf ? '<br>' + esc(sf) : '') + '</div>';
    return h;
}
function buildPrint() { $('pr').innerHTML = printHTML() }
function doPrint() { if ($('pb').disabled) { toast('Lance a escala para liberar a impressão'); return } askStyle('Imprimir', function () { buildPrint(); window.print() }) }
window.addEventListener('beforeprint', buildPrint);
function isoToday() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) }
function fmtI(s) { return s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(2, 4) }
function daysTo(iso) { var p = iso.split('-'), a = new Date(+p[0], +p[1] - 1, +p[2]), n = new Date(); n = new Date(n.getFullYear(), n.getMonth(), n.getDate()); return Math.round((a - n) / 864e5) }
function retMsg(m) {
    if (!m.fim) return '';
    var r = daysTo(m.fim), f = fmtI(m.fim);
    if (r < 0) return 'Dispensa encerrada em ' + f + ': já pode voltar para a escala';
    if (r === 0) return 'Último dia de dispensa (hoje, ' + f + ')';
    if (r <= 2) return 'Volta em ' + r + ' dia' + (r > 1 ? 's' : '') + ' — fim da dispensa em ' + f;
    return '';
}
function retWarn(m) { var t = retMsg(m); return t ? '<span class="wn" tabindex="0" role="button" data-r="' + esc(t) + '" aria-label="Ver aviso de retorno"><i class="warn">!</i></span>' : '' }
function addDay() {
    var L = S[S.length - 1], p = L.d.split('/'), yl = (p[2] || '').length, y = +p[2];
    if (yl === 2) y += 2000;
    var dt = new Date(y, (+p[1]) - 1, (+p[0]) + 1);
    if (isNaN(dt.getTime())) { toast('Corrija a data da última linha antes de adicionar um dia'); return }
    var yy = String(dt.getFullYear()); if (yl === 2) yy = yy.slice(-2);
    var nd = ('0' + dt.getDate()).slice(-2) + '/' + ('0' + (dt.getMonth() + 1)).slice(-2) + '/' + yy;
    var atEnd = erng()[1] === S.length - 1, allL = rangeLaunched();
    S.push({ d: nd, w: WD[(WD.indexOf(L.w) + 1) % 7], f: false, c: null, p: [] });
    render();
    if (allL) { var fu = firstUnlaunched(); $('e1').value = String(fu < 0 ? S.length - 1 : fu); $('e2').value = String(S.length - 1); $('p1').value = '-1'; updLaunch(); save() }
    else if (atEnd) { $('e2').value = String(S.length - 1); updLaunch(); save() }
    toast('Dia ' + nd + ' adicionado' + ((allL || atEnd) ? ' · o intervalo "Escala" passou a incluir o novo dia' : ''));
}
function delDay(i) {
    if (i === undefined) i = editing;
    if (S.length <= 1) { toast('A escala precisa ter ao menos um dia'); return }
    var x = S.splice(i, 1)[0]; editing = -1; render();
    toastUndo('Dia ' + x.d + ' excluído', function () { S.splice(i, 0, x); render() });
}
$('ad').onclick = addDay;
function cadd(k, di) { var t = 'Adicionar em ' + gnm(cfg[k]); return '<button type="button" class="cadd" data-add="' + k + '" data-di="' + di + '" title="' + t + '" aria-label="' + t + '">+</button>' }
function dRow(m, i) {
    return '<li class="mi"><b>' + esc(m.n) + ' ' + retWarn(m) + '</b><span class="acts"><button type="button" class="sm" data-a="fg" data-i="' + i + '">Folga</button><button type="button" class="sm" data-a="ret" data-i="' + i + '">Retornar</button></span><span class="dest"><strong>' + (m.g === 'd' || !m.dp ? 'Total' : (m.dp === 'b' ? 'Só dias de semana' : 'Só fim de semana/feriados')) + '</strong> · ' + esc(m.dest) + (m.ini && m.fim ? ' · ' + fmtI(m.ini) + ' a ' + fmtI(m.fim) : '') + '</span></li>';
}
var PD = { e1: 0, e2: 5, p1: 6, p2: 7 };
function fillPrint() {
    ['e1', 'e2', 'p1', 'p2'].forEach(function (id) {
    var el = $(id), v = el.value === '' ? PD[id] : +el.value; if (v > S.length - 1) v = S.length - 1;
    var o = S.map(function (x, i) { return '<option value="' + i + '">' + esc(x.d) + ' · ' + esc(x.w.slice(0, 3)) + '</option>' }).join('');
    el.innerHTML = (id === 'p1' ? '<option value="-1">Sem previsão</option>' : '') + o;
    el.value = String(v);
    });
}
fillPrint();
$('nc').onclick = createM;
$('nn').addEventListener('keydown', function (e) { if (e.key === 'Enter') createM() });

function openD(n) {
    var act = M.filter(function (m) { return m.g !== 'd' });
    if (!act.length) { toast('Nenhum militar disponível'); return }
    $('dm').innerHTML = act.map(function (m) { return '<option' + (m.n === n ? ' selected' : '') + '>' + esc(m.n) + '</option>' }).join('');
    $('dt').value = 'a';
    $('dd').value = ''; $('di').value = isoToday(); $('df').value = ''; chkD(); $('ov2').hidden = false; $('dd').focus();
}
function closeD() { $('ov2').hidden = true }
function chkD() { var i = $('di').value, f = $('df').value; $('dok').disabled = !($('dd').value.trim() && i && f && f >= i) }
function confirmD() {
    var dest = $('dd').value.trim(); if (!dest || $('dok').disabled) return;
    var m = M.filter(function (x) { return x.n === $('dm').value })[0]; if (!m) return;
    var tp = $('dt').value;
    var inS = S.some(function (x) {
    var t = isWk(x) ? 'r' : 'b'; if (tp !== 'a' && tp !== t) return false;
    return (x.c && x.c.n === m.n) || x.p.some(function (o) { return o.n === m.n });
    });
    if (tp === 'a') { m.prev = m.g; m.g = 'd'; m.dp = '' } else { m.dp = tp }
    m.dest = dest; m.ini = $('di').value; m.fim = $('df').value; closeD(); OP.dg = true; renderM();
    toast(m.n + ' dispensado' + (tp === 'b' ? ' (só dias de semana)' : tp === 'r' ? ' (só fim de semana e feriados)' : '') + (inS ? ' (continua nas escalas já montadas)' : ''));
}
$('dd').addEventListener('input', chkD); $('di').addEventListener('input', chkD); $('df').addEventListener('input', chkD); $('di').addEventListener('change', chkD); $('df').addEventListener('change', chkD);
$('dd').addEventListener('keydown', function (e) { if (e.key === 'Enter') confirmD() });
$('dok').onclick = confirmD;
$('da').onclick = function () { openD() };
$('ov2').addEventListener('click', function (e) { if (e.target === $('ov2')) closeD() });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeD() });
Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (b) {
    b.onclick = function () {
    var t = b.getAttribute('data-t');
    Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (x) { x.classList.toggle('on', x === b) });
    $('sec-e').hidden = t !== 'e'; $('sec-s').hidden = t !== 's'; $('sec-m').hidden = t !== 'm'; $('sec-d').hidden = t !== 'd'; $('sec-h').hidden = t !== 'h'; if (t === 'h') renderHist(); $('mini').hidden = t !== 'e'; if (t !== 'e' && cur === 'a' && autoStale) regenAuto(); if (t === 's') renderSug();
    }
});
renderM();

function tkey(d) { var p = String(d).split('/'), y = +p[2]; if ((p[2] || '').length === 2) y += 2000; return y * 10000 + (+p[1]) * 100 + (+p[0]) }
function isRed(r) { return r.r !== undefined ? !!r.r : (r.w === 'Sábado' || r.w === 'Domingo') }
function lastT(n, t) { for (var i = LG.length - 1; i >= 0; i--) { var r = LG[i]; if (isRed(r) === (t === 'r') && (r.c === n || r.p.indexOf(n) > -1)) return i } return -1 }
function offOf(m, t) { var o = m.o && m.o[t]; if (!o) return 0; var i = lastT(m.n, t); if (i >= 0 && (LG[i].q || 0) > o.q) return 0; return o.v }
function anyAdj() { return M.some(function (m) { return offOf(m, 'b') || offOf(m, 'r') }) }
function restT(m, t, raw) {
    var i = lastT(m.n, t), from = i >= 0 ? i + 1 : (m.base || 0), c = 0;
    for (var j = from; j < LG.length; j++)if (isRed(LG[j]) === (t === 'r') && (LG[j].q || 0) > resetSeq) c++;
    if (!raw) c += offOf(m, t);
    return Math.max(0, c);
}
function restFor(m, t) { return t === 'b' || t === 'r' ? restT(m, t) : Math.min(restT(m, 'b'), restT(m, 'r')) }
function lastFor(n, t) { return t === 'b' || t === 'r' ? lastT(n, t) : Math.max(lastT(n, 'b'), lastT(n, 'r')) }
function bP(m) { return '<span class="rb" title="Folga na escala preta (dia de semana)' + (offOf(m, 'b') ? ' · ajustada manualmente' : '') + '">P ' + restT(m, 'b') + (offOf(m, 'b') ? '*' : '') + '</span>' }
function bV(m) { return '<span class="rb rr" title="Folga na escala vermelha (fim de semana e feriados)' + (offOf(m, 'r') ? ' · ajustada manualmente' : '') + '">V ' + restT(m, 'r') + (offOf(m, 'r') ? '*' : '') + '</span>' }
function bdg(m, t) { if (!LG.length && !anyAdj()) return ''; return t === 'b' ? bP(m) : t === 'r' ? bV(m) : bP(m) + bV(m) }
function rbadge(m) { return bdg(m, 'm') }
function erng() { var a = +$('e1').value, b = +$('e2').value, t; if (b < a) { t = a; a = b; b = t } return [a, b] }
function prng() { var a = +$('p1').value, b = +$('p2').value, t; if (a < 0) return null; if (b < a) { t = a; a = b; b = t } return [a, b] }
function sigNow() { var e = erng(), p = prng(); return JSON.stringify({ e: e, p: p, E: S.slice(e[0], e[1] + 1), P: p ? S.slice(p[0], p[1] + 1) : [] }) }
function updLaunch() {
    if (typeof $ !== 'function' || !$('lc') || $('e1').value === '') return;
    var e = erng(), a = S[e[0]], b = S[e[1]]; if (!a || !b) return;
    var ok = !!lanc && lanc === sigNow(), st = $('ls');
    $('pb').disabled = !ok; $('pb').title = ok ? '' : 'Lance a escala para liberar a impressão';
    if (ok) { st.textContent = '✔ Escala lançada (' + a.d + ' a ' + b.d + '). Impressão liberada.'; st.className = 'ls ok' }
    else if (lanc) { st.textContent = 'Há alterações não lançadas. Lance de novo para liberar a impressão.'; st.className = 'ls bad' }
    else { st.textContent = 'Escala ainda não lançada. Confira em Visualizar e clique em LANÇAR para liberar a impressão.'; st.className = 'ls' }
    var po = pendingOutside();
    if (po.length) { st.textContent += ' ⚠ ' + po.length + ' dia(s) com militares fora do intervalo "Escala" ainda não foram lançados e não contam folga. Ajuste as datas em "Escala".'; st.className = 'ls bad' }
}
function dayLaunched(x) {
    var k = tkey(x.d), r = null, i;
    for (i = 0; i < LG.length; i++)if (tkey(LG[i].d) === k) { r = LG[i]; break }
    if (!r) return false;
    var pn = x.p.map(cr).sort().join('|'), rn = r.p.slice().sort().join('|');
    var rt = (r.tr || []).map(function (z) { return z.k + ':' + z.by + '>' + z.for }).sort().join('|');
    if (trOf(x) !== rt) return false;
    return (x.c ? cr(x.c) : '') === r.c && pn === rn;
}
function rangeLaunched() {
    var e = erng(), i;
    for (i = e[0]; i <= e[1]; i++)if (!S[i] || !dayLaunched(S[i])) return false;
    return true;
}
function firstUnlaunched() { for (var i = 0; i < S.length; i++)if (!dayLaunched(S[i])) return i; return -1 }
function pendingOutside() {
    var e = erng(), p = prng(), o = [];
    S.forEach(function (x, i) {
    if (i >= e[0] && i <= e[1]) return;
    if (p && i >= p[0] && i <= p[1]) return;
    if ((x.c || x.p.length) && !dayLaunched(x)) o.push(i);
    });
    return o;
}
function cmpS(a, b, t) {
    var d = restFor(b, t) - restFor(a, t); if (d) return d;
    var la = lastFor(a.n, t), lb = lastFor(b.n, t); if (la !== lb) return la - lb;
    return a.n < b.n ? -1 : 1;
}
function curIdx() {
    var o = {}, e = erng(), p = prng(), i;
    for (i = e[0]; i <= e[1]; i++)o[i] = 1;
    if (p) for (i = p[0]; i <= p[1]; i++)o[i] = 1;
    return Object.keys(o).map(Number).filter(function (i) { return S[i] });
}
function svcDays(n) { return curIdx().filter(function (j) { var x = S[j]; return (x.c && x.c.n === n) || x.p.some(function (o) { return o.n === n }) }) }
function dnum(d) { var p = String(d).split('/'), y = +p[2]; if ((p[2] || '').length === 2) y += 2000; return Date.UTC(y, (+p[1]) - 1, +p[0]) / 864e5 }
function gap(i, j) { var g = Math.abs(dnum(S[i].d) - dnum(S[j].d)) - 1; return isNaN(g) ? Math.abs(i - j) - 1 : g }
var sgT = 'b', mT = 'b';
function renderSug() {
    if (typeof $ !== 'function' || !$('sgcols')) return;
    $('sg-u').disabled = !UL.length; $('sg-u').textContent = 'Desfazer último passo' + (UL.length > 1 ? ' (' + UL.length + ')' : ''); $('sg-e').hidden = !!LG.length;
    $('sec-s').setAttribute('data-t', sgT);
    Array.prototype.forEach.call(document.querySelectorAll('[data-st]'), function (b) { b.classList.toggle('on', b.getAttribute('data-st') === sgT) });
    var oth = sgT === 'b' ? 'r' : 'b', nome = sgT === 'r' ? 'vermelha' : 'preta';
    $('sgcols').innerHTML = G.map(function (gr) {
    var g = gr.id, mx = 0;
    var l = M.filter(function (m) { return m.g === g && !blk(m, sgT) }).sort(function (a, b) { return cmpS(a, b, sgT) });
    l.forEach(function (m) { mx = Math.max(mx, restT(m, sgT)) });
    return '<div class="card"><div class="gh"><span>' + esc(gr.name) + '</span><span>' + l.length + '</span></div><ul class="ml">' + (l.length ? l.map(function (m, i) {
        var r = restT(m, sgT), li = lastT(m.n, sgT), pc = mx ? Math.round(r / mx * 100) : 0, top = i < 3 && LG.length > 0;
        return '<li class="sr' + (top ? ' top' : '') + '"><span class="rk">' + (i + 1) + '</span><span class="rn"><b>' + esc(m.n) + '</b>' + (top ? '<em class="tg">Sugestão</em>' : '') + '<button type="button" class="sm" style="margin-left:8px" data-a="fg" data-i="' + M.indexOf(m) + '" title="Ajustar folga manualmente">Folga</button><small>' + (li >= 0 ? 'Último serviço: ' + esc(LG[li].d) : (LG.length ? 'Ainda não serviu na escala ' + nome : 'Sem lançamentos')) + ' · ' + (oth === 'r' ? 'Vermelha' : 'Preta') + ': ' + restT(m, oth) + ' d</small></span><span class="rv"><b>' + r + '</b><span>dia' + (r === 1 ? '' : 's') + ' de folga</span></span><i class="bar"><u style="width:' + pc + '%"></u></i></li>';
    }).join('') : '<li class="emp">Nenhum militar neste grupo.</li>') + '</ul></div>';
    }).join('');
}
function renderMini() {
    if (typeof $ !== 'function' || !$('mn-g')) return;
    $('mini').setAttribute('data-t', mT);
    Array.prototype.forEach.call(document.querySelectorAll('[data-mt]'), function (b) { b.classList.toggle('on', b.getAttribute('data-mt') === mT) });
    $('mn-g').innerHTML = [cfg.c, cfg.p].filter(Boolean).map(function (g) {
    var l = M.filter(function (m) { return m.g === g && !blk(m, mT) }).sort(function (a, b) { return cmpS(a, b, mT) }).slice(0, 3);
    return '<div class="mn-s"><span>' + esc(gnm(g)) + '</span><ol>' + (l.length ? l.map(function (m, i) { var u = svcDays(m.n).length > 0; return '<li' + (u ? ' class="mn-u" title="Já escalado na escala em exibição"' : '') + '><i>' + (i + 1) + '</i><span>' + esc(m.n) + (u ? ' ✓' : '') + '</span><b>' + (LG.length || anyAdj() ? restT(m, mT) + ' d' : '—') + '</b></li>' }).join('') : '<li class="mn-e">Ninguém disponível</li>') + '</ol></div>';
    }).join('');
}
$('sec-s').addEventListener('click', function (e) { var b = e.target.closest('[data-st]'); if (!b) return; sgT = b.getAttribute('data-st'); renderSug() });
$('mini').addEventListener('click', function (e) { var b = e.target.closest('[data-mt]'); if (b) { mT = b.getAttribute('data-mt'); renderMini(); return } if (e.target.closest('#mn-x')) $('mini').classList.toggle('min') });
if (window.innerWidth < 900) $('mini').classList.add('min');
function fmtD(dt, yl) { var yy = String(dt.getFullYear()); if (yl === 2) yy = yy.slice(-2); return ('0' + dt.getDate()).slice(-2) + '/' + ('0' + (dt.getMonth() + 1)).slice(-2) + '/' + yy }
function pickA(g, cnt, t) {
    var cand = M.filter(function (m) { return m.g === g && !blk(m, t) }), pr = LG[LG.length - 1];
    var ok = cand.filter(function (m) { return !(pr && (pr.c === m.n || pr.p.indexOf(m.n) > -1)) });
    var pool = (ok.length >= cnt ? ok : cand).slice().sort(function (a, b) { return cmpS(a, b, t) });
    return pool.slice(0, cnt).map(function (m) { return m.n });
}
function genAuto(keep) {
    if (!LG.length) return null;
    var kp = keep && keep.length ? keep : null, n = kp ? kp.length : AP.n, k = AP.k, last = LG[LG.length - 1];
    var p = String(last.d).split('/'), yl = (p[2] || '').length, y = +p[2]; if (yl === 2) y += 2000;
    var dt = new Date(y, (+p[1]) - 1, (+p[0]) + 1);
    if (!kp && isNaN(dt.getTime())) return null;
    var wi = WD.indexOf(last.w); if (wi < 0) wi = (new Date(y, (+p[1]) - 1, +p[0]).getDay() + 6) % 7;
    var save = LG, out = [], i, x, t, cb, pl;
    LG = JSON.parse(JSON.stringify(LG));
    try {
    for (i = 0; i < n; i++) {
        if (kp) x = { d: kp[i].d, w: kp[i].w, f: !!kp[i].f, c: null, p: [] };
        else { x = { d: fmtD(dt, yl), w: WD[(wi + 1 + i) % 7], f: false, c: null, p: [] }; dt.setDate(dt.getDate() + 1) }
        t = isWk(x) ? 'r' : 'b';
        cb = cfg.c ? pickA(cfg.c, 1, t) : []; pl = cfg.p ? pickA(cfg.p, k, t) : [];
        x.c = cb.length ? { n: cb[0], a: '' } : null;
        x.p = pl.map(function (nm) { return { n: nm, a: '' } });
        LG.push({ d: x.d, w: x.w, r: t === 'r' ? 1 : 0, q: 1e9 + i, c: cb[0] || '', p: pl });
        out.push(x);
    }
    } finally { LG = save }
    return out;
}
function rebuildSel() {
    ['e1', 'e2', 'p1', 'p2'].forEach(function (id) { $(id).innerHTML = '' });
    var q = prs[cur];
    if (q && q.e1 !== '' && q.e1 !== undefined && !isNaN(+q.e1)) PD = { e1: +q.e1, e2: +q.e2, p1: +q.p1, p2: +q.p2 };
    else PD = cur === 'a' ? { e1: 0, e2: S.length - 1, p1: -1, p2: S.length - 1 } : { e1: 0, e2: 5, p1: 6, p2: 7 };
    fillPrint();
}
function renderAuBox() {
    if (typeof $ !== 'function' || !$('au-box')) return;
    $('au-t').textContent = 'Começa no dia seguinte ao último dia lançado (' + LG[LG.length - 1].d + ') e segue por ' + AP.n + ' dia' + (AP.n > 1 ? 's' : '') + '. Em cada dia entram os militares mais folgados, com a folga preta (dia de semana) e a vermelha (fim de semana e feriados) contadas separadamente. ' + (cfg.c ? gnm(cfg.c) + ': 1 por dia' : '') + (cfg.c && cfg.p ? ' · ' : '') + (cfg.p ? gnm(cfg.p) + ': ' + AP.k + ' por dia' : '') + '. Você pode editar como na escala manual.';
    $('au-n').value = AP.n;
    $('au-bak').hidden = !autoBak;
    var st = $('au-s');
    if (autoStale) { st.textContent = '✔ Escala lançada. Imprima agora: ao sair desta aba, o sistema gera a próxima escala automática.'; st.className = 'ls ok' }
    else { st.textContent = 'Esta escala se atualiza sozinha sempre que outra escala for lançada.'; st.className = 'ls' }
}
function renderSub() {
    if (typeof $ !== 'function' || !$('au-box')) return;
    Array.prototype.forEach.call(document.querySelectorAll('[data-sub]'), function (b) { b.classList.toggle('on', b.getAttribute('data-sub') === cur) });
    var a = cur === 'a', has = SA.length > 0;
    $('au-box').hidden = !(a && has); $('au-empty').hidden = !(a && !has); $('esc-main').hidden = a && !has;
    if (a && has) renderAuBox();
}
function regenAuto(keep) {
    if (!LG.length) { SA = []; autoSig = ''; autoStale = false; autoBak = null; lancs.a = ''; if (cur === 'a') setCur('m'); else renderSub(); return false }
    var old = JSON.stringify(SA), edited = SA.length > 0 && old !== autoSig;
    var nd = genAuto(keep && SA.length ? SA : null);
    if (!nd || !nd.length) return false;
    autoBak = edited ? old : null;
    SA = nd; autoSig = JSON.stringify(SA); lancs.a = ''; autoStale = false;
    if (cur === 'a') { S = SA; lanc = ''; prs.a = null; editing = -1; rebuildSel(); render() }
    renderSub(); save();
    return true;
}
var mergeBak = null, resetSeq = -1, LSEQ = 0;
function sigFrom(arr, q) {
    var a = +q.e1, b = +q.e2, t; if (b < a) { t = a; a = b; b = t }
    var pa = +q.p1, pb = +q.p2, p = null; if (pa >= 0) { if (pb < pa) { t = pa; pa = pb; pb = t } p = [pa, pb] }
    return JSON.stringify({ e: [a, b], p: p, E: arr.slice(a, b + 1), P: p ? arr.slice(p[0], p[1] + 1) : [] });
}
function mergeToManual(rows) {
    var q = prs.m, was = !!(q && lancs.m && lancs.m === sigFrom(SM, q)), dt = {};
    mergeBak = { S: JSON.stringify(SM), p: q ? JSON.stringify(q) : '', l: lancs.m };
    if (q) ['e1', 'e2', 'p1', 'p2'].forEach(function (k) { var v = +q[k]; dt[k] = (q[k] !== '' && q[k] !== undefined && v >= 0 && SM[v]) ? SM[v].d : null });
    rows.forEach(function (x) {
    var cp = JSON.parse(JSON.stringify(x)), k = tkey(x.d), f = -1, i, ins = SM.length;
    for (i = 0; i < SM.length; i++)if (tkey(SM[i].d) === k) { f = i; break }
    if (f >= 0) { SM[f] = cp; return }
    for (i = 0; i < SM.length; i++)if (tkey(SM[i].d) > k) { ins = i; break }
    SM.splice(ins, 0, cp);
    });
    if (q) {
    var nq = {};
    ['e1', 'e2', 'p1', 'p2'].forEach(function (k) {
        if (dt[k] === null) { nq[k] = q[k]; return }
        var ix = -1; for (var i = 0; i < SM.length; i++)if (SM[i].d === dt[k]) { ix = i; break }
        nq[k] = String(ix < 0 ? q[k] : ix);
    });
    prs.m = nq;
    if (was) lancs.m = sigFrom(SM, nq);
    }
    return rows.length;
}
function autoAfter() {
    if (cur === 'a') { autoStale = true; renderAuBox(); return false }
    return regenAuto();
}
function setCur(k) {
    if (k === cur) { renderSub(); return }
    if (k === 'a' && !SA.length && LG.length) regenAuto();
    syncCur();
    var leaving = cur; cur = k; S = (k === 'a' ? SA : SM); lanc = lancs[k] || ''; editing = -1;
    rebuildSel(); render(); renderSub();
    if (leaving === 'a' && autoStale) regenAuto();
}
Array.prototype.forEach.call(document.querySelectorAll('[data-sub]'), function (b) { b.onclick = function () { setCur(b.getAttribute('data-sub')) } });
function doResetFolgas() {
    var bak = resetSeq, ob = {};
    M.forEach(function (m) { ob[m.n] = m.o ? JSON.stringify(m.o) : '' });
    resetSeq = LSEQ; M.forEach(function (m) { m.o = {} });
    regenAuto(); renderM(); renderSug(); renderMini(); save();
    toastUndo('Todas as folgas foram zeradas', function () { resetSeq = bak; M.forEach(function (m) { m.o = ob[m.n] ? JSON.parse(ob[m.n]) : {} }); regenAuto(); renderM(); renderSug(); renderMini(); save() });
}
$('sg-r').onclick = function () { askC('Resetar todas as folgas', 'Zerar os dias de folga (preta e vermelha) de TODOS os militares? O histórico de dias lançados é mantido e a contagem recomeça a partir do próximo lançamento. A escala automática será recalculada.', 'Resetar', doResetFolgas) };
$('au-n').onchange = function () { var v = Math.max(1, Math.min(31, parseInt(this.value, 10) || AP.n)); AP.n = v; this.value = v; regenAuto() };
$('au-new').onclick = function () { askC('Gerar de novo', 'Gerar uma nova escala automática a partir dos dias lançados? A atual (inclusive as suas edições) será substituída.', 'Gerar', function () { regenAuto() }) };
$('au-re').onclick = function () { askC('Recalcular militares', 'Recalcular os militares mantendo as datas, os dias da semana e os feriados desta escala? As escolhas feitas por você serão substituídas.', 'Recalcular', function () { regenAuto(true) }) };
$('au-bak').onclick = function () {
    if (!autoBak) return;
    SA = JSON.parse(autoBak); autoBak = null; lancs.a = '';
    if (cur === 'a') { S = SA; lanc = ''; prs.a = null; editing = -1; rebuildSel(); render() } else save();
    renderSub(); toast('Versão anterior restaurada');
};
var cFn = null;
function askC(t, m, ok, fn) { $('cT').textContent = t; $('cM').textContent = m; $('cOk').textContent = ok; cFn = fn; $('ovc').hidden = false }
function cClose() { $('ovc').hidden = true; cFn = null; if (typeof renderCfg === 'function') renderCfg() }
$('cOk').onclick = function () { var f = cFn; cClose(); if (f) f() };
function askLancar() {
    var e = erng(), a = S[e[0]], b = S[e[1]], p = prng(), n = e[1] - e[0] + 1;
    var vz = S.slice(e[0], e[1] + 1).filter(function (x) { return !x.c && !x.p.length }).length;
    askC('Lançar escala', 'Lançar a ESCALA de ' + a.d + ' a ' + b.d + ' (' + n + ' dia' + (n > 1 ? 's' : '') + ')? Quem estiver de serviço nesses dias passa a contar folga a partir do dia seguinte. ' + (p ? 'A PREVISÃO (' + S[p[0]].d + ' a ' + S[p[1]].d + ') não conta folga.' : '') + (vz ? ' Atenção: ' + vz + ' dia(s) sem ninguém escalado.' : '') + (rangeLaunched() ? ' Atenção: todos os dias deste intervalo já estão lançados com os mesmos militares, então nada muda nas folgas.' : '') + (pendingOutside().length ? ' Atenção: ' + pendingOutside().length + ' dia(s) fora do intervalo têm militares ainda não lançados.' : ''), 'LANÇAR', doLancar);
}
function doLancar() {
    var e = erng();
    prevLG = JSON.parse(JSON.stringify(LG)); mergeBak = null;
    var ent = { L: prevLG, mb: null, b: baseMap(), t: 'Lançamento de ' + S[e[0]].d + (e[1] > e[0] ? ' a ' + S[e[1]].d : '') };
    S.slice(e[0], e[1] + 1).forEach(function (x) {
    var rec = { d: x.d, w: x.w, r: isWk(x) ? 1 : 0, q: ++LSEQ, c: cfg.c && x.c ? cr(x.c) : '', p: cfg.p ? x.p.map(cr) : [], gc: cfg.c ? gnm(cfg.c) : '', gp: cfg.p ? gnm(cfg.p) : '', tr: trRec(x) }, k = tkey(x.d), f = -1;
    LG.forEach(function (r, i) { if (tkey(r.d) === k) f = i });
    if (f >= 0) LG[f] = rec; else LG.push(rec);
    });
    LG.sort(function (a, b) { return tkey(a.d) - tkey(b.d) });
    var ks = {}; S.slice(e[0], e[1] + 1).forEach(function (x) { if (x.p.length) ks[x.p.length] = (ks[x.p.length] || 0) + 1 });
    var kk = Object.keys(ks).sort(function (a, b) { return ks[b] - ks[a] || b - a })[0];
    if (!prevLG.length) AP = { n: AP.n, k: kk ? +kk : AP.k };
    lanc = sigNow();
    var mg = cur === 'a' ? mergeToManual(S.slice(e[0], e[1] + 1)) : 0;
    ent.mb = mergeBak; mergeBak = null; UL.push(ent); if (UL.length > 30) UL.shift();
    var au = autoAfter();
    renderM(); renderMini(); renderSug();
    toastUndo('Escala lançada: ' + (e[1] - e[0] + 1) + ' dia(s) contabilizado(s)' + (mg ? ' · enviada para a escala manual' : '') + (au ? ' · escala automática atualizada' : ''), undoLanc);
}
function undoLanc() {
    if (!UL.length) { toast('Nada para desfazer'); return }
    var en = UL.pop(), mb = en.mb;
    if (mb) { SM = JSON.parse(mb.S); prs.m = mb.p ? JSON.parse(mb.p) : null; if (cur === 'm') { S = SM; editing = -1; rebuildSel() } }
    LG = en.L; M.forEach(function (m) { if (en.b && en.b[m.n] !== undefined) m.base = en.b[m.n] });
    prevLG = UL.length ? UL[UL.length - 1].L : null; mergeBak = null;
    lanc = ''; lancs.m = ''; lancs.a = ''; autoStale = false; regenAuto(); renderM(); render();
    toast('Desfeito: ' + (en.t || 'último passo') + (UL.length ? ' · ainda há ' + UL.length + ' passo(s) para desfazer' : ''));
}
$('lc').onclick = askLancar;
$('sg-u').onclick = function () { askC('Desfazer lançamento', 'Desfazer o último lançamento? Os dias de folga voltam ao que eram antes dele e a impressão fica bloqueada até lançar de novo.', 'Desfazer', undoLanc) };
$('pv').onclick = function () { askStyle('Visualizar', openPv) };
function openPv() {
    $('pvb').innerHTML = printHTML();
    $('pvn').textContent = $('pb').disabled ? 'Prévia: a impressão só é liberada depois de LANÇAR.' : 'Escala lançada: a impressão está liberada.'; $('pvn').textContent += ' · Estilo: ' + PSN[PST];
    $('ov3').hidden = false;
};
$('ov3').addEventListener('click', function (e) { if (e.target === $('ov3')) $('ov3').hidden = true });
$('ovc').addEventListener('click', function (e) { if (e.target === $('ovc')) cClose() });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { $('ov3').hidden = true; cClose() } });
updLaunch(); renderSug(); renderMini();
var noW = {};
function drawW() {
    var ns = Object.keys(selP), show = $('wc').checked && ns.length > 1;
    $('wtg').hidden = !show; if (!show) return;
    $('wtl').innerHTML = ns.map(function (n) { return '<button type="button" class="pp' + (noW[n] ? '' : ' sel') + '" data-n="' + esc(n) + '">' + esc(n) + '</button>' }).join('');
}
function wq(none) { noW = {}; if (none) Object.keys(selP).forEach(function (n) { noW[n] = 1 }); drawW() }
$('wtl').addEventListener('click', function (e) { var b = e.target.closest('.pp'); if (!b) return; var n = b.getAttribute('data-n'); noW[n] ? delete noW[n] : noW[n] = 1; drawW() });
function openM(m, di) {
    mode = m; selP = {}; selD = {}; noW = {}; if (di !== undefined && S[di]) selD[di] = 1;
    $("mt").textContent = "Adicionar — " + gnm(cfg[m]);
    $("lp").textContent = (m === "c" ? "Disponíveis (um por dia)" : "Disponíveis") + " · sem serviço nesta escala";
    $("q").value = ""; $("wc").checked = false; $("wt").value = ""; $("wt").hidden = true;
    drawP(); drawD(); upd();
    $("ov").hidden = false; $("q").focus();
}
function closeM() { $("ov").hidden = true }
function selType() {
    var ks = Object.keys(selD); if (!ks.length) return 'm';
    var r = ks.filter(function (i) { return isWk(S[i]) }).length;
    return r === ks.length ? 'r' : r === 0 ? 'b' : 'm';
}
function drawP() {
    var q = $("q").value.trim().toUpperCase(), t = selType(), sel = Object.keys(selD).map(Number), av = [], bz = [];
    names(cfg[mode]).filter(function (n) { return n.indexOf(q) > -1 }).forEach(function (n) {
    var m = M.filter(function (x) { return x.n === n })[0], sv = svcDays(n);
    if (t !== 'm' && blk(m, t)) return;
    (sv.length ? bz : av).push({ n: n, m: m, sv: sv });
    });
    av.sort(function (a, b) { return cmpS(a.m, b.m, t) });
    $("people").innerHTML = av.map(function (o) {
    return '<button type="button" class="pp' + (selP[o.n] ? ' sel' : '') + '" data-n="' + esc(o.n) + '">' + esc(o.n) + bdg(o.m, t) + dpb(o.m) + '</button>';
    }).join("") || '<span style="color:var(--muted);font-size:.85rem">' + (q ? 'Nenhum militar encontrado.' : 'Todos já têm serviço nesta escala.') + '</span>';
    bz.forEach(function (o) {
    var best = null;
    sel.forEach(function (i) {
        o.sv.forEach(function (j) {
        if (j === i) { o.same = true; return }
        var g = gap(i, j); if (best === null || g < best.g) best = { g: g, j: j, i: i };
        })
    });
    o.best = best;
    });
    bz.sort(function (a, b) { var ga = a.best ? a.best.g : -1, gb = b.best ? b.best.g : -1; if (ga !== gb) return gb - ga; return cmpS(a.m, b.m, t) });
    $('p2w').hidden = !bz.length;
    $('people2').innerHTML = bz.map(function (o) {
    var dias = o.sv.map(function (j) { return S[j].d.slice(0, 5) + ' (' + S[j].w.slice(0, 3) + ')' }).join(' · ');
    var fo = o.same ? '<span class="pq3 bad">Já está em um dos dias selecionados</span>' : (o.best ? '<span class="pq3">Folga de <b>' + o.best.g + ' d</b> ' + (dnum(S[o.best.j].d) < dnum(S[o.best.i].d) ? 'após' : 'antes de') + ' ' + esc(S[o.best.j].d.slice(0, 5)) + (o.best.g === 0 ? ' (dias seguidos)' : '') + '</span>' : '<span class="pq3">Selecione o(s) dia(s) para ver a folga</span>');
    return '<button type="button" class="pq' + (selP[o.n] ? ' sel' : '') + '" data-n="' + esc(o.n) + '"><span class="pq1"><b>' + esc(o.n) + '</b>' + bdg(o.m, t) + dpb(o.m) + '</span><span class="pq2">De serviço: ' + esc(dias) + '</span>' + fo + '</button>';
    }).join('');
}
function drawD() {
    $("days").innerHTML = S.map(function (x, i) {
    return '<button type="button" class="dy' + (isWk(x) ? ' we' : '') + (selD[i] ? ' sel' : '') + '" data-i="' + i + '">' + x.d.slice(0, 5) + '<small>' + x.w.slice(0, 3) + '</small></button>';
    }).join("");
}
function qd(k) {
    selD = {};
    S.forEach(function (x, i) {
    if (k === "all" || (k === "wd" && !isWk(x)) || (k === "we" && isWk(x))) selD[i] = 1;
    });
    drawD(); drawP(); upd();
}
function upd() {
    var np = Object.keys(selP).length, nd = Object.keys(selD).length;
    $("cnt").textContent = np + " militar(es) · " + nd + " dia(s)";
    $("ok").disabled = !(np && nd);
    drawW();
}
$("people").addEventListener("click", function (e) {
    var b = e.target.closest(".pp"); if (!b) return;
    var n = b.getAttribute("data-n");
    if (mode === "c") { selP = {}; selP[n] = 1 } else { selP[n] ? delete selP[n] : selP[n] = 1 }
    drawP(); upd();
});
$("people2").addEventListener("click", function (e) {
    var b = e.target.closest(".pq"); if (!b) return;
    var n = b.getAttribute("data-n");
    if (mode === "c") { selP = {}; selP[n] = 1 } else { selP[n] ? delete selP[n] : selP[n] = 1 }
    drawP(); upd();
});
$("days").addEventListener("click", function (e) {
    var b = e.target.closest(".dy"); if (!b) return;
    var i = b.getAttribute("data-i");
    selD[i] ? delete selD[i] : selD[i] = 1;
    drawD(); drawP(); upd();
});
$("q").addEventListener("input", drawP);
$("wc").addEventListener("change", function () { $("wt").hidden = !this.checked; if (this.checked) $("wt").focus(); drawW() });
$("ov").addEventListener("click", function (e) { if (e.target === this) closeM() });
document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeM() });
function toast(t) { var e = $("toast"); e.textContent = t; e.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { e.hidden = true }, 2600) }
function confirmM() {
    var aviso = $("wc").checked ? ($("wt").value.trim() || "Sem motivo informado") : "";
    var names = Object.keys(selP), added = 0, skipped = 0, multi = names.length > 1;
    Object.keys(selD).forEach(function (i) {
    var day = S[i], tt = isWk(day) ? 'r' : 'b';
    names.forEach(function (n) {
        var mm = M.filter(function (x) { return x.n === n })[0];
        if (mm && blk(mm, tt)) { skipped++; return }
        if (mode === "c") { day.c = { n: n, a: (multi && noW[n]) ? '' : aviso }; added++ }
        else if (!day.p.some(function (o) { return o.n === n })) { day.p.push({ n: n, a: (multi && noW[n]) ? '' : aviso }); added++ }
    });
    });
    render(); closeM();
    toast((added ? added + " inclusão(ões) na escala" : "Nada novo: os militares já estavam nesses dias") + (skipped ? " · " + skipped + " ignorada(s) por dispensa" : ""));
}

function gnm(id) { var g = G.filter(function (x) { return x.id === id })[0]; return g ? g.name : 'Sem grupo' }
function gids() { return G.map(function (x) { return x.id }) }
function glc(r) { return r.gc === undefined ? 'Cabo de dia' : r.gc }
function glp(r) { return r.gp === undefined ? 'Plantões' : r.gp }
function gopts(g) { return G.map(function (x) { return '<option value="' + esc(x.id) + '"' + (g === x.id ? ' selected' : '') + '>' + esc(x.name) + '</option>' }).join('') + '<option value="n"' + (g === 'n' ? ' selected' : '') + '>Sem grupo</option>' }
function gcard(id, nm) { return '<div class="card"><button type="button" class="gh gt" data-g="' + esc(id) + '" aria-expanded="false"><span><i class="ar">▸</i> ' + esc(nm) + '</span><span id="n-' + esc(id) + '"></span></button>' + (id === 'n' ? '<p class="gnote">O militar continua cadastrado, mas não aparece nas listas de nenhum grupo da escala.</p>' : '') + '<ul class="ml" id="l-' + esc(id) + '"></ul></div>' }
function buildCols() {
    var h = G.map(function (g) { return gcard(g.id, g.name) }).join('') + gcard('n', 'Sem grupo') + gcard('dg', 'Dispensados');
    if (h !== buildCols.h) { buildCols.h = h; $('gcols').innerHTML = h }
}
function renderHead() {
    var h = '<th>Data</th>';
    ['c', 'p'].forEach(function (k) {
    if (!cfg[k]) return;
    h += '<th><div class="th">' + esc(gnm(cfg[k])) + '<button class="add" onclick="openM(\'' + k + '\')" aria-label="Adicionar em ' + esc(gnm(cfg[k])) + '" title="Adicionar em ' + esc(gnm(cfg[k])) + '">+</button></div></th>';
    });
    document.getElementById('thr').innerHTML = h;
}
/* tipo de escala: dupla (c e p) ou unica (so c = um por dia, ou so p = varios por dia) */
function renderCfg() {
    if (typeof $ !== 'function' || !$('cfgb')) return;
    var d = !!(cfg.c && cfg.p), o = function (sel) { return G.map(function (g) { return '<option value="' + esc(g.id) + '"' + (g.id === sel ? ' selected' : '') + '>' + esc(g.name) + '</option>' }).join('') };
    var h = '<label class="au-l">Tipo <select class="sel2" id="cf-m"><option value="d"' + (d ? ' selected' : '') + '>Dupla (dois grupos)</option><option value="u"' + (d ? '' : ' selected') + '>Única (um grupo)</option></select></label>';
    if (d) h += '<label class="au-l">1ª coluna <select class="sel2" id="cf-c">' + o(cfg.c) + '</select></label><label class="au-l">2ª coluna <select class="sel2" id="cf-p">' + o(cfg.p) + '</select></label>';
    else h += '<label class="au-l">Grupo <select class="sel2" id="cf-c">' + (G.length ? o(cfg.c || cfg.p) : '<option value="">Nenhum grupo</option>') + '</select></label><label class="au-l">Escalados por dia <select class="sel2" id="cf-q"><option value="1"' + (cfg.c ? ' selected' : '') + '>Um</option><option value="n"' + (cfg.c ? '' : ' selected') + '>Vários</option></select></label>';
    $('cfgb').innerHTML = h;
}
function applyCfg(nc) {
    var ch = ['c', 'p'].filter(function (k) { return nc[k] !== cfg[k] });
    SM.concat(SA).forEach(function (x) { ch.forEach(function (k) { if (k === 'c') x.c = null; else x.p = [] }) });
    cfg = nc; lanc = ''; lancs.m = ''; lancs.a = ''; editing = -1; autoStale = false;
    regenAuto(); renderCfg(); render(); renderM(); renderSug(); renderMini(); updLaunch();
}
function setCfg(nc) {
    var ch = ['c', 'p'].filter(function (k) { return nc[k] !== cfg[k] });
    if (!ch.length) return;
    var has = SM.concat(SA).some(function (x) { return ch.some(function (k) { return k === 'c' ? x.c : x.p.length }) });
    if (has) askC('Mudar grupos da escala', 'Trocar os grupos da escala limpa os militares já colocados nas colunas que mudaram (dias lançados no histórico não são alterados). Continuar?', 'Continuar', function () { applyCfg(nc) });
    else applyCfg(nc);
}
$('cfgb').addEventListener('change', function (e) {
    var id = e.target.id, v = e.target.value, d = !!(cfg.c && cfg.p), g1 = cfg.c || cfg.p, nc = { c: cfg.c, p: cfg.p };
    if (id === 'cf-m') {
    if (v === 'u') nc = { c: cfg.c, p: null };
    else {
        var other = gids().filter(function (i) { return i !== g1 })[0];
        if (!other) { toast('Crie outro grupo na aba Militares para usar escala dupla'); renderCfg(); return }
        if (cfg.c) nc.p = other; else nc.c = other;
    }
    }
    else if (id === 'cf-c') { if (d || cfg.c) nc.c = v; else nc.p = v }
    else if (id === 'cf-p') nc.p = v;
    else if (id === 'cf-q') nc = v === '1' ? { c: g1, p: null } : { c: null, p: g1 };
    if (nc.c && nc.c === nc.p) { toast('Escolha grupos diferentes'); renderCfg(); return }
    setCfg(nc);
});
/* gerenciar grupos */
var grEd = -1;
function drawGr() {
    $('gr-l').innerHTML = G.length ? G.map(function (g, i) {
    var n = M.filter(function (m) { return m.g === g.id }).length;
    if (i === grEd) return '<li class="mi"><input type="text" id="gr-ei" value="' + esc(g.name) + '" maxlength="30" style="flex:1;min-width:120px"><span class="acts"><button type="button" class="sm" data-ga="sv" data-i="' + i + '">Salvar</button><button type="button" class="sm" data-ga="cn">Cancelar</button></span></li>';
    return '<li class="mi"><b>' + esc(g.name) + '<span class="rb">' + n + '</span></b><span class="acts"><button type="button" class="sm" data-ga="ed" data-i="' + i + '">Editar</button><button type="button" class="sm del" data-ga="dl" data-i="' + i + '">Excluir</button></span></li>';
    }).join('') : '<li class="emp">Nenhum grupo.</li>';
}
function openGr() { grEd = -1; $('gr-n').value = ''; drawGr(); $('ovgr').hidden = false; $('gr-n').focus() }
function closeGr() { $('ovgr').hidden = true; grEd = -1 }
function grNorm(s) { return s.trim().replace(/\s+/g, ' ') }
function grDup(v, ex) { return G.some(function (g, i) { return i !== ex && g.name.toUpperCase() === v.toUpperCase() }) }
function grAfter() { renderM(); renderCfg(); render(); renderSug(); renderMini(); drawGr(); save() }
function grAdd() {
    var v = grNorm($('gr-n').value); if (!v) return;
    if (grDup(v, -1)) { toast('Já existe um grupo com esse nome'); return }
    var id = 'g' + Date.now().toString(36); G.push({ id: id, name: v }); OP[id] = true; $('gr-n').value = ''; grAfter(); $('gr-n').focus();
}
function grSave(i) {
    var v = grNorm($('gr-ei').value); if (!v) return;
    if (grDup(v, i)) { toast('Já existe um grupo com esse nome'); return }
    G[i].name = v; grEd = -1; grAfter();
}
function fixCfg() {
    var ids = gids(), nc = { c: cfg.c, p: cfg.p };
    ['c', 'p'].forEach(function (k) { if (nc[k] && ids.indexOf(nc[k]) < 0) nc[k] = null });
    if (!nc.c && !nc.p) nc.c = ids[0] || null;
    applyCfg(nc);
}
function grDel(i) {
    var g = G[i], used = cfg.c === g.id || cfg.p === g.id;
    askC('Excluir grupo', 'Excluir o grupo "' + g.name + '"? Os militares dele vão para "Sem grupo".' + (used ? ' Ele sai da escala atual e os militares colocados nessa coluna são retirados.' : ''), 'Excluir', function () {
    G.splice(i, 1);
    M.forEach(function (m) { if (m.g === g.id) m.g = 'n'; if (m.prev === g.id) m.prev = 'n' });
    fixCfg(); grAfter();
    });
}
$('gm-open').onclick = openGr;
$('gr-a').onclick = grAdd;
$('gr-l').addEventListener('click', function (e) {
    var b = e.target.closest('[data-ga]'); if (!b) return;
    var a = b.getAttribute('data-ga'), i = +b.getAttribute('data-i');
    if (a === 'ed') { grEd = i; drawGr(); var x = $('gr-ei'); if (x) { x.focus(); x.select() } }
    else if (a === 'cn') { grEd = -1; drawGr() }
    else if (a === 'sv') grSave(i);
    else if (a === 'dl') grDel(i);
});
$('ovgr').addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeGr();
    else if (e.key === 'Enter') { if (e.target.id === 'gr-n') grAdd(); else if (e.target.id === 'gr-ei') grSave(grEd) }
});
$('ovgr').addEventListener('click', function (e) { if (e.target === $('ovgr')) closeGr() });
var LSK = 'escala-servico-v1', ready = false, lastJ = '', tmr = null;
function setSt(t, k) { var e = $('st'); e.textContent = t; e.className = 'st ' + (k || '') }
function syncCur() { lancs[cur] = lanc; prs[cur] = { e1: $('e1').value, e2: $('e2').value, p1: $('p1').value, p2: $('p2').value } }
function snap() { syncCur(); return { v: 2, G: G, cfg: cfg, S: SM, SA: SA, AP: AP, autoSig: autoSig, autoStale: autoStale, mb: mergeBak, rs: resetSeq, lq: LSEQ, M: M, L: LG, Lp: prevLG, UL: UL, lanc: lancs.m, lancA: lancs.a, pg: { s: PGS, m: PGM }, ps: PST, tt: { a: $('tt1').value, b: $('tt2').value }, sig: { n: $('sn').value, p: $('sp').value, f: $('sf').value }, pr: prs.m, prA: prs.a } }
function applyState(st) {
    if (!st || !st.S || !st.S.length || !st.M) return false;
    st = JSON.parse(JSON.stringify(st));
    G = Array.isArray(st.G) ? st.G : [{ id: 'c', name: 'Cabo de dia' }, { id: 'p', name: 'Plantões' }]; cfg = st.cfg || { c: 'c', p: 'p' };
    SM = st.S; SA = st.SA || []; cur = 'm'; S = SM; M = st.M; LG = st.L || []; UL = st.UL || (st.Lp ? [{ L: st.Lp, mb: null, b: {}, t: 'Lançamento anterior' }] : []); if (st.mb && UL.length && !UL[UL.length - 1].mb) UL[UL.length - 1].mb = st.mb; prevLG = UL.length ? UL[UL.length - 1].L : null; lancs = { m: st.lanc || '', a: st.lancA || '' }; lanc = lancs.m; prs = { m: (st.pr && st.pr.e1 !== undefined) ? st.pr : null, a: st.prA || null }; AP = st.AP || AP; autoSig = st.autoSig || ''; autoStale = !!st.autoStale; autoBak = null; mergeBak = null; LSEQ = st.lq || 0; resetSeq = (st.rs !== undefined) ? st.rs : (st.rk ? LSEQ : -1); editing = -1;
    M.forEach(function (m) { if (m.dp === undefined) m.dp = '' });
    var g = st.sig || {}; $('sn').value = g.n || ''; if (st.ps && PSN[st.ps]) PST = st.ps; $('tt1').value = (st.tt && st.tt.a) || ''; $('tt2').value = (st.tt && st.tt.b) || ''; if (st.pg) { if (st.pg.s) PGS = st.pg.s; if (st.pg.m) PGM = st.pg.m } fillPg({ sp: g.p || '' }); setSp(g.p || ''); $('sf').value = g.f || '';
    render(); renderM(); fillPrint(); upS();
    var q = st.pr || {};
    ['e1', 'e2', 'p1', 'p2'].forEach(function (k) {
    if (q[k] !== undefined && q[k] !== '' && $(k).querySelector('option[value="' + q[k] + '"]')) $(k).value = String(q[k]);
    });
    renderCfg(); updLaunch(); renderSug(); renderMini(); renderSub();
    if (LG.length && (!SA.length || autoStale)) regenAuto();
    return true;
}
var PGS = ["SD EV", "SD EP", "AL", "CB EP", "3º SGT", "2º SGT", "1º SGT", "ST", "ASP OF", "2º TEN", "1º TEN", "CAP", "MAJ", "TC", "CEL"], PGM = ["SD EV", "SD EP", "CB", "AL"], pgK = 's', pgEd = -1;
function pgList() { return pgK === 's' ? PGS : PGM }
function fillPg(vs) {
    vs = vs || {};
    ['sp', 'np'].forEach(function (id) {
    var el = $(id), l = id === 'sp' ? PGS : PGM, cur = vs[id] !== undefined ? vs[id] : el.value;
    el.innerHTML = (id === 'sp' ? '<option value="">Selecione…</option>' : '') + l.map(function (x) { return '<option>' + esc(x) + '</option>' }).join('');
    el.value = l.indexOf(cur) > -1 ? cur : (id === 'np' ? (l[0] || '') : '');
    });
}
function setSp(v) {
    $('sp').value = v;
    if (v && $('sp').value !== v) { var o = document.createElement('option'); o.textContent = v; $('sp').appendChild(o); $('sp').value = v }
}
function pgHas(l, v, ex) { return l.some(function (x, i) { return i !== ex && x.toUpperCase() === v.toUpperCase() }) }
function pgNorm(s) { return s.trim().replace(/\s+/g, ' ').toUpperCase() }
function drawPg() {
    $('pg-t').textContent = pgK === 's' ? 'Cargos da assinatura' : 'Cargos para criação de militar';
    var l = pgList();
    $('pg-l').innerHTML = l.length ? l.map(function (x, i) {
    if (i === pgEd) return '<li class="mi"><input type="text" id="pg-ei" value="' + esc(x) + '" maxlength="20" style="flex:1;min-width:120px"><span class="acts"><button type="button" class="sm" data-pa="sv" data-i="' + i + '">Salvar</button><button type="button" class="sm" data-pa="cn">Cancelar</button></span></li>';
    return '<li class="mi"><b>' + esc(x) + '</b><span class="acts"><button type="button" class="sm" data-pa="ed" data-i="' + i + '">Editar</button><button type="button" class="sm del" data-pa="dl" data-i="' + i + '">Excluir</button></span></li>';
    }).join('') : '<li class="emp">Nenhum cargo cadastrado.</li>';
}
function openPg(k) { pgK = k; pgEd = -1; $('pg-n').value = ''; drawPg(); $('ovg').hidden = false; $('pg-n').focus() }
function closePg() { $('ovg').hidden = true; pgEd = -1 }
function pgAdd() {
    var v = pgNorm($('pg-n').value), l = pgList(); if (!v) return;
    if (pgHas(l, v, -1)) { toast('Esse cargo já existe'); return }
    l.push(v); $('pg-n').value = ''; fillPg(); upS(); drawPg(); $('pg-n').focus();
}
function pgSave(i) {
    var v = pgNorm($('pg-ei').value), l = pgList(); if (!v) return;
    if (pgHas(l, v, i)) { toast('Esse cargo já existe'); return }
    var old = l[i], vs = { sp: $('sp').value, np: $('np').value };
    l[i] = v; if (pgK === 's' && vs.sp === old) vs.sp = v; if (pgK === 'm' && vs.np === old) vs.np = v;
    pgEd = -1; fillPg(vs); upS(); drawPg();
}
$('pg-a').onclick = pgAdd;
$('pg-l').addEventListener('click', function (e) {
    var b = e.target.closest('[data-pa]'); if (!b) return;
    var a = b.getAttribute('data-pa'), i = +b.getAttribute('data-i'), l = pgList();
    if (a === 'ed') { pgEd = i; drawPg(); var x = $('pg-ei'); if (x) { x.focus(); x.select() } }
    else if (a === 'cn') { pgEd = -1; drawPg() }
    else if (a === 'sv') pgSave(i);
    else if (a === 'dl') askC('Excluir cargo', 'Excluir o cargo "' + l[i] + '" da lista? Militares já cadastrados não são alterados.', 'Excluir', function () { l.splice(i, 1); pgEd = -1; fillPg(); upS(); drawPg() });
});
$('ovg').addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePg();
    else if (e.key === 'Enter') { if (e.target.id === 'pg-n') pgAdd(); else if (e.target.id === 'pg-ei') pgSave(pgEd) }
});
$('ovg').addEventListener('click', function (e) { if (e.target === $('ovg')) closePg() });
Array.prototype.forEach.call(document.querySelectorAll('[data-pg]'), function (b) { b.onclick = function () { openPg(b.getAttribute('data-pg')) } });
fillPg();
var PST = '1', PSN = { '1': 'Clássico', '2': 'Moderno', '3': 'Minimalista', '4': 'Formal', '5': 'Compacto', '6': 'Alto contraste', '7': 'Azul institucional' }, pAct = null, pSel = '1';
function pSample(k) {
    var e = erng(), rows = S.slice(e[0], e[0] + 4); if (!rows.length) rows = S.slice(0, 4); if (!rows.length) return '';
    return '<div class="pv pvs"><div class="sty s' + k + '"><h2>' + ttl(1) + '<br>' + rng(rows[0].d, rows[rows.length - 1].d) + '</h2>' + ptab(rows, 'PLANTÃO') + '</div></div>';
}
function drawPs() {
    var d = { '1': 'Modelo atual: cabeçalho cinza e fim de semana em cinza escuro.', '2': 'Cabeçalho escuro, fim de semana em tom avermelhado e linhas alternadas.', '3': 'Sem molduras, só linhas finas. Economiza tinta e fica mais limpo.', '4': 'Letra serifada e filete duplo no título. Aspecto de documento oficial.', '5': 'Linhas mais baixas e fonte menor: cabe mais dias na mesma folha.', '6': 'Bordas grossas, texto em negrito e fim de semana hachurado. Ideal para preto e branco e cópias.', '7': 'Cabeçalho azul, linhas alternadas e fim de semana em azul claro.' };
    $('pp-g').innerHTML = ['1', '2', '3', '4', '5', '6', '7'].map(function (k) {
    return '<button type="button" class="ps-o' + (pSel === k ? ' sel' : '') + '" data-ps="' + k + '"><span class="nm">' + PSN[k] + (k === '1' ? '<em class="tg">Padrão</em>' : '') + '</span><span class="pd">' + d[k] + '</span>' + pSample(k) + '</button>';
    }).join('');
}
function askStyle(label, fn) { pAct = fn; pSel = PST; $('pp-ok').textContent = label; drawPs(); $('ovp').hidden = false }
function closePs() { $('ovp').hidden = true; pAct = null }
$('pp-g').addEventListener('click', function (e) { var b = e.target.closest('[data-ps]'); if (!b) return; pSel = b.getAttribute('data-ps'); drawPs() });
$('pp-ok').onclick = function () { PST = pSel; var f = pAct; $('ovp').hidden = true; pAct = null; save(); if (f) f() };
$('ovp').addEventListener('click', function (e) { if (e.target === $('ovp')) closePs() });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePs() });
function baseMap() { var o = {}; M.forEach(function (m) { o[m.n] = m.base }); return o }
function delLg(d) {
    var k = tkey(d), i = -1; LG.forEach(function (r, j) { if (tkey(r.d) === k) i = j });
    if (i < 0) return;
    var en = { L: JSON.parse(JSON.stringify(LG)), mb: null, b: baseMap(), t: 'Exclusão do dia ' + LG[i].d };
    LG.splice(i, 1); M.forEach(function (m) { if (m.base > i) m.base-- });
    UL.push(en); if (UL.length > 30) UL.shift(); prevLG = en.L; mergeBak = null;
    lanc = ''; lancs.m = ''; lancs.a = ''; autoStale = false; regenAuto(); renderM(); render();
    toast('Dia ' + d + ' excluído do histórico · dá para desfazer');
}
function renderHist() {
    if (typeof $ !== 'function' || !$('hs-l')) return;
    var q = $('hs-q').value.trim().toUpperCase(), tp = $('hs-t').value;
    var l = LG.filter(function (r) {
    if (tp && isRed(r) !== (tp === 'r')) return false;
    if (!q) return true;
    var h = [r.d, r.w, r.c].concat(r.p).concat((r.tr || []).map(function (z) { return z.by + ' ' + z.for })).join(' ').toUpperCase();
    return h.indexOf(q) > -1;
    }).reverse();
    $('hs-c').textContent = l.length + ' de ' + LG.length;
    $('hs-l').innerHTML = l.length ? l.map(function (r) {
    var tr = r.tr || [];
    function who(k, n) { var t = tr.filter(function (z) { return z.k === k && z.for === n })[0]; return t ? esc(t.by) + '* <i>(tirou o serviço de ' + esc(n) + ')</i>' : esc(n) }
    var red = isRed(r);
    return '<li class="mi"><b>' + esc(r.d) + ' · ' + esc(r.w.slice(0, 3)) + '<span class="rb' + (red ? ' rr' : '') + '">' + (red ? 'VERMELHA' : 'PRETA') + '</span></b><span class="acts"><button type="button" class="sm del" data-hd="' + esc(r.d) + '">Excluir</button></span><span class="dest">' + [glc(r) ? '<b>' + esc(glc(r)) + ':</b> ' + (r.c ? who('c', r.c) : 'Vago') : '', glp(r) ? '<b>' + esc(glp(r)) + ':</b> ' + (r.p.length ? r.p.map(function (n) { return who('p', n) }).join(', ') : '—') : ''].filter(Boolean).join(' · ') + '</span></li>';
    }).join('') : '<li class="emp">' + (LG.length ? 'Nada encontrado.' : 'Nenhum dia lançado ainda.') + '</li>';
    $('hs-uc').textContent = UL.length;
    $('hs-u').disabled = !UL.length;
    $('hs-ul').innerHTML = UL.length ? UL.slice().reverse().map(function (e, i) { return '<li class="mi"><b>' + esc(e.t || 'Passo anterior') + '</b>' + (i === 0 ? '<span class="rb">PRÓXIMO A DESFAZER</span>' : '') + '</li>' }).join('') : '<li class="emp">Nada para desfazer.</li>';
}
$('hs-q').addEventListener('input', renderHist);
$('hs-t').addEventListener('change', renderHist);
$('hs-l').addEventListener('click', function (e) {
    var b = e.target.closest('[data-hd]'); if (!b) return;
    var d = b.getAttribute('data-hd');
    askC('Excluir do histórico', 'Excluir o dia ' + d + ' do histórico? As folgas serão recalculadas como se ele não tivesse sido lançado. Dá para desfazer depois.', 'Excluir', function () { delLg(d) });
});
$('hs-u').onclick = function () {
    if (!UL.length) return;
    askC('Desfazer último passo', 'Desfazer: ' + (UL[UL.length - 1].t || 'último passo') + '?', 'Desfazer', undoLanc);
};
function cr(o) { return o.s || o.n }
function trOf(x) {
    var l = [];
    if (x.c && x.c.s) l.push('c:' + x.c.n + '>' + x.c.s);
    x.p.forEach(function (o) { if (o.s) l.push('p:' + o.n + '>' + o.s) });
    return l.sort().join('|');
}
function trRec(x) {
    var l = [];
    if (x.c && x.c.s) l.push({ k: 'c', by: x.c.n, for: x.c.s });
    x.p.forEach(function (o) { if (o.s) l.push({ k: 'p', by: o.n, for: o.s }) });
    return l;
}
function renderLast() {
    if (typeof $ !== 'function' || !$('lastbox')) return;
    var r = LG.length ? LG[LG.length - 1] : null;
    $('lastbox').hidden = !r; if (!r) return;
    $('lb-d').textContent = r.d + ' · ' + r.w + ' · ' + (isRed(r) ? 'Escala vermelha' : 'Escala preta');
    var tr = r.tr || [];
    function chip(k, nm) {
    var t = tr.filter(function (z) { return z.k === k && z.for === nm })[0], cl = k === 'c' ? 'cabo' : 'p';
    if (!t) return '<span class="' + cl + '">' + esc(nm) + '</span>';
    return '<span class="' + cl + ' has">' + esc(t.by) + '*</span><small style="color:var(--muted)">tirou o serviço de ' + esc(nm) + ' (a folga do dia é de ' + esc(nm) + ')</small>';
    }
    $('lb-b').innerHTML = (glc(r) ? '<div class="lg-r"><span class="lg-l">' + esc(glc(r)) + '</span>' + (r.c ? chip('c', r.c) : '<span class="vago">Vago</span>') + '</div>' : '') + (glp(r) ? '<div class="lg-r"><span class="lg-l">' + esc(glp(r)) + '</span><div class="pl">' + (r.p.length ? r.p.map(function (n) { return chip('p', n) }).join('') : '<span class="vago">Sem plantões</span>') + '</div></div>' : '');
}
var swC = null;
function openSw(di, k) {
    var day = S[di], o = k === 'c' ? day.c : day.p[+k]; if (!o) return;
    var t = isWk(day) ? 'r' : 'b', busy = {};
    if (day.c) busy[day.c.n] = 1; day.p.forEach(function (p) { busy[p.n] = 1 });
    var l = M.filter(function (m) { return !busy[m.n] && !blk(m, t) }).sort(function (a, b) { return cmpS(a, b, t) });
    swC = { di: di, k: k, old: o.n };
    $('sw-i').innerHTML = '<b>' + esc(o.n) + '</b> está escalado como ' + esc(gnm(k === 'c' ? cfg.c : cfg.p)) + ' em <b>' + esc(day.d) + '</b> (' + esc(day.w) + ').';
    $('sw-s').innerHTML = l.map(function (m) { return '<option value="' + esc(m.n) + '">' + esc(m.n) + ' · ' + gname(m.g) + ' · folga ' + (t === 'r' ? 'V ' : 'P ') + restT(m, t) + ' d</option>' }).join('');
    $('sw-ok').disabled = !l.length;
    $('ovs').hidden = false; $('sw-s').focus();
}
function closeSw() { $('ovs').hidden = true; swC = null }
function confirmSw() {
    if (!swC) return;
    var n = $('sw-s').value; if (!n) return;
    var day = S[swC.di], k = swC.k, old = swC.old, wasL = dayLaunched(day);
    var prev = k === 'c' ? day.c : day.p[+k]; if (!prev) { closeSw(); return }
    var cred = prev.s || prev.n;
    var nu = n === cred ? { n: n, a: '' } : { n: n, s: cred, a: 'Troca de serviço: ' + n + ' assumiu o serviço de ' + cred + ' · a folga do dia zera para ' + cred + ' e a de ' + n + ' segue normal' };
    if (k === 'c') day.c = nu; else day.p[+k] = nu;
    closeSw(); render();
    toastUndo(n + ' assumiu o serviço de ' + cred + ' em ' + day.d + (wasL ? ' · lance de novo para atualizar as folgas' : ''), function () { if (k === 'c') day.c = prev; else day.p[+k] = prev; render() });
}
$('sw-ok').onclick = confirmSw;
$('ovs').addEventListener('click', function (e) { if (e.target === $('ovs')) closeSw() });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSw() });
$('rows').addEventListener('click', function (e) { var b = e.target.closest('[data-sw]'); if (b) openSw(+b.getAttribute('data-i'), b.getAttribute('data-k')) });
function save() { updLaunch(); renderSug(); renderLast(); renderHist(); renderMini(); if (!ready) return; clearTimeout(tmr); tmr = setTimeout(flush, 400) }
function flush() {
    var j = JSON.stringify(snap());
    if (j === lastJ) return;
    try { localStorage.setItem(LSK, j); lastJ = j; setSt('Salvo automaticamente neste navegador', 'ok') }
    catch (e) { setSt('N\u00e3o foi poss\u00edvel salvar neste navegador. Use Exportar arquivo.', 'err') }
}
['e1', 'e2', 'p1', 'p2'].forEach(function (i) { $(i).addEventListener('change', save) });
window.addEventListener('pagehide', function () { if (ready) flush() });
$('ex').onclick = function () {
    var j = JSON.stringify(snap(), null, 2), a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([j], { type: 'application/json' }));
    a.download = 'escala-servico-banco.json';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove() }, 500);
    toast('Arquivo exportado');
};
$('im').onclick = function () { $('fi').click() };
$('fi').onchange = function () {
    var inp = this, f = inp.files && inp.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () {
    try {
        var prev = snap();
        if (!applyState(JSON.parse(r.result))) throw 0;
        toastUndo('Arquivo importado: ' + f.name, function () { applyState(prev) });
    } catch (e) { toast('Arquivo inv\u00e1lido: use um .json exportado por esta p\u00e1gina') }
    };
    r.readAsText(f); inp.value = '';
};
(function init() {
    var st = null;
    try { st = JSON.parse(localStorage.getItem(LSK) || 'null') } catch (e) { }
    if (st) applyState(st);
    lastJ = st ? JSON.stringify(snap()) : ''; renderCfg(); renderM();
    ready = true;
    flush();
    if (st && lastJ) setSt('Salvo automaticamente neste navegador', 'ok');
})();
