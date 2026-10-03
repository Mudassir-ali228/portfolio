import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { WorkIndex } from "@/components/WorkIndex";
import { Figures } from "@/components/art/Figures";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <WorkIndex />
        <Figures />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
