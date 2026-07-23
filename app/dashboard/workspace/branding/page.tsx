"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Palette, Upload, Trash2, Plus, Globe, Download, Eye } from "lucide-react";

var API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Branding = {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  isPublic: boolean;
  customDomainStatus: string;
  updatedAt: string;
};

export default function WorkspaceBrandingPage() {
  var [brandings, setBrandings] = useState<Branding[]>([]);
  var [loading, setLoading] = useState(true);
  var [showCreate, setShowCreate] = useState(false);
  var [name, setName] = useState("");
  var [primaryColor, setPrimaryColor] = useState("#d8b36a");
  var [secondaryColor, setSecondaryColor] = useState("#f2eee8");
  var [fontFamily, setFontFamily] = useState("Inter");
  var fetched = useRef(false);

  useEffect(function () {
    if (fetched.current) return;
    fetched.current = true;
    var url = API + "/api/workspaces/1/branding/workspaces";
    fetch(url, { credentials: "include" })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) { setBrandings(Array.isArray(data) ? data : []); })
      .catch(function () {})
      .finally(function () { setLoading(false); });
  }, []);

  var create = useCallback(function () {
    if (!name) return;
    var url = API + "/api/workspaces/1/branding/workspaces";
    fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name, primaryColor: primaryColor, secondaryColor: secondaryColor, fontFamily: fontFamily }),
    }).then(function (res) {
      if (res.ok) return res.json();
      throw new Error("Failed");
    }).then(function (b) {
      setBrandings(function (prev) { return prev.concat([b]); });
      setShowCreate(false);
      setName("");
    }).catch(function () {});
  }, [name, primaryColor, secondaryColor, fontFamily]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(function (i) {
          return <div key={i} className="glass card-section animate-pulse" style={{ height: 80 }} />;
        })}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Workspace Branding</h1>
        <p className="text-sm text-muted-foreground">Manage your workspace custom branding and domains</p>
      </div>

      <div className="glass card-section">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Your Brandings</h3>
            <p className="text-xs text-muted-foreground">{brandings.length} custom workspaces</p>
          </div>
          <button onClick={function () { setShowCreate(!showCreate); }} className="btn btn-primary text-xs">
            <Plus size={13} /> New Branding
          </button>
        </div>

        {brandings.length === 0 ? (
          <div className="text-center py-12">
            <Palette size={48} style={{ color: "#7b7e84", margin: "0 auto 12px" }} />
            <p className="text-sm text-muted-foreground">No custom brandings created</p>
          </div>
        ) : (
          <div className="space-y-3">
            {brandings.map(function (b) {
              return (
                <div key={b.id} className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: b.primaryColor }} />
                      <div>
                        <p className="text-sm font-medium text-white">{b.name}</p>
                        <p className="text-xs text-muted-foreground">{b.fontFamily} font</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-muted-foreground">
                        {b.isPublic ? "Public" : "Private"}
                      </span>
                      <button className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-muted-foreground hover:text-red-400">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showCreate && (
          <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
            <input placeholder="Workspace name" value={name} onChange={function (e) { setName(e.target.value); }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Primary Color</label>
                <input type="color" value={primaryColor} onChange={function (e) { setPrimaryColor(e.target.value); }}
                  className="w-full h-9 rounded cursor-pointer bg-transparent" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Secondary Color</label>
                <input type="color" value={secondaryColor} onChange={function (e) { setSecondaryColor(e.target.value); }}
                  className="w-full h-9 rounded cursor-pointer bg-transparent" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Font Family</label>
                <select value={fontFamily} onChange={function (e) { setFontFamily(e.target.value); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="Inter">Inter</option>
                  <option value="System">System</option>
                  <option value="JetBrains Mono">JetBrains Mono</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={create} className="btn btn-primary text-xs">Create Branding</button>
              <button onClick={function () { setShowCreate(false); }} className="btn btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div className="glass card-section">
        <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="btn btn-primary text-xs"><Upload size={13} /> Upload Logo</button>
          <button className="btn btn-primary text-xs"><Globe size={13} /> Configure Domain</button>
          <button className="btn btn-ghost text-xs"><Download size={13} /> Download Assets</button>
          <button className="btn btn-ghost text-xs"><Eye size={13} /> Preview Branding</button>
        </div>
      </div>
    </div>
  );
}
