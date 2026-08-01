import { type Notification, NotificationChannel, NotificationStatus } from "@tirbeo/types";

export interface NotificationInput {
  userId: string;
  organizationId?: string;
  applicationId?: string;
  title: string;
  body?: string;
  link?: string;
  icon?: string;
  priority?: number;
  channels?: NotificationChannel[];
}

export interface NotificationResult {
  notification: Notification;
  deliveries: { channel: NotificationChannel; status: NotificationStatus }[];
}

export async function createNotification(input: NotificationInput): Promise<NotificationResult> {
  const notification: Notification = {
    id: crypto.randomUUID(),
    userId: input.userId,
    organizationId: input.organizationId ?? null,
    applicationId: input.applicationId ?? null,
    title: input.title,
    body: input.body ?? null,
    link: input.link ?? null,
    icon: input.icon ?? null,
    priority: input.priority ?? 0,
    status: "PENDING",
    readAt: null,
    createdAt: new Date().toISOString(),
  };

  const deliveries: { channel: NotificationChannel; status: NotificationStatus }[] = [];

  for (const channel of input.channels ?? ["IN_APP"]) {
    deliveries.push({ channel, status: "PENDING" });
  }

  return { notification, deliveries };
}

export async function markAsRead(notificationId: string): Promise<void> {
}

export async function markAllAsRead(userId: string): Promise<void> {
}
