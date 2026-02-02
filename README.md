# Mini Kanban – Front-end

Aplicação web em Next.js para gerenciar quadros no estilo Kanban. Permite registrar/login, criar quadros, organizar colunas e cartões com arrastar‑e‑soltar e manter tudo sincronizado com a API.

## Tecnologias principais
- Next.js 16 (App Router) + React 19 + TypeScript  
- Tailwind CSS v4 (sem config extra)  
- Radix UI (dialog, dropdown, scroll area) + Sonner (toasts) + Lucide (ícones)  
- Axios para HTTP, Joi para validação de formulários  

## Pré‑requisitos
- Node.js **≥ 18.18** (recomendado 20.x)  
- npm (ou pnpm/yarn/bun se preferir ajustar os scripts)

## Variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto com:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Se não definir, o front usará esse valor padrão. A API precisa expor os endpoints indicados em “Integração com a API”.

## Instalação e execução
```bash
# 1) Instalar dependências
npm install

# 2) Rodar em desenvolvimento (http://localhost:3000)
npm run dev

# 3) Opcional: checar lint
npm run lint

# Build e produção local
npm run build
npm run start
```

## Como o app funciona
### Autenticação
- Páginas `login` e `register` em `app/(auth)` com validação Joi (email válido, senha ≥ 6 caracteres, sem espaços).  
- Ao autenticar, o token JWT é salvo em cookie `mk_access` (24h).  
- Middleware (`middleware.ts`) protege `/home` e `/boards/*`; sem token o usuário é redirecionado para `/login`.  
- Provider (`lib/providers/auth-provider.tsx`) mantém o token em estado e oferece `setAccessToken` e `logout`.

### Home (`/home`)
- Lista todos os quadros do usuário (GET `/boards`).  
- Card “New board” abre um diálogo para criar (POST `/boards`) com feedback de carregamento.  
- Cada card de quadro abre `/boards/:id`; botão de lixeira abre diálogo de confirmação para exclusão (DELETE `/boards/:id`) com otimistic update + rollback.  
- Navbar fixa com botão de logout.

### Board (`/boards/[id]`)
- Busca detalhes do quadro (GET `/boards/:id`), ordena colunas por `position`.  
- Cada coluna mostra cartões ordenados; possui botão “Add” para criar cartão.  
- Criar/editar cartão abre `CardEditDialog` com validação de título ≥ 3 caracteres; salva via POST `/columns/:columnId/cards` ou PUT `/cards/:id`.  
- Excluir cartão abre `CardDeleteDialog` e chama DELETE `/cards/:id` (otimista com rollback).  
- Drag & drop de cartões entre colunas ou dentro da mesma coluna; envia PATCH `/cards/:id/move` com `newColumnId` e `newPosition`.  
- Estado “Board not found” aparece se a API retorna 404.  

## Integração com a API (expectativas)
- Formato de resposta: `{ success: boolean, data, error }`; os serviços usam `unwrapApiData` para ler `data` ou lançar erro.  
- Endpoints usados:
  - `POST /auth/register` → `{ user, accessToken }`
  - `POST /auth/login` → `{ user, accessToken }`
  - `GET /boards`
  - `POST /boards` (body `{ name }`)
  - `GET /boards/:id`
  - `DELETE /boards/:id`
  - `POST /boards/:id/columns` (body `{ name, position? }`)
  - `POST /columns/:columnId/cards` (body `{ title, description? }`)
  - `PUT /cards/:id` (body `{ title?, description? }`)
  - `PATCH /cards/:id/move` (body `{ newColumnId, newPosition }`)
  - `DELETE /cards/:id`
- As chamadas autenticadas enviam `Authorization: Bearer <token>`; o token é lido do cookie.

## Estrutura relevante de pastas
- `app/(auth)/login`, `app/(auth)/register` – telas públicas de acesso.  
- `app/(app)/home` – listagem e criação/remoção de quadros.  
- `app/(app)/boards/[id]` – tela do quadro com colunas e cartões.  
- `lib/service` – configuração do Axios (`api.ts`), mapeadores e serviços para auth/boards/cards.  
- `lib/providers` – `AuthProvider` com persistência em cookie.  
- `components/` – Navbar e componentes de UI (button, dialog, toast, etc.).  
- `app/globals.css` – tema e estilização geral (scrollbars, cores).  

## Dicas de uso/teste manual
- Crie uma conta em `/register`, depois acesse `/home`.  
- Adicione um quadro, abra-o, crie alguns cartões e arraste-os para sentir a atualização otimista.  
- Teste apagar quadro ou cartão para ver os diálogos de confirmação e toasts de sucesso/erro.  
- Remova o cookie `mk_access` ou abra em aba anônima para validar o redirecionamento automático para login.

## Scripts disponíveis
- `npm run dev` – servidor de desenvolvimento.  
- `npm run build` – build de produção.  
- `npm run start` – inicia o build já gerado.  
- `npm run lint` – ESLint com config do Next.  
