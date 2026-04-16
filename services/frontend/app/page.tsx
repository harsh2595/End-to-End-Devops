"use client";

import { FormEvent, useEffect, useState } from "react";

type HealthState = {
  frontend: string;
  gateway: string;
  auth: string;
  orders: string;
};

type ResponsePanel = {
  title: string;
  payload: string;
  response: string;
};

export default function Home() {
  const [health, setHealth] = useState<HealthState>({
    frontend: "Ready",
    gateway: "Checking...",
    auth: "Checking...",
    orders: "Checking...",
  });
  const [username, setUsername] = useState("harsh");
  const [item, setItem] = useState("hk");
  const [quantity, setQuantity] = useState("1");
  const [token, setToken] = useState("");
  const [loginMessage, setLoginMessage] = useState("No token requested yet.");
  const [orderMessage, setOrderMessage] = useState("No order submitted yet.");
  const [loginPanel, setLoginPanel] = useState<ResponsePanel>({
    title: "Login Result",
    payload: 'POST /api/login with {"username":"harsh"}',
    response: "Waiting for login request...",
  });
  const [orderPanel, setOrderPanel] = useState<ResponsePanel>({
    title: "Order Result",
    payload: 'POST /api/order with {"item":"hk","quantity":1}',
    response: "Waiting for order request...",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  async function refreshHealth() {
    setIsRefreshing(true);

    const checks = await Promise.allSettled([
      fetch("/api/health").then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `HTTP ${res.status}`);
        }

        return data;
      }),
    ]);

    const healthData =
      checks[0].status === "fulfilled"
        ? checks[0].value
        : {
            gateway: "Gateway unavailable",
            auth: "Auth unavailable",
            orders: "Orders unavailable",
          };

    setHealth({
      frontend: "Running in browser",
      gateway: healthData.gateway,
      auth: healthData.auth,
      orders: healthData.orders,
    });

    setIsRefreshing(false);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginMessage("Requesting token...");
    setLoginPanel({
      title: "Login Result",
      payload: JSON.stringify(
        {
          url: "/api/login",
          method: "POST",
          body: { username },
        },
        null,
        2
      ),
      response: "Waiting for response...",
    });

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (!response.ok || !data.token) {
        throw new Error(data.error || "Unable to get token");
      }

      setToken(data.token);
      setLoginMessage(`Token ready for ${username}.`);
      setLoginPanel({
        title: "Login Result",
        payload: JSON.stringify(
          {
            url: "/api/login",
            method: "POST",
            body: { username },
          },
          null,
          2
        ),
        response: JSON.stringify(data, null, 2),
      });
    } catch (error) {
      setToken("");
      setLoginMessage(
        error instanceof Error ? error.message : "Login request failed"
      );
      setLoginPanel({
        title: "Login Result",
        payload: JSON.stringify(
          {
            url: "/api/login",
            method: "POST",
            body: { username },
          },
          null,
          2
        ),
        response:
          error instanceof Error
            ? error.message
            : "Login request failed",
      });
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsOrdering(true);
    setOrderMessage("Submitting order...");
    const body = {
      item,
      quantity: Number(quantity) || 1,
    };

    setOrderPanel({
      title: "Order Result",
      payload: JSON.stringify(
        {
          url: "/api/order",
          method: "POST",
          headers: {
            Authorization: token ? "Bearer-like raw token present" : "Missing",
          },
          body,
        },
        null,
        2
      ),
      response: "Waiting for response...",
    });

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Order failed with ${response.status}`);
      }

      setOrderMessage(data.message || "Order submitted.");
      setOrderPanel({
        title: "Order Result",
        payload: JSON.stringify(
          {
            url: "/api/order",
            method: "POST",
            headers: {
              Authorization: token ? "Bearer-like raw token present" : "Missing",
            },
            body,
          },
          null,
          2
        ),
        response: JSON.stringify(data, null, 2),
      });
    } catch (error) {
      setOrderMessage(
        error instanceof Error ? error.message : "Order request failed"
      );
      setOrderPanel({
        title: "Order Result",
        payload: JSON.stringify(
          {
            url: "/api/order",
            method: "POST",
            headers: {
              Authorization: token ? "Bearer-like raw token present" : "Missing",
            },
            body,
          },
          null,
          2
        ),
        response:
          error instanceof Error
            ? error.message
            : "Order request failed",
      });
    } finally {
      setIsOrdering(false);
    }
  }

  useEffect(() => {
    refreshHealth();
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[linear-gradient(160deg,#e0f2fe_0%,#f8fafc_42%,#dcfce7_100%)] px-4 py-8 text-slate-900 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <section className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6">
        <div className="min-w-0 rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-sky-200/70 sm:px-8 sm:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
            End-to-End DevOps Project
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
            Browser Test Console for your Dockerized microservices stack
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Refresh health, request a JWT, and submit a queue-backed order
            directly from the browser.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4">
            <StatusCard label="Frontend" value={health.frontend} tone="sky" />
            <StatusCard label="Gateway" value={health.gateway} tone="emerald" />
            <StatusCard label="Auth" value={health.auth} tone="amber" />
            <StatusCard label="Orders" value={health.orders} tone="rose" />
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <button
              type="button"
              onClick={refreshHealth}
              disabled={isRefreshing}
              className="rounded-full bg-sky-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-sky-200"
            >
              {isRefreshing ? "Refreshing..." : "Refresh health"}
            </button>
            <code className="rounded-full border border-white/15 bg-white/5 px-4 py-3 text-slate-300">
              Browser uses frontend API routes under <code>/api/*</code>
            </code>
          </div>
        </div>

        <div className="min-w-0 grid gap-4 sm:gap-5 lg:gap-6">
          <form
            onSubmit={handleLogin}
            className="min-w-0 rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200 sm:p-8"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700">
              Step 1
            </p>
            <h2 className="mt-3 text-2xl font-bold">Generate auth token</h2>
            <label className="mt-6 block text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0 transition focus:border-sky-400"
              placeholder="harsh"
            />
            <button
              type="submit"
              disabled={isLoggingIn || !username.trim()}
              className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isLoggingIn ? "Generating..." : "Login and get token"}
            </button>
            <p className="mt-4 text-sm text-slate-600">{loginMessage}</p>
            <div className="mt-4 h-28 min-w-0 w-full max-w-full overflow-x-auto overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <code className="block max-w-full whitespace-pre-wrap break-all text-xs leading-6 text-slate-700">
                {token || "JWT will appear here"}
              </code>
            </div>
          </form>

          <ResultPanel panel={loginPanel} />

          <form
            onSubmit={handleOrder}
            className="min-w-0 rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200 sm:p-8"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
              Step 2
            </p>
            <h2 className="mt-3 text-2xl font-bold">Place test order</h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Item
                </label>
                <input
                  value={item}
                  onChange={(event) => setItem(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400"
                  placeholder="hk"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Quantity
                </label>
                <input
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400"
                  inputMode="numeric"
                  placeholder="1"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isOrdering || !token.trim() || !item.trim()}
              className="mt-5 w-full rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-200"
            >
              {isOrdering ? "Submitting..." : "Submit order via gateway"}
            </button>
            <p className="mt-4 text-sm text-slate-600">{orderMessage}</p>
            <p className="mt-3 text-xs text-slate-500">
              This sends the token in the <code>Authorization</code> header
              through the frontend proxy to the API gateway.
            </p>
          </form>

          <ResultPanel panel={orderPanel} />

          <aside className="min-w-0 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-lg shadow-slate-200 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-700">
              Queue Check
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              Confirm consumer processing
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              After a successful order, follow the consumer logs in your
              terminal to confirm RabbitMQ delivered the message.
            </p>
            <code className="mt-5 block rounded-2xl bg-slate-950 px-4 py-4 text-sm text-slate-100">
              docker compose logs -f order-consumer
            </code>
            <p className="mt-4 text-xs text-slate-500">
              You should see a line like <code>Processing order</code> with the
              item and quantity you submitted.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}

function StatusCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "sky" | "emerald" | "amber" | "rose";
}) {
  const tones = {
    sky: "border-sky-400/30 bg-sky-400/10 text-sky-100",
    emerald: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
    amber: "border-amber-400/30 bg-amber-400/10 text-amber-100",
    rose: "border-rose-400/30 bg-rose-400/10 text-rose-100",
  };

  return (
    <div className={`rounded-3xl border p-4 sm:p-5 ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] opacity-80">
        {label}
      </p>
      <p className="mt-3 text-lg font-semibold leading-7 text-white">{value}</p>
    </div>
  );
}

function ResultPanel({ panel }: { panel: ResponsePanel }) {
  return (
    <section className="min-w-0 max-w-full rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200 sm:p-8">
      <h3 className="text-xl font-bold text-slate-900">{panel.title}</h3>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
        Request
      </p>
      <pre className="mt-3 max-h-56 min-w-0 max-w-full overflow-auto rounded-2xl bg-slate-950 px-4 py-4 text-xs leading-6 whitespace-pre-wrap break-words text-slate-100">
        {panel.payload}
      </pre>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
        Response
      </p>
      <pre className="mt-3 max-h-56 min-w-0 max-w-full overflow-auto rounded-2xl bg-slate-100 px-4 py-4 text-xs leading-6 whitespace-pre-wrap break-words text-slate-700">
        {panel.response}
      </pre>
    </section>
  );
}
