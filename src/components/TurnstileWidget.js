// components/TurnstileWidget.js
"use client";
import { useEffect, useRef } from "react";

export default function TurnstileWidget() {
  const containerRef = useRef(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    let widgetId = null;

    const renderWidget = () => {
      if (!containerRef.current || !window?.turnstile) return;
      // Limpia si ya existía (evita duplicados al navegar)
      containerRef.current.innerHTML = "";
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "auto",
        size: "flexible",
      });
    };

    // Turnstile ya cargado
    if (window?.turnstile?.render) {
      renderWidget();
    } else {
      // Se llamará cuando el script termine de cargar
      window.onloadTurnstileCallback = () => renderWidget();
    }

    return () => {
      try {
        if (widgetId && window?.turnstile?.remove) {
          window.turnstile.remove(widgetId);
        }
      } catch {}
    };
  }, [siteKey]);

  return <div ref={containerRef} className="flex justify-center" />;
}
