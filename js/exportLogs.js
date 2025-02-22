document.addEventListener('DOMContentLoaded', async () => {
    const exportButton = document.getElementById('export-button');

    exportButton.addEventListener('click', async () => {
        const logs = await loadLogs();
        if (logs.length === 0) {
            alert("No logs available to export.");
            return;
        }

        const csvContent = generateCSV(logs);
        downloadCSV(csvContent);
    });

    function generateCSV(logs) {
        const headers = ["Process", "Date", "In Time", "Out Time", "Reason", "Total Time"];
        const rows = logs.map(log => [
            log.process,
            formatDate(log.date),
            log.inTime,
            log.outTime,
            log.reason,
            log.totalTime
        ]);

        const csvArray = [headers, ...rows];
        return csvArray.map(row => row.join(",")).join("\n");
    }

    function formatDate(dateStr) {
        const parts = dateStr.split("-");
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert YYYY-MM-DD to DD-MM-YYYY
        }
        return dateStr; // Return as is if format is incorrect
    }

    function downloadCSV(csvContent) {
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `time_logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});
