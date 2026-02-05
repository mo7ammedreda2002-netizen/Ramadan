let currentWeek = 1;

let quranHabits = JSON.parse(localStorage.getItem('ramadanQuranHabits')) || [
    { id: 'q1', label: 'قرآن: الفجر' },
    { id: 'q2', label: 'قرآن: الظهر' },
    { id: 'q3', label: 'قرآن: العصر' },
    { id: 'q4', label: 'قرآن: المغرب' },
    { id: 'q5', label: 'قرآن: العشاء' }
];

let otherHabits = JSON.parse(localStorage.getItem('ramadanOtherHabits')) || [
    { id: 'h1', label: 'قيام الليل' },
    { id: 'h2', label: 'الأذكار' },
    { id: 'h3', label: 'الصدقة' },
    { id: 'h4', label: 'صلة الرحم' }
];

let appData = JSON.parse(localStorage.getItem('ramadanData_v4')) || Array.from({ length: 30 }, (_, i) => ({ day: i + 1, tasks: {} }));
let weekNotes = JSON.parse(localStorage.getItem('ramadanNotes')) || {};
let myChart;

function renderTables() {
    const start = (currentWeek - 1) * 7;
    const end = Math.min(start + 7, 30);
    const weekDays = appData.slice(start, end);

    const headerHTML = '<th>المهام</th>' + weekDays.map(d => `<th>يوم ${d.day}</th>`).join('');
    document.getElementById('quran-header').innerHTML = headerHTML;
    document.getElementById('habit-header').innerHTML = headerHTML;

    document.getElementById('quran-body').innerHTML = quranHabits.map(h => `
        <tr>
            <td style="text-align:right; font-weight:700;">${h.label}</td>
            ${weekDays.map(d => `
                <td><button class="checkbox-btn ${d.tasks[h.id] ? 'checked-quran' : ''}" onclick="toggleTask(${d.day-1}, '${h.id}')"><i data-lucide="check"></i></button></td>
            `).join('')}
        </tr>
    `).join('');

    document.getElementById('habit-body').innerHTML = otherHabits.map(h => `
        <tr>
            <td style="text-align:right; font-weight:700;">${h.label}</td>
            ${weekDays.map(d => `
                <td><button class="checkbox-btn ${d.tasks[h.id] ? 'checked-habit' : ''}" onclick="toggleTask(${d.day-1}, '${h.id}')"><i data-lucide="check"></i></button></td>
            `).join('')}
        </tr>
    `).join('');
    
    document.getElementById('ref-week-num').innerText = currentWeek;
    document.getElementById('chart-week-num').innerText = currentWeek;
    loadNotes();
    updateProgress();
    updateChart();
    lucide.createIcons();
}

function toggleTask(dayIdx, taskId) {
    appData[dayIdx].tasks[taskId] = !appData[dayIdx].tasks[taskId];
    localStorage.setItem('ramadanData_v4', JSON.stringify(appData));
    renderTables();
}

function changeWeek(w) {
    currentWeek = w;
    document.querySelectorAll('.week-btn').forEach((b, i) => b.classList.toggle('active', i === w-1));
    renderTables();
}

function saveNotes() {
    weekNotes[currentWeek] = { 
        reason: document.getElementById('note-reason').value, 
        eval: document.getElementById('note-eval').value 
    };
    localStorage.setItem('ramadanNotes', JSON.stringify(weekNotes));
}

function loadNotes() {
    const n = weekNotes[currentWeek] || { reason: '', eval: '' };
    document.getElementById('note-reason').value = n.reason;
    document.getElementById('note-eval').value = n.eval;
}

function updateProgress() {
    const start = (currentWeek - 1) * 7;
    const end = Math.min(start + 7, 30);
    const weekDays = appData.slice(start, end);
    let weekDone = 0;
    const tasksPerDay = quranHabits.length + otherHabits.length;
    const possibleInWeek = weekDays.length * tasksPerDay;
    weekDays.forEach(d => { [...quranHabits, ...otherHabits].forEach(h => { if(d.tasks[h.id]) weekDone++; }); });
    const rate = possibleInWeek > 0 ? Math.round((weekDone/possibleInWeek)*100) : 0;
    document.getElementById('week-points').innerText = weekDone;
    document.getElementById('week-rate').innerText = rate + "%";
    document.getElementById('weekly-points-text').innerText = `أنجزت ${weekDone} من أصل ${possibleInWeek} مهمة في الأسبوع ${currentWeek}`;
    const fill = document.getElementById('progress-fill');
    fill.style.width = rate + "%";
    const label = document.getElementById('status-label');
    const rankElem = document.getElementById('week-rank');
    if (rate >= 95) { label.innerText = "أداء مثالي! ✨"; rankElem.innerText = "تاج رمضان"; }
    else if (rate >= 75) { label.innerText = "تقييمك ممتاز جداً 🔥"; rankElem.innerText = "فارس الطاعة"; }
    else if (rate >= 40) { label.innerText = "تقييمك جيد 👍"; rankElem.innerText = "مجتهد صاعد"; }
    else { label.innerText = "أنت متأخر قليلاً ⚠"; rankElem.innerText = "مبتدئ طموح"; }
}

function initChart() {
    const ctx = document.getElementById('dailyChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'المهام', data: [], borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.1)', fill: true, tension: 0.4, borderWidth: 3 }] },
        options: { 
            responsive: true, maintainAspectRatio: false, 
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } }, x: { grid: { display: false } } }
        }
    });
    updateChart();
}

function updateChart() {
    if(!myChart) return;
    const start = (currentWeek - 1) * 7;
    const end = Math.min(start + 7, 30);
    const weekDays = appData.slice(start, end);
    myChart.data.labels = weekDays.map(d => `يوم ${d.day}`);
    myChart.data.datasets[0].data = weekDays.map(d => {
        let c = 0; [...quranHabits, ...otherHabits].forEach(h => { if(d.tasks[h.id]) c++; }); return c;
    });
    myChart.update();
}

function openSettings() {
    const qList = document.getElementById('quran-config-list');
    qList.innerHTML = quranHabits.map((h, i) => `<div class="habit-item"><input type="text" value="${h.label}" id="quran-input-${i}"></div>`).join('');
    const hList = document.getElementById('habits-config-list');
    hList.innerHTML = otherHabits.map((h, i) => `<div class="habit-item"><input type="text" value="${h.label}" id="habit-input-${i}"><span style="color:#e11d48; cursor:pointer;" onclick="removeHabit(${i})"><i data-lucide="trash-2"></i></span></div>`).join('');
    document.getElementById('settingsModal').style.display = 'block';
    lucide.createIcons();
}

function toggleSettingsSection(type) {
    document.getElementById('quran-config-section').style.display = type === 'quran' ? 'block' : 'none';
    document.getElementById('habits-config-section').style.display = type === 'habits' ? 'block' : 'none';
    document.getElementById('set-tab-q').classList.toggle('active', type === 'quran');
    document.getElementById('set-tab-h').classList.toggle('active', type === 'habits');
}

function removeHabit(i) { otherHabits.splice(i, 1); openSettings(); }
function addHabitInput() { otherHabits.push({ id: 'h'+Date.now(), label: 'مهمة جديدة' }); openSettings(); }

function saveAllConfigs() {
    quranHabits.forEach((h, i) => h.label = document.getElementById('quran-input-'+i).value || h.label);
    localStorage.setItem('ramadanQuranHabits', JSON.stringify(quranHabits));
    otherHabits.forEach((h, i) => { const inp = document.getElementById('habit-input-'+i); if(inp) h.label = inp.value || h.label; });
    localStorage.setItem('ramadanOtherHabits', JSON.stringify(otherHabits));
    document.getElementById('settingsModal').style.display = 'none';
    renderTables();
}

function showTab(t) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(t + '-tab').classList.add('active');
    document.getElementById('btn-' + t).classList.add('active');
}

window.onclick = (e) => { if(e.target.className === 'modal') e.target.style.display = 'none'; }
window.onload = () => { renderTables(); initChart(); };