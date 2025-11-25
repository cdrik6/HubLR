let scatterContainer, regContainer, barkmContainer, barpriceContainer, normContainer;
let canvasScatter, ctxScatter;
let canvasReg, ctxReg;
let canvasBarkm, ctxBarkm;
let canvasBarprice, ctxBarprice;
let canvasNorm, ctxNorm;
let modelP, mseP, rmseP, r2P;

export async function init()
{
    scatterContainer = document.getElementById("scatter");
    regContainer = document.getElementById("reg");
    barkmContainer = document.getElementById("barkm");
    barpriceContainer = document.getElementById("barprice");
    normContainer = document.getElementById("norm");

    canvasScatter = document.createElement("canvas");
    canvasScatter.width = 200;
    canvasScatter.height = 200;
    scatterContainer.appendChild(canvasScatter);
    ctxScatter = canvasScatter.getContext("2d");

    canvasReg = document.createElement("canvas");	
    canvasReg.width = 200;
    canvasReg.height = 200;
    regContainer.appendChild(canvasReg);
    ctxReg = canvasReg.getContext("2d");

    canvasBarkm = document.createElement("canvas");	
    canvasBarkm.width = 200;
    canvasBarkm.height = 200;
    barkmContainer.appendChild(canvasBarkm);
    ctxBarkm = canvasBarkm.getContext("2d");

    canvasBarprice = document.createElement("canvas");	
    canvasBarprice.width = 200;
    canvasBarprice.height = 200;
    barpriceContainer.appendChild(canvasBarprice);
    ctxBarprice = canvasBarprice.getContext("2d");

    canvasNorm = document.createElement("canvas");	
    canvasNorm.width = 200;
    canvasNorm.height = 200;
    normContainer.appendChild(canvasNorm);
    ctxNorm = canvasNorm.getContext("2d");

    drawScatter();
    drawReg();
    drawBarkm();
    drawBarprice();
    drawNorm();

    modelP = document.getElementById("model");  
    mseP = document.getElementById("mse");
    rmseP = document.getElementById("rmse");
    r2P = document.getElementById("r2");
    
    const quality = await getQuality();  
    modelP.textContent = "estimatePrice(mileage) = " + quality.m + " x mileage + " + quality.p;
    mseP.textContent = "Mean Square Error = " + Math.round(quality.mse);
    rmseP.textContent = "Square Root MSE = " + Math.round(quality.rmse);
    r2P.textContent = "Coefficient of Determination (R2) = " + (100 * quality.r2).toFixed(1) + "%";
}

export function cleanup()
{
    if (canvasScatter?.parentNode) canvasScatter.remove();
    if (canvasReg?.parentNode) canvasReg.remove();
    scatterContainer = regContainer = null;
    canvasScatter = ctxScatter = null;
    canvasReg = ctxReg = null;
    modelP = mseP = rmseP = r2P = null;
}

function drawScatter()
{    
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
                    datasets: [
                        {
                            label: 'km vs price',
                            data: data,
                            backgroundColor: 'rgb(54, 162, 235)'
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
    .catch(err => { console.error("Scatter chart failed: ", err); });
}


function drawReg()
{    
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


// Bar km
function drawBarkm()
{	
	if (!ctxBarkm) throw new Error("Cannot get bar km canvas context");
	fetch(`/api/data/barkm`, { method: 'GET' })
	.then(res => {
		if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
		return (res.json());
	})
	.then(function(data)
	{	
		new Chart(ctxBarkm,
			{
				type: 'bar',
				data: {					
                    labels: data.map(x => x.label),
					datasets: [{
                        label: "Number of cars",
                        data: data.map(x => x.nb)
                    }]
				},
				options: {					
					responsive: true,
					maintainAspectRatio: true,
					plugins: {
						legend: { position: 'bottom' },
						title: { display: true,	text: 'km data'	}
					},
					scales: {
                        x: { title: { display: true, text: 'km range' } },
                        y: { title: { display: true, text: 'count' } }
					}
				}
			});		
  	})
	.catch(err => { console.error("Bar km chart failed: ", err); });
}


// Bar price
function drawBarprice()
{	
	if (!ctxBarprice) throw new Error("Cannot get bar km canvas context");
	fetch(`/api/data/barprice`, { method: 'GET' })
	.then(res => {
		if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
		return (res.json());
	})
	.then(function(data)
	{	
		new Chart(ctxBarprice,
			{
				type: 'bar',
				data: {					
                    labels: data.map(x => x.label),
					datasets: [{
                        label: "Number of cars",
                        data: data.map(x => x.nb)
                    }]
				},
				options: {					
					responsive: true,
					maintainAspectRatio: true,
					plugins: {
						legend: { position: 'bottom' },
						title: { display: true,	text: 'price data'	}
					},
					scales: {
                        x: { title: { display: true, text: 'price range' } },
                        y: { title: { display: true, text: 'count' } }
					}
				}
			});		
  	})
	.catch(err => { console.error("Bar price chart failed: ", err); });
}


// Normalized
function drawNorm()
{    
    if (!ctxNorm) throw new Error("Cannot get naormlized Scatter canvas context");
    fetch(`/api/data/norm`, { method: 'GET' })
    .then(res => {
        if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
        return (res.json());
    })
    .then(function(data)
    {	
        // console.log("Normalized data:", data);
        new Chart(ctxNorm,
            {
                type: 'scatter',
                data: {					
                    datasets: [
                        {
                            label: 'km vs price',
                            data: data,
                            backgroundColor: 'rgb(54, 162, 235)'
                        }
                    ]
                },
                options: {					
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { display: false },
                        title: { display: true,	text: 'km vs price normalized'	}
                    },
                    scales: {						
                        x: { title: { display: true, text: 'km' } },
                        y: { title: { display: true, text: 'price' } }
                    }
                }
            });		
    })
    .catch(err => { console.error("Normalized Scatter chart failed: ", err); });
}

// { m: m, p: p, mse: MSE, rmse: RMSE, r2: R2}
async function getQuality()
{	
	try {
		const res = await fetch(`/api/data/quality`, { method: 'GET' })
		if (!res.ok) {
            throw new Error(`HTTP error status: ${res.status}`);
        }		
		const data = await res.json();
        return(data);
	}	
	catch (error) {
		console.error("Server error:", error);
	}	
}