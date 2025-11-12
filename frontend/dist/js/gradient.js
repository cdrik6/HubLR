let algoBtn;
let algoContainer, canvasAlgo, ctxAlgo;

export function init()
{  
    algoBtn = document.getElementById("algoBtn");  
    algoBtn.addEventListener("click", runAlgo);

    algoContainer = document.getElementById("algo");
    canvasAlgo = document.createElement("canvas");	
    canvasAlgo.width = 200;
    canvasAlgo.height = 200;
    algoContainer.appendChild(canvasAlgo);
    ctxAlgo = canvasAlgo.getContext("2d");

    // drawAlgo();
}

export function cleanup()
{    
    algoBtn?.removeEventListener("click", runAlgo);
    algoBtn = null;
    algoContainer = canvasAlgo = ctxAlgo = null;    
}

async function runAlgo()
{       
    try {    
        const res = await fetch(`/api/algo/gradient`, { method: 'POST' })        
        if (!res.ok) {
            throw new Error(`HTTP error status: ${res.status}`);
        }
        const data = await res.json();	
		console.log("Gradient response:", data);
        drawAlgo();
    }
    catch (error) {
        console.error("Gradient failed: ", error);
    }
}

async function drawAlgo()
{    
    let datapoints, dataline;

    if (!ctxAlgo)
        throw new Error("Cannot get Algo canvas context");
    //
    try {
        const res = await fetch(`/api/data/scatter`, { method: 'GET' })
        if (!res.ok) {
            throw new Error(`HTTP error status: ${res.status}`);
        }
        datapoints = await res.json();
    }
    catch (error) {
        console.error("Algo scatter chart failed: ", error);
    }
    //
    try {
        const res = await fetch(`/api/algo/coef`, { method: 'GET' })
        if (!res.ok) {
            throw new Error(`HTTP error status: ${res.status}`);
        }
        dataline = await res.json();
    }
    catch (error) {
        console.error("Get line failed: ", error);
    }
    // dataline = [];    
    
    new Chart(ctxAlgo,
        {
            type: 'scatter',
            data: {					
                datasets: [
                    {
                        label: 'km vs price',                        
                        data: datapoints,
                        backgroundColor: 'rgb(54, 162, 235)'
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
                    title: { display: true,	text: 'Linear Regression (km vs price)'	}
                },
                scales: {						
                    x: { title: { display: true, text: 'km' } },
                    y: { title: { display: true, text: 'price' } }
                }
            }
        });  
    
    
}