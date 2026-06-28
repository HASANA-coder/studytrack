// ===== STATE =====
let state = {
  completed: {},      // { chapId: { date, revisions: [dates] } }
  streak: 0,
  lastStudied: null,
  studyDays: [],
  mockScores: [],
  formulasRevised: {},
  weekOffset: 0,
  activeMonthTab: 0,
  formulaFilter: '',
  chapterFilter: 'all',
  activePage: 'dashboard',
};

// ===== STORAGE =====
function loadState() {
  try {
    const s = localStorage.getItem('studyos_state');
    if (s) state = { ...state, ...JSON.parse(s) };
  } catch(e) {}
}
function saveState() {
  try { localStorage.setItem('studyos_state', JSON.stringify(state)); } catch(e) {}
}

// ===== UTILS =====
function today() { return new Date().toISOString().split('T')[0]; }
function daysBetween(d1, d2) {
  const a = new Date(d1), b = new Date(d2);
  return Math.round((b-a)/(1000*60*60*24));
}
function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate()+n);
  return d.toISOString().split('T')[0];
}
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
}
function getDayName(dateStr) {
  const d = new Date(dateStr);
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
}
function getWeekday(dateStr) { return new Date(dateStr).getDay(); }

function getSubjectColor(sub) {
  if (sub==='Physics') return 'phys';
  if (sub==='Chemistry') return 'chem';
  if (sub==='Maths') return 'math';
  return '';
}
function allChaps() {
  return [
    ...CHAPTERS.Physics.map(c=>({...c,subject:'Physics'})),
    ...CHAPTERS.Chemistry.map(c=>({...c,subject:'Chemistry'})),
    ...CHAPTERS.Maths.map(c=>({...c,subject:'Maths'})),
  ];
}

// ===== STREAK =====
function updateStreak() {
  const t = today();
  if (!state.lastStudied) return;
  const diff = daysBetween(state.lastStudied, t);
  if (diff===0) return;
  if (diff===1) { state.streak++; }
  else if (diff>1) { state.streak=0; }
  state.lastStudied = t;
}
function recordStudyToday() {
  const t = today();
  if (state.lastStudied !== t) {
    if (state.lastStudied && daysBetween(state.lastStudied,t)===1) {
      state.streak++;
    } else if (!state.lastStudied || daysBetween(state.lastStudied,t)>1) {
      state.streak = 1;
    }
    state.lastStudied = t;
    if (!state.studyDays.includes(t)) state.studyDays.push(t);
    saveState();
    updateStreakUI();
  }
}

// ===== CHAPTER COMPLETE =====
function markChapter(chapId) {
  const t = today();
  if (state.completed[chapId]) {
    // already done — do nothing, use reset button
    return;
  }
  state.completed[chapId] = { date: t, revisions: [] };
  recordStudyToday();
  saveState();
  renderAll();
  showToast(`✅ Chapter marked complete! Revision scheduled.`);
}

function resetChapter(chapId, e) {
  e.stopPropagation();
  if (!confirm('Reset this chapter? All revision data will be lost.')) return;
  delete state.completed[chapId];
  saveState();
  renderAll();
  showToast('↩ Chapter reset.');
}

// ===== REVISION ENGINE =====
function getNextRevision(chapId) {
  const entry = state.completed[chapId];
  if (!entry) return null;
  const revDone = entry.revisions.length;
  if (revDone >= REVISION_INTERVALS.length) return null; // all done
  const nextInterval = REVISION_INTERVALS[revDone];
  const lastDate = entry.revisions.length > 0 ? entry.revisions[entry.revisions.length-1] : entry.date;
  return addDays(lastDate, nextInterval);
}

function markRevisionDone(chapId) {
  if (!state.completed[chapId]) return;
  state.completed[chapId].revisions.push(today());
  recordStudyToday();
  saveState();
  renderAll();
  showToast(`🧠 Revision recorded!`);
}

function getRevisionStatus(chapId) {
  // returns: 'overdue', 'today', 'upcoming', 'done', null
  const next = getNextRevision(chapId);
  if (!next) return state.completed[chapId] ? 'done' : null;
  const diff = daysBetween(today(), next);
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  if (diff <= 7) return 'upcoming-week';
  return 'upcoming';
}

// ===== PROGRESS =====
function getProgress() {
  const all = allChaps();
  const total = all.length;
  const done = all.filter(c=>state.completed[c.id]).length;
  const pct = total ? Math.round(done/total*100) : 0;
  const bySubject = {};
  for (const sub of ['Physics','Chemistry','Maths']) {
    const sChaps = CHAPTERS[sub];
    const sDone = sChaps.filter(c=>state.completed[c.id]).length;
    bySubject[sub] = { done: sDone, total: sChaps.length, pct: sChaps.length ? Math.round(sDone/sChaps.length*100) : 0 };
  }
  return { total, done, pct, bySubject };
}

// ===== RENDER ALL =====
function renderAll() {
  renderDashboard();
  renderChapters();
  renderRevisionPage();
  renderAnalytics();
  updateProgressBars();
}

// ===== DASHBOARD =====
function renderDashboard() {
  const prog = getProgress();
  // Greeting
  const h = new Date().getHours();
  const greet = h<12?'morning':h<18?'afternoon':'evening';
  document.getElementById('timeGreeting').textContent = greet;
  document.getElementById('todayDate').textContent = new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

  // Stats
  document.getElementById('overallPct').textContent = prog.pct+'%';
  document.getElementById('overallBar').style.width = prog.pct+'%';
  document.getElementById('chapsDone').textContent = prog.done+' / '+prog.total;
  document.getElementById('streakCount').textContent = state.streak;
  document.getElementById('streakCountSidebar').textContent = state.streak;

  // Revisions due today
  const dueToday = allChaps().filter(c=>{
    const st = getRevisionStatus(c.id);
    return st==='today'||st==='overdue';
  });
  document.getElementById('revisionsTodayCount').textContent = dueToday.length;

  // Today's schedule
  const t = today();
  const wd = getWeekday(t);
  const schedEl = document.getElementById('todaySchedule');
  if (wd===0) { // Sunday
    schedEl.innerHTML = `<div class="sched-item rev"><div class="sched-info"><div class="sched-subject">🌟 Class 11 Backlogs</div><div class="sched-chapter">Full day – catch up on Class 11 topics</div></div></div>`;
  } else if (wd===6) { // Saturday
    schedEl.innerHTML = `<div class="sched-item chem"><div class="sched-info"><div class="sched-subject">🧪 Chemistry — Full Day</div><div class="sched-chapter">Deep dive into current Chemistry chapter</div></div></div>`;
  } else {
    const wi = Math.floor((daysBetween('2025-06-28',t)/7)) % WEEKDAY_SCHEDULE.length;
    const schIdx = ((wd-1) + wi*5) % WEEKDAY_SCHEDULE.length;
    const sch = WEEKDAY_SCHEDULE[schIdx] || WEEKDAY_SCHEDULE[0];
    schedEl.innerHTML = `
      <div class="sched-item chem"><div class="sched-time">5:00–7:00 AM</div><div class="sched-info"><div class="sched-subject">🧪 Chemistry</div><div class="sched-chapter">${sch[1]}</div></div></div>
      <div class="sched-item math"><div class="sched-time">6:00–7:00 PM</div><div class="sched-info"><div class="sched-subject">📐 Maths + HW</div><div class="sched-chapter">${sch[2]}</div></div></div>
      <div class="sched-item phys"><div class="sched-time">7:00–8:30 PM</div><div class="sched-info"><div class="sched-subject">⚛️ Physics</div><div class="sched-chapter">${sch[3]}</div></div></div>
      <div class="sched-item nda"><div class="sched-time">8:30–9:00 PM</div><div class="sched-info"><div class="sched-subject">🎯 NDA Prep</div><div class="sched-chapter">Problem-solving + previous years</div></div></div>
      <div class="sched-item rev"><div class="sched-time">9:00–10:00 PM</div><div class="sched-info"><div class="sched-subject">🔄 Revision</div><div class="sched-chapter">${dueToday.length>0?dueToday.slice(0,3).map(c=>c.name).join(', '):'Review today\'s topics'}</div></div></div>
    `;
  }

  // Revisions due
  const revEl = document.getElementById('revisionsDue');
  if (dueToday.length===0) {
    revEl.innerHTML = `<div class="empty-state">🎉 No revisions due today!<br><small>Keep studying to build your schedule.</small></div>`;
  } else {
    revEl.innerHTML = dueToday.slice(0,6).map(c=>{
      const st = getRevisionStatus(c.id);
      const entry = state.completed[c.id];
      const revN = entry ? entry.revisions.length+1 : 1;
      return `<div class="rev-item">
        <div class="rev-dot ${st==='overdue'?'overdue':'today'}"></div>
        <div class="rev-info">
          <div class="rev-name">${c.name}</div>
          <div class="rev-meta">${c.subject} · Rev #${revN} · ${st==='overdue'?'Overdue':'Due today'}</div>
        </div>
        <button class="rev-done-btn" onclick="markRevisionDone('${c.id}')">Done ✓</button>
      </div>`;
    }).join('');
  }

  // Weekly goal grid
  const weekGrid = document.getElementById('weeklyGrid');
  const todayStr = today();
  const startOfWeek = new Date(todayStr);
  const dow = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - (dow===0?6:dow-1));
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  weekGrid.innerHTML = days.map((d,i)=>{
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate()+i);
    const ds = date.toISOString().split('T')[0];
    const isToday = ds===todayStr;
    const isDone = state.studyDays.includes(ds);
    return `<div class="week-day-cell ${isToday?'today-cell':''} ${isDone&&!isToday?'done-cell':''}">
      <div class="wdc-label">${d}</div>
      <div class="wdc-date">${date.getDate()}</div>
      <div class="wdc-icon">${isDone?'✅':isToday?'📖':'○'}</div>
    </div>`;
  }).join('');

  // Countdown
  const diff = daysBetween(today(), NDA_EXAM_DATE.toISOString().split('T')[0]);
  document.getElementById('countdownDays').textContent = diff > 0 ? diff : 'Past';
}

// ===== TIMETABLE PAGE =====
function renderTimetable() {
  const startDate = '2025-06-28';
  const current = addDays(startDate, state.weekOffset * 7);
  const weekNum = state.weekOffset + 1;

  // Show Mon-Fri (or Mon-Sun for full week)
  const weekStart = new Date(current);
  const wd = weekStart.getDay();
  const diff = wd===0?-6:1-wd;
  weekStart.setDate(weekStart.getDate()+diff);

  document.getElementById('weekLabel').textContent = `Week ${weekNum}`;

  const weekEl = document.getElementById('weekView');
  const days = [];
  for (let i=0;i<5;i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate()+i);
    days.push(d.toISOString().split('T')[0]);
  }

  const schIdx = (state.weekOffset * 5) % WEEKDAY_SCHEDULE.length;
  weekEl.innerHTML = days.map((ds,i)=>{
    const s = WEEKDAY_SCHEDULE[(schIdx+i)%WEEKDAY_SCHEDULE.length];
    const isToday = ds===today();
    const dayLabel = ['Mon','Tue','Wed','Thu','Fri'][i];
    const dateObj = new Date(ds);
    const dateStr = dateObj.toLocaleDateString('en-IN',{day:'numeric',month:'short'});

    return `<div class="day-col">
      <div class="day-header ${isToday?'today-col':''}">
        ${dayLabel}<br><small style="font-weight:400;opacity:.85">${dateStr}</small>
      </div>
      <div class="day-slots">
        <div class="slot chem"><div class="slot-time">5:00–7:00 AM</div><div class="slot-sub">🧪 Chemistry</div><div class="slot-chap">${s[1]}</div></div>
        <div class="slot math"><div class="slot-time">6:00–7:00 PM</div><div class="slot-sub">📐 Maths + HW</div><div class="slot-chap">${s[2]}</div></div>
        <div class="slot phys"><div class="slot-time">7:00–8:30 PM</div><div class="slot-sub">⚛️ Physics</div><div class="slot-chap">${s[3]}</div></div>
        <div class="slot nda-slot"><div class="slot-time">8:30–9:00 PM</div><div class="slot-sub">🎯 NDA Prep</div><div class="slot-chap">PYQs + Drills</div></div>
        <div class="slot rev-slot"><div class="slot-time">9:00–10:00 PM</div><div class="slot-sub">🔄 Revision</div><div class="slot-chap">Spaced recall</div></div>
      </div>
    </div>`;
  }).join('');

  // Month tabs
  const tabsEl = document.getElementById('monthTabs');
  tabsEl.innerHTML = MONTHLY_PLAN.map((m,i)=>`<button class="month-tab ${i===state.activeMonthTab?'active':''}" onclick="selectMonth(${i})">${m.month} — ${m.theme}</button>`).join('');

  renderMonthPlan();
}

function selectMonth(i) {
  state.activeMonthTab = i;
  renderTimetable();
}

function renderMonthPlan() {
  const plan = MONTHLY_PLAN[state.activeMonthTab];
  const planEl = document.getElementById('monthPlan');
  planEl.innerHTML = plan.weeks.map(w=>`
    <div class="month-week-card">
      <div class="mwc-title">${w.title}</div>
      ${w.items.map(it=>`<div class="mwc-item">• ${it}</div>`).join('')}
    </div>
  `).join('');
}

// ===== CHAPTERS PAGE =====
function renderChapters() {
  const filter = state.chapterFilter;
  const subjects = filter==='all' ? ['Physics','Chemistry','Maths'] : [filter];
  const grid = document.getElementById('chaptersGrid');

  grid.innerHTML = subjects.map(sub=>{
    const chaps = CHAPTERS[sub];
    const done = chaps.filter(c=>state.completed[c.id]).length;
    const pct = Math.round(done/chaps.length*100);
    const color = getSubjectColor(sub);

    return `<div class="subject-section">
      <div class="subject-sec-header ${color}-bg">
        <div class="subject-sec-title">${sub==='Physics'?'⚛️':sub==='Chemistry'?'🧪':'📐'} ${sub}</div>
        <div class="subject-sec-pct">${done}/${chaps.length} · ${pct}%</div>
      </div>
      <div class="chapter-list">
        ${chaps.map(c=>{
          const comp = state.completed[c.id];
          const next = getNextRevision(c.id);
          const revStatus = getRevisionStatus(c.id);
          const revN = comp ? comp.revisions.length : 0;
          return `<div class="chap-item ${comp?'completed':''}" onclick="markChapter('${c.id}')">
            <div class="chap-check ${comp?'checked':''}">${comp?'✓':''}</div>
            <div class="chap-info">
              <div class="chap-name">${c.name}</div>
              <div class="chap-meta">
                <span class="chap-badge badge-${c.importance}">${c.importance.toUpperCase()}</span>
                ${c.nda?'<span class="chap-badge badge-nda">NDA</span>':''}
                <span>~${c.hours}h</span>
                ${comp?`<span style="color:var(--success)">Rev ${revN}/${REVISION_INTERVALS.length}</span>`:''}
              </div>
            </div>
            ${comp?`<div class="chap-revision-info">
              ${revStatus==='done'?'<span style="color:var(--success)">✅ All revisions done</span>':
                revStatus==='today'?'<span style="color:var(--warn)">🔔 Rev due today</span>':
                revStatus==='overdue'?'<span style="color:var(--danger)">⚠️ Overdue</span>':
                `<span>Next: ${formatDate(next)}</span>`}
              <br><button class="reset-chap-btn" onclick="resetChapter('${c.id}',event)">Reset</button>
            </div>`:''}
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');
}

// ===== REVISION PAGE =====
function renderRevisionPage() {
  const all = allChaps().filter(c=>state.completed[c.id]);
  const overdue=[], todayArr=[], weekArr=[], upcomingArr=[];

  for (const c of all) {
    const st = getRevisionStatus(c.id);
    const next = getNextRevision(c.id);
    const entry = state.completed[c.id];
    const revN = entry.revisions.length+1;
    const card = `<div class="rev-card">
      <div class="rev-card-name">${c.name}</div>
      <div class="rev-card-sub">${c.subject}</div>
      <div class="rev-card-interval">Revision #${revN} of ${REVISION_INTERVALS.length} · ${next?'Due: '+formatDate(next):'All done'}</div>
      <button class="mark-rev-btn" onclick="markRevisionDone('${c.id}')">✓ Mark Revised</button>
    </div>`;
    if (st==='overdue') overdue.push(card);
    else if (st==='today') todayArr.push(card);
    else if (st==='upcoming-week') weekArr.push(card);
    else if (st==='upcoming') upcomingArr.push(card);
  }

  const empty = '<div class="empty-state">Nothing here yet 🎉</div>';
  document.getElementById('overdueList').innerHTML = overdue.join('')||empty;
  document.getElementById('todayList').innerHTML = todayArr.join('')||empty;
  document.getElementById('weekList').innerHTML = weekArr.join('')||empty;
  document.getElementById('upcomingList').innerHTML = upcomingArr.join('')||empty;

  // History
  const hist = [];
  for (const c of allChaps()) {
    const entry = state.completed[c.id];
    if (!entry) continue;
    entry.revisions.forEach((d,i)=>{
      hist.push({ name:c.name, subject:c.subject, date:d, num:i+1 });
    });
  }
  hist.sort((a,b)=>b.date.localeCompare(a.date));
  const histEl = document.getElementById('revisionHistory');
  if (hist.length===0) { histEl.innerHTML=`<div class="empty-state">Complete chapters and mark revisions to see history.</div>`; return; }
  histEl.innerHTML = hist.slice(0,15).map(h=>`
    <div class="rev-hist-item">
      <span style="color:var(--${getSubjectColor(h.subject)})">${h.subject==='Physics'?'⚛️':h.subject==='Chemistry'?'🧪':'📐'}</span>
      <span style="flex:1;font-weight:500">${h.name}</span>
      <span style="color:var(--text-3);font-size:.75rem">Rev #${h.num} · ${formatDate(h.date)}</span>
    </div>
  `).join('');
}

// ===== ANALYTICS =====
function renderAnalytics() {
  const prog = getProgress();

  for (const [sub, data] of Object.entries(prog.bySubject)) {
    const col = getSubjectColor(sub);
    const key = sub==='Physics'?'phys':sub==='Chemistry'?'chem':'math';
    document.getElementById(`${key}Bar`).style.width = data.pct+'%';
    document.getElementById(`${key}Pct`).textContent = data.pct+'%';

    const chaps = CHAPTERS[sub];
    const barsEl = document.getElementById(`${key}ChapBars`);
    barsEl.innerHTML = chaps.map(c=>{
      const done = state.completed[c.id]?100:0;
      const revN = state.completed[c.id]?state.completed[c.id].revisions.length:0;
      return `<div class="chap-bar-item">
        <div class="chap-bar-label">
          <span style="font-size:.72rem">${c.name.length>22?c.name.slice(0,22)+'…':c.name}</span>
          <span style="font-size:.7rem;color:var(--text-3)">${done?`✓ Rev ${revN}/${REVISION_INTERVALS.length}`:''}</span>
        </div>
        <div class="chap-bar-track">
          <div class="chap-bar-fill ${col}-fill" style="width:${done}%;background:${sub==='Physics'?'var(--phys)':sub==='Chemistry'?'var(--chem)':'var(--math)'}"></div>
        </div>
      </div>`;
    }).join('');
  }

  // Weak chapters (not done + high importance)
  const weakEl = document.getElementById('weakChapters');
  const weak = allChaps().filter(c=>!state.completed[c.id]&&c.importance==='high');
  if (weak.length===0) { weakEl.innerHTML=`<div class="empty-state">🎉 All high-importance chapters are done!</div>`; }
  else {
    weakEl.innerHTML = weak.slice(0,8).map(c=>`
      <div class="weak-item">
        <div class="weak-icon">${c.subject==='Physics'?'⚛️':c.subject==='Chemistry'?'🧪':'📐'}</div>
        <div class="weak-name">${c.name} <span style="font-size:.72rem;color:var(--text-3)">${c.subject}</span></div>
        <button class="weak-action" onclick="markChapter('${c.id}')">Mark Done</button>
      </div>
    `).join('');
  }

  // Monthly completion chart
  const monthlyEl = document.getElementById('monthlyChart');
  const months = ['Jul','Aug','Sep','Oct'];
  const monthData = months.map((m,i)=>{
    // Simulate based on completion date
    const doneThisMonth = allChaps().filter(c=>{
      const e = state.completed[c.id];
      if (!e) return false;
      const d = new Date(e.date);
      return d.getMonth()===(6+i)%12;
    });
    const p = doneThisMonth.filter(c=>c.subject==='Physics').length;
    const ch = doneThisMonth.filter(c=>c.subject==='Chemistry').length;
    const ma = doneThisMonth.filter(c=>c.subject==='Maths').length;
    return {m,p,ch,ma};
  });
  const maxVal = Math.max(...monthData.flatMap(d=>[d.p,d.ch,d.ma]),1);
  monthlyEl.innerHTML = monthData.map(d=>`
    <div class="month-bar-group">
      <div class="month-bars">
        <div class="m-bar phys-b" style="height:${Math.round(d.p/maxVal*80)+5}px" title="Physics: ${d.p}"></div>
        <div class="m-bar chem-b" style="height:${Math.round(d.ch/maxVal*80)+5}px" title="Chem: ${d.ch}"></div>
        <div class="m-bar math-b" style="height:${Math.round(d.ma/maxVal*80)+5}px" title="Math: ${d.ma}"></div>
      </div>
      <div class="month-bar-label">${d.m}</div>
    </div>
  `).join('') + `<div style="padding-left:.5rem;font-size:.7rem;display:flex;flex-direction:column;gap:.3rem;justify-content:center">
    <div><span style="color:var(--phys)">■</span> Physics</div>
    <div><span style="color:var(--chem)">■</span> Chemistry</div>
    <div><span style="color:var(--math)">■</span> Maths</div>
  </div>`;
}

function updateProgressBars() {
  const prog = getProgress();
  document.getElementById('overallPct').textContent = prog.pct+'%';
  document.getElementById('overallBar').style.width = prog.pct+'%';
  document.getElementById('chapsDone').textContent = prog.done+' / '+prog.total;
}

// ===== MOCK TESTS =====
function renderMockTests() {
  const scores = state.mockScores;
  const chartEl = document.getElementById('mockChart');
  if (scores.length===0) {
    chartEl.innerHTML = `<div class="empty-state" style="width:100%">No scores yet. Click "+ Add Score" to track your tests.</div>`;
  } else {
    const max = 100;
    chartEl.innerHTML = scores.slice(-10).map(s=>`
      <div class="mock-bar-wrap">
        <div class="mock-bar" style="height:${Math.round(s.score/max*130)+10}px;background:${s.score>=80?'var(--success)':s.score>=60?'var(--accent)':'var(--danger)'}"></div>
        <div class="mock-bar-label">${s.score}%</div>
        <div class="mock-bar-label">${new Date(s.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
      </div>
    `).join('');
  }

  const histEl = document.getElementById('mockHistory');
  if (scores.length===0) { histEl.innerHTML=`<div class="empty-state">No mock tests recorded yet.</div>`; return; }
  histEl.innerHTML = scores.slice().reverse().map((s,i)=>`
    <div class="mock-hist-item">
      <span style="color:var(--text-3);font-size:.75rem">${formatDate(s.date)}</span>
      <span style="flex:1;font-weight:500;margin:0 .8rem">${s.subject}</span>
      ${s.notes?`<span style="color:var(--text-3);font-size:.75rem;flex:1">${s.notes}</span>`:''}
      <span class="mock-score-badge ${s.score>=80?'score-high':s.score>=60?'score-mid':'score-low'}">${s.score}/100</span>
      <button onclick="deleteMock(${scores.length-1-i})" style="background:none;border:none;color:var(--text-3);cursor:pointer;margin-left:.5rem">✕</button>
    </div>
  `).join('');
}

function deleteMock(i) {
  state.mockScores.splice(i,1);
  saveState();
  renderMockTests();
}

// ===== FORMULAS =====
function renderFormulas() {
  const q = (state.formulaFilter||'').toLowerCase();
  const filtered = FORMULAS.filter(f=>
    !q || f.name.toLowerCase().includes(q) || f.subject.toLowerCase().includes(q) || f.chapter.toLowerCase().includes(q)
  );
  const grid = document.getElementById('formulasGrid');
  if (filtered.length===0) { grid.innerHTML=`<div class="empty-state" style="grid-column:1/-1">No formulas match your search.</div>`; return; }
  grid.innerHTML = filtered.map(f=>{
    const col = getSubjectColor(f.subject);
    const key = f.subject+'_'+f.name;
    const revised = state.formulasRevised[key];
    return `<div class="formula-card">
      <div class="formula-subject ${col}">${f.subject} · ${f.chapter}</div>
      <div class="formula-name">${f.name}</div>
      <div class="formula-expr">${f.expr}</div>
      <div class="formula-revised">${revised?`✅ Last revised: ${formatDate(revised)}`:'Not yet revised'}
        <button onclick="reviseFormula('${key}')" style="margin-left:.5rem;background:none;border:1px solid var(--border);border-radius:4px;padding:.1rem .4rem;font-size:.65rem;cursor:pointer;color:var(--text-3);font-family:var(--font)">Revise ✓</button>
      </div>
    </div>`;
  }).join('');
}

function reviseFormula(key) {
  state.formulasRevised[key] = today();
  saveState();
  renderFormulas();
  showToast('🔬 Formula marked as revised!');
}

// ===== QUOTES =====
function loadQuote() {
  const q = QUOTES[Math.floor(Math.random()*QUOTES.length)];
  document.getElementById('quoteText').textContent = `"${q.text}"`;
  document.getElementById('quoteAuthor').textContent = q.author ? `— ${q.author}` : '— Anonymous';
}

// ===== TOAST =====
function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:2rem;right:2rem;background:var(--text);color:var(--bg);padding:.7rem 1.3rem;border-radius:var(--radius-sm);font-size:.85rem;font-weight:500;z-index:999;animation:fadeIn .3s ease;box-shadow:var(--shadow-md)`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),2800);
}

// ===== NAVIGATION =====
function navigate(page) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(a=>a.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
  state.activePage = page;

  if (page==='timetable') renderTimetable();
  if (page==='mock') renderMockTests();
  if (page==='formulas') renderFormulas();

  // Close sidebar on mobile
  document.getElementById('sidebar').classList.remove('open');
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', ()=>{
  loadState();
  updateStreak();

  // Nav links
  document.querySelectorAll('.nav-link').forEach(link=>{
    link.addEventListener('click',e=>{
      e.preventDefault();
      navigate(link.dataset.page);
    });
  });

  // Mobile menu
  document.getElementById('menuBtn').addEventListener('click',()=>{
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Theme toggle
  let darkMode = localStorage.getItem('darkMode')==='true';
  if (darkMode) { document.documentElement.setAttribute('data-theme','dark'); document.getElementById('themeToggle').textContent='☀️'; }
  document.getElementById('themeToggle').addEventListener('click',()=>{
    darkMode = !darkMode;
    localStorage.setItem('darkMode',darkMode);
    document.documentElement.setAttribute('data-theme',darkMode?'dark':'');
    document.getElementById('themeToggle').textContent = darkMode?'☀️':'🌙';
  });

  // Week nav
  document.getElementById('prevWeek').addEventListener('click',()=>{
    if (state.weekOffset>0) { state.weekOffset--; renderTimetable(); }
  });
  document.getElementById('nextWeek').addEventListener('click',()=>{
    if (state.weekOffset<15) { state.weekOffset++; renderTimetable(); }
  });

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.chapterFilter = btn.dataset.filter;
      renderChapters();
    });
  });

  // Mock modal
  document.getElementById('addMockBtn').addEventListener('click',()=>{
    document.getElementById('mockModal').classList.remove('hidden');
    document.getElementById('mockDate').value = today();
  });
  document.getElementById('cancelMock').addEventListener('click',()=>{
    document.getElementById('mockModal').classList.add('hidden');
  });
  document.getElementById('saveMock').addEventListener('click',()=>{
    const date = document.getElementById('mockDate').value;
    const subject = document.getElementById('mockSubject').value;
    const score = parseInt(document.getElementById('mockScore').value)||0;
    const notes = document.getElementById('mockNotes').value;
    if (!date||!score) { showToast('⚠️ Please fill in date and score.'); return; }
    state.mockScores.push({date,subject,score,notes});
    saveState();
    document.getElementById('mockModal').classList.add('hidden');
    renderMockTests();
    showToast('📝 Score saved!');
  });

  // Formula search
  document.getElementById('formulaSearch').addEventListener('input',e=>{
    state.formulaFilter = e.target.value;
    renderFormulas();
  });

  // Initial render
  loadQuote();
  renderAll();
  renderTimetable();
  navigate('dashboard');
});
