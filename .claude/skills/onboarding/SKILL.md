---
name: onboarding
description: Primo avvio del Task Command Center per chi usa l'app, o rifacimento delle sue scelte. Verifica la chiave, fa una domanda alla volta su come scrivere i task e quali gesti fa l'assistente, salva le scelte nell'app e collega l'assistente al kit. Usala quando la persona dice "onboarding", "configuriamo i task", "rifacciamo le scelte", quando `profilo` dice che non c'è un profilo o che il questionario è cambiato, oppure con /onboarding.
---

# Onboarding del Task Command Center

Obiettivo: alla fine la persona ha (1) la chiave che funziona, (2) le sue scelte salvate nell'app, (3) l'assistente che sa dove trovare kit e scelte in ogni conversazione. Parla in italiano semplice, senza gergo tecnico. **Una domanda alla volta.**

`<kit>` è la cartella di questo repository (dove sta `bin/task.mjs`). Usa il percorso assoluto nei comandi.

## 1. Chiave e identità

1. Lancia `node <kit>/bin/task.mjs chi-sono`.
2. Se risponde «Sei ... nel workspace ...»: conferma con la persona che è lei e vai al passo 2.
3. Se manca la chiave o è rifiutata, guida la persona così, un passo per volta:
   - sul sito del Task Command Center, Impostazioni → Assistente → «Crea chiave» (nome per esempio «Portatile»), poi «Copia»;
   - **lei**, in un terminale (non nella chat), lancia `node <kit>/bin/task.mjs chiave` e incolla la chiave;
   - rilancia `chi-sono`.
   Non chiedere mai di incollare la chiave nella chat. Se te la incolla comunque, dille di revocarla subito dal sito e di crearne un'altra.
4. Se la porta risponde «spenta», l'accesso non è ancora attivo: chiedi alla persona di avvisare Mihai e fermati.

## 2. Prima di cominciare: tre cose da sapere

Dille in poche righe, prima delle domande:
- quello che crei nel Team lo vedono tutti (Mihai e le altre persone del Team): non c'è un posto privato;
- puoi modificare i task che hai creato o su cui sei assegnato; gli altri li puoi commentare;
- una menzione (`@nome`) in un commento manda una notifica.

## 3. Le domande

1. Leggi il questionario dall'app: `node <kit>/bin/task.mjs profilo questionario --json` (elenco di voci con `chiave`, `domanda`, `perche`, `tipo`, `opzioni`, `predefinito`). Le domande stanno nell'app: non inventarne altre e non cambiarne il senso.
2. Se c'è già un profilo (`node <kit>/bin/task.mjs profilo --json`), dillo e parti dalle risposte attuali come proposta.
3. Per ogni voce, nell'ordine: la domanda, una riga col perché, le opzioni con la predefinita segnata. Usa lo strumento delle domande a scelta se c'è (AskUserQuestion), altrimenti un elenco numerato. Per sì/no due opzioni; per il testo libero, facoltativo, accetta anche «niente».
4. Se la persona chiede «cosa fa Mihai?», rispondi con il perché della domanda: le opzioni predefinite seguono le sue regole, ma la scelta è sua.

## 4. Riepilogo e salvataggio

1. Mostra tutte le risposte in un elenco breve e chiedi conferma («salvo così?»). Correggi quello che vuole.
2. Salva tutto in un colpo: `node <kit>/bin/task.mjs profilo salva --json '<oggetto {chiave: valore}>'`. I sì/no come `true`/`false`. Attento alle virgolette: il testo libero non deve rompere il JSON.
3. Mostra l'esito (il comando stampa il profilo salvato).

## 5. Collega l'assistente al kit

Perché le scelte valgano in ogni conversazione, non solo in questa cartella:
1. Proponi di aggiungere questo blocco in fondo a `~/.claude/CLAUDE.md` (le istruzioni globali del suo Claude Code). Mostralo e chiedi il sì prima di scrivere; se il file non esiste, crealo; se il blocco c'è già, aggiornalo invece di duplicarlo.

```markdown
## Task Command Center
Quando la conversazione tocca i task, leggi e segui `<kit>/ISTRUZIONI-ASSISTENTE.md` (kit: `<kit>`).
```

   Sostituisci `<kit>` col percorso assoluto vero.
2. Se dice di no, spiegagli che allora le scelte valgono solo quando apre Claude Code nella cartella del kit.

## 6. Chiusura

1. Se ha scelto il piano del giorno, mostra `node <kit>/bin/task.mjs oggi`.
2. Ricordagli: le scelte si cambiano quando vuole (anche dal sito, Impostazioni → Assistente); il kit si aggiorna con `git pull` nella sua cartella; se perde il computer o sospetta che qualcuno abbia la chiave, revoca le chiavi dal sito («Revoca tutte»): cambiare la password del sito non basta.
