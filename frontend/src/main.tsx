import '@ant-design/v5-patch-for-react-19';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';

import { store } from './redux/store';
import { injectStore, refreshToken } from './config/axios-customize';
import { router } from './router';
import './styles/global.scss';

dayjs.extend(relativeTime);
dayjs.locale('vi');
injectStore(store);

const App = () => {
  useEffect(() => {
    // Khôi phục phiên làm việc khi app khởi động (F5)
    refreshToken();
  }, []);

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#0052cc',
          fontFamily:
            "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          borderRadius: 8,
          colorLink: '#0052cc',
          colorLinkHover: '#0065ff',
          colorTextBase: '#0f172a',
          controlHeight: 40,
        },
        components: {
          Card: {
            headerFontSize: 16,
          },
          Button: {
            controlHeight: 40,
            paddingContentHorizontal: 16,
          },
        },
      }}
    >
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
