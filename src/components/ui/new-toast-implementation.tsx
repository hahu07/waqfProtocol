import { Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
}

export const Toast = ({ message, type = 'info', duration = 5000, onDismiss }: ToastProps) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onDismiss?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const typeStyles = {
    success: 'bg-green-50 text-green-800',
    error: 'bg-red-50 text-red-800',
    warning: 'bg-yellow-50 text-yellow-800',
    info: 'bg-blue-50 text-blue-800',
  };

  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className={`rounded-md p-4 ${typeStyles[type]} shadow-lg`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {type === 'success' && (
              <CheckCircleIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
            )}
            {type === 'error' && (
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
            )}
            {type === 'warning' && (
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" aria-hidden="true" />
            )}
            {type === 'info' && (
              <InformationCircleIcon className="h-5 w-5 text-blue-500" aria-hidden="true" />
            )}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              onClick={() => {
                setShow(false);
                onDismiss?.();
              }}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'onDismiss'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = {
      ...toast,
      onDismiss: () => removeToast(id),
    };

    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.message !== id));
  };

  return { toasts, addToast };
};

export const ToastContainer = ({ toasts }: { toasts: ToastProps[] }) => {
  return (
    <div className="fixed inset-x-0 bottom-0 px-3 py-4 pointer-events-none sm:px-6 sm:py-6 z-50">
      <div className="flex flex-col items-center space-y-3 sm:space-y-4">
        {toasts.map((toast, index) => (
          <Toast key={index} {...toast} />
        ))}
      </div>
    </div>
  );
};
