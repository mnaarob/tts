import './index.css';
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

// Supabase redirects with tokens in the hash fragment:
//   /#access_token=xxx&type=recovery
// HashRouter also uses # for routing, so they clash.
// Intercept before React mounts and rewrite to #/reset-password.
(function interceptAuthHash() {
  const hash = window.location.hash;
  if (!hash) return;

  const params = new URLSearchParams(hash.replace(/^#\/?/, ''));
  const type = params.get('type');

  if (type === 'recovery') {
    const accessToken = params.get('access_token') ?? '';
    const refreshToken = params.get('refresh_token') ?? '';
    window.location.hash = `/reset-password?access_token=${encodeURIComponent(accessToken)}&refresh_token=${encodeURIComponent(refreshToken)}&type=recovery`;
  } else if (type === 'invite' || type === 'signup') {
    // Legacy invite links: send users to self-signup (email flow removed).
    window.location.hash = '/signup';
  }
})();

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);