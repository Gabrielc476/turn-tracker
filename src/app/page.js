import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Plus,
  ChevronUp,
  ChevronDown,
  Sword,
  Shield,
  Heart,
  Skull,
  Feather,
  Zap,
  RefreshCw,
  Edit,
  Save,
  Trash2,
  HelpCircle,
  MapPin,
  BookOpen,
  Clock,
  Users,
  Moon,
  FileText,
  AlertTriangle,
  Compass,
  Share2,
  Copy,
} from "lucide-react";

const MansionCombatTracker = () => {
  // Estados principais
  const [combatants, setCombatants] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [combatActive, setCombatActive] = useState(false);
  const [currentFloor, setCurrentFloor] = useState("third");
  const [currentRoom, setCurrentRoom] = useState("all");
  const [showHelp, setShowHelp] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [combatLog, setCombatLog] = useState([]);
  const [combatNotes, setCombatNotes] = useState("");

  // Estados para WebSocket
  const [connected, setConnected] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionInputValue, setSessionInputValue] = useState("");
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Referência para o WebSocket
  const wsRef = useRef(null);

  // Estado para indicar se uma atualização está ocorrendo por causa do WebSocket
  const updatingFromWs = useRef(false);

  // Estado para mostrar/esconder seções
  const [showSections, setShowSections] = useState({
    controls: true,
    combatants: true,
    log: true,
    encounters: true,
  });

  // NPCs predefinidos por andar e sala
  const [encounters, setEncounters] = useState({
    third: {
      corridor: {
        name: "Corredor Principal",
        description:
          "Um amplo corredor iluminado por candelabros que oscilam com uma luz azulada antinatural, decorado com tapeçarias luxuosas e retratos de nobres.",
        enemies: [
          {
            id: "veteran-bandit-1",
            name: "Bandido Veterano #1",
            type: "npc",
            hp: 58,
            maxHp: 58,
            ac: 15,
            initiative: 0,
            cr: "3",
            conditions: [],
            attacks: [
              {
                name: "Espada Longa",
                damage: "2d8+4",
                type: "cortante",
                toHit: "+7",
              },
              {
                name: "Besta Pesada",
                damage: "1d10+2",
                type: "perfurante",
                toHit: "+5",
              },
            ],
          },
          {
            id: "veteran-bandit-2",
            name: "Bandido Veterano #2",
            type: "npc",
            hp: 58,
            maxHp: 58,
            ac: 15,
            initiative: 0,
            cr: "3",
            conditions: [],
            attacks: [
              {
                name: "Espada Longa",
                damage: "2d8+4",
                type: "cortante",
                toHit: "+7",
              },
              {
                name: "Besta Pesada",
                damage: "1d10+2",
                type: "perfurante",
                toHit: "+5",
              },
            ],
          },
          {
            id: "corridor-mage",
            name: "Mago (Túnica Carmesim)",
            type: "npc",
            hp: 40,
            maxHp: 40,
            ac: 15,
            initiative: 0,
            cr: "6",
            conditions: [],
            attacks: [
              {
                name: "Bola de Fogo",
                damage: "8d6",
                type: "fogo",
                saveType: "DES",
                saveDC: 15,
              },
              {
                name: "Dardo Místico",
                damage: "3d4+3",
                type: "força",
                toHit: "+7",
              },
              {
                name: "Raio de Fogo",
                damage: "2d6",
                type: "fogo",
                toHit: "+7",
              },
            ],
          },
        ],
        traps: [
          {
            name: "Runas Explosivas",
            description:
              "DC 15 Percepção para notar, DC 16 Arcana para desarmar. 4d8 dano de fogo em área de 10 pés (DC 15 DES para 1/2).",
          },
          {
            name: "Dardos Envenenados",
            description:
              "DC 14 Percepção para notar, DC 15 Destreza para desarmar. 1d4 dano perfurante + 2d6 dano de veneno (DC 13 CON para negar veneno).",
          },
        ],
      },
      luxuryRooms: {
        name: "Quartos Luxuosos",
        description:
          "Quartos amplos com camas de dossel, tapetes persas e espelhos ornamentados que parecem refletir sombras estranhas.",
        enemies: [
          {
            id: "bandit-1",
            name: "Bandido #1",
            type: "npc",
            hp: 11,
            maxHp: 11,
            ac: 12,
            initiative: 0,
            cr: "1/8",
            conditions: [],
            attacks: [
              {
                name: "Cimitarra",
                damage: "1d6+1",
                type: "cortante",
                toHit: "+3",
              },
              {
                name: "Besta Leve",
                damage: "1d8+1",
                type: "perfurante",
                toHit: "+3",
              },
            ],
          },
          {
            id: "bandit-2",
            name: "Bandido #2",
            type: "npc",
            hp: 11,
            maxHp: 11,
            ac: 12,
            initiative: 0,
            cr: "1/8",
            conditions: [],
            attacks: [
              {
                name: "Cimitarra",
                damage: "1d6+1",
                type: "cortante",
                toHit: "+3",
              },
              {
                name: "Besta Leve",
                damage: "1d8+1",
                type: "perfurante",
                toHit: "+3",
              },
            ],
          },
          {
            id: "assassin",
            name: "Assassino",
            type: "npc",
            hp: 78,
            maxHp: 78,
            ac: 17,
            initiative: 0,
            cr: "8",
            conditions: [],
            attacks: [
              {
                name: "Adaga Envenenada",
                damage: "1d4+4+7d6",
                type: "perfurante/veneno",
                toHit: "+8",
              },
              {
                name: "Besta Leve",
                damage: "1d8+4",
                type: "perfurante",
                toHit: "+8",
              },
              {
                name: "Ataque Surpresa",
                damage: "13d6",
                type: "especial",
                notes: "Dano adicional em surpresa (crítico automático)",
              },
            ],
          },
          {
            id: "archmage-miniboss",
            name: "Arquimago (Mini-chefe)",
            type: "npc",
            hp: 99,
            maxHp: 99,
            ac: 15,
            initiative: 0,
            cr: "12",
            conditions: [],
            attacks: [
              {
                name: "Desintegrar",
                damage: "10d6+40",
                type: "força",
                saveType: "DES",
                saveDC: 17,
              },
              {
                name: "Cone de Frio",
                damage: "8d8",
                type: "frio",
                saveType: "CON",
                saveDC: 17,
              },
              {
                name: "Bola de Fogo",
                damage: "8d6",
                type: "fogo",
                saveType: "DES",
                saveDC: 17,
              },
            ],
          },
        ],
        traps: [
          {
            name: "Lareira Enfeitiçada",
            description:
              "Quando alguém se aproxima a 5 pés, dispara chamas. DC 14 Percepção, DC 15 Arcana para desarmar. 3d8 dano de fogo (DC 14 DES para 1/2).",
          },
          {
            name: "Armário com Agulhas",
            description:
              "DC 15 Percepção/Investigação, DC 14 Destreza para desarmar. 2d4 dano perfurante + teste de CON CD 13 ou ficar envenenado por 1 hora.",
          },
        ],
      },
      library: {
        name: "Grande Biblioteca",
        description:
          "Uma sala imensa com estantes até o teto, escadas rolantes e passarelas. No centro há uma mesa de estudo circular com símbolos arcanos gravados.",
        enemies: [
          {
            id: "ghost-librarian",
            name: "Bibliotecário Espectral",
            type: "npc",
            hp: 22,
            maxHp: 22,
            ac: 13,
            initiative: 0,
            cr: "1",
            conditions: [],
            attacks: [
              {
                name: "Toque da Vida",
                damage: "3d6",
                type: "necrótico",
                toHit: "+5",
              },
              {
                name: "Contrafeitiço",
                type: "especial",
                notes: "Cancela magias de 3º nível ou inferior, 3/dia",
              },
              {
                name: "Invocar Livros Animados",
                type: "especial",
                notes: "Invoca 1d4 Livros Animados como ação",
              },
            ],
          },
          {
            id: "animated-book-1",
            name: "Livro Animado #1",
            type: "npc",
            hp: 17,
            maxHp: 17,
            ac: 17,
            initiative: 0,
            cr: "1/4",
            conditions: [],
            attacks: [
              { name: "Golpe", damage: "1d6+1", type: "cortante", toHit: "+3" },
            ],
          },
          {
            id: "animated-book-2",
            name: "Livro Animado #2",
            type: "npc",
            hp: 17,
            maxHp: 17,
            ac: 17,
            initiative: 0,
            cr: "1/4",
            conditions: [],
            attacks: [
              { name: "Golpe", damage: "1d6+1", type: "cortante", toHit: "+3" },
            ],
          },
          {
            id: "archmage-library",
            name: "Arquimago (Principal)",
            type: "npc",
            hp: 99,
            maxHp: 99,
            ac: 15,
            initiative: 0,
            cr: "12",
            conditions: [],
            attacks: [
              {
                name: "Desintegrar",
                damage: "10d6+40",
                type: "força",
                saveType: "DES",
                saveDC: 17,
              },
              {
                name: "Banimento",
                type: "especial",
                saveType: "CAR",
                saveDC: 17,
              },
              {
                name: "Contramágica",
                type: "especial",
                notes: "Cancela mágica como reação",
              },
            ],
          },
        ],
        traps: [
          {
            name: "Livros Armadilhados",
            description:
              "DC 16 Investigação para identificar. Ao ser aberto, dispara um raio de eletricidade: 3d10 dano elétrico (DC 15 DES para 1/2).",
          },
          {
            name: "Glifos de Proteção",
            description:
              "Inscritos em certos livros proibidos. DC 17 Arcana para detectar. Ativa Glifo de Proteção com Bola de Fogo (8d6 dano de fogo, DC 15 DES para 1/2).",
          },
        ],
      },
      // Outras salas do terceiro andar - omitidas por brevidade
    },
    fourth: {
      // Salas do quarto andar - omitidas por brevidade
      finalConfrontation: {
        name: "Câmara do Espectro (Confronto Final)",
        description:
          "Uma sala circular ampla com domo de cristal escurecido revelando céu tempestuoso. No centro há um círculo ritual gravado no chão, pulsando com energia necromântica.",
        enemies: [
          {
            id: "tharion",
            name: "Tharion Shadowbane (O Espectro)",
            type: "boss",
            hp: 300,
            maxHp: 300,
            ac: 18,
            initiative: 0,
            cr: "21",
            conditions: [],
            attacks: [
              {
                name: "Toque Parasita",
                damage: "3d6+6",
                type: "necrótico",
                toHit: "+12",
                notes: "Drena pontos de vida máximos",
              },
              {
                name: "Dedo da Morte",
                damage: "7d8+30",
                type: "necrótico",
                saveType: "CON",
                saveDC: 18,
                notes: "Mata instantaneamente alvos reduzidos a 0 PV",
              },
              {
                name: "Rajada Necrótica",
                damage: "6d8",
                type: "necrótico",
                saveType: "DES",
                saveDC: 18,
                notes: "Área de 30 pés",
              },
              {
                name: "Forma Incorporeal",
                type: "especial",
                notes: "Pode passar através de criaturas e objetos sólidos",
              },
              {
                name: "Dreno Sombrio",
                type: "especial",
                notes: "Os ataques drenam pontos de vida máximos",
              },
              {
                name: "Controle Espectral",
                type: "especial",
                saveType: "SAB",
                saveDC: 17,
                notes: "Pode assumir controle temporário de criaturas",
              },
              {
                name: "Teleporte Sombrio",
                type: "especial",
                notes:
                  "Teleporta-se a até 60 pés para um espaço visível como ação lendária",
              },
              {
                name: "Invocação de Mortos-Vivos",
                type: "especial",
                notes: "Invoca 1d4 mortos-vivos como ação lendária",
              },
            ],
          },
          {
            id: "shadow-mage-1",
            name: "Mago Sombrio #1",
            type: "npc",
            hp: 40,
            maxHp: 40,
            ac: 15,
            initiative: 0,
            cr: "6",
            conditions: [],
            attacks: [
              {
                name: "Toque Vampírico",
                damage: "3d6",
                type: "necrótico",
                toHit: "+7",
                notes: "O mago recupera metade do dano causado em PV",
              },
              {
                name: "Raio da Exaustão",
                type: "especial",
                saveType: "CON",
                saveDC: 14,
                notes: "O alvo ganha um nível de exaustão em falha",
              },
              {
                name: "Relâmpago",
                damage: "8d6",
                type: "elétrico",
                saveType: "DES",
                saveDC: 14,
              },
            ],
          },
          {
            id: "shadow-mage-2",
            name: "Mago Sombrio #2",
            type: "npc",
            hp: 40,
            maxHp: 40,
            ac: 15,
            initiative: 0,
            cr: "6",
            conditions: [],
            attacks: [
              {
                name: "Toque Vampírico",
                damage: "3d6",
                type: "necrótico",
                toHit: "+7",
                notes: "O mago recupera metade do dano causado em PV",
              },
              {
                name: "Raio da Exaustão",
                type: "especial",
                saveType: "CON",
                saveDC: 14,
                notes: "O alvo ganha um nível de exaustão em falha",
              },
              {
                name: "Relâmpago",
                damage: "8d6",
                type: "elétrico",
                saveType: "DES",
                saveDC: 14,
              },
            ],
          },
        ],
        traps: [
          {
            name: "Pilares de Energia (Âncoras do Ritual)",
            description:
              "Cada pilar tem 50 PV e resistência a dano não-mágico. Destruir um enfraquece Tharion (remove uma habilidade lendária).",
          },
          {
            name: "Relâmpagos Sombrios",
            description:
              "A cada 2 rodadas, relâmpagos sombrios atingem pontos aleatórios da sala, causando 5d10 dano elétrico + 5d10 dano necrótico (DC 18 Destreza para metade).",
          },
          {
            name: "Chão que Cede",
            description:
              "Partes do chão ocasionalmente cedem para um abismo sombrio (3d6 dano de queda + 2d6 dano necrótico).",
          },
        ],
        notes:
          "O ritual tem 3 âncoras (pilares de energia) que devem ser destruídas para interromper a transformação final. O combate tem 3 fases: Fase Inicial (Tharion permanece próximo ao portal), Fase Média (assume forma semi-corpórea quando reduzido a 2/3 dos PV), Fase Final (revela forma verdadeira quando reduzido a 1/3 dos PV).",
      },
    },
  });

  // Constantes para condições comuns
  const CONDITIONS = [
    "Atordoado",
    "Caído",
    "Cego",
    "Enfeitiçado",
    "Envenenado",
    "Incapacitado",
    "Inconsciente",
    "Paralizado",
    "Petrificado",
    "Surdo",
  ];

  // FUNÇÕES WEBSOCKET

  // Iniciar uma nova sessão
  const createNewSession = async () => {
    try {
      const response = await fetch("/api/create-session");
      const data = await response.json();
      setSessionId(data.sessionId);
      connectWebSocket(data.sessionId);
      setShowSessionModal(true);
    } catch (error) {
      console.error("Erro ao criar sessão:", error);
      alert("Não foi possível criar uma nova sessão. Tente novamente.");
    }
  };

  // Entrar em uma sessão existente
  const joinExistingSession = () => {
    if (sessionInputValue.trim()) {
      setSessionId(sessionInputValue.trim());
      connectWebSocket(sessionInputValue.trim());
      setShowSessionModal(false);
      setSessionInputValue("");
    }
  };

  // Conectar ao servidor WebSocket
  const connectWebSocket = (sid) => {
    // Fechar qualquer conexão anterior
    if (wsRef.current) {
      wsRef.current.close();
    }

    // URL do servidor WebSocket (hospedado no Render)
    const WEBSOCKET_URL =
      process.env.NODE_ENV === "production"
        ? "https://turn-tracker-1.onrender.com" // Substitua pelo URL real do seu servidor no Render
        : "ws://localhost:3001";

    console.log(`Conectando ao servidor WebSocket: ${WEBSOCKET_URL}`);
    const ws = new WebSocket(WEBSOCKET_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket conectado");
      setConnected(true);

      // Entrar na sessão
      ws.send(
        JSON.stringify({
          type: "join-session",
          sessionId: sid,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "full-state") {
          // Marca que estamos atualizando de um evento WebSocket
          updatingFromWs.current = true;

          // Atualizar todo o estado da aplicação
          setCombatants(data.gameState.combatants || []);
          setCurrentTurn(data.gameState.currentTurn || 0);
          setCurrentRound(data.gameState.currentRound || 1);
          setCombatActive(data.gameState.combatActive || false);
          setCombatLog(data.gameState.combatLog || []);

          // Redefine o flag
          updatingFromWs.current = false;
        }

        if (data.type === "partial-update") {
          // Atualização parcial (para otimizar)
          updatingFromWs.current = true;

          switch (data.key) {
            case "combatants":
              setCombatants(data.value);
              break;
            case "currentTurn":
              setCurrentTurn(data.value);
              break;
            case "currentRound":
              setCurrentRound(data.value);
              break;
            case "combatActive":
              setCombatActive(data.value);
              break;
            case "combatLog":
              setCombatLog(data.value);
              break;
            default:
              break;
          }

          updatingFromWs.current = false;
        }
      } catch (error) {
        console.error("Erro ao processar mensagem do WebSocket:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket desconectado");
      setConnected(false);
    };

    ws.onerror = (error) => {
      console.error("Erro no WebSocket:", error);
      setConnected(false);
    };
  };

  // Enviar o estado atualizado para o servidor
  const syncStateToServer = () => {
    // Não enviar se estamos apenas processando uma atualização do servidor
    if (
      updatingFromWs.current ||
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    // Enviar o estado completo
    wsRef.current.send(
      JSON.stringify({
        type: "update-state",
        gameState: {
          combatants,
          currentTurn,
          currentRound,
          combatActive,
          combatLog,
        },
      })
    );
  };

  // Copiar o ID da sessão para a área de transferência
  const copySessionIdToClipboard = () => {
    navigator.clipboard.writeText(sessionId).then(() => {
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    });
  };

  // Efeito para verificar se há um sessionId na URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session");
    if (sid) {
      setSessionId(sid);
      connectWebSocket(sid);
    } else {
      setShowSessionModal(true);
    }
  }, []);

  // Efeito para sincronizar o estado após mudanças
  useEffect(() => {
    syncStateToServer();
  }, [combatants, currentTurn, currentRound, combatActive, combatLog]);

  // FUNÇÕES DO RASTREADOR DE COMBATE

  // Gerar uma cor única para cada combatente baseado em seu ID e tipo
  const getCharacterColor = (character) => {
    if (character.type === "boss") {
      return "bg-purple-200 border-purple-500 border-2";
    } else if (character.type === "npc") {
      return "bg-red-100 border-red-300";
    } else {
      return "bg-blue-100 border-blue-300";
    }
  };

  // Iniciar combate com os personagens atuais
  const startCombat = () => {
    if (combatants.length > 0) {
      // Ordenar combatentes por iniciativa
      const sortedCombatants = [...combatants].sort(
        (a, b) => b.initiative - a.initiative
      );
      setCombatants(sortedCombatants);
      setCurrentTurn(0);
      setCurrentRound(1);
      setCombatActive(true);

      // Adicionar ao log de combate
      addToCombatLog("🏁 Combate iniciado!");
      addToCombatLog(`🎲 Rodada 1, Turno de ${sortedCombatants[0].name}`);
    }
  };

  // Finalizar combate
  const endCombat = () => {
    setCombatActive(false);
    setCurrentTurn(0);
    setCurrentRound(1);
    addToCombatLog("🛑 Combate finalizado.");

    // Remover condições temporárias e NPCs mortos
    setCombatants((prev) =>
      prev
        .filter((c) => !(c.type !== "player" && c.hp <= 0))
        .map((c) => ({
          ...c,
          conditions: [],
        }))
    );
  };

  // Avançar para o próximo turno
  const nextTurn = () => {
    if (combatants.length > 0) {
      let newTurn = (currentTurn + 1) % combatants.length;
      let newRound = currentRound;

      // Se voltamos ao primeiro combatente, avançamos uma rodada
      if (newTurn === 0) {
        newRound += 1;
        addToCombatLog(`🔄 Rodada ${newRound} iniciada!`);
      }

      setCurrentTurn(newTurn);
      setCurrentRound(newRound);
      addToCombatLog(
        `🎲 Rodada ${newRound}, Turno de ${combatants[newTurn].name}`
      );
    }
  };

  // Adicionar log ao combate
  const addToCombatLog = (message) => {
    setCombatLog((prev) => [
      {
        id: Date.now(),
        message,
        timestamp: new Date().toLocaleTimeString(),
        round: currentRound,
      },
      ...prev,
    ]);
  };

  // Adicionar novo personagem jogador
  const addPlayer = (customPlayer = null) => {
    const newPlayer = customPlayer || {
      id: `player-${Date.now()}`,
      name: "Novo Jogador",
      type: "player",
      hp: 20,
      maxHp: 20,
      ac: 10,
      initiative: 0,
      conditions: [],
      attacks: [],
    };
    setCombatants((prev) => [...prev, newPlayer]);
  };

  // Adicionar os jogadores da campanha
  const addCampaignPlayers = () => {
    // Jorge E Mateus (Clérigo)
    const jorgeEMateus = {
      id: `player-jorge-${Date.now()}`,
      name: "Jorge E Mateus",
      type: "player",
      hp: 52,
      maxHp: 52,
      ac: 16,
      initiative: 2,
      perception: 14,
      proficiency: 3,
      speed: "30 feet",
      hd: "7d8",
      conditions: [],
      attacks: [
        { name: "Maça", damage: "1d6+1", type: "contundente", toHit: "+4" },
        {
          name: "Chama Sagrada",
          damage: "1d8+3",
          type: "radiante",
          saveType: "DES",
          saveDC: 15,
        },
        {
          name: "Curar Ferimentos",
          type: "cura",
          notes: "Recupera 1d8+3 pontos de vida ao alvo tocado",
        },
        {
          name: "Canal de Divindade",
          type: "especial",
          notes: "Resta 2 usos",
          charges: 2,
          maxCharges: 2,
        },
      ],
    };

    // Antedighimon (Ladino/Mago)
    const antedighimon = {
      id: `player-antedighimon-${Date.now()}`,
      name: "Antedighimon",
      type: "player",
      hp: 41,
      maxHp: 41,
      ac: 13,
      initiative: 3,
      perception: 12,
      proficiency: 3,
      speed: "30 feet",
      hd: "7d6",
      conditions: [],
      attacks: [
        {
          name: "Adaga",
          damage: "1d4+3",
          type: "perfurante",
          toHit: "+6",
          notes: "Ataque furtivo: +3d6 dano com vantagem ou aliado próximo",
        },
        {
          name: "Quarterstaff",
          damage: "1d6+1",
          type: "contundente",
          toHit: "+4",
        },
        { name: "Raio de Fogo", damage: "2d6", type: "fogo", toHit: "+5" },
        {
          name: "Mísseis Mágicos",
          damage: "3d4+3",
          type: "força",
          notes: "Acerta automaticamente",
        },
      ],
    };

    // Aria (Bárbara)
    const aria = {
      id: `player-aria-${Date.now()}`,
      name: "Aria",
      type: "player",
      race: "Meio-Orc",
      class: "Bárbara 7",
      hp: 68,
      maxHp: 68,
      ac: 13,
      initiative: 1,
      perception: 13,
      proficiency: 3,
      speed: "40 feet",
      hd: "7d12",
      str: 19,
      dex: 13,
      con: 15,
      int: 8,
      wis: 11,
      cha: 11,
      conditions: [],
      attacks: [
        {
          name: "Handaxe",
          damage: "1d6+4",
          type: "cortante",
          toHit: "+7",
          notes: "Simples, Leve, Arremessável, Alcance 20/60 pés",
        },
        {
          name: "Longsword",
          damage: "1d8+4",
          type: "cortante",
          toHit: "+7",
          notes: "Marcial, Versátil, Duas mãos: 1d10+4",
        },
        {
          name: "Ataque Desarmado",
          damage: "5",
          type: "contundente",
          toHit: "+7",
        },
        {
          name: "Fúria",
          type: "especial",
          notes:
            "Vantagem em testes de FOR, +2 dano corpo a corpo, resistência a dano contundente/cortante/perfurante",
          charges: 4,
          maxCharges: 4,
        },
        {
          name: "Ataque Imprudente",
          type: "especial",
          notes:
            "Vantagem no ataque, mas ataques contra você têm vantagem até seu próximo turno",
        },
      ],
      features: [
        "Resistência Implacável: Quando reduzida a 0 PV, pode cair para 1 PV uma vez por descanso longo",
        "Visão no Escuro: Pode ver na escuridão até 60 pés",
        "Defesa sem Armadura: CA = 10 + mod DEX + mod CON + bônus de escudo",
        "Ataques Selvagens: Rola um dado adicional de dano em acertos críticos",
      ],
    };

    // Adicionar os jogadores ao combate
    setCombatants((prev) => [...prev, jorgeEMateus, antedighimon, aria]);
    addToCombatLog(
      `👥 Jogadores da campanha adicionados: Jorge E Mateus, Antedighimon e Aria.`
    );
  };

  // Adicionar um jogador específico
  const addAria = () => {
    const aria = {
      id: `player-aria-${Date.now()}`,
      name: "Aria",
      type: "player",
      race: "Meio-Orc",
      class: "Bárbara 7",
      hp: 68,
      maxHp: 68,
      ac: 13,
      initiative: 1,
      perception: 13,
      proficiency: 3,
      speed: "40 feet",
      hd: "7d12",
      str: 19,
      dex: 13,
      con: 15,
      int: 8,
      wis: 11,
      cha: 11,
      conditions: [],
      attacks: [
        {
          name: "Handaxe",
          damage: "1d6+4",
          type: "cortante",
          toHit: "+7",
          notes: "Simples, Leve, Arremessável, Alcance 20/60 pés",
        },
        {
          name: "Longsword",
          damage: "1d8+4",
          type: "cortante",
          toHit: "+7",
          notes: "Marcial, Versátil, Duas mãos: 1d10+4",
        },
        {
          name: "Ataque Desarmado",
          damage: "5",
          type: "contundente",
          toHit: "+7",
        },
        {
          name: "Fúria",
          type: "especial",
          notes:
            "Vantagem em testes de FOR, +2 dano corpo a corpo, resistência a dano contundente/cortante/perfurante",
          charges: 4,
          maxCharges: 4,
        },
        {
          name: "Ataque Imprudente",
          type: "especial",
          notes:
            "Vantagem no ataque, mas ataques contra você têm vantagem até seu próximo turno",
        },
      ],
      features: [
        "Resistência Implacável: Quando reduzida a 0 PV, pode cair para 1 PV uma vez por descanso longo",
        "Visão no Escuro: Pode ver na escuridão até 60 pés",
        "Defesa sem Armadura: CA = 10 + mod DEX + mod CON + bônus de escudo",
        "Ataques Selvagens: Rola um dado adicional de dano em acertos críticos",
      ],
    };

    setCombatants((prev) => [...prev, aria]);
    addToCombatLog(`👥 Aria (Bárbara Meio-Orc) adicionada ao combate.`);
  };

  // Adicionar NPC da lista predefinida
  const addNPC = (npc) => {
    // Criar uma cópia para não modificar a original
    const newNPC = {
      ...npc,
      id: `${npc.id}-${Date.now()}`,
      initiative: Math.floor(Math.random() * 20) + 1, // Gerar iniciativa aleatória
    };
    setCombatants((prev) => [...prev, newNPC]);
    addToCombatLog(`➕ ${newNPC.name} adicionado ao combate.`);
  };

  // Adicionar um encontro completo
  const addEncounter = (encounter) => {
    if (!encounter || !encounter.enemies) return;

    const newNPCs = encounter.enemies.map((npc) => ({
      ...npc,
      id: `${npc.id}-${Date.now()}`,
      initiative: Math.floor(Math.random() * 20) + 1, // Gerar iniciativa aleatória
    }));

    setCombatants((prev) => [...prev, ...newNPCs]);
    addToCombatLog(
      `🏰 Encontro "${encounter.name}" adicionado (${encounter.enemies.length} inimigos).`
    );

    // Se o encontro tiver armadilhas, adicionar ao log
    if (encounter.traps && encounter.traps.length > 0) {
      addToCombatLog(
        `⚠️ Armadilhas no encontro: ${encounter.traps
          .map((t) => t.name)
          .join(", ")}`
      );
    }

    // Se o encontro tiver um puzzle, adicionar ao log
    if (encounter.puzzle) {
      addToCombatLog(`🧩 Puzzle: ${encounter.puzzle.split(".")[0]}`);
    }
  };

  // Remover combatente
  const removeCombatant = (id) => {
    setCombatants((prev) => {
      const characterToRemove = prev.find((c) => c.id === id);
      if (characterToRemove) {
        addToCombatLog(`❌ ${characterToRemove.name} removido do combate.`);
      }
      return prev.filter((c) => c.id !== id);
    });

    // Ajustar o turno atual se necessário
    if (combatActive) {
      const indexToRemove = combatants.findIndex((c) => c.id === id);
      if (indexToRemove <= currentTurn && currentTurn > 0) {
        setCurrentTurn(currentTurn - 1);
      } else if (
        indexToRemove === currentTurn &&
        currentTurn === 0 &&
        combatants.length > 1
      ) {
        // Se estamos removendo o primeiro combatente e há outros, mantemos o turno em 0
        setCurrentTurn(0);
      }
    }
  };

  // Atualizar iniciativa de um combatente
  const updateInitiative = (id, value) => {
    const numValue = parseInt(value) || 0;
    setCombatants((prev) =>
      prev.map((c) => (c.id === id ? { ...c, initiative: numValue } : c))
    );
  };

  // Rolar iniciativa para todos
  const rollInitiativeForAll = () => {
    setCombatants((prev) =>
      prev.map((c) => ({
        ...c,
        initiative: Math.floor(Math.random() * 20) + 1,
      }))
    );
    addToCombatLog("🎲 Iniciativa rolada para todos os combatentes.");
  };

  // Atualizar pontos de vida
  const updateHP = (id, change) => {
    setCombatants((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newHp = Math.max(0, Math.min(c.maxHp, c.hp + change));

          // Adicionar ao log se for dano ou cura significativa
          if (change < 0 && change <= -5) {
            addToCombatLog(`💥 ${c.name} sofreu ${-change} de dano.`);
          } else if (change > 0 && change >= 5) {
            addToCombatLog(`💚 ${c.name} foi curado em ${change} pontos.`);
          }

          // Verificar status de morte para NPCs
          if (newHp === 0 && c.hp > 0) {
            addToCombatLog(`☠️ ${c.name} foi derrotado!`);
          }

          return { ...c, hp: newHp };
        }
        return c;
      })
    );
  };

  // Alternar condição para um combatente
  const toggleCondition = (id, condition) => {
    setCombatants((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const hasCondition = c.conditions.includes(condition);
          const newConditions = hasCondition
            ? c.conditions.filter((cond) => cond !== condition)
            : [...c.conditions, condition];

          // Adicionar ao log
          if (!hasCondition) {
            addToCombatLog(`⚠️ ${c.name} está agora ${condition}.`);
          } else {
            addToCombatLog(`✅ ${c.name} não está mais ${condition}.`);
          }

          return { ...c, conditions: newConditions };
        }
        return c;
      })
    );
  };

  // Iniciar edição de um personagem
  const startEditingCharacter = (character) => {
    setEditingCharacter({ ...character });
  };

  // Salvar edição de um personagem
  const saveCharacterEdit = () => {
    if (editingCharacter) {
      setCombatants((prev) =>
        prev.map((c) => (c.id === editingCharacter.id ? editingCharacter : c))
      );
      setEditingCharacter(null);
    }
  };

  // Adicionar ataque para o personagem em edição
  const addAttackToEditingCharacter = () => {
    if (editingCharacter) {
      setEditingCharacter({
        ...editingCharacter,
        attacks: [
          ...editingCharacter.attacks,
          { name: "Novo Ataque", damage: "", type: "", toHit: "" },
        ],
      });
    }
  };

  // Remover ataque do personagem em edição
  const removeAttackFromEditingCharacter = (index) => {
    if (editingCharacter) {
      const newAttacks = [...editingCharacter.attacks];
      newAttacks.splice(index, 1);
      setEditingCharacter({
        ...editingCharacter,
        attacks: newAttacks,
      });
    }
  };

  // Atualizar dados de ataque
  const updateAttackData = (index, field, value) => {
    if (editingCharacter) {
      const newAttacks = [...editingCharacter.attacks];
      newAttacks[index] = {
        ...newAttacks[index],
        [field]: value,
      };
      setEditingCharacter({
        ...editingCharacter,
        attacks: newAttacks,
      });
    }
  };

  // Executar um ataque
  const executeAttack = (characterId, attack) => {
    const character = combatants.find((c) => c.id === characterId);
    if (character && attack) {
      let logMessage = `⚔️ ${character.name} usa ${attack.name}`;

      if (attack.toHit) {
        logMessage += ` (${attack.toHit} para acertar)`;
      }

      if (attack.damage) {
        logMessage += ` - Dano: ${attack.damage} (${attack.type})`;
      }

      if (attack.saveType) {
        logMessage += ` - Salvaguarda ${attack.saveType} CD ${attack.saveDC}`;
      }

      if (attack.notes) {
        logMessage += ` - ${attack.notes}`;
      }

      // Se o ataque tiver cargas/usos, diminuir em 1
      if (attack.charges !== undefined) {
        setCombatants((prev) =>
          prev.map((c) => {
            if (c.id === characterId) {
              const updatedAttacks = c.attacks.map((a) => {
                if (a.name === attack.name && a.charges > 0) {
                  return { ...a, charges: a.charges - 1 };
                }
                return a;
              });
              return { ...c, attacks: updatedAttacks };
            }
            return c;
          })
        );

        // Adicionar informação sobre usos restantes ao log
        if (attack.charges > 0) {
          logMessage += ` (${attack.charges - 1} usos restantes)`;
        } else {
          logMessage += ` (Sem usos restantes!)`;
        }
      }

      addToCombatLog(logMessage);
    }
  };

  // Toggle para mostrar/esconder seções
  const toggleSection = (section) => {
    setShowSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Filtrar encontros por andar e sala
  const getFilteredEncounters = () => {
    if (!encounters[currentFloor]) return [];

    if (currentRoom === "all") {
      return Object.values(encounters[currentFloor]);
    }

    return [encounters[currentFloor][currentRoom]].filter(Boolean);
  };

  // Obter lista de salas para o andar atual
  const getRoomsForCurrentFloor = () => {
    if (!encounters[currentFloor]) return [];

    return Object.entries(encounters[currentFloor]).map(([key, room]) => ({
      id: key,
      name: room.name,
    }));
  };

  // CSS dinâmico para o indicador de rodada
  const getRoundIndicatorClass = () => {
    if (currentRound <= 3) {
      return "bg-green-100 text-green-800 border-green-300";
    } else if (currentRound <= 6) {
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    } else {
      return "bg-red-100 text-red-800 border-red-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Cabeçalho */}
        <div className="bg-gray-900 text-white rounded-lg shadow-lg p-6 mb-6 text-center relative">
          <h1 className="text-3xl font-bold mb-1">Mansão das Sombras</h1>
          <h2 className="text-lg text-gray-300 mb-4">Rastreador de Combate</h2>

          {/* Status de Conexão WebSocket */}
          <div
            className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs flex items-center ${
              connected ? "bg-green-500" : "bg-red-500"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                connected ? "bg-green-200" : "bg-red-200"
              }`}
            ></div>
            {connected ? "Conectado" : "Desconectado"}
          </div>

          {/* Botão de Sessão */}
          <button
            onClick={() => setShowSessionModal(true)}
            className="absolute top-4 right-16 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-full text-xs flex items-center"
          >
            <Share2 className="h-3 w-3 mr-1" />
            Sessão
          </button>

          {combatActive && (
            <div className="flex justify-center space-x-4">
              <div
                className={`px-4 py-2 rounded-full border-2 ${getRoundIndicatorClass()}`}
              >
                Rodada {currentRound}
              </div>
              <div className="px-4 py-2 bg-blue-100 text-blue-800 border-blue-300 border-2 rounded-full">
                Turno: {combatants[currentTurn]?.name || "Nenhum"}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowHelp(true)}
            className="absolute top-4 right-4 text-gray-300 hover:text-white"
          >
            <HelpCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Seção de Controles */}
        <div className="mb-6 bg-white rounded-lg shadow-lg overflow-hidden">
          <div
            className="bg-gray-800 text-white p-4 flex justify-between cursor-pointer"
            onClick={() => toggleSection("controls")}
          >
            <h3 className="font-bold text-lg flex items-center">
              <Compass className="mr-2 h-5 w-5" />
              Controles de Iniciativa e Combate
            </h3>
            {showSections.controls ? <ChevronUp /> : <ChevronDown />}
          </div>

          {showSections.controls && (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-bold mb-2 flex items-center">
                    <Feather className="mr-2 h-5 w-5 text-blue-500" />
                    Controle de Iniciativa
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={rollInitiativeForAll}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
                    >
                      Rolar Iniciativa para Todos
                    </button>
                    <button
                      onClick={startCombat}
                      disabled={combatActive || combatants.length === 0}
                      className={`w-full font-medium py-2 px-4 rounded transition-colors ${
                        combatActive || combatants.length === 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      Iniciar Combate
                    </button>
                    <button
                      onClick={nextTurn}
                      disabled={!combatActive}
                      className={`w-full font-medium py-2 px-4 rounded transition-colors ${
                        !combatActive
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-yellow-500 hover:bg-yellow-600 text-white"
                      }`}
                    >
                      Próximo Turno
                    </button>
                    <button
                      onClick={endCombat}
                      disabled={!combatActive}
                      className={`w-full font-medium py-2 px-4 rounded transition-colors ${
                        !combatActive
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                    >
                      Finalizar Combate
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-bold mb-2 flex items-center">
                    <Plus className="mr-2 h-5 w-5 text-purple-500" />
                    Adicionar Combatentes
                  </h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => addPlayer()}
                        className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded transition-colors"
                      >
                        Adicionar Jogador
                      </button>
                      <button
                        onClick={addCampaignPlayers}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded transition-colors"
                      >
                        Adicionar Grupo
                      </button>
                      <button
                        onClick={addAria}
                        className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors"
                      >
                        Adicionar Aria
                      </button>
                    </div>

                    <div className="pt-2">
                      <div className="flex space-x-2 mb-2">
                        <select
                          value={currentFloor}
                          onChange={(e) => {
                            setCurrentFloor(e.target.value);
                            setCurrentRoom("all");
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded bg-white"
                        >
                          <option value="third">
                            Andar 3 - Quartos Luxuosos
                          </option>
                          <option value="fourth">
                            Andar 4 - Confronto Final
                          </option>
                        </select>

                        <select
                          value={currentRoom}
                          onChange={(e) => setCurrentRoom(e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded bg-white"
                        >
                          <option value="all">Todas as Salas</option>
                          {getRoomsForCurrentFloor().map((room) => (
                            <option key={room.id} value={room.id}>
                              {room.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-bold mb-2 flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-green-500" />
                    Notas Rápidas
                  </h4>
                  <textarea
                    value={combatNotes}
                    onChange={(e) => setCombatNotes(e.target.value)}
                    placeholder="Adicione notas sobre o combate atual aqui..."
                    className="w-full h-32 p-2 border border-gray-300 rounded resize-none bg-white"
                  ></textarea>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista de Encontros */}
        <div className="mb-6 bg-white rounded-lg shadow-lg overflow-hidden">
          <div
            className="bg-gray-800 text-white p-4 flex justify-between cursor-pointer"
            onClick={() => toggleSection("encounters")}
          >
            <h3 className="font-bold text-lg flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Encontros Disponíveis{" "}
              {currentRoom !== "all"
                ? `- ${encounters[currentFloor]?.[currentRoom]?.name || ""}`
                : ""}
            </h3>
            {showSections.encounters ? <ChevronUp /> : <ChevronDown />}
          </div>

          {showSections.encounters && (
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {getFilteredEncounters().map((encounter) => (
                  <div
                    key={encounter.name}
                    className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="bg-gray-100 p-3 border-b border-gray-200 flex justify-between items-center">
                      <h4 className="font-bold text-gray-800">
                        {encounter.name}
                      </h4>
                      <button
                        onClick={() => addEncounter(encounter)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-sm transition-colors flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Adicionar Encontro
                      </button>
                    </div>
                    <div className="p-3">
                      <p className="text-gray-600 text-sm mb-2">
                        {encounter.description}
                      </p>

                      {encounter.enemies && encounter.enemies.length > 0 && (
                        <div className="mb-3">
                          <h5 className="font-medium text-gray-700 mb-1 flex items-center">
                            <Sword className="h-4 w-4 mr-1 text-red-500" />
                            Inimigos ({encounter.enemies.length})
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {encounter.enemies.map((enemy) => (
                              <div
                                key={enemy.id}
                                className="text-sm py-1 px-2 bg-red-50 border border-red-100 rounded flex justify-between items-center"
                              >
                                <span className="font-medium">
                                  {enemy.name}
                                </span>
                                <button
                                  onClick={() => addNPC(enemy)}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {encounter.traps && encounter.traps.length > 0 && (
                        <div className="mb-3">
                          <h5 className="font-medium text-gray-700 mb-1 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
                            Armadilhas ({encounter.traps.length})
                          </h5>
                          <div className="space-y-2">
                            {encounter.traps.map((trap, idx) => (
                              <div
                                key={idx}
                                className="text-sm py-1 px-2 bg-yellow-50 border border-yellow-100 rounded"
                              >
                                <div className="font-medium">{trap.name}</div>
                                <div className="text-xs text-gray-600">
                                  {trap.description}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {encounter.puzzle && (
                        <div className="mb-2">
                          <h5 className="font-medium text-gray-700 mb-1 flex items-center">
                            <BookOpen className="h-4 w-4 mr-1 text-purple-500" />
                            Puzzle
                          </h5>
                          <div className="text-sm py-1 px-2 bg-purple-50 border border-purple-100 rounded">
                            {encounter.puzzle}
                          </div>
                        </div>
                      )}

                      {encounter.notes && (
                        <div>
                          <h5 className="font-medium text-gray-700 mb-1 flex items-center">
                            <FileText className="h-4 w-4 mr-1 text-green-500" />
                            Notas
                          </h5>
                          <div className="text-sm py-1 px-2 bg-green-50 border border-green-100 rounded">
                            {encounter.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lista de Combatentes */}
        <div className="mb-6 bg-white rounded-lg shadow-lg overflow-hidden">
          <div
            className="bg-gray-800 text-white p-4 flex justify-between cursor-pointer"
            onClick={() => toggleSection("combatants")}
          >
            <h3 className="font-bold text-lg flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Lista de Combatentes ({combatants.length})
            </h3>
            {showSections.combatants ? <ChevronUp /> : <ChevronDown />}
          </div>

          {showSections.combatants && (
            <div className="p-4">
              {combatants.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">
                    Nenhum combatente adicionado. Adicione jogadores ou inimigos
                    para começar.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {combatants.map((character, index) => (
                    <div
                      key={character.id}
                      className={`border-2 rounded-lg overflow-hidden ${
                        combatActive && index === currentTurn
                          ? "border-yellow-500 ring-2 ring-yellow-200"
                          : "border-gray-200"
                      } ${getCharacterColor(character)}`}
                    >
                      <div className="bg-white bg-opacity-80 p-3">
                        <div className="flex flex-wrap justify-between items-start">
                          <div className="flex items-center mb-2 w-full sm:w-auto">
                            <span
                              className={`font-bold text-lg mr-2 ${
                                character.type === "boss"
                                  ? "text-purple-700"
                                  : ""
                              }`}
                            >
                              {character.name}
                            </span>
                            <span
                              className={`text-xs rounded-full px-2 py-1 ${
                                character.type === "player"
                                  ? "bg-blue-100 text-blue-800"
                                  : character.type === "boss"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {character.type === "player"
                                ? "Jogador"
                                : character.type === "boss"
                                ? "BOSS"
                                : "NPC"}
                            </span>
                            {character.cr && (
                              <span className="ml-2 text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-1">
                                CR {character.cr}
                              </span>
                            )}
                            {character.hp === 0 && (
                              <span className="ml-2 text-xs bg-red-500 text-white rounded-full px-2 py-1 flex items-center">
                                <Skull className="h-3 w-3 mr-1" />
                                Derrotado
                              </span>
                            )}
                          </div>

                          <div className="flex space-x-1">
                            <button
                              onClick={() => startEditingCharacter(character)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              title="Editar personagem"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => removeCombatant(character.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="Remover do combate"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                          <div className="flex items-center">
                            <Heart
                              className={`h-5 w-5 ${
                                character.hp === 0
                                  ? "text-red-500"
                                  : "text-red-500"
                              } mr-2`}
                            />
                            <div className="flex-1">
                              <div className="h-5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    character.hp / character.maxHp > 0.5
                                      ? "bg-green-500"
                                      : character.hp / character.maxHp > 0.25
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{
                                    width: `${
                                      (character.hp / character.maxHp) * 100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <div className="flex justify-between mt-1">
                                <div className="flex items-center">
                                  <span className="text-sm font-medium">
                                    {character.hp} / {character.maxHp}
                                  </span>
                                  {character.hd && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                      HD: {character.hd}
                                    </span>
                                  )}
                                </div>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => updateHP(character.id, -5)}
                                    className="px-2 text-xs bg-red-100 hover:bg-red-200 text-red-800 rounded-full transition-colors"
                                  >
                                    -5
                                  </button>
                                  <button
                                    onClick={() => updateHP(character.id, -1)}
                                    className="px-2 text-xs bg-red-100 hover:bg-red-200 text-red-800 rounded-full transition-colors"
                                  >
                                    -1
                                  </button>
                                  <button
                                    onClick={() => updateHP(character.id, 1)}
                                    className="px-2 text-xs bg-green-100 hover:bg-green-200 text-green-800 rounded-full transition-colors"
                                  >
                                    +1
                                  </button>
                                  <button
                                    onClick={() => updateHP(character.id, 5)}
                                    className="px-2 text-xs bg-green-100 hover:bg-green-200 text-green-800 rounded-full transition-colors"
                                  >
                                    +5
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <Shield className="h-5 w-5 text-blue-500 mr-2" />
                                <span className="font-medium">
                                  CA: {character.ac}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Feather className="h-5 w-5 text-purple-500 mr-2" />
                                <span className="font-medium">
                                  Iniciativa: {character.initiative}
                                </span>
                                {!combatActive && (
                                  <input
                                    type="number"
                                    min="0"
                                    max="30"
                                    value={character.initiative}
                                    onChange={(e) =>
                                      updateInitiative(
                                        character.id,
                                        e.target.value
                                      )
                                    }
                                    className="ml-2 w-16 p-1 border rounded text-center"
                                  />
                                )}
                              </div>
                            </div>

                            {/* Estatísticas adicionais */}
                            {(character.perception ||
                              character.proficiency ||
                              character.speed) && (
                              <div className="grid grid-cols-3 gap-1 text-xs">
                                {character.perception && (
                                  <div className="px-2 py-1 bg-gray-100 rounded text-center">
                                    <span className="font-medium">
                                      Percepção:{" "}
                                    </span>
                                    {character.perception}
                                  </div>
                                )}
                                {character.proficiency && (
                                  <div className="px-2 py-1 bg-gray-100 rounded text-center">
                                    <span className="font-medium">
                                      Proficiência:{" "}
                                    </span>
                                    +{character.proficiency}
                                  </div>
                                )}
                                {character.speed && (
                                  <div className="px-2 py-1 bg-gray-100 rounded text-center">
                                    <span className="font-medium">
                                      Velocidade:{" "}
                                    </span>
                                    {character.speed}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center mb-1">
                              <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                              <span className="font-medium">Condições</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {character.conditions.length === 0 ? (
                                <span className="text-xs text-gray-500 italic">
                                  Nenhuma
                                </span>
                              ) : (
                                character.conditions.map((condition) => (
                                  <span
                                    key={condition}
                                    className="text-xs bg-red-100 text-red-800 rounded-full px-2 py-1 cursor-pointer flex items-center"
                                    onClick={() =>
                                      toggleCondition(character.id, condition)
                                    }
                                  >
                                    {condition} <X className="h-3 w-3 ml-1" />
                                  </span>
                                ))
                              )}

                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value)
                                    toggleCondition(
                                      character.id,
                                      e.target.value
                                    );
                                  e.target.value = "";
                                }}
                                className="text-xs p-1 border rounded bg-white"
                              >
                                <option value="">+ Adicionar</option>
                                {CONDITIONS.filter(
                                  (c) => !character.conditions.includes(c)
                                ).map((condition) => (
                                  <option key={condition} value={condition}>
                                    {condition}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Ataques e habilidades */}
                        {character.attacks && character.attacks.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <div className="flex items-center mb-2">
                              <Sword className="h-5 w-5 text-gray-700 mr-2" />
                              <span className="font-medium">
                                Ataques e Habilidades
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {character.attacks.map((attack, idx) => (
                                <div
                                  key={idx}
                                  className={`bg-gray-50 hover:bg-gray-100 p-2 rounded border border-gray-200 cursor-pointer transition-colors ${
                                    attack.charges === 0 ? "opacity-50" : ""
                                  }`}
                                  onClick={() =>
                                    executeAttack(character.id, attack)
                                  }
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="font-medium text-gray-800">
                                      {attack.name}
                                    </div>
                                    {attack.charges !== undefined && (
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${
                                          attack.charges > 0
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-red-100 text-red-800"
                                        }`}
                                      >
                                        {attack.charges}/{attack.maxCharges}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm">
                                    {attack.toHit && (
                                      <span className="inline-block mr-2 px-1 bg-blue-50 text-blue-800 rounded text-xs">
                                        Para acertar: {attack.toHit}
                                      </span>
                                    )}
                                    {attack.damage && (
                                      <span className="inline-block mr-2 px-1 bg-red-50 text-red-800 rounded text-xs">
                                        Dano: {attack.damage}
                                      </span>
                                    )}
                                    {attack.type && (
                                      <span className="inline-block px-1 bg-gray-100 text-gray-800 rounded text-xs">
                                        {attack.type}
                                      </span>
                                    )}
                                  </div>
                                  {attack.saveType && (
                                    <div className="text-xs mt-1 text-gray-600">
                                      Salvaguarda: {attack.saveType} CD{" "}
                                      {attack.saveDC}
                                    </div>
                                  )}
                                  {attack.notes && (
                                    <div className="text-xs italic mt-1 text-gray-600">
                                      {attack.notes}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Exibir habilidades especiais (caso existam) */}
                        {character.features &&
                          character.features.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-gray-200">
                              <div className="flex items-center mb-2">
                                <Zap className="h-5 w-5 text-gray-700 mr-2" />
                                <span className="font-medium">
                                  Habilidades Especiais
                                </span>
                              </div>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {character.features.map((feature, idx) => (
                                  <li
                                    key={idx}
                                    className="bg-gray-50 px-2 py-1 rounded"
                                  >
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Log de Combate */}
        <div className="mb-6 bg-white rounded-lg shadow-lg overflow-hidden">
          <div
            className="bg-gray-800 text-white p-4 flex justify-between cursor-pointer"
            onClick={() => toggleSection("log")}
          >
            <h3 className="font-bold text-lg flex items-center">
              <RefreshCw className="mr-2 h-5 w-5" />
              Log de Combate
            </h3>
            {showSections.log ? <ChevronUp /> : <ChevronDown />}
          </div>

          {showSections.log && (
            <div className="p-4">
              <div className="h-64 overflow-y-auto border rounded-lg p-3 text-sm bg-gray-50">
                {combatLog.length === 0 ? (
                  <p className="text-gray-500 italic text-center py-4">
                    Nenhuma ação de combate registrada.
                  </p>
                ) : (
                  combatLog.map((entry) => (
                    <div
                      key={entry.id}
                      className="mb-2 pb-2 border-b border-gray-200"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                          {entry.timestamp}
                        </span>
                        {entry.round && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            Rodada {entry.round}
                          </span>
                        )}
                      </div>
                      <p>{entry.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal de Sessão WebSocket */}
        {showSessionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
                <h3 className="text-xl font-bold text-gray-800">
                  Compartilhar Sessão
                </h3>
                <button
                  onClick={() => setShowSessionModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {sessionId ? (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">
                    Compartilhe este ID de sessão:
                  </h4>
                  <div className="flex mb-4">
                    <input
                      type="text"
                      readOnly
                      value={sessionId}
                      className="flex-grow p-2 border border-gray-300 rounded-l focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                    />
                    <button
                      onClick={copySessionIdToClipboard}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-r transition-colors"
                    >
                      {copiedToClipboard ? "Copiado!" : "Copiar"}
                    </button>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded text-sm text-yellow-800">
                    <p>
                      <strong>ID da Sessão Compartilhada:</strong> {sessionId}
                    </p>
                    <p className="mt-1">
                      Compartilhe este ID com outros jogadores para que eles
                      possam se juntar à sua sessão.
                    </p>
                    <p className="mt-1">Ou envie este link:</p>
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}${window.location.pathname}?session=${sessionId}`}
                      className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 text-xs"
                    />
                  </div>

                  <div className="mt-4 text-center">
                    <button
                      onClick={() => {
                        setSessionId("");
                        setConnected(false);
                        setShowSessionModal(false);
                        if (wsRef.current) {
                          wsRef.current.close();
                        }
                      }}
                      className="text-red-500 hover:text-red-600 text-sm underline"
                    >
                      Sair da sessão
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="space-y-4 mb-4">
                    <button
                      onClick={createNewSession}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors"
                    >
                      Criar Nova Sessão
                    </button>

                    <div className="text-center font-medium text-gray-500">
                      OU
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entrar em uma Sessão Existente
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          placeholder="Digite o ID da sessão"
                          value={sessionInputValue}
                          onChange={(e) => setSessionInputValue(e.target.value)}
                          className="flex-grow p-2 border border-gray-300 rounded-l focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={joinExistingSession}
                          disabled={!sessionInputValue.trim()}
                          className={`py-2 px-4 rounded-r transition-colors ${
                            sessionInputValue.trim()
                              ? "bg-blue-500 hover:bg-blue-600 text-white"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          Entrar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal de edição de personagem */}
        {editingCharacter && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
                <h3 className="text-xl font-bold text-gray-800">
                  Editar {editingCharacter.name}
                </h3>
                <button
                  onClick={() => setEditingCharacter(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={editingCharacter.name}
                    onChange={(e) =>
                      setEditingCharacter({
                        ...editingCharacter,
                        name: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={editingCharacter.type}
                    onChange={(e) =>
                      setEditingCharacter({
                        ...editingCharacter,
                        type: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="player">Jogador</option>
                    <option value="npc">NPC</option>
                    <option value="boss">Chefe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HP Atual
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingCharacter.hp}
                    onChange={(e) =>
                      setEditingCharacter({
                        ...editingCharacter,
                        hp: Math.max(
                          0,
                          Math.min(
                            parseInt(e.target.value) || 0,
                            editingCharacter.maxHp
                          )
                        ),
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HP Máximo
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingCharacter.maxHp}
                    onChange={(e) => {
                      const newMaxHp = Math.max(
                        1,
                        parseInt(e.target.value) || 1
                      );
                      setEditingCharacter({
                        ...editingCharacter,
                        maxHp: newMaxHp,
                        hp: Math.min(editingCharacter.hp, newMaxHp),
                      });
                    }}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CA
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingCharacter.ac}
                    onChange={(e) =>
                      setEditingCharacter({
                        ...editingCharacter,
                        ac: Math.max(0, parseInt(e.target.value) || 0),
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Iniciativa
                  </label>
                  <input
                    type="number"
                    value={editingCharacter.initiative}
                    onChange={(e) =>
                      setEditingCharacter({
                        ...editingCharacter,
                        initiative: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                {editingCharacter.type !== "player" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nível de Desafio (CR)
                    </label>
                    <input
                      type="text"
                      value={editingCharacter.cr || ""}
                      onChange={(e) =>
                        setEditingCharacter({
                          ...editingCharacter,
                          cr: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Ataques e Habilidades
                  </label>
                  <button
                    onClick={addAttackToEditingCharacter}
                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded transition-colors flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Ataque
                  </button>
                </div>

                {editingCharacter.attacks.length === 0 ? (
                  <p className="text-gray-500 italic text-sm border border-dashed border-gray-300 p-4 rounded text-center">
                    Nenhum ataque configurado
                  </p>
                ) : (
                  <div className="space-y-3">
                    {editingCharacter.attacks.map((attack, idx) => (
                      <div key={idx} className="p-3 border rounded bg-gray-50">
                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
                          <span className="font-medium">
                            {attack.name || "Novo Ataque"}
                          </span>
                          <button
                            onClick={() =>
                              removeAttackFromEditingCharacter(idx)
                            }
                            className="text-red-500 p-1 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-700 mb-1">
                              Nome
                            </label>
                            <input
                              type="text"
                              value={attack.name}
                              onChange={(e) =>
                                updateAttackData(idx, "name", e.target.value)
                              }
                              className="w-full p-1 text-sm border border-gray-300 rounded"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-gray-700 mb-1">
                              Dano
                            </label>
                            <input
                              type="text"
                              value={attack.damage || ""}
                              onChange={(e) =>
                                updateAttackData(idx, "damage", e.target.value)
                              }
                              placeholder="ex: 2d6+3"
                              className="w-full p-1 text-sm border border-gray-300 rounded"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-gray-700 mb-1">
                              Tipo de Dano
                            </label>
                            <input
                              type="text"
                              value={attack.type || ""}
                              onChange={(e) =>
                                updateAttackData(idx, "type", e.target.value)
                              }
                              placeholder="ex: cortante"
                              className="w-full p-1 text-sm border border-gray-300 rounded"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-gray-700 mb-1">
                              Bônus para Acertar
                            </label>
                            <input
                              type="text"
                              value={attack.toHit || ""}
                              onChange={(e) =>
                                updateAttackData(idx, "toHit", e.target.value)
                              }
                              placeholder="ex: +5"
                              className="w-full p-1 text-sm border border-gray-300 rounded"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-gray-700 mb-1">
                              Tipo de Salvaguarda
                            </label>
                            <select
                              value={attack.saveType || ""}
                              onChange={(e) =>
                                updateAttackData(
                                  idx,
                                  "saveType",
                                  e.target.value
                                )
                              }
                              className="w-full p-1 text-sm border border-gray-300 rounded"
                            >
                              <option value="">Nenhuma</option>
                              <option value="FOR">Força (FOR)</option>
                              <option value="DES">Destreza (DES)</option>
                              <option value="CON">Constituição (CON)</option>
                              <option value="INT">Inteligência (INT)</option>
                              <option value="SAB">Sabedoria (SAB)</option>
                              <option value="CAR">Carisma (CAR)</option>
                            </select>
                          </div>

                          {attack.saveType && (
                            <div>
                              <label className="block text-xs text-gray-700 mb-1">
                                CD da Salvaguarda
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={attack.saveDC || ""}
                                onChange={(e) =>
                                  updateAttackData(
                                    idx,
                                    "saveDC",
                                    e.target.value
                                  )
                                }
                                className="w-full p-1 text-sm border border-gray-300 rounded"
                              />
                            </div>
                          )}

                          <div className="md:col-span-2">
                            <label className="block text-xs text-gray-700 mb-1">
                              Notas Adicionais
                            </label>
                            <textarea
                              value={attack.notes || ""}
                              onChange={(e) =>
                                updateAttackData(idx, "notes", e.target.value)
                              }
                              className="w-full p-1 text-sm border border-gray-300 rounded h-16 resize-none"
                              placeholder="Efeitos especiais, condições, etc."
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 border-t border-gray-200 pt-4">
                <button
                  onClick={() => setEditingCharacter(null)}
                  className="py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveCharacterEdit}
                  className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de ajuda */}
        {showHelp && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
                <h3 className="text-xl font-bold text-gray-800">
                  Ajuda do Rastreador
                </h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-lg mb-2 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                    Gerenciando Combatentes
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>
                      Adicione <b>jogadores</b> individualmente clicando no
                      botão "Adicionar Jogador".
                    </li>
                    <li>
                      Adicione <b>NPCs</b> individualmente ou como encontros
                      completos.
                    </li>
                    <li>
                      Para adicionar um <b>encontro completo</b>, selecione o
                      andar/sala e clique em "Adicionar Encontro".
                    </li>
                    <li>
                      Use os botões +/- para ajustar pontos de vida durante o
                      combate.
                    </li>
                    <li>
                      Adicione <b>condições</b> (Atordoado, Caído, etc.) através
                      do menu suspenso na ficha de cada personagem.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-lg mb-2 flex items-center">
                    <Sword className="h-5 w-5 mr-2 text-red-500" />
                    Gerenciando Combate
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>
                      Primeiro, role iniciativa para todos clicando no botão
                      "Rolar Iniciativa para Todos".
                    </li>
                    <li>
                      Inicie o combate com o botão "Iniciar Combate" para
                      ordenar os combatentes por iniciativa.
                    </li>
                    <li>
                      Use o botão "Próximo Turno" para avançar para o próximo
                      combatente.
                    </li>
                    <li>
                      Clique nos ataques para registrar seu uso no log de
                      combate.
                    </li>
                    <li>
                      Quando o combate terminar, clique em "Finalizar Combate"
                      para limpar condições e NPCs derrotados.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-lg mb-2 flex items-center">
                    <Share2 className="h-5 w-5 mr-2 text-blue-500" />
                    Compartilhando Sessões
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>
                      Clique no botão "Sessão" para criar uma nova sessão ou
                      entrar em uma existente.
                    </li>
                    <li>
                      Compartilhe o ID da sessão com outros jogadores para que
                      eles se juntem.
                    </li>
                    <li>
                      Todos os conectados à mesma sessão veem as mesmas
                      atualizações em tempo real.
                    </li>
                    <li>
                      O status de conexão é mostrado no canto superior esquerdo
                      (verde = conectado).
                    </li>
                    <li>
                      Se perder a conexão, use o botão "Sessão" para reconectar
                      com o mesmo ID.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-lg mb-2 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-purple-500" />
                    Encontros da Mansão
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>
                      Os encontros estão organizados por <b>andar</b> e{" "}
                      <b>sala</b>.
                    </li>
                    <li>
                      Cada encontro contém informações sobre inimigos,
                      armadilhas e puzzles.
                    </li>
                    <li>
                      Você pode filtrar os encontros selecionando um andar e uma
                      sala específica.
                    </li>
                    <li>
                      As <b>armadilhas</b> e <b>puzzles</b> são apenas
                      informativos - você precisará gerenciá-los manualmente.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-lg mb-2 flex items-center">
                    <Edit className="h-5 w-5 mr-2 text-green-500" />
                    Editando Personagens
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>
                      Clique no ícone de lápis para editar qualquer personagem.
                    </li>
                    <li>
                      Você pode modificar características básicas (nome, HP, CA,
                      etc.).
                    </li>
                    <li>
                      Adicione, remova ou modifique ataques e habilidades.
                    </li>
                    <li>
                      Para cada ataque, você pode especificar dano, tipo, bônus
                      de ataque, salvaguardas e notas especiais.
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <h4 className="font-medium text-lg mb-1 flex items-center text-yellow-800">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Dica
                  </h4>
                  <p className="text-yellow-800">
                    O confronto final com Tharion Shadowbane é complexo e possui
                    várias fases. Lembre-se de que ele tem 3 pilares de energia
                    que precisam ser destruídos para interromper seu ritual.
                    Cada pilar destruído enfraquece Tharion, removendo uma de
                    suas habilidades lendárias.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 border-t border-gray-200 pt-4 mt-4">
                <button
                  onClick={() => setShowHelp(false)}
                  className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MansionCombatTracker;
