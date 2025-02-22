document.addEventListener('DOMContentLoaded', async () => {
    const homePage = document.getElementById('home-page');
    const addTimeForm = document.getElementById('add-time-form');
    const timeForm = document.getElementById('time-form');
    const addTimeButton = document.getElementById('add-time-button');
    const backButton = document.getElementById('back-button');
    const processSelect = document.getElementById('process');
    const dateInput = document.getElementById('date');

    let logs = await loadLogs();
    let editIndex = null;

    // **Auto-Fill Today's Date**
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // YYYY-MM-DD format
    dateInput.value = formattedDate;

    // **Fix: Open Form When Clicking "Add Time"**
    addTimeButton.addEventListener('click', () => {
        homePage.classList.remove('active');
        addTimeForm.classList.add('active');
        timeForm.reset(); // Clear form when opening
        editIndex = null; // Reset edit index

        // **Ensure "Select Process" is Default**
        processSelect.value = "";
        dateInput.value = formattedDate; // Reset to today's date
    });

    // **Fix: Close Form When Clicking "Back"**
    backButton.addEventListener('click', () => {
        addTimeForm.classList.remove('active');
        homePage.classList.add('active');
        editIndex = null;
    });

    // **Handle Form Submission**
    timeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const process = processSelect.value;
        const date = dateInput.value;
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
        alert("Log saved successfully!");

        // Close form and return to home page
        addTimeForm.classList.remove('active');
        homePage.classList.add('active');
        timeForm.reset();
        processSelect.value = ""; // Reset process dropdown
        dateInput.value = formattedDate; // Reset date to today
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
