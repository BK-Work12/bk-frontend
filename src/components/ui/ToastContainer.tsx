'use client';

import { ToastContainer as ReactToastifyContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TOAST_AUTO_CLOSE = 4000;

/**
 * Client wrapper for react-toastify so it can render inside the server layout.
 * Uses only react-toastify; styling comes from globals.css (.varntix-toast-container).
 */
export function ToastContainer() {
  return (
    <ReactToastifyContainer
      position="top-center"
      autoClose={TOAST_AUTO_CLOSE}
      hideProgressBar={false}
      closeOnClick
      pauseOnHover
      draggable
      theme="dark"
    />
  );
}
