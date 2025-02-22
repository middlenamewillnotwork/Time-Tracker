document.addEventListener('DOMContentLoaded', () => {
    const homePage = document.getElementById('home-page');
    const addTimeForm = document.getElementById('add-time-form');
    const timeLogsTable = document.querySelector('#time-logs tbody');
    const grandTotalField = document.getElementById('grand-total');
    const filterDate = document.getElementById('filter-date');
    const filterProcess = document.getElementById('filter-process');

    const ACCESS_TOKEN = "sl.u.AFiEr74Y9Dje0xnbJN4IsH4vCbu8H3Tsb7cRRCooP9ZbsIMt2BNg-Di7ZtnHYywYAyvBZN3GwV21CUO4O-O-mOI6iqCsL-RIX-MxLAhN5C-kcgqNkR_to7SmJdGCNVtwyFJzY7ShoC2bG902808IZetdcX_Zky6jEP8GNNd8FE-qtquHs3Rhwbw4F3FS7JT0pHO9SqzMlVNd2PL50eRb0ecmAyvc3Joo7EwbuB2wNNeDoAHc3-jTYRGvhaj1yzpj7-vMvV_MXxnRZQ6O8O04zGJDnznAQBvSg7YTHo8oLHYIfXfsQPEA_6Ewu-TMSpeeq32ulC9IB1LjYeAbZBBY7VnS6wino_1G_Aa7Pgv-4NsoGHqC4UD-RcDMtZwE29dSw4rnpIaKpn5FD1wbEkmKWK_MpOUhYyxbpbqcsOYm3WCGSuAjHw3vN4KlDPiq8xI2IXiAjmO0-ThSmvuECWLV9TEpEJ-6kFQOQZ6xLkQ9kWg0fQ6fEPLPjRPbqOZghJfgzJyW-c7iJWITAQYQD1bQrX8B2s4Y2jx5IgI1KFJW9DgZqRotvfGZ9VI5Yy6FNebKugsWS4w-3B_V5c0MsOqdop54AsYyZYCKs5wmZFUqA_eV1C452Q0Otuhz4cN-quNrJe1hPPdmXsYPffuHVDR5HrfG1P6pCBKleKF7OUXI8kfu5SQGl-VwUC6bizpYultkszbK3ega-VAzChSvCAsAZSvdnncw6Sj4GUvp6EYIKbemocFeoaWspQJhrpJT87n_hUeY9_gONFJWWswgQEWH30bKoUOYTgWBzRzeGhqJvZB6X_xtTcZqIc2zVk0Ir0wqa2tafmiXJ3iGqEfI4XK0EzfX-EdT6XMc3olaL4Lbq1acwx0nPDfqTO3zaTJZMGTUplVfuMYMXk_XxeJ83vCmVGlSZJNLrf4vHY4KAwYrsZpNLi70VGnEY-cM3DZQr72wbpezWguNvaXFVAIK4VKhyK66j2n_cM83025NRmkG1Ym0c9guTub0njkGLFbI4_zxe_sHrKe3eYi4eyy_6pXsnT9_zc8YhxodgjhrMKV5h-OOIx86Lxr0gBB7hDrx_VLu45SNBIkTMWDrazhA2LlUwMTsPJwaM3vdMFJCRy43Am-pTaIYRSUG8I_Q_gb_itUl0ViYNTqw2EHU7v7VgShv7xEL0qcqb-WadYpEXHERyTxY8PhsHSrP0dibnqTJ_tFIPfCupYerAnCL43PiDHhaCRT-aKHKfOnnim-2VqZ-VXXbPC-4V9MYw7-gdampmRiaPjzJPp7xPEAhhM730SkhI1uVBJj-4skV4arysh5ql6uJFXz0e6h3BOi3AlE7_xWXBqIVLUzBguF186WdrQG09yOefyL2i62f6Vi3Fgj1O64NlwRLCidGBVOmMY0_6Fb0fVlDinbgGzcwidHUWCNe66CP";
    const FILE_PATH = "/timeLogs.json"; // File stored in Dropbox

    let logs = [];
    let editIndex = null;

    const dbx = new Dropbox.Dropbox({ accessToken: ACCESS_TOKEN });

    // Fetch logs from Dropbox
    async function loadLogs() {
        try {
            const response = await dbx.filesDownload({ path: FILE_PATH });
            const blob = response.result.fileBlob;
            const text = await blob.text();
            logs = JSON.parse(text);
            renderLogs(logs);
        } catch (error) {
            console.log("No existing logs found or error fetching logs:", error);
            logs = [];
        }
    }

    // Save logs to Dropbox (overwrite existing file)
    async function saveLogs() {
        try {
            await dbx.filesUpload({
                path: FILE_PATH,
                mode: { ".tag": "overwrite" },
                contents: JSON.stringify(logs, null, 2)
            });
            console.log("Logs saved to Dropbox!");
        } catch (error) {
            console.error("Error saving logs:", error);
        }
    }

    const renderLogs = (filteredLogs) => {
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

    const updateGrandTotal = (filteredLogs) => {
        let totalMinutes = filteredLogs.reduce((sum, log) => {
            const [hours, minutes] = log.totalTime.split(':').map(Number);
            return sum + hours * 60 + minutes;
        }, 0);

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        grandTotalField.innerHTML = `<strong>Grand Total: ${hours}:${minutes.toString().padStart(2, '0')}</strong>`;
    };

    document.getElementById('time-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const process = document.getElementById('process').value;
        const date = document.getElementById('date').value;
        const inTime = document.getElementById('in-time').value;
        const outTime = document.getElementById('out-time').value;
        const reason = document.getElementById('reason').value;

        const reasonRegex = /^[,&.a-zA-Z0-9\s]*$/;
        if (!reasonRegex.test(reason)) {
            document.getElementById('reason-error').style.display = 'block';
            return;
        }
        document.getElementById('reason-error').style.display = 'none';

        const totalTimeSpent = calculateTotalTime(inTime, outTime);
        const newLog = { process, date, inTime, outTime, reason, totalTime: totalTimeSpent };

        if (editIndex !== null) {
            logs[editIndex] = newLog;
        } else {
            logs.push(newLog);
        }

        await saveLogs();
        renderLogs(logs);

        addTimeForm.classList.remove('active');
        homePage.classList.add('active');
        document.getElementById('time-form').reset();
    });

    const calculateTotalTime = (inTime, outTime) => {
        const inTimeDate = new Date(`1970-01-01T${inTime}`);
        const outTimeDate = new Date(`1970-01-01T${outTime}`);
        const totalTimeInMinutes = Math.abs(outTimeDate - inTimeDate) / (1000 * 60);

        const hours = Math.floor(totalTimeInMinutes / 60);
        const minutes = totalTimeInMinutes % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    document.getElementById('back-button').addEventListener('click', () => {
        addTimeForm.classList.remove('active');
        homePage.classList.add('active');
        editIndex = null;
    });

    const deleteLog = async (index) => {
        if (confirm("Are you sure you want to delete this time log?")) {
            logs.splice(index, 1);
            await saveLogs();
            renderLogs(logs);
        }
    };

    timeLogsTable.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        if (e.target.classList.contains('edit-button')) {
            editLog(index);
        } else if (e.target.classList.contains('delete-button')) {
            deleteLog(index);
        }
    });

    const editLog = (index) => {
        const logToEdit = logs[index];
        editIndex = index;

        document.getElementById('process').value = logToEdit.process;
        document.getElementById('date').value = logToEdit.date;
        document.getElementById('in-time').value = logToEdit.inTime;
        document.getElementById('out-time').value = logToEdit.outTime;
        document.getElementById('reason').value = logToEdit.reason;

        homePage.classList.remove('active');
        addTimeForm.classList.add('active');
    };

    loadLogs(); // Load logs on page load
});
