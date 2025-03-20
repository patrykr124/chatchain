import { NextRequest, NextResponse } from "next/server";
import Moralis from "moralis";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message, sender, signature } = body;

        if (!message || !sender || !signature) {
            return NextResponse.json(
                { error: "Brak wymaganych danych: message, sender lub signature" },
                { status: 400 }
            );
        }

        if (!process.env.MORALIS_API_KEY) {
            console.error("Brak zmiennej środowiskowej MORALIS_API_KEY");
            return NextResponse.json(
                { error: "Błąd konfiguracji serwera" },
                { status: 500 }
            );
        }

        // **1️⃣ Inicjalizacja Moralis**
        if (!Moralis.Core.isStarted) {
            await Moralis.start({
                apiKey: process.env.MORALIS_API_KEY,
            });
            console.log("✅ Moralis initialized!");
        }

        // **2️⃣ Zapisanie wiadomości do Moralis Database przez REST API**
        const response = await fetch("https://authapi.moralis.io/database/collections/Messages/documents", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.MORALIS_API_KEY,
            },
            body: JSON.stringify({
                content: message,
                sender: sender,
                signature: signature,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Błąd zapisu wiadomości w Moralis:", response.status, errorText);
            return NextResponse.json(
                { error: "Błąd po stronie Moralis API", details: errorText },
                { status: response.status }
            );
        }

        const responseData = await response.json();
        console.log("✅ Wiadomość zapisana w Moralis:", responseData);

        return NextResponse.json({ success: true, message: responseData }, { status: 200 });

    } catch (error) {
        console.error("❌ Błąd wysyłania wiadomości:", error);
        return NextResponse.json(
            { success: false, error: "Wewnętrzny błąd serwera" },
            { status: 500 }
        );
    }
}
