#!/usr/bin/env node
// CLI leggera del Task Command Center per l'assistente di chi usa l'app.
// Manda i comandi alla porta dell'app con la tua chiave personale e stampa la
// risposta: stessi comandi della CLI di Mihai, ma con i TUOI permessi.
// Nessuna dipendenza: basta Node 18 o più recente.
//
//   node bin/task.mjs chiave          salva la chiave (la scrivi tu, nascosta)
//   node bin/task.mjs chi-sono        prova: chi sei per l'app
//   node bin/task.mjs <comando> ...   qualsiasi comando della porta
//   node bin/task.mjs aiuto           elenco dei comandi

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";

const VERSIONE_KIT = 1; // protocollo con la porta: se sale, la porta chiede di aggiornare il kit
const URL_APP = process.env.TASK_CENTER_URL || "https://task-command-center-eight.vercel.app";
const FILE_CHIAVE = path.join(os.homedir(), ".config", "task-center", "chiave");
const TIMEOUT_MS = 20_000;

// Comandi che non cambiano niente: solo questi si riprovano una volta se la rete salta.
const SOLO_LETTURA = new Set(["chi-sono", "rank", "list", "show", "oggi", "done-list"]);

const [major] = process.versions.node.split(".").map(Number);
if (major < 18) {
  console.error(`Serve Node 18 o più recente (hai ${process.versions.node}).`);
  process.exit(1);
}

const AIUTO = `Task Command Center, CLI per il tuo assistente.

Prima volta:
  node bin/task.mjs chiave          incolla la chiave creata sul sito (Impostazioni → Assistente)
  node bin/task.mjs chi-sono        controlla che funzioni

Comandi (con i tuoi permessi):
  oggi [--team]                     i tuoi task di oggi (--team: tutto il Team)
  rank | list [--project X] [--assignee nome] [--all]
  show <id>                         un task per intero
  add --title "..." [--notes "..."] [--project X] [--due AAAA-MM-GG] [--assignee nome1,nome2] [--priority high] [--pronto]
  set <id> [--status in_progress|done|...] [--title ...] [--due ...] [--add-assignee nome] [--pronto|--non-pronto]
  claude-queue                      i task che hai affidato al tuo Claude, con via libera (--assignee claude --pronto)
  claude-parcheggio [--json]        affidati al tuo Claude ma ancora senza via libera
  done <id>                         chiude il task
  comment <id> --body "..."         commenta (anche i task degli altri)
  snooze <id> --until AAAA-MM-GG    rinvia
  note list|show|add|set            note dei progetti del Team
  sessione add|list                 tempo lavorato
  profilo [questionario|set|salva]  come vuoi che il tuo assistente lavori
  done-list [--days 7]              chiusi di recente

Altro:
  node bin/task.mjs chiave --rimuovi   cancella la chiave da questo computer
`;

function leggiChiave() {
  if (process.env.TASK_CENTER_KEY) return process.env.TASK_CENTER_KEY.trim();
  try {
    return fs.readFileSync(FILE_CHIAVE, "utf8").trim();
  } catch {
    return null;
  }
}

/** Legge la chiave dal terminale senza mostrarla. */
function chiediNascosto(domanda) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => {
      if (s.includes(domanda)) process.stdout.write(domanda);
    };
    rl.question(domanda, (risposta) => {
      rl.close();
      process.stdout.write("\n");
      resolve(risposta.trim());
    });
  });
}

async function comandoChiave(argv) {
  if (argv.includes("--rimuovi")) {
    fs.rmSync(FILE_CHIAVE, { force: true });
    console.log("Chiave rimossa da questo computer. Ricordati di revocarla anche sul sito (Impostazioni → Assistente).");
    return 0;
  }
  if (!process.stdin.isTTY) {
    console.error("Questo comando va lanciato da te in un terminale: la chiave non deve passare dalla chat dell'assistente.");
    return 1;
  }
  const chiave = await chiediNascosto("Incolla la chiave (non si vede mentre la incolli) e premi Invio: ");
  if (!/^tcc_[0-9a-f]{8}_[A-Za-z0-9_-]{43}$/.test(chiave)) {
    console.error("Non sembra una chiave del Task Command Center (inizia con tcc_). Niente salvato.");
    return 1;
  }
  fs.mkdirSync(path.dirname(FILE_CHIAVE), { recursive: true, mode: 0o700 });
  fs.writeFileSync(FILE_CHIAVE, chiave + "\n", { mode: 0o600 });
  fs.chmodSync(FILE_CHIAVE, 0o600);
  console.log(`Chiave salvata in ${FILE_CHIAVE} (leggibile solo da te). Prova: node bin/task.mjs chi-sono`);
  return 0;
}

async function chiamaPorta(argv, chiave) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(`${URL_APP}/api/assistente`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${chiave}`, "x-kit-versione": String(VERSIONE_KIT) },
      body: JSON.stringify({ argv, versione: VERSIONE_KIT }),
      signal: controller.signal,
      redirect: "error",
    });
    let corpo;
    try {
      corpo = await r.json();
    } catch {
      corpo = { codice: 1, stdout: "", stderr: `Risposta inattesa dall'app (HTTP ${r.status}).\n` };
    }
    if (r.status === 429) corpo.stderr = "Troppe richieste in poco tempo: aspetta un minuto e riprova.\n";
    return corpo;
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv[0] === "aiuto" || argv[0] === "--help" || argv[0] === "-h") {
    console.log(AIUTO);
    return 0;
  }
  if (argv[0] === "chiave") return comandoChiave(argv.slice(1));

  const chiave = leggiChiave();
  if (!chiave) {
    console.error("Nessuna chiave su questo computer. Creala sul sito (Impostazioni → Assistente), poi lancia tu, in un terminale: node bin/task.mjs chiave");
    return 1;
  }

  let corpo;
  const tentativi = SOLO_LETTURA.has(argv[0]) ? 2 : 1;
  for (let i = 1; i <= tentativi; i++) {
    try {
      corpo = await chiamaPorta(argv, chiave);
      break;
    } catch (e) {
      if (i === tentativi) {
        const motivo = e?.name === "AbortError" ? "l'app non ha risposto in tempo" : "non raggiungo l'app (rete?)";
        console.error(`Comando non eseguito: ${motivo}.${tentativi === 1 ? " Se era una modifica, controlla con show o list prima di riprovare, per non farla due volte." : ""}`);
        return 1;
      }
    }
  }
  if (corpo.stdout) process.stdout.write(corpo.stdout);
  if (corpo.stderr) process.stderr.write(corpo.stderr);
  return corpo.codice === 0 ? 0 : 1;
}

main().then((codice) => process.exit(codice));
