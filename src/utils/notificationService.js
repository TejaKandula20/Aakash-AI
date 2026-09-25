/**
 * notificationService.js
 * Multi-channel alert delivery service:
 * 1. Native Device OS Notifications (Web Notification API)
 * 2. Native Mobile / Desktop SMS Deep-links (sms: URI scheme)
 * 3. WhatsApp Direct Alert Messaging (wa.me API)
 */

class NotificationService {
  /**
   * Request browser notification permission if not already granted.
   */
  async requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      return 'denied';
    }
  }

  /**
   * Send a native browser OS push notification to the user's screen.
   */
  async sendSystemNotification({ title, body, icon = '/vite.svg', tag = 'aakash-alert', onClick }) {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Web Notifications are not supported in this browser.');
      return false;
    }

    let permission = Notification.permission;
    if (permission !== 'granted') {
      permission = await this.requestPermission();
    }

    if (permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon,
          tag,
          requireInteraction: true,
          silent: false
        });

        if (onClick && typeof onClick === 'function') {
          notif.onclick = () => {
            window.focus();
            onClick();
            notif.close();
          };
        }

        return true;
      } catch (err) {
        console.warn('Failed to display native system notification:', err);
        return false;
      }
    }

    return false;
  }

  /**
   * Clean and standardize any phone number string into digits and country code.
   * e.g., '+91 98480 11234' -> '919848011234'
   */
  formatCleanPhone(phone) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `91${digits}`; // Default to Indian ISD +91
    }
    return digits;
  }

  /**
   * Open the user's default native SMS messaging app with pre-filled recipient and text.
   */
  openNativeSms(phone, text) {
    const cleanDigits = this.formatCleanPhone(phone);
    const encodedText = encodeURIComponent(text);
    
    // Cross-platform SMS URL scheme
    // iOS uses 'sms:+1234567890&body=...' while Android/Desktop uses 'sms:+1234567890?body=...'
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    const smsUrl = `sms:+${cleanDigits}${separator}body=${encodedText}`;

    if (typeof window !== 'undefined') {
      const anchor = document.createElement('a');
      anchor.href = smsUrl;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }

    return smsUrl;
  }

  /**
   * Open direct WhatsApp chat with prefilled alert message.
   */
  openWhatsApp(phone, text) {
    const cleanDigits = this.formatCleanPhone(phone);
    const encodedText = encodeURIComponent(text);
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanDigits}&text=${encodedText}`;

    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }

    return waUrl;
  }
}

export const notificationService = new NotificationService();
