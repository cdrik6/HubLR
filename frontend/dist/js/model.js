let mileageInput, predictBtn, modelP, estimatePre;
let m = 0;
let p = 0;

export async function init()
{
  mileageInput = document.getElementById("mileage");  
  predictBtn = document.getElementById("predict");
  modelP = document.getElementById("model");
  estimatePre = document.getElementById("estimate");
  // mileageInput.addEventListener("change", handleMileage);
  predictBtn.addEventListener("click", handlePredict);  
  const data = await getCoef();
  m = data.m;
  p = data.p;
  modelP.textContent = "estimatePrice(mileage) = " + m + " x mileage + " + p;
}

export function cleanup()
{  
  // mileageInput?.removeEventListener("change", handleMileage);
  predictBtn?.removeEventListener("click", handlePredict);  
  mileageInput = predictBtn = modelP = estimatePre = null;  
  m = p = 0;
}

function handlePredict(event)
{  
  event.preventDefault();  // stop form submission 
  const mileage = Number(mileageInput.value);  
  estimatePre.textContent = "Estimate price = " + (m*mileage + p);  
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