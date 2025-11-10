const FormData = require('form-data');

const apiClient = require('../services/coreApiClient');


const handleApiError = (res, error, operation) => {
    console.error(`BFF Error: Failed to ${operation}:`, error.message);
    if (error.response) {
        // 額外印出 FastAPI 的驗證錯誤（例如 422）
        if (error.response.data) {
            console.error(`FastAPI Error Detail:`, error.response.data);
        }
        res.status(error.response.status).json(error.response.data);
    } else {
        res.status(500).json({detail: `BFF Error: Cannot connect to Core API for ${operation}`});
    }
};

const getAllBooks = async (req, res) => {
    try {
        const skip = 0;
        const limit = 50;
        const response = await apiClient.get(`/books/?skip=${skip}&limit=${limit}`);
        res.status(200).json(response.data);
    } catch (error) {
        handleApiError(res, error, 'get all books');
    }
};

const getMyBooks = async (req, res) => {
    try {
        const sellerId = req.session.userId;
        if (!sellerId) {
            return res.status(401).json({detail: 'BFF: User not authenticated'});
        }
        const response = await apiClient.get(`/books/seller/${sellerId}`);
        res.status(200).json(response.data);
    } catch (error) {
        handleApiError(res, error, 'get my books');
    }
};

const createBook = async (req, res) => {
    try {
        const sellerId = req.session.userId;
        if (!sellerId) {
            return res.status(401).json({detail: 'BFF: User not authenticated'});
        }

        const response = await apiClient.post('/books/', req.body, { // ⬅️ 新增配置物件
            headers: {
                'X-User-ID': sellerId
            }
        });
        res.status(201).json(response.data);
    } catch (error) {
        handleApiError(res, error, 'create book');
    }
};

const getBookById = async (req, res) => {
    try {
        const {id} = req.params;
        const response = await apiClient.get(`/books/${id}`);
        res.status(200).json(response.data);
    } catch (error) {
        handleApiError(res, error, 'get book by id');
    }
};

const updateBook = async (req, res) => {
    try {
        const sellerId = req.session.userId; // 🚨 取得使用者 ID
        if (!sellerId) {
            return res.status(401).json({detail: 'BFF: User not authenticated'});
        }

        const {id} = req.params;

        const response = await apiClient.patch(`/books/${id}`, req.body, {
            headers: {
                'X-User-ID': sellerId
            }
        });

        res.status(200).json(response.data);
    } catch (error) {
        handleApiError(res, error, 'update book');
    }
};

const deleteBook = async (req, res) => {
    try {
        const sellerId = req.session.userId;
        if (!sellerId) {
            return res.status(401).json({detail: 'BFF: User not authenticated'});
        }

        const {id} = req.params;

        await apiClient.delete(`/books/${id}`, {
            headers: {
                'X-User-ID': sellerId
            }
        });

        res.status(204).send();
    } catch (error) {
        handleApiError(res, error, 'delete book');
    }
};


// 處理 POST /api/predict (BFF 接收 Form Data 後，轉發給 Core API)
const predictCondition = async (req, res) => {
    try {
        const sellerId = req.session.userId;
        if (!sellerId) {
            return res.status(401).json({detail: 'BFF: User not authenticated'});
        }

        const formDataToCore = new FormData();

        // 轉發文字欄位
        for (const key in req.body) {
            formDataToCore.append(key, req.body[key]);
        }

        // 轉發檔案 (假設 multer 將檔案存在 req.files 中)
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                // 使用 file.buffer 傳遞檔案內容
                formDataToCore.append(file.fieldname, file.buffer, {
                    filename: file.originalname,
                    contentType: file.mimetype
                });
            }
        }

        // 呼叫 Core API
        const response = await apiClient.post('/predict', formDataToCore, {
            headers: {
                ...formDataToCore.getHeaders(),
                'X-User-ID': sellerId
            }
        });
        res.status(response.status).json(response.data);

    } catch (error) {
        handleApiError(res, error, 'AI prediction');
    }
};


module.exports = {
    getAllBooks,
    getMyBooks,
    createBook,
    getBookById,
    updateBook,
    deleteBook,
    predictCondition // <-- 新增
};