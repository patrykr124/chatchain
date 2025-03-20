'use client'
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDisconnect, useSignMessage } from "wagmi";
import Button from "../components/Button";

interface SessionUser {
  address?: string; 
}


export default function HomeApp() {
  const { disconnectAsync } = useDisconnect();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const { data: session } = useSession();
  const { signMessageAsync } = useSignMessage();

  const user = session?.user as SessionUser;

  async function handleSingOut() {
    try {
      await disconnectAsync();
      await signOut({
        redirect: false,
        callbackUrl: "/"
      })
      router.refresh();
      router.push('/')
    } catch (error) {
      console.log(error)
    }
  }

  async function handleSendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!message || !user?.address) return;

    try {
      const signature = await signMessageAsync({ message })

      const response = await fetch("/api/sendMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"

        },
        body: JSON.stringify({ message, sender: user?.address, signature })
      })

      if (!response.ok) {
        throw new Error(`Błąd HTTP: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setMessage('')
        console.log("Wiadomość wysłana!")
      } else {
        console.log("Błąd wysyłania", data.error)
      }
    } catch (error) {
      console.error("Błąd wysyłania wiadomości:", error);

    }
  }

  return (
    <section className="flex h-screen w-screen">
      <div className="hidden w-[300px] gap-2 backdrop-blur-3xl shadow-2xl  h-screen overflow-hidden md:flex flex-col p-4 items-center">
        <div className="flex flex-col gap-2 flex-1 justify-end w-full ">
          <div className="  w-full overflow-hidden flex flex-col relative">
            <div className="absolute left-0  h-full w-1/2 bg-linear-to-r from-white to-transparent"></div>
            <div className="absolute right-0  h-full w-1/2 bg-linear-to-l from-white to-transparent"></div>
            <h4 className="text-sm ">{user?.address}</h4>
          </div>
          <div className="min-h-[80px] flex items-center justify-center">
            <Button onClick={handleSingOut}>Logout</Button>
          </div>
        </div>
      </div>
      <div className="w-full bg-stone-100 flex flex-col justify-between p-2 ">
        <div className="text-center p-20">MORE LATER</div>
        <div className="h-[80px] flex items-center">
          <form onSubmit={handleSendMessage} className="bg-black/10 rounded-md  w-full flex items-center ">
            <input value={message} onChange={(e) => setMessage(e.target.value)} className="p-2  outline-0 w-full" type="text" placeholder="Type a message" />
            <button type="submit" className="hover:border-r-0 hover:border-b-0 transition-all duration-50 hover:shadow-sm h-[45px] w-[150px] shadow-sm cursor-pointer bg-[#fdfe1f] rounded-md border-b-2 border-r-2 ">Send</button>
          </form>
        </div>
      </div>
    </section>
  )
}