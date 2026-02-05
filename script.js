// بيانات البرنامج الأولية
let appData = Array.from({ length: 7 }, (_, i) => ({
    day: i + 1,
    fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false,
    qiyam: false, prayers: false, sunnah: false, dhikr: false, selfControl: false
}));

const quranHabits = [
    { key: 'fajr', label: 'قرآن - بعد الفجر' },
    { key: 'dhuhr', label: 'قرآن - بعد الظهر' },
    { key: 'asr', label: 'قرآن - بعد العصر' },
    { key: 'maghrib', label: 'قرآن - بعد المغرب' },
    { key: 'isha', label: 'قرآن - بعد العشاء' },
];

const otherHabits = [
    { key: 'qiyam', label: 'قيام الليل' },
    { key: 'prayers', label: 'الصلوات في وقتها' },
    { key: 'sunnah', label: 'السنن الرواتب' },
    { key: 'dhikr', label: 'أذكار يومية' },
    { key: 'selfControl', label: 'ضبط النفس' },
];

let myChart = null;

// وظيفة تبديل التبويبات
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.getElementById(`btn-${tabName}`).classList.add('active');
    
    if (tabName === 'progress') {
        updateProgress();
    }
}

// إنشاء الجدول برمجياً
function initTable() {
    const headerRow = document.getElementById('table-header');
    const tableBody = document.getElementById('table-body');
    const footerRow = document.getElementById('table-footer');

    // إضافة عناوين الأيام
    appData.forEach(d => {
        const th = document.createElement('th');
        th.innerText = `يوم ${d.day}`;
        headerRow.appendChild(th);
    });

    // إضافة صفوف القرآن
    const quranHeader = document.createElement('tr');
    quranHeader.className = 'section-divider';
    quranHeader.innerHTML = `<td colspan="8">ورد القرآن الكريم (الصح = 1 جزء)</td>`;
    tableBody.appendChild(quranHeader);

    renderHabitRows(quranHabits, 'quran', tableBody);

    // إضافة صفوف العبادات الأخرى
    const otherHeader = document.createElement('tr');
    otherHeader.className = 'section-divider';
    otherHeader.innerHTML = `<td colspan="8" style="color: #2563eb">بروتوكول الانضباط (الصح = 1 نقطة)</td>`;
    tableBody.appendChild(otherHeader);

    renderHabitRows(otherHabits, 'other', tableBody);

    updateTotals();
    initChart();
}

function renderHabitRows(habits, type, parent) {
    habits.forEach(habit => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${habit.label}</td>`;
        
        appData.forEach((day, index) => {
            const td = document.createElement('td');
            const btn = document.createElement('button');
            btn.className = 'checkbox-btn';
            btn.innerHTML = '<i data-lucide="check"></i>';
            btn.onclick = () => toggleCheck(index, habit.key, btn, type);
            td.appendChild(btn);
            tr.appendChild(td);
        });
        parent.appendChild(tr);
    });
    // تفعيل الأيقونات لأول مرة عند بناء الجدول
    if(window.lucide) window.lucide.createIcons();
}

function toggleCheck(dayIndex, key, btn, type) {
    appData[dayIndex][key] = !appData[dayIndex][key];
    
    if (appData[dayIndex][key]) {
        btn.classList.add(type === 'quran' ? 'checked-quran' : 'checked-other');
        btn.style.color = "white"; // التأكد من ظهور اللون الأبيض للعلامة
    } else {
        btn.classList.remove('checked-quran', 'checked-other');
        btn.style.color = "transparent"; // إخفاء العلامة عند إلغاء التحديد
    }
    
    // إعادة تفعيل الأيقونات داخل الزر لضمان ظهور علامة الصح
    if(window.lucide) window.lucide.createIcons();
    
    updateTotals();
    updateChart();
    updateDailyAnalysis();
}

function updateTotals() {
    const footerRow = document.getElementById('table-footer');
    // مسح المجاميع القديمة (عدا أول خلية)
    while (footerRow.cells.length > 1) footerRow.deleteCell(1);

    appData.forEach(day => {
        const total = [...quranHabits, ...otherHabits].reduce((sum, h) => sum + (day[h.key] ? 1 : 0), 0);
        const td = document.createElement('td');
        td.innerText = total;
        if (total >= 8) td.style.color = '#4ade80';
        footerRow.appendChild(td);
    });
}

function updateDailyAnalysis() {
    // نأخذ بيانات اليوم الأول كمثال
    const today = appData[0];
    const points = [...quranHabits, ...otherHabits].reduce((sum, h) => sum + (today[h.key] ? 1 : 0), 0);
    const quran = quranHabits.reduce((sum, h) => sum + (today[h.key] ? 1 : 0), 0);

    document.getElementById('today-points').innerText = points;
    document.getElementById('today-quran').innerText = quran;
    document.getElementById('daily-analysis-text').innerText = points > 7 ? 'أداء ممتاز، أنت في منطقة الأمان اليوم.' : 'بإمكانك فعل الأفضل، حاول استكمال المهام.';
}

function updateProgress() {
    const totalQuran = appData.reduce((sum, day) => sum + quranHabits.reduce((s, h) => s + (day[h.key] ? 1 : 0), 0), 0);
    const rate = (totalQuran / 35) * 100;
    
    document.getElementById('total-quran-text').innerText = `${totalQuran} جزء`;
    document.getElementById('completion-rate-text').innerText = `${Math.round(rate)}%`;
    document.getElementById('progress-fill').style.width = `${Math.min(rate, 100)}%`;
    document.getElementById('completed-khatmas').innerText = (totalQuran / 30).toFixed(2);
    document.getElementById('remaining-quran').innerText = Math.max(0, 35 - totalQuran);

    const statusLabel = document.getElementById('status-label');
    const statusSub = document.getElementById('status-sub');
    const fill = document.getElementById('progress-fill');

    if (rate >= 90) {
        statusLabel.innerText = "أداء مثالي! 🏆";
        statusLabel.style.color = "#10b981";
        statusSub.innerText = "أنت الآن في القمة، حافظ عليها.";
        fill.style.backgroundColor = "#10b981";
    } else if (rate >= 75) {
        statusLabel.innerText = "جيد جداً ⭐";
        statusLabel.style.color = "#2563eb";
        statusSub.innerText = "أداء قوي، محتاج تحسين بسيط للمثالية.";
        fill.style.backgroundColor = "#2563eb";
    } else if (rate >= 50) {
        statusLabel.innerText = "تقريباً متأخر ⏳";
        statusLabel.style.color = "#f59e0b";
        statusSub.innerText = "أنت في منطقة الخطر، شد حيلك شوية.";
        fill.style.backgroundColor = "#f59e0b";
    } else {
        statusLabel.innerText = "متأخر جداً ✘";
        statusLabel.style.color = "#e11d48";
        statusSub.innerText = "تحتاج مراجعة خطتك فوراً لتعويض ما فاتك.";
        fill.style.backgroundColor = "#e11d48";
    }
}

// نظام الرسم البياني
function initChart() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: appData.map(d => `يوم ${d.day}`),
            datasets: [{
                label: 'مجموع النقاط',
                data: appData.map(d => 0),
                borderColor: '#10b981',
                borderWidth: 4,
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(16, 185, 129, 0.1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 10 }
            }
        }
    });
}

function updateChart() {
    if (myChart) {
        myChart.data.datasets[0].data = appData.map(day => 
            [...quranHabits, ...otherHabits].reduce((sum, h) => sum + (day[h.key] ? 1 : 0), 0)
        );
        myChart.update();
    }
}

// التشغيل عند تحميل الصفحة
window.onload = initTable;