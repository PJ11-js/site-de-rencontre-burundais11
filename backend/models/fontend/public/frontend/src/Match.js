import React, { useState } from "react";
import axios from "axios";
import translations from "./i18n";

const api = "http://localhost:4000/api";

export default function Match({ user, users, lang, setMatchId, setUsers, setUser }) {
  const t = translations[lang];
  const [index, setIndex] = useState(0);

  if (users.length === 0) return <div>{t.match}: ...</div>;

  const candidate = users[index];
  const dist = (a, b) => {
    if (!a.latitude || !b.latitude) return "?";
    const toRad = v => v * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const a1 = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a1), Math.sqrt(1-a1)));
  };

  const handle = async (action) => {
    await axios.post(api + "/match", { userId: user._id, targetId: candidate._id, action });
    if (action === "like") {
      // refresh matches
      const updated = { ...user, likes: [...user.likes, candidate._id] };
      setUser(updated);
      if (candidate.likes.includes(user._id)) setMatchId(candidate._id);
    }
    setIndex(i => (i+1) % users.length);
  };

  return (
    <div className="match">
      <h2>{t.match}</h2>
      <div className="profile-card">
        <img src={`http://localhost:4000${candidate.pic}`} alt="profil" />
        <div className="profile-info">
          {candidate.name}, {candidate.age} <br />
          {dist(user, candidate)} km
        </div>
        <div className="actions">
          <button className="dislike" onClick={() => handle("dislike")}>✗ {t.dislike}</button>
          <button className="like" onClick={() => handle("like")}>❤ {t.like}</button>
        </div>
      </div>
    </div>
  );
}
