import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  Contact,
  Gift,
  Globe,
  Images,
  IndianRupee,
  Layers,
  MessageCircle,
  Palette,
  QrCode,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Users,
} from "lucide-react";

import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { Gate } from "./Gate";
import { UpgradeCard } from "./UpgradeCard";
import { useAppConfig } from "../lib/useAppConfig";
import { useClaimFlow } from "../lib/useClaimFlow";

/**
 * The iKundli storefront — Sukuna's India landing, re-authored as native
 * Portal components.
 *
 * Same codebase, same claim flow, same auth gates, same renderer: this
 * is a WIREFRAME, selected by LINKS_BRAND_KEY, not a fork. Everything
 * the visitor touches (availability, claim, upgrade) is the real
 * product — only the marketing surface changes.
 *
 * Design register: warm porcelain. The `kundli` app theme supplies the
 * tokens (near-white canvas, near-black ink, Instrument Serif display
 * over Outfit, marigold accent), so this file styles with the SAME
 * token classes every other page uses — no hard-coded palette, and the
 * theme switcher keeps working.
 *
 * Honest by construction: prices come from /api/config (the numbers the
 * gates actually enforce), and the model is pay-once — Mark's call,
 * 8/21, overriding the mock's monthly tiers. We do not print a
 * subscription we do not charge.
 */

// ── Section scaffolding ──────────────────────────────────────────────
function Section({
  id,
  kicker,
  title,
  lead,
  children,
  className = "",
}: {
  id?: string;
  kicker?: string;
  title?: React.ReactNode;
  lead?: string;
  children?: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <section id={id} className={`w-full max-w-5xl mx-auto px-5 py-16 sm:py-24 scroll-mt-24 ${className}`}>
      {kicker && <p className="kicker text-center">{kicker}</p>}
      {title && (
        <h2 className="font-display text-3xl sm:text-5xl text-center mt-3 leading-[1.05]">{title}</h2>
      )}
      {lead && (
        <p className="text-fg-muted text-center mt-4 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
          {lead}
        </p>
      )}
      {children}
    </section>
  );
}

/** The hero's converging map — the zip's scroll-canvas idea, rebuilt as
 *  ~4KB of DOM instead of 7.3MB of JPEG frames. India's mobile-first
 *  internet was the whole pitch; the hero has to honor it. */
function ConvergenceHero({ brand }: { brand: string }): React.ReactElement {
  const chips = [
    { icon: MessageCircle, label: "WhatsApp", sub: "Chat with me" },
    { icon: IndianRupee, label: "UPI", sub: "Pay or support" },
    { icon: Images, label: "Portfolio", sub: "My work" },
    { icon: ShoppingBag, label: "My store", sub: "Products" },
    { icon: Contact, label: "Save contact", sub: "One tap" },
    { icon: QrCode, label: "Vector QR", sub: "Print-grade" },
  ];
  return (
    <div className="relative mt-12 w-full max-w-3xl mx-auto" aria-hidden>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {chips.map(({ icon: Icon, label, sub }, i) => (
          <div
            key={label}
            className="panel px-4 py-3.5 flex items-center gap-3 animate-slide-up"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span className="w-9 h-9 rounded-xl bg-accent/10 text-accent-soft inline-flex items-center justify-center shrink-0">
              <Icon size={16} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold truncate">{label}</span>
              <span className="block text-[11px] text-fg-subtle truncate">{sub}</span>
            </span>
          </div>
        ))}
      </div>
      {/* The converge line — everything above funnels into one handle. */}
      <div className="flex flex-col items-center mt-6">
        <span className="w-px h-10 bg-gradient-to-b from-transparent via-accent/40 to-accent/70" />
        <div className="panel px-7 py-4 shadow-card-hover">
          <span className="font-display text-2xl sm:text-3xl tracking-[0.18em] uppercase">{brand}</span>
        </div>
        <p className="text-[11px] text-fg-subtle mt-3 font-medium">one link · every surface</p>
      </div>
    </div>
  );
}

export function KundliLanding(): React.ReactElement {
  const cfg = useAppConfig();
  const brand = cfg?.brandName ?? "Kundli";
  const flow = useClaimFlow();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [host, setHost] = useState("kundli.in");

  useEffect(() => {
    setHost(window.location.host);
  }, []);

  const money = useMemo(() => {
    const cur = cfg?.currency ?? "USD";
    const sym = cur === "INR" ? "₹" : cur === "USD" ? "$" : "";
    return { cur, sym };
  }, [cfg]);

  const freeBlocks = cfg?.freeBlockLimit ?? 3;
  const premiumProfiles = cfg?.premiumProfileLimit ?? 2;

  const badge: Record<string, React.ReactElement | null> = {
    idle: null,
    checking: <span className="text-fg-muted text-sm">checking…</span>,
    available: <span className="text-signal-green text-sm font-semibold">✓ available</span>,
    taken: <span className="text-signal-red text-sm font-semibold">taken</span>,
    invalid: <span className="text-signal-amber text-sm font-semibold">2–40 chars, a–z 0–9 -</span>,
  };

  const claimBox = (
    <section id="claim" className="w-full max-w-xl mx-auto panel p-6 sm:p-8 scroll-mt-24">
      {flow.claimed ? (
        <div className="text-center">
          <p className="kicker">your kundli is live</p>
          <h3 className="font-display text-3xl mt-2">
            {host}/{flow.claimed.handle}
          </h3>
          <p className="text-fg-muted text-sm mt-3">
            {flow.published
              ? "Published. Share it anywhere — the page, the card, the QR."
              : "Claimed. Publish it and every surface goes live at once."}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-2">
            {!flow.published && (
              <button
                onClick={() => void flow.publish()}
                disabled={flow.busy}
                className="btn btn-primary !py-3 col-span-2"
              >
                {flow.busy ? "Publishing…" : "Publish my Kundli"}
              </button>
            )}
            <a href={`/${flow.claimed.handle}`} className="btn btn-secondary !py-3">
              View page
            </a>
            <a href={`/edit/${encodeURIComponent(flow.claimed.identityId)}`} className="btn btn-secondary !py-3">
              Edit
            </a>
          </div>
        </div>
      ) : (
        <>
          <label className="label">Claim your handle</label>
          <div className="flex items-center gap-2 bg-ink-850 border border-ink-700 rounded-2xl px-4 py-3">
            <span className="font-mono text-sm text-fg-subtle shrink-0">{host}/</span>
            <input
              ref={inputRef}
              value={flow.handle}
              onChange={(e) => flow.setHandle(e.target.value)}
              placeholder="yourname"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="flex-1 min-w-0 bg-transparent outline-none text-fg placeholder:text-fg-faint font-mono"
            />
            {badge[flow.availability]}
          </div>
          <label className="label mt-4">Display name</label>
          <input
            value={flow.displayName}
            onChange={(e) => flow.setDisplayName(e.target.value)}
            placeholder="Your name or brand"
            className="field"
          />
          <button
            onClick={() => void flow.claim()}
            disabled={flow.busy || flow.availability !== "available"}
            className="btn btn-primary w-full !py-3.5 !text-base mt-5"
          >
            {flow.busy ? "Claiming…" : "Create your Kundli"}
            <ArrowRight size={16} />
          </button>
          {flow.error && <p className="mt-3 text-signal-red text-sm text-center">{flow.error}</p>}
          <p className="text-[11px] text-fg-subtle text-center mt-4">
            Free forever · no card required · your handle is yours in 60 seconds
          </p>
        </>
      )}
    </section>
  );

  return (
    <>
      <Nav />
      <main>
        {/* ── Hero ────────────────────────────────────────────────── */}
        <section className="w-full max-w-5xl mx-auto px-5 pt-14 pb-8 text-center">
          <p className="kicker">your digital identity, mapped</p>
          <h1 className="font-display text-[2.75rem] sm:text-7xl mt-4 leading-[0.98]">
            Everything you are.
            <br />
            <span className="text-accent">One link.</span>
          </h1>
          <p className="text-fg-muted mt-5 text-lg max-w-2xl mx-auto leading-relaxed">
            Bring your social profiles, content, portfolio, products, bookings, payments and
            community together in one beautiful place. Built for how India connects — and ready
            for the world.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href="#claim" className="btn btn-primary !py-3 !px-7 !text-base">
              Create your {brand} <ArrowRight size={16} />
            </a>
            <a href="/demo" className="btn btn-secondary !py-3 !px-6">
              See a finished page ↗
            </a>
          </div>
          <ConvergenceHero brand={brand} />
        </section>

        {/* ── The dilemma ─────────────────────────────────────────── */}
        <Section
          kicker="the digital dilemma"
          title="Your internet is scattered."
          lead="Everything you create, share, sell and do lives in a different app — and your audience has to hunt for it."
        >
          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            <div className="panel p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-fg-subtle">
                Scattered everywhere
              </p>
              <ul className="mt-4 grid gap-2 text-sm text-fg-muted">
                {[
                  "A bio link that only holds one thing",
                  "DMs asking for the same booking link",
                  "Payment details retyped a hundred times",
                  "Work spread across four platforms",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <span className="text-fg-faint mt-0.5">✕</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel p-6 !border-accent/40">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-soft">
                Converging into one place
              </p>
              <ul className="mt-4 grid gap-2 text-sm text-fg-muted">
                {[
                  "One handle that holds all of it",
                  "One tap to WhatsApp, booking, or pay",
                  "One QR for the counter and the card",
                  "One page you actually own",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <Check size={15} className="text-signal-green shrink-0 mt-0.5" strokeWidth={3} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* ── Built for India ─────────────────────────────────────── */}
        <Section
          id="features"
          kicker="built for india"
          title="Built for how India connects."
          lead="Deeply integrated with WhatsApp, UPI and mobile-first behaviour — designed for global reach."
        >
          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            {[
              {
                Icon: MessageCircle,
                title: "1-tap WhatsApp",
                copy: "Start conversations instantly. No forms, no friction — visitors become client dialogues.",
              },
              {
                Icon: IndianRupee,
                title: "Instant UPI payments",
                copy: "Get paid straight to your bank. GPay, PhonePe, Paytm and CRED, in rupees, no middlemen.",
              },
              {
                Icon: QrCode,
                title: "Print-grade vector QR",
                copy: "Export SVG and high-res PNG for cards, merch, invoices and events — with brand colors.",
              },
              {
                Icon: Smartphone,
                title: "Mobile-first internet",
                copy: "One small HTML page for visitors — no client JavaScript, so it opens fast on any 4G phone.",
              },
            ].map(({ Icon, title, copy }) => (
              <div key={title} className="panel p-6">
                <span className="w-10 h-10 rounded-2xl bg-accent/10 text-accent-soft inline-flex items-center justify-center">
                  <Icon size={18} />
                </span>
                <h3 className="font-display text-2xl mt-4">{title}</h3>
                <p className="text-fg-muted text-sm mt-2 leading-relaxed">{copy}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── What you get ────────────────────────────────────────── */}
        <Section
          kicker="next-gen personal ecosystem"
          title="A link isn't enough anymore."
          lead="Your audience expects an experience. Kundli turns your bio into a fast mobile storefront and personal mini-site."
        >
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { Icon: Images, title: "Photo galleries", copy: "Show your work — a swipeable portfolio right on your page." },
              { Icon: Gift, title: "Giveaways people trust", copy: "Run a giveaway anyone can check was honest. Every draw on the record." },
              { Icon: BarChart3, title: "Real-time intelligence", copy: "See where your audience comes from and which links earn real intent." },
              { Icon: Contact, title: "Save my contact", copy: "Visitors add you to their phone in one tap — name, links and all." },
              { Icon: Palette, title: "Bespoke presets", copy: "Themes, gradients, photo backgrounds and a vault of typefaces." },
              { Icon: Users, title: "Team access", copy: "Owners, editors and viewers — with a full record of who granted whom." },
            ].map(({ Icon, title, copy }) => (
              <div key={title} className="panel p-5">
                <span className="w-9 h-9 rounded-xl bg-accent/10 text-accent-soft inline-flex items-center justify-center">
                  <Icon size={16} />
                </span>
                <p className="font-semibold mt-3">{title}</p>
                <p className="text-sm text-fg-muted mt-1.5 leading-relaxed">{copy}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Commerce roadmap — labelled honestly ────────────────── */}
        <Section
          kicker="creator commerce · in build"
          title="Turn attention into action."
          lead="Digital downloads, paid bookings and direct UPI checkout — monetize without middlemen."
        >
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { Icon: ShoppingBag, t: "Digital products", s: "Instant delivery by email" },
              { Icon: Layers, t: "Paid bookings", s: "1:1 slots on your calendar" },
              { Icon: Sparkles, t: "AI bio & palette", s: "Describe your craft, get a page" },
            ].map(({ Icon, t, s }) => (
              <div key={t} className="panel p-5 flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-accent/10 text-accent-soft inline-flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </span>
                <span>
                  <span className="block font-semibold text-sm">{t}</span>
                  <span className="block text-xs text-fg-subtle mt-0.5">{s}</span>
                </span>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] text-fg-subtle mt-5">
            Shipping next — everything above this section is live today.
          </p>
        </Section>

        {/* ── Pricing: PAY ONCE (Mark's call, 8/21) ───────────────── */}
        <Section
          id="pricing"
          kicker="transparent pricing"
          title="Free is a full thing. Premium is forever."
          lead="Start completely free. Upgrade once when you want more — never a subscription, never monthly."
        >
          <div className="mt-10 grid md:grid-cols-2 gap-4 items-stretch max-w-3xl mx-auto">
            <div className="panel p-6">
              <p className="font-display text-2xl">Free, forever</p>
              <p className="text-sm text-fg-muted mt-1">No card. No trial clock.</p>
              <p className="font-display text-5xl mt-5">{money.sym}0</p>
              <ul className="mt-6 grid gap-2.5 text-sm">
                {[
                  "Your handle and your page",
                  `A full page — ${freeBlocks} blocks of any kind`,
                  "Every theme and background",
                  "Print-grade QR code",
                  "Save-my-contact for visitors",
                  "Live stats — views, scans, clicks",
                ].map((li) => (
                  <li key={li} className="flex items-start gap-2.5">
                    <Check size={15} className="text-signal-green shrink-0 mt-0.5" strokeWidth={3} />
                    <span className="text-fg-muted">{li}</span>
                  </li>
                ))}
              </ul>
              <a href="#claim" className="btn btn-secondary w-full !py-2.5 mt-6">
                Claim yours free
              </a>
            </div>
            <div className="panel p-6 !border-accent/40 relative">
              <span className="absolute top-4 right-4 chip !text-[10px] font-bold uppercase tracking-wider text-accent-soft">
                pay once
              </span>
              <p className="font-display text-2xl inline-flex items-center gap-2">
                <BadgeCheck size={18} className="text-accent-soft" /> Premium
              </p>
              <p className="text-sm text-fg-muted mt-1">
                Whatever it's worth to you, one time. <b className="text-fg">No subscription. Ever.</b>
              </p>
              <p className="font-display text-5xl mt-5">
                {money.sym}
                <span className="text-fg-muted text-2xl align-middle ml-1">you choose</span>
              </p>
              <ul className="mt-6 grid gap-2.5 text-sm">
                {[
                  "Everything in free",
                  `Up to ${premiumProfiles} profiles`,
                  "Unlimited blocks",
                  "Photo galleries & the QR studio",
                  "Custom search snippet & share card",
                  "Giveaways, Discover listing, the font vault",
                  "Team access — owners, editors, viewers",
                ].map((li) => (
                  <li key={li} className="flex items-start gap-2.5">
                    <Check size={15} className="text-accent-soft shrink-0 mt-0.5" strokeWidth={3} />
                    <span className="text-fg-muted">{li}</span>
                  </li>
                ))}
              </ul>
              <a href="#claim" className="btn btn-primary w-full !py-2.5 mt-6">
                Start free — upgrade when ready
              </a>
            </div>
          </div>
        </Section>

        {/* ── The claim ───────────────────────────────────────────── */}
        <Section
          kicker="digital identity mapped"
          title="Claim your handle."
          lead="One single link. Infinite possibilities. Get yours before someone else does."
        >
          <div className="mt-10">
            {flow.locked ? (
              <div className="w-full max-w-xl mx-auto">
                <Gate
                  onReady={() => {
                    flow.setLocked(false);
                    void flow.claim();
                  }}
                />
              </div>
            ) : flow.needsUpgrade ? (
              <div className="w-full max-w-xl mx-auto">
                <UpgradeCard onUnlocked={() => flow.setNeedsUpgrade(false)} />
              </div>
            ) : (
              claimBox
            )}
          </div>
        </Section>

        {/* ── FAQ ─────────────────────────────────────────────────── */}
        <Section kicker="frequently asked questions" title="Got questions?">
          <div className="mt-10 grid gap-3 max-w-3xl mx-auto">
            {[
              {
                q: `How is ${brand} different from a traditional link-in-bio page?`,
                a: "Your page isn't a list of links — it's an identity. Galleries, giveaways, a print-grade QR, save-my-contact, live stats, and a public page that loads instantly on any phone because visitors get plain HTML, not an app.",
              },
              {
                q: "Is it really free?",
                a: `Yes. Your first page is free forever — ${freeBlocks} blocks, every theme, the QR code, save-my-contact and live stats. Premium is one payment, whatever it's worth to you. There is no subscription and no trial clock.`,
              },
              {
                q: "Can I use WhatsApp and UPI on my page?",
                a: "WhatsApp and UPI blocks are in build right now — one-tap chat and direct pay-to-your-bank, with no gateway lock-in. Everything else on this page is live today.",
              },
              {
                q: "Can I connect my own domain?",
                a: "Custom domains are on the roadmap. Today every page lives at your handle on this site, and the URL survives renames so printed QR codes never break.",
              },
              {
                q: "Can existing OurLynx users move over?",
                a: "Yes — it's the same engine underneath. Your links, themes and stats come with you.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="panel p-5">
                <h3 className="font-semibold">{q}</h3>
                <p className="text-sm text-fg-muted mt-2 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Closer ──────────────────────────────────────────────── */}
        <Section title="Make your corner of the internet iconic.">
          <p className="text-fg-muted text-center mt-3">
            Free forever. Your handle mapped in 60 seconds.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href="#claim" className="btn btn-primary !py-3 !px-8 !text-base">
              Create your {brand}
            </a>
            <a href="/discover" className="btn btn-secondary !py-3 !px-6">
              <Globe size={15} /> See who's here
            </a>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
