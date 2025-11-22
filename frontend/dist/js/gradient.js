let algoBtn;
let algoContainer, canvasAlgo, ctxAlgo;
let algoChart; algoMessage;
let stepContainer, canvasStep, ctxStep;
let stepChart;
// let mContainer, canvasM, ctxM;
// let pContainer, canvasP, ctxP;
// let mChart, pChart;
let clt_wskt = null;
let ping = null;

export function init()
{  
    set_wskt();

    algoBtn = document.getElementById("algoBtn");  
    algoBtn.addEventListener("click", launchAlgo);

    algoContainer = document.getElementById("algo");
    canvasAlgo = document.createElement("canvas");	
    canvasAlgo.width = 200;
    canvasAlgo.height = 200;
    algoContainer.appendChild(canvasAlgo);
    ctxAlgo = canvasAlgo.getContext("2d");
    drawAlgo();
    algoMessage = document.getElementById("algoMessage");


    // mContainer = document.getElementById("mCoef");
    // canvasM = document.createElement("canvas");	
    // canvasM.width = 200;
    // canvasM.height = 200;
    // mContainer.appendChild(canvasM);
    // ctxM = canvasM.getContext("2d");

    // pContainer = document.getElementById("pCoef");
    // canvasP = document.createElement("canvas");	
    // canvasP.width = 200;
    // canvasP.height = 200;
    // pContainer.appendChild(canvasP);
    // ctxP = canvasP.getContext("2d");

    stepContainer = document.getElementById("step");
    canvasStep = document.createElement("canvas");	
    canvasStep.width = 200;
    canvasStep.height = 200;
    stepContainer.appendChild(canvasStep);
    ctxStep = canvasStep.getContext("2d");
    drawStep();
}

export function cleanup()
{    
    algoBtn?.removeEventListener("click", launchAlgo);
    algoBtn = null;
    //
    algoContainer = canvasAlgo = ctxAlgo = null;    
    algoChart?.destroy();
    algoChart = algoMessage = null;
    //
    stepContainer = canvasStep = ctxStep = null;    
    stepChart?.destroy();
    stepChart = null;    
    //
    if (clt_wskt && clt_wskt.readyState === WebSocket.OPEN)				
		clt_wskt.close(1000, "Cleaning");
    clt_wskt = null;
    clearInterval(ping);
    ping = null;
}

async function drawAlgo()
{    
    let datapoints, datagradient, dataline;

    if (!ctxAlgo)
        throw new Error("Cannot get Algo context");
    try {
        const res = await fetch(`/api/data/reg`, { method: 'GET' })
        if (!res.ok) {
            throw new Error(`HTTP error status: ${res.status}`);
        }
        ({ datapoints, dataline } = await res.json());
        // console.log(dataline);
    }
    catch (error) {
        console.error("Algo chart failed: ", error);
    }
    datagradient = [{ x: 0, y: 0 }, { x: 0, y: 0}];
    
    if (algoChart)
        algoChart.destroy();

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
                        pointRadius: 0,
                        fill: false
                    },
                    {
                        label: 'Regression Line',
                        type: 'line',
                        data: dataline,                        
                        borderColor: 'green',
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {					
                animation: false,
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    title: { display: true,	text: 'To Linear Regression (km vs price)'	}
                },
                scales: {						
                    x: { title: { display: true, text: 'km' }, min: 0 },
                    y: { title: { display: true, text: 'price' }, min: 0 }
                }
            }
        });    
}

function launchAlgo()
{
    // algoBtn.style.display = 'none';
    // algoBtn?.removeEventListener("click", launchAlgo);
    // algoBtn = null;
    algoMessage.textContent = "Running..."
    clt_wskt.send(JSON.stringify({ start: "start" }));    
}

// WebSocket
function set_wskt()
{    
    clt_wskt = new WebSocket(`${location.origin}/api/algo/lines`);    

    clt_wskt.addEventListener('open', () => {	
        console.log('Connected to Algo WebSocket\n');
        ping = setInterval(() => { clt_wskt.send(JSON.stringify({ pong: "ping" })); }, 30000);        
    });

    clt_wskt.addEventListener('error', err => {
        console.error('Error: ' + err + '\n');
    });

    clt_wskt.addEventListener('close', () => {
        clearInterval(ping);
        console.log('Algo WebSocket closed\n');		        
    });

    clt_wskt.addEventListener('message', srv_msg => {
        try	{            
            const data = JSON.parse(srv_msg.data);            
            if ('m' in data && 'p' in data && 'maxX' in data && 'minX' in data)
            {                
                // console.log("m = " + data.m + " p = " + data.p);                
                algoChart.data.datasets[1].data = [
                    { x: data.minX, y: data.rawM * data.minX + data.rawP},
                    { x: data.maxX, y: data.rawM * data.maxX + data.rawP}
                ];
                algoChart.update();
                stepChart.data.datasets[0].data.push({ x: data.m, y: data.p });
                stepChart.update();
            }	            
            else if ('k' in data && 'rawM' in data && 'rawP' in data && 'stop' in data)
            {                
                console.log("k = " + data.k);
                if (data.stop === true)                
                    algoMessage.textContent = "Limit reached!\nm = " + data.rawM + " p = " + data.rawP;                
                else                
                    algoMessage.textContent = "Done!\nm = " + data.rawM + " p = " + data.rawP;                
            }
            else if ('isRunning' in data)
            {
                console.log("k = running");
                algoMessage.textContent = "Wait please, gradient in progress";
                // algoBtn = document.getElementById("algoBtn");  
                // algoBtn.addEventListener("click", launchAlgo);
            }    

        }
        catch (err) {
            console.error('Invalid JSON received: ', err);
        }		
    });
}

async function drawStep()
{   
    let datastep;

    if (!ctxStep)
        throw new Error("Can not get Step context");    
    datastep = [{ x: 0, y: 0 }];
    
    if (stepChart)
        stepChart.destroy();

    stepChart = new Chart(ctxStep,
        {
            type: 'scatter',
            data: {					
                datasets: [
                    {
                        label: ' (m, p)',
                        data: datastep,
                        backgroundColor: 'red'
                    }                    
                ]
            },
            options: {
                animation: false,					
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    title: { display: true,	text: 'Steps to minimize MSE'	}
                },
                scales: {						
                    x: { title: { display: true, text: 'm' } },
                    y: { title: { display: true, text: 'p' }, min: 0, max: 1 }
                }
            }
        });
}

// async function drawM()
// {    
    

//     if (!ctxM)
//         throw new Error("Can not get M context");
//     try {
//         const res = await fetch(`/api/algo/mss`, { method: 'GET' })
//         if (!res.ok) {
//             throw new Error(`HTTP error status: ${res.status}`);
//         }
//         // ({ datapoints, dataline } = await res.json());
//         // console.log(dataline);
//     }
//     catch (error) {
//         console.error("M chart failed: ", error);
//     }

// } 

// function drawReg()
// {
//     // const canvasReg = document.createElement("canvas");	
//     // canvasReg.width = 200;
//     // canvasReg.height = 200;
//     // regContainer.appendChild(canvasReg);
//     // const ctxReg = canvasReg.getContext("2d");
//     if (!ctxAlgo) throw new Error("Cannot get Algo context");
//     fetch(`/api/data/reg`, { method: 'GET' })
//     .then(res => {
//         if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
//         return (res.json());
//     })
//     .then(function({ datapoints, dataline })
//     {	
//         regChart = new Chart(ctxAlgo,
//             {
//                 type: 'scatter',
//                 data: {					
//                     datasets: [
//                         {
//                             label: 'km vs price',                        
//                             data: datapoints,
//                             backgroundColor: 'rgb(54, 162, 235)'
//                         },
//                         {
//                             label: 'Regression Line',
//                             type: 'line',
//                             data: dataline,                        
//                             borderColor: 'green',
//                             borderWidth: 2,
//                             pointRadius: 0, // hide points
//                             fill: false
//                         }
//                     ]
//                 },
//                 options: {					
//                     responsive: true,
//                     maintainAspectRatio: true,
//                     plugins: {
//                         legend: { display: false },
//                         title: { display: true,	text: 'Linear Regression (km vs price)'	}
//                     },
//                     scales: {						
//                         x: { title: { display: true, text: 'km' } },
//                         y: { title: { display: true, text: 'price' } }
//                     }
//                 }
//             });		
//     })
//     .catch(err => { console.error("Reg chart failed: ", err); });
// }


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


// async function drawFinal()
// {    
//     let datapoints, dataline;

//     if (!ctxAlgo)
//         throw new Error("Cannot get Algo canvas context");
//     //
//     try {
//         const res = await fetch(`/api/data/scatter`, { method: 'GET' })
//         if (!res.ok) {
//             throw new Error(`HTTP error status: ${res.status}`);
//         }
//         datapoints = await res.json();
//     }
//     catch (error) {
//         console.error("Algo scatter chart failed: ", error);
//     }
//     // //
//     // try {
//     //     const res = await fetch(`/api/algo/coef`, { method: 'GET' })
//     //     if (!res.ok) {
//     //         throw new Error(`HTTP error status: ${res.status}`);
//     //     }
//     //     dataline = await res.json();
//     // }
//     // catch (error) {
//     //     console.error("Get line failed: ", error);
//     // }
//     // dataline = [];    

//     dataline = [{ x: 0, y: 0 },{ x: 0, y: 0}];			
    
//     regChart = new Chart(ctxAlgo,
//         {
//             type: 'scatter',
//             data: {					
//                 datasets: [
//                     {
//                         label: 'km vs price',                        
//                         data: datapoints,
//                         backgroundColor: 'rgb(54, 162, 235)'
//                     },
//                     {
//                         label: 'Regression Line',
//                         type: 'line',
//                         data: dataline,                        
//                         borderColor: 'red',
//                         borderWidth: 2,
//                         pointRadius: 0, // hide points
//                         fill: false
//                     }
//                 ]
//             },
//             options: {					
//                 responsive: true,
//                 maintainAspectRatio: true,
//                 plugins: {
//                     legend: { display: false },
//                     title: { display: true,	text: 'Linear Regression (km vs price)'	}
//                 },
//                 scales: {						
//                     x: { title: { display: true, text: 'km' } },
//                     y: { title: { display: true, text: 'price' } }
//                 }
//             }
//         });      
    
// }