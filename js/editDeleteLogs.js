document.addEventListener('DOMContentLoaded', async () => {
    const timeLogsTable = document.querySelector('#time-logs tbody');
    let logs = await loadLogs();
    let editIndex = null;

    // Render Logs Initially
    renderLogs(logs);

    // Function to Render Logs in Table
    function renderLogs(logs) {
        timeLogsTable.innerHTML = logs.map((log, index) => `
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
            </tr>
        `).join('');

        // Add event listeners after rendering
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', handleEditLog);
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', handleDeleteLog);
        });
    }

    // **Handle Edit Button Click**
    async function handleEditLog(event) {
        const index = event.target.getAttribute('data-index');
        editIndex = index;
        const logToEdit = logs[index];

        document.getElementById('process').value = logToEdit.process;
        document.getElementById('date').value = logToEdit.date;
        document.getElementById('in-time').value = logToEdit.inTime;
        document.getElementById('out-time').value = logToEdit.outTime;
        document.getElementById('reason').value = logToEdit.reason;

        // Switch to the add/edit form
        document.getElementById('home-page').classList.remove('active');
        document.getElementById('add-time-form').classList.add('active');
    }

    // **Handle Delete Button Click**
    async function handleDeleteLog(event) {
        const index = event.target.getAttribute('data-index');

        if (confirm("Are you sure you want to delete this log?")) {
            logs.splice(index, 1);
            await saveLogs(logs);
            renderLogs(logs);
        }
    }

    // **Update Logs After Form Submission**
    document.getElementById('time-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const process = document.getElementById('process').value;
        const date = document.getElementById('date').value;
        const inTime = document.getElementById('in-time').value;
        const outTime = document.getElementById('out-time').value;
        const reason = document.getElementById('reason').value;

        if (!process || !date || !inTime || !outTime || !reason) {
            alert("Please fill in all fields.");
            return;
        }

        const totalTime = calculateTotalTime(inTime, outTime);
        const newLog = { process, date, inTime, outTime, reason, totalTime };

        if (editIndex !== null) {
            logs[editIndex] = newLog;
        } else {
            logs.push(newLog);
        }

        await saveLogs(logs);
        renderLogs(logs);
        document.getElementById('add-time-form').classList.remove('active');
        document.getElementById('home-page').classList.add('active');
        document.getElementById('time-form').reset();
        editIndex = null;
    });

    function calculateTotalTime(inTime, outTime) {
        const inTimeDate = new Date(`1970-01-01T${inTime}`);
        const outTimeDate = new Date(`1970-01-01T${outTime}`);
        const totalTimeInMinutes = Math.abs(outTimeDate - inTimeDate) / (1000 * 60);
        const hours = Math.floor(totalTimeInMinutes / 60);
        const minutes = totalTimeInMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
});
