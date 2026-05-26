/**
 * Telegram WebApp SDK Helper Bridge for React
 * Integrates our application with the Telegram Mini App environment and provides fallbacks for standard web browsers.
 */

class TelegramHelper {
  constructor() {
    this.tg = typeof window !== 'undefined' && window.Telegram ? window.Telegram.WebApp : null;
    this.isTelegram = !!this.tg;
    this.init();
  }

  init() {
    if (this.isTelegram) {
      console.log("Telegram WebApp SDK initialized inside React.");
      this.tg.ready();
      this.tg.expand(); // Expand to full height of Telegram window
      this.syncTheme();
    } else {
      console.log("Running in standard browser mode. Telegram SDK emulated.");
    }
  }

  syncTheme() {
    if (!this.isTelegram) return;
    try {
      this.tg.setHeaderColor('#12131a');
      this.tg.setBackgroundColor('#12131a');
    } catch (e) {
      console.error("Theme sync failed", e);
    }
  }

  getUserInfo() {
    if (this.isTelegram && this.tg.initDataUnsafe && this.tg.initDataUnsafe.user) {
      return this.tg.initDataUnsafe.user;
    }
    return {
      first_name: "Created by",
      last_name: "Texan",
      username: "texan_partner",
      language_code: "uz"
    };
  }

  triggerHaptic(type = 'medium') {
    if (this.isTelegram && this.tg.HapticFeedback) {
      try {
        if (['success', 'warning', 'error'].includes(type)) {
          this.tg.HapticFeedback.notificationOccurred(type);
        } else {
          this.tg.HapticFeedback.impactOccurred(type);
        }
      } catch (e) {
        console.error("Haptics trigger failed", e);
      }
    } else {
      console.log(`[Haptic Simulated] ${type}`);
    }
  }

  /**
   * Configure and show Telegram MainButton
   */
  showMainButton(text, onClickCallback) {
    if (this.isTelegram) {
      try {
        this.tg.MainButton.text = text;
        this.tg.MainButton.textColor = "#12131a";
        this.tg.MainButton.color = "#ff9f1c"; // Accent gold/amber color
        this.tg.MainButton.show();
        
        this.tg.MainButton.offClick();
        this.tg.MainButton.onClick(onClickCallback);
      } catch (e) {
        console.error("MainButton setup failed", e);
      }
    } else {
      // Fallback managed inside React UI natively (we will render standard button if not in TG)
      console.log(`[Telegram Main Button Set] "${text}"`);
    }
  }

  hideMainButton() {
    if (this.isTelegram) {
      try {
        this.tg.MainButton.hide();
      } catch (e) {
        console.error("MainButton hide failed", e);
      }
    }
  }

  showBackButton(onClickCallback) {
    if (this.isTelegram) {
      try {
        this.tg.BackButton.show();
        this.tg.BackButton.offClick();
        this.tg.BackButton.onClick(onClickCallback);
      } catch (e) {
        console.error("BackButton setup failed", e);
      }
    }
  }

  hideBackButton() {
    if (this.isTelegram) {
      try {
        this.tg.BackButton.hide();
      } catch (e) {
        console.error("BackButton hide failed", e);
      }
    }
  }

  sendOrderAndClose(orderData) {
    this.triggerHaptic('success');
    if (this.isTelegram) {
      try {
        this.tg.sendData(JSON.stringify(orderData));
        this.tg.close();
      } catch (e) {
        console.error("SendData failed, closing app.", e);
        this.tg.close();
      }
    } else {
      console.log("Order finalized & sent: ", orderData);
    }
  }
}

export const tgBridge = new TelegramHelper();
export default tgBridge;
