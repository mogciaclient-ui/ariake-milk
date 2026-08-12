import Image from "next/image";

export function MilmoLoadingScreen({ message = "読み込み中..." }: { message?: string }) {
  return <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center overflow-hidden bg-[#F4F8FF] px-6">
    <div aria-hidden="true" className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-blue-200/25 blur-3xl" />
    <div aria-hidden="true" className="absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-rose-100/35 blur-3xl" />
    <div className="relative text-center">
      <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_-30px_rgba(37,99,235,0.45)] sm:h-56 sm:w-56">
        <Image src="/milmo-loading.png" alt="milmo. 読み込み中" fill sizes="224px" priority className="object-cover" />
      </div>
      <p className="mt-6 text-sm font-bold tracking-[0.12em] text-[#2563EB]">{message}</p>
      <div className="mx-auto mt-4 flex w-fit gap-2" aria-hidden="true">
        {[0, 1, 2].map((index) => <span key={index} className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#2563EB]" style={{ animationDelay: `${index * 140}ms` }} />)}
      </div>
    </div>
  </div>;
}
