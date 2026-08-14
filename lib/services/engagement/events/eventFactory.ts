import type {
  EngagementActor,
  EngagementDeliveryChannel,
  EngagementEvent,
  EngagementEventType,
} from "../types";

export function createEngagementEvent<TPayload>({
  type,
  actor,
  payload,
  deliveryChannels,
}: {
  type: EngagementEventType;
  actor?: EngagementActor;
  payload: TPayload;
  deliveryChannels: EngagementDeliveryChannel[];
}): EngagementEvent<TPayload> {
  return {
    id: createEngagementEventId(),
    type,
    occurredAt: new Date().toISOString(),
    actor,
    payload,
    deliveryChannels,
  };
}

function createEngagementEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `engagement-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
