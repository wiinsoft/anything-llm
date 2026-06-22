import React, { useState, useEffect } from "react";
import System from "../../../models/system";
import SingleUserAuth from "./SingleUserAuth";
import MultiUserAuth from "./MultiUserAuth";
import {
  AUTH_TOKEN,
  AUTH_USER,
  AUTH_TIMESTAMP,
} from "../../../utils/constants";
import useLogo from "../../../hooks/useLogo";

export default function PasswordModal({ mode = "single" }) {
  const { loginLogo } = useLogo();

  useEffect(() => {
    const threeScript = document.createElement("script");
    threeScript.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js";
    threeScript.onload = () => {
      const vantaScript = document.createElement("script");
      vantaScript.src = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js";
      vantaScript.onload = () => {
        if (window.VANTA) {
          window.vantaEffect = window.VANTA.BIRDS({
            el: "#particles-login",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            backgroundColor: 0xffffff,
            color1: 0xfff,
            colorMode: "lerp",
            birdSize: 2.00,
            wingSpan: 20.00,
            separation: 24.00,
            alignment: 25.00,
            cohesion: 25.00,
          });
        }
      };
      document.body.appendChild(vantaScript);
    };
    document.body.appendChild(threeScript);
    return () => {
      if (window.vantaEffect) {
        window.vantaEffect.destroy();
        window.vantaEffect = null;
      }
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] h-full bg-theme-bg-primary flex flex-col md:flex-row items-center justify-center">
      <div id="particles-login" className="fixed top-0 left-0 w-full h-full z-0" />
      <div className="hidden md:flex md:w-1/2 md:h-full md:items-center md:justify-center" />
      <div className="flex flex-col items-center justify-center h-full w-full md:w-1/2 z-50 relative md:-mt-20 mt-0 !border-none bg-theme-bg-secondary md:bg-transparent">
        <img
          src={loginLogo}
          alt="Logo"
          className={`hidden relative md:flex rounded-2xl w-fit m-4 z-30 ${
            mode === "single" ? "md:top-2" : "md:top-12"
          } absolute max-h-[65px]`}
          style={{ objectFit: "contain" }}
        />
        {mode === "single" ? <SingleUserAuth /> : <MultiUserAuth />}
      </div>
    </div>
  );
}

export function usePasswordModal(notry = false) {
  const [auth, setAuth] = useState({
    loading: true,
    requiresAuth: false,
    mode: "single",
  });

  useEffect(() => {
    async function checkAuthReq() {
      if (!window) return;

      if (!System.needsAuthCheck() && notry === false) {
        setAuth({
          loading: false,
          requiresAuth: false,
          mode: "multi",
        });
        return;
      }

      const settings = await System.keys();
      if (settings?.MultiUserMode) {
        const currentToken = window.localStorage.getItem(AUTH_TOKEN);
        if (!!currentToken) {
          const valid = notry ? false : await System.checkAuth(currentToken);
          if (!valid) {
            setAuth({
              loading: false,
              requiresAuth: true,
              mode: "multi",
            });
            window.localStorage.removeItem(AUTH_USER);
            window.localStorage.removeItem(AUTH_TOKEN);
            window.localStorage.removeItem(AUTH_TIMESTAMP);
            return;
          } else {
            setAuth({
              loading: false,
              requiresAuth: false,
              mode: "multi",
            });
            return;
          }
        } else {
          setAuth({
            loading: false,
            requiresAuth: true,
            mode: "multi",
          });
          return;
        }
      } else {
        const requiresAuth = settings?.RequiresAuth || false;
        if (!requiresAuth) {
          setAuth({
            loading: false,
            requiresAuth: false,
            mode: "single",
          });
          return;
        }

        const currentToken = window.localStorage.getItem(AUTH_TOKEN);
        if (!!currentToken) {
          const valid = notry ? false : await System.checkAuth(currentToken);
          if (!valid) {
            setAuth({
              loading: false,
              requiresAuth: true,
              mode: "single",
            });
            window.localStorage.removeItem(AUTH_TOKEN);
            window.localStorage.removeItem(AUTH_USER);
            window.localStorage.removeItem(AUTH_TIMESTAMP);
            return;
          } else {
            setAuth({
              loading: false,
              requiresAuth: false,
              mode: "single",
            });
            return;
          }
        } else {
          setAuth({
            loading: false,
            requiresAuth: true,
            mode: "single",
          });
          return;
        }
      }
    }
    checkAuthReq();
  }, []);

  return auth;
}
