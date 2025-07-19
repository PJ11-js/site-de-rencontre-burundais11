import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import translations from "./i18n";

const api = "http://localhost:4000/api";
const socket = io("http://localhost:4000");

export default function Chat({ user, target, lang, onClose }) {
  const t = translations[lang];
  const [messages, setMessages] = useState([]);
  const inputRef = useRef();
  useEffect(() => {
    socket.emit("join", user._id);
    axios.get(`${api}/messages/${user._id}/${target._id}`).then(res => setMessages(res.data));
    socket.on("message", msg => {
      if ((msg.from === user._id && msg.to === target._id) || (msg.from === target._id && msg.to === user._id))
        setMessages(m => [...m, msg]);
    });
    return () => socket.off("message");
  }, [user, target]);

  const send = () => {
    if (inputRef.current.value) {
      socket.emit("message", { from: user._id, to: target._id, text: inputRef.current.value });
      inputRef.current.value = "";
    }
  };

  return (
    <div className="chatbox">
      <h2>{t.chat} - {target.name} <button onClick={onClose}>X</button></h2>
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={m.from === user._id ? "me" : "them"}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input ref={inputRef} onKeyDown={e => e.key === "Enter" && send()} />
        <button onClick={send}>{t.send}</button>
      </div>
    </div>
  );
}
