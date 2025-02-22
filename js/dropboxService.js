const ACCESS_TOKEN = "sl.u.AFiEr74Y9Dje0xnbJN4IsH4vCbu8H3Tsb7cRRCooP9ZbsIMt2BNg-Di7ZtnHYywYAyvBZN3GwV21CUO4O-O-mOI6iqCsL-RIX-MxLAhN5C-kcgqNkR_to7SmJdGCNVtwyFJzY7ShoC2bG902808IZetdcX_Zky6jEP8GNNd8FE-qtquHs3Rhwbw4F3FS7JT0pHO9SqzMlVNd2PL50eRb0ecmAyvc3Joo7EwbuB2wNNeDoAHc3-jTYRGvhaj1yzpj7-vMvV_MXxnRZQ6O8O04zGJDnznAQBvSg7YTHo8oLHYIfXfsQPEA_6Ewu-TMSpeeq32ulC9IB1LjYeAbZBBY7VnS6wino_1G_Aa7Pgv-4NsoGHqC4UD-RcDMtZwE29dSw4rnpIaKpn5FD1wbEkmKWK_MpOUhYyxbpbqcsOYm3WCGSuAjHw3vN4KlDPiq8xI2IXiAjmO0-ThSmvuECWLV9TEpEJ-6kFQOQZ6xLkQ9kWg0fQ6fEPLPjRPbqOZghJfgzJyW-c7iJWITAQYQD1bQrX8B2s4Y2jx5IgI1KFJW9DgZqRotvfGZ9VI5Yy6FNebKugsWS4w-3B_V5c0MsOqdop54AsYyZYCKs5wmZFUqA_eV1C452Q0Otuhz4cN-quNrJe1hPPdmXsYPffuHVDR5HrfG1P6pCBKleKF7OUXI8kfu5SQGl-VwUC6bizpYultkszbK3ega-VAzChSvCAsAZSvdnncw6Sj4GUvp6EYIKbemocFeoaWspQJhrpJT87n_hUeY9_gONFJWWswgQEWH30bKoUOYTgWBzRzeGhqJvZB6X_xtTcZqIc2zVk0Ir0wqa2tafmiXJ3iGqEfI4XK0EzfX-EdT6XMc3olaL4Lbq1acwx0nPDfqTO3zaTJZMGTUplVfuMYMXk_XxeJ83vCmVGlSZJNLrf4vHY4KAwYrsZpNLi70VGnEY-cM3DZQr72wbpezWguNvaXFVAIK4VKhyK66j2n_cM83025NRmkG1Ym0c9guTub0njkGLFbI4_zxe_sHrKe3eYi4eyy_6pXsnT9_zc8YhxodgjhrMKV5h-OOIx86Lxr0gBB7hDrx_VLu45SNBIkTMWDrazhA2LlUwMTsPJwaM3vdMFJCRy43Am-pTaIYRSUG8I_Q_gb_itUl0ViYNTqw2EHU7v7VgShv7xEL0qcqb-WadYpEXHERyTxY8PhsHSrP0dibnqTJ_tFIPfCupYerAnCL43PiDHhaCRT-aKHKfOnnim-2VqZ-VXXbPC-4V9MYw7-gdampmRiaPjzJPp7xPEAhhM730SkhI1uVBJj-4skV4arysh5ql6uJFXz0e6h3BOi3AlE7_xWXBqIVLUzBguF186WdrQG09yOefyL2i62f6Vi3Fgj1O64NlwRLCidGBVOmMY0_6Fb0fVlDinbgGzcwidHUWCNe66CP";
let dbx;

try {
    dbx = new Dropbox.Dropbox({ accessToken: ACCESS_TOKEN });
} catch (error) {
    console.error("Dropbox initialization error:", error);
}

async function loadLogs() {
    if (!dbx) {
        console.error("Dropbox is not initialized.");
        return [];
    }

    try {
        const response = await dbx.filesDownload({ path: "/timeLogs.json" });
        const blob = response.result.fileBlob;
        const text = await blob.text();
        return JSON.parse(text);
    } catch (error) {
        console.warn("No existing logs found or error fetching logs:", error);
        return [];
    }
}

async function saveLogs(logs) {
    if (!dbx) {
        console.error("Dropbox is not initialized.");
        return;
    }

    try {
        await dbx.filesUpload({
            path: "/timeLogs.json",
            mode: { ".tag": "overwrite" },
            contents: JSON.stringify(logs, null, 2)
        });
        console.log("Logs saved to Dropbox!");
    } catch (error) {
        console.error("Error saving logs:", error);
    }
}
