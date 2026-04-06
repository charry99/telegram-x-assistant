async function getDrafts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drafts`, {
    cache: "no-store"
  });

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