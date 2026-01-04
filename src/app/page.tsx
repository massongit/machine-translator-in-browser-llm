import { Body } from "@/components/body";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen">
      <main className="flex flex-col gap-8 items-center">
        <Body />
      </main>
    </div>
  );
}
