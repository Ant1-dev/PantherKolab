import { AXIOS_CONFIG, BASE_URL } from "../backend_old/utils/constants";
import axios from "axios";

export default axios.create({
  baseURL: BASE_URL,
  headers: AXIOS_CONFIG.headers,
  withCredentials: true,
});

const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: AXIOS_CONFIG.headers,
  withCredentials: true,
});

//  retry any request that failed
//because of an expired accessToken with a new
// accessToken

axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    process.env.NODE_ENV !== "production" &&
      console.log("An error happened: ", error.response.data.message);

    const prevRequest = error?.config;

    if (error?.response?.status === 401 && !prevRequest?.sent) {
      prevRequest.sent = true;
      //   await axios.post("/auth/refresh");

      return axiosPrivate(prevRequest);
    }
    return Promise.reject(error);
  }
);

export { axiosPrivate };
