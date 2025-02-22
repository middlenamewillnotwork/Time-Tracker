document.addEventListener("DOMContentLoaded", () => {
    const importButton = document.getElementById("import-button");

    if (!importButton) {
        console.error("❌ Import button not found!");
        return;
    }

    importButton.addEventListener("click", () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".csv";
        fileInput.addEventListener("change", handleFileUpload);
        fileInput.click();
    });

    async function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const csvText = e.target.result;
            const logs = parseCSV(csvText);
            if (logs.length > 0) {
                await saveLogs(logs);
                alert("✅ CSV Imported Successfully!");
                location.reload(); // Refresh to update table
            } else {
                alert("❌ Invalid CSV format!");
            }
        };
        reader.readAsText(file);
    }

    function parseCSV(csvText) {
        const lines = csvText.split("\n").map(line => line.trim()).filter(line => line);
        if (lines.length < 2) return [];

        const headers = lines[0].split(",");
        if (headers.length < 5) {
            console.error("❌ CSV format incorrect. Expected 5 columns.");
            return [];
        }

        const logs = [];
        
        for (let i = 1; i < lines.length; i++) {
            const row = parseCSVRow(lines[i]); // **Fix: Properly handle commas inside quotes**
            if (row.length < 5) continue; // Skip invalid rows
            
            logs.push({
                process: row[0],
                date: row[1],
                inTime: row[2],
                outTime: row[3],
                reason: row[4],  // **Now preserves commas**
                totalTime: calculateTotalTime(row[2], row[3])
            });
        }

        console.log("✅ Parsed CSV Data:", logs);
        return logs;
    }

    function parseCSVRow(row) {
        const values = [];
        let current = "";
        let insideQuotes = false;

        for (let char of row) {
            if (char === '"' && !insideQuotes) {
                insideQuotes = true; // Opening Quote
            } else if (char === '"' && insideQuotes) {
                insideQuotes = false; // Closing Quote
            } else if (char === "," && !insideQuotes) {
                values.push(current.trim());
                current = "";
            } else {
                current += char;
            }
        }

        values.push(current.trim()); // Add the last value
        return values;
    }

    function calculateTotalTime(inTime, outTime) {
        if (!inTime || !outTime) return "00:00";
        const inDate = new Date(`1970-01-01T${inTime}`);
        const outDate = new Date(`1970-01-01T${outTime}`);
        const totalMinutes = Math.abs(outDate - inDate) / (1000 * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
});
