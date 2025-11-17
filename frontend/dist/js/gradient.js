let algoBtn;
let algoContainer, canvasAlgo, ctxAlgo;
let algoChart;

export function init()
{  
    algoBtn = document.getElementById("algoBtn");  
    algoBtn.addEventListener("click", startAlgo);

    algoContainer = document.getElementById("algo");
    canvasAlgo = document.createElement("canvas");	
    canvasAlgo.width = 200;
    canvasAlgo.height = 200;
    algoContainer.appendChild(canvasAlgo);
    ctxAlgo = canvasAlgo.getContext("2d");    

    drawAlgo();
}

export function cleanup()
{    
    algoBtn?.removeEventListener("click", startAlgo);
    algoBtn = null;
    algoContainer = canvasAlgo = ctxAlgo = null;    
    algoChart = null;
}

async function startAlgo()
{
    launchAlgo({ start: "start" });
}

async function drawAlgo()
{    
    let datapoints, datagradient, dataline;

    if (!ctxAlgo)
        throw new Error("Cannot get Algo context");
    //
    try {
        const res = await fetch(`/api/data/reg`, { method: 'GET' })
        if (!res.ok) {
            throw new Error(`HTTP error status: ${res.status}`);
        }
        ({ datapoints, dataline } = await res.json());
        console.log(dataline);
    }
    catch (error) {
        console.error("Algo chart failed: ", error);
    }
    // //
    // try {
    //     const res = await fetch(`/api/algo/coef`, { method: 'GET' })
    //     if (!res.ok) {
    //         throw new Error(`HTTP error status: ${res.status}`);
    //     }
    //     dataline = await res.json();
    // }
    // catch (error) {
    //     console.error("Get line failed: ", error);
    // }
    // dataline = [];    

    datagradient = [{ x: 0, y: 0 },{ x: 0, y: 0}];
    
    algoChart = new Chart(ctxAlgo,
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
                        label: 'Gradient Line',
                        type: 'line',
                        data: datagradient,                        
                        borderColor: 'red',
                        borderWidth: 2,
                        pointRadius: 0, // hide points
                        fill: false
                    },
                    {
                        label: 'Regression Line',
                        type: 'line',
                        data: dataline,                        
                        borderColor: 'green',
                        borderWidth: 4,
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
                    title: { display: true,	text: 'To Linear Regression (km vs price)'	}
                },
                scales: {						
                    x: { title: { display: true, text: 'km' } },
                    y: { title: { display: true, text: 'price' } }
                }
            }
        });      
    
}


async function launchAlgo(mode)
{  		
    // WebSocket
    const clt_wskt = new WebSocket(`${location.origin}/api/algo/lines`);
    let ping;

    clt_wskt.addEventListener('open', () => {	
        console.log('Connected to Algo WebSocket\n');
        ping = setInterval( () => {
            clt_wskt.send(JSON.stringify({ pong: "ping" }));
        }, 30000);
        clt_wskt.send(JSON.stringify(mode));	
        // algoChart.data.datasets[2].data = [{ x: 0, y: 0 }, { x: 0, y: 0 }];
        // algoChart.update();
    });

    clt_wskt.addEventListener('error', err => {
        console.error('Error: ' + err + '\n');
    });

    clt_wskt.addEventListener('close', () => {
        clearInterval(ping);
        console.log('Algo WebSocket closed\n');		
        // resolve("Game Over");
    });

    clt_wskt.addEventListener('message', srv_msg => {
        try	{
            const data = JSON.parse(srv_msg.data);
            if ('m' in data && 'p' in data && 'maxX' in data && 'minX' in data)
            {
                console.log("m = " + data.m + " p = " + data.p);                
                algoChart.data.datasets[1].data = [
                    { x: data.minX, y: data.m * data.minX + data.p},
                    { x: data.maxX, y: data.m * data.maxX + data.p}
                ];
                algoChart.update();
            }	            
            else if ('k' in data)            
                console.log("k = " + data.k);            
        }
        catch (err) {
            console.error('Invalid JSON received: ', err);
        }		
    });

}

function drawReg()
{
    // const canvasReg = document.createElement("canvas");	
    // canvasReg.width = 200;
    // canvasReg.height = 200;
    // regContainer.appendChild(canvasReg);
    // const ctxReg = canvasReg.getContext("2d");
    if (!ctxAlgo) throw new Error("Cannot get Algo context");
    fetch(`/api/data/reg`, { method: 'GET' })
    .then(res => {
        if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
        return (res.json());
    })
    .then(function({ datapoints, dataline })
    {	
        regChart = new Chart(ctxAlgo,
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
                            borderColor: 'green',
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
    })
    .catch(err => { console.error("Reg chart failed: ", err); });
}



// Launch algo and draw last reg line with fetch (only one) without ws
// async function runAlgo()
// {       
//     try {    
//         const res = await fetch(`/api/algo/gradient`, { method: 'POST' })        
//         if (!res.ok) {
//             throw new Error(`HTTP error status: ${res.status}`);
//         }
//         const data = await res.json();	
// 		console.log("Gradient response:", data);
//         drawFinal();
//     }
//     catch (error) {
//         console.error("Gradient failed: ", error);
//     }
// }


async function drawFinal()
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
    // //
    // try {
    //     const res = await fetch(`/api/algo/coef`, { method: 'GET' })
    //     if (!res.ok) {
    //         throw new Error(`HTTP error status: ${res.status}`);
    //     }
    //     dataline = await res.json();
    // }
    // catch (error) {
    //     console.error("Get line failed: ", error);
    // }
    // dataline = [];    

    dataline = [{ x: 0, y: 0 },{ x: 0, y: 0}];			
    
    regChart = new Chart(ctxAlgo,
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