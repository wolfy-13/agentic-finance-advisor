const API = "http://127.0.0.1:8000";

async function loadCharts(){

    let res = await fetch(`${API}/expenses/demo`);
    let data = await res.json();

    let monthMap = {};

    data.forEach(e=>{
        let m = e.date.slice(0,7);
        monthMap[m] = (monthMap[m] || 0) + Number(e.amount);
    });

    new Chart(document.getElementById("barChart"), {
        type: "bar",
        data: {
            labels: Object.keys(monthMap),
            datasets: [{
                data: Object.values(monthMap),
                backgroundColor: "#4f46e5"
            }]
        },
        options: {
            animation: { duration: 1500 }
        }
    });
}

window.onload = loadCharts;