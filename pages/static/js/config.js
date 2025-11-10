// static/js/config.js (最終正確版)

export async function getWebUrl() {
    try {
        let url = "";
        // 呼叫 BFF 的 /api/getWebUrl
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
        // 呼叫 BFF 的 /api/getLiffId
        const response = await fetch('/api/getLiffId');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        url = data.id;
        return url;
    } catch (error) {
        console.error('Error fetching URL:', error);
        return null;
    }
}

export const API_BASE_URL = "/api";

export const API_ENDPOINTS = {
    // User (BFF: /api/profile)
    syncProfile: `${API_BASE_URL}/profile`,

    // Books (BFF: /api/books)
    // -----------------------------------------------------
    // GET /api/books
    books: `${API_BASE_URL}/books`,

    // GET /api/books/me
    myBooks: `${API_BASE_URL}/books/me`,

    predict: `${API_BASE_URL}/predict`,

    // GET, PATCH, DELETE /api/books/:id
    bookById: (id) => `${API_BASE_URL}/books/${id}`
};