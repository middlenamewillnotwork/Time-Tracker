const ACCESS_TOKEN = "sl.u.AFgSB_FRlioYy2wAsCAGVpB9u-Dkl4gJ3du7Zqb6x2ZwvagVXzrcNQrVDJ6Rdv8e1mziv_XOOnMVimnBlapgizfq9q2jnCY__lEIG11ah6jX7M6dQqjQFPMq-qZwk42wL5uaQPOynKraMQc4dmE_NSIRzOagNBgYOVEwoGzPcJz3RanONgXLk2AnLmTjMgszp8Oj7zEEE3WjdBt9FXy8ba3OEfCUkTZLV_NaVDgh28jTlZkSKQ4FLM8JdyAEgToePY7PewtufSzgP2GSE0GcJTIYE3tCphN0e3ERhKR8utG8XNjgrlD2r3JIlly4Sl-skZo7y7M_cCL5TTTHS4pMQEu08DGpyP1-C7GEK-UrLLxwJmukd826iEnXvTwF9B0hH-cATyjULeiThChrUrI-LNsczJHPOBUiTSKtFI63bihrE_BHvL-YToL8Gl8mgL6MQToYic4ynyJhIRMQVUkfwfylsFLt8Mqq7aWoAxxDsIN7JQWXj3H-PjcDVp2h1bN9Qjsp2WN33XE8CZ0pJAnU4NbmO8Zwt13kXs_eKAiI7LwUCYDKuAeLmUjaIBnRYUr5F3l9M-BkbfINP-Avo5UUaTIbk8i0NH2EHL1Us8_J_yKlGqDvC7Qvhenl4kf4cPCkzYnMvvIhCIsuEAJuzslydcbGMc6EzO0IYV1Ve6Y-iuG0L9I6nxZyPD1VUmLHuUNi0ZG9DUFc667BRJwEe0v_ek8jW1ajts93R5wq0R1TH4oniKjG3CnEz3hjWPkxSANMcdj7sZKHVr_pxJqLB3nadpLDvVpoiPs05Hv4Z0A-f1HXPCzDgsBnw9_NTpoOTtXt6yDyzoOMgdJCBeVkF_LQiFJ2ijADZaabTWj8lo-6qS2bx075DgVkkmM3f6saPst56Mu8rbkW1EyD4N9-Qcy1yObdpUx_YoWk5BJvs5MwO19m3JJmcmqQx2Zc5GH7O6DImnhqmta9HbRZDKs7dKg0V2yrFC_kfYcPm9e9b_KjK7ixemMmCV_yOYLqNRb97JF2HVDG-zHbm69HA2OlVG4Y-5Y4JFrYcv9HvYE15YjwDsm6u28KYOyeovoNzV22mNBnCB_YD7cS2K9J4ujPbCbUUmkzekEpDPrbYlM3Y1ZsPVHRargNatEUoeveRVy37wisuY4tLdTY-3TIwjWlXM2swD15458bkRZ4IuNVRy5QlWkhQbrK9sGLhGyoK2uvrgr6UzZopnUJBq29URdNdNeIaJGl_WNigIwFUSM_QZQwEmVGX552uptD9MoRbn0A4ZYyXV19AeVRUk2CF8Q1MquR9EA-pf6-LoCtZwbRIxZXY-hUI3jNgyNHtfwrhD89gq4lJ7LiJs9sAsTilLanoV6eI2l3LaDB8RD9Lxoi1w3QBPHzm-0RJ5g4Du1w6xbbDhbzLbcALKI4cvXlInILjxk513Wx";
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
