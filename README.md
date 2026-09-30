# Festival da Primavera — site público

Landing page e páginas de eventos do Festival da Primavera. Todo o conteúdo vem do banco Supabase e é editado no painel [ADM-FestivalPrimaveraCultura](https://github.com/MarcosOliveiraMaster/ADM-FestivalPrimaveraCultura).

- **Next.js 16** (App Router) + Tailwind CSS 4 + Supabase
- Especificação completa: [`docs/ESPECIFICACAO.md`](docs/ESPECIFICACAO.md)

## Rotas

| Rota | O que mostra |
|---|---|
| `/` | Página inicial (montada no editor do ADM) |
| `/eventos` | Todos os eventos publicados, com filtro por categoria |
| `/eventos/<endereço>` | Página de um evento ou página institucional |
| `/privacidade` | Política de privacidade (texto editável no ADM) |
| `POST /api/interesse` | Recebe o formulário de interesse (anti-spam + limite por IP) |
| `POST /api/track` | Registra visitas e cliques anônimos (sem cookies) |

## Rodar localmente

```bash
cp .env.example .env.local   # valores públicos do Supabase já preenchidos
npm install
npm run dev                  # http://localhost:3000
```

## Publicar na Vercel

Importe este repositório na Vercel e cadastre as variáveis de `.env.example`.

## Código compartilhado

`src/shared/` (tipos de bloco, renderizador das páginas e estilos) é **idêntico** nos dois repositórios, para que a pré-visualização do editor seja igual ao site. Ao alterar, copie a pasta para o outro repositório.
