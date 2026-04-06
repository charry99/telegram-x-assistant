async function getDrafts() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }
  
  const res = await fetch(`${apiUrl}/drafts`, {
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch drafts: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export default async function HomePage() {
  const drafts = await getDrafts();

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Telegram X Assistant</h1>
      <p>Draft approvals and publishing dashboard</p>

      <div style={{ marginTop: 24 }}>
        {drafts.map((draft: any) => (
          <div
            key={draft.id}
            style={{
              border: "1px solid #ddd",
              padding: 16,
              borderRadius: 12,
              marginBottom: 12
            }}
          >
            <p>{draft.content}</p>
            <small>Status: {draft.status}</small>
          </div>
        ))}
      </div>
    </main>
  );
}