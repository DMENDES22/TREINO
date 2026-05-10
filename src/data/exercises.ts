import { Exercise } from '../types';

export const EXERCISES: Exercise[] = [
  // PEITO
  {
    id: 'chest_1',
    name: 'Supino Reto',
    category: 'Peito',
    description: 'O exercício fundamental para o desenvolvimento do peitoral maior.',
    instructions: [
      'Deite-se no banco reto com os pés apoiados no chão.',
      'Segure a barra com uma pegada um pouco mais larga que os ombros.',
      'Desça a barra até tocar levemente o peito.',
      'Empurre a barra de volta à posição inicial.'
    ],
    muscles: ['Peitoral Maior', 'Tríceps', 'Deltoide Anterior'],
    equipment: 'Barra e Banco',
    gifUrl: ''
  },
  {
    id: 'chest_2',
    name: 'Supino Inclinado',
    category: 'Peito',
    description: 'Foco na porção superior do peitoral.',
    instructions: ['Ajuste o banco em 45 graus.', 'Desça a barra até a parte superior do peito.', 'Empurre de volta.'],
    muscles: ['Peitoral Superior', 'Deltoide Anterior'],
    equipment: 'Barra e Banco Inclinado',
    gifUrl: ''
  },
  {
    id: 'chest_3',
    name: 'Crucifixo',
    category: 'Peito',
    description: 'Isolamento para alongamento do peitroral.',
    instructions: ['Deite no banco com halteres.', 'Abra os braços lateralmente com leve flexão no cotovelo.', 'Feche os braços acima do peito.'],
    muscles: ['Peitoral Maior'],
    equipment: 'Halteres',
    gifUrl: ''
  },
  {
    id: 'chest_4',
    name: 'Crossover',
    category: 'Peito',
    description: 'Exercício em polia para tensão constante.',
    instructions: ['Segure as polias altas.', 'Incline o tronco levemente.', 'Traga as mãos à frente do corpo.'],
    muscles: ['Peitoral'],
    equipment: 'Polia',
    gifUrl: ''
  },
  {
    id: 'chest_5',
    name: 'Pullover',
    category: 'Peito',
    description: 'Expansão de caixa torácica e peitoral.',
    instructions: ['Deite atravessado no banco.', 'Segure um halter com as duas mãos.', 'Leve o halter atrás da cabeça e volte ao peito.'],
    muscles: ['Peitoral', 'Latíssimo'],
    equipment: 'Halter',
    gifUrl: ''
  },

  // COSTAS
  {
    id: 'back_1',
    name: 'Barra Fixa',
    category: 'Costas',
    description: 'O melhor exercício para costas com peso corporal.',
    instructions: ['Segure na barra com pegada ampla.', 'Puxe o corpo até o queixo passar da barra.'],
    muscles: ['Latíssimo do Dorso', 'Bíceps'],
    equipment: 'Barra Fixa',
    gifUrl: ''
  },
  {
    id: 'back_2',
    name: 'Puxada Frontal',
    category: 'Costas',
    description: 'Simulação da barra fixa no pulley.',
    instructions: ['Sente-se no puxador.', 'Puxe a barra em direção ao peito.'],
    muscles: ['Dorsais', 'Bíceps'],
    equipment: 'Pulley',
    gifUrl: ''
  },
  {
    id: 'back_3',
    name: 'Remada Curvada',
    category: 'Costas',
    description: 'Espessura de costas.',
    instructions: ['Incline o tronco.', 'Puxe a barra em direção ao umbigo.'],
    muscles: ['Dorsais', 'Trapézio', 'Bíceps'],
    equipment: 'Barra',
    gifUrl: ''
  },
  {
    id: 'back_4',
    name: 'Remada Baixa',
    category: 'Costas',
    description: 'Remada na polia baixa.',
    instructions: ['Sente-se e apoie os pés.', 'Puxe o triângulo em direção ao abdômen.'],
    muscles: ['Dorsais', 'Romboides'],
    equipment: 'Polia',
    gifUrl: ''
  },
  {
    id: 'back_5',
    name: 'Remada Unilateral',
    category: 'Costas',
    description: 'Também conhecido como serrote.',
    instructions: ['Apoie um joelho e mão no banco.', 'Puxe o halter com o outro braço.'],
    muscles: ['Dorsais'],
    equipment: 'Halter',
    gifUrl: ''
  },
  {
    id: 'back_6',
    name: 'Levantamento Terra',
    category: 'Costas',
    description: 'Exercício composto fundamental para força e densidade.',
    instructions: ['Mantenha as costas retas.', 'Tire a barra do chão estendendo o quadril e joelhos.'],
    muscles: ['Dorsais', 'Lombar', 'Glúteos', 'Isquiotibiais'],
    equipment: 'Barra',
    gifUrl: ''
  },

  // OMBROS
  {
    id: 'shoulders_1',
    name: 'Desenvolvimento Militar',
    category: 'Ombros',
    description: 'Força bruta para ombros.',
    instructions: ['Em pé ou sentado.', 'Empurre a barra acima da cabeça.'],
    muscles: ['Deltoides', 'Tríceps'],
    equipment: 'Barra',
    gifUrl: ''
  },
  {
    id: 'shoulders_2',
    name: 'Elevação Lateral',
    category: 'Ombros',
    description: 'Foco no deltoide lateral (largura).',
    instructions: ['Em pé, leve os halteres lateralmente até a altura dos ombros.'],
    muscles: ['Deltoide Lateral'],
    equipment: 'Halteres',
    gifUrl: ''
  },
  {
    id: 'shoulders_3',
    name: 'Elevação Frontal',
    category: 'Ombros',
    description: 'Foco no deltoide anterior.',
    instructions: ['Leve os halteres à frente até a altura dos ombros.'],
    muscles: ['Deltoide Anterior'],
    equipment: 'Halteres',
    gifUrl: ''
  },
  {
    id: 'shoulders_4',
    name: 'Face Pull',
    category: 'Ombros',
    description: 'Saúde r ombro e deltoide posterior.',
    instructions: ['Puxe a corda em direção ao rosto, abrindo os cotovelos.'],
    muscles: ['Deltoide Posterior', 'Trapézio'],
    equipment: 'Polia',
    gifUrl: ''
  },
  {
    id: 'shoulders_5',
    name: 'Encolhimento',
    category: 'Ombros',
    description: 'Foco no trapézio.',
    instructions: ['Segure halteres ou barra e eleve os ombros.'],
    muscles: ['Trapézio'],
    equipment: 'Barra/Halter',
    gifUrl: ''
  },

  // BICEPS
  {
    id: 'biceps_1',
    name: 'Rosca Direta',
    category: 'Bíceps',
    description: 'Clássico para bíceps.',
    instructions: ['Flexione os braços trazendo a barra ao peito.'],
    muscles: ['Bíceps'],
    equipment: 'Barra W/Reta',
    gifUrl: ''
  },
  {
    id: 'biceps_2',
    name: 'Rosca Martelo',
    category: 'Bíceps',
    description: 'Foco no braquiorradial e braquial.',
    instructions: ['Pegada neutra (palmas viradas uma para a outra).'],
    muscles: ['Bíceps', 'Braquial'],
    equipment: 'Halteres',
    gifUrl: ''
  },
  {
    id: 'biceps_3',
    name: 'Rosca Scott',
    category: 'Bíceps',
    description: 'Isolamento total do bíceps.',
    instructions: ['Apoie os braços no banco Scott.'],
    muscles: ['Bíceps'],
    equipment: 'Banco Scott',
    gifUrl: ''
  },
  {
    id: 'biceps_4',
    name: 'Rosca Concentrada',
    category: 'Bíceps',
    description: 'Pico do bíceps.',
    instructions: ['Sentado, apoie o cotovelo na coxa.'],
    muscles: ['Bíceps'],
    equipment: 'Halter',
    gifUrl: ''
  },

  // TRICEPS
  {
    id: 'triceps_1',
    name: 'Tríceps Pulley',
    category: 'Tríceps',
    description: 'Extensão de cotovelo na polia.',
    instructions: ['Estenda os braços para baixo na polia.'],
    muscles: ['Tríceps'],
    equipment: 'Polia',
    gifUrl: ''
  },
  {
    id: 'triceps_2',
    name: 'Tríceps Francês',
    category: 'Tríceps',
    description: 'Extensão acima da cabeça.',
    instructions: ['Leve o halter atrás da cabeça e estenda.'],
    muscles: ['Tríceps (Cabeça Longa)'],
    equipment: 'Halter',
    gifUrl: ''
  },
  {
    id: 'triceps_3',
    name: 'Tríceps Testa',
    category: 'Tríceps',
    description: 'Extensão deitado.',
    instructions: ['Deitado, leve a barra até a testa e estenda.'],
    muscles: ['Tríceps'],
    equipment: 'Barra EZ',
    gifUrl: ''
  },
  {
    id: 'triceps_4',
    name: 'Mergulho nas Paralelas',
    category: 'Tríceps',
    description: 'Poderoso para tríceps e peito inferior.',
    instructions: ['Desça o corpo entre as barras paralelas.'],
    muscles: ['Tríceps', 'Peitoral'],
    equipment: 'Paralelas',
    gifUrl: ''
  },

  // PERNAS E GLUTEOS
  {
    id: 'legs_1',
    name: 'Agachamento Livre',
    category: 'Pernas',
    description: 'Rei dos exercícios de perna.',
    instructions: ['Agache com a barra nas costas.'],
    muscles: ['Quadríceps', 'Glúteos'],
    equipment: 'Barra',
    gifUrl: ''
  },
  {
    id: 'legs_2',
    name: 'Leg Press',
    category: 'Pernas',
    description: 'Empurre a plataforma.',
    instructions: ['Posicione os pés e empurre.'],
    muscles: ['Quadríceps', 'Glúteos'],
    equipment: 'Máquina Leg Press',
    gifUrl: ''
  },
  {
    id: 'legs_3',
    name: 'Cadeira Extensora',
    category: 'Pernas',
    description: 'Isolamento de quadríceps.',
    instructions: ['Estenda as pernas na máquina.'],
    muscles: ['Quadríceps'],
    equipment: 'Cadeira Extensora',
    gifUrl: ''
  },
  {
    id: 'legs_4',
    name: 'Mesa Flexora',
    category: 'Pernas',
    description: 'Isolamento de posterior de coxa.',
    instructions: ['Flexione as pernas deitado.'],
    muscles: ['Isquiotibiais'],
    equipment: 'Mesa Flexora',
    gifUrl: ''
  },
  {
    id: 'legs_5',
    name: 'Stiff',
    category: 'Pernas',
    description: 'Foco em posterior e glúteo.',
    instructions: ['Desça a barra com pernas semi-estendidas.'],
    muscles: ['Isquiotibiais', 'Glúteo'],
    equipment: 'Barra',
    gifUrl: ''
  },
  {
    id: 'legs_6',
    name: 'Passada',
    category: 'Pernas',
    description: 'Avanço caminhando.',
    instructions: ['Dê um passo à frente e agache.'],
    muscles: ['Quadríceps', 'Glúteos'],
    equipment: 'Halteres',
    gifUrl: ''
  },
  {
    id: 'legs_7',
    name: 'Afundo',
    category: 'Pernas',
    description: 'Agachamento unilateral estático.',
    instructions: ['Um pé à frente, outro atrás, agache verticalmente.'],
    muscles: ['Glúteos', 'Quadríceps'],
    equipment: 'Barra/Halter',
    gifUrl: ''
  },
  {
    id: 'legs_8',
    name: 'Elevação Pélvica',
    category: 'Glúteos',
    description: 'Melhor exercício para glúteos.',
    instructions: ['Apoie as costas no banco e eleve o quadril com peso.'],
    muscles: ['Glúteo Máximo'],
    equipment: 'Barra e Banco',
    gifUrl: ''
  },
  {
    id: 'legs_9',
    name: 'Panturrilha em Pé',
    category: 'Panturrilha',
    description: 'Foco no gastrocnêmio.',
    instructions: ['Eleve os calcanhares.'],
    muscles: ['Gastrocnêmio'],
    equipment: 'Máquina/Degrau',
    gifUrl: ''
  },
  {
    id: 'legs_10',
    name: 'Panturrilha Sentado',
    category: 'Panturrilha',
    description: 'Foco no sóleo.',
    instructions: ['Sentado, eleve os calcanhares com peso nos joelhos.'],
    muscles: ['Sóleo'],
    equipment: 'Máquina Panturrilha',
    gifUrl: ''
  },

  // CORE
  {
    id: 'core_1',
    name: 'Abdominal Infra',
    category: 'Abdômen',
    description: 'Foco na parte inferior do abdômen.',
    instructions: ['Deitado, eleve as pernas estendidas.'],
    muscles: ['Abdômen Inferior'],
    equipment: 'Solo/Banco',
    gifUrl: ''
  },
  {
    id: 'core_2',
    name: 'Prancha',
    category: 'Abdômen',
    description: 'Isometria para o core.',
    instructions: ['Mantenha o corpo reto apoiado nos antebraços.'],
    muscles: ['Transverso do Abdômen', 'Core'],
    equipment: 'Solo',
    gifUrl: ''
  },
  {
    id: 'core_3',
    name: 'Abdominal na Polia',
    category: 'Abdômen',
    description: 'Abdominal com carga.',
    instructions: ['Ajoelhado, puxe a corda da polia alta flexionando o tronco.'],
    muscles: ['Reto Abdominal'],
    equipment: 'Polia',
    gifUrl: ''
  }
];
