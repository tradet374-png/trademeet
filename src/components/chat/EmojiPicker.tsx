// src/components/chat/EmojiPicker.tsx
import React, { useState, useMemo } from 'react';
import { Search, Flame, Smile, ThumbsUp, Heart, Sparkles, Coffee, Briefcase, Flag } from 'lucide-react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

interface EmojiCategory {
  id: string;
  name: string;
  icon: any;
  emojis: { char: string; keywords: string }[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'trading',
    name: 'Trading & Stonks',
    icon: Flame,
    emojis: [
      { char: '🚀', keywords: 'rocket moon to the moon pump' },
      { char: '📈', keywords: 'chart up bullish stonks green' },
      { char: '📉', keywords: 'chart down bearish red dip' },
      { char: '💎', keywords: 'diamond hands hodl' },
      { char: '🐂', keywords: 'bull bullish market run' },
      { char: '🐻', keywords: 'bear bearish dump' },
      { char: '💰', keywords: 'money bag profit rich cash' },
      { char: '🎯', keywords: 'target hit goal accuracy' },
      { char: '🤑', keywords: 'money mouth rich cash profit' },
      { char: '📊', keywords: 'bar chart analysis stats' },
      { char: '⚡', keywords: 'lightning scalping fast speed' },
      { char: '💸', keywords: 'money wings cash fly loss' },
      { char: '🧠', keywords: 'brain big brain intelligence' },
      { char: '👑', keywords: 'crown king winner boss' },
      { char: '🤝', keywords: 'handshake deal agreement' },
      { char: '🟢', keywords: 'green light circle buy long' },
      { char: '🔴', keywords: 'red circle sell short stop loss' },
      { char: '⭐', keywords: 'star favorite win' },
      { char: '🔥', keywords: 'fire hot pump trending' },
      { char: '🍿', keywords: 'popcorn watching drama action' },
      { char: '💣', keywords: 'bomb explosion volatile' },
      { char: '💯', keywords: '100 percent perfect accurate' },
      { char: '🛑', keywords: 'stop sign stop loss exit' },
      { char: '👀', keywords: 'eyes watching looking alert' },
    ],
  },
  {
    id: 'smileys',
    name: 'Smileys & Reactions',
    icon: Smile,
    emojis: [
      { char: '😀', keywords: 'grinning face happy smile' },
      { char: '😃', keywords: 'smiley big eyes happy' },
      { char: '😄', keywords: 'smile eyes happy laugh' },
      { char: '😁', keywords: 'beam grinning teeth happy' },
      { char: '😆', keywords: 'laugh closed eyes haha' },
      { char: '😅', keywords: 'sweat smile nervous relief' },
      { char: '🤣', keywords: 'rofl rolling on floor laughing lol' },
      { char: '😂', keywords: 'joy tears laughing lol' },
      { char: '🙂', keywords: 'slightly smiling calm okay' },
      { char: '🙃', keywords: 'upside down sarcasm ironical' },
      { char: '😉', keywords: 'wink playful secret' },
      { char: '😊', keywords: 'blush smile warm content' },
      { char: '😇', keywords: 'angel halo pure good' },
      { char: '🥰', keywords: 'love hearts affectionate' },
      { char: '😍', keywords: 'heart eyes love enamored' },
      { char: '🤩', keywords: 'star struck excited amazed' },
      { char: '😘', keywords: 'blow kiss love affection' },
      { char: '😋', keywords: 'yummy tongue delicious' },
      { char: '😛', keywords: 'tongue playful joke' },
      { char: '😜', keywords: 'wink tongue wacky crazy' },
      { char: '🤪', keywords: 'zany wacky wild crazy' },
      { char: '😝', keywords: 'squint tongue hilarious' },
      { char: '🤗', keywords: 'hug smiling warm welcome' },
      { char: '🤭', keywords: 'hand over mouth giggle oops' },
      { char: '🤫', keywords: 'shh quiet secret' },
      { char: '🤔', keywords: 'thinking ponder hmm consider' },
      { char: '🤐', keywords: 'zipper mouth silent secret' },
      { char: '🤨', keywords: 'raised eyebrow skeptical doubt' },
      { char: '😐', keywords: 'neutral blank meh' },
      { char: '😑', keywords: 'expressionless poker face' },
      { char: '😶', keywords: 'no mouth speechless quiet' },
      { char: '😏', keywords: 'smirk sly smug confident' },
      { char: '😒', keywords: 'unamused annoyed displeased' },
      { char: '🙄', keywords: 'eye roll sarcastic whatever' },
      { char: '😬', keywords: 'grimace awkward tension yikes' },
      { char: '🤥', keywords: 'lying pinocchio fib' },
      { char: '😌', keywords: 'relieved peace calm zen' },
      { char: '😔', keywords: 'pensive sad reflective' },
      { char: '😪', keywords: 'sleepy tired exhausted' },
      { char: '🤤', keywords: 'drool desire craving' },
      { char: '😴', keywords: 'sleeping zzz tired' },
      { char: '😷', keywords: 'mask sick covid doctor' },
      { char: '🤒', keywords: 'thermometer fever sick' },
      { char: '🤕', keywords: 'bandage hurt injury wounded' },
      { char: '🤢', keywords: 'nauseated disgust green sick' },
      { char: '🤮', keywords: 'vomiting barf gross' },
      { char: '🤧', keywords: 'sneeze allergy tissue cold' },
      { char: '🥵', keywords: 'hot heat sweating red face' },
      { char: '🥶', keywords: 'cold freezing ice blue face' },
      { char: '🥴', keywords: 'woozy drunk dizzy tipsy' },
      { char: '😵', keywords: 'dizzy dead knocked out' },
      { char: '🤯', keywords: 'exploding head mind blown shock' },
      { char: '🤠', keywords: 'cowboy hat western yeehaw' },
      { char: '🥳', keywords: 'party celebration confetti happy' },
      { char: '😎', keywords: 'sunglasses cool boss confident' },
      { char: '🤓', keywords: 'nerd glasses smart geek' },
      { char: '🧐', keywords: 'monocle inspect curious analyze' },
      { char: '😕', keywords: 'confused puzzled unsure' },
      { char: '😟', keywords: 'worried anxious concerned' },
      { char: '🙁', keywords: 'frown sad unhappy' },
      { char: '😮', keywords: 'open mouth surprise wow' },
      { char: '😯', keywords: 'hushed quiet surprised' },
      { char: '😲', keywords: 'astonished shocked amazed' },
      { char: '😳', keywords: 'flushed blushing shocked wide eyes' },
      { char: '🥺', keywords: 'pleading puppy eyes please beg' },
      { char: '😦', keywords: 'frowning open mouth distress' },
      { char: '😧', keywords: 'anguished pain hurt shock' },
      { char: '😨', keywords: 'fear scared fright' },
      { char: '😰', keywords: 'anxious sweat scared nervous' },
      { char: '😥', keywords: 'sad relieved whew' },
      { char: '😢', keywords: 'crying tear sad upset' },
      { char: '😭', keywords: 'loudly crying sobbing weeping' },
      { char: '😱', keywords: 'scream fear terror horror munch' },
      { char: '😖', keywords: 'confounded frustration upset' },
      { char: '😣', keywords: 'persevering struggle endure' },
      { char: '😞', keywords: 'disappointed upset regret' },
      { char: '😓', keywords: 'downcast sweat hard work' },
      { char: '😩', keywords: 'weary tired fed up' },
      { char: '😫', keywords: 'tired exhausted stressed' },
      { char: '🥱', keywords: 'yawn bored sleepy' },
      { char: '😤', keywords: 'triumph huff puff anger proud' },
      { char: '😡', keywords: 'enraged angry red fury mad' },
      { char: '😠', keywords: 'angry mad annoyed' },
      { char: '🤬', keywords: 'cursing swearing profanity mad' },
      { char: '😈', keywords: 'devil evil smile purple' },
      { char: '👿', keywords: 'devil angry evil purple' },
      { char: '💀', keywords: 'skull dead skeleton dying lol' },
      { char: '☠️', keywords: 'skull crossbones poison danger' },
      { char: '💩', keywords: 'poop funny brown crap' },
      { char: '🤡', keywords: 'clown foolish circus joke' },
      { char: '👹', keywords: 'ogre monster mask red' },
      { char: '👺', keywords: 'goblin tengu mask red' },
      { char: '👻', keywords: 'ghost spooky boo halloween' },
      { char: '👽', keywords: 'alien ufo extraterrestrial' },
      { char: '👾', keywords: 'alien monster space arcade 8bit' },
      { char: '🤖', keywords: 'robot bot automated tech' },
    ],
  },
  {
    id: 'hands',
    name: 'Gestures & People',
    icon: ThumbsUp,
    emojis: [
      { char: '👋', keywords: 'wave hand hello goodbye' },
      { char: '🤚', keywords: 'raised back of hand' },
      { char: '🖐️', keywords: 'splayed fingers hand stop five' },
      { char: '✋', keywords: 'high five stop hand' },
      { char: '🖖', keywords: 'vulcan spock star trek live long' },
      { char: '👌', keywords: 'ok hand perfect nice' },
      { char: '🤌', keywords: 'pinched fingers italian chef kiss' },
      { char: '🤏', keywords: 'pinching hand small little tiny' },
      { char: '✌️', keywords: 'peace sign victory two v' },
      { char: '🤞', keywords: 'crossed fingers luck hope wish' },
      { char: '🤟', keywords: 'love you gesture rock' },
      { char: '🤘', keywords: 'horns rock heavy metal party' },
      { char: '🤙', keywords: 'call me shaka phone hang loose' },
      { char: '👈', keywords: 'point left finger' },
      { char: '👉', keywords: 'point right finger' },
      { char: '👆', keywords: 'point up finger' },
      { char: '👇', keywords: 'point down finger' },
      { char: '☝️', keywords: 'index up one point' },
      { char: '👍', keywords: 'thumbs up like approve good yes' },
      { char: '👎', keywords: 'thumbs down dislike bad no' },
      { char: '✊', keywords: 'fist raised solidarity power' },
      { char: '👊', keywords: 'fist bump punch hit' },
      { char: '🤛', keywords: 'left fist bump' },
      { char: '🤜', keywords: 'right fist bump' },
      { char: '👏', keywords: 'clapping hands applause bravo' },
      { char: '🙌', keywords: 'raising hands celebrate praise' },
      { char: '👐', keywords: 'open hands welcome' },
      { char: '🤲', keywords: 'palms up together prayer' },
      { char: '🙏', keywords: 'folded hands pray thank you please' },
      { char: '✍️', keywords: 'writing hand pen signing note' },
      { char: '💅', keywords: 'nail polish sassy glam care' },
      { char: '🤳', keywords: 'selfie phone camera photo' },
      { char: '💪', keywords: 'muscle flex strong power gym' },
      { char: '🦵', keywords: 'leg limb kick walk' },
      { char: '🦶', keywords: 'foot barefoot step toe' },
      { char: '👂', keywords: 'ear hear listen audio' },
      { char: '👃', keywords: 'nose smell sniff' },
      { char: '👀', keywords: 'eyes look watch see spy' },
      { char: '👁️', keywords: 'eye sight vision watch' },
      { char: '👅', keywords: 'tongue taste lick' },
      { char: '👄', keywords: 'mouth lips kiss speak' },
    ],
  },
  {
    id: 'hearts',
    name: 'Hearts & Symbols',
    icon: Heart,
    emojis: [
      { char: '❤️', keywords: 'red heart love passion' },
      { char: '🧡', keywords: 'orange heart love' },
      { char: '💛', keywords: 'yellow heart friendship' },
      { char: '💚', keywords: 'green heart nature profit' },
      { char: '💙', keywords: 'blue heart peace loyalty' },
      { char: '💜', keywords: 'purple heart luxury honor' },
      { char: '🖤', keywords: 'black heart dark heavy' },
      { char: '🤍', keywords: 'white heart pure clear' },
      { char: '🤎', keywords: 'brown heart solid' },
      { char: '💔', keywords: 'broken heart heartbreak sad' },
      { char: '❣️', keywords: 'heart exclamation mark' },
      { char: '💕', keywords: 'two hearts love floating' },
      { char: '💞', keywords: 'revolving hearts love rotation' },
      { char: '💓', keywords: 'beating heart pulse love' },
      { char: '💗', keywords: 'growing heart love expand' },
      { char: '💖', keywords: 'sparkling heart love shines' },
      { char: '💘', keywords: 'cupid heart arrow love hit' },
      { char: '💝', keywords: 'heart with ribbon gift love' },
      { char: '✨', keywords: 'sparkles shine magic clean gold' },
      { char: '🌟', keywords: 'glowing star shines bright' },
      { char: '💫', keywords: 'dizzy star shooting sparkle' },
      { char: '💥', keywords: 'boom explosion bang pow' },
      { char: '💢', keywords: 'anger vein anime pop' },
      { char: '💦', keywords: 'sweat drops water splash drip' },
      { char: '💨', keywords: 'dash puff smoke speed fast' },
      { char: '🔔', keywords: 'bell alert notification ring' },
      { char: '🔕', keywords: 'bell slash mute silence' },
      { char: '🎵', keywords: 'musical note audio sound tune' },
      { char: '🎶', keywords: 'musical notes music song audio' },
      { char: '⚡', keywords: 'voltage lightning shock power' },
      { char: '💡', keywords: 'lightbulb idea smart think' },
      { char: '🏆', keywords: 'trophy champion win 1st award' },
      { char: '🥇', keywords: 'gold medal 1st place winner' },
      { char: '🥈', keywords: 'silver medal 2nd place' },
      { char: '🥉', keywords: 'bronze medal 3rd place' },
      { char: '✅', keywords: 'check mark done approved green' },
      { char: '❌', keywords: 'cross mark cancel error red x' },
      { char: '⚠️', keywords: 'warning alert caution triangle' },
      { char: '🚨', keywords: 'police beacon siren emergency' },
      { char: '🛑', keywords: 'stop sign red octagonal' },
      { char: '♾️', keywords: 'infinity infinite endless forever' },
    ],
  },
  {
    id: 'objects',
    name: 'Objects & Food',
    icon: Coffee,
    emojis: [
      { char: '☕', keywords: 'coffee hot drink morning energy' },
      { char: '🍵', keywords: 'tea green matcha drink' },
      { char: '🍕', keywords: 'pizza food slice cheese' },
      { char: '🍔', keywords: 'burger hamburger fast food' },
      { char: '🍟', keywords: 'french fries chips mcdonalds' },
      { char: '🍺', keywords: 'beer mug drink alcohol pub' },
      { char: '🍻', keywords: 'clinking beers toast celebration' },
      { char: '🥂', keywords: 'champagne glasses cheers toast' },
      { char: '🍷', keywords: 'wine glass red drink' },
      { char: '🥃', keywords: 'whiskey tumbler scotch drink' },
      { char: '🍸', keywords: 'cocktail martini olive drink' },
      { char: '🍾', keywords: 'champagne pop bottle celebration' },
      { char: '🚗', keywords: 'car automobile vehicle drive' },
      { char: '🏎️', keywords: 'race car f1 formula fast lambo' },
      { char: '✈️', keywords: 'airplane flight travel fly' },
      { char: '🛳️', keywords: 'ship cruise boat yacht travel' },
      { char: '💻', keywords: 'laptop computer macbook pc terminal' },
      { char: '📱', keywords: 'mobile phone iphone smartphone screen' },
      { char: '⌚', keywords: 'watch time rolex apple watch' },
      { char: '⏰', keywords: 'alarm clock time wake bell' },
      { char: '🕹️', keywords: 'joystick gaming video game play' },
      { char: '🎲', keywords: 'dice gambling casino roll odds' },
      { char: '🎰', keywords: 'slot machine 777 jackpot casino win' },
      { char: '🎁', keywords: 'wrapped present gift surprise' },
    ],
  },
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('trading');

  const filteredEmojis = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      const cat = EMOJI_CATEGORIES.find((c) => c.id === activeTab);
      return cat ? cat.emojis : EMOJI_CATEGORIES[0].emojis;
    }

    // Search across ALL categories for matching emojis
    const matches: { char: string; keywords: string }[] = [];
    const seen = new Set<string>();

    EMOJI_CATEGORIES.forEach((cat) => {
      cat.emojis.forEach((e) => {
        if (!seen.has(e.char) && e.keywords.includes(q)) {
          seen.add(e.char);
          matches.push(e);
        }
      });
    });

    return matches;
  }, [search, activeTab]);

  return (
    <div className="absolute bottom-16 right-0 left-0 sm:left-auto sm:right-2 sm:w-80 md:w-88 bg-[#151B2B] border border-[#232D42] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[420px] select-none">
      {/* Top Header */}
      <div className="p-2.5 border-b border-[#232D42] flex items-center justify-between bg-[#1A2234]">
        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#00C896]" />
          <span>Emojis & Reactions</span>
        </span>
        <button
          onClick={onClose}
          className="text-[#929BAD] hover:text-white text-xs px-2 py-0.5 rounded"
        >
          ✕
        </button>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-[#232D42] bg-[#0B0F19]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#5F6B84] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all emojis (e.g. rocket, bull, lol, fire)..."
            className="w-full bg-[#151B2B] border border-[#232D42] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#5F6B84] focus:outline-none focus:border-[#00C896]"
          />
        </div>

        {/* Category Tabs (when not searching) */}
        {!search && (
          <div className="flex items-center gap-1 mt-2 overflow-x-auto scrollbar-none">
            {EMOJI_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  title={cat.name}
                  className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                    activeTab === cat.id
                      ? 'bg-[#00C896] text-[#0B0F19] font-bold'
                      : 'text-[#929BAD] hover:text-white hover:bg-[#1A2234]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Emojis Grid */}
      <div className="flex-1 overflow-y-auto p-2.5 max-h-[260px]">
        {filteredEmojis.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#5F6B84]">
            No emojis match "{search}"
          </div>
        ) : (
          <div className="grid grid-cols-7 sm:grid-cols-8 gap-1.5">
            {filteredEmojis.map((e, idx) => (
              <button
                key={`${e.char}-${idx}`}
                onClick={() => {
                  onSelect(e.char);
                  onClose();
                }}
                title={e.keywords}
                className="w-9 h-9 rounded-lg hover:bg-[#232D42] text-xl flex items-center justify-center transition-transform hover:scale-130 active:scale-95"
              >
                {e.char}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
