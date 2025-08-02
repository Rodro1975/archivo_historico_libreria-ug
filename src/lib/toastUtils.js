// src/lib/toastUtils.js
import { toast } from "react-hot-toast";

export const toastSuccess = (message) => toast.success(message);

export const toastError = (message) => toast.error(message);

export const toastInfo = (message) => toast(message);

export const toastLoading = (message) =>
  toast.loading(message, {
    duration: 4000, // o ajusta a null para mantenerlo hasta que se remueva manualmente
  });
