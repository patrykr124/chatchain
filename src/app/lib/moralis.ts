import Moralis from "moralis";

export async function initMoralis() {
  if (!Moralis.Core.isStarted) {
    await Moralis.start({
      apiKey: process.env.MORALIS_API_KEY,
    });
    console.log(" Moralis initialized!");
  }
}

export { Moralis };
