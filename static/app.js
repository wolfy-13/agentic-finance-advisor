const API = "http://127.0.0.1:8000";
let chart;

function go(page){
    location.href = page;
}

async function loadDashboard(){

    let res = await fetch(`${API}/expenses/demo`);
    let data = await res.json();

    let total = 0;
    let map = {};

    data.forEach(e=>{
        let amt = Number(e.amount);
        total += amt;

        map[e.category] = (map[e.category] || 0) + amt;
    });

    document.getElementById("total").innerText = "₹" + total;
    document.getElementById("count").innerText = data.length;

    updateChart(map);
}

function updateChart(map){

    let labels = Object.keys(map);
    let values = Object.values(map);

    if(chart) chart.destroy();

    chart = new Chart(document.getElementById("chart"), {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    "#6366f1","#22c55e","#f59e0b","#ef4444"
                ]
            }]
        },
        options: {
            animation: {
                duration: 1200
            }
        }
    });
}

window.onload = loadDashboard;