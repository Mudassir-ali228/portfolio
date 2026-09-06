import { Nav } from "@/components/Nav";
import { Masthead } from "@/components/Masthead";
import { WorkIndex } from "@/components/WorkIndex";
import { Profile } from "@/components/Profile";
import { Ledger } from "@/components/Ledger";
import { Capabilities } from "@/components/Capabilities";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main" className="relative z-10">
        <Masthead />
        <WorkIndex />
        <Profile />
        <Ledger />
        <Capabilities />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
