let mainTrendChartInstance = null;
let categoryPieChartInstance = null;

async function fetchAnalyticsData() {
    const user = localStorage.getItem("user") || "demo";

    try {
        const res = await fetch(`${API}/expenses/${user}`);
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("Analytics fetch error:", err);
        return [];
    }
}

function buildWeeklyData(expenses) {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const map = {Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0, Sun:0};

    expenses.forEach(e => {
        const d = new Date(e.date);
        if (isNaN(d)) return;

        const labelMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const day = labelMap[d.getDay()];
        map[day] += Number(e.amount || 0);
    });

    const values = labels.map(l => map[l]);
    return { labels, values };
}

function buildMonthlyData(expenses) {
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const map = {};
    labels.forEach(m => map[m] = 0);

    expenses.forEach(e => {
        const d = new Date(e.date);
        if (isNaN(d)) return;
        const month = labels[d.getMonth()];
        map[month] += Number(e.amount || 0);
    });

    const values = labels.map(l => map[l]);
    return { labels, values };
}

function buildTrend(values) {
    let running = 0;
    return values.map((v, i) => {
        running += v;
        return Math.round(running / (i + 1));
    });
}

function buildCategoryData(expenses) {
    const map = {};

    expenses.forEach(e => {
        const category = e.category || "Other";
        map[category] = (map[category] || 0) + Number(e.amount || 0);
    });

    return {
        labels: Object.keys(map).length ? Object.keys(map) : ["No Data"],
        values: Object.keys(map).length ? Object.values(map) : [1]
    };
}

function updateAnalyticsSummary(expenses, mode, values) {
    const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const average = values.length ? Math.round(values.reduce((a,b)=>a+b,0) / values.length) : 0;

    let categoryMap = {};
    expenses.forEach(e => {
        const cat = e.category || "Other";
        categoryMap[cat] = (categoryMap[cat] || 0) + Number(e.amount || 0);
    });

    let topCategory = "-";
    let max = 0;
    for (let key in categoryMap) {
        if (categoryMap[key] > max) {
            max = categoryMap[key];
            topCategory = key;
        }
    }

    const totalEl = document.getElementById("analyticsTotalValue");
    const avgEl = document.getElementById("analyticsAverageValue");
    const topEl = document.getElementById("analyticsTopCategory");

    if(totalEl) totalEl.innerText = `₹${total}`;
    if(avgEl) avgEl.innerText = `₹${average}`;
    if(topEl) topEl.innerText = topCategory;

    const aiText = document.getElementById("analyticsAiText");
    if(aiText){
        if(total === 0){
            aiText.innerText = "No expense data yet. Add transactions to unlock meaningful analytics insights.";
        } else if(topCategory === "Food" || topCategory === "Shopping"){
            aiText.innerText = `Your top spending category is ${topCategory}. This may be a good place to optimize your weekly budget.`;
        } else {
            aiText.innerText = `Your spending is concentrated around ${topCategory}. Track it regularly to improve savings efficiency.`;
        }
    }
}

function renderMainTrendChart(labels, values, trendValues) {
    const canvas = document.getElementById("mainTrendChart");
    if(!canvas) return;

    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 0, 340);
    gradient.addColorStop(0, "rgba(124,58,237,0.35)");
    gradient.addColorStop(1, "rgba(124,58,237,0.02)");

    if(mainTrendChartInstance){
        mainTrendChartInstance.destroy();
    }

    mainTrendChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Spending",
                    data: values,
                    borderColor: "#7c3aed",
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.42,
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: "#7c3aed",
                    pointHoverBorderColor: "#ffffff",
                    pointHoverBorderWidth: 2
                },
                {
                    label: "Trend",
                    data: trendValues,
                    borderColor: "#22d3ee",
                    tension: 0.42,
                    borderWidth: 2,
                    borderDash: [6, 6],
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "#22d3ee",
                    pointHoverBorderColor: "#ffffff",
                    pointHoverBorderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: "index"
            },
            animation: {
                duration: 1400,
                easing: "easeOutQuart"
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    titleColor: "#ffffff",
                    bodyColor: "#e2e8f0",
                    borderColor: "rgba(255,255,255,0.08)",
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    cornerRadius: 12,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ₹${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: "#94a3b8" },
                    border: { display: false }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: "rgba(148, 163, 184, 0.12)" },
                    ticks: {
                        color: "#94a3b8",
                        callback: function(value) {
                            return "₹" + value;
                        }
                    },
                    border: { display: false }
                }
            }
        }
    });
}

function renderCategoryPieChart(labels, values) {
    const canvas = document.getElementById("categoryPieChart");
    if(!canvas) return;

    if(categoryPieChartInstance){
        categoryPieChartInstance.destroy();
    }

    categoryPieChartInstance = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    "#7c3aed",
                    "#22d3ee",
                    "#f59e0b",
                    "#ef4444",
                    "#10b981",
                    "#8b5cf6"
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "70%",
            plugins: {
                legend: {
                    labels: {
                        color: "#e2e8f0"
                    }
                }
            },
            animation: {
                duration: 1200
            }
        }
    });
}

function setAnalyticsToggle(mode) {
    const weeklyBtn = document.getElementById("weeklyBtn");
    const monthlyBtn = document.getElementById("monthlyBtn");

    if(weeklyBtn) weeklyBtn.classList.toggle("active", mode === "weekly");
    if(monthlyBtn) monthlyBtn.classList.toggle("active", mode === "monthly");
}

async function loadChartsPage(mode = "weekly") {
    setAnalyticsToggle(mode);

    const expenses = await fetchAnalyticsData();

    let labels = [];
    let values = [];

    if(mode === "weekly"){
        const weekly = buildWeeklyData(expenses);
        labels = weekly.labels;
        values = weekly.values;
    } else {
        const monthly = buildMonthlyData(expenses);
        labels = monthly.labels;
        values = monthly.values;
    }

    const trendValues = buildTrend(values);
    const categoryData = buildCategoryData(expenses);

    renderMainTrendChart(labels, values, trendValues);
    renderCategoryPieChart(categoryData.labels, categoryData.values);
    updateAnalyticsSummary(expenses, mode, values);
}

document.addEventListener("DOMContentLoaded", () => {
    if(document.getElementById("mainTrendChart")){
        loadChartsPage("weekly");
    }
});