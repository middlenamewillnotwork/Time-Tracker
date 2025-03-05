const ACCESS_TOKEN = "sl.u.AFkDxOjgn-WjWi1keWKqdjzVvtF6KR0WZem7MNRvJketlloVlUOoneqZOKdF1gUIPGi0vx1eAdi2pDKm1fQA16I7Wzf8a2Jwai3Q3WpBtHZjviyUi3lh5HO0M0YHpOWhmcv7sLuSwhYfdgTPIypHB_0oNHm-_558WG2e321oYDhlhIJJinu7A-JPr69qIsCewOAyToPTJkn0OIk15rVBJSvMGd3lhjExBxQFaQHL5FwMzNjqU242ZVhuEYCugKHA6auUeS_IZOf8Q8NnWom08Yfg4OwR3MNOsCWnNw5gtuvZJBs9u6FsYeAZoW_pVRK8VS1S5jHp6ZmjJsS7e0fg5MrbW1F9K7RZ4Qbm_ur7zgfYBNxlSGNZbZDyql_lfYbht9y8tLd3JQ3DVmYIZ8CANhOCGLk1OikMX7_x69GzYxhouoKIVddQku2pAHDMvk8naPMKO__UKG8cnbcv6NLdNA_X-RYwToWEWj8UZ4F_ZLEOx-Vbfb4IJ49jv31dx8NhF4zCuqWq_HqgvD-RRw5M0C2oaZ3uvqcavf3pXQhihsjnW4CU8MTYP6ozb506VIwdu24RInyMNY1JwnTOq9RFXroENm-9Yn4PsjKeGq0JB5kxp902-4DEYfeLm2b_7yMpoYlRSAtXKrFgrI1Ac-uvdVpgv9A6nDDdM-9t-a0GbEe9FU6M2SNENmwo2tktsEid475f4rqDtFy5mvGcDWfVmfXpdyd2nD7wja6bm4kFvlW9qJqajqzqyubMXF3NNcWspAeycoVAyBxHvcU1vj0EDHNFyIHA4wCE16efHtrhx0PA57_3VQFE3TmNm0gspp8d-2s9Oyty1Zk-8rrf31CrvfFXWViKmAEnQkda3KZKHYCq-Ucelsuhx6M8ylZZ7_b-UEQrLDc-SlMyzxPpzXtgSR46_4xkCJVJXj5EmQJw40PttYDBfMMMhiov0YOE6Lz_P_2Z5wNeIsJTDkk2mKo2LkWTsKHqhdugXE7lWVJUAp6cuxMHA7-ROzMnjqbTzfJqQI92a_f7pA8uO37pXY5Uo5qqncxmCIuEMFcQjKe2dnVgvPZP8LhXVuyKDa6jKJmzwUWRteZ8K51c4675Mr2NDkLcBoAFt9exjPeuKYrAe28Vf9wralSsXTBa8vVpZNLe6PdqTmwTXpWBxqDJGFlS1Q8xv8Sm_sSS3CX1SU7kaW_2nNfIf2aH5XHu-emUCnCmb7ryyLFCeXCQ6z5R-bEQLkzvJIBFqFxibX5iVV1Itw7g74VdOHabml0wbObpSc9iJmKATuP3v1DKZo1KCo1cCBXkTnC3rfU6ePtoWbKLF-EE29w4M9I3hJWC5mdeXq9e11NyKIVaGFQvNthc-EHofrNFNd3W0X4TZWef07VfdxOnmQkGftXWwnjxXt1rAdD74QduXBYI0PIHVPy8C-eEPW7B";
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
