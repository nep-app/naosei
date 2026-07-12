# NEP — Comunidade & Registo (versão web)

Versão web da NEP App: um **registo pessoal privado** (consumos + bem-estar/emoções)
e um **fórum anónimo** estilo Reddit (temas fixos, perguntas & respostas, alcunhas à
escolha, votos positivos). Português e inglês.

- **Visual:** igual à app original (modo escuro, roxo→azul, coração no logótipo).
- **Contas:** mesmo projeto Firebase da NEP App — a conta é a mesma (email/palavra-passe
  ou Google).
- **Privacidade (Row Level Security):** o diário pessoal é só do dono; no fórum ninguém
  vê o email/nome real, apenas a alcunha. Regras em [`firestore.rules`](./firestore.rules).

## Correr localmente

```bash
npm install
npm run dev
```

## Publicação

Publicado automaticamente no **GitHub Pages** via GitHub Actions
(`.github/workflows/deploy.yml`) em cada push. Link: `https://nep-app.github.io/naosei/`.

## Configuração no Firebase (uma vez, feita pelo dono da conta)

Ver [`CONFIGURAR-FIREBASE.md`](./CONFIGURAR-FIREBASE.md) — 3 passos simples para o
login funcionar e para guardar os dados em segurança.
