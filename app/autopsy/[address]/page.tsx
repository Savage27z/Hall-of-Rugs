import AutopsyReport from "@/components/AutopsyReport";

export default function AutopsyPage({
  params,
}: {
  params: { address: string };
}) {
  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto mb-6">
        <a
          href="/"
          className="font-mono text-[10px] tracking-wider text-muted hover:text-accent transition-colors duration-150"
        >
          ← BACK TO GRAVEYARD
        </a>
      </div>
      <AutopsyReport address={params.address} />
    </div>
  );
}
