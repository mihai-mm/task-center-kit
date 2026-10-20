# Task Command Center per il tuo assistente

Con questo kit il tuo assistente (Claude Code) usa il Task Command Center al posto tuo: legge i tuoi task, ne crea di nuovi, li aggiorna, commenta, li chiude. Lavora **con i tuoi permessi**: vede e fa solo quello che vedi e fai tu sul sito.

## Cosa ti serve

- Il tuo accesso al Task Command Center (lo stesso del sito), che ti ha dato Mihai.
- Claude Code installato sul tuo computer (porta con sé Node, che serve al kit).
- Questo repository sul tuo computer.

## Primo avvio, in cinque passi

1. **Scarica il kit** in una cartella a tua scelta:

   ```bash
   git clone https://github.com/mihai-mm/task-center-kit.git
   ```

   Non serve un account GitHub per scaricarlo.

2. **Crea la tua chiave** sul sito: Impostazioni → Assistente → scrivi un nome (per esempio «Portatile») → «Crea chiave» → «Copia». La vedi una volta sola.

3. **Salvala sul computer**, tu, in un terminale aperto nella cartella del kit:

   ```bash
   node bin/task.mjs chiave
   ```

   Incollala e premi Invio: non si vede mentre la incolli, ed è normale. Finisce in un file leggibile solo da te. **Non incollarla mai nella chat dell'assistente.**

4. **Apri Claude Code nella cartella del kit** e scrivi `/onboarding`. Ti fa una domanda alla volta: come vuoi i titoli e le note dei task, quando può crearne uno, cosa fa a inizio e fine giornata. Le tue scelte restano nell'app, e le rivedi quando vuoi dal sito (Impostazioni → Assistente).

5. **Alla fine** l'onboarding ti propone di collegare il kit alle istruzioni generali del tuo Claude Code: così funziona in qualsiasi cartella, non solo in questa.

## Da sapere

- **Hai due spazi: il Team e il tuo spazio privato.** Il Team è condiviso: un task dentro un progetto del Team lo vedono tutti i membri (Mihai e gli altri). Il tuo spazio privato è solo tuo: ci finiscono i task senza progetto e quelli dentro un progetto privato tuo. Mihai non vede i tuoi privati e tu non vedi i suoi.
- **Come si sceglie dove va un task:** se lo metti in un progetto del Team, lo vedono tutti; se non scegli nessun progetto, o scegli un tuo progetto privato, lo vedi solo tu. Il tuo assistente, prima di creare un task, si chiede (e se serve ti chiede) se deve stare nel Team o nel privato.
- **Modifichi i task che hai creato o su cui sei assegnato**; gli altri li puoi commentare.
- **Una menzione** (`@nome`) in un commento manda una notifica.
- **Se perdi il computer** o pensi che qualcuno abbia la chiave: sito → Impostazioni → Assistente → «Revoca tutte». La chiave scade comunque dopo 180 giorni: allora ne crei una nuova e ripeti il passo 3.
- **Cambiare la password del sito non revoca le chiavi.** Dopo un furto o un sospetto non basta cambiarla: vai in Impostazioni → Assistente e premi «Revoca tutte».
- **Aggiornare il kit**: nella sua cartella, `git pull`. Se l'app risponde «il kit è troppo vecchio», è questo che serve.
- **Per togliere la chiave da questo computer**: `node bin/task.mjs chiave --rimuovi` (e revocala sul sito).

## Se qualcosa non va

| Messaggio | Cosa fare |
|---|---|
| «Nessuna chiave su questo computer» | Passi 2 e 3 |
| «Chiave non valida, scaduta o revocata» | Creane una nuova dal sito e ripeti il passo 3 |
| «La porta per gli assistenti è spenta» | Avvisa Mihai |
| «Puoi vedere il task ma non modificarlo» | Il task è di un altro: commentalo |
| «Troppe richieste» | Aspetta un minuto |
| «Non raggiungo l'app» | Controlla la connessione; se era una modifica, verifica prima di riprovare |

Per l'elenco dei comandi: `node bin/task.mjs aiuto`.
