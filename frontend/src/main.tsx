import '@ant-design/v5-patch-for-react-19';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

import { store } from './redux/store';
import { injectStore, refreshToken } from './config/axios-customize';
import { router } from './router';

dayjs.locale('vi');
injectStore(store);

const App = () => {
  useEffect(() => {
    // Khôi phục phiên làm việc khi app khởi động (F5)
    refreshToken();
  }, []);

  return (
    <ConfigProvider locale={viVN}>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
