const WebSocket = require("ws");
const http = require("http");
const express = require("express");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Configuração básica do servidor
const app = express();
const port = process.env.PORT || 3001;

// Configurar CORS para permitir conexões do seu frontend na Vercel
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://turn-tracker-three.vercel.app/", // Substitua pelo seu domínio real na Vercel
    "http://localhost:3000", // Para desenvolvimento local
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Servir arquivos estáticos (quando fizer o build do React)
app.use(express.static(path.join(__dirname, "build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Criar um ID de sessão único para cada nova sessão
app.get("/api/create-session", (req, res) => {
  const sessionId = uuidv4();
  res.json({ sessionId });
});

// Criar servidor HTTP para usar com WebSocket
const server = http.createServer(app);

// Inicializar servidor WebSocket com configuração de CORS
const wss = new WebSocket.Server({
  server,
  // Configuração para aceitar conexões da sua aplicação na Vercel
  verifyClient: (info) => {
    const allowedOrigins = [
      "https://turn-tracker-three.vercel.app/", // Substitua pelo seu domínio real na Vercel
      "http://localhost:3000", // Para desenvolvimento local
      // Incluir a versão 'wss://' do seu domínio também é importante para WebSockets
      "wss://turn-tracker-three.vercel.app",
    ];

    // Verificação simplificada - em produção pode querer ser mais rigoroso
    // O Origin pode não estar presente em todos os clientes WebSocket
    return true; // Aceitar todas as conexões por enquanto
  },
});

// Armazenar dados de cada sessão
const sessions = new Map();

// WebSocket: Quando um cliente se conecta
wss.on("connection", (ws) => {
  let sessionId = null;

  console.log("Novo cliente conectado");

  // Evento: Receber mensagem do cliente
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      // Primeiro, identificar a sessão do cliente
      if (data.type === "join-session") {
        sessionId = data.sessionId;

        // Se a sessão não existir, criar nova
        if (!sessions.has(sessionId)) {
          sessions.set(sessionId, {
            clients: new Set(),
            gameState: {
              combatants: [],
              currentTurn: 0,
              currentRound: 1,
              combatActive: false,
              combatLog: [],
              lastUpdate: Date.now(),
            },
          });
        }

        // Adicionar este cliente à sessão
        const session = sessions.get(sessionId);
        session.clients.add(ws);

        // Enviar estado atual para o novo cliente
        ws.send(
          JSON.stringify({
            type: "full-state",
            gameState: session.gameState,
          })
        );

        console.log(`Cliente adicionado à sessão ${sessionId}`);
        return;
      }

      // Se não tiver ID de sessão, ignorar outras mensagens
      if (!sessionId || !sessions.has(sessionId)) {
        console.log("Mensagem recebida sem sessão válida");
        return;
      }

      const session = sessions.get(sessionId);

      // Receber atualização de estado
      if (data.type === "update-state") {
        // Atualizar o estado da sessão
        session.gameState = {
          ...data.gameState,
          lastUpdate: Date.now(),
        };

        // Broadcast para todos os outros clientes na mesma sessão
        session.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "full-state",
                gameState: session.gameState,
              })
            );
          }
        });
      }

      // Para atualizações parciais (opcional, para otimizar)
      if (data.type === "partial-update") {
        // Atualizar apenas parte do estado
        session.gameState = {
          ...session.gameState,
          [data.key]: data.value,
          lastUpdate: Date.now(),
        };

        // Broadcast da atualização parcial
        session.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "partial-update",
                key: data.key,
                value: data.value,
              })
            );
          }
        });
      }
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
    }
  });

  // Evento: Cliente desconectado
  ws.on("close", () => {
    console.log("Cliente desconectado");

    // Remover cliente da sessão
    if (sessionId && sessions.has(sessionId)) {
      const session = sessions.get(sessionId);
      session.clients.delete(ws);

      // Se não houver mais clientes na sessão, manter os dados por um tempo
      // e depois remover (poderia implementar um sistema de limpeza periódica)
      if (session.clients.size === 0) {
        // Para este exemplo, vamos manter a sessão por 1 hora
        setTimeout(() => {
          if (
            sessions.has(sessionId) &&
            sessions.get(sessionId).clients.size === 0
          ) {
            sessions.delete(sessionId);
            console.log(`Sessão ${sessionId} removida por inatividade`);
          }
        }, 60 * 60 * 1000);
      }
    }
  });
});

// Iniciar o servidor
server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
