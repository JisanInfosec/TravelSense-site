import { sizedImage } from "@/lib/utils";

const IMG = "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/Nafa-khum_waterfalls_at_Bandarban.jpg/1920px-Nafa-khum_waterfalls_at_Bandarban.jpg";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid flex-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sizedImage(IMG, 1280)} alt="Nafakhum waterfall in Bandarban" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-brand-darker/90 via-brand-darker/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="font-display text-4xl font-semibold leading-tight">
            Your next adventure
            <span className="block italic text-leaf">starts with a plan.</span>
          </p>
          <p className="mt-4 max-w-md text-white/80">Save places you love, build a travel wishlist and help others with honest reviews.</p>
          <p className="mt-8 text-[11px] text-white/50">Nafakhum Waterfall · Photo via Wikimedia Commons</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md animate-fade-up">
          <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
