"use client"
import React, { useState, useEffect } from 'react';
import { 
  X, Plus, ChevronUp, ChevronDown, Sword, Shield, Heart, Skull, 
  Feather, Zap, RefreshCw, Edit, Save, Trash2, HelpCircle, 
  MapPin, BookOpen, Clock, Users, Moon, FileText, AlertTriangle, Compass,
  LogIn, UserCheck, LogOut, Menu, User, Settings
} from 'lucide-react';

// Definição de encontros (separado para facilitar a manutenção do código)
const encountersData = {
  third: {
    corridor: {
      name: "Corredor Principal",
      description: "Um amplo corredor iluminado por candelabros com luz azulada antinatural, decorado com tapeçarias luxuosas e retratos de nobres.",
      enemies: [
        {
          id: 'veteran-bandit-1',
          name: 'Bandido Veterano #1',
          type: 'npc',
          hp: 58,
          maxHp: 58,
          ac: 15,
          initiative: 0,
          cr: '3',
          conditions: [],
          attacks: [
            { name: 'Espada Longa', damage: '2d8+4', type: 'cortante', toHit: '+7' },
            { name: 'Besta Pesada', damage: '1d10+2', type: 'perfurante', toHit: '+5' }
          ]
        },
        {
          id: 'veteran-bandit-2',
          name: 'Bandido Veterano #2',
          type: 'npc',
          hp: 58,
          maxHp: 58,
          ac: 15,
          initiative: 0,
          cr: '3',
          conditions: [],
          attacks: [
            { name: 'Espada Longa', damage: '2d8+4', type: 'cortante', toHit: '+7' },
            { name: 'Besta Pesada', damage: '1d10+2', type: 'perfurante', toHit: '+5' }
          ]
        },
        {
          id: 'corridor-mage',
          name: 'Mago (Túnica Carmesim)',
          type: 'npc',
          hp: 40,
          maxHp: 40,
          ac: 15,
          initiative: 0,
          cr: '6',
          conditions: [],
          attacks: [
            { name: 'Bola de Fogo', damage: '8d6', type: 'fogo', saveType: 'DES', saveDC: 15 },
            { name: 'Dardo Místico', damage: '3d4+3', type: 'força', toHit: '+7' },
            { name: 'Raio de Fogo', damage: '2d6', type: 'fogo', toHit: '+7' }
          ]
        }
      ],
      traps: [
        { 
          name: "Runas Explosivas", 
          description: "DC 15 Percepção para notar, DC 16 Arcana para desarmar. 4d8 dano de fogo em área de 10 pés (DC 15 DES para 1/2)." 
        },
        { 
          name: "Dardos Envenenados", 
          description: "DC 14 Percepção para notar, DC 15 Destreza para desarmar. 1d4 dano perfurante + 2d6 dano de veneno (DC 13 CON para negar veneno)." 
        }
      ]
    },
    luxuryRooms: {
      name: "Quartos Luxuosos",
      description: "Quartos amplos com camas de dossel, tapetes persas e espelhos ornamentados que parecem refletir sombras estranhas.",
      enemies: [
        {
          id: 'bandit-1',
          name: 'Bandido #1',
          type: 'npc',
          hp: 11,
          maxHp: 11,
          ac: 12,
          initiative: 0,
          cr: '1/8',
          conditions: [],
          attacks: [
            { name: 'Cimitarra', damage: '1d6+1', type: 'cortante', toHit: '+3' },
            { name: 'Besta Leve', damage: '1d8+1', type: 'perfurante', toHit: '+3' }
          ]
        },
        {
          id: 'bandit-2',
          name: 'Bandido #2',
          type: 'npc',
          hp: 11,
          maxHp: 11,
          ac: 12,
          initiative: 0,
          cr: '1/8',
          conditions: [],
          attacks: [
            { name: 'Cimitarra', damage: '1d6+1', type: 'cortante', toHit: '+3' },
            { name: 'Besta Leve', damage: '1d8+1', type: 'perfurante', toHit: '+3' }
          ]
        },
        {
          id: 'assassin',
          name: 'Assassino',
          type: 'npc',
          hp: 78,
          maxHp: 78,
          ac: 17,
          initiative: 0,
          cr: '8',
          conditions: [],
          attacks: [
            { name: 'Adaga Envenenada', damage: '1d4+4+7d6', type: 'perfurante/veneno', toHit: '+8' },
            { name: 'Besta Leve', damage: '1d8+4', type: 'perfurante', toHit: '+8' },
            { name: 'Ataque Surpresa', damage: '13d6', type: 'especial', notes: 'Dano adicional em surpresa (crítico automático)' }
          ]
        },
        {
          id: 'archmage-miniboss',
          name: 'Arquimago (Mini-chefe)',
          type: 'npc',
          hp: 99,
          maxHp: 99,
          ac: 15,
          initiative: 0,
          cr: '12',
          conditions: [],
          attacks: [
            { name: 'Desintegrar', damage: '10d6+40', type: 'força', saveType: 'DES', saveDC: 17 },
            { name: 'Cone de Frio', damage: '8d8', type: 'frio', saveType: 'CON', saveDC: 17 },
            { name: 'Bola de Fogo', damage: '8d6', type: 'fogo', saveType: 'DES', saveDC: 17 }
          ]
        }
      ],
      traps: [
        { 
          name: "Lareira Enfeitiçada", 
          description: "Quando alguém se aproxima a 5 pés, dispara chamas. DC 14 Percepção, DC 15 Arcana para desarmar. 3d8 dano de fogo (DC 14 DES para 1/2)." 
        },
        { 
          name: "Armário com Agulhas", 
          description: "DC 15 Percepção/Investigação, DC 14 Destreza para desarmar. 2d4 dano perfurante + teste de CON CD 13 ou ficar envenenado por 1 hora." 
        }
      ]
    },
    library: {
      name: "Grande Biblioteca",
      description: "Uma sala imensa com estantes até o teto, escadas rolantes e passarelas. No centro há uma mesa de estudo circular com símbolos arcanos gravados.",
      enemies: [
        {
          id: 'ghost-librarian',
          name: 'Bibliotecário Espectral',
          type: 'npc',
          hp: 22,
          maxHp: 22,
          ac: 13,
          initiative: 0,
          cr: '1',
          conditions: [],
          attacks: [
            { name: 'Toque da Vida', damage: '3d6', type: 'necrótico', toHit: '+5' },
            { name: 'Contrafeitiço', type: 'especial', notes: 'Cancela magias de 3º nível ou inferior, 3/dia' },
            { name: 'Invocar Livros Animados', type: 'especial', notes: 'Invoca 1d4 Livros Animados como ação' }
          ]
        },
        {
          id: 'animated-book-1',
          name: 'Livro Animado #1',
          type: 'npc',
          hp: 17,
          maxHp: 17,
          ac: 17,
          initiative: 0,
          cr: '1/4',
          conditions: [],
          attacks: [
            { name: 'Golpe', damage: '1d6+1', type: 'cortante', toHit: '+3' }
          ]
        },
        {
          id: 'animated-book-2',
          name: 'Livro Animado #2',
          type: 'npc',
          hp: 17,
          maxHp: 17,
          ac: 17,
          initiative: 0,
          cr: '1/4',
          conditions: [],
          attacks: [
            { name: 'Golpe', damage: '1d6+1', type: 'cortante', toHit: '+3' }
          ]
        },
        {
          id: 'archmage-library',
          name: 'Arquimago (Principal)',
          type: 'npc',
          hp: 99,
          maxHp: 99,
          ac: 15,
          initiative: 0,
          cr: '12',
          conditions: [],
          attacks: [
            { name: 'Desintegrar', damage: '10d6+40', type: 'força', saveType: 'DES', saveDC: 17 },
            { name: 'Banimento', type: 'especial', saveType: 'CAR', saveDC: 17 },
            { name: 'Contramágica', type: 'especial', notes: 'Cancela mágica como reação' }
          ]
        }
      ],
      traps: [
        { 
          name: "Livros Armadilhados", 
          description: "DC 16 Investigação para identificar. Ao ser aberto, dispara um raio de eletricidade: 3d10 dano elétrico (DC 15 DES para 1/2)." 
        },
        { 
          name: "Glifos de Proteção", 
          description: "Inscritos em certos livros proibidos. DC 17 Arcana para detectar. Ativa Glifo de Proteção com Bola de Fogo (8d6 dano de fogo, DC 15 DES para 1/2)." 
        }
      ]
    },
    studyRoom: {
      name: "Sala de Estudo",
      description: "Uma sala circular com várias mesas de estudo, globos celestes e uma grande mesa de mapeamento no centro.",
      enemies: [
        {
          id: 'mimic',
          name: 'Mímico (Escrivaninha)',
          type: 'npc',
          hp: 58,
          maxHp: 58,
          ac: 12,
          initiative: 0,
          cr: '2',
          conditions: [],
          attacks: [
            { name: 'Pseudópode', damage: '1d8+4', type: 'contundente', toHit: '+5' },
            { name: 'Mordida', damage: '1d8+4+1d8', type: 'perfurante/ácido', toHit: '+5', notes: 'O alvo fica agarrado (CD 13 para escapar)' }
          ]
        },
        {
          id: 'cultist-1',
          name: 'Cultista #1',
          type: 'npc',
          hp: 9,
          maxHp: 9,
          ac: 12,
          initiative: 0,
          cr: '1/8',
          conditions: [],
          attacks: [
            { name: 'Cimitarra', damage: '1d6+1', type: 'cortante', toHit: '+3' }
          ]
        },
        {
          id: 'cultist-2',
          name: 'Cultista #2',
          type: 'npc',
          hp: 9,
          maxHp: 9,
          ac: 12,
          initiative: 0,
          cr: '1/8',
          conditions: [],
          attacks: [
            { name: 'Cimitarra', damage: '1d6+1', type: 'cortante', toHit: '+3' }
          ]
        }
      ],
      traps: [
        { 
          name: "Ampulheta Enfeitiçada", 
          description: "Quando virada, cria um campo de Lentidão em uma área de 20 pés. DC 14 Percepção para notar a aura mágica, DC 16 Arcana para desarmar." 
        }
      ],
      puzzle: "Mapa Mágico: Um grande mapa da mansão na parede que, quando certos pontos são pressionados na sequência correta (baseada em constelações visíveis no teto), revela passagens secretas para o quarto andar. DC 15 Arcana/História para decifrar o enigma."
    },
    musicRoom: {
      name: "Sala de Música",
      description: "Uma sala elegante com um piano de cauda ornamentado, diversos instrumentos musicais e um grande espelho de corpo inteiro com moldura dourada.",
      enemies: [
        {
          id: 'harpy',
          name: 'Harpia (Musicista)',
          type: 'npc',
          hp: 38,
          maxHp: 38,
          ac: 11,
          initiative: 0,
          cr: '1',
          conditions: [],
          attacks: [
            { name: 'Garras', damage: '2d4+1', type: 'cortante', toHit: '+3' },
            { name: 'Canção Encantadora', type: 'especial', saveType: 'SAB', saveDC: 11, notes: 'Alvos que falham são atraídos para a harpia' }
          ]
        },
        {
          id: 'shadow-1',
          name: 'Reflexo Sombrio #1',
          type: 'npc',
          hp: 16,
          maxHp: 16,
          ac: 12,
          initiative: 0,
          cr: '1/2',
          conditions: [],
          attacks: [
            { name: 'Dreno de Força', damage: '2d6+2', type: 'necrótico', toHit: '+4', notes: 'Reduz FOR do alvo em 1d4' }
          ]
        },
        {
          id: 'shadow-2',
          name: 'Reflexo Sombrio #2',
          type: 'npc',
          hp: 16,
          maxHp: 16,
          ac: 12,
          initiative: 0,
          cr: '1/2',
          conditions: [],
          attacks: [
            { name: 'Dreno de Força', damage: '2d6+2', type: 'necrótico', toHit: '+4', notes: 'Reduz FOR do alvo em 1d4' }
          ]
        }
      ],
      puzzle: "Espelho Encantado: Reflete versões sombrias dos personagens quando alguém toca uma melodia específica no piano. DC 16 Percepção/Arcana para notar aura. Resolver o enigma musical (Desempenho DC 15) neutraliza o espelho."
    },
    ballroom: {
      name: "Salão de Festas",
      description: "Um salão grandioso com piso de mármore rachado, lustres quebrados e mesas longas com restos de banquetes antigos.",
      enemies: [
        {
          id: 'shadow-sorcerer',
          name: 'Feiticeiro das Sombras',
          type: 'npc',
          hp: 85,
          maxHp: 85,
          ac: 16,
          initiative: 0,
          cr: '9',
          conditions: [],
          attacks: [
            { name: 'Toque Necrótico', damage: '4d8', type: 'necrótico', toHit: '+8' },
            { name: 'Raio Negro', damage: '8d6', type: 'necrótico', saveType: 'DES', saveDC: 16, notes: 'Reduz PV máximo em quantidade igual ao dano' },
            { name: 'Teletransporte Sombrio', type: 'especial', notes: 'Teletransporta 60 pés entre sombras como ação bônus' }
          ]
        },
        {
          id: 'cultist-invoker-1',
          name: 'Invocador Cultista #1',
          type: 'npc',
          hp: 27,
          maxHp: 27,
          ac: 13,
          initiative: 0,
          cr: '2',
          conditions: [],
          attacks: [
            { name: 'Maça', damage: '1d6+1', type: 'contundente', toHit: '+3' },
            { name: 'Palavra Sagrada', damage: '2d8+2', type: 'radiante', saveType: 'SAB', saveDC: 13 }
          ]
        },
        {
          id: 'cultist-invoker-2',
          name: 'Invocador Cultista #2',
          type: 'npc',
          hp: 27,
          maxHp: 27,
          ac: 13,
          initiative: 0,
          cr: '2',
          conditions: [],
          attacks: [
            { name: 'Maça', damage: '1d6+1', type: 'contundente', toHit: '+3' },
            { name: 'Palavra Sagrada', damage: '2d8+2', type: 'radiante', saveType: 'SAB', saveDC: 13 }
          ]
        },
        {
          id: 'shadow-elemental',
          name: 'Elemental da Sombra',
          type: 'npc',
          hp: 66,
          maxHp: 66,
          ac: 13,
          initiative: 0,
          cr: '4',
          conditions: [],
          attacks: [
            { name: 'Garras', damage: '2d6+3', type: 'necrótico', toHit: '+5' },
            { name: 'Abraço Sombrio', damage: '3d6+3', type: 'necrótico', toHit: '+5', notes: 'O alvo fica agarrado e tem desvantagem em testes e salvaguardas' }
          ]
        }
      ],
      traps: [
        { 
          name: "Pisos Colapsáveis", 
          description: "DC 15 Percepção para notar, DC 14 Destreza para evitar. Queda de 10 pés em um porão com espinhos: 2d6 dano de queda + 2d6 dano perfurante." 
        },
        { 
          name: "Lustre Precário", 
          description: "Pode cair quando ativado por um fio quase invisível (DC 16 Percepção para notar). 3d6 dano contundente e o alvo fica preso (DC 15 Força para escapar)." 
        }
      ]
    },
    statuesRoom: {
      name: "Sala das Estátuas",
      description: "Uma câmara circular com oito estátuas de mármore dispostas em círculo, representando diferentes classes. No centro há um pedestal com um cristal.",
      enemies: [
        {
          id: 'animated-armor-1',
          name: 'Estátua Animada (Guerreiro)',
          type: 'npc',
          hp: 33,
          maxHp: 33,
          ac: 18,
          initiative: 0,
          cr: '1',
          conditions: [],
          attacks: [
            { name: 'Golpe', damage: '1d6+4', type: 'contundente', toHit: '+4' },
            { name: 'Ataque Múltiplo', type: 'especial', notes: '2 ataques por ação' }
          ]
        },
        {
          id: 'animated-armor-2',
          name: 'Estátua Animada (Mago)',
          type: 'npc',
          hp: 33,
          maxHp: 33,
          ac: 18,
          initiative: 0,
          cr: '1',
          conditions: [],
          attacks: [
            { name: 'Golpe', damage: '1d6+4', type: 'contundente', toHit: '+4' },
            { name: 'Ataque Múltiplo', type: 'especial', notes: '2 ataques por ação' }
          ]
        },
        {
          id: 'animated-armor-3',
          name: 'Estátua Animada (Clérigo)',
          type: 'npc',
          hp: 33,
          maxHp: 33,
          ac: 18,
          initiative: 0,
          cr: '1',
          conditions: [],
          attacks: [
            { name: 'Golpe', damage: '1d6+4', type: 'contundente', toHit: '+4' },
            { name: 'Ataque Múltiplo', type: 'especial', notes: '2 ataques por ação' }
          ]
        }
      ],
      puzzle: "Puzzle das Estátuas Vivas: As estátuas animam quando alguém toca o cristal. Os jogadores devem posicionar cada estátua no lugar correto conforme um enigma em um poema gravado no pedestal. Posicionando corretamente (INT DC 16 ou HIS DC 14): as estátuas formam um padrão que revela um compartimento secreto. Posicionando incorretamente: estátuas atacam."
    },
    clockRoom: {
      name: "Relógio Encantado",
      description: "Uma sala octogonal com um enorme relógio mecânico no centro. Os números no mostrador são símbolos arcanos, e os ponteiros parecem mover-se irregularmente.",
      puzzle: "Puzzle do Tempo: Os jogadores devem ajustar os ponteiros do relógio para um momento específico sugerido por pistas encontradas nas tapeçarias do terceiro andar. Sucesso (Arcana DC 15): O tempo na sala desacelera, permitindo aos jogadores se moverem com o efeito de Velocidade durante a próxima batalha. Falha: O tempo na sala acelera, impondo o efeito de Lentidão aos jogadores na próxima batalha."
    }
  },
  fourth: {
    corridor: {
      name: "Corredor Principal (4º Andar)",
      description: "Um corredor extraordinariamente largo com teto abobadado pintado com uma cena cósmica. O chão é feito de mármore negro polido que reflete as estrelas.",
      enemies: [
        {
          id: 'death-knight-1',
          name: 'Cavaleiro da Morte #1',
          type: 'npc',
          hp: 180,
          maxHp: 180,
          ac: 20,
          initiative: 0,
          cr: '17',
          conditions: [],
          attacks: [
            { name: 'Espada Longa', damage: '2d8+6+4d8', type: 'cortante/necrótico', toHit: '+11' },
            { name: 'Bola de Fogo', damage: '13d6', type: 'fogo', saveType: 'DES', saveDC: 18 },
            { name: 'Comando', type: 'especial', saveType: 'SAB', saveDC: 18, notes: 'Força um comando de uma palavra' }
          ]
        },
        {
          id: 'death-knight-2',
          name: 'Cavaleiro da Morte #2',
          type: 'npc',
          hp: 180,
          maxHp: 180,
          ac: 20,
          initiative: 0,
          cr: '17',
          conditions: [],
          attacks: [
            { name: 'Espada Longa', damage: '2d8+6+4d8', type: 'cortante/necrótico', toHit: '+11' },
            { name: 'Bola de Fogo', damage: '13d6', type: 'fogo', saveType: 'DES', saveDC: 18 },
            { name: 'Comando', type: 'especial', saveType: 'SAB', saveDC: 18, notes: 'Força um comando de uma palavra' }
          ]
        }
      ],
      traps: [
        { 
          name: "Constelações Mortais", 
          description: "Quando certas constelações no teto se alinham (a cada 2 rodadas), raios de energia cósmica atingem pontos aleatórios. DC 16 Percepção para prever o alvo, DC 15 Destreza para evitar. 4d10 dano radiante (CD 16 CON para 1/2)." 
        }
      ]
    }
  }
};

// Componente principal
const MansionCombatTracker = () => {
  // Estados principais
  const [combatants, setCombatants] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [combatActive, setCombatActive] = useState(false);
  const [currentFloor, setCurrentFloor] = useState('third');
  const [currentRoom, setCurrentRoom] = useState('all');
  const [showHelp, setShowHelp] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [combatLog, setCombatLog] = useState([]);
  const [combatNotes, setCombatNotes] = useState('');
  
  // Estado para mostrar/esconder seções
  const [showSections, setShowSections] = useState({
    controls: true,
    combatants: true,
    log: true,
    encounters: true
  });

  // Novo estado para login e modo jogador
  const [userRole, setUserRole] = useState('dm'); // 'dm', 'player'
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [playerEditingMode, setPlayerEditingMode] = useState(false);
  
  // Estado dos encontros
  const [encounters, setEncounters] = useState(encountersData);
  
  // Configuração de jogadores
  const [players] = useState([
    { id: 'luiz', name: 'Luiz', character: 'Antedighimon', characterId: '' },
    { id: 'leo', name: 'Leo', character: 'Jorge E Mateus', characterId: '' },
    { id: 'lais', name: 'Laís', character: 'Aria', characterId: '' }
  ]);
  
  // Estado para controle de colapso de ações
  const [collapsedActions, setCollapsedActions] = useState({});

  // Constantes para condições comuns
  const CONDITIONS = [
    'Atordoado', 'Caído', 'Cego', 'Enfeitiçado', 'Envenenado', 
    'Incapacitado', 'Inconsciente', 'Paralizado', 'Petrificado', 'Surdo'
  ];

  // Atualizar IDs dos personagens dos jogadores após carregamento
  useEffect(() => {
    if (combatants.length > 0) {
      const updatedPlayers = [...players];
      
      // Para cada jogador, encontrar o ID do seu personagem
      updatedPlayers.forEach(player => {
        const characterMatch = combatants.find(c => 
          c.type === 'player' && 
          c.name.toLowerCase() === player.character.toLowerCase()
        );
        
        if (characterMatch) {
          player.characterId = characterMatch.id;
        }
      });
    }
  }, [combatants]);

  // Verificar se o usuário atual pode editar um personagem específico
  const canEditCharacter = (character) => {
    // DM pode editar qualquer um
    if (userRole === 'dm') return true;
    
    // Jogador só pode editar seu próprio personagem
    if (userRole === 'player' && currentPlayer) {
      return character.id === currentPlayer.characterId;
    }
    
    return false;
  };

  // Verificar se o usuário atual pode editar HP de um inimigo
  const canEditEnemyHP = (character) => {
    // DM pode editar qualquer HP
    if (userRole === 'dm') return true;
    
    // Jogadores podem editar apenas HP de inimigos
    if (userRole === 'player' && character.type !== 'player') {
      return true;
    }
    
    return false;
  };

  // Login como jogador
  const loginAsPlayer = (playerId) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      setCurrentPlayer(player);
      setUserRole('player');
      addToCombatLog(`👋 ${player.name} entrou como ${player.character}`);
    }
    setShowLoginModal(false);
  };

  // Login como DM
  const loginAsDM = () => {
    setCurrentPlayer(null);
    setUserRole('dm');
    addToCombatLog('🎭 Mestre entrou no jogo');
    setShowLoginModal(false);
  };

  // Logout
  const logout = () => {
    if (currentPlayer) {
      addToCombatLog(`👋 ${currentPlayer.name} saiu do jogo`);
    } else {
      addToCombatLog('🎭 Mestre saiu do jogo');
    }
    setCurrentPlayer(null);
    setUserRole('dm');
  };

  // Toggle para colapsar ações de um personagem
  const toggleActionsCollapse = (characterId) => {
    setCollapsedActions(prev => ({
      ...prev,
      [characterId]: !prev[characterId]
    }));
  };

  // Gerar uma cor única para cada combatente baseado em seu ID e tipo
  const getCharacterColor = (character) => {
    if (character.type === 'boss') {
      return 'bg-purple-200 border-purple-500 border-2';
    } else if (character.type === 'npc') {
      return 'bg-red-100 border-red-300';
    } else {
      return 'bg-blue-100 border-blue-300';
    }
  };

  // Iniciar combate com os personagens atuais
  const startCombat = () => {
    if (combatants.length > 0) {
      // Ordenar combatentes por iniciativa
      const sortedCombatants = [...combatants].sort((a, b) => b.initiative - a.initiative);
      setCombatants(sortedCombatants);
      setCurrentTurn(0);
      setCurrentRound(1);
      setCombatActive(true);
      
      // Adicionar ao log de combate
      addToCombatLog('🏁 Combate iniciado!');
      addToCombatLog(`🎲 Rodada 1, Turno de ${sortedCombatants[0].name}`);
    }
  };

  // Finalizar combate
  const endCombat = () => {
    setCombatActive(false);
    setCurrentTurn(0);
    setCurrentRound(1);
    addToCombatLog('🛑 Combate finalizado.');
    
    // Remover condições temporárias e NPCs mortos
    setCombatants(prev => prev
      .filter(c => !(c.type !== 'player' && c.hp <= 0))
      .map(c => ({
        ...c,
        conditions: []
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
      addToCombatLog(`🎲 Rodada ${newRound}, Turno de ${combatants[newTurn].name}`);
    }
  };

  // Adicionar log ao combate
  const addToCombatLog = (message) => {
    setCombatLog(prev => [
      { id: Date.now(), message, timestamp: new Date().toLocaleTimeString(), round: currentRound },
      ...prev
    ]);
  };

  // Adicionar novo personagem jogador
  const addPlayer = (customPlayer = null) => {
    const newPlayer = customPlayer || {
      id: `player-${Date.now()}`,
      name: 'Novo Jogador',
      type: 'player',
      hp: 20,
      maxHp: 20,
      ac: 10,
      initiative: 0,
      conditions: [],
      attacks: []
    };
    setCombatants(prev => [...prev, newPlayer]);
  };
  
  // Adicionar os jogadores da campanha
  const addCampaignPlayers = () => {
    // Jorge E Mateus (Clérigo) - Leo
    const jorgeEMateus = {
      id: `player-jorge-${Date.now()}`,
      name: 'Jorge E Mateus',
      type: 'player',
      hp: 52,
      maxHp: 52,
      ac: 16,
      initiative: 2,
      perception: 14,
      proficiency: 3,
      speed: '30 feet',
      hd: '7d8',
      playerName: 'Leo',
      conditions: [],
      attacks: [
        { name: 'Maça', damage: '1d6+1', type: 'contundente', toHit: '+4' },
        { name: 'Chama Sagrada', damage: '1d8+3', type: 'radiante', saveType: 'DES', saveDC: 15 },
        { name: 'Curar Ferimentos', type: 'cura', notes: 'Recupera 1d8+3 pontos de vida ao alvo tocado' },
        { name: 'Canal de Divindade', type: 'especial', notes: 'Resta 2 usos', 
          charges: 2, maxCharges: 2 }
      ]
    };
    
    // Antedighimon (Ladino/Mago) - Luiz
    const antedighimon = {
      id: `player-antedighimon-${Date.now()}`,
      name: 'Antedighimon',
      type: 'player',
      hp: 41,
      maxHp: 41,
      ac: 13,
      initiative: 3,
      perception: 12,
      proficiency: 3,
      speed: '30 feet',
      hd: '7d6',
      playerName: 'Luiz',
      conditions: [],
      attacks: [
        { name: 'Adaga', damage: '1d4+3', type: 'perfurante', toHit: '+6', 
          notes: 'Ataque furtivo: +3d6 dano com vantagem ou aliado próximo' },
        { name: 'Quarterstaff', damage: '1d6+1', type: 'contundente', toHit: '+4' },
        { name: 'Raio de Fogo', damage: '2d6', type: 'fogo', toHit: '+5' },
        { name: 'Mísseis Mágicos', damage: '3d4+3', type: 'força', notes: 'Acerta automaticamente' }
      ]
    };
    
    // Aria (Bárbara) - Laís
    const aria = {
      id: `player-aria-${Date.now()}`,
      name: 'Aria',
      type: 'player',
      race: 'Meio-Orc',
      class: 'Bárbara 7',
      hp: 68,
      maxHp: 68,
      ac: 13,
      initiative: 1,
      perception: 13,
      proficiency: 3,
      speed: '40 feet',
      hd: '7d12',
      playerName: 'Laís',
      str: 19,
      dex: 13,
      con: 15,
      int: 8,
      wis: 11,
      cha: 11,
      conditions: [],
      attacks: [
        { name: 'Handaxe', damage: '1d6+4', type: 'cortante', toHit: '+7', 
          notes: 'Simples, Leve, Arremessável, Alcance 20/60 pés' },
        { name: 'Longsword', damage: '1d8+4', type: 'cortante', toHit: '+7',
          notes: 'Marcial, Versátil, Duas mãos: 1d10+4' },
        { name: 'Ataque Desarmado', damage: '5', type: 'contundente', toHit: '+7' },
        { name: 'Fúria', type: 'especial', 
          notes: 'Vantagem em testes de FOR, +2 dano corpo a corpo, resistência a dano contundente/cortante/perfurante',
          charges: 4, maxCharges: 4 },
        { name: 'Ataque Imprudente', type: 'especial', 
          notes: 'Vantagem no ataque, mas ataques contra você têm vantagem até seu próximo turno' }
      ],
      features: [
        'Resistência Implacável: Quando reduzida a 0 PV, pode cair para 1 PV uma vez por descanso longo',
        'Visão no Escuro: Pode ver na escuridão até 60 pés',
        'Defesa sem Armadura: CA = 10 + mod DEX + mod CON + bônus de escudo',
        'Ataques Selvagens: Rola um dado adicional de dano em acertos críticos'
      ]
    };
    
    // Atualizar informações dos jogadores para cada personagem
    players.forEach(player => {
      if (player.character === 'Jorge E Mateus') {
        player.characterId = jorgeEMateus.id;
      } else if (player.character === 'Antedighimon') {
        player.characterId = antedighimon.id;
      } else if (player.character === 'Aria') {
        player.characterId = aria.id;
      }
    });
    
    // Adicionar os jogadores ao combate
    setCombatants(prev => [...prev, jorgeEMateus, antedighimon, aria]);
    addToCombatLog(`👥 Jogadores da campanha adicionados: Jorge E Mateus (Leo), Antedighimon (Luiz) e Aria (Laís).`);
  };

  // Adicionar NPC da lista predefinida
  const addNPC = (npc) => {
    // Criar uma cópia para não modificar a original
    const newNPC = {
      ...npc,
      id: `${npc.id}-${Date.now()}`,
      initiative: Math.floor(Math.random() * 20) + 1, // Gerar iniciativa aleatória
    };
    setCombatants(prev => [...prev, newNPC]);
    addToCombatLog(`➕ ${newNPC.name} adicionado ao combate.`);
  };

  // Adicionar um encontro completo
  const addEncounter = (encounter) => {
    if (!encounter || !encounter.enemies) return;
    
    const newNPCs = encounter.enemies.map(npc => ({
      ...npc,
      id: `${npc.id}-${Date.now()}`,
      initiative: Math.floor(Math.random() * 20) + 1, // Gerar iniciativa aleatória
    }));
    
    setCombatants(prev => [...prev, ...newNPCs]);
    addToCombatLog(`🏰 Encontro "${encounter.name}" adicionado (${encounter.enemies.length} inimigos).`);
    
    // Se o encontro tiver armadilhas, adicionar ao log
    if (encounter.traps && encounter.traps.length > 0) {
      addToCombatLog(`⚠️ Armadilhas no encontro: ${encounter.traps.map(t => t.name).join(', ')}`);
    }
    
    // Se o encontro tiver um puzzle, adicionar ao log
    if (encounter.puzzle) {
      addToCombatLog(`🧩 Puzzle: ${encounter.puzzle.split('.')[0]}`);
    }
  };

  // Remover combatente
  const removeCombatant = (id) => {
    setCombatants(prev => {
      const characterToRemove = prev.find(c => c.id === id);
      if (characterToRemove) {
        addToCombatLog(`❌ ${characterToRemove.name} removido do combate.`);
      }
      return prev.filter(c => c.id !== id);
    });

    // Ajustar o turno atual se necessário
    if (combatActive) {
      const indexToRemove = combatants.findIndex(c => c.id === id);
      if (indexToRemove <= currentTurn && currentTurn > 0) {
        setCurrentTurn(currentTurn - 1);
      } else if (indexToRemove === currentTurn && currentTurn === 0 && combatants.length > 1) {
        // Se estamos removendo o primeiro combatente e há outros, mantemos o turno em 0
        setCurrentTurn(0);
      }
    }
  };

  // Atualizar iniciativa de um combatente
  const updateInitiative = (id, value) => {
    const numValue = parseInt(value) || 0;
    setCombatants(prev => 
      prev.map(c => c.id === id ? { ...c, initiative: numValue } : c)
    );
  };

  // Rolar iniciativa para todos
  const rollInitiativeForAll = () => {
    setCombatants(prev => 
      prev.map(c => ({
        ...c,
        initiative: Math.floor(Math.random() * 20) + 1
      }))
    );
    addToCombatLog('🎲 Iniciativa rolada para todos os combatentes.');
  };

  // Atualizar pontos de vida
  const updateHP = (id, change) => {
    setCombatants(prev => 
      prev.map(c => {
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
    setCombatants(prev => 
      prev.map(c => {
        if (c.id === id) {
          const hasCondition = c.conditions.includes(condition);
          const newConditions = hasCondition 
            ? c.conditions.filter(cond => cond !== condition)
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
    setEditingCharacter({...character});
    setPlayerEditingMode(userRole === 'player');
  };

  // Salvar edição de um personagem
  const saveCharacterEdit = () => {
    if (editingCharacter) {
      setCombatants(prev => 
        prev.map(c => c.id === editingCharacter.id ? editingCharacter : c)
      );
      setEditingCharacter(null);
      setPlayerEditingMode(false);
    }
  };

  // Adicionar ataque para o personagem em edição
  const addAttackToEditingCharacter = () => {
    if (editingCharacter) {
      setEditingCharacter({
        ...editingCharacter,
        attacks: [
          ...editingCharacter.attacks,
          { name: 'Novo Ataque', damage: '', type: '', toHit: '' }
        ]
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
        attacks: newAttacks
      });
    }
  };

  // Atualizar dados de ataque
  const updateAttackData = (index, field, value) => {
    if (editingCharacter) {
      const newAttacks = [...editingCharacter.attacks];
      newAttacks[index] = {
        ...newAttacks[index],
        [field]: value
      };
      setEditingCharacter({
        ...editingCharacter,
        attacks: newAttacks
      });
    }
  };

  // Executar um ataque
  const executeAttack = (characterId, attack) => {
    const character = combatants.find(c => c.id === characterId);
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
        setCombatants(prev => 
          prev.map(c => {
            if (c.id === characterId) {
              const updatedAttacks = c.attacks.map(a => {
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
    setShowSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Filtrar encontros por andar e sala
  const getFilteredEncounters = () => {
    if (!encounters[currentFloor]) return [];
    
    if (currentRoom === 'all') {
      return Object.values(encounters[currentFloor]);
    }
    
    return [encounters[currentFloor][currentRoom]].filter(Boolean);
  };

  // Obter lista de salas para o andar atual
  const getRoomsForCurrentFloor = () => {
    if (!encounters[currentFloor]) return [];
    
    return Object.entries(encounters[currentFloor]).map(([key, room]) => ({
      id: key,
      name: room.name
    }));
  };

  // CSS dinâmico para o indicador de rodada
  const getRoundIndicatorClass = () => {
    if (currentRound <= 3) {
      return 'bg-green-100 text-green-800 border-green-300';
    } else if (currentRound <= 6) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    } else {
      return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  // Interface principal do componente
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho com informações de login */}
        <div className="bg-gray-900 text-white rounded-lg shadow-lg p-6 mb-6 text-center relative">
          <div className="absolute top-4 left-4 flex items-center">
            {currentPlayer ? (
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-green-400" />
                <span className="text-green-400 font-medium mr-4">
                  {currentPlayer.name} ({currentPlayer.character})
                </span>
                <button 
                  onClick={logout}
                  className="text-gray-300 hover:text-white flex items-center"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  <span className="text-sm">Sair</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-purple-400" />
                <span className="text-purple-400 font-medium mr-4">Mestre</span>
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="text-gray-300 hover:text-white flex items-center"
                >
                  <LogIn className="h-5 w-5 mr-1" />
                  <span className="text-sm">Trocar Usuário</span>
                </button>
              </div>
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-1">Mansão das Sombras</h1>
          <h2 className="text-lg text-gray-300 mb-4">Rastreador de Combate</h2>
          
          {combatActive && (
            <div className="flex justify-center space-x-4">
              <div className={`px-4 py-2 rounded-full border-2 ${getRoundIndicatorClass()}`}>
                Rodada {currentRound}
              </div>
              <div className="px-4 py-2 bg-blue-100 text-blue-800 border-blue-300 border-2 rounded-full">
                Turno: {combatants[currentTurn]?.name || 'Nenhum'}
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
        
        {/* Controles de DM */}
        {userRole === 'dm' && (
          <div className="mb-6 bg-white rounded-lg shadow-lg overflow-hidden">
            <div 
              className="bg-gray-800 text-white p-4 flex justify-between cursor-pointer"
              onClick={() => toggleSection('controls')}
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
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        Iniciar Combate
                      </button>
                      <button 
                        onClick={nextTurn}
                        disabled={!combatActive}
                        className={`w-full font-medium py-2 px-4 rounded transition-colors ${
                          !combatActive 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        }`}
                      >
                        Próximo Turno
                      </button>
                      <button 
                        onClick={endCombat}
                        disabled={!combatActive}
                        className={`w-full font-medium py-2 px-4 rounded transition-colors ${
                          !combatActive 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-red-500 hover:bg-red-600 text-white'
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
                      </div>
                      
                      <div className="pt-2">
                        <div className="flex space-x-2 mb-2">
                          <select 
                            value={currentFloor}
                            onChange={(e) => {
                              setCurrentFloor(e.target.value);
                              setCurrentRoom('all');
                            }}
                            className="flex-1 p-2 border border-gray-300 rounded bg-white"
                          >
                            <option value="third">Andar 3 - Quartos Luxuosos</option>
                            <option value="fourth">Andar 4 - Confronto Final</option>
                          </select>
                          
                          <select 
                            value={currentRoom}
                            onChange={(e) => setCurrentRoom(e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded bg-white"
                          >
                            <option value="all">Todas as Salas</option>
                            {getRoomsForCurrentFloor().map(room => (
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
        )}
        
        {/* Barra de controle simplificada para jogadores */}
        {userRole === 'player' && (
          <div className="mb-6 bg-white rounded-lg shadow-lg p-4">
            <div className="flex flex-wrap justify-between items-center">
              <div className="flex items-center mb-2 sm:mb-0">
                <div className={`px-3 py-1 rounded-full border ${getRoundIndicatorClass()} mr-2`}>
                  Rodada {currentRound}
                </div>
                <div className="px-3 py-1 bg-blue-100 text-blue-800 border-blue-300 border rounded-full">
                  Turno: {combatants[currentTurn]?.name || 'Nenhum'}
                </div>
              </div>
              
              {combatActive && currentPlayer && combatants[currentTurn]?.id === currentPlayer.characterId && (
                <div className="bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-lg px-4 py-2">
                  ⭐ É o seu turno!
                </div>
              )}
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    // Abrir modo de edição do personagem do jogador
                    const playerCharacter = combatants.find(c => c.id === currentPlayer?.characterId);
                    if (playerCharacter) {
                      startEditingCharacter(playerCharacter);
                    }
                  }}
                  disabled={!currentPlayer}
                  className={`py-1 px-3 rounded flex items-center text-sm ${
                    !currentPlayer ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar Meu Personagem
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Lista de Encontros - visível apenas para o DM */}
        {userRole === 'dm' && (
          <div className="mb-6 bg-white rounded-lg shadow-lg overflow-hidden">
            <div 
              className="bg-gray-800 text-white p-4 flex justify-between cursor-pointer"
              onClick={() => toggleSection('encounters')}
            >
              <h3 className="font-bold text-lg flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Encontros Disponíveis {currentRoom !== 'all' ? `- ${encounters[currentFloor]?.[currentRoom]?.name || ''}` : ''}
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
                        <h4 className="font-bold text-gray-800">{encounter.name}</h4>
                        <button 
                          onClick={() => addEncounter(encounter)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-sm transition-colors flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Adicionar Encontro
                        </button>
                      </div>
                      <div className="p-3">
                        <p className="text-gray-600 text-sm mb-2">{encounter.description}</p>
                        
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
                                  <span className="font-medium">{enemy.name}</span>
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
                                  <div className="text-xs text-gray-600">{trap.description}</div>
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Lista de Combatentes */}
        <div className="mb-6 bg-white rounded-lg shadow-lg overflow-hidden">
          <div 
            className="bg-gray-800 text-white p-4 flex justify-between cursor-pointer"
            onClick={() => toggleSection('combatants')}
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
                  <p className="text-gray-500">Nenhum combatente adicionado. Adicione jogadores ou inimigos para começar.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {combatants.map((character, index) => (
                    <div 
                      key={character.id} 
                      className={`border-2 rounded-lg overflow-hidden ${
                        combatActive && index === currentTurn 
                          ? 'border-yellow-500 ring-2 ring-yellow-200' 
                          : 'border-gray-200'
                      } ${getCharacterColor(character)}`}
                    >
                      <div className="bg-white bg-opacity-80 p-3">
                        <div className="flex flex-wrap justify-between items-start">
                          <div className="flex items-center mb-2 w-full sm:w-auto">
                            <span className={`font-bold text-lg mr-2 ${character.type === 'boss' ? 'text-purple-700' : ''}`}>
                              {character.name}
                            </span>
                            <span className={`text-xs rounded-full px-2 py-1 ${
                              character.type === 'player' ? 'bg-blue-100 text-blue-800' : 
                              character.type === 'boss' ? 'bg-purple-100 text-purple-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {character.type === 'player' ? 'Jogador' : character.type === 'boss' ? 'BOSS' : 'NPC'}
                            </span>
                            {character.playerName && (
                              <span className="ml-1 text-xs bg-green-100 text-green-800 rounded-full px-2 py-1">
                                {character.playerName}
                              </span>
                            )}
                            {character.cr && (
                              <span className="ml-1 text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-1">
                                CR {character.cr}
                              </span>
                            )}
                            {character.hp === 0 && (
                              <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-2 py-1 flex items-center">
                                <Skull className="h-3 w-3 mr-1" />
                                Derrotado
                              </span>
                            )}
                          </div>
                          
                          <div className="flex space-x-1">
                            {canEditCharacter(character) && (
                              <button 
                                onClick={() => startEditingCharacter(character)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Editar personagem"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                            )}
                            {userRole === 'dm' && (
                              <button 
                                onClick={() => removeCombatant(character.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Remover do combate"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Principais características do personagem */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                          <div className="flex items-center">
                            <Heart className={`h-5 w-5 ${character.hp === 0 ? 'text-red-500' : 'text-red-500'} mr-2`} />
                            <div className="flex-1">
                              <div className="h-5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    character.hp / character.maxHp > 0.5 
                                      ? 'bg-green-500' 
                                      : character.hp / character.maxHp > 0.25 
                                        ? 'bg-yellow-500' 
                                        : 'bg-red-500'
                                  }`}
                                  style={{ width: `${(character.hp / character.maxHp) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between mt-1">
                                <div className="flex items-center">
                                  <span className="text-sm font-medium">{character.hp} / {character.maxHp}</span>
                                  {character.hd && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                      HD: {character.hd}
                                    </span>
                                  )}
                                </div>
                                {(canEditCharacter(character) || canEditEnemyHP(character)) && (
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
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <Shield className="h-5 w-5 text-blue-500 mr-2" />
                                <span className="font-medium">CA: {character.ac}</span>
                              </div>
                              <div className="flex items-center">
                                <Feather className="h-5 w-5 text-purple-500 mr-2" />
                                <span className="font-medium">Iniciativa: {character.initiative}</span>
                                {!combatActive && userRole === 'dm' && (
                                  <input 
                                    type="number" 
                                    min="0" 
                                    max="30"
                                    value={character.initiative} 
                                    onChange={(e) => updateInitiative(character.id, e.target.value)}
                                    className="ml-2 w-16 p-1 border rounded text-center"
                                  />
                                )}
                              </div>
                            </div>
                            
                            {/* Estatísticas adicionais */}
                            {(character.perception || character.proficiency || character.speed) && (
                              <div className="grid grid-cols-3 gap-1 text-xs">
                                {character.perception && (
                                  <div className="px-2 py-1 bg-gray-100 rounded text-center">
                                    <span className="font-medium">Percepção: </span>{character.perception}
                                  </div>
                                )}
                                {character.proficiency && (
                                  <div className="px-2 py-1 bg-gray-100 rounded text-center">
                                    <span className="font-medium">Proficiência: </span>+{character.proficiency}
                                  </div>
                                )}
                                {character.speed && (
                                  <div className="px-2 py-1 bg-gray-100 rounded text-center">
                                    <span className="font-medium">Velocidade: </span>{character.speed}
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
                                <span className="text-xs text-gray-500 italic">Nenhuma</span>
                              ) : (
                                character.conditions.map(condition => (
                                  <span 
                                    key={condition} 
                                    className={`text-xs bg-red-100 text-red-800 rounded-full px-2 py-1 flex items-center ${
                                      canEditCharacter(character) ? 'cursor-pointer' : ''
                                    }`}
                                    onClick={() => canEditCharacter(character) && toggleCondition(character.id, condition)}
                                  >
                                    {condition} 
                                    {canEditCharacter(character) && <X className="h-3 w-3 ml-1" />}
                                  </span>
                                ))
                              )}
                              
                              {canEditCharacter(character) && (
                                <select 
                                  value=""
                                  onChange={(e) => {
                                    if (e.target.value) toggleCondition(character.id, e.target.value);
                                    e.target.value = "";
                                  }}
                                  className="text-xs p-1 border rounded bg-white"
                                >
                                  <option value="">+ Adicionar</option>
                                  {CONDITIONS.filter(c => !character.conditions.includes(c)).map(condition => (
                                    <option key={condition} value={condition}>
                                      {condition}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Ataques e habilidades - com opção de colapsar */}
                        {character.attacks && character.attacks.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <div 
                              className="flex items-center mb-2 cursor-pointer" 
                              onClick={() => toggleActionsCollapse(character.id)}
                            >
                              <Sword className="h-5 w-5 text-gray-700 mr-2" />
                              <span className="font-medium">Ataques e Habilidades</span>
                              {collapsedActions[character.id] ? (
                                <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronUp className="ml-2 h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            
                            {!collapsedActions[character.id] && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {character.attacks.map((attack, idx) => (
                                  <div 
                                    key={idx} 
                                    className={`bg-gray-50 hover:bg-gray-100 p-2 rounded border border-gray-200 cursor-pointer transition-colors ${
                                      attack.charges === 0 ? 'opacity-50' : ''
                                    }`}
                                    onClick={() => executeAttack(character.id, attack)}
                                  >
                                    <div className="flex justify-between items-center">
                                      <div className="font-medium text-gray-800">{attack.name}</div>
                                      {attack.charges !== undefined && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                          attack.charges > 0 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                        }`}>
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
                                        Salvaguarda: {attack.saveType} CD {attack.saveDC}
                                      </div>
                                    )}
                                    {attack.notes && (
                                      <div className="text-xs italic mt-1 text-gray-600">{attack.notes}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
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
        
        {/* Botões simplificados para controle de DM durante o combate */}
        {userRole === 'dm' && combatActive && (
          <div className="fixed bottom-4 right-4 space-y-2">
            <button
              onClick={nextTurn}
              className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center w-12 h-12"
              title="Próximo turno"
            >
              <RefreshCw className="w-6 h-6" />
            </button>
            <button
              onClick={endCombat}
              className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center w-12 h-12"
              title="Finalizar combate"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}
        
        {/* Modal de Seleção de Jogador */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
                <h3 className="text-xl font-bold text-gray-800">Selecione quem você é</h3>
                <button 
                  onClick={() => setShowLoginModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <button 
                  onClick={loginAsDM}
                  className="w-full flex items-center p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <UserCheck className="h-8 w-8 text-purple-500 mr-4" />
                  <div className="text-left">
                    <div className="font-bold text-purple-800">Mestre</div>
                    <div className="text-sm text-purple-600">Controle total do jogo</div>
                  </div>
                </button>
                
                {players.map(player => (
                  <button 
                    key={player.id}
                    onClick={() => loginAsPlayer(player.id)}
                    className="w-full flex items-center p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <User className="h-8 w-8 text-blue-500 mr-4" />
                    <div className="text-left">
                      <div className="font-bold text-blue-800">{player.name}</div>
                      <div className="text-sm text-blue-600">Personagem: {player.character}</div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                Escolha seu personagem para editar suas informações e ver o status do combate
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MansionCombatTracker;