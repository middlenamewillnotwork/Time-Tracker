document.addEventListener('DOMContentLoaded', async () => {
    const timeLogsTable = document.querySelector('#time-logs tbody');
    const filterDate = document.getElementById('filter-date');
    const filterMonth = document.getElementById('filter-month');
    const filterYear = document.getElementById('filter-year');
    const filterProcess = document.getElementById('filter-process');

    if (!timeLogsTable || !filterYear) {
        console.error("❌ Elements not found in Home Page (index.html).");
        return;
    }

    let logs = await loadLogs();
    populateYearFilter(logs);
    renderLogs(logs);

    // **Apply filters automatically when a selection is changed**
    filterDate.addEventListener('change', () => renderLogs(applyFilters(logs)));
    filterMonth.addEventListener('change', () => renderLogs(applyFilters(logs)));
    filterYear.addEventListener('change', () => renderLogs(applyFilters(logs)));
    filterProcess.addEventListener('change', () => renderLogs(applyFilters(logs)));

    function applyFilters(logs) {
        const dateValue = filterDate.value;
        const monthValue = filterMonth.value;
        const yearValue = filterYear.value;
        const processValue = filterProcess.value;

        return logs.filter(log => {
            const [year, month, day] = log.date.split("-");
            return (!dateValue || log.date === dateValue) &&
                   (!monthValue || month === monthValue) &&
                   (!yearValue || year === yearValue) &&
                   (!processValue || log.process === processValue);
        });
    }

    function renderLogs(logs) {
        timeLogsTable.innerHTML = logs.length 
            ? logs.sort(sortByDateAndTime).map((log, index) => `
                <tr>
                    <td>
                        <button class="edit-button" data-index="${index}">Edit</button>
                        <button class="delete-button" data-index="${index}">Delete</button>
                    </td>
                    <td>${log.process}</td>
                    <td>${log.date}</td>
                    <td>${log.inTime}</td>
                    <td>${log.outTime}</td>
                    <td>${log.reason}</td>
                    <td>${log.totalTime}</td>
                </tr>`).join('')
            : "<tr><td colspan='7'>No logs found.</td></tr>";
    }

    function sortByDateAndTime(a, b) {
        // **Sort by Date (Newest First)**
        const dateA = new Date(a.date.split("-").reverse().join("-"));
        const dateB = new Date(b.date.split("-").reverse().join("-"));
        if (dateA < dateB) return 1;
        if (dateA > dateB) return -1;

        // **If same date, sort by In Time (Latest First)**
        const timeA = a.inTime.split(":").map(Number);
        const timeB = b.inTime.split(":").map(Number);
        const totalMinutesA = timeA[0] * 60 + timeA[1];
        const totalMinutesB = timeB[0] * 60 + timeB[1];

        return totalMinutesB - totalMinutesA; // Largest to Smallest
    }

    function populateYearFilter(logs) {
        const yearFilter = document.getElementById('filter-year');
        if (!yearFilter) {
            console.error("❌ Year filter element not found.");
            return;
        }
    
        // **Ensure Year is Extracted Correctly from DD-MM-YYYY**
        const availableYears = [...new Set(logs.map(log => {
            const parts = log.date.split("-"); 
            if (parts.length === 3) {
                return parts[2].trim(); // Extracting the YYYY part correctly
            }
            return "";
        }))].filter(year => year.match(/^\d{4}$/)).sort().reverse(); // Ensure only valid 4-digit years are kept
    
        // **Update Year Filter Options**
        yearFilter.innerHTML = '<option value="">Select Year</option>';
        availableYears.forEach(year => {
            yearFilter.innerHTML += `<option value="${year}">${year}</option>`;
        });
    
        console.log("✅ Home Page Year Filter Updated:", availableYears);
    }
    });
