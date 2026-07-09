# Estúdio Forma — Portfólio de Arquitetura

Site responsivo de portfólio para arquitetura, desenvolvido com React, Vite e TypeScript.

## Tecnologias

- **React** + **Vite** + **TypeScript**
- **Tailwind CSS** v4
- **React Router** — navegação entre páginas
- **Framer Motion** — animações sutis
- **Lucide React** — ícones
- **React Hook Form** — formulário de contato
- **EmailJS** — envio de e-mail sem backend

## Como rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173).

## Build para produção

```bash
npm run build
npm run preview
```

## Estrutura do projeto

```
src/
├── assets/          # Imagens e logos
├── components/      # Navbar, Hero, Footer, Gallery, etc.
├── pages/           # Home, Projetos, Serviços, Sobre, Contato
├── data/            # Conteúdo (projetos, serviços, depoimentos)
├── hooks/           # useMediaQuery, useScrollToTop
├── utils/           # Helpers e animações
└── styles/          # CSS global e tema
```

## Personalização

### Conteúdo

Edite os arquivos em `src/data/`:

- `projects.ts` — projetos do portfólio
- `services.ts` — serviços prestados
- `testimonials.ts` — depoimentos de clientes
- `navigation.ts` — links do menu e informações de contato

### Imagens

Substitua as URLs do Unsplash por suas próprias imagens em `src/assets/imagens/` e atualize os caminhos nos arquivos de dados.

### Cores e tipografia

Ajuste as variáveis CSS em `src/styles/index.css`:

```css
--color-bg: #fafaf8;
--color-accent: #8b7355;
/* ... */
```

### Formulário de contato (EmailJS)

1. Crie uma conta em [emailjs.com](https://www.emailjs.com/)
2. Configure um serviço de e-mail e um template
3. Copie `.env.example` para `.env` e preencha:

```env
VITE_EMAILJS_SERVICE_ID=seu_service_id
VITE_EMAILJS_TEMPLATE_ID=seu_template_id
VITE_EMAILJS_PUBLIC_KEY=sua_public_key
```

No template EmailJS, use as variáveis: `from_name`, `from_email`, `phone`, `message`.

## Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Home com hero, projetos em destaque e serviços |
| `/projetos` | Galeria completa com filtros por categoria |
| `/projetos/:slug` | Detalhe de um projeto |
| `/servicos` | Serviços prestados e processo de trabalho |
| `/sobre` | Apresentação do estúdio |
| `/contato` | Formulário e informações de contato |

## Licença

Projeto privado — Estúdio Forma.
