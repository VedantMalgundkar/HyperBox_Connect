// ToastProvider.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, SnackbarProps } from 'react-native-paper';

interface ToastOptions {
  message: string;
  duration?: number; // in ms
  action?: SnackbarProps['action'];
  style?: SnackbarProps['style'];
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [toastOptions, setToastOptions] = useState<ToastOptions>({ message: '' });

  const showToast = (options: ToastOptions) => {
    setToastOptions(options);
    setVisible(true);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={toastOptions.duration || 3000}
        action={toastOptions.action}
        style={toastOptions.style}
      >
        {toastOptions.message}
      </Snackbar>
    </ToastContext.Provider>
  );
};

// Custom hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context.showToast;
};
