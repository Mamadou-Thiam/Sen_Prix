import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import App from './App';
import { store } from './store';
import './styles/index.css';

const theme = {
  token: {
    colorPrimary: '#00853F',
    colorSuccess: '#00853F',
    colorWarning: '#FCD116',
    colorError: '#E31B23',
    colorInfo: '#00853F',
    borderRadius: 6,
  },
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ConfigProvider theme={theme}>
          <App />
        </ConfigProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
