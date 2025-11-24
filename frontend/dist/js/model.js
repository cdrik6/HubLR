let mileageInput, predictBtn, modelP, estimatePre, mseP, rmseP, r2P;
let m = 0;
let p = 0;

export async function init()
{
  mileageInput = document.getElementById("mileage");  
  predictBtn = document.getElementById("predict");
  modelP = document.getElementById("model");
  estimatePre = document.getElementById("estimate");
  mseP = document.getElementById("mse");
  rmseP = document.getElementById("rmse");
  r2P = document.getElementById("r2");
  // mileageInput.addEventListener("change", handleMileage);
  predictBtn.addEventListener("click", handlePredict);  
  const data = await getCoef();
  m = data.m;
  p = data.p;
  modelP.textContent = "estimatePrice(mileage) = " + m + " x mileage + " + p;
  const quality = await getQuality();  
  mseP.textContent = "Mean Square Error = " + quality.mse;
  rmseP.textContent = "Square Root MSE = " + quality.rmse;
  r2P.textContent = "Coefficient of Determination (R2) = " + quality.r2;
}

export function cleanup()
{  
  // mileageInput?.removeEventListener("change", handleMileage);
  predictBtn?.removeEventListener("click", handlePredict);  
  mileageInput = predictBtn = modelP = estimatePre = null;  
  mseP = rmseP = r2P = null;
  m = p = 0;
}

function handlePredict(event)
{  
  // event.preventDefault();  // stop form submission 
  const mileage = Number(mileageInput.value);
  if (!Number.isNaN(mileage))
    estimatePre.textContent = "Estimate price = " + (m*mileage + p);
  else 
    estimatePre.textContent = "Mileage is Not A Number";
}

async function getCoef()
{	
	try {
		const res = await fetch(`/api/algo/coef`, {	method: 'GET' })  /*****************SCHEMA TO DO */
		if (!res.ok) {
      throw new Error(`HTTP error status: ${res.status}`);
    }		
		const data = await res.json();	
    // console.log("m = ", data.m);
    // console.log("p = ", data.p);
		// console.log("Server response:", data);
    return(data);
	}	
	catch (error) {
		console.error("Server error:", error);
	}	
}

async function getQuality()
{	
	try {
		const res = await fetch(`/api/algo/quality`, { method: 'GET' })  /*****************SCHEMA TO DO */
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