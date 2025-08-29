import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // 필요시 쿠키 인증 등
});

// 요청 인터셉터: access_token이 있으면 헤더에 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 에러 시 refresh_token으로 access_token 재발급
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 네트워크 에러인 경우 인증 처리 없이 바로 에러 반환
    if (error.code === 'ERR_NETWORK' || !error.response) {
      console.warn('네트워크 에러 발생:', error.message);
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    
    // 로그인 요청은 /refresh 시도에서 제외
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !(originalRequest.url && originalRequest.url.endsWith('/auth/login'))
    ) {
      originalRequest._retry = true;
      
      try {
        // refresh_token으로 새로운 access_token 요청
        const response = await axios.post(`${baseURL}/auth/refresh`, {}, {
          withCredentials: true, // httpOnly 쿠키 전송
        });
        const { access_token } = response.data;
        
        // 새로운 access_token 저장
        localStorage.setItem('access_token', access_token);
        
        // 원래 요청 재시도
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // refresh_token도 만료된 경우에만 로그아웃
        console.error('토큰 갱신 실패:', refreshError);
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 