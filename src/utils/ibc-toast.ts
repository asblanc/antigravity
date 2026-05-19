import toast from 'react-hot-toast';

const ibcGreen = '#10b981'; // Emerald - IBC primary color
const ibcGold = '#f59e0b'; // Amber - IBC accent color

/**
 * Success toast with IBC styling (green)
 */
export function ibcToastSuccess(message: string) {
  return toast.success(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: ibcGreen,
      color: 'white',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
    },
    icon: '✅',
  });
}

/**
 * Error toast with IBC styling (amber/gold)
 */
export function ibcToastError(message: string) {
  return toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: ibcGold,
      color: '#1f2937',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
    },
    icon: '⚠️',
  });
}

/**
 * Info toast with IBC styling (green)
 */
export function ibcToastInfo(message: string) {
  return toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: ibcGreen,
      color: 'white',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
    },
    icon: 'ℹ️',
  });
}

/**
 * Loading toast (persistent until dismissed)
 */
export function ibcToastLoading(message: string) {
  return toast.loading(message, {
    position: 'top-right',
    style: {
      background: ibcGreen,
      color: 'white',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
    },
  });
}
