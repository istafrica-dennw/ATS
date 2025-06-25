import { toast as reactToast } from 'react-toastify';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'info' | 'warning';
}

export const useToast = () => {
  const toast = ({ title, description, variant = 'success' }: ToastProps) => {
    const message = description ? `${title}: ${description}` : title;
    
    switch (variant) {
      case 'success':
        reactToast.success(message);
        break;
      case 'error':
        reactToast.error(message);
        break;
      case 'info':
        reactToast.info(message);
        break;
      case 'warning':
        reactToast.warn(message);
        break;
      default:
        reactToast(message);
    }
  };

  return { toast };
}; 