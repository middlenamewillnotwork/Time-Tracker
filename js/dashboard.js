document.addEventListener('DOMContentLoaded', async () => {
    console.log("✅ Dashboard script loaded!"); 

    const monthFilter = document.getElementById('month-filter');
    const yearFilter = document.getElementById('year-filter');
    const processFilter = document.getElementById('process-filter');
    const pivotTable = document.getElementById('pivot-table');

    if (!monthFilter || !yearFilter || !processFilter || !pivotTable) {
        console.error("❌ Dashboard elements not found. Ensure HTML structure is correct.");
        return;
    }

    let logs = await loadLogs();
    if (!logs.length) {
        console.warn("⚠️ No logs available.");
    } else {
        console.log("✅ Logs loaded:", logs);
    }

    populateYearFilter(logs);
    renderPivotTable(logs);

    // **Apply filters automatically**
    monthFilter.addEventListener('change', () => renderPivotTable(applyFilters(logs)));
    yearFilter.addEventListener('change', () => renderPivotTable(applyFilters(logs)));
    processFilter.addEventListener('change', () => renderPivotTable(applyFilters(logs)));

    function applyFilters(logs) {
        const selectedMonth = monthFilter.value;
        const selectedYear = yearFilter.value;
        const selectedProcess = processFilter.value;

        return logs.filter(log => {
            const [year, month] = log.date.split("-");
            return (!selectedMonth || month === selectedMonth) &&
                   (!selectedYear || year === selectedYear) &&
                   (!selectedProcess || log.process === selectedProcess);
        });
    }

    function renderPivotTable(logs) {
        if (!logs.length) {
            pivotTable.innerHTML = "<tr><td colspan='6'>No data available</td></tr>";
            return;
        }

        const uniqueProcesses = [...new Set(logs.map(log => log.process))].sort();
        
        // **Regenerate Table Headers Dynamically**
        pivotTable.innerHTML = `
            <thead>
                <tr>
                    <th>Date</th>
                    <th>First Login</th>
                    <th>Last Logout</th>
                    ${uniqueProcesses.map(process => `<th>${process}</th>`).join("")}
                    <th>Total Time Spent</th>
                </tr>
            </thead>
            <tbody id="pivot-table-body"></tbody>
        `;

        const pivotTableBody = document.getElementById('pivot-table-body'); // Fix: Correctly selecting table body

        const groupedLogs = logs.reduce((acc, log) => {
            if (!acc[log.date]) acc[log.date] = [];
            acc[log.date].push(log);
            return acc;
        }, {});

        let totalMinutesSpent = 0;
        let firstLoginTimes = [];
        let lastLogoutTimes = [];
        let processWiseTotals = {};

        Object.entries(groupedLogs).forEach(([date, logsForDate]) => {
            const firstLogin = logsForDate.reduce((earliest, log) => 
                log.inTime < earliest ? log.inTime : earliest, logsForDate[0].inTime);

            const lastLogout = logsForDate.reduce((latest, log) => 
                log.outTime > latest ? log.outTime : latest, logsForDate[0].outTime);

            firstLoginTimes.push(firstLogin);
            lastLogoutTimes.push(lastLogout);

            let totalMinutes = 0;
            let processWiseMinutes = {};

            logsForDate.forEach(log => {
                const [hours, minutes] = log.totalTime.split(":").map(Number);
                const timeInMinutes = hours * 60 + minutes;
                totalMinutes += timeInMinutes;

                if (!processWiseMinutes[log.process]) {
                    processWiseMinutes[log.process] = 0;
                }
                processWiseMinutes[log.process] += timeInMinutes;

                if (!processWiseTotals[log.process]) {
                    processWiseTotals[log.process] = 0;
                }
                processWiseTotals[log.process] += timeInMinutes;
            });

            totalMinutesSpent += totalMinutes;

            const totalHours = Math.floor(totalMinutes / 60);
            const totalMins = totalMinutes % 60;
            const totalTime = `${totalHours}:${totalMins.toString().padStart(2, '0')}`;

            const processTimeCells = uniqueProcesses.map(process => {
                if (processWiseMinutes[process]) {
                    const hours = Math.floor(processWiseMinutes[process] / 60);
                    const mins = processWiseMinutes[process] % 60;
                    return `<td>${hours}:${mins.toString().padStart(2, '0')}</td>`;
                }
                return "<td>00:00</td>";
            }).join("");

            pivotTableBody.innerHTML += `
                <tr>
                    <td>${formatDate(date)}</td>
                    <td>${firstLogin}</td>
                    <td>${lastLogout}</td>
                    ${processTimeCells}
                    <td>${totalTime}</td>
                </tr>`;
        });

        // **Calculate Grand Totals**
        const avgFirstLogin = calculateAverageTime(firstLoginTimes);
        const avgLastLogout = calculateAverageTime(lastLogoutTimes);
        const grandTotalHours = Math.floor(totalMinutesSpent / 60);
        const grandTotalMins = totalMinutesSpent % 60;
        const grandTotalTime = `${grandTotalHours}:${grandTotalMins.toString().padStart(2, '0')}`;

        const grandTotalProcessTimeCells = uniqueProcesses.map(process => {
            if (processWiseTotals[process]) {
                const hours = Math.floor(processWiseTotals[process] / 60);
                const mins = processWiseTotals[process] % 60;
                return `<td>${hours}:${mins.toString().padStart(2, '0')}</td>`;
            }
            return "<td>00:00</td>";
        }).join("");

        // **Append Grand Total Row**
        pivotTableBody.innerHTML += `
            <tr style="font-weight: bold;">
                <td>Grand Total</td>
                <td>${avgFirstLogin}</td>
                <td>${avgLastLogout}</td>
                ${grandTotalProcessTimeCells}
                <td>${grandTotalTime}</td>
            </tr>`;

        console.log("✅ Dashboard table updated successfully!");
    }

    function calculateAverageTime(times) {
        if (times.length === 0) return "--:--";

        const totalMinutes = times.reduce((sum, time) => {
            const [hours, minutes] = time.split(":").map(Number);
            return sum + hours * 60 + minutes;
        }, 0);

        const avgMinutes = Math.floor(totalMinutes / times.length);
        const avgHours = Math.floor(avgMinutes / 60);
        const avgMins = avgMinutes % 60;

        return `${avgHours.toString().padStart(2, '0')}:${avgMins.toString().padStart(2, '0')}`;
    }

    function formatDate(dateStr) {
        const [year, month, day] = dateStr.split("-");
        return `${day}-${month}-${year}`;
    }

    function populateYearFilter(logs) {
        const yearFilter = document.getElementById('year-filter');
        if (!yearFilter) {
            console.error("❌ Year filter element not found in Dashboard.");
            return;
        }
    
        // **Extract Only the Year (YYYY) from DD-MM-YYYY Format**
        const availableYears = [...new Set(logs.map(log => {
            const parts = log.date.split("-"); 
            if (parts.length === 3) {
                return parts[2].trim(); // Extract the YYYY part
            }
            return "";
        }))].filter(year => year.match(/^\d{4}$/)).sort().reverse(); // Ensure only valid years (YYYY) are kept
    
        // **Update Year Filter Options**
        yearFilter.innerHTML = '<option value="">Select Year</option>';
        availableYears.forEach(year => {
            yearFilter.innerHTML += `<option value="${year}">${year}</option>`;
        });
    
        console.log("✅ Dashboard Year Filter Updated:", availableYears);
    }
        
});
