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

const fileInput = document.getElementById("file-input");
const fileContentDisplay = document.getElementById("file-content");
const messageDisplay = document.getElementById("message");

fileInput.addEventListener("change", handleFileSelection);

function handleFileSelection(event) {
  const file = event.target.files[0];
  fileContentDisplay.textContent = ""; // Clear previous file content
  messageDisplay.textContent = ""; // Clear previous messages

  // Validate file existence and type
  if (!file) {
    showMessage("No file selected. Please choose a file.", "error");
    return;
  }

  if (!file.type.startsWith("text")) {
    showMessage("Unsupported file type. Please select a text file.", "error");
    return;
  }

  // Read the file
  const reader = new FileReader();
  reader.onload = () => {
    fileContentDisplay.textContent = reader.result;
    fileContentDisplay.textContent += "toto";
  };
  reader.onerror = () => {
    showMessage("Error reading the file. Please try again.", "error");
  };
  reader.readAsText(file);
}

// Displays a message to the user
function showMessage(message, type) {
  messageDisplay.textContent = message;
  messageDisplay.style.color = type === "error" ? "red" : "green";
}