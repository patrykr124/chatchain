export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { address, chainId, signature } = body;

    if (!address || !chainId) {
      return new Response(
        JSON.stringify({ error: "Brak wymaganych danych: address lub chainId" }),
        { status: 400 }
      );
    }

    if (!process.env.MORALIS_API_KEY || !process.env.NEXTAUTH_URL) {
      console.error("Brak zmiennych środowiskowych:", {
        MORALIS_API_KEY: process.env.MORALIS_API_KEY,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      });
      return new Response(
        JSON.stringify({ error: "Błąd konfiguracji serwera" }),
        { status: 500 }
      );
    }

    if (!signature) {
      const challengeResponse = await fetch(
        "https://authapi.moralis.io/challenge/request/evm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.MORALIS_API_KEY,
          },
          body: JSON.stringify({
            domain: process.env.APP_DOMAIN || "amazing.dapp",
            uri: process.env.NEXTAUTH_URL,
            address,
            chainId,
            timeout: 15,
          }),
        }
      );

      if (!challengeResponse.ok) {
        const errorText = await challengeResponse.text();
        console.error("Błąd API Moralis:", challengeResponse.status, errorText);
        return new Response(
          JSON.stringify({ error: "Błąd po stronie Moralis API", details: errorText }),
          { status: challengeResponse.status }
        );
      }

      const challengeData = await challengeResponse.json();
      if (!challengeData.message) {
        return new Response(
          JSON.stringify({ error: "Nieprawidłowa odpowiedź Moralis" }),
          { status: 500 }
        );
      }

      return new Response(JSON.stringify({ message: challengeData.message }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const verifyResponse = await fetch(
      "https://authapi.moralis.io/challenge/verify/evm",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.MORALIS_API_KEY,
        },
        body: JSON.stringify({
          message: body.message,
          signature,
        }),
      }
    );

    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text();
      console.error("Błąd weryfikacji Moralis:", verifyResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Błąd po stronie Moralis API", details: errorText }),
        { status: verifyResponse.status }
      );
    }

    const verifyData = await verifyResponse.json();
    console.log("✅ Użytkownik zweryfikowany w Moralis:", verifyData);

    return new Response(JSON.stringify({ success: true, user: verifyData }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Błąd w API Next.js:", error);
    return new Response(
      JSON.stringify({ error: "Wewnętrzny błąd serwera"}),
      { status: 500 }
    );
  }
}
