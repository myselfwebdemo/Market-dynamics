export async function classifyExternality(externalityQuery: string, market_structure: string, industry: string) {
    const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalityQuery, market_structure, industry })
    });

    return await res.json();
}
