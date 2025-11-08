// app/api/turnstile/verify/route.js

export async function POST(req) {
  try {
    // 1) Lee el token enviado por el cliente
    const { token } = await req.json();
    if (!token) {
      return new Response(
        JSON.stringify({ ok: false, error: "Captcha requerido" }),
        { status: 400 }
      );
    }
    // 2) Prepara el cuerpo x-www-form-urlencoded que exige Turnstile
    const r = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: token,
        }),
      }
    );
    const data = await r.json();
    // 3) Verifica el token contra Cloudflare Turnstile
    if (!data.success) {
      return new Response(
        JSON.stringify({ ok: false, error: "Captcha inválido" }),
        { status: 400 }
      );
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: "Error de verificación" }),
      { status: 500 }
    );
  }
}
