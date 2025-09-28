import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginSuccess() {
  const navigate = useNavigate();
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return; // ✅ prevent second run in dev mode
    ranOnce.current = true;

    const params = new URLSearchParams(location.search);
    const accessToken = params.get("accesstoken") || "";
    const refreshToken = params.get("refreshtoken") || "";
    const userId = params.get("userid") || "";
    const deviceId = params.get("deviceid") || "";

    console.log({ accessToken, refreshToken, userId, deviceId });

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("userId", userId);
    localStorage.setItem("deviceId", deviceId);

    // Redirect to home after saving
    // Cập nhật global store (async hoặc sync tùy bạn viết)
    setTimeout(() => {
      navigate('/', {replace: true})
    }, 500) //push to callback queue, await localstorage updated
  }, [navigate]);

  return <div>Logging in...</div>;
}
