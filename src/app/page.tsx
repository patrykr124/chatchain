'use client'

import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { injected } from 'wagmi/connectors';
import Button from "./components/Button";
import { Boxes } from "./components/ui/background-boxes";

export default function Home() {
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { push } = useRouter();
  const [wait, setWait] = useState(false)

  const handleAuth = async () => {
    try {
      setWait(true);
      if (isConnected) {
        console.log("Odłączanie przed ponownym połączeniem...");
        await disconnectAsync();
      }
  
      const result = await connectAsync({
        connector: injected({ target: "metaMask" }),
      });
  
      const account = result.accounts[0];
      const chainId = result.chainId;
      if (!account || !chainId) {
        console.log("Nie znaleziono konta lub łańcucha");
        return;
      }
  
      const challengeResponse = await fetch("/api/moralis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: account, chainId }),
      });
  
      const challengeData = await challengeResponse.json();
      if (!challengeResponse.ok) throw new Error("Błąd zapytania Moralis");
  
     
      const signature = await signMessageAsync({ message: challengeData.message });
  
   
      const verifyResponse = await fetch("/api/moralis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: account, chainId, signature, message: challengeData.message }),
      });
  
      const verifyData = await verifyResponse.json();
      if (!verifyResponse.ok) throw new Error("Błąd weryfikacji Moralis");
  
      console.log("✅ Użytkownik zapisany w Moralis:", verifyData);
  
      const signInResponse = await signIn("credentials", {
        address: account,
        signature,
        redirect: false,
        callbackUrl: `${window.location.origin}/home`,
      });
  
      if (signInResponse?.url) {
        await fetch("/api/auth/session");
        push(signInResponse.url);
      } else {
        throw new Error("Logowanie nie powiodło się");
      }
  
    } catch (error) {
      console.error("Błąd uwierzytelniania:", error);
    } finally {
      setWait(false);
    }
  };
  return (
    <section style={{ backgroundImage: "url('/assets/bgHeader.png')", backgroundRepeat: "no-repeat", backgroundSize: "cover" }} className='h-screen relative overflow-hidden px-4 md:px-0' >
      <Boxes />
      <div className='absolute w-full h-full bg-black/15 -z-1'></div>

      <div className=' absolute md:bottom-10 bottom-20 left-4 md:-left-20 w-[200px] h-[200px] md:w-[600px] md:h-[350px] '>
        <Image src={"/assets/monkey.png"} alt='bg_image' fill className="object-contain" />
      </div>

      <div className=' absolute md:top-10 md:right-10 right-4 top-20 md:w-[300px] md:h-[300px] w-[200px] h-[200px]'>
        <Image src={"/assets/phone.png"} alt='bg_image' fill className="object-contain" />
      </div>
      <div className='z-[99999] w-full h-full flex items-center justify-center'>
        <div className='flex items-center justify-center flex-col gap-6'>
          <h1 className='text-black z-50 text-center'>Welcome in Chat Chain</h1>
          <p className='text-black z-50 text-center'>Welcome to the Chat Group Metaverse – powered by Blockchain.</p>
          <div className="h-16 z-50">
            <Button wait={wait} onClick={handleAuth} >{wait ? 'Pleas wait' : 'Welcome'}</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
