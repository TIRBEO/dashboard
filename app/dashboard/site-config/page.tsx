"use client";

import { useState, useEffect, useCallback } from "react";
import { Globe, Navigation, Megaphone, MessageSquare, HelpCircle, Mail, LayoutGrid, Package, Users, FileText, Eye, Save, RotateCcw, Plus, Trash2 } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, Input, Textarea, Skeleton, Toast, useToast } from "../components";

type Section = {
  section: string;
  data: Record<string, any>;
  description?: string;
  updated_at?: string;
};

var SECTIONS = [
  { key: "brand", label: "Brand", icon: Globe },
  { key: "navbar", label: "Navbar", icon: Navigation },
  { key: "hero", label: "Hero", icon: Megaphone },
  { key: "products", label: "Products", icon: Package },
  { key: "chat", label: "Chat", icon: MessageSquare },
  { key: "about", label: "About", icon: FileText },
  { key: "faq", label: "FAQ", icon: HelpCircle },
  { key: "newsletter", label: "Newsletter", icon: Mail },
  { key: "footer", label: "Footer", icon: LayoutGrid },
  { key: "testimonials", label: "Testimonials", icon: Users },
  { key: "preview", label: "Preview", icon: Eye },
];

function BiField({ label, value, section, field, updateBilingual }: {
  label: string; value: any; section: string; field: string;
  updateBilingual: (s: string, f: string, l: "en" | "ne", v: string) => void;
}) {
  var v = typeof value === "object" && value !== null ? value : { en: String(value || ""), ne: "" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      <Input value={v.en || ""} onChange={function(v2) { updateBilingual(section, field, "en", v2); }} placeholder="English" />
      <Input value={v.ne || ""} onChange={function(v2) { updateBilingual(section, field, "ne", v2); }} placeholder="Nepali" />
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      <Input value={value || ""} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}

function BrandEditor({ data, update }: { data: any; update: (s: string, k: string, v: any) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No brand data</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 500 }}>
      <Field label="Brand Name" value={data.name} onChange={function(v) { update("brand", "name", v); }} placeholder="Tirbeo" />
      <Field label="Logo URL" value={data.logo} onChange={function(v) { update("brand", "logo", v); }} placeholder="/logo.png" />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
        {data.logo && <img src={data.logo} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)" }} />}
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Logo preview</span>
      </div>
      <Field label="Home Link URL" value={data.logoHref} onChange={function(v) { update("brand", "logoHref", v); }} placeholder="https://tirbeo.app" />
    </div>
  );
}

function NavbarEditor({ data, config, update }: { data: any; config: any; update: (s: string, k: string, v: any) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No navbar data</p>;
  var links = data.links || [];
  var updateLink = function(i: number, field: string, value: any) {
    var newLinks = links.slice();
    newLinks[i] = Object.assign({}, newLinks[i], Object.fromEntries([[field, value]]));
    update("navbar", "links", newLinks);
  };
  var updateLinkLabel = function(i: number, lang: "en" | "ne", value: string) {
    var newLinks = links.slice();
    newLinks[i] = Object.assign({}, newLinks[i], { label: Object.assign({}, newLinks[i].label || {}, Object.fromEntries([[lang, value]])) });
    update("navbar", "links", newLinks);
  };
  var addLink = function() {
    update("navbar", "links", links.concat([{ key: "nav.new" + links.length, label: { en: "New Link", ne: "नयाँ लिङ्क" }, href: "#" }]));
  };
  var removeLink = function(i: number) {
    update("navbar", "links", links.filter(function(_: any, idx: number) { return idx !== i; }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>Navigation Links</h3>
          <Button variant="ghost" size="sm" onClick={addLink}><Plus size={12} /> Add Link</Button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {links.map(function(link: any, i: number) {
            return (
              <div key={i} style={{ padding: 16, borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>Link #{i + 1}</span>
                  <button onClick={function() { removeLink(i); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}>
                    <Trash2 size={12} />
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  <Field label="Key" value={link.key} onChange={function(v) { updateLink(i, "key", v); }} placeholder="nav.products" />
                  <Field label="URL" value={link.href} onChange={function(v) { updateLink(i, "href", v); }} placeholder="https://..." />
                  <Field label="Label (EN)" value={link.label?.en || ""} onChange={function(v) { updateLinkLabel(i, "en", v); }} />
                  <Field label="Label (NE)" value={link.label?.ne || ""} onChange={function(v) { updateLinkLabel(i, "ne", v); }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>Auth Buttons</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          <div style={{ padding: 16, borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 12 }}>Sign Up</p>
            <Field label="URL" value={data.signup?.href || ""} onChange={function(v) { update("navbar", "signup", Object.assign({}, data.signup, { href: v })); }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginTop: 8 }}>
              <Field label="Text EN" value={data.signup?.label?.en || ""} onChange={function(v) { update("navbar", "signup", Object.assign({}, data.signup, { label: Object.assign({}, data.signup?.label, { en: v }) })); }} />
              <Field label="Text NE" value={data.signup?.label?.ne || ""} onChange={function(v) { update("navbar", "signup", Object.assign({}, data.signup, { label: Object.assign({}, data.signup?.label, { ne: v }) })); }} />
            </div>
          </div>
          <div style={{ padding: 16, borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 12 }}>Login</p>
            <Field label="URL" value={data.login?.href || ""} onChange={function(v) { update("navbar", "login", Object.assign({}, data.login, { href: v })); }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginTop: 8 }}>
              <Field label="Text EN" value={data.login?.label?.en || ""} onChange={function(v) { update("navbar", "login", Object.assign({}, data.login, { label: Object.assign({}, data.login?.label, { en: v }) })); }} />
              <Field label="Text NE" value={data.login?.label?.ne || ""} onChange={function(v) { update("navbar", "login", Object.assign({}, data.login, { label: Object.assign({}, data.login?.label, { ne: v }) })); }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroEditor({ data, update, updateBilingual }: { data: any; update: (s: string, k: string, v: any) => void; updateBilingual: (s: string, f: string, l: "en" | "ne", v: string) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No hero data</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 600 }}>
      <BiField label="Tagline" value={data.tagline} section="hero" field="tagline" updateBilingual={updateBilingual} />
      <BiField label="Title" value={data.title} section="hero" field="title" updateBilingual={updateBilingual} />
      <BiField label="CTA Button Text" value={data.cta} section="hero" field="cta" updateBilingual={updateBilingual} />
      <Field label="Placeholder (EN)" value={data.placeholderEn} onChange={function(v) { update("hero", "placeholderEn", v); }} />
      <Field label="Placeholder (NE)" value={data.placeholderNe} onChange={function(v) { update("hero", "placeholderNe", v); }} />
      <Field label="Submitted Message (EN)" value={data.submittedEn} onChange={function(v) { update("hero", "submittedEn", v); }} />
      <Field label="Submitted Message (NE)" value={data.submittedNe} onChange={function(v) { update("hero", "submittedNe", v); }} />
    </div>
  );
}

function ProductsEditor({ data, config, update }: { data: any; config: any; update: (s: string, k: string, v: any) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No products data</p>;
  var items = data.items || [];
  var updateItem = function(i: number, field: string, value: any) {
    var newItems = items.slice();
    newItems[i] = Object.assign({}, newItems[i], Object.fromEntries([[field, value]]));
    update("products", "items", newItems);
  };
  var updateItemBilingual = function(i: number, field: string, lang: "en" | "ne", value: string) {
    var newItems = items.slice();
    newItems[i] = Object.assign({}, newItems[i], Object.fromEntries([[field, Object.assign({}, newItems[i][field] || {}, Object.fromEntries([[lang, value]]))]]));
    update("products", "items", newItems);
  };
  var addItem = function() {
    update("products", "items", items.concat([{ n: String(items.length + 1).padStart(2, "0"), name: { en: "New Product", ne: "नयाँ उत्पादन" }, category: { en: "", ne: "" }, cta: { en: "View", ne: "हेर्नुहोस्" }, href: "#", col1Top: "", col1Bottom: "", col2: "" }]));
  };
  var removeItem = function(i: number) {
    update("products", "items", items.filter(function(_: any, idx: number) { return idx !== i; }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <BiField label="Section Heading" value={data.heading} section="products" field="heading" updateBilingual={function(s, f, l, v) { update("products", "heading", Object.assign({}, data.heading || {}, Object.fromEntries([[l, v]]))); }} />

      {items.map(function(item: any, i: number) {
        return (
          <div key={i} style={{ padding: 16, borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>Product #{i + 1} — {item.n}</span>
              <button onClick={function() { removeItem(i); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                <Trash2 size={12} /> Remove
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              <Field label="Number" value={item.n} onChange={function(v) { updateItem(i, "n", v); }} placeholder="01" />
              <Field label="CTA URL" value={item.href} onChange={function(v) { updateItem(i, "href", v); }} />
              <Field label="Name (EN)" value={item.name?.en || ""} onChange={function(v) { updateItemBilingual(i, "name", "en", v); }} />
              <Field label="Name (NE)" value={item.name?.ne || ""} onChange={function(v) { updateItemBilingual(i, "name", "ne", v); }} />
              <Field label="CTA (EN)" value={item.cta?.en || ""} onChange={function(v) { updateItemBilingual(i, "cta", "en", v); }} />
              <Field label="CTA (NE)" value={item.cta?.ne || ""} onChange={function(v) { updateItemBilingual(i, "cta", "ne", v); }} />
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <Field label="Image Top-Left" value={item.col1Top} onChange={function(v) { updateItem(i, "col1Top", v); }} placeholder="https://..." />
              <Field label="Image Bottom-Left" value={item.col1Bottom} onChange={function(v) { updateItem(i, "col1Bottom", v); }} placeholder="https://..." />
              <Field label="Image Right" value={item.col2} onChange={function(v) { updateItem(i, "col2", v); }} placeholder="https://..." />
            </div>
          </div>
        );
      })}

      <Button variant="ghost" size="sm" onClick={addItem}><Plus size={14} /> Add Product</Button>
    </div>
  );
}

function ChatEditor({ data, update, updateBilingual }: { data: any; update: (s: string, k: string, v: any) => void; updateBilingual: (s: string, f: string, l: "en" | "ne", v: string) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No chat data</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 600 }}>
      <BiField label="Heading" value={data.heading} section="chat" field="heading" updateBilingual={updateBilingual} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
        <Textarea value={data.sub?.en || ""} onChange={function(v) { updateBilingual("chat", "sub", "en", v); }} placeholder="English description" />
        <Textarea value={data.sub?.ne || ""} onChange={function(v) { updateBilingual("chat", "sub", "ne", v); }} placeholder="Nepali description" />
      </div>
      <Field label="Peer Name" value={data.peer} onChange={function(v) { update("chat", "peer", v); }} placeholder="Tirbeo" />
      <BiField label="Placeholder" value={data.placeholder} section="chat" field="placeholder" updateBilingual={updateBilingual} />
      <BiField label="Encrypted Label" value={data.encrypted} section="chat" field="encrypted" updateBilingual={updateBilingual} />
      <BiField label="Join Button" value={data.joinBtn} section="chat" field="joinBtn" updateBilingual={updateBilingual} />
      <BiField label="Gated Message" value={data.gated} section="chat" field="gated" updateBilingual={updateBilingual} />
    </div>
  );
}

function AboutEditor({ data, config, update, updateBilingual }: { data: any; config: any; update: (s: string, k: string, v: any) => void; updateBilingual: (s: string, f: string, l: "en" | "ne", v: string) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No about data</p>;
  var paragraphs = data.paragraphs || [];
  var updateParagraph = function(i: number, lang: "en" | "ne", value: string) {
    var newP = paragraphs.slice();
    newP[i] = Object.assign({}, newP[i] || {}, Object.fromEntries([[lang, value]]));
    update("about", "paragraphs", newP);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 700 }}>
      <BiField label="Eyebrow" value={data.eyebrow} section="about" field="eyebrow" updateBilingual={updateBilingual} />
      <BiField label="Heading" value={data.heading} section="about" field="heading" updateBilingual={updateBilingual} />
      <BiField label="Scroll Label" value={data.scroll} section="about" field="scroll" updateBilingual={updateBilingual} />
      <BiField label="Mission" value={data.mission} section="about" field="mission" updateBilingual={updateBilingual} />

      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Paragraphs</label>
          <Button variant="ghost" size="sm" onClick={function() { update("about", "paragraphs", paragraphs.concat([{ en: "", ne: "" }])); }}>
            <Plus size={12} /> Add
          </Button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {paragraphs.map(function(p: any, i: number) {
            return (
              <div key={i} style={{ padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>#{i + 1}</span>
                  <button onClick={function() { update("about", "paragraphs", paragraphs.filter(function(_: any, idx: number) { return idx !== i; })); }}
                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2 }}>
                    <Trash2 size={12} />
                  </button>
                </div>
                <Textarea value={p.en || ""} onChange={function(v) { updateParagraph(i, "en", v); }} placeholder="English" rows={2} />
                <div style={{ marginTop: 8 }}>
                  <Textarea value={p.ne || ""} onChange={function(v) { updateParagraph(i, "ne", v); }} placeholder="Nepali" rows={2} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FaqEditor({ data, config, update, updateBilingual }: { data: any; config: any; update: (s: string, k: string, v: any) => void; updateBilingual: (s: string, f: string, l: "en" | "ne", v: string) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No FAQ data</p>;
  var items = data.items || [];
  var updateItem = function(i: number, field: string, lang: "en" | "ne", value: string) {
    var newItems = items.slice();
    newItems[i] = Object.assign({}, newItems[i], Object.fromEntries([[field, Object.assign({}, newItems[i][field] || {}, Object.fromEntries([[lang, value]]))]]));
    update("faq", "items", newItems);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 700 }}>
      <BiField label="Eyebrow" value={data.eyebrow} section="faq" field="eyebrow" updateBilingual={updateBilingual} />
      <BiField label="Heading" value={data.heading} section="faq" field="heading" updateBilingual={updateBilingual} />

      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Questions</label>
          <Button variant="ghost" size="sm" onClick={function() { update("faq", "items", items.concat([{ q: { en: "", ne: "" }, a: { en: "", ne: "" } }])); }}>
            <Plus size={12} /> Add
          </Button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map(function(item: any, i: number) {
            return (
              <div key={i} style={{ padding: 16, borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>Q#{i + 1}</span>
                  <button onClick={function() { update("faq", "items", items.filter(function(_: any, idx: number) { return idx !== i; })); }}
                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2 }}>
                    <Trash2 size={12} />
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Input value={item.q?.en || ""} onChange={function(v) { updateItem(i, "q", "en", v); }} placeholder="Question (EN)" />
                  <Input value={item.q?.ne || ""} onChange={function(v) { updateItem(i, "q", "ne", v); }} placeholder="Question (NE)" />
                  <Textarea value={item.a?.en || ""} onChange={function(v) { updateItem(i, "a", "en", v); }} placeholder="Answer (EN)" rows={2} />
                  <Textarea value={item.a?.ne || ""} onChange={function(v) { updateItem(i, "a", "ne", v); }} placeholder="Answer (NE)" rows={2} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NewsletterEditor({ data, update, updateBilingual }: { data: any; update: (s: string, k: string, v: any) => void; updateBilingual: (s: string, f: string, l: "en" | "ne", v: string) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No newsletter data</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 500 }}>
      <BiField label="Heading" value={data.heading} section="newsletter" field="heading" updateBilingual={updateBilingual} />
      <BiField label="Subtext" value={data.sub} section="newsletter" field="sub" updateBilingual={updateBilingual} />
      <BiField label="Email Placeholder" value={data.emailPlaceholder} section="newsletter" field="emailPlaceholder" updateBilingual={updateBilingual} />
      <BiField label="Subscribe Button" value={data.subscribe} section="newsletter" field="subscribe" updateBilingual={updateBilingual} />
      <BiField label="Subscribed Message" value={data.subscribed} section="newsletter" field="subscribed" updateBilingual={updateBilingual} />
      <BiField label="Spam Disclaimer" value={data.spam} section="newsletter" field="spam" updateBilingual={updateBilingual} />
    </div>
  );
}

function FooterEditor({ data, config, update }: { data: any; config: any; update: (s: string, k: string, v: any) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No footer data</p>;

  var updateColLink = function(ci: number, li: number, field: string, value: any) {
    var cols = (data.columns || []).slice();
    var links = (cols[ci]?.links || []).slice();
    links[li] = Object.assign({}, links[li], Object.fromEntries([[field, value]]));
    cols[ci] = Object.assign({}, cols[ci], { links: links });
    update("footer", "columns", cols);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 700 }}>
      <BiField label="Tagline" value={data.tagline} section="footer" field="tagline" updateBilingual={function(s, f, l, v) { update("footer", "tagline", Object.assign({}, data.tagline || {}, Object.fromEntries([[l, v]]))); }} />
      <BiField label="Copyright" value={data.rights} section="footer" field="rights" updateBilingual={function(s, f, l, v) { update("footer", "rights", Object.assign({}, data.rights || {}, Object.fromEntries([[l, v]]))); }} />

      {(data.columns || []).map(function(col: any, ci: number) {
        return (
          <div key={ci} style={{ padding: 16, borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 12 }}>Column: {col.title?.en}</p>
            {(col.links || []).map(function(link: any, li: number) {
              return (
                <div key={li} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}>
                  <Input value={link.label?.en || ""} onChange={function(v) { updateColLink(ci, li, "label", Object.assign({}, link.label, { en: v })); }} placeholder="EN" />
                  <Input value={link.label?.ne || ""} onChange={function(v) { updateColLink(ci, li, "label", Object.assign({}, link.label, { ne: v })); }} placeholder="NE" />
                  <Input value={link.href || ""} onChange={function(v) { updateColLink(ci, li, "href", v); }} placeholder="URL" />
                </div>
              );
            })}
          </div>
        );
      })}

      <div>
        <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>Social Links</label>
        {(data.connect || []).map(function(c: any, i: number) {
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}>
              <Input value={c.label || ""} onChange={function(e) {
                var arr = data.connect.slice(); arr[i] = Object.assign({}, arr[i], { label: e }); update("footer", "connect", arr);
              }} placeholder="Label" />
              <Input value={c.icon || ""} onChange={function(e) {
                var arr = data.connect.slice(); arr[i] = Object.assign({}, arr[i], { icon: e }); update("footer", "connect", arr);
              }} placeholder="Icon" />
              <Input value={c.href || ""} onChange={function(e) {
                var arr = data.connect.slice(); arr[i] = Object.assign({}, arr[i], { href: e }); update("footer", "connect", arr);
              }} placeholder="URL" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TestimonialsEditor({ data, config, update, updateBilingual }: { data: any; config: any; update: (s: string, k: string, v: any) => void; updateBilingual: (s: string, f: string, l: "en" | "ne", v: string) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No testimonials data</p>;
  var items = data.items || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 700 }}>
      <BiField label="Heading" value={data.heading} section="testimonials" field="heading" updateBilingual={updateBilingual} />
      <BiField label="Subtext" value={data.sub} section="testimonials" field="sub" updateBilingual={updateBilingual} />

      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Testimonials ({items.length})</label>
          <Button variant="ghost" size="sm" onClick={function() { update("testimonials", "items", items.concat([{ quote: { en: "", ne: "" }, name: "", role: "", avatar: "https://randomuser.me/api/portraits/lego/1.jpg" }])); }}>
            <Plus size={12} /> Add
          </Button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map(function(item: any, i: number) {
            return (
              <div key={i} style={{ padding: 16, borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {item.avatar && <img src={item.avatar} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />}
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>{item.name || "#" + (i + 1)}</span>
                  </div>
                  <button onClick={function() { update("testimonials", "items", items.filter(function(_: any, idx: number) { return idx !== i; })); }}
                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2 }}>
                    <Trash2 size={12} />
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Textarea value={item.quote?.en || ""} onChange={function(v) {
                    var arr = items.slice(); arr[i] = Object.assign({}, arr[i], { quote: Object.assign({}, arr[i].quote, { en: v }) }); update("testimonials", "items", arr);
                  }} placeholder="Quote (EN)" rows={2} />
                  <Textarea value={item.quote?.ne || ""} onChange={function(v) {
                    var arr = items.slice(); arr[i] = Object.assign({}, arr[i], { quote: Object.assign({}, arr[i].quote, { ne: v }) }); update("testimonials", "items", arr);
                  }} placeholder="Quote (NE)" rows={2} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                    <Input value={item.name || ""} onChange={function(v) {
                      var arr = items.slice(); arr[i] = Object.assign({}, arr[i], { name: v }); update("testimonials", "items", arr);
                    }} placeholder="Name" />
                    <Input value={item.role || ""} onChange={function(v) {
                      var arr = items.slice(); arr[i] = Object.assign({}, arr[i], { role: v }); update("testimonials", "items", arr);
                    }} placeholder="Role" />
                  </div>
                  <Input value={item.avatar || ""} onChange={function(v) {
                    var arr = items.slice(); arr[i] = Object.assign({}, arr[i], { avatar: v }); update("testimonials", "items", arr);
                  }} placeholder="Avatar URL" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PreviewEditor({ data, config, update }: { data: any; config: any; update: (s: string, k: string, v: any) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No preview data</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 600 }}>
      <Field label="Heading (EN)" value={data.heading?.en || ""} onChange={function(v) { update("preview", "heading", Object.assign({}, data.heading, { en: v })); }} />
      <Field label="Heading (NE)" value={data.heading?.ne || ""} onChange={function(v) { update("preview", "heading", Object.assign({}, data.heading, { ne: v })); }} />
      <Field label="Subtext (EN)" value={data.sub?.en || ""} onChange={function(v) { update("preview", "sub", Object.assign({}, data.sub, { en: v })); }} />
      <Field label="Subtext (NE)" value={data.sub?.ne || ""} onChange={function(v) { update("preview", "sub", Object.assign({}, data.sub, { ne: v })); }} />
      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
        Sidebar, communities, and feed posts are editable via direct Supabase dashboard or API.
      </p>
    </div>
  );
}

export default function SiteConfigPage() {
  var [config, setConfig] = useState<Record<string, any>>({});
  var [loading, setLoading] = useState(true);
  var [active, setActive] = useState("brand");
  var [saving, setSaving] = useState(false);
  var toast = useToast();

  var load = useCallback(function() {
    setLoading(true);
    fetch("/api/site-config", { cache: "no-store" })
      .then(function(r) { if (r.ok) return r.json(); })
      .then(function(data) { if (data) setConfig(data); })
      .catch(function() {})
      .finally(function() { setLoading(false); });
  }, []);

  useEffect(function() { load(); }, [load]);

  var save = async function(section: string) {
    setSaving(true);
    try {
      var _description = config[section]?._description;
      var _updated_at = config[section]?._updated_at;
      var data = Object.assign({}, config[section] || {});
      delete data._description;
      delete data._updated_at;
      var res = await fetch("/api/site-config", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: section, data: data }),
      });
      if (res.ok) toast.show(section + " saved");
      else toast.show("Failed: " + res.statusText, "error");
    } catch (e) {
      toast.show("Network error", "error");
    }
    setSaving(false);
  };

  var update = function(section: string, key: string, value: any) {
    setConfig(function(prev) {
      return Object.assign({}, prev, Object.fromEntries([[section, Object.assign({}, prev[section] || {}, Object.fromEntries([[key, value]]))]]));
    });
  };

  var updateBilingual = function(section: string, key: string, lang: "en" | "ne", value: string) {
    setConfig(function(prev) {
      return Object.assign({}, prev, Object.fromEntries([[section, Object.assign({}, prev[section] || {}, Object.fromEntries([[key, Object.assign({}, prev[section]?.[key] || {}, Object.fromEntries([[lang, value]]))]]))]]));
    });
  };

  if (loading) return <Skeleton count={4} height={80} />;

  return (
    <PageContainer>
      <PageHeader title="Site Config" description="Edit landing page content. Changes go live after saving."
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button variant="ghost" size="sm" onClick={load}><RotateCcw size={13} /> Refresh</Button>
            <Button variant="primary" size="sm" onClick={function() { save(active); }} disabled={saving}>
              <Save size={14} /> {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      />

      <div style={{ display: "flex", gap: 20, minHeight: 500 }}>
        {/* Desktop sidebar tabs */}
        <div style={{ width: 170, flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          {SECTIONS.map(function(s) {
            var Icon = s.icon;
            var isActive = active === s.key;
            return (
              <button key={s.key} onClick={function() { setActive(s.key); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8,
                  fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: "inherit",
                  textAlign: "left",
                  color: isActive ? "var(--text)" : "var(--text-secondary)",
                  background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
                }}>
                <Icon size={15} />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Mobile tabs */}
        <div style={{ display: "none", gap: 4, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
          {SECTIONS.map(function(s) {
            var Icon = s.icon;
            return (
              <button key={s.key} onClick={function() { setActive(s.key); }}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 9999,
                  fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", border: "1px solid " + (active === s.key ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)"),
                  cursor: "pointer", fontFamily: "inherit",
                  color: active === s.key ? "var(--text)" : "var(--text-muted)",
                  background: active === s.key ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                }}>
                <Icon size={12} />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {active === "brand" && <BrandEditor data={config.brand} update={update} />}
              {active === "navbar" && <NavbarEditor data={config.navbar} config={config} update={update} />}
              {active === "hero" && <HeroEditor data={config.hero} update={update} updateBilingual={updateBilingual} />}
              {active === "products" && <ProductsEditor data={config.products} config={config} update={update} />}
              {active === "chat" && <ChatEditor data={config.chat} update={update} updateBilingual={updateBilingual} />}
              {active === "about" && <AboutEditor data={config.about} config={config} update={update} updateBilingual={updateBilingual} />}
              {active === "faq" && <FaqEditor data={config.faq} config={config} update={update} updateBilingual={updateBilingual} />}
              {active === "newsletter" && <NewsletterEditor data={config.newsletter} update={update} updateBilingual={updateBilingual} />}
              {active === "footer" && <FooterEditor data={config.footer} config={config} update={update} />}
              {active === "testimonials" && <TestimonialsEditor data={config.testimonials} config={config} update={update} updateBilingual={updateBilingual} />}
              {active === "preview" && <PreviewEditor data={config.preview} config={config} update={update} />}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
