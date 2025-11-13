"use client";
import SubscriptionPopup from "./SubscriptionPopup";

export default function SubscriptionWrapper() {
  return (
    <SubscriptionPopup
      isSubscribed={false}
      onSubscribe={() => alert("Redirecting to subscription page...")}
    />
  );
}
