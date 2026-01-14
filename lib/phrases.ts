import type { Phrase } from '@/types/exercises';

export const PHRASES: Phrase[] = [
  // Fácil (11 frases)
  { 
    id: 1, 
    level: 'easy', 
    text: 'A lua.', 
    syllables: 'A lu-a.', 
    audioFile: '/audios/A lua.m4a',
    wordTimings: [
      { word: 'A', start: 0, end: 1.0 },
      { word: 'lua.', start: 1.0, end: 2 }
    ]
  },
  { 
    id: 2, 
    level: 'easy', 
    text: 'O pai pega no pão.', 
    syllables: 'O pai pe-ga no pão.', 
    audioFile: '/audios/O pai pega no pão.m4a',
    wordTimings: [
      { word: 'O', start: 0, end: 0.8 },
      { word: 'pai', start: 0.8, end: 1.7 },
      { word: 'pega', start: 1.7, end: 3.0 },
      { word: 'no', start: 3.0, end: 3.8},
      { word: 'pão.', start: 3.8, end: 4.9 }
    ]
  },
  { 
    id: 3, 
    level: 'easy', 
    text: 'A bola é do Pedro.', 
    syllables: 'A bo-la é do Pe-dro.', 
    audioFile: '/audios/A bola é do Pedro.m4a',
    wordTimings: [
      { word: 'A', start: 0, end: 0.6 },
      { word: 'bola', start: 0.6, end: 1.8 },
      { word: 'é', start: 1.7, end: 2.5 },
      { word: 'do', start: 2.3, end: 3.6 },
      { word: 'Pedro.', start: 3.5, end: 5.4 }
    ]
  },
  { 
    id: 4, 
    level: 'easy', 
    text: 'O tapete.', 
    syllables: 'O ta-pe-te.', 
    audioFile: '/audios/O tapete.m4a',
    wordTimings: [
      { word: 'O', start: 0, end: 0.6 },
      { word: 'tapete.', start: 0.5, end: 2.5 }
    ]
  },
  { 
    id: 5, 
    level: 'easy', 
    text: 'A mãe.', 
    syllables: 'A mãe.', 
    audioFile: '/audios/A mãe.m4a',
    wordTimings: [
      { word: 'A', start: 0, end: 0.6 },
      { word: 'mãe.', start: 0.6, end: 1.5 }
    ]
  },
  { 
    id: 6, 
    level: 'easy', 
    text: 'O dedo do pé dói.', 
    syllables: 'O dedo do pé dói.', 
    audioFile: '/audios/O dedo do pé dói.m4a',
    wordTimings: [
      { word: 'O', start: 0, end: 0.6 },
      { word: 'dedo', start: 0.6, end: 1.4 },
      { word: 'do', start: 1.4, end: 2.2 },
      { word: 'pé', start: 2.2, end: 3.0 },
      { word: 'dói.', start: 3.0, end: 4.2 }
    ]
  },
  { 
    id: 7, 
    level: 'easy', 
    text: 'O dado.', 
    syllables: 'O da-do.', 
    audioFile: '/audios/O dado.m4a',
    wordTimings: [
      { word: 'O', start: 0, end: 0.6},
      { word: 'dado.', start: 0.6, end: 1.8 }
    ]
  },
  { 
    id: 8, 
    level: 'easy', 
    text: 'O pato.', 
    syllables: 'O pa-to.', 
    audioFile: '/audios/O pato.m4a',
    wordTimings: [
      { word: 'O', start: 0, end: 0.6},
      { word: 'dado.', start: 0.6, end: 1.8 }
    ]
  },
  { 
    id: 9, 
    level: 'easy', 
    text: 'A pipa voa no céu branco.', 
    syllables: 'A pipa vo-a no céu bran-co.', 
    audioFile: '/audios/A pipa voa no céu branco.m4a',
    wordTimings: [
      { word: 'A', start: 0, end: 1 },
      { word: 'pipa', start: 1, end: 2 },
      { word: 'voa', start: 2, end: 2.8 },
      { word: 'no', start: 2.8, end: 3.4 },
      { word: 'céu', start: 3.4, end: 4.2 },
      { word: 'branco.', start: 4.2, end: 5.2 }
    ]
  },
  { 
    id: 10, 
    level: 'easy', 
    text: 'O bebé dorme no berço.', 
    syllables: 'O be-bé dor-me no ber-ço.', 
    audioFile: '/audios/O bebé dorme no berço.m4a',
    wordTimings: [
      { word: 'O', start: 0, end: 0.8 },
      { word: 'bebé', start: 0.8, end: 1.8 },
      { word: 'dorme', start: 1.8, end: 3.0 },
      { word: 'no', start: 3.0, end: 3.9 },
      { word: 'berço.', start: 3.9, end: 5 }
    ]
  },
  { 
    id: 11, 
    level: 'easy', 
    text: 'O gato.', 
    syllables: 'O ga-to.', 
    audioFile: '/audios/O gato.m4a',
    wordTimings: [
      { word: 'O', start: 0, end: 0.7 },
      { word: 'gato.', start: 0.7, end: 1.5 }
    ]
  },
  
  // Médio (10 frases)
  { 
    id: 12, 
    level: 'medium', 
    text: 'O Pedro pinta uma parede branca.', 
    syllables: 'O Pe-dro pin-ta u-ma pa-re-de bran-ca.', 
    audioFile: '/audios/O Pedro pinta uma parede branca..m4a',
    wordTimings: [
      { word: 'O', start: 0, end: 0.4 },
      { word: 'Pedro', start: 0.4, end: 1.4 },
      { word: 'pinta', start: 1.4, end: 2.6 },
      { word: 'uma', start: 2.6, end: 3.2 },
      { word: 'parede', start: 3.2, end: 4.2 },
      { word: 'branca.', start: 4.2, end: 5.2 }
    ]
  },
  { 
    id: 13, 
    level: 'medium', 
    text: 'A bicicleta brilha ao sol.', 
    syllables: 'A bi-ci-cle-ta bri-lha ao sol.', 
    audioFile: '/audios/A bicicleta brilha ao sol.m4a',
    wordTimings: [
      { word: 'A', start: 0, end: 0.8 },
      { word: 'bicicleta', start: 0.8, end: 2.3 },
      { word: 'brilha', start: 2.3, end: 3.3 },
      { word: 'ao', start: 3.3, end: 4.0 },
      { word: 'sol.', start: 4.0, end: 4.7 }
    ]
  },
  { 
    id: 14, 
    level: 'medium', 
    text: 'A Dora desenha um pássaro belo no seu caderno.', 
    syllables: 'A Do-ra de-se-nha um pás-sa-ro be-lo no seu ca-der-no.', 
    audioFile: '/audios/A Dora desenha um pássaro belo no seu caderno.m4a',
    wordTimings: [
      { word: 'A', start: 0, end: 0.7 },
      { word: 'Dora', start: 0.7, end: 1.7 },
      { word: 'desenha', start: 1.7, end: 2.8 },
      { word: 'um', start: 2.8, end: 3.6 },
      { word: 'pássaro', start: 3.6, end: 4.7 },
      { word: 'belo', start: 4.9, end: 5.7 },
      { word: 'no', start: 5.7, end: 6.4 },
      { word: 'seu', start: 6.4, end: 7.2 },
      { word: 'caderno.', start: 7.2, end: 8.1 }
    ]
  },
  { 
    id: 15, 
    level: 'medium', 
    text: 'O padeiro prepara o pão bem dourado.', 
    syllables: 'O pa-dei-ro pre-pa-ra o pão bem dou-ra-do.', 
    audioFile: '/audios/O padeiro prepara o pão bem dourado.m4a',
    wordTimings: [
      { word: 'O', start: 0, end: 0.9 },
      { word: 'padeiro', start: 0.9, end: 1.9 },
      { word: 'prepara', start: 1.9, end: 2.9 },
      { word: 'o', start: 2.9, end: 3.6 },
      { word: 'pão', start: 3.6, end: 4.3 },
      { word: 'bem', start: 4.3, end: 5.0 },
      { word: 'dourado.', start: 5.0, end: 6.3 }
    ]
  },
  { 
    id: 16, 
    level: 'medium', 
    text: 'A banda tocou uma peça bem divertida.', 
    syllables: 'A ban-da to-cou u-ma pe-ça bem di-ver-ti-da.', 
    audioFile: '/audios/A banda tocou uma peça bem divertida.m4a',
    wordTimings: [
      { word: 'A', start: 0, end: 0.9 },
      { word: 'banda', start: 0.9, end: 2.2 },
      { word: 'tocou', start: 2.2, end: 3.3 },
      { word: 'uma', start: 3.3, end: 4.1 },
      { word: 'peça', start: 4.1, end: 5.0 },
      { word: 'bem', start: 5.0, end: 5.7 },
      { word: 'divertida.', start: 5.7, end: 7.5 }
    ]
  },
  { 
    id: 17, 
    level: 'medium', 
    text: 'O bombeiro bravo apaga o fogo com a sua poderosa mangueira.', 
    syllables: 'O bom-bei-ro bra-vo a-pa-ga o fo-go com a su-a po-de-ro-sa man-guei-ra.', 
    audioFile: '/audios/O bombeiro bravo apaga o fogo com a sua poderosa mangueira.m4a',
    wordTimings: [
      { word: 'O', start: 0, end: 0.9},
      { word: 'bombeiro', start: 0.9, end: 2.0 },
      { word: 'bravo', start: 2.0, end: 3.1 },
      { word: 'apaga', start: 3.1, end: 4.4 },
      { word: 'o', start: 4.4, end: 5.2 },
      { word: 'fogo', start: 5.2, end: 6.3 },
      { word: 'com', start: 6.3, end: 7.4 },
      { word: 'a', start: 7.4, end: 8.2 },
      { word: 'sua', start: 8.2, end: 9.2 },
      { word: 'poderosa', start: 9.2, end: 10.6 },
      { word: 'mangueira.', start: 10.6, end: 11.8 }
    ]
  },
  { 
    id: 18, 
    level: 'medium', 
    text: 'A decisão de participar no desfile foi bem pensada e divertida.', 
    syllables: 'A de-ci-são de par-ti-ci-par no des-fi-le foi bem pen-sa-da e di-ver-ti-da.', 
    audioFile: '/audios/A decisão de participar no desfile foi bem pensada e divertida.m4a',
    wordTimings: [
      { word: 'A', start: 0, end: 1 },
      { word: 'decisão', start: 1, end: 2.3 },
      { word: 'de', start: 2.3, end: 3.2 },
      { word: 'participar', start: 3.2, end: 4.6 },
      { word: 'no', start: 4.6, end: 5.5 },
      { word: 'desfile', start: 5.5, end: 6.5 },
      { word: 'foi', start: 6.5, end: 7.5 },
      { word: 'bem', start: 7.5, end: 8.4 },
      { word: 'pensada', start: 8.4, end: 9.4 },
      { word: 'e', start: 9.0, end: 9.9 },
      { word: 'divertida.', start: 9.9, end: 11.4 }
    ]
  },
  { 
    id: 19, 
    level: 'medium', 
    text: 'Os pássaros pousam nos ramos e cantam belíssimas melodias.', 
    syllables: 'Os pás-sa-ros pou-sam nos ra-mos e can-tam be-lís-si-mas me-lo-di-as.', 
    audioFile: '/audios/Os pássaros pousam nos ramos e cantam belíssimas melodias.m4a',
    wordTimings: [
      { word: 'Os', start: 0, end: 1 },
      { word: 'pássaros', start: 1, end: 2.5 },
      { word: 'pousam', start: 2.5, end: 3.6 },
      { word: 'nos', start: 3.6, end: 4.3 },
      { word: 'ramos', start: 4.3, end: 5.4 },
      { word: 'e', start: 5.4, end: 6.2 },
      { word: 'cantam', start: 6.2, end: 7.2 },
      { word: 'belíssimas', start: 7.2, end: 8.7 },
      { word: 'melodias.', start: 8.7, end: 10.4 }
    ]
  },
  { 
    id: 20, 
    level: 'medium', 
    text: 'O jardim tem diversas plantas e flores.', 
    syllables: 'O jar-dim tem di-ver-sas plan-tas e flo-res.', 
    audioFile: '/audios/O jardim tem diversas plantas e flores.m4a',
    wordTimings: [
      { word: 'O', start: 0, end: 1 },
      { word: 'jardim', start: 1, end: 2.2 },
      { word: 'tem', start: 2.2, end: 3.2 },
      { word: 'diversas', start: 3.2, end: 4.4 },
      { word: 'plantas', start: 4.4, end: 5.6 },
      { word: 'e', start: 5.6, end: 6.5 },
      { word: 'flores.', start: 6.5, end: 7.6 }
    ]
  },
  { 
    id: 21, 
    level: 'medium', 
    text: 'O diretor pediu paciência a todos para o projeto de Estudo do Meio.', 
    syllables: 'O di-re-tor pe-diu pa-ci-ên-cia a to-dos pa-ra o pro-je-to de es-tu-do do mei-o.', 
    audioFile: '/audios/O diretor pediu paciência a todos para o projeto de Estudo do Meio.m4a',
    wordTimings: [
      { word: 'O', start: 0, end: 0.8 },
      { word: 'diretor', start: 0.8, end: 2.3 },
      { word: 'pediu', start: 2.3, end: 3.6 },
      { word: 'paciência', start: 3.6, end: 5.3 },
      { word: 'a', start: 5.3, end: 6.1 },
      { word: 'todos', start: 6.1, end: 7.0 },
      { word: 'para', start: 7.0, end: 8.0 },
      { word: 'o', start: 8.0, end: 8.9 },
      { word: 'projeto', start: 8.9, end: 9.9},
      { word: 'de', start: 9.9, end: 10.7 },
      { word: 'Estudo', start: 10.7, end: 11.7 },
      { word: 'do', start: 11.7, end: 12.4 },
      { word: 'Meio.', start: 12.4, end: 13.9 }
    ]
  },
  
  // Difícil (11 frases)
  { 
    id: 22, 
    level: 'hard', 
    text: 'O projeto pedagógico proposto pela professora Bárbara despertou grande interesse nos alunos.', 
    syllables: 'O pro-je-to pe-da-gógico pro-pos-to pe-la pro-fes-so-ra Bár-ba-ra des-per-tou gran-de in-te-res-se nos a-lu-nos.', 
    audioFile: '/audios/O projeto pedagógico proposto pela professora Bárbara despertou grande interesse nos alunos.m4a',
    wordTimings: [
      { word: 'O', start: 0, end: 1.1 },
      { word: 'projeto', start: 1.1, end: 2.6 },
      { word: 'pedagógico', start: 2.6, end: 4.9 },
      { word: 'proposto', start: 4.9, end: 6.3 },
      { word: 'pela', start: 6.3, end: 7.3 },
      { word: 'professora', start: 7.3, end: 8.9 },
      { word: 'Bárbara', start: 8.9, end: 10.3 },
      { word: 'despertou', start: 10.3, end: 11.8 },
      { word: 'grande', start: 11.8, end: 13.0 },
      { word: 'interesse', start: 13.0, end: 14.3 },
      { word: 'nos', start: 14.3, end: 15.3 },
      { word: 'alunos.', start: 15.3, end: 16.0 }
    ]
  },
  { 
    id: 23, 
    level: 'hard', 
    text: 'A banda popular decidiu preparar um concerto benéfico para a comunidade local.', 
    syllables: 'A ban-da po-pu-lar de-ci-diu pre-pa-rar um con-cer-to be-né-fi-co pa-ra a co-mu-ni-da-de lo-cal.', 
    audioFile: '/audios/A banda popular decidiu preparar um concerto benéfico para a comunidade local.m4a',
    wordTimings: [
      { word: 'A', start: 0, end: 1.0 },
      { word: 'banda', start: 1.0, end: 2.0 },
      { word: 'popular', start: 2.0, end: 3.5 },
      { word: 'decidiu', start: 3.5, end: 4.6 },
      { word: 'preparar', start: 4.6, end: 5.8 },
      { word: 'um', start: 5.8, end: 6.6 },
      { word: 'concerto', start: 6.6, end: 7.5 },
      { word: 'benéfico', start: 7.5, end: 8.5 },
      { word: 'para', start: 8.5, end: 9.3 },
      { word: 'a', start: 9.3, end: 10.3 },
      { word: 'comunidade', start: 10.3, end: 11.7 },
      { word: 'local.', start: 11.7, end: 12.8 }
    ]
  },
  { 
    id: 24, 
    level: 'hard', 
    text: 'O professor Pedro pediu para os alunos desenvolverem um debate sobre a proteção do ambiente.', 
    syllables: 'O pro-fes-sor Pe-dro pe-diu pa-ra os a-lu-nos de-sen-vol-ve-rem um de-ba-te so-bre a pro-te-ção do am-bi-en-te.', 
    audioFile: '/audios/O professor Pedro pediu para os alunos desenvolverem um debate sobre a proteção do ambiente.m4a',
    wordTimings: [
      { word: 'O', start: 0, end: 0.9 },
      { word: 'professor', start: 0.9, end: 1.9 },
      { word: 'Pedro', start: 1.9, end: 2.4 },
      { word: 'pediu', start: 2.4, end: 3.3 },
      { word: 'para', start: 3.6, end: 4.3 },
      { word: 'os', start: 4.3, end: 4.9 },
      { word: 'alunos', start: 4.9, end: 5.8 },
      { word: 'desenvolverem', start: 5.8, end: 7.4 },
      { word: 'um', start: 7.4, end: 8.2 },
      { word: 'debate', start: 8.2, end: 9.2 },
      { word: 'sobre', start: 9.2, end: 10.1 },
      { word: 'a', start: 10.1, end: 10.7 },
      { word: 'proteção', start: 10.7, end: 11.6 },
      { word: 'do', start: 11.6, end: 12.4 },
      { word: 'ambiente.', start: 12.4, end: 13.5 }
    ]
  },
  { 
    id: 25,
    level: 'hard', 
    text: 'A brigada de bombeiros demonstrou profissionalismo ao combater o incêndio com determinação e bravura.', 
    syllables: 'A bri-ga-da de bom-bei-ros de-mons-trou pro-fis-si-o-na-lis-mo ao com-ba-ter o in-cên-dio com de-ter-mi-na-ção e bra-vu-ra.', 
    audioFile: '/audios/A brigada de bombeiros demonstrou profissionalismo ao combater o incêndio com determinação e bravura.m4a',
    wordTimings: [
      { word: 'A', start: 0, end: 1.0 },
      { word: 'brigada', start: 1.0, end: 2.0 },
      { word: 'de', start: 2.0, end: 2.8 },
      { word: 'bombeiros', start: 2.8, end: 3.7 },
      { word: 'demonstrou', start: 3.7, end: 5.1 },
      { word: 'profissionalismo', start: 5.1, end: 7.5 },
      { word: 'ao', start: 7.5, end: 8.3 },
      { word: 'combater', start: 8.3, end: 9.3 },
      { word: 'o', start: 9.3, end: 10.0 },
      { word: 'incêndio', start: 10.0, end: 11.1 },
      { word: 'com', start: 11.1, end: 11.8 },
      { word: 'determinação', start: 11.8, end: 13.4 },
      { word: 'e', start: 13.4, end: 14.2 },
      { word: 'bravura.', start: 14.2, end: 15.2 }
    ]
  },
  { 
    id: 26, 
    level: 'hard', 
    text: 'As descobertas científicas revolucionaram o universo.', 
    syllables: 'As des-co-ber-tas ci-en-tí-fi-cas re-vo-lu-ci-o-na-ram o u-ni-ver-so.', 
    audioFile: '/audios/As descobertas científicas revolucionaram o universo.m4a',
    wordTimings: [
      { word: 'As', start: 0, end: 0.9 },
      { word: 'descobertas', start: 0.9, end: 2.2 },
      { word: 'científicas', start: 2.2, end: 3.8 },
      { word: 'revolucionaram', start: 3.8, end: 5.7 },
      { word: 'o', start: 5.7, end: 6.3 },
      { word: 'universo.', start: 6.3, end: 7.8 }
    ]
  },
  { 
    id: 27, 
    level: 'hard', 
    text: 'A Dália tem um livro de estudo do meio.', 
    syllables: 'A Dá-lia tem um li-vro de es-tu-do do mei-o.', 
    audioFile: '/audios/A Dália tem um livro de estudo do meio.m4a',
    wordTimings: [
      { word: 'A', start: 0, end: 0.8 },
      { word: 'Dália', start: 0.8, end: 1.7 },
      { word: 'tem', start: 1.7, end: 2.4 },
      { word: 'um', start: 2.4, end: 3.0 },
      { word: 'livro', start: 3.0, end: 3.8 },
      { word: 'de', start: 3.8, end: 4.5 },
      { word: 'estudo', start: 4.5, end: 5.4 },
      { word: 'do', start: 5.4, end: 6.1 },
      { word: 'meio.', start: 6.1, end: 7.1 }
    ]
  },
  { 
    id: 28, 
    level: 'hard', 
    text: 'Os pescadores partiram para pescar peixe fresco.', 
    syllables: 'Os pes-ca-do-res par-ti-ram pa-ra pes-car pei-xe fres-co.', 
    audioFile: '/audios/Os pescadores partiram para pescar peixe fresco.m4a',
    wordTimings: [
      { word: 'Os', start: 0, end: 0.9 },
      { word: 'pescadores', start: 0.9, end: 2.0 },
      { word: 'partiram', start: 2.0, end: 3.5 },
      { word: 'para', start: 3.5, end: 4.4 },
      { word: 'pescar', start: 4.4, end: 5.6 },
      { word: 'peixe', start: 5.6, end: 6.7 },
      { word: 'fresco.', start: 6.7, end: 7.6 }
    ]
  },
  { 
    id: 29, 
    level: 'hard', 
    text: 'A beleza do castelo antigo perfurava a névoa matinal projetando uma sombra sobre a paisagem.', 
    syllables: 'A be-le-za do cas-te-lo an-ti-go per-fu-ra-va a né-voa ma-ti-nal, pro-je-tan-do u-ma som-bra so-bre a pai-sa-gem.', 
    audioFile: '/audios/A beleza do castelo antigo perfurava a névoa matinal projetando uma sombra sobre a paisagem.m4a',
    wordTimings: [
      { word: 'A', start: 0, end: 0.8 },
      { word: 'beleza', start: 0.8, end: 2.1 },
      { word: 'do', start: 2.1, end: 3.2 },
      { word: 'castelo', start: 3.2, end: 4.7 },
      { word: 'antigo', start: 4.7, end: 6.0 },
      { word: 'perfurava', start: 6.0, end: 6.9 },
      { word: 'a', start: 6.9, end: 7.6 },
      { word: 'névoa', start: 7.6, end: 9.0 },
      { word: 'matinal', start: 9.0, end: 10.4 },
      { word: 'projetando', start: 10.4, end: 11.8 },
      { word: 'uma', start: 11.8, end: 12.8 },
      { word: 'sombra', start: 12.8, end: 13.9 },
      { word: 'sobre', start: 13.9, end: 14.9 },
      { word: 'a', start: 14.9, end: 15.7 },
      { word: 'paisagem.', start: 15.7, end: 17.1 }
    ]
  },
  { 
    id: 30, 
    level: 'hard', 
    text: 'A decisão do presidente para arranjar o parque público foi bem recebida pela população.', 
    syllables: 'A de-ci-são do pre-si-den-te pa-ra ar-ran-jar o par-que pú-bli-co foi bem re-ce-bi-da pe-la po-pu-la-ção.', 
    audioFile: '/audios/A decisão do presidente para arranjar o parque público foi bem recebida pela população.m4a',
    wordTimings: [
      { word: 'A', start: 0, end: 0.8 },
      { word: 'decisão', start: 0.8, end: 2.2 },
      { word: 'do', start: 2.2, end: 3.1 },
      { word: 'presidente', start: 3.1, end: 4.3 },
      { word: 'para', start: 4.3, end: 5.6 },
      { word: 'arranjar', start: 5.6, end: 7.0 },
      { word: 'o', start: 7.0, end: 7.9 },
      { word: 'parque', start: 7.9, end: 9.3 },
      { word: 'público', start: 9.3, end: 11.2 },
      { word: 'foi', start: 11.2, end: 12.2 },
      { word: 'bem', start: 12.2, end: 13.0 },
      { word: 'recebida', start: 13.0, end: 14.3 },
      { word: 'pela', start: 14.3, end: 15.2 },
      { word: 'população.', start: 15.2, end: 16.8 }
    ]
  },
  { 
    id: 31, 
    level: 'hard', 
    text: 'A delicada dança das borboletas pelo jardim parecia pintar o ar com cores vibrantes.', 
    syllables: 'A de-li-ca-da dan-ça das bor-bo-le-tas pe-lo jar-dim pa-re-ci-a pin-tar o ar com co-res vi-bran-tes.', 
    audioFile: '/audios/A delicada dança das borboletas pelo jardim parecia pintar o ar com cores vibrantes.m4a',
    wordTimings: [
      { word: 'A', start: 0, end: 1.1 },
      { word: 'delicada', start: 1.1, end: 2.7 },
      { word: 'dança', start: 2.7, end: 3.9 },
      { word: 'das', start: 3.9, end: 4.9 },
      { word: 'borboletas', start: 4.9, end: 6.2 },
      { word: 'pelo', start: 6.2, end: 7.3 },
      { word: 'jardim', start: 7.3, end: 8.4 },
      { word: 'parecia', start: 8.4, end: 9.5 },
      { word: 'pintar', start: 9.5, end: 10.6 },
      { word: 'o', start: 10.6, end: 11.4 },
      { word: 'ar', start: 11.4, end: 12.4 },
      { word: 'com', start: 12.4, end: 13.3 },
      { word: 'cores', start: 13.3, end: 14.4 },
      { word: 'vibrantes.', start: 14.4, end: 16.1 }
    ]
  },
  { 
    id: 32, 
    level: 'hard', 
    text: 'O defensor da justiça prometeu lutar pelos direitos dos mais pobres e desfavorecidos da população.', 
    syllables: 'O de-fen-sor da jus-ti-ça pro-me-teu lu-tar pe-los di-rei-tos dos mais po-bres e des-fa-vo-re-ci-dos da po-pu-la-ção.', 
    audioFile: '/audios/O defensor da justiça prometeu lutar pelos direitos dos mais podre e desfavorecidos da população.m4a',
    wordTimings: [
      { word: 'O', start: 0, end: 1.4 },
      { word: 'defensor', start: 1.4, end: 2.7 },
      { word: 'da', start: 2.7, end: 3.8 },
      { word: 'justiça', start: 3.8, end: 5.0 },
      { word: 'prometeu', start: 5.0, end: 6.5 },
      { word: 'lutar', start: 6.5, end: 7.7 },
      { word: 'pelos', start: 7.7, end: 8.8 },
      { word: 'direitos', start: 8.8, end: 10.3 },
      { word: 'dos', start: 10.3, end: 11.3 },
      { word: 'mais', start: 11.3, end: 12.2 },
      { word: 'pobres', start: 12.2, end: 13.2 },
      { word: 'e', start: 13.2, end: 14.1 },
      { word: 'desfavorecidos', start: 14.1, end: 16.2 },
      { word: 'da', start: 16.2, end: 17.1 },
      { word: 'população.', start: 17.1, end: 19.1 }
    ]
  },
];

export function getPhrasesByLevel(level: 'easy' | 'medium' | 'hard'): Phrase[] {
  return PHRASES.filter(phrase => phrase.level === level);
}
