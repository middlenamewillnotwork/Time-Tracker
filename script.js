document.addEventListener('DOMContentLoaded', () => {
    const homePage = document.getElementById('home-page');
    const addTimeForm = document.getElementById('add-time-form');
    const timeLogsTable = document.querySelector('#time-logs tbody');
    const grandTotalField = document.getElementById('grand-total');
    const filterDate = document.getElementById('filter-date');
    const filterProcess = document.getElementById('filter-process');

    let logs = JSON.parse(localStorage.getItem('timeLogs')) || [];
    let editIndex = null; // Track the index of the log being edited

    const sortLogs = (logs) => {
        return logs.sort((a, b) => {
            // First sort by date (new to old)
            if (a.date !== b.date) {
                return new Date(b.date) - new Date(a.date);
            }
    
            // If dates are the same, sort by InTime (new to old)
            return b.inTime.localeCompare(a.inTime);
        });
    };
    

    const updateGrandTotal = (filteredLogs) => {
        let totalMinutes = filteredLogs.reduce((sum, log) => {
            const [hours, minutes] = log.totalTime.split(':').map(Number);
            return sum + hours * 60 + minutes;
        }, 0);

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        grandTotalField.innerHTML = `<strong>Grand Total: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}</strong>`;
    };

    const renderLogs = (filteredLogs) => {
        filteredLogs = sortLogs(filteredLogs); // Sort logs before rendering
        timeLogsTable.innerHTML = '';
        filteredLogs.forEach((log, index) => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>
                    <div style="display: flex; gap: 5px; justify-content: center;">
                        <button class="edit-button" data-index="${index}">Edit</button>
                        <button class="delete-button" data-index="${index}">Delete</button>
                    </div>
                </td>
                <td>${log.process}</td>
                <td>${log.date}</td>
                <td>${log.inTime}</td>
                <td>${log.outTime}</td>
                <td>${log.reason}</td>
                <td>${log.totalTime}</td>
            `;
            timeLogsTable.appendChild(newRow);
        });
        updateGrandTotal(filteredLogs);
    };

    const saveLogs = () => {
        localStorage.setItem('timeLogs', JSON.stringify(logs));
    };

    const editLog = (index) => {
        const logToEdit = logs[index];
        editIndex = index; // Set the index of the log being edited

        // Prefill the form with the log details
        document.getElementById('process').value = logToEdit.process;
        document.getElementById('date').value = logToEdit.date;
        document.getElementById('in-time').value = logToEdit.inTime;
        document.getElementById('out-time').value = logToEdit.outTime;
        document.getElementById('reason').value = logToEdit.reason;

        // Switch to the add/edit form
        homePage.classList.remove('active');
        addTimeForm.classList.add('active');
    };

    const calculateTotalTime = (inTime, outTime) => {
        const inTimeDate = new Date(`1970-01-01T${inTime}`);
        const outTimeDate = new Date(`1970-01-01T${outTime}`);
        const totalTimeInMinutes = Math.abs(outTimeDate - inTimeDate) / (1000 * 60);

        const hours = Math.floor(totalTimeInMinutes / 60);
        const minutes = totalTimeInMinutes % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const isConflict = (newLog) => {
        return logs.some(log => {
            if (log.date !== newLog.date || log.process !== newLog.process) {
                return false;
            }
            const logInTime = new Date(`1970-01-01T${log.inTime}`);
            const logOutTime = new Date(`1970-01-01T${log.outTime}`);
            const newLogInTime = new Date(`1970-01-01T${newLog.inTime}`);
            const newLogOutTime = new Date(`1970-01-01T${newLog.outTime}`);

            return (newLogInTime < logOutTime && newLogOutTime > logInTime);
        });
    };

    document.getElementById('add-time-button').addEventListener('click', () => {
        homePage.classList.remove('active');
        addTimeForm.classList.add('active');
        document.getElementById('time-form').reset(); // Clear form for new entry
        editIndex = null; // Reset the edit index
    });

    document.getElementById('time-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const process = document.getElementById('process').value;
        const date = document.getElementById('date').value;
        const inTime = document.getElementById('in-time').value;
        const outTime = document.getElementById('out-time').value;
        const reason = document.getElementById('reason').value;

        const reasonRegex = /^[a-zA-Z0-9\s]*$/; // Only letters, numbers, and spaces
        if (!reasonRegex.test(reason)) {
            document.getElementById('reason-error').style.display = 'block';
            return;
        }

        document.getElementById('reason-error').style.display = 'none';

        const totalTimeSpent = calculateTotalTime(inTime, outTime);
        const newLog = { process, date, inTime, outTime, reason, totalTime: totalTimeSpent };

        if (isConflict(newLog)) {
            alert('Conflict detected: The time slot overlaps with an existing log.');
            return;
        }

        if (editIndex !== null) {
            // Update the existing log
            logs[editIndex] = newLog;
        } else {
            // Add a new log
            logs.push(newLog);
        }

        saveLogs();
        renderLogs(logs);

        addTimeForm.classList.remove('active');
        homePage.classList.add('active');
        document.getElementById('time-form').reset();
    });

    document.getElementById('back-button').addEventListener('click', () => {
        addTimeForm.classList.remove('active');
        homePage.classList.add('active');
        editIndex = null; // Reset the edit index
    });

    document.getElementById('download-button').addEventListener('click', () => {
        const table = document.getElementById('time-logs');
        const rows = table.querySelectorAll('tr');
        
        // Skip the first row (header) and remove the first cell (Action column)
        const filteredRows = Array.from(rows).map((row, index) => {
            const cells = Array.from(row.cells);
            if (index === 0) { // For the header row, remove the Action column
                cells.shift(); // Remove the first cell
            } else { // For data rows, remove the first cell (Action column)
                cells.shift(); // Remove the first cell
            }
            return cells;
        });
    
        // Create a new table with the filtered rows
        const filteredTable = document.createElement('table');
        filteredRows.forEach(rowCells => {
            const row = document.createElement('tr');
            rowCells.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell.textContent || cell.innerText;
                row.appendChild(td);
            });
            filteredTable.appendChild(row);
        });
    
        // Convert table to a workbook
        const workbook = XLSX.utils.table_to_book(filteredTable, { sheet: "Time Logs" });
    
        // Apply auto-fit columns based on the maximum length of the content
        const sheet = workbook.Sheets["Time Logs"];
        const range = XLSX.utils.decode_range(sheet["!ref"]); // Get the sheet range
    
        const columnWidths = [];
        for (let col = range.s.c; col <= range.e.c; col++) {
            let maxLength = 0;
            for (let row = range.s.r; row <= range.e.r; row++) {
                const cellAddress = { r: row, c: col };
                const cell = sheet[XLSX.utils.encode_cell(cellAddress)];
                if (cell && cell.v) {
                    maxLength = Math.max(maxLength, cell.v.toString().length);
                }
            }
            columnWidths[col] = maxLength + 2; // Add some padding
        }
    
        // Apply column widths to the sheet
        for (let col = range.s.c; col <= range.e.c; col++) {
            const columnWidth = columnWidths[col] || 10; // Default width if no content
            sheet["!cols"] = sheet["!cols"] || [];
            sheet["!cols"][col] = { wpx: columnWidth * 10 }; // Set width (wpx = width in pixels)
        }
    
        // Download the Excel file
        const now = new Date();
        const filename = `time_logs_${now.toISOString().split('T')[0]}_${now.toTimeString().split(' ')[0].replace(/:/g, '-')}.xlsx`;
        XLSX.writeFile(workbook, filename);
    });

    const filterLogs = () => {
        const dateValue = filterDate.value;
        const processValue = filterProcess.value;

        const filteredLogs = logs.filter(log => {
            const matchesDate = !dateValue || log.date === dateValue;
            const matchesProcess = !processValue || log.process === processValue;
            return matchesDate && matchesProcess;
        });

        renderLogs(filteredLogs);
    };

    const deleteLog = (index) => {
        if (confirm("Are you sure you want to delete this time log?")) {
            logs.splice(index, 1);
            saveLogs();
            renderLogs(logs);
        }
    };

    timeLogsTable.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        if (e.target.classList.contains('edit-button')) {
            editLog(index); // Edit button clicked
        } else if (e.target.classList.contains('delete-button')) {
            deleteLog(index); // Delete button clicked
        }
    });

    filterDate.addEventListener('change', filterLogs);
    filterProcess.addEventListener('change', filterLogs);

    renderLogs(logs); // Initial render
});


document.addEventListener('DOMContentLoaded', () => {
    const dashboardButton = document.getElementById('dashboard-button');
    const backToHomeButton = document.getElementById('back-to-home');
    const pivotTable = document.getElementById('pivot-table');
    const monthFilter = document.getElementById('month-filter');
    const yearFilter = document.getElementById('year-filter');
    const filterButton = document.getElementById('filter-logs');

    if (dashboardButton) {
        dashboardButton.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }

    if (backToHomeButton) {
        backToHomeButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    const renderPivotTable = (logs, filteredLogs) => {
        const processes = [...new Set(filteredLogs.map(log => log.process))];
        const dates = [...new Set(filteredLogs.map(log => log.date))];

        // Clear the existing table
        const tableHeader = pivotTable.querySelector('thead tr');
        const tableBody = pivotTable.querySelector('tbody');
        tableHeader.innerHTML = '<th>Date</th><th>First Login</th><th>Last Logout</th>'; // Reset headers
        tableBody.innerHTML = ''; // Reset body

        // Add process headers
        processes.forEach(process => {
            const th = document.createElement('th');
            th.textContent = process;
            tableHeader.appendChild(th);
        });

        // Add "Total" header
        const totalHeader = document.createElement('th');
        totalHeader.textContent = "Total";
        tableHeader.appendChild(totalHeader);

        // Populate table body
        dates.forEach(date => {
            const row = document.createElement('tr');
            const dateCell = document.createElement('td');
            dateCell.textContent = date;
            row.appendChild(dateCell);

            // Add First Login and Last Logout cells
            const firstLoginCell = document.createElement('td');
            const lastLogoutCell = document.createElement('td');

            const logsForDate = filteredLogs.filter(log => log.date === date);
            if (logsForDate.length > 0) {
                const firstLogin = logsForDate.reduce((earliest, log) => {
                    return log.inTime < earliest ? log.inTime : earliest;
                }, logsForDate[0].inTime);

                const lastLogout = logsForDate.reduce((latest, log) => {
                    return log.outTime > latest ? log.outTime : latest;
                }, logsForDate[0].outTime);

                firstLoginCell.textContent = firstLogin || '-';
                lastLogoutCell.textContent = lastLogout || '-';
            } else {
                firstLoginCell.textContent = '-';
                lastLogoutCell.textContent = '-';
            }

            row.appendChild(firstLoginCell);
            row.appendChild(lastLogoutCell);

            let totalMinutesForDate = 0;

            processes.forEach(process => {
                const cell = document.createElement('td');
                const totalMinutes = filteredLogs
                    .filter(log => log.date === date && log.process === process)
                    .reduce((sum, log) => {
                        const [hours, minutes] = log.totalTime.split(':').map(Number);
                        return sum + hours * 60 + minutes;
                    }, 0);

                totalMinutesForDate += totalMinutes;

                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                cell.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
                row.appendChild(cell);
            });

            // Add the total time for the date
            const totalCell = document.createElement('td');
            const totalHours = Math.floor(totalMinutesForDate / 60);
            const totalMinutes = totalMinutesForDate % 60;
            totalCell.textContent = `${totalHours}:${totalMinutes.toString().padStart(2, '0')}`;
            row.appendChild(totalCell);

            tableBody.appendChild(row);
        });

        // Add total for each process (row-wise)
        const footerRow = document.createElement('tr');
        const footerCell = document.createElement('td');
        footerCell.textContent = 'Total';

        // Merge the "Total" cell with the next two cells (First Login and Last Logout)
        footerCell.colSpan = 3;
        footerRow.appendChild(footerCell);

        processes.forEach(process => {
            const totalForProcess = filteredLogs
                .filter(log => log.process === process)
                .reduce((sum, log) => {
                    const [hours, minutes] = log.totalTime.split(':').map(Number);
                    return sum + hours * 60 + minutes;
                }, 0);

            const totalHoursForProcess = Math.floor(totalForProcess / 60);
            const totalMinutesForProcess = totalForProcess % 60;
            const processCell = document.createElement('td');
            processCell.textContent = `${totalHoursForProcess}:${totalMinutesForProcess.toString().padStart(2, '0')}`;
            footerRow.appendChild(processCell);
        });

        // Add the grand total
        const grandTotalCell = document.createElement('td');
        const grandTotal = filteredLogs.reduce((sum, log) => {
            const [hours, minutes] = log.totalTime.split(':').map(Number);
            return sum + hours * 60 + minutes;
        }, 0);

        const grandTotalHours = Math.floor(grandTotal / 60);
        const grandTotalMinutes = grandTotal % 60;
        grandTotalCell.textContent = `${grandTotalHours}:${grandTotalMinutes.toString().padStart(2, '0')}`;
        footerRow.appendChild(grandTotalCell);

        tableBody.appendChild(footerRow);
    };

    const applyFilter = () => {
        const selectedMonth = monthFilter.value;
        const selectedYear = yearFilter.value;

        const logs = JSON.parse(localStorage.getItem('timeLogs')) || [];
        
        // Filter logs based on selected month and year
        const filteredLogs = logs.filter(log => {
            const logDate = new Date(log.date);
            const logMonth = String(logDate.getMonth() + 1).padStart(2, '0');
            const logYear = logDate.getFullYear();

            return (
                (!selectedMonth || logMonth === selectedMonth) &&
                (!selectedYear || logYear.toString() === selectedYear)
            );
        });

        renderPivotTable(logs, filteredLogs);
    };

    const populateYearFilter = () => {
        const logs = JSON.parse(localStorage.getItem('timeLogs')) || [];
        const years = [...new Set(logs.map(log => new Date(log.date).getFullYear()))];

        // Clear existing year options
        yearFilter.innerHTML = '<option value="">Select Year</option>';

        // Populate year filter with unique years
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
    };

    filterButton.addEventListener('click', applyFilter);

    // Populate year filter dynamically on page load
    populateYearFilter();

    if (pivotTable) {
        const logs = JSON.parse(localStorage.getItem('timeLogs')) || [];
        renderPivotTable(logs, logs); // Initially show all logs
    }
});




document.addEventListener('DOMContentLoaded', () => {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingVideo = document.getElementById('loading-video');
    
    const showLoadingVideo = (callback, delay = 1000) => {
        loadingOverlay.style.display = 'flex'; // Show the loading overlay
        loadingVideo.play(); // Ensure the video starts playing
        setTimeout(() => {
            callback(); // Perform the callback action after the delay
            loadingOverlay.style.display = 'none'; // Hide the overlay
        }, delay); // Adjust the delay as needed
    };

    // Add loading video to Dashboard button
    const dashboardButton = document.getElementById('dashboard-button');
    if (dashboardButton) {
        dashboardButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent immediate navigation
            showLoadingVideo(() => {
                window.location.href = 'dashboard.html';
            });
        });
    }

    // Add loading video to Download button
    const downloadButton = document.getElementById('download-button');
    if (downloadButton) {
        downloadButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default behavior
            showLoadingVideo(() => {
                // Your existing download functionality
                console.log("Download started!");
            });
        });
    }

    // Add loading video to Back to Home button
    const backToHomeButton = document.getElementById('back-to-home');
    if (backToHomeButton) {
        backToHomeButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent immediate navigation
            showLoadingVideo(() => {
                window.location.href = 'index.html';
            });
        });
    }
});
