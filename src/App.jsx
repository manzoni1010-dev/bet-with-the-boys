import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xirjxhwvkeugwjigvfvw.supabase.co";
const SUPABASE_KEY = "sb_publishable_smv4fYOzC2mj9U0JfHpbmw_JnFGvUn_";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
const generateId = () => Math.random().toString(36).substring(2, 14);
const fmt = (n) => `$${Math.abs(n).toFixed(2)}`;

const COLORS = {
  bg: "#080b0f",
  card: "#111620",
  border: "#1e2a3a",
  accent: "#00e87c",
  accentDim: "#00e87c22",
  red: "#ff4757",
  redDim: "#ff475722",
  amber: "#ffa502",
  amberDim: "#ffa50222",
  text: "#f0f4f8",
  muted: "#5a6a7e",
  mutedLight: "#8a9bb0",
};

const styles = {
  app: { minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'DM Sans', sans-serif", position: "relative" },
  noiseBg: {
    position: "fixed", inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
    pointerEvents: "none", zIndex: 0,
  },
  container: { position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "0 16px" },
  card: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 },
  btn: (variant = "primary") => ({
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: variant === "sm" ? "8px 16px" : "13px 24px",
    borderRadius: 10, border: "none", cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
    fontSize: variant === "sm" ? 13 : 15, letterSpacing: 0.2, transition: "all 0.15s ease",
    ...(variant === "primary" ? { background: COLORS.accent, color: "#000" }
      : variant === "ghost" ? { background: "transparent", color: COLORS.mutedLight, border: `1px solid ${COLORS.border}` }
      : variant === "danger" ? { background: COLORS.redDim, color: COLORS.red, border: `1px solid ${COLORS.red}44` }
      : variant === "success" ? { background: COLORS.accentDim, color: COLORS.accent, border: `1px solid ${COLORS.accent}44` }
      : variant === "amber" ? { background: COLORS.amberDim, color: COLORS.amber, border: `1px solid ${COLORS.amber}44` }
      : { background: COLORS.accentDim, color: COLORS.accent, border: `1px solid ${COLORS.accent}44` }),
  }),
  input: {
    width: "100%", background: "#0d1117", border: `1px solid ${COLORS.border}`,
    borderRadius: 10, padding: "12px 14px", color: COLORS.text,
    fontFamily: "'DM Sans', sans-serif", fontSize: 15, outline: "none", boxSizing: "border-box",
  },
  label: { fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: COLORS.muted, display: "block", marginBottom: 6 },
  tag: (color) => ({
    display: "inline-block", padding: "3px 10px", borderRadius: 20,
    fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
    background: color === "green" ? COLORS.accentDim : color === "red" ? COLORS.redDim : color === "amber" ? COLORS.amberDim : "#ffffff11",
    color: color === "green" ? COLORS.accent : color === "red" ? COLORS.red : color === "amber" ? COLORS.amber : COLORS.mutedLight,
    border: `1px solid ${color === "green" ? COLORS.accent + "44" : color === "red" ? COLORS.red + "44" : color === "amber" ? COLORS.amber + "44" : COLORS.border}`,
  }),
};

export default function BetWithTheBoys() {
  const [screen, setScreen] = useState("landing");
  const [mode, setMode] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [groupNameInput, setGroupNameInput] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [groupData, setGroupData] = useState(null);
  const [activeTab, setActiveTab] = useState("open");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showSwitchUser, setShowSwitchUser] = useState(false);
  const [betDesc, setBetDesc] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  // Confirmation modal state
  const [pendingResult, setPendingResult] = useState(null); // { betId, result }
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Bebas+Neue&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    if (!groupCode) return;
    const poll = async () => {
      try {
        const { data } = await supabase
          .from("groups")
          .select("data")
          .eq("code", groupCode)
          .single();
        if (data) setGroupData(data.data);
      } catch (e) {}
    };
    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [groupCode]);

  const saveGroup = async (data) => {
    await supabase
      .from("groups")
      .upsert({ code: data.code, data: data, updated_at: new Date().toISOString() });
    setGroupData({ ...data });
  };

  const handleCreate = async () => {
    if (!nameInput.trim() || !groupNameInput.trim()) return setError("Fill in all fields.");
    setLoading(true);
    const uid = generateId();
    const code = generateCode();
    await saveGroup({ code, name: groupNameInput.trim(), members: [{ id: uid, name: nameInput.trim() }], bets: [], settlements: [], createdAt: Date.now() });
    setUserId(uid); setUserName(nameInput.trim()); setGroupCode(code); setScreen("group"); setLoading(false);
  };

  const handleJoin = async () => {
    if (!nameInput.trim() || !joinCode.trim()) return setError("Fill in all fields.");
    setLoading(true);
    const code = joinCode.trim().toUpperCase();
    try {
      const { data: result } = await supabase
        .from("groups")
        .select("data")
        .eq("code", code)
        .single();
      if (!result) { setError("Group not found. Check the code."); setLoading(false); return; }
      const group = result.data;
      const existing = group.members.find(m => m.name.toLowerCase() === nameInput.trim().toLowerCase());
      let uid = existing ? existing.id : generateId();
      if (!existing) group.members.push({ id: uid, name: nameInput.trim() });
      await saveGroup(group);
      setUserId(uid); setUserName(nameInput.trim()); setGroupCode(code); setGroupData(group); setScreen("group");
    } catch (e) { setError("Something went wrong. Try again."); }
    setLoading(false);
  };

  const handleOfferBet = async () => {
    if (!betDesc.trim()) return;
    const amount = parseFloat(betAmount);
    if (!amount || amount <= 0) return;
    const newBet = {
      id: generateId(), description: betDesc.trim(), amount,
      offererId: userId, offererName: userName,
      acceptorId: null, acceptorName: null,
      status: "open", offererResult: null, acceptorResult: null,
      createdAt: Date.now(),
    };
    await saveGroup({ ...groupData, bets: [newBet, ...groupData.bets] });
    setBetDesc(""); setBetAmount(""); setShowOfferModal(false);
  };

  const handleAccept = async (betId) => {
    await saveGroup({ ...groupData, bets: groupData.bets.map(b => b.id === betId ? { ...b, acceptorId: userId, acceptorName: userName, status: "active" } : b) });
  };

  // User clicks a result button — show confirmation modal first
  const handleResultClick = (betId, result) => {
    setPendingResult({ betId, result });
  };

  // User confirmed "Yes, I'm Sure"
  const handleConfirmResult = async () => {
    const { betId, result } = pendingResult;
    setPendingResult(null);
    const bet = groupData.bets.find(b => b.id === betId);
    const isOfferer = bet.offererId === userId;
    const offResult = isOfferer ? result : bet.offererResult;
    const accResult = isOfferer ? bet.acceptorResult : result;
    let updatedBet = { ...bet, [isOfferer ? "offererResult" : "acceptorResult"]: result };
    if (offResult && accResult) {
      if (offResult === "won" && accResult === "lost") {
        updatedBet = { ...updatedBet, status: "history", winner: bet.offererId, loser: bet.acceptorId };
      } else if (offResult === "lost" && accResult === "won") {
        updatedBet = { ...updatedBet, status: "history", winner: bet.acceptorId, loser: bet.offererId };
      } else if (offResult === "push" && accResult === "push") {
        updatedBet = { ...updatedBet, status: "history", push: true };
      } else {
        updatedBet = { ...updatedBet, status: "disputed" };
      }
    }
    await saveGroup({ ...groupData, bets: groupData.bets.map(b => b.id === betId ? updatedBet : b) });
  };

  const handleCancelBet = async (betId) => {
    await saveGroup({ ...groupData, bets: groupData.bets.filter(b => b.id !== betId) });
  };

  const handleMarkPaid = async (fromId) => {
    const currentNet = getNetBalances();
    const amount = Math.abs((currentNet[userId]?.[fromId] || 0));
    const settlement = { id: generateId(), paidBy: fromId, to: userId, settledAt: Date.now(), amount };
    await saveGroup({ ...groupData, settlements: [...(groupData.settlements || []), settlement] });
  };

  const getLastSettled = () => {
    const map = {};
    (groupData?.settlements || []).forEach(s => {
      const key = [s.paidBy, s.to].sort().join(":");
      if (!map[key] || s.settledAt > map[key]) map[key] = s.settledAt;
    });
    return map;
  };

  // Returns the most recent settlement between userId and another member, with direction + amount
  const getLastSettlementDetails = (memberId) => {
    const relevant = (groupData?.settlements || [])
      .filter(s => (s.paidBy === memberId && s.to === userId) || (s.paidBy === userId && s.to === memberId))
      .sort((a, b) => b.settledAt - a.settledAt);
    if (!relevant.length) return null;
    const s = relevant[0];
    return { iPaid: s.paidBy === userId, theyPaid: s.paidBy === memberId, amount: s.amount || 0 };
  };

  const getNetBalances = () => {
    if (!groupData) return {};
    const lastSettled = getLastSettled();
    const net = {};
    groupData.members.forEach(m => { net[m.id] = {}; });
    groupData.bets
      .filter(b => b.status === "history" && b.winner && b.loser && !b.push)
      .forEach(b => {
        const key = [b.winner, b.loser].sort().join(":");
        if (b.createdAt > (lastSettled[key] || 0)) {
          if (!net[b.winner]) net[b.winner] = {};
          if (!net[b.loser]) net[b.loser] = {};
          net[b.winner][b.loser] = (net[b.winner][b.loser] || 0) + b.amount;
          net[b.loser][b.winner] = (net[b.loser][b.winner] || 0) - b.amount;
        }
      });
    return net;
  };

  const getLeaderboardData = () => {
    if (!groupData) return [];
    // Net all-time winnings/losses from settled bets
    const net = {};
    groupData.members.forEach(m => { net[m.id] = 0; });
    groupData.bets
      .filter(b => b.status === "history" && b.winner && b.loser && !b.push)
      .forEach(b => {
        if (net[b.winner] !== undefined) net[b.winner] += b.amount;
        if (net[b.loser] !== undefined) net[b.loser] -= b.amount;
      });

    // Streak: look at each member's bets sorted newest-first, count consecutive W or L
    const getStreak = (memberId) => {
      const settled = groupData.bets
        .filter(b => b.status === "history" && (b.winner === memberId || b.loser === memberId) && !b.push)
        .sort((a, b) => b.createdAt - a.createdAt);
      if (!settled.length) return null;
      const first = settled[0].winner === memberId ? "W" : "L";
      let count = 1;
      for (let i = 1; i < settled.length; i++) {
        const outcome = settled[i].winner === memberId ? "W" : "L";
        if (outcome === first) count++;
        else break;
      }
      return count >= 2 ? { type: first, count } : null;
    };

    return groupData.members
      .map(m => ({ ...m, net: net[m.id] || 0, streak: getStreak(m.id) }))
      .sort((a, b) => b.net - a.net);
  };

  const switchUser = (member) => { setUserId(member.id); setUserName(member.name); setShowSwitchUser(false); setActiveTab("open"); };
  const copyCode = () => { navigator.clipboard.writeText(groupCode).then(() => { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }); };

  const myBets = groupData?.bets.filter(b => b.status === "active" && (b.offererId === userId || b.acceptorId === userId)) || [];
  const openBets = groupData?.bets.filter(b => b.status === "open") || [];
  const historyBets = groupData?.bets.filter(b => b.status === "history" && (b.offererId === userId || b.acceptorId === userId)).sort((a, b) => b.createdAt - a.createdAt) || [];
  const disputedBets = groupData?.bets.filter(b => b.status === "disputed" && (b.offererId === userId || b.acceptorId === userId)) || [];
  const netBalances = getNetBalances();

  const resultLabel = (r) => r === "won" ? "Won" : r === "lost" ? "Lost" : "Pushed";

  // ── LANDING ──────────────────────────────────────────────────────────────
  if (screen === "landing") {
    return (
      <div style={styles.app}>
        <div style={styles.noiseBg} />
        <div style={{ ...styles.container, paddingTop: 60, paddingBottom: 60 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${COLORS.accent}, #00b8d4)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🎲</div>
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, letterSpacing: 2, lineHeight: 1, margin: 0, color: COLORS.text }}>Bet With The Boys</h1>
            <p style={{ color: COLORS.muted, marginTop: 10, fontSize: 15 }}>Private group bets. No house. No vig. Just bragging rights.</p>
          </div>

          {!mode ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button style={{ ...styles.btn("primary"), width: "100%", fontSize: 16, padding: "16px 24px" }} onClick={() => setMode("create")}>＋ Create a Group</button>
              <button style={{ ...styles.btn("ghost"), width: "100%", fontSize: 16, padding: "16px 24px" }} onClick={() => setMode("join")}>Join with a Code</button>
            </div>
          ) : (
            <div style={styles.card}>
              <button onClick={() => { setMode(""); setError(""); }} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 13, marginBottom: 20, padding: 0 }}>← Back</button>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 1, margin: "0 0 24px" }}>{mode === "create" ? "Create Group" : "Join a Group"}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div><label style={styles.label}>Your Name</label><input style={styles.input} placeholder="e.g. Nick" value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (mode === "create" ? handleCreate() : handleJoin())} /></div>
                {mode === "create"
                  ? <div><label style={styles.label}>Group Name</label><input style={styles.input} placeholder="e.g. The Boys" value={groupNameInput} onChange={e => setGroupNameInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCreate()} /></div>
                  : <div><label style={styles.label}>Group Code</label><input style={styles.input} placeholder="e.g. AB12CD" value={joinCode} onChange={e => setJoinCode(e.target.value)} onKeyDown={e => e.key === "Enter" && handleJoin()} /></div>}
                {error && <p style={{ color: COLORS.red, fontSize: 13, margin: 0 }}>{error}</p>}
                <button style={{ ...styles.btn("primary"), width: "100%", opacity: loading ? 0.7 : 1 }} onClick={mode === "create" ? handleCreate : handleJoin} disabled={loading}>{loading ? "Loading..." : mode === "create" ? "Create Group" : "Join Group"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── GROUP APP ─────────────────────────────────────────────────────────────
  const TabButton = ({ id, label, count }) => (
    <button onClick={() => setActiveTab(id)} style={{
      flex: 1, background: "none", border: "none",
      borderBottom: `2px solid ${activeTab === id ? COLORS.accent : "transparent"}`,
      color: activeTab === id ? COLORS.accent : COLORS.muted,
      padding: "12px 2px", cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 12,
      transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
    }}>
      {label}
      {count > 0 && (
        <span style={{ background: activeTab === id ? COLORS.accent : COLORS.border, color: activeTab === id ? "#000" : COLORS.muted, borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "1px 7px" }}>{count}</span>
      )}
    </button>
  );

  const BetCard = ({ bet }) => {
    const isOfferer = bet.offererId === userId;
    const isAcceptor = bet.acceptorId === userId;
    const myResult = isOfferer ? bet.offererResult : bet.acceptorResult;
    const opponent = isOfferer ? bet.acceptorName : bet.offererName;

    return (
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 18, marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 15, lineHeight: 1.4 }}>
              {bet.status === "open"
                ? <>{bet.offererName} wants <span style={{ color: COLORS.accent }}>{bet.description}</span>. Take the other side?</>
                : isAcceptor
                ? <>{bet.offererName} had <span style={{ color: COLORS.accent }}>{bet.description}</span></>
                : bet.description}
            </p>
            {bet.status !== "open" && <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: 13 }}>{bet.offererName} vs {bet.acceptorName}</p>}
          </div>
          <p style={{ margin: "0 0 0 12px", fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: COLORS.accent, letterSpacing: 1 }}>{fmt(bet.amount)}</p>
        </div>

        {/* Open */}
        {bet.status === "open" && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!isOfferer && <button style={styles.btn("success")} onClick={() => handleAccept(bet.id)}>Accept Bet</button>}
            {isOfferer && <><button style={styles.btn("ghost")} onClick={() => handleCancelBet(bet.id)}>Cancel</button><span style={styles.tag("amber")}>Waiting</span></>}
          </div>
        )}

        {/* Active */}
        {bet.status === "active" && (isOfferer || isAcceptor) && (
          <div>
            {!myResult ? (
              <div>
                <p style={{ margin: "0 0 10px", fontSize: 13, color: COLORS.mutedLight }}>vs <strong>{opponent}</strong> — How did it go?</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button style={styles.btn("success")} onClick={() => handleResultClick(bet.id, "won")}>🏆 I Won</button>
                  <button style={styles.btn("danger")} onClick={() => handleResultClick(bet.id, "lost")}>I Lost</button>
                  <button style={styles.btn("amber")} onClick={() => handleResultClick(bet.id, "push")}>🤝 We Pushed</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={styles.tag(myResult === "won" ? "green" : myResult === "push" ? "amber" : "red")}>
                  You said: {resultLabel(myResult)}
                </span>
                <span style={{ color: COLORS.muted, fontSize: 13 }}>
                  {(isOfferer ? bet.acceptorResult : bet.offererResult) ? "" : `Waiting for ${opponent}...`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.app}>
      <div style={styles.noiseBg} />
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ borderBottom: `1px solid ${COLORS.border}`, background: "#0a0f15ee", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 480, margin: "0 auto", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, margin: 0 }}>{groupData?.name}</h2>
                <button onClick={() => setShowSwitchUser(true)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: COLORS.accent, fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                  👤 {userName} <span style={{ color: COLORS.muted, fontWeight: 400 }}>— switch user</span>
                </button>
              </div>
              {/* Leaderboard trigger */}
              <button
                onClick={() => setShowLeaderboard(v => !v)}
                style={{
                  background: showLeaderboard ? COLORS.accentDim : "#ffffff08",
                  border: `1px solid ${showLeaderboard ? COLORS.accent + "55" : COLORS.border}`,
                  borderRadius: 8, padding: "6px 10px", cursor: "pointer",
                  color: showLeaderboard ? COLORS.accent : COLORS.muted,
                  fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                🏆 <span style={{ fontSize: 11, letterSpacing: 0.5 }}>BOARD</span>
              </button>
            </div>
            <button onClick={copyCode} style={{ background: copiedCode ? COLORS.accentDim : "#ffffff08", border: `1px solid ${copiedCode ? COLORS.accent + "55" : COLORS.border}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: copiedCode ? COLORS.accent : COLORS.muted, fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
              {copiedCode ? "✓ Copied!" : `CODE: ${groupCode}`}
            </button>
          </div>

          {/* Leaderboard drop-down panel */}
          {showLeaderboard && (() => {
            const board = getLeaderboardData();
            return (
              <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "12px 16px 16px" }}>
                <div style={{ maxWidth: 480, margin: "0 auto" }}>
                  <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: COLORS.muted }}>All-Time Standings</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {board.map((member, i) => {
                      const isMe = member.id === userId;
                      const isUp = member.net > 0;
                      const isDown = member.net < 0;
                      const isEven = Math.abs(member.net) < 0.01;
                      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                      const streakEmoji = member.streak
                        ? member.streak.type === "W" ? "🔥" : "🥶"
                        : null;
                      return (
                        <div key={member.id} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          background: isMe ? "#0e1f14" : "#ffffff06",
                          border: `1px solid ${isMe ? COLORS.accent + "33" : COLORS.border}`,
                          borderRadius: 10, padding: "8px 12px",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: medal ? 14 : 12, width: 20, textAlign: "center", color: COLORS.muted, fontWeight: 700 }}>
                              {medal || `#${i + 1}`}
                            </span>
                            <span style={{ fontWeight: 600, fontSize: 13, color: isMe ? COLORS.accent : COLORS.text }}>
                              {member.name}
                            </span>
                            {member.streak && (
                              <span style={{
                                fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                                background: member.streak.type === "W" ? COLORS.accentDim : COLORS.redDim,
                                color: member.streak.type === "W" ? COLORS.accent : COLORS.red,
                                border: `1px solid ${member.streak.type === "W" ? COLORS.accent + "44" : COLORS.red + "44"}`,
                              }}>
                                {streakEmoji} {member.streak.count}{member.streak.type}
                              </span>
                            )}
                          </div>
                          <span style={{
                            fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 1,
                            color: isEven ? COLORS.muted : isUp ? COLORS.accent : COLORS.red,
                          }}>
                            {isEven ? "EVEN" : `${isUp ? "+" : "-"}${fmt(member.net)}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px 80px" }}>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.border}`, marginBottom: 20, marginTop: 4 }}>
            <TabButton id="open" label="Offers" count={openBets.length} />
            <TabButton id="active" label="My Bets" count={myBets.length} />
            <TabButton id="history" label="History" count={0} />
            <TabButton id="balances" label="Balances" count={0} />
            <TabButton id="disputes" label="Disputes" count={disputedBets.length} />
          </div>

          {/* ── OPEN BETS ── */}
          {activeTab === "open" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 13, color: COLORS.mutedLight }}>{openBets.length} bet{openBets.length !== 1 ? "s" : ""} on the board</p>
                <button style={styles.btn("primary")} onClick={() => setShowOfferModal(true)}>+ Offer Bet</button>
              </div>
              {openBets.length === 0
                ? <div style={{ textAlign: "center", padding: "48px 24px", color: COLORS.muted }}><div style={{ fontSize: 40, marginBottom: 12 }}>🎲</div><p style={{ margin: 0, fontSize: 15 }}>No bets on the board yet.</p><p style={{ margin: "6px 0 0", fontSize: 13 }}>Be the first to offer one.</p></div>
                : openBets.map(b => <BetCard key={b.id} bet={b} />)}
            </div>
          )}

          {/* ── MY BETS ── */}
          {activeTab === "active" && (
            <div>
              <p style={{ color: COLORS.muted, fontSize: 13, margin: "0 0 16px" }}>Accepted bets waiting for results.</p>
              {myBets.length === 0
                ? <div style={{ textAlign: "center", padding: "48px 24px", color: COLORS.muted }}><div style={{ fontSize: 40, marginBottom: 12 }}>✋</div><p style={{ margin: 0 }}>No active bets. Accept one from the board!</p></div>
                : myBets.map(b => <BetCard key={b.id} bet={b} />)}
            </div>
          )}

          {/* ── HISTORY ── */}
          {activeTab === "history" && (
            <div>
              <p style={{ color: COLORS.muted, fontSize: 13, margin: "0 0 16px" }}>All settled bets.</p>
              {historyBets.length === 0
                ? <div style={{ textAlign: "center", padding: "48px 24px", color: COLORS.muted }}><div style={{ fontSize: 40, marginBottom: 12 }}>📋</div><p style={{ margin: 0 }}>No history yet.</p></div>
                : historyBets.map(bet => {
                  const iWon = bet.winner === userId;
                  const iLost = bet.loser === userId;
                  return (
                    <div key={bet.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 18, marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{bet.description}</p>
                          <p style={{ margin: "4px 0 8px", color: COLORS.muted, fontSize: 13 }}>{bet.offererName} vs {bet.acceptorName}</p>
                          {bet.push ? <span style={styles.tag("amber")}>🤝 Push</span>
                            : iWon ? <span style={styles.tag("green")}>You Won</span>
                            : iLost ? <span style={styles.tag("red")}>You Lost</span>
                            : <span style={styles.tag()}>Settled</span>}
                        </div>
                        <p style={{ margin: "0 0 0 12px", fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 1, color: bet.push ? COLORS.muted : iWon ? COLORS.accent : iLost ? COLORS.red : COLORS.muted }}>
                          {bet.push ? "PUSH" : `${iWon ? "+" : iLost ? "-" : ""}${fmt(bet.amount)}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* ── BALANCES ── */}
          {activeTab === "balances" && (
            <div>
              <p style={{ color: COLORS.muted, fontSize: 13, margin: "0 0 16px" }}>Net balances across settled bets. Mark paid when cash is exchanged.</p>
              {groupData?.members.filter(m => m.id !== userId).map(member => {
                const balance = netBalances[userId]?.[member.id] || 0;
                const theyOweMe = balance > 0;
                const iOweThem = balance < 0;
                const isEven = Math.abs(balance) < 0.01;
                const settlementDetails = getLastSettlementDetails(member.id);

                let evenMessage = "You're all even.";
                if (isEven && settlementDetails) {
                  if (settlementDetails.iPaid && settlementDetails.amount > 0) {
                    evenMessage = `All even. You paid ${member.name} ${fmt(settlementDetails.amount)}.`;
                  } else if (settlementDetails.theyPaid && settlementDetails.amount > 0) {
                    evenMessage = `All even. ${member.name} paid you ${fmt(settlementDetails.amount)}.`;
                  }
                }

                return (
                  <div key={member.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 18, marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>{member.name}</p>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: isEven ? COLORS.accent : theyOweMe ? COLORS.accent : COLORS.red }}>
                          {isEven
                            ? evenMessage
                            : theyOweMe
                            ? `${member.name} owes you ${fmt(balance)}`
                            : `You owe ${member.name} ${fmt(Math.abs(balance))}`}
                        </p>
                        {iOweThem && (
                          <p style={{ margin: "6px 0 0", fontSize: 12, color: COLORS.muted, fontStyle: "italic" }}>
                            This will disappear when {member.name} has marked that you paid.
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", marginLeft: 12 }}>
                        {theyOweMe && <button style={styles.btn("sm")} onClick={() => handleMarkPaid(member.id)}>Mark Paid ✓</button>}
                        {isEven && <span style={styles.tag("green")}>✓ Even</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {groupData?.members.length <= 1 && (
                <div style={{ textAlign: "center", padding: "48px 24px", color: COLORS.muted }}><div style={{ fontSize: 40, marginBottom: 12 }}>👥</div><p style={{ margin: 0 }}>Invite your boys with code <strong style={{ color: COLORS.accent }}>{groupCode}</strong></p></div>
              )}
            </div>
          )}

          {/* ── DISPUTES ── */}
          {activeTab === "disputes" && (
            <div>
              {/* Explanation banner */}
              <div style={{ background: "#1a1000", border: `1px solid ${COLORS.amber}33`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 14, color: COLORS.amber }}>⚠ About Disputed Bets</p>
                <p style={{ margin: 0, fontSize: 13, color: COLORS.mutedLight, lineHeight: 1.6 }}>
                  The bets shown below are bets that you and your friend disagreed on (e.g. you both said you won). Because we don't handle payment, you need to work this out with them outside of the app. Once resolved, these bets will <strong style={{ color: COLORS.text }}>not</strong> show up in History or Balances.
                </p>
              </div>

              {disputedBets.length === 0
                ? <div style={{ textAlign: "center", padding: "48px 24px", color: COLORS.muted }}><div style={{ fontSize: 40, marginBottom: 12 }}>🤝</div><p style={{ margin: 0 }}>No disputed bets. Nice!</p></div>
                : disputedBets.map(bet => {
                  const isOfferer = bet.offererId === userId;
                  const myResult = isOfferer ? bet.offererResult : bet.acceptorResult;
                  const theirResult = isOfferer ? bet.acceptorResult : bet.offererResult;
                  const opponent = isOfferer ? bet.acceptorName : bet.offererName;
                  return (
                    <div key={bet.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.red}44`, borderRadius: 14, padding: 18, marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{bet.description}</p>
                          <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: 13 }}>{bet.offererName} vs {bet.acceptorName}</p>
                        </div>
                        <p style={{ margin: "0 0 0 12px", fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: COLORS.red, letterSpacing: 1 }}>{fmt(bet.amount)}</p>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <div style={{ background: "#0d1117", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
                          <span style={{ color: COLORS.muted }}>You said: </span>
                          <span style={{ color: myResult === "won" ? COLORS.accent : myResult === "lost" ? COLORS.red : COLORS.amber, fontWeight: 600 }}>{resultLabel(myResult)}</span>
                        </div>
                        {theirResult && (
                          <div style={{ background: "#0d1117", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
                            <span style={{ color: COLORS.muted }}>{opponent} said: </span>
                            <span style={{ color: theirResult === "won" ? COLORS.accent : theirResult === "lost" ? COLORS.red : COLORS.amber, fontWeight: 600 }}>{resultLabel(theirResult)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* ── CONFIRMATION MODAL ── */}
        {pendingResult && (
          <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "#111825", borderRadius: 20, border: `1px solid ${COLORS.border}`, padding: 28, width: "100%", maxWidth: 400, animation: "fadeIn 0.2s ease" }}>
              <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
              <p style={{ margin: "0 0 10px", fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 1 }}>Are You Sure?</p>
              <p style={{ margin: "0 0 24px", fontSize: 14, color: COLORS.mutedLight, lineHeight: 1.6 }}>
                Bets that are not agreed on will be moved to a <strong style={{ color: COLORS.amber }}>"Disputes"</strong> tab and will have to be handled by you and your friend.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button style={{ ...styles.btn("primary"), width: "100%", fontSize: 15, padding: "14px" }} onClick={handleConfirmResult}>
                  Yes, I'm Sure
                </button>
                <button style={{ ...styles.btn("ghost"), width: "100%", fontSize: 15, padding: "14px" }} onClick={() => setPendingResult(null)}>
                  Let Me Double Check
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SWITCH USER MODAL ── */}
        {showSwitchUser && (
          <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={e => { if (e.target === e.currentTarget) setShowSwitchUser(false); }}>
            <div style={{ background: "#111825", borderRadius: "20px 20px 0 0", border: `1px solid ${COLORS.border}`, borderBottom: "none", padding: 24, width: "100%", maxWidth: 480, animation: "slideUp 0.25s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 1, margin: 0 }}>Switch User</h3>
                <button onClick={() => setShowSwitchUser(false)} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 22 }}>×</button>
              </div>
              <p style={{ color: COLORS.muted, fontSize: 13, margin: "0 0 20px" }}>Testing mode — swap between group members to simulate multiple users.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {groupData?.members.map(member => (
                  <button key={member.id} onClick={() => switchUser(member)} style={{ background: member.id === userId ? COLORS.accentDim : "#ffffff06", border: `1px solid ${member.id === userId ? COLORS.accent + "55" : COLORS.border}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'DM Sans', sans-serif" }}>
                    <span style={{ fontWeight: 600, fontSize: 15, color: member.id === userId ? COLORS.accent : COLORS.text }}>{member.name}</span>
                    {member.id === userId && <span style={{ fontSize: 12, color: COLORS.accent, fontWeight: 600 }}>ACTIVE</span>}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${COLORS.border}` }}>
                <p style={{ color: COLORS.muted, fontSize: 12, margin: "0 0 10px" }}>Add a new test user</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input id="newTestUser" style={{ ...styles.input, flex: 1 }} placeholder="Name" />
                  <button style={styles.btn("primary")} onClick={async () => {
                    const input = document.getElementById("newTestUser");
                    if (!input?.value.trim()) return;
                    const uid = generateId();
                    const name = input.value.trim();
                    const updated = { ...groupData, members: [...groupData.members, { id: uid, name }] };
                    await saveGroup(updated);
                    setUserId(uid); setUserName(name); setShowSwitchUser(false); input.value = "";
                  }}>Add</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── OFFER BET MODAL ── */}
        {showOfferModal && (
          <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={e => { if (e.target === e.currentTarget) setShowOfferModal(false); }}>
            <div style={{ background: "#111825", borderRadius: "20px 20px 0 0", border: `1px solid ${COLORS.border}`, borderBottom: "none", padding: 24, width: "100%", maxWidth: 480, animation: "slideUp 0.25s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 1, margin: 0 }}>Offer a Bet</h3>
                <button onClick={() => setShowOfferModal(false)} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 22 }}>×</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={styles.label}>Bet Description (The Bet YOU Want)</label>
                  <input style={styles.input} placeholder="e.g. Chiefs -3 vs Bills" value={betDesc} onChange={e => setBetDesc(e.target.value)} autoFocus />
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: COLORS.muted }}>Describe the position you're offering. Someone else will take the other side.</p>
                </div>
                <div>
                  <label style={styles.label}>Amount ($)</label>
                  <input style={styles.input} type="number" min="1" step="0.50" placeholder="e.g. 20" value={betAmount} onChange={e => setBetAmount(e.target.value)} />
                </div>
                <button style={{ ...styles.btn("primary"), width: "100%", fontSize: 16, padding: "14px" }} onClick={handleOfferBet} disabled={!betDesc.trim() || !betAmount}>Post to Board</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
