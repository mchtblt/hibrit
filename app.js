'use strict';

// ---------- Yardımcılar ----------
const KEY = 'hibrit.v1';
const DAY = 864e5;
const $ = (s, r = document) => r.querySelector(s);
const app = $('#app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
const num = v => {
  if (v === '' || v == null) return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return isFinite(n) ? n : null;
};
const fmt = n => n == null ? '' : String(Math.round(n * 100) / 100).replace('.', ',');
const dateStr = t => new Date(t).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' });
const mins = ms => Math.max(0, Math.round(ms / 60000));
const isoDate = t => new Date(t - new Date(t).getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const startOfWeek = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); };

const svg = p => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const I = {
  home: svg('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>'),
  prog: svg('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/>'),
  hist: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>'),
  set: svg('<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>'),
  check: svg('<path d="M5 12l5 5L20 7"/>'),
  play: svg('<path d="M8 5v14l11-7z"/>'),
  up: svg('<path d="M6 15l6-6 6 6"/>'),
  down: svg('<path d="M6 9l6 6 6-6"/>'),
  right: svg('<path d="M9 6l6 6-6 6"/>'),
  trash: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  x: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
};

// ---------- Varsayılan program (PDF'teki son hal) ----------
const STAGES = ['Hızlı konsantrik / yavaş eksantrik', 'Standart form', 'Kontrollü cheat + yavaş negatif', 'Cheat + negatif tükeniş', 'Trap curl', 'Partial reps'];
const cyc = a => a.map(([order, r1, r2]) => ({ order, r1, r2 }));
const C6 = [['ab', 12, 12], ['ab', 12, 10], ['ab', 12, 8], ['ba', 12, 12], ['ba', 12, 10], ['ba', 12, 8]];
const C8 = [['ab', 12, 12], ['ab', 10, 14], ['ab', 8, 16], ['ab', 6, 20], ['ba', 12, 12], ['ba', 10, 14], ['ba', 8, 16], ['ba', 6, 20]];

function defaultProgram() {
  return { days: [
    { id: 'd1', name: 'Göğüs / Biceps', blocks: [
      { id: 'd1b1', type: 'pair', a: 'Ağırlıklı Şınav', b: 'Chest Fly', bwA: true, bwB: false, cycles: cyc(C6), rest: 150, note: 'Her satırda 1. hareketin ardından 2. harekete geç. Azalan tekrarlar uygun olduğunda daha yüksek yükle yapılabilir.' },
      { id: 'd1b2', type: 'stages', name: 'Biceps Curl', rounds: 3, stages: [...STAGES], bw: false, rest: 150, shortRest: 20, note: 'Aşamalar arası 15–20 sn kısa dinlenme, döngüler arasında uzun dinlenme.' },
      { id: 'd1b3', type: 'failure', name: 'Overhead Cable Curl', sets: 3, bw: false, rest: 90, note: 'Tükenişe kadar.' },
    ] },
    { id: 'd2', name: 'Sırt / Arka Omuz', blocks: [
      { id: 'd2b1', type: 'pair', a: 'Rope Pullover', b: 'Ağırlıklı Barfiks', bwA: false, bwB: true, cycles: cyc(C6), rest: 150, note: 'Barfikste ek yük, gerektiğinde yalnızca vücut ağırlığı. Tekrarı zorla tamamlamak için kontrolü bozma.' },
      { id: 'd2b2', type: 'straight', name: 'Cable Row', sets: 4, reps: '12', bw: false, rest: 90, note: '' },
      { id: 'd2b3', type: 'straight', name: 'Dumbbell Rear Delt Fly', sets: 4, reps: '12', bw: false, rest: 75, note: '' },
    ] },
    { id: 'd3', name: 'Bacak', blocks: [
      { id: 'd3b1', type: 'dynamic', name: 'Dumbbell Squat', rounds: 3, bw: false, rest: 150, shortRest: 20, note: 'İlk temiz sette çıkan tekrar N ise 15–20 sn aralarla yaklaşık N/2 + N/2. Teknik bozuluyorsa zorlama. Bel ağrısını artıran tekrarlarla devam etme.' },
      { id: 'd3b2', type: 'straight', name: 'Dumbbell Bulgarian Split Squat', sets: 2, reps: '8-15', bw: false, optional: true, rest: 90, note: 'Her bacak için. Squat sonrası güç ve kontrol yeterliyse yap, yoksa Calf Raise\'e geç.' },
      { id: 'd3b3', type: 'straight', name: 'Calf Raise', sets: 3, reps: '10-20', bw: false, rest: 60, note: '' },
    ] },
    { id: 'd4', name: 'Omuz / Triceps', blocks: [
      { id: 'd4b1', type: 'pair', a: 'Shoulder Press', b: 'Lateral Raise', bwA: false, bwB: false, cycles: cyc(C8), rest: 150, note: '' },
      { id: 'd4b2', type: 'failure', name: 'Ağırlıklı Dips', sets: 4, bw: true, rest: 120, note: 'Teknik tükenişte bitir, kontrolsüz tekrar yapma.' },
      { id: 'd4b3', type: 'cluster', name: 'One Arm Cable Pushdown', perSide: true, rounds: [[10, 5, 5], [10, 4, 3, 3], [10, 3, 3, 2, 2]], bw: false, rest: 120, shortRest: 15, note: 'Kümeler arası yaklaşık 15 sn, turlar arası uzun dinlenme.' },
    ] },
  ] };
}

const TYPES = { straight: 'Düz set', pair: 'İkili döngü', cluster: 'Cluster', stages: 'Aşamalı', dynamic: 'Dinamik cluster', failure: 'Tükenişe' };
const TYPE_DESC = {
  straight: 'Klasik set × tekrar. Tekrar aralık olabilir (8-15).',
  pair: 'İki hareket art arda. Her döngüde sıra (A→B veya B→A) ve iki tekrar hedefi ayrı.',
  cluster: 'Her turda kısa aralarla tekrar kümeleri (10+5+5). İstersen sol ve sağ ayrı kaydedilir.',
  stages: 'Her turda aynı ağırlıkla art arda aşamalar; her aşamanın tekrarı ayrı yazılır.',
  dynamic: 'İlk sette çıkan tekrar N, ardından yaklaşık N/2 + N/2 kümeleri.',
  failure: 'Belirli sayıda set, her biri tükenişe kadar.',
};
const DEF = {
  straight: () => ({ sets: 3, reps: '12', bw: false }),
  failure: () => ({ sets: 3, bw: false }),
  pair: () => ({ a: '', b: '', bwA: false, bwB: false, cycles: cyc(C6) }),
  stages: () => ({ rounds: 3, stages: [...STAGES], bw: false }),
  dynamic: () => ({ rounds: 3, bw: false }),
  cluster: () => ({ perSide: true, rounds: [[10, 5, 5]], bw: false }),
};

// ---------- Durum ----------
function load() {
  try { const j = JSON.parse(localStorage.getItem(KEY)); if (j && j.program && Array.isArray(j.program.days)) return j; } catch (e) {}
  return null;
}
let S = load() || { program: defaultProgram(), sessions: [], bw: [], active: null };
let saveTimer;
function save(now) {
  clearTimeout(saveTimer);
  const f = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Kaydedilemedi: depolama kullanılamıyor'); } };
  now ? f() : (saveTimer = setTimeout(f, 250));
}
document.addEventListener('visibilitychange', () => { if (document.hidden) save(true); });
window.addEventListener('pagehide', () => save(true));
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

const days = () => S.program.days;
const dayById = id => days().find(d => d.id === id);
const blockById = id => { for (const d of days()) { const b = d.blocks.find(x => x.id === id); if (b) return b; } return null; };
const title = b => b.type === 'pair' ? `${b.a || 'A'} + ${b.b || 'B'}` : (b.name || 'Adsız hareket');
const curBw = () => S.bw.length ? S.bw[S.bw.length - 1].kg : null;
const needsBw = () => days().some(d => d.blocks.some(b => b.bw || b.bwA || b.bwB));
const lastSession = dayId => S.sessions.filter(s => s.dayId === dayId).sort((a, b) => b.start - a.start)[0];

function summary(b) {
  switch (b.type) {
    case 'straight': return `${b.sets} × ${b.reps}`;
    case 'failure': return `${b.sets} set · tükenişe`;
    case 'pair': return `${(b.cycles || []).length} döngü`;
    case 'stages': return `${b.rounds} tur · ${(b.stages || []).length} aşama`;
    case 'dynamic': return `${b.rounds} tur · N + N/2 + N/2`;
    case 'cluster': return `${(b.rounds || []).length} tur${b.perSide ? ' · tek kol' : ''}`;
  }
  return '';
}

// Bir bloğun antrenman ekranındaki satırları. Her hücre bir hareketin kg + tekrar girişi.
function rowsOf(b) {
  const R = n => Array.from({ length: Math.max(0, n | 0) }, (_, i) => i);
  const cell = (key, name, target, bw, extra) => ({ key, name, target, bw: !!bw, ...extra });
  switch (b.type) {
    case 'straight': return R(b.sets).map(i => ({ label: 'Set ' + (i + 1), cells: [cell('x', '', b.reps, b.bw)] }));
    case 'failure': return R(b.sets).map(i => ({ label: 'Set ' + (i + 1), cells: [cell('x', '', 'T', b.bw)] }));
    case 'pair': return (b.cycles || []).map((c, i) => {
      const A = ['a', b.a, b.bwA], B = ['b', b.b, b.bwB];
      const [f, s] = c.order === 'ba' ? [B, A] : [A, B];
      return { label: 'Döngü ' + (i + 1), sub: c.order === 'ba' ? 'ters sıra' : '', cells: [cell(f[0], f[1], c.r1, f[2]), cell(s[0], s[1], c.r2, s[2])] };
    });
    case 'stages': return R(b.rounds).map(i => ({ label: 'Tur ' + (i + 1), cells: [cell('x', '', (b.stages || []).map(() => ''), b.bw, { labels: (b.stages || []).map((_, j) => 'A' + (j + 1)) })] }));
    case 'dynamic': return R(b.rounds).map(i => ({ label: 'Tur ' + (i + 1), cells: [cell('x', '', ['N', 'N/2', 'N/2'], b.bw, { labels: ['İlk set', 'Küme', 'Küme'], dyn: true })] }));
    case 'cluster': return (b.rounds || []).map((r, i) => ({ label: 'Tur ' + (i + 1), cells: b.perSide ? [cell('L', 'Sol kol', r, b.bw), cell('R', 'Sağ kol', r, b.bw)] : [cell('x', '', r, b.bw)] }));
  }
  return [];
}

function tgtText(t) {
  if (Array.isArray(t)) return t.every(x => x === '') ? '' : t.join(' + ');
  if (t === 'T') return 'tükeniş';
  if (t === '' || t == null) return '';
  return '× ' + t;
}

// ---------- Geçen hafta karşılaştırması ----------
function prevCell(bid, ri, key, s) {
  let best = null;
  for (const p of S.sessions) {
    if (p.id === s.id || p.start >= s.start) continue;
    const r = p.data[bid] && p.data[bid].rows && p.data[bid].rows[ri];
    if (!r || !r.done || !r.cells[key]) continue;
    if (!best || p.start > best.p.start) best = { p, cell: r.cells[key] };
  }
  return best && { cell: best.cell, bw: best.p.bw };
}
const repSum = r => {
  if (Array.isArray(r)) { let t = 0, any = false; r.forEach(x => { const n = num(x); if (n != null) { t += n; any = true; } }); return any ? t : null; }
  return num(r);
};
const repStr = r => Array.isArray(r) ? r.map(x => x === '' ? '–' : x).join('+') : (r === '' ? '–' : r);

// Önce efektif yük (ek yük + gerekiyorsa vücut ağırlığı), eşitse toplam tekrar karşılaştırılır.
function cmp(cur, s, prev, isBw) {
  const cr = repSum(cur.reps);
  if (cr == null) return null;
  const ek = (num(cur.kg) || 0) + (isBw ? (s.bw || 0) : 0);
  const pk = (num(prev.cell.kg) || 0) + (isBw ? (prev.bw || 0) : 0);
  if (Math.abs(ek - pk) > 0.01) return ek > pk ? 1 : -1;
  const pr = repSum(prev.cell.reps);
  return pr == null ? 0 : Math.sign(cr - pr);
}
function prevHTML(c, cell, s, prev) {
  if (!prev) return 'ilk kayıt';
  const k = num(prev.cell.kg);
  const d = cmp(cell, s, prev, c.bw);
  const ar = d == null ? '' : d > 0 ? ' <b class="up">▲</b>' : d < 0 ? ' <b class="down">▼</b>' : ' <b class="eq">=</b>';
  return `geçen ${k != null ? (c.bw ? '+' : '') + fmt(k) + ' kg × ' : ''}${esc(repStr(prev.cell.reps))}${ar}`;
}

// ---------- Oturum ----------
function initCell(c, prev) {
  const rep = t => /^\d+$/.test(String(t)) ? String(t) : '';
  return { kg: prev ? prev.cell.kg : '', reps: Array.isArray(c.target) ? c.target.map(rep) : rep(c.target) };
}
function getRow(s, b, ri, rd) {
  const bd = s.data[b.id] || (s.data[b.id] = { rows: [] });
  const row = bd.rows[ri] || (bd.rows[ri] = { done: false, cells: {} });
  for (const c of rd.cells) {
    let cl = row.cells[c.key];
    if (!cl) cl = row.cells[c.key] = initCell(c, prevCell(b.id, ri, c.key, s));
    if (Array.isArray(c.target)) {
      if (!Array.isArray(cl.reps)) cl.reps = c.target.map(() => '');
      else if (cl.reps.length !== c.target.length) cl.reps = c.target.map((_, i) => cl.reps[i] ?? '');
    } else if (Array.isArray(cl.reps)) cl.reps = '';
  }
  return row;
}
const curSession = () => V.sid === 'active' ? S.active : S.sessions.find(x => x.id === V.sid);

function startSession(dayId) {
  S.active = { id: uid(), dayId, start: Date.now(), end: null, bw: curBw(), data: {} };
  save();
  go({ name: 'workout', sid: 'active' });
}
function sessionStats(s) {
  let up = 0, down = 0, done = 0, total = 0;
  const d = dayById(s.dayId);
  if (!d) return { up, down, done, total };
  for (const b of d.blocks) rowsOf(b).forEach((rd, ri) => {
    total++;
    const row = s.data[b.id] && s.data[b.id].rows[ri];
    if (!row || !row.done) return;
    done++;
    rd.cells.forEach(c => {
      const prev = prevCell(b.id, ri, c.key, s), cl = row.cells[c.key];
      if (!prev || !cl) return;
      const r = cmp(cl, s, prev, c.bw);
      if (r > 0) up++; else if (r < 0) down++;
    });
  });
  return { up, down, done, total };
}
function finishSession() {
  const s = S.active;
  const st = sessionStats(s);
  if (st.done < st.total && !confirm(`${st.total - st.done} satır işaretlenmedi. Yine de bitirilsin mi? İşaretlenmeyen satırlar gelecek karşılaştırmalarda kullanılmaz.`)) return false;
  s.end = Date.now();
  S.sessions.push(s);
  S.active = null;
  stopTimer();
  save(true);
  toast(`Kaydedildi · ${mins(s.end - s.start)} dk · ▲ ${st.up}  ▼ ${st.down}`);
  return true;
}

// ---------- Görünümler ----------
let V = S.active ? { name: 'workout', sid: 'active' } : { name: 'home' };

function weekNo() {
  const all = S.sessions.map(s => s.start).concat(S.active ? [S.active.start] : []);
  if (!all.length) return 1;
  return Math.floor((startOfWeek(Date.now()) - startOfWeek(Math.min(...all))) / (7 * DAY)) + 1;
}
function nextDayId() {
  const last = [...S.sessions].sort((a, b) => b.start - a.start)[0];
  const ds = days();
  if (!ds.length) return null;
  if (!last) return ds[0].id;
  const i = ds.findIndex(d => d.id === last.dayId);
  return ds[(i + 1) % ds.length].id;
}

function vHome() {
  const ds = days(), ws = startOfWeek(Date.now());
  const doneWeek = new Set(S.sessions.filter(s => s.start >= ws).map(s => s.dayId));
  const next = nextDayId();
  let h = `<p class="mut" style="margin-top:14px">Hafta ${weekNo()} · ${new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
    <h1>Antrenman</h1><p class="mut">Bu hafta ${ds.filter(d => doneWeek.has(d.id)).length}/${ds.length} gün</p>`;
  if (needsBw() && curBw() == null) h += `<button class="card warn" data-act="tab" data-tab="settings">Ağırlıklı şınav, barfiks ve dips karşılaştırması için vücut ağırlığını gir ›</button>`;
  if (S.active) {
    const d = dayById(S.active.dayId);
    h += `<button class="card hi" data-act="resume"><div class="dh"><div><div class="mut">Devam eden antrenman</div><h2>${esc(d ? d.name : '')}</h2><div class="mut">${mins(Date.now() - S.active.start)} dk önce başladı</div></div><span class="go">${I.play}</span></div></button>`;
  }
  if (!ds.length) h += `<div class="empty">Programında gün yok.<br><br><button class="btn primary" data-act="tab" data-tab="program">Program oluştur</button></div>`;
  ds.forEach((d, i) => {
    const last = lastSession(d.id), isNext = !S.active && d.id === next;
    h += `<button class="card${isNext ? ' hi' : ''}" data-act="start" data-day="${d.id}"><div class="dh"><div>
      <div class="mut">Gün ${i + 1}${isNext ? ' · <span class="acc">Sıradaki</span>' : ''}${doneWeek.has(d.id) ? ' · <span class="acc">✓ bu hafta</span>' : ''}</div>
      <h2>${esc(d.name)}</h2>
      <div class="mut">${d.blocks.map(b => esc(title(b))).join(' · ') || 'Hareket yok'}</div>
      <div class="mut">${last ? 'Son: ' + dateStr(last.start) : 'Henüz yapılmadı'}</div>
      </div><span class="go">${I.play}</span></div></button>`;
  });
  return h;
}

function vWorkout() {
  const s = curSession();
  if (!s) { V = { name: 'home' }; return vHome(); }
  const live = s === S.active, d = dayById(s.dayId);
  let h = `<div class="bar"><button class="ghost" data-act="back">‹ ${live ? 'Ana ekran' : 'Geçmiş'}</button>${live ? '<span class="clock" id="clock"></span>' : ''}</div>
    <h1>${esc(d ? d.name : 'Silinmiş gün')}</h1>
    <p class="mut">${dateStr(s.start)}${!live && s.end ? ' · ' + mins(s.end - s.start) + ' dk' : ''}${s.bw ? ' · vücut ağırlığı ' + fmt(s.bw) + ' kg' : ''}</p>`;
  if (d) d.blocks.forEach(b => { h += blockHTML(s, b); });
  if (d && !d.blocks.length) h += `<div class="empty">Bu günde hareket yok. Program sekmesinden ekleyebilirsin.</div>`;
  h += live
    ? `<button class="btn primary wide" data-act="finish">${I.check} Antrenmanı bitir</button><button class="btn danger wide" data-act="cancel">Antrenmanı iptal et</button>`
    : `<button class="btn danger wide" data-act="delsession">${I.trash} Bu kaydı sil</button>`;
  return h;
}

function blockHTML(s, b) {
  const rows = rowsOf(b);
  let done = 0;
  const rh = rows.map((rd, ri) => { const row = getRow(s, b, ri, rd); if (row.done) done++; return rowHTML(s, b, rd, ri, row); }).join('');
  const stageList = b.type === 'stages' ? '<ol>' + (b.stages || []).map((x, i) => `<li>A${i + 1}: ${esc(x)}</li>`).join('') + '</ol>' : '';
  const note = b.note || stageList ? `<details class="note"${b.type === 'stages' ? ' open' : ''}><summary>Notlar${b.type === 'stages' ? ' ve aşamalar' : ''}</summary>${esc(b.note)}${stageList}</details>` : '';
  return `<section class="block"><div class="bh"><h2>${esc(title(b))}${b.optional ? ' <span class="tag o">opsiyonel</span>' : ''}</h2>
    <div class="mut">${TYPES[b.type]} · ${summary(b)} · <span class="acc">${done}/${rows.length}</span></div></div>${note}${rh}</section>`;
}

function rowHTML(s, b, rd, ri, row) {
  const arr = rd.cells.some(c => Array.isArray(c.target));
  const short = b.shortRest && s === S.active ? `<button class="mini" data-act="short">⏱ ${b.shortRest} sn</button>` : '';
  return `<div class="row${row.done ? ' done' : ''}" data-b="${b.id}" data-r="${ri}">
    <div class="rh"><span class="rl">${rd.label}</span>${rd.sub ? `<span class="sub">${rd.sub}</span>` : ''}<span class="sp"></span>${short}<button class="chk" data-act="done" aria-label="Satırı tamamla">${I.check}</button></div>
    <div class="cells ${arr ? 'stack' : 'n' + rd.cells.length}">${rd.cells.map(c => cellHTML(s, b, ri, c, row.cells[c.key])).join('')}</div></div>`;
}

const dynPh = cl => { const n = num(cl.reps[0]); return n ? String(Math.round(n / 2)) : 'N/2'; };

function cellHTML(s, b, ri, c, cl) {
  const prev = prevCell(b.id, ri, c.key, s);
  const kgPh = prev && prev.cell.kg !== '' ? prev.cell.kg : '0';
  const kgIn = `<label class="f"><input class="kg" inputmode="decimal" value="${esc(cl.kg)}" placeholder="${esc(kgPh)}" aria-label="Ağırlık"><span>kg</span></label>`;
  let reps;
  if (Array.isArray(c.target)) {
    const pr = prev && Array.isArray(prev.cell.reps) ? prev.cell.reps : [];
    reps = `<div class="reps">${c.target.map((t, i) => {
      const ph = c.dyn && i > 0 ? dynPh(cl) : (pr[i] || (typeof t === 'number' ? t : (t || '')));
      return `${i ? '<i>+</i>' : ''}<label class="r">${c.labels ? `<small>${esc(c.labels[i])}</small>` : ''}<input class="rp" data-i="${i}" inputmode="numeric" value="${esc(cl.reps[i] ?? '')}" placeholder="${esc(ph)}" aria-label="Tekrar ${i + 1}"></label>`;
    }).join('')}</div>`;
  } else {
    const ph = (prev && prev.cell.reps) || (c.target === 'T' ? 'max' : c.target || '');
    reps = `<label class="f"><input class="rp" inputmode="numeric" value="${esc(cl.reps)}" placeholder="${esc(ph)}" aria-label="Tekrar"><span>tk</span></label>`;
  }
  const head = `<div class="cn"><span class="nm">${esc(c.name)}</span>${c.bw ? '<span class="tag">VA</span>' : ''}<span class="tg">${esc(tgtText(c.target))}</span></div>`;
  return `<div class="cell" data-k="${c.key}">${head}${Array.isArray(c.target) ? kgIn + reps : `<div class="ins">${kgIn}${reps}</div>`}<div class="pv">${prevHTML(c, cl, s, prev)}</div></div>`;
}

function vHistory() {
  const list = [...S.sessions].sort((a, b) => b.start - a.start);
  let h = `<h1 style="margin-top:14px">Geçmiş</h1><p class="mut">${list.length} antrenman</p>`;
  if (!list.length) return h + `<div class="empty">Bitirdiğin antrenmanlar burada listelenir.</div>`;
  let wk = null;
  for (const s of list) {
    const w = startOfWeek(s.start);
    if (w !== wk) { wk = w; h += `<h3>${new Date(w).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} haftası</h3>`; }
    const d = dayById(s.dayId), st = sessionStats(s);
    h += `<button class="li" data-act="open" data-sid="${s.id}" style="width:100%"><div class="main"><div class="t">${esc(d ? d.name : 'Silinmiş gün')}</div>
      <div class="mut">${dateStr(s.start)} · ${s.end ? mins(s.end - s.start) + ' dk · ' : ''}${st.done}/${st.total} satır · <span class="up">▲ ${st.up}</span> <span class="down">▼ ${st.down}</span></div></div><span class="ib">${I.right}</span></button>`;
  }
  return h;
}

function vProgram() {
  let h = `<h1 style="margin-top:14px">Program</h1><p class="mut">Günlere dokunarak hareketleri düzenle</p>`;
  days().forEach((d, i) => {
    h += `<div class="li"><button class="main" data-act="openDay" data-day="${d.id}"><div class="t">Gün ${i + 1} · ${esc(d.name)}</div><div class="mut">${d.blocks.map(b => esc(title(b))).join(' · ') || 'Hareket yok'}</div></button>
      <button class="ib" data-act="dayMove" data-day="${d.id}" data-dir="-1" aria-label="Yukarı taşı">${I.up}</button><button class="ib" data-act="dayMove" data-day="${d.id}" data-dir="1" aria-label="Aşağı taşı">${I.down}</button></div>`;
  });
  h += `<button class="add" data-act="addDay">${I.plus} Gün ekle</button>`;
  return h;
}

function vDay() {
  const d = dayById(V.day);
  if (!d) { V = { name: 'program' }; return vProgram(); }
  let h = `<div class="bar"><button class="ghost" data-act="tab" data-tab="program">‹ Program</button></div>
    <label class="fld"><span>Gün adı</span><input data-pf="dayName" value="${esc(d.name)}"></label><h3>Hareketler</h3>`;
  d.blocks.forEach(b => {
    h += `<div class="li"><button class="main" data-act="openBlock" data-block="${b.id}"><div class="t">${esc(title(b))}</div><div class="mut">${TYPES[b.type]} · ${summary(b)}</div></button>
      <button class="ib" data-act="blkMove" data-block="${b.id}" data-dir="-1" aria-label="Yukarı taşı">${I.up}</button><button class="ib" data-act="blkMove" data-block="${b.id}" data-dir="1" aria-label="Aşağı taşı">${I.down}</button></div>`;
  });
  h += `<button class="add" data-act="addBlock">${I.plus} Hareket ekle</button>
    <button class="btn danger wide" data-act="delDay">${I.trash} Günü sil</button>`;
  return h;
}

const fText = (label, pf, val, ph = '') => `<label class="fld"><span>${label}</span><input data-pf="${pf}" value="${esc(val ?? '')}" placeholder="${esc(ph)}"></label>`;
const fNum = (label, pf, val, unit = '') => `<label class="fld inl"><span>${label}</span><input data-pf="${pf}" data-num inputmode="numeric" value="${esc(val ?? '')}"><em>${unit}</em></label>`;
const fChk = (label, pf, val) => `<label class="chkf"><input type="checkbox" data-pf="${pf}"${val ? ' checked' : ''}><span>${label}</span></label>`;

function vBlock() {
  const d = dayById(V.day), b = d && d.blocks.find(x => x.id === V.block);
  if (!b) { V = { name: 'day', day: V.day }; return vDay(); }
  let h = `<div class="bar"><button class="ghost" data-act="openDay" data-day="${d.id}">‹ ${esc(d.name)}</button></div>
    <h1>${esc(title(b))}</h1><h3>Blok tipi</h3>
    <div class="pills">${Object.entries(TYPES).map(([k, v]) => `<button class="pill${b.type === k ? ' on' : ''}" data-act="setType" data-type="${k}">${v}</button>`).join('')}</div>
    <p class="desc">${TYPE_DESC[b.type]}</p><div class="panel">`;
  const bwLbl = 'Vücut ağırlığı hareketi (ek yük girilir)';
  switch (b.type) {
    case 'straight':
      h += fText('Hareket adı', 'name', b.name, 'Cable Row') + fNum('Set sayısı', 'sets', b.sets) + `<label class="fld inl"><span>Tekrar hedefi</span><input data-pf="reps" value="${esc(b.reps)}" placeholder="12 veya 8-15"><em></em></label>` + fChk(bwLbl, 'bw', b.bw);
      break;
    case 'failure':
      h += fText('Hareket adı', 'name', b.name, 'Ağırlıklı Dips') + fNum('Set sayısı', 'sets', b.sets) + fChk(bwLbl, 'bw', b.bw);
      break;
    case 'pair':
      h += fText('A hareketi', 'a', b.a, 'Shoulder Press') + fChk('A vücut ağırlığı hareketi', 'bwA', b.bwA)
        + fText('B hareketi', 'b', b.b, 'Lateral Raise') + fChk('B vücut ağırlığı hareketi', 'bwB', b.bwB)
        + `</div><h3>Döngüler</h3><div class="panel" style="padding:8px 10px"><div class="cyc hd"><span>#</span><span>Sıra</span><span>1. tekrar</span><span>2. tekrar</span><span></span></div>`
        + (b.cycles || []).map((c, i) => `<div class="cyc"><b>${i + 1}</b><button class="flip${c.order === 'ba' ? ' ba' : ''}" data-act="flipCycle" data-i="${i}">${c.order === 'ba' ? 'B → A' : 'A → B'}</button>
          <input data-pf="cyc" data-i="${i}" data-k="r1" inputmode="numeric" value="${esc(c.r1)}" aria-label="1. tekrar"><input data-pf="cyc" data-i="${i}" data-k="r2" inputmode="numeric" value="${esc(c.r2)}" aria-label="2. tekrar">
          <button class="ib" data-act="delCycle" data-i="${i}" aria-label="Döngüyü sil">${I.x}</button></div>`).join('')
        + `<button class="add" data-act="addCycle">${I.plus} Döngü ekle</button>`;
      break;
    case 'stages':
      h += fText('Hareket adı', 'name', b.name, 'Biceps Curl') + fNum('Tur sayısı', 'rounds', b.rounds) + fChk(bwLbl, 'bw', b.bw)
        + `<label class="fld"><span>Aşamalar (her satıra bir aşama)</span><textarea data-pf="stages" rows="6">${esc((b.stages || []).join('\n'))}</textarea></label>`;
      break;
    case 'dynamic':
      h += fText('Hareket adı', 'name', b.name, 'Dumbbell Squat') + fNum('Tur sayısı', 'rounds', b.rounds) + fChk(bwLbl, 'bw', b.bw);
      break;
    case 'cluster':
      h += fText('Hareket adı', 'name', b.name, 'One Arm Cable Pushdown') + fChk('Sol ve sağ ayrı kaydet (tek kol / tek bacak)', 'perSide', b.perSide) + fChk(bwLbl, 'bw', b.bw)
        + `</div><h3>Turlar</h3><div class="panel" style="padding:8px 10px">`
        + (b.rounds || []).map((r, i) => `<div class="rnd"><span class="mut">Tur ${i + 1}</span><input data-pf="rnd" data-i="${i}" value="${esc(r.join(' + '))}" placeholder="10 + 5 + 5"><button class="ib" data-act="delRound" data-i="${i}" aria-label="Turu sil">${I.x}</button></div>`).join('')
        + `<button class="add" data-act="addRound">${I.plus} Tur ekle</button>`;
      break;
  }
  h += `</div><h3>Dinlenme ve notlar</h3><div class="panel">`
    + fNum('Satır sonrası dinlenme', 'rest', b.rest, 'sn')
    + fNum('Kısa ara butonu (0 = yok)', 'shortRest', b.shortRest || 0, 'sn')
    + fChk('Opsiyonel hareket', 'optional', b.optional)
    + `<label class="fld"><span>Not</span><textarea data-pf="note" rows="3">${esc(b.note)}</textarea></label></div>
    <button class="btn danger wide" data-act="delBlock">${I.trash} Hareketi sil</button>`;
  return h;
}

function vSettings() {
  const bw = curBw();
  let h = `<h1 style="margin-top:14px">Ayarlar</h1>
    <h3>Vücut ağırlığı</h3><div class="panel" style="padding:12px 14px">
    <p class="desc">Ağırlıklı şınav, barfiks ve dips'te karşılaştırma ek yük + vücut ağırlığı üzerinden yapılır. Haftada bir güncellemen yeterli.</p>
    <div class="ins"><label class="f"><input id="bwIn" inputmode="decimal" placeholder="${bw != null ? esc(fmt(bw)) : '80'}"><span>kg</span></label><button class="btn primary sm" data-act="saveBw" style="flex:none">Kaydet</button></div>
    ${S.bw.slice(-6).reverse().map(e => `<div class="mut" style="margin-top:8px">${dateStr(e.t)} · ${fmt(e.kg)} kg</div>`).join('')}</div>
    <h3>Yedek</h3><div class="panel" style="padding:12px 14px">
    <p class="desc">Veriler sadece bu telefonda saklanır. Ayda bir yedek alıp Dosyalar veya iCloud'a kaydetmeni öneririm.</p>
    <button class="btn wide" data-act="export" style="margin-top:4px">Yedeği dışa aktar</button>
    <button class="btn wide" data-act="import">Yedekten geri yükle</button></div>
    <h3>Program</h3><div class="panel" style="padding:12px 14px">
    <p class="desc">Programı PDF'teki son hale döndürür. Geçmiş kayıtlar silinmez.</p>
    <button class="btn danger wide" data-act="resetProgram">Varsayılan programa dön</button></div>
    <p class="mut" style="text-align:center;margin-top:20px">Hibrit Antrenman · v1.0</p>`;
  return h;
}

const VIEWS = { home: vHome, workout: vWorkout, history: vHistory, program: vProgram, day: vDay, block: vBlock, settings: vSettings };
const TAB_OF = v => v.name === 'workout' ? (v.sid === 'active' ? 'home' : 'history') : ({ day: 'program', block: 'program' }[v.name] || v.name);

function render(keepScroll) {
  const y = window.scrollY;
  app.innerHTML = VIEWS[V.name]();
  const t = TAB_OF(V);
  $('#tabs').innerHTML = [['home', 'Bugün', I.home], ['program', 'Program', I.prog], ['history', 'Geçmiş', I.hist], ['settings', 'Ayarlar', I.set]]
    .map(([k, l, ic]) => `<button class="${t === k ? 'on' : ''}" data-act="tab" data-tab="${k}">${ic}<span>${l}</span></button>`).join('');
  window.scrollTo(0, keepScroll ? y : 0);
  tickClock();
}
function go(v) { V = v; render(false); }

// ---------- Etkileşim ----------
function onAct(el) {
  const a = el.dataset.act, ds = el.dataset;
  const rowEl = el.closest('.row');
  switch (a) {
    case 'tab': go({ name: ds.tab }); break;
    case 'resume': go({ name: 'workout', sid: 'active' }); break;
    case 'start':
      if (S.active) {
        if (S.active.dayId === ds.day) { go({ name: 'workout', sid: 'active' }); break; }
        if (!confirm('Devam eden bir antrenman var. Onu bitirip bu günü başlatayım mı?')) break;
        if (!finishSession()) break;
      }
      startSession(ds.day);
      break;
    case 'back': go({ name: V.sid === 'active' ? 'home' : 'history' }); break;
    case 'open': go({ name: 'workout', sid: ds.sid }); break;
    case 'done': {
      const s = curSession(), b = blockById(rowEl.dataset.b), ri = +rowEl.dataset.r;
      const row = s.data[b.id].rows[ri];
      row.done = !row.done;
      save();
      if (row.done && s === S.active) startTimer(b.rest, 'Dinlenme');
      render(true);
      break;
    }
    case 'short': { const b = blockById(rowEl.dataset.b); startTimer(b.shortRest, 'Kısa ara'); break; }
    case 'finish': if (finishSession()) go({ name: 'home' }); break;
    case 'cancel':
      if (confirm('Bu antrenman kaydedilmeden silinsin mi?')) { S.active = null; stopTimer(); save(true); go({ name: 'home' }); }
      break;
    case 'delsession':
      if (confirm('Bu antrenman kaydı kalıcı olarak silinsin mi?')) { S.sessions = S.sessions.filter(x => x.id !== V.sid); save(true); go({ name: 'history' }); }
      break;

    case 'openDay': go({ name: 'day', day: ds.day }); break;
    case 'addDay': { const d = { id: uid(), name: 'Yeni gün', blocks: [] }; days().push(d); save(); go({ name: 'day', day: d.id }); break; }
    case 'dayMove': move(days(), days().findIndex(d => d.id === ds.day), +ds.dir); break;
    case 'delDay':
      if (confirm('Bu gün programdan silinsin mi? Geçmiş kayıtlar kalır ama bu günün hareketleri artık görünmez.')) { S.program.days = days().filter(d => d.id !== V.day); save(); go({ name: 'program' }); }
      break;
    case 'openBlock': go({ name: 'block', day: V.day, block: ds.block }); break;
    case 'addBlock': {
      const b = { id: uid(), type: 'straight', name: '', rest: 90, note: '', ...DEF.straight() };
      dayById(V.day).blocks.push(b); save(); go({ name: 'block', day: V.day, block: b.id });
      break;
    }
    case 'blkMove': { const bl = dayById(V.day).blocks; move(bl, bl.findIndex(b => b.id === ds.block), +ds.dir); break; }
    case 'delBlock':
      if (confirm('Bu hareket silinsin mi?')) { const d = dayById(V.day); d.blocks = d.blocks.filter(b => b.id !== V.block); save(); go({ name: 'day', day: V.day }); }
      break;
    case 'setType': {
      const d = dayById(V.day), i = d.blocks.findIndex(b => b.id === V.block), b = d.blocks[i];
      if (b.type === ds.type) break;
      const nb = { id: b.id, type: ds.type, name: b.name || b.a || '', rest: b.rest, shortRest: b.shortRest, optional: b.optional, note: b.note, ...DEF[ds.type]() };
      if (ds.type === 'pair') nb.a = b.name || '';
      d.blocks[i] = nb; save(); render(true);
      break;
    }
    case 'flipCycle': { const c = curBlock().cycles[+ds.i]; c.order = c.order === 'ba' ? 'ab' : 'ba'; save(); render(true); break; }
    case 'addCycle': { const cs = curBlock().cycles; const l = cs[cs.length - 1]; cs.push(l ? { ...l } : { order: 'ab', r1: 12, r2: 12 }); save(); render(true); break; }
    case 'delCycle': curBlock().cycles.splice(+ds.i, 1); save(); render(true); break;
    case 'addRound': { const rs = curBlock().rounds; rs.push(rs.length ? [...rs[rs.length - 1]] : [10, 5, 5]); save(); render(true); break; }
    case 'delRound': curBlock().rounds.splice(+ds.i, 1); save(); render(true); break;
    case 'resetProgram':
      if (confirm('Program varsayılan hale dönsün mü? Yaptığın program değişiklikleri kaybolur, geçmiş kayıtlar kalır.')) { S.program = defaultProgram(); save(true); toast('Program sıfırlandı'); }
      break;

    case 'saveBw': {
      const n = num($('#bwIn').value);
      if (n == null || n < 20 || n > 300) { toast('Geçerli bir kilo gir'); break; }
      S.bw.push({ t: Date.now(), kg: n });
      if (S.active && S.active.bw == null) S.active.bw = n;
      save(true); toast('Vücut ağırlığı kaydedildi'); render(true);
      break;
    }
    case 'export': doExport(); break;
    case 'import': $('#importFile').click(); break;
  }
}
const curBlock = () => dayById(V.day).blocks.find(b => b.id === V.block);
function move(arr, i, dir) {
  const j = i + dir;
  if (i < 0 || j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  save(); render(true);
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (el) { e.preventDefault(); onAct(el); }
});

app.addEventListener('focusin', e => { if (e.target.classList.contains('kg')) e.target.dataset.old = e.target.value; });

app.addEventListener('input', e => {
  const t = e.target;
  const cellEl = t.closest('.cell');
  if (cellEl) return onSetInput(t, cellEl);
  if (t.dataset.pf) onProgramInput(t);
});

app.addEventListener('change', e => {
  const t = e.target;
  if (t.type === 'checkbox' && t.dataset.pf) onProgramInput(t);
  // Ağırlığı değiştirince aynı hareketin henüz yapılmamış sonraki satırlarına da taşı
  if (t.classList.contains('kg') && t.dataset.old !== t.value) {
    const rowEl = t.closest('.row'), key = t.closest('.cell').dataset.k;
    const s = curSession(), b = blockById(rowEl.dataset.b), rows = s.data[b.id].rows;
    for (let ri = +rowEl.dataset.r + 1; ri < rows.length; ri++) {
      const r = rows[ri], c = r && r.cells[key];
      if (!c || r.done || (c.kg !== t.dataset.old && c.kg !== '')) continue;
      c.kg = t.value.trim();
      const inp = app.querySelector(`.row[data-b="${b.id}"][data-r="${ri}"] .cell[data-k="${key}"] .kg`);
      if (inp) { inp.value = c.kg; refreshCell(s, b, ri, key); }
    }
    t.dataset.old = t.value;
    save();
  }
});

function onSetInput(t, cellEl) {
  const rowEl = t.closest('.row');
  const s = curSession(), b = blockById(rowEl.dataset.b), ri = +rowEl.dataset.r, key = cellEl.dataset.k;
  const cl = s.data[b.id].rows[ri].cells[key];
  const v = t.value.trim();
  if (t.classList.contains('kg')) cl.kg = v;
  else if (t.dataset.i != null) cl.reps[+t.dataset.i] = v;
  else cl.reps = v;
  save();
  refreshCell(s, b, ri, key);
}
function refreshCell(s, b, ri, key) {
  const c = rowsOf(b)[ri].cells.find(x => x.key === key);
  const cl = s.data[b.id].rows[ri].cells[key];
  const el = app.querySelector(`.row[data-b="${b.id}"][data-r="${ri}"] .cell[data-k="${key}"]`);
  if (!el) return;
  el.querySelector('.pv').innerHTML = prevHTML(c, cl, s, prevCell(b.id, ri, key, s));
  if (c.dyn) el.querySelectorAll('.rp').forEach((x, i) => { if (i > 0) x.placeholder = dynPh(cl); });
}

function onProgramInput(t) {
  const pf = t.dataset.pf;
  if (pf === 'dayName') { dayById(V.day).name = t.value; save(); return; }
  const b = curBlock();
  if (!b) return;
  if (t.type === 'checkbox') b[pf] = t.checked;
  else if (pf === 'cyc') { const n = parseInt(t.value, 10); b.cycles[+t.dataset.i][t.dataset.k] = isNaN(n) ? '' : n; }
  else if (pf === 'rnd') { const p = t.value.split(/[+\s,]+/).map(x => parseInt(x, 10)).filter(n => n > 0); if (p.length) b.rounds[+t.dataset.i] = p; }
  else if (pf === 'stages') b.stages = t.value.split('\n').map(x => x.trim()).filter(Boolean);
  else if ('num' in t.dataset) { const n = parseInt(t.value, 10); b[pf] = isNaN(n) ? 0 : Math.min(n, 99 * (pf === 'rest' || pf === 'shortRest' ? 10 : 1)); }
  else b[pf] = t.value;
  save();
}

// ---------- Dinlenme sayacı ----------
const T = { end: 0, dur: 0, iv: null, ctx: null };
function startTimer(sec, label) {
  if (!sec) return;
  T.dur = sec; T.end = Date.now() + sec * 1000;
  $('#tlabel').textContent = label;
  $('#timer').classList.remove('end');
  $('#timer').hidden = false;
  document.body.classList.add('timing');
  unlockAudio();
  clearInterval(T.iv); T.iv = setInterval(tick, 250); tick();
}
function stopTimer() {
  clearInterval(T.iv); T.iv = null;
  $('#timer').hidden = true; $('#timer').classList.remove('end');
  document.body.classList.remove('timing');
}
function tick() {
  const left = Math.ceil((T.end - Date.now()) / 1000);
  if (left <= 0) {
    clearInterval(T.iv); T.iv = null;
    $('#tval').textContent = '0:00'; $('#tfill').style.width = '100%';
    $('#tlabel').textContent = 'Süre doldu';
    $('#timer').classList.add('end');
    beep();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    setTimeout(() => { if (!T.iv) stopTimer(); }, 4000);
    return;
  }
  $('#tval').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  $('#tfill').style.width = `${Math.min(100, (1 - left / T.dur) * 100)}%`;
}
$('#timer').addEventListener('click', e => {
  const b = e.target.closest('[data-t]');
  if (!b) return;
  const d = +b.dataset.t;
  if (!d) return stopTimer();
  if (!T.iv) return;
  T.end = Math.max(Date.now() + 1000, T.end + d * 1000);
  T.dur = Math.max(T.dur + d, 1);
  tick();
});
function unlockAudio() {
  try { T.ctx = T.ctx || new (window.AudioContext || window.webkitAudioContext)(); if (T.ctx.state === 'suspended') T.ctx.resume(); } catch (e) {}
}
function beep() {
  const c = T.ctx;
  if (!c) return;
  [0, 0.25, 0.5].forEach(o => {
    const os = c.createOscillator(), g = c.createGain();
    os.frequency.value = 880; os.connect(g); g.connect(c.destination);
    g.gain.setValueAtTime(0.0001, c.currentTime + o);
    g.gain.exponentialRampToValueAtTime(0.4, c.currentTime + o + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + o + 0.18);
    os.start(c.currentTime + o); os.stop(c.currentTime + o + 0.2);
  });
}
function tickClock() {
  const el = $('#clock');
  if (el && S.active) { const m = Math.floor((Date.now() - S.active.start) / 1000); el.textContent = `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`; }
}
setInterval(tickClock, 1000);

// ---------- Yedek ----------
async function doExport() {
  save(true);
  const data = JSON.stringify({ app: 'hibrit', version: 1, exported: new Date().toISOString(), program: S.program, sessions: S.sessions, bw: S.bw }, null, 1);
  const name = `hibrit-yedek-${isoDate(Date.now())}.json`;
  const file = new File([data], name, { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: name }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
$('#importFile').addEventListener('change', async e => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  try {
    const j = JSON.parse(await f.text());
    if (!j.program || !Array.isArray(j.program.days) || !Array.isArray(j.sessions)) throw new Error('format');
    if (!confirm(`Yedekte ${j.sessions.length} antrenman var. Mevcut verilerin yerine geçsin mi?`)) return;
    S = { program: j.program, sessions: j.sessions, bw: Array.isArray(j.bw) ? j.bw : [], active: null };
    stopTimer(); save(true); toast('Yedek geri yüklendi'); go({ name: 'home' });
  } catch (err) { toast('Bu dosya geçerli bir Hibrit yedeği değil'); }
});

let toastT;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 3200);
}

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

render(false);
