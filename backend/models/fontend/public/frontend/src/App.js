import React, { useState, useEffect } from "react";
import axios from "axios";
import Match from "./Match";
import Chat from "./Chat";
import translations from "./i18n";
import "./styles.css";

const api = "http://localhost:4000/api";

export default function App() {
  const [lang, setLang] = useState("fr");
  const t = translations[lang];
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [geo, setGeo] = useState({});
  const [matchId, setMatchId] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setGeo({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      });
    });
  }, []);

  useEffect(() => {
    if (user) {
      axios.get(api + "/users").then(res => {
        setUsers(res.data.filter(u => u._id !== user._id && !user.matches.includes(u._id)));
      });
    }
  }, [user]);

  const handleSignup = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData();
    formData.append("name", form.name.value);
    formData.append("age", form.age.value);
    formData.append("lang", lang);
    formData.append("latitude", geo.latitude || 0);
    formData.append("longitude", geo.longitude || 0);
    if (form.pic.files[0]) formData.append("pic", form.pic.files[0]);
    const res = await axios.post(api + "/signup", formData);
    setUser(res.data);
  };

  if (!user) {
    return (
      <div className="container">
        <select value={lang} onChange={e => setLang(e.target.value)}>
          <option value="fr">Français</option>
          <option value="rn">Kirundi</option>
          <option value="en">English</option>
        </select>
        <h1>{t.title}</h1>
        <form onSubmit={handleSignup} className="signup">
          <label>{t.name} <input name="name" required /></label>
          <label>{t.age} <input name="age" type="number" required /></label>
          <label>{t.pic} <input name="pic" type="file" accept="image/*" /></label>
          <button>{t.signupBtn}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <select value={lang} onChange={e => setLang(e.target.value)}>
        <option value="fr">Français</option>
        <option value="rn">Kirundi</option>
        <option value="en">English</option>
      </select>
      <h1>{t.title}</h1>
      <Match
        user={user}
        users={users}
        lang={lang}
        setMatchId={setMatchId}
        setUsers={setUsers}
        setUser={setUser}
      />
      {matchId && (
        <Chat
          user={user}
          target={users.find(u => u._id === matchId) || {}}
          lang={lang}
          onClose={() => setMatchId(null)}
        />
      )}
    </div>
  );
}
