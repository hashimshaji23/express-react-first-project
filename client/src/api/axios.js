import axios from "axios";

const API = axios.create({
    baseURL: "https://e-commerc-irrt.onrender.com",
});

export default API;