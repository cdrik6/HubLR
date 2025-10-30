// Scatter
const canvasScatter = document.createElement("canvas");	
canvasScatter.width = 200;
canvasScatter.height = 200;
statsContainer.appendChild(canvasScatter);		
const ctxScatter = canvasScatter.getContext("2d");
if (!ctxScatter) throw new Error("Cannot get Scatter canvas context");
fetch(`/api/stats/scatter`, { method: 'GET', credentials: 'include' })
.then(res => {
    if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
    return (res.json());
})
.then(function(data)
{	
    new Chart(ctxScatter,
        {
            type: 'scatter',
            data: {					
                datasets: [{ label: 'Spread vs Max Touch', data: data }]
            },
            options: {					
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    title: { display: true,	text: 'Spread vs Max Touch'	}
                },
                scales: {						
                    x: { title: { display: true, text: 'Spread' } },
                    y: { title: { display: true, text: 'Max Touch' } }
                }
            }
        });		
})
.catch(err => { console.error("Bar chart failed: ", err); });	