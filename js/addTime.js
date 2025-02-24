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

    // **Auto-Fill Today's Date (Convert to DD-MM-YYYY)**
    const today = new Date();
    dateInput.value = formatDateToDDMMYYYY(today);

    addTimeButton.addEventListener('click', () => {
        homePage.classList.remove('active');
        addTimeForm.classList.add('active');
        timeForm.reset(); // Clear form when opening
        editIndex = null;

        // **Ensure "Select Process" is Default**
        processSelect.value = "";
        dateInput.value = formatDateToDDMMYYYY(today); // Reset to today's date in DD-MM-YYYY
    });

    backButton.addEventListener('click', () => {
        addTimeForm.classList.remove('active');
        homePage.classList.add('active');
        editIndex = null;
    });

    timeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const process = processSelect.value;
        const date = formatDateToDDMMYYYY(new Date(dateInput.value)); // Convert input date to DD-MM-YYYY
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
        dateInput.value = formatDateToDDMMYYYY(today); // Reset date to today's date in correct format
    });

    function formatDateToDDMMYYYY(date) {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    }

    function calculateTotalTime(inTime, outTime) {
        const inTimeDate = new Date(`1970-01-01T${inTime}`);
        const outTimeDate = new Date(`1970-01-01T${outTime}`);
        const totalMinutes = Math.abs(outTimeDate - inTimeDate) / (1000 * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
});
