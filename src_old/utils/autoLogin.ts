import axiosPrivate from "../lib/axios";
export default async function autoLogin() {
  return axiosPrivate.post("/auth/login");
}
