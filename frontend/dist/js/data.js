let fileInput, fileContent, fileMessage, loadMessage, loadBtn, clearMessage, clearBtn;
let rawdata;

export function init()
{
  fileInput = document.getElementById("fileInput");
  fileContent = document.getElementById("fileContent");
  fileMessage = document.getElementById("fileMessage");
  loadMessage = document.getElementById("loadMessage");
  loadBtn = document.getElementById("loadBtn");
  clearMessage = document.getElementById("clearMessage");
  clearBtn = document.getElementById("clearBtn");   
  fileInput.addEventListener("change", handleFileSelection);
  loadBtn.addEventListener("click", handleLoadData);
  clearBtn.addEventListener("click", handleClearData);
}

export function cleanup()
{  
  fileInput?.removeEventListener("change", handleFileSelection);
  loadBtn?.removeEventListener("click", handleLoadData);
  clearBtn?.removeEventListener("click", handleClearData);
  fileInput = fileContent = fileMessage = loadMessage = loadBtn = clearMessage = clearBtn = null;
  rawdata = null;
}

function handleFileSelection(event)
{
  const file = event.target.files[0];
  fileContent.textContent = "";
  fileMessage.textContent = "";
  loadMessage.textContent = "";
  
  if (!file)  
    return(showMessage("No file selected. Please choose a file.", "file"));
  // Check whether the MIME type begins with "text" ("text/plain" or "text/csv")
  if (!file.type.startsWith("text"))  
    return(showMessage("Unsupported file type. Please select a text/csv file.", "file"));   
  
  const reader = new FileReader();

  reader.onload = () => {
    rawdata = reader.result;    
    fileContent.textContent = rawdata;
    // loadBtn.style.display = "inline";    
  };

  reader.onerror = () => {
    showMessage("Error reading the file. Please try again.", "file");
  };

  reader.readAsText(file);
}

async function handleLoadData()
{
  if (!rawdata)
    return(showMessage("No data.", "load"));  
  
  const lines = rawdata.split(/\r?\n/); // split by newline  
  if (lines.length === 0)
    return(showMessage("Empty file.", "load"));  

  // Header checking
  const header = lines[0].split(',');
  if (header[0].trim() !== "km" || header[1].trim() !== "price")      
    return(showMessage("Wrong header: " + header, "load"));

  // Lines checking and load if ok    
  for (let i = 1; i < lines.length; i++)
  {
    const line = lines[i].trim();      
    if (!line) {
      showMessage("Empty line.", "load")
      continue; // skip empty lines
    }

    const rows = line.split(',');
    if (rows.length !== 2) {
      showMessage("Wrong data: " + rows, "load")
      continue;
    }

    const km = Number.parseInt(rows[0].trim());
    const price = Number.parseInt(rows[1].trim());
    if (Number.isNaN(km) || Number.isNaN(price)) {
      showMessage("Not a Number: " + rows, "load")
      continue;
    }
    await loadData(km, price);    
  }

  showMessage("Data loaded.", "load");
  rawdata = null;
}

async function handleClearData()
{  
  await clearData();
  showMessage("Data deleted.", "clear");
  rawdata = null;
}

function showMessage(message, step)
{
  if (step === "file")
    fileMessage.textContent = message;
  if (step === "load")
    loadMessage.textContent += message + "\n";
  if (step === "clear")
    clearMessage.textContent = message;
}

async function loadData(km, price)
{	
	try {
		const res = await fetch(`/api/data/insert`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json; charset=UTF-8'},
				body: JSON.stringify({ km: km, price: price })
			})		
		if (!res.ok) {
      throw new Error(`HTTP error status: ${res.status}`);
    }		
		const data = await res.json();	
		// console.log("Server response:", data);
	}	
	catch (error) {
		console.error("Server error:", error);
	}	
}

async function clearData(km, price)
{	
	try {
		const res = await fetch(`/api/data/clear`, { method: 'DELETE' })
		if (!res.ok) {
      throw new Error(`HTTP error status: ${res.status}`);
    }		
		const data = await res.json();	
		// console.log("Server response:", data);
	}	
	catch (error) {
		console.error("Server error:", error);
	}	
}