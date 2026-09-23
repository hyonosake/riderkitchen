import type { MenuCategory, MenuSet } from './types'

import omeletteSpinachPotato from '../assets/menu/omelette-spinach-potato.webp'
import syrniki from '../assets/menu/syrniki.webp'
import croissantSalmon from '../assets/menu/croissant-salmon.webp'
import croissantChocolate from '../assets/menu/croissant-chocolate.webp'
import saladJamonPearGorgonzola from '../assets/menu/salad-jamon-pear-gorgonzola.webp'
import saladGreenZucchiniBroccoli from '../assets/menu/salad-green-zucchini-broccoli.webp'
import saladKenyanBeansTonnato from '../assets/menu/salad-kenyan-beans-tonnato.webp'
import falafelSpinachHummus from '../assets/menu/falafel-spinach-hummus.webp'
import hummusClassic from '../assets/menu/hummus-classic.webp'
import soupChickenNoodle from '../assets/menu/soup-chicken-noodle.webp'
import soupBorscht from '../assets/menu/soup-borscht.webp'
import soupThai from '../assets/menu/soup-thai.webp'
import hotShrimpBabyPotato from '../assets/menu/hot-shrimp-baby-potato.webp'
import hotBeefStroganoffRice from '../assets/menu/hot-beef-stroganoff-rice.webp'
import hotBeefStroganoffMash from '../assets/menu/hot-beef-stroganoff-mash.webp'
import hotOrzoShrimp from '../assets/menu/hot-orzo-shrimp.webp'
import pokeShrimp from '../assets/menu/poke-shrimp.webp'
import pokeSalmon from '../assets/menu/poke-salmon.webp'
import boiledEggsShrimpTomato from '../assets/menu/boiled-eggs-shrimp-tomato.webp'
import croissantChickenCheese from '../assets/menu/croissant-chicken-cheese.webp'
import omeletteOysterMushroomPesto from '../assets/menu/omelette-oyster-mushroom-pesto.webp'
import sandwichMortadella from '../assets/menu/sandwich-mortadella.webp'
import omeletteTomatoParmesan from '../assets/menu/omelette-tomato-parmesan.webp'
import duckPateBrioche from '../assets/menu/duck-pate-brioche.webp'
import caesarSalad from '../assets/menu/caesar-salad.webp'
import artichokeSalad from '../assets/menu/artichoke-salad.webp'
import duckSalad from '../assets/menu/duck-salad.webp'
import greekSaladPita from '../assets/menu/greek-salad-pita.webp'
import beefSalad from '../assets/menu/beef-salad.webp'
import pokeChicken from '../assets/menu/poke-chicken.webp'
import pokeVegan from '../assets/menu/poke-vegan.webp'
import gazpachoStracciatella from '../assets/menu/gazpacho-stracciatella.webp'
import pastaTomatoVegan from '../assets/menu/pasta-tomato-vegan.webp'
import cauliflowerSteakVegan from '../assets/menu/cauliflower-steak-vegan.webp'
import seabassBroccoliSpinach from '../assets/menu/seabass-broccoli-spinach.webp'
import salmonRice from '../assets/menu/salmon-rice.webp'
import salmonBroccoliSpinach from '../assets/menu/salmon-broccoli-spinach.webp'
import beefPepperSaucePotato from '../assets/menu/beef-pepper-sauce-potato.webp'
import chickenCutletsTomatoSalsa from '../assets/menu/chicken-cutlets-tomato-salsa.webp'
import chickenLemonMash from '../assets/menu/chicken-lemon-mash.webp'
import chickenBreastZucchini from '../assets/menu/chicken-breast-zucchini.webp'
import fishInBatterRice from '../assets/menu/fish-in-batter-rice.webp'
import set1 from '../assets/menu/set-1.webp'
import set2 from '../assets/menu/set-2.webp'
import set3 from '../assets/menu/set-3.webp'
import set4 from '../assets/menu/set-4.webp'
import set5 from '../assets/menu/set-5.webp'
import setVegan from '../assets/menu/set-vegan.webp'

// Контент выгружен вручную с https://riderkitchen.ru/ (публичная версия,
// доступа к исходникам/админке нет). Фото есть у всех блюд, кроме
// гарниров и напитков — так и на исходном сайте. Часть фото на сайте
// названа не по блюду (обработаны в MagicEraser/Bazaart) — сопоставлены
// по порядку в разметке (фото идёт прямо перед названием блюда).
//
// ВАЖНО про calories: на оригинале КБЖУ нет. Цифры ниже — приблизительная
// оценка по составу блюда (основной белок + гарнир + соусы), чтобы
// показать механику. Показать владельцу и заменить лабораторными
// значениями, когда появятся.
export const menu: MenuCategory[] = [
  {
    id: 'breakfast',
    title: 'Завтраки',
    dishes: [
      {
        name: 'Омлет, шпинат, бейби картофель',
        description:
          'Яйца, мини-картофель, шпинат, соль, перец, соус песто-базилик, зеленый лук',
        price: 450,
        calories: 480,
        image: omeletteSpinachPotato,
      },
      {
        name: 'Сырники, сметана/джем',
        description: 'Творог, мука, яйцо',
        price: 360,
        calories: 520,
        image: syrniki,
      },
      {
        name: 'Круассан с лососем, сырный мусс',
        description: 'Круассан классический, слабосолёный лосось, сырный мусс, шпинат',
        price: 490,
        calories: 510,
        image: croissantSalmon,
      },
      {
        name: 'Вареные яйца, креветки, томаты',
        description: 'Вареные яйца, томаты, креветки, микс салата',
        price: 490,
        calories: 380,
        image: boiledEggsShrimpTomato,
      },
      {
        name: 'Круассан, цыпленок, сыр',
        description: 'Круассан, куриное филе, сырный мусс, шпинат',
        price: 490,
        calories: 540,
        image: croissantChickenCheese,
      },
      {
        name: 'Омлет, вешенки, песто',
        description:
          'Яйца, грибы вешенки, мини-картофель, вяленые томаты, соус песто, зелень, соль, перец',
        price: 450,
        calories: 460,
        image: omeletteOysterMushroomPesto,
      },
      {
        name: 'Сэндвич с мортаделлой',
        description: 'Мортаделла, чеддер, сырный мусс, шпинат, тостовый хлеб',
        price: 490,
        calories: 560,
        image: sandwichMortadella,
      },
      {
        name: 'Омлет, томаты, пармезан',
        description: 'Омлет, томаты, пармезан, микс салата',
        price: 490,
        calories: 470,
        image: omeletteTomatoParmesan,
      },
      {
        name: 'Круассан с шоколадом, арахисовой пастой',
        description: 'Круассан, шоколадная паста, арахисовая паста, банан',
        price: 420,
        calories: 620,
        image: croissantChocolate,
      },
    ],
  },
  {
    id: 'salads',
    title: 'Салаты и закуски',
    dishes: [
      {
        name: 'Фалафель, шпинат, хумус',
        description:
          'Хумус (нут, чеснок, тахини, фреш лимона, соль, перец, оливковое масло), фалафель (шарики из нута в панировке), шпинат, редис, огурец, помидор, соус',
        price: 590,
        calories: 620,
        image: falafelSpinachHummus,
      },
      {
        name: 'Зеленый салат с цукини и брокколи',
        description:
          'Микс свежей зелени, цукини, бобы эдамаме, капуста краснокочанная, брокколи, огурец, соус сукияки на основе соевого соуса, кунжут',
        price: 490,
        calories: 320,
        image: saladGreenZucchiniBroccoli,
      },
      {
        name: 'Паштет из утки, бриошь',
        description: 'Нежный паштет из филе утки, подается с булочкой бриошь и азиатским соусом',
        price: 590,
        calories: 580,
        image: duckPateBrioche,
      },
      {
        name: 'Салат Цезарь',
        description: 'Айсберг, романо, курица, помидоры черри, сухарики, соус цезарь, пармезан',
        price: 490,
        calories: 450,
        image: caesarSalad,
      },
      {
        name: 'Хумус классический, овощи',
        description:
          'Хумус (нут, чеснок, тахини, фреш лимона, соль, перец, оливковое масло), оливковое масло, семечки, огурец, морковь, микрозелень',
        price: 450,
        calories: 420,
        image: hummusClassic,
      },
      {
        name: 'Салат с артишоком и овощами',
        description:
          'Баклажан, перец болгарский, оливки, романо, руккола, артишоки, сырный крем-мусс, масло оливковое, соль, перец с/м, лук маринованный',
        price: 490,
        calories: 380,
        tags: ['min5portions'],
        image: artichokeSalad,
      },
      {
        name: 'Кенийская фасоль, соус тоннато',
        description: 'Фасоль, соус из тунца, пармезан, смесь фурикаке, лук зеленый',
        price: 450,
        calories: 360,
        tags: ['min5portions'],
        image: saladKenyanBeansTonnato,
      },
      {
        name: 'Салат с уткой',
        description:
          'Филе утки, рикотта, вешенки, шпинат, руккола, сельдерей, имбирь, лук зеленый, демиглас, кунжутная заправка',
        price: 590,
        calories: 480,
        image: duckSalad,
      },
      {
        name: 'Салат с хамоном, грушей, муссом горгонзола',
        description:
          'Салат с грушей, хамоном, легким фиш-соусом и муссом из горгонзолы (с креметте и сиртаки)',
        price: 590,
        calories: 520,
        image: saladJamonPearGorgonzola,
      },
      {
        name: 'Салат греческий с питой',
        description:
          'Болгарский перец, огурцы, помидоры, оливки, маслины, сыр сиртаки, орегано, масло оливковое, пита',
        price: 490,
        calories: 420,
        image: greekSaladPita,
      },
      {
        name: 'Салат с говядиной',
        description:
          'Микс зелени, битые огурцы, фасоль стручковая, говяжья вырезка, оливковое масло, смесь фурикаке',
        price: 890,
        calories: 460,
        image: beefSalad,
      },
    ],
  },
  {
    id: 'poke',
    title: 'Поке',
    dishes: [
      {
        name: 'Поке лосось',
        description:
          'Лосось, дикий рис, авокадо, капуста краснокочанная, битые огурцы, кукуруза, кунжут, ореховый соус',
        price: 690,
        calories: 640,
        image: pokeSalmon,
      },
      {
        name: 'Поке креветки',
        description:
          'Рис, креветки, цукини, авокадо, шпинат, шиитаке, спайси соус, кунжут, масло оливковое, соль, перец с/м',
        price: 690,
        calories: 560,
        image: pokeShrimp,
      },
      {
        name: 'Поке курица',
        description:
          'Рис, бедро куриное, терияки, кунжут, томаты, шпинат, огурец, бобы эдамаме, кукуруза, масло оливковое, соль, перец с/м, соус имбирный',
        price: 590,
        calories: 620,
        image: pokeChicken,
      },
      {
        name: 'Веган поке',
        description:
          'Киноа отварная, огурцы, авокадо, цукини, помидоры, шпинат, соус понзу с постным майонезом, кинза, лук зеленый',
        price: 640,
        calories: 520,
        tags: ['vegan'],
        image: pokeVegan,
      },
    ],
  },
  {
    id: 'soups',
    title: 'Супы',
    dishes: [
      {
        name: 'Куриный суп с лапшой',
        description:
          'Куриный бульон, курица отварная, лапша собственного приготовления, соль, перец, петрушка',
        price: 360,
        calories: 320,
        image: soupChickenNoodle,
      },
      {
        name: 'Тайский суп',
        description:
          'Белый лук, лимонник, имбирь, чеснок, листья лайма, кинза, кокосовое молоко, фиш-соус, лимонный сок, креветки, рис, грибы шиитаке',
        price: 660,
        calories: 480,
        image: soupThai,
      },
      {
        name: 'Гаспачо со страчателлой',
        description:
          'Томаты, огурец, красный лук, болгарский перец, кинза, сельдерей, базилик, масло оливковое, соль, перец, страчателла',
        price: 640,
        calories: 320,
        tags: ['seasonal'],
        image: gazpachoStracciatella,
      },
      {
        name: 'Борщ',
        description:
          'Говядина, капуста б/к, лук, морковь, свекла, картофель, томатная паста, чеснок, соль, лавровый лист, перец, зелень, сметана',
        price: 640,
        calories: 420,
        image: soupBorscht,
      },
    ],
  },
  {
    id: 'hot',
    title: 'Горячее',
    dishes: [
      {
        name: 'Бефстроганов, картофельное пюре',
        description:
          'Говяжья вырезка, растительное масло, белый лук, вешенки, сливки, соус демиглас, чеснок, петрушка, картофельное пюре',
        price: 790,
        calories: 720,
        image: hotBeefStroganoffMash,
      },
      {
        name: 'Креветки, бейби картофель, спайси соус',
        description:
          'Картофель отварной и креветки, обжаренные на растительном масле, чеснок и тимьян, черный перец (горошек), соус креметте, зеленый лук, пармезан',
        price: 590,
        calories: 560,
        image: hotShrimpBabyPotato,
      },
      {
        name: 'Паста с томатами',
        description: 'Паста, томатная паста, вяленые томаты, оливки',
        price: 590,
        calories: 540,
        tags: ['vegan'],
        image: pastaTomatoVegan,
      },
      {
        name: 'Стейк из цветной капусты',
        description:
          'Цветная капуста, соус васаби, микрозелень, кунжут, масло оливковое, масло растительное, чеснок, тимьян',
        price: 620,
        calories: 320,
        tags: ['vegan'],
        image: cauliflowerSteakVegan,
      },
      {
        name: 'Сибас, брокколи, шпинат',
        description: 'Сибас на гриле, брокколи, шпинат, лайм',
        price: 890,
        calories: 480,
        image: seabassBroccoliSpinach,
      },
      {
        name: 'Лосось, рис',
        description: 'Филе лосося, рис',
        price: 790,
        calories: 680,
        image: salmonRice,
      },
      {
        name: 'Лосось, брокколи, шпинат',
        description: 'Филе лосося, брокколи, шпинат, лайм',
        price: 890,
        calories: 560,
        image: salmonBroccoliSpinach,
      },
      {
        name: 'Говядина, перечный соус, бейби картофель',
        description: 'Говядина, перечный соус, бейби картофель',
        price: 890,
        calories: 720,
        image: beefPepperSaucePotato,
      },
      {
        name: 'Орзо с креветками',
        description:
          'Орзо, лук репчатый, чеснок, масло растительное, бульон куриный, острый соус хариса, томаты вяленые, креветки, петрушка',
        price: 690,
        calories: 620,
        image: hotOrzoShrimp,
      },
      {
        name: 'Бефстроганов, рис жасминовый',
        description:
          'Говяжья вырезка, растительное масло, белый лук, вешенки, сливки, соус демиглас, чеснок, петрушка, рис',
        price: 790,
        calories: 740,
        image: hotBeefStroganoffRice,
      },
      {
        name: 'Куриные котлеты, томатная сальса, бейби картофель',
        description:
          'Куриный фарш из бедра, сливочное масло, яйцо куриное, белый лук, томаты, паприка, лимонный сок, чеснок, базилик, мини-картофель',
        price: 490,
        calories: 580,
        image: chickenCutletsTomatoSalsa,
      },
      {
        name: 'Цыпленок, картофельное пюре',
        description:
          'Цыпленок в маринаде: тимьян, соль, масло растительное, кориандр, перец с/м, чеснок, картофельное пюре, лимон',
        price: 690,
        calories: 640,
        image: chickenLemonMash,
      },
      {
        name: 'Куриная грудка, цукини',
        description: 'Куриная грудка, чеддер, цукини, сливочный понзу, зеленый лук, смесь фурикаке',
        price: 490,
        calories: 420,
        image: chickenBreastZucchini,
      },
      {
        name: 'Рыба в кляре, рис жасминовый',
        description: 'Белая рыба в кляре, рис, соус тар-тар, лимон',
        price: 590,
        calories: 680,
        tags: ['min5portions'],
        image: fishInBatterRice,
      },
    ],
  },
  {
    id: 'sides',
    title: 'Гарниры',
    dishes: [
      { name: 'Картофельное пюре', description: '', price: 200, calories: 180 },
      { name: 'Мини картофель', description: '', price: 200, calories: 200 },
      { name: 'Рис жасминовый', description: '', price: 200, calories: 260 },
      { name: 'Рис дикий', description: '', price: 220, calories: 240 },
    ],
  },
  {
    id: 'drinks',
    title: 'Напитки',
    dishes: [
      {
        name: 'Лимонад из натуральных ингредиентов, 250 мл',
        description: 'В ассортименте. Без добавления красителей, сиропов и усилителей вкуса.',
        price: 290,
        calories: 90,
      },
      {
        name: 'Морс домашний, 250 мл',
        description: 'Красная смородина-клюква',
        price: 250,
        calories: 70,
      },
    ],
  },
]

// Названия — по главному блюду, чтобы сеты различались без чтения
// состава (на оригинале «Готовый сет 1…5» — в комментарии у каждого).
// В исходнике "Готовый сет 5" в двух разных блоках разметки описан
// по-разному: "Салат с уткой" vs "Салат с перепелкой" — расхождение
// самого сайта, а не ошибка переноса. См. docs/BUGS.md.
// calories — сумма оценок позиций сета (см. комментарий выше).
export const sets: MenuSet[] = [
  {
    name: 'Домашний сет', // оригинал: «Готовый сет 1»,
    price: 1600,
    calories: 1320,
    items: ['Зеленый салат с цукини и брокколи', 'Борщ с говядиной', 'Куриные котлеты, мини-картофель'],
    image: set1,
  },
  {
    name: 'Сет с бефстрогановом', // оригинал: «Готовый сет 2»,
    price: 1500,
    calories: 1400,
    items: ['Кенийская фасоль, соус тоннато из тунца', 'Куриный суп с лапшой', 'Бефстроганов, пюре'],
    image: set2,
  },
  {
    name: 'Сет с креветками', // оригинал: «Готовый сет 3»,
    price: 1700,
    calories: 1200,
    items: ['Зеленый салат с цукини и брокколи', 'Суп гаспачо', 'Креветки, бейби картофель, спайси соус'],
    image: set3,
  },
  {
    name: 'Сет с лососем', // оригинал: «Готовый сет 4»,
    price: 1750,
    calories: 1360,
    items: ['Кенийская фасоль, соус тоннато из тунца', 'Суп гаспачо', 'Лосось, рис'],
    image: set4,
  },
  {
    // В разметке сайта этот сет в разных копиях блока указывает то
    // "Салат с уткой", то "Салат с перепелкой" при одинаковой цене и
    // фото — расхождение самого сайта, см. docs/BUGS.md.
    name: 'Сет с уткой', // оригинал: «Готовый сет 5»,
    price: 1900,
    calories: 1520,
    items: ['Салат с уткой', 'Суп борщ', 'Орзо с креветками'],
    image: set5,
  },
  {
    name: 'Веганский сет', // оригинал: «Сет веган»,
    price: 1700,
    tags: ['vegan'],
    calories: 1260,
    items: ['Зеленый салат с цукини и брокколи', 'Суп гаспачо', 'Фалафель, шпинат, хумус'],
    image: setVegan,
  },
]

export const contacts = {
  phone: '+7 (926) 910 10 10',
  phoneHref: 'tel:+79269101010',
  whatsappHref: 'https://wa.me/+79269101010',
  instagramHref: 'https://instagram.com/rider.kitchen',
  instagramLabel: '@rider.kitchen',
}
