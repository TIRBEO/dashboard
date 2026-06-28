import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Calendar, Shield, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Member {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
  last_active: string | null;
  joined_at: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase
      .from("user_profiles")
      .select("user_id, display_name, avatar_url, created_at")
      .then(({ data: profiles }) => {
        if (!profiles) { setLoading(false); return; }
        const membersList: Member[] = profiles.map((p: any) => ({
          id: p.user_id,
          email: "",
          display_name: p.display_name || "Unknown",
          avatar_url: p.avatar_url,
          role: "member",
          last_active: null,
          joined_at: p.created_at,
        }));
        setMembers(membersList);
        setLoading(false);
      });
  }, []);

  const filtered = members.filter((m) =>
    m.display_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Members</h1>
          <p className="mt-1 text-sm text-ink-soft">{members.length} total members</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members..."
          className="w-full rounded-xl border border-border bg-secondary/50 pl-9 pr-4 py-2.5 text-sm text-foreground outline-none focus:border-foreground/30 placeholder:text-ink-soft/50"
        />
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-ink-soft" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-secondary/10 py-16 text-center">
          <Users className="h-10 w-10 text-ink-soft mb-3" />
          <p className="text-sm text-ink-soft">{search ? "No members match your search" : "No members found"}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
                  {m.avatar_url ? (
                    <img src={m.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    m.display_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{m.display_name}</p>
                  <div className="flex items-center gap-2 text-xs text-ink-soft">
                    <Shield className="h-3 w-3" />
                    <span className="capitalize">{m.role}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-ink-soft">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
