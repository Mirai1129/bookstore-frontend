export async function getWebUrl() {
    try {
        let url = "";
        const response = await fetch('/api/getWebUrl');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        url = data.url;
        return url;
    } catch (error) {
        console.error('Error fetching URL:', error);
        return null;
    }
}

export async function getLiffId() {
    try {
        let url = "";
        const response = await fetch('/api/getLiffId');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        url = data.url;
        return url;
    } catch (error) {
        console.error('Error fetching URL:', error);
        return null;
    }
}