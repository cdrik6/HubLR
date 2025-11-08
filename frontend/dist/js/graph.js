let scatterContainer, regContainer, barContainer;
let canvasScatter, ctxScatter;
let canvasReg, ctxReg;
let canvasBar, ctxBar;

export function init()
{
    scatterContainer = document.getElementById("scatter");
    regContainer = document.getElementById("reg");
    barContainer = document.getElementById("bar");

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

    canvasBar = document.createElement("canvas");	
    canvasBar.width = 200;
    canvasBar.height = 200;
    barContainer.appendChild(canvasBar);
    ctxBar = canvasBar.getContext("2d");

    drawScatter();
    drawReg();
    drawBar();
}

export function cleanup()
{
    if (canvasScatter?.parentNode) canvasScatter.remove();
    if (canvasReg?.parentNode) canvasReg.remove();
    scatterContainer = regContainer = null;
    canvasScatter = ctxScatter = null;
    canvasReg = ctxReg = null;
}

function drawScatter()
{
    // const canvasScatter = document.createElement("canvas");	
    // canvasScatter.width = 200;
    // canvasScatter.height = 200;
    // scatterContainer.appendChild(canvasScatter);		
    // const ctxScatter = canvasScatter.getContext("2d");
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
    // const canvasReg = document.createElement("canvas");	
    // canvasReg.width = 200;
    // canvasReg.height = 200;
    // regContainer.appendChild(canvasReg);
    // const ctxReg = canvasReg.getContext("2d");
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
}


// Bar
function drawBar()
{	
	if (!ctxBar) throw new Error("Cannot get bar canvas context");
	fetch(`/api/data/bar`, { method: 'GET' })
	.then(res => {
		if (!res.ok) { throw new Error(`HTTP error status: ${res.status}`); }
		return (res.json());
	})
	.then(function(data)
	{	
		new Chart(ctxBar,
			{
				type: 'bar',
				data: {					
                    labels: ['0–1000', '1000–2000', '2000–3000'],
					datasets: [	{ label: 'Km', data: data.km } ]
				},
				options: {
					// indexAxis: 'y', // horizontal bars
					responsive: true,
					maintainAspectRatio: true,
					plugins: {
						legend: { position: 'bottom' },
						title: { display: true,	text: 'Km data'	}
					},
					scales: {						
						x: { stacked: true }						
					}
				}
			});		
  	})
	.catch(err => { console.error("Bar chart failed: ", err); });
}