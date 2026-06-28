import { supabase } from "@/lib/supabase";

export interface DashboardStats {
  memberCount: number;
  messageCount: number;
  channelCount: number;
}

export async function getStats(): Promise<DashboardStats> {
  const [members, messages, channels] = await Promise.all([
    supabase.from("channel_members").select("user_id", { count: "exact", head: true }),
    supabase.from("messages").select("id", { count: "exact", head: true }),
    supabase.from("channels").select("id", { count: "exact", head: true }),
  ]);

  return {
    memberCount: members.count ?? 0,
    messageCount: messages.count ?? 0,
    channelCount: channels.count ?? 0,
  };
}

export interface ActivityItem {
  user: string;
  action: string;
  target: string;
  time: string;
  timestamp: string;
}

export async function getRecentActivity(limit = 5): Promise<ActivityItem[]> {
  const { data } = await supabase
    .from("messages")
    .select("sender_email, content, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!data) return [];

  return (data as { sender_email: string; content: string; created_at: string }[]).map((msg) => ({
    user: msg.sender_email.split("@")[0],
    action: "sent a message",
    target: msg.content.length > 50 ? msg.content.slice(0, 50) + "..." : msg.content,
    time: timeAgo(msg.created_at),
    timestamp: msg.created_at,
  }));
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
