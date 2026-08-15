export const subscriptionAdapter = Object.freeze({
  isEnabled() {
    return false;
  },

  async subscribe() {
    return { ok: false, message: "订阅功能尚未启用" };
  },
});
