const scatterContainer = document.getElementById("scatter");
const regContainer = document.getElementById("reg");

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
.catch(err => { console.error("Scatter chart failed: ", err); });

// reg
const canvasReg = document.createElement("canvas");	
canvasReg.width = 200;
canvasReg.height = 200;
regContainer.appendChild(canvasReg);
const ctxReg = canvasReg.getContext("2d");
if (!ctxReg) throw new Error("Cannot get Reg canvas context");
fetch(`/api/data/reg`, { method: 'GET' })
.then(res => {
    if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
    return (res.json());
})
.then(function({ datapoints, dataline })
{	
    new Chart(ctxReg,
        {
            type: 'scatter',
            data: {					
                datasets: [
                    { 
                        label: 'km vs price',                        
                        data: datapoints                        
                    },
                    {
                        label: 'Regression Line',
                        type: 'line',
                        data: dataline,                        
                        borderColor: 'red',
                        borderWidth: 2,
                        pointRadius: 0, // hide points
                        fill: false
                    }
                ]
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
.catch(err => { console.error("Reg chart failed: ", err); });