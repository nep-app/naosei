# Os 3 cliques para o site funcionar a 100%

O site já está no ar. Para as pessoas conseguirem **entrar** e para os dados ficarem
**guardados em segurança**, faltam 3 passos que só o dono da conta Firebase pode dar
(é a tua conta). Demora ~5 minutos. Não é preciso saber programar.

Vai a **https://console.firebase.google.com** e escolhe o projeto **harm-reduction-d4f7d**.

---

## 1. Deixar o site entrar (autorizar o endereço)

O Google, por segurança, só deixa entrar a partir de endereços autorizados.

1. No menu à esquerda: **Build → Authentication → Settings** (Definições).
2. Separador **Authorized domains** (Domínios autorizados).
3. Carrega em **Add domain** e escreve: `nep-app.github.io`
4. **Add**.

## 2. Ligar a entrada com Google

1. **Build → Authentication → Sign-in method**.
2. Na lista de fornecedores, escolhe **Google → Enable (Ativar) → Save**.

(O email/palavra-passe já estava ligado por causa da app — não é preciso mexer.)

## 3. Aplicar as regras de privacidade (cada um só vê o que é seu)

As regras estão no ficheiro `firestore.rules` deste projeto. Elas **mantêm as regras
da app original** e acrescentam as do site novo.

1. **Build → Firestore Database → Rules** (Regras).
2. Abre o ficheiro `firestore.rules` (neste repositório), copia **todo** o conteúdo.
3. Cola na caixa, substituindo o que lá está.
4. **Publish** (Publicar).

> Importante: este ficheiro já inclui as regras antigas da app **e** as novas.
> Ao publicá-lo não partes a app existente.

---

Feito isto, o site fica totalmente operacional: entrada pelo Google (ou email),
diário privado e fórum anónimo a guardar tudo em segurança.
