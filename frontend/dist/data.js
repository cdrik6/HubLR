const fileInput = document.getElementById("fileInput");
const fileContent = document.getElementById("fileContent");
const message = document.getElementById("message");
const loadBtn = document.getElementById("LoadBtn");
let rawdata;

fileInput.addEventListener("change", handleFileSelection);
loadBtn.addEventListener("click", handleLoadData);

function handleFileSelection(event)
{
  const file = event.target.files[0];
  fileContent.textContent = "";
  message.textContent = "";
  
  if (!file)  
    return (showMessage("No file selected. Please choose a file.", "error"));

  // Check whether the MIME type begins with "text" ("text/plain" or "text/csv")
  if (!file.type.startsWith("text"))
  {
    // return (showMessage("Unsupported file type. Please select a text/csv file.", "error"));
    showMessage("Unsupported file type. Please select a text/csv file.", "error");
    return;
  } 
  
  const reader = new FileReader();

  reader.onload = () => {
    rawdata = reader.result;    
    fileContent.textContent = rawdata;
    loadBtn.style.display = "inline";    
  };

  reader.onerror = () => {
    showMessage("Error reading the file. Please try again.", "error");
  };

  reader.readAsText(file);
}


async function handleLoadData()
{
  if (!rawdata)
      return;    
  const lines = rawdata.split(/\r?\n/); // split by newline
  if (lines.length === 0)
    return(showMessage("Empty file.", "error"));  

  // Header checking
  const header = lines[0].split(',');
  if (header[0].trim() !== "km" || header[1].trim() !== "price")      
    return(showMessage("Wrong header.", "error"));

  // Lines checking and load if ok    
  for (let i = 1; i < lines.length; i++)
  {
    const line = lines[i].trim();      
    if (!line)
      continue; // skip empty lines

    const rows = line.split(',');
    if (rows.length !== 2)
      continue;
    const km = Number.parseInt(rows[0].trim());
    const price = Number.parseInt(rows[1].trim());
    if (Number.isNaN(km) || Number.isNaN(price))
      continue;
    await loadData(km, price);
  }
  loadBtn.style.display = "none";
}

function showMessage(message, type)
{
  message.textContent = message;
  message.style.color = type === "error" ? "red" : "green";
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
		console.log("Server response:", data);
	}	
	catch (error) {
		console.error("Server error:", error);
	}	
}