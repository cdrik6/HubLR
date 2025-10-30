const scatterContainer = document.getElementById("scatter");

// Scatter
const canvasScatter = document.createElement("canvas");	
canvasScatter.width = 200;
canvasScatter.height = 200;
scatterContainer.appendChild(canvasScatter);		
const ctxScatter = canvasScatter.getContext("2d");
if (!ctxScatter) throw new Error("Cannot get Scatter canvas context");
fetch(`/api/data/scatter`, { method: 'GET' })
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
                datasets: [{ label: 'km vs price', data: data }]
            },
            options: {					
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    title: { display: true,	text: 'km vs price'	}
                },
                scales: {						
                    x: { title: { display: true, text: 'km' } },
                    y: { title: { display: true, text: 'price' } }
                }
            }
        });		
})
.catch(err => { console.error("Sactter chart failed: ", err); });