//import axios from "axios";

//const api = axios.create({
  //baseURL: "/api", // Proxy all requests to Netlify redirects
  //headers: { "Content-Type": "application/json" },
//});

//api.interceptors.request.use((cfg) => {
  //const token = localStorage.getItem("token");
  //if (token) cfg.headers.Authorization = `Bearer ${token}`;
  //return cfg;
//});

//export default api;




 import axios from "axios";

// // Use the backend URL from env or fallback to localhost
 const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

 // Option 2: Keep backend routes as /auth, /qr, etc.
 const api = axios.create({
   baseURL: API_URL, // Do NOT add /api here, backend expects /auth
   headers: { "Content-Type": "application/json" },
 });

// // Automatically add Authorization header if token exists
 api.interceptors.request.use((cfg) => {
   const token = localStorage.getItem("token");
   if (token) cfg.headers.Authorization = `Bearer ${token}`;
   return cfg;
 });

 export default api;
