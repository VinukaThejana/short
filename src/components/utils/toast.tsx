import { Toaster } from 'react-hot-toast';

export const Toast = () => {
  return (
    <Toaster
      toastOptions={{
        className: '',
        style: {
          color: 'black',
          padding: '16px',
          border: '1px solid #f1f5f9',
          background: '#f1f5f9',
        },
        success: {
          style: {
            border: '1px solid #f1f5f9',
            background: '#f1f5f9',
          },
        },
        error: {
          style: {
            border: '1px solid #f1f5f9',
            background: '#f1f5f9',
          },
        },
      }}
    />
  );
};
