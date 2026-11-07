import { Hero } from "@/components/home/hero";
import { HomeSections } from "@/components/home/sections";

export default function Home() {
  return (
    <div className="home">
      <Hero />
      <HomeSections />
    </div>
  );
}
