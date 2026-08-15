import type { SubscriptionAdapter } from "../../core/contracts";

export const subscriptionAdapter: SubscriptionAdapter = Object.freeze({
  isEnabled: () => false,
  async subscribe() {
    return { ok: false, message: "订阅功能尚未启用" };
  },
});
