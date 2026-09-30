export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-4 px-5 text-center">
      <div className="text-5xl">🌱</div>
      <h1 className="fp-heading fp-h2">Página não encontrada</h1>
      <p className="opacity-70">Essa página ainda não floresceu — ou saiu do ar.</p>
      <a href="/" className="fp-btn fp-btn-primary">Voltar ao início</a>
    </div>
  );
}
