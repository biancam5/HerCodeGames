import React, { useState, useRef } from 'react';
import { PetType, PlayerProfile } from '../../types';
import { PETS } from '../../data/levels';
import { PetAvatar } from '../pet/PetAvatar';
import {
  Sparkles,
  ArrowRight,
  Play,
  Compass,
  Users,
  Check,
  Wand2,
  AlertCircle,
  Lock,
} from 'lucide-react';

interface WelcomeViewProps {
  existingProfile: PlayerProfile | null;
  allProfiles: PlayerProfile[];
  onStartAdventure: (name: string, petType: PetType, petName: string) => void;
  onContinue: () => void;
  onChooseLevel: () => void;
  onSelectProfile: (id: string) => void;
  onLaunchDemoMode: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  existingProfile,
  allProfiles,
  onStartAdventure,
  onContinue,
  onChooseLevel,
  onSelectProfile,
  onLaunchDemoMode,
}) => {
  const [selectedPet, setSelectedPet] = useState<PetType>('dog');
  const [selectedPetMood, setSelectedPetMood] = useState<'happy' | 'eating' | 'sleeping' | 'playing'>('eating');
  const [playerName, setPlayerName] = useState<string>('');
  const [petCustomName, setPetCustomName] = useState<string>(PETS['dog'].defaultName);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(!existingProfile);
  const [showSwitchModal, setShowSwitchModal] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [petNameError, setPetNameError] = useState<string | null>(null);

  const playerNameInputRef = useRef<HTMLInputElement>(null);
  const petNameInputRef = useRef<HTMLInputElement>(null);

 const handlePetChange = (type: PetType) => {
  if (type !== 'dog') return;

  setSelectedPet(type);
  setPetCustomName(PETS[type].defaultName);
  setSelectedPetMood('eating');

  if (petNameError) {
    setPetNameError(null);
  }
};

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPlayerName(val);
    if (nameError && val.trim()) {
      setNameError(null);
    }
  };

  const handlePetNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPetCustomName(val);
    if (petNameError && val.trim()) {
      setPetNameError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!playerName.trim()) {
      setNameError("Oops! Don't forget to enter your name  ✨");
      hasError = true;
      playerNameInputRef.current?.focus();
    } else {
      setNameError(null);
    }

    if (!petCustomName.trim()) {
      setPetNameError("Oops! Don't forget to give your pet best friend a name! 🐾");
      if (!hasError) {
        petNameInputRef.current?.focus();
      }
      hasError = true;
    } else {
      setPetNameError(null);
    }

    if (hasError) return;

    // MVP safety guard: only Manchu is playable in this version.
    if (selectedPet !== 'dog') {
    setSelectedPet('dog');
    setPetCustomName(PETS['dog'].defaultName);
    return;
  }

    onStartAdventure(playerName.trim(), selectedPet, petCustomName.trim());
  };

  // Returning player view
  if (existingProfile && !isCreatingNew) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 bg-gradient-to-b from-[#FFF5F8] via-[#FAF5FF] to-[#F3F8FF]">
        {/* Main Card */}
        <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-8 border-2 border-pink-100 shadow-xl text-center relative overflow-hidden">
          {/* Top Banner Tag */}
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 text-xs font-bold uppercase tracking-wider mb-4 border border-pink-200 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>✨ Coding game for Girls</span>
          </div>

          <h1 className="font-['Outfit'] font-extrabold text-3xl md:text-4xl text-[#2D264B] tracking-tight">
            Welcome back, <span className="text-pink-600">{existingProfile.name}</span>!
          </h1>
          <p className="mt-2 text-sm md:text-base text-[#685F85]">
            Ready to continue your programming adventure with {existingProfile.pet.name}?
          </p>

          {/* Pet Character Greeting Card */}
          <div className="my-6 p-5 rounded-2xl bg-gradient-to-tr from-pink-50 via-purple-50 to-sky-50 border border-pink-100/80 flex items-center justify-center space-x-5 shadow-inner">
            <PetAvatar type={existingProfile.pet.type} mood="happy" size="lg" />
            <div className="text-left">
              <h3 className="font-bold text-lg text-purple-950">
                {existingProfile.pet.name} the {PETS[existingProfile.pet.type]?.species || 'Pet'}
              </h3>
              <p className="text-xs text-purple-700 mt-0.5">
                ⭐ {existingProfile.stars} Stars Earned &bull; {existingProfile.completedLevels.length} Levels Mastered
              </p>
              <p className="text-xs text-purple-600/80 mt-1 italic">
                Favorite snack: {PETS[existingProfile.pet.type]?.favoriteTreat || 'Treat'}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {existingProfile.badges.slice(0, 3).map((badge, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-white/80 border border-purple-100 rounded-md text-[11px] font-semibold text-purple-800">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              id="welcome-continue-adventure-btn"
              onClick={onContinue}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-['Outfit'] font-bold text-base shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Continue Adventure</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                id="welcome-choose-level-btn"
                onClick={onChooseLevel}
                className="py-3 px-4 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-sm border border-purple-200 transition-colors flex items-center justify-center space-x-1.5"
              >
                <Compass className="w-4 h-4" />
                <span>Choose Level</span>
              </button>

              <button
                id="welcome-switch-player-btn"
                onClick={() => setShowSwitchModal(true)}
                className="py-3 px-4 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-800 font-bold text-sm border border-pink-200 transition-colors flex items-center justify-center space-x-1.5"
              >
                <Users className="w-4 h-4" />
                <span>Switch Player</span>
              </button>
            </div>
          </div>


        {/* Switch Player Modal */}
        {showSwitchModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-purple-100">
              <h3 className="font-['Outfit'] font-bold text-xl text-purple-950 mb-2">Switch Player Profile</h3>
              <p className="text-xs text-purple-700 mb-4">Select a saved player or create a new explorer.</p>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {allProfiles.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectProfile(p.id);
                      setShowSwitchModal(false);
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      p.id === existingProfile.id
                        ? 'bg-pink-50 border-pink-300'
                        : 'bg-white hover:bg-purple-50 border-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <PetAvatar type={p.pet.type} mood="idle" size="sm" />
                      <div>
                        <p className="font-bold text-sm text-purple-950">{p.name}</p>
                        <p className="text-[11px] text-purple-600">
                          {p.pet.name} &bull; ⭐ {p.stars} stars
                        </p>
                      </div>
                    </div>
                    {p.id === existingProfile.id && <Check className="w-5 h-5 text-pink-600" />}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex space-x-2">
                <button
                  id="welcome-create-new-profile-btn"
                  onClick={() => {
                    setShowSwitchModal(false);
                    setIsCreatingNew(true);
                  }}
                  className="flex-1 py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  + Create New Player
                </button>
                <button
                  onClick={() => setShowSwitchModal(false)}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // First time or Create New Player View
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 bg-gradient-to-b from-[#FFF5F8] via-[#FAF5FF] to-[#F3F8FF]">
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 border-2 border-pink-100 shadow-xl text-center">
        {/* Logo Tag */}
        <div className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 text-xs font-bold uppercase tracking-wider mb-3 border border-pink-200 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>✨ Coding game for Girls</span>
        </div>

        <h1 className="font-['Outfit'] font-extrabold text-3xl md:text-4xl text-[#2D264B] tracking-tight">
          Welcome to HerCodeGames
        </h1>
        <p className="mt-2 text-sm md:text-base text-[#685F85]">
          Learn how fun Technology can be ! Learn logic and fundamental programming with games
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 text-left space-y-5">
          {/* Player Name Input */}
          <div>
            <label htmlFor="player-name-input" className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
              Hello, nice to meet you! What is your name?
            </label>
            <input
              ref={playerNameInputRef}
              id="player-name-input"
              type="text"
              placeholder="e.g. Emma, Sofia, Maya..."
              value={playerName}
              onChange={handlePlayerNameChange}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all font-semibold text-sm focus:outline-none ${
                nameError
                  ? 'border-rose-400 bg-rose-50/60 text-rose-950 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                  : 'border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-purple-950 bg-pink-50/40'
              }`}
            />
            {nameError && (
              <div className="mt-1.5 flex items-center space-x-1.5 text-xs text-rose-600 font-semibold animate-bounce-short">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{nameError}</span>
              </div>
            )}
          </div>

         {/* Pet Choice */}
<div>
  <div className="mb-2 flex items-center justify-between">
    <label className="block text-xs font-bold uppercase tracking-wider text-purple-900">
      Choose your best friend:
    </label>

    <span className="text-[11px] text-pink-600 font-semibold">
      Manchu is available now
    </span>
  </div>

  <div className="mb-3 rounded-2xl bg-purple-50 border border-purple-200 px-4 py-3 flex items-center gap-3">
    <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
      <Lock className="w-4 h-4 text-purple-700" />
    </div>

    <div>
      <p className="text-sm font-black text-purple-950">
        More pet adventures are coming soon!
      </p>

      <p className="text-xs font-medium text-purple-700 mt-0.5">
        Manchu the Dalmatian is the only available character in this version.
      </p>
    </div>
  </div>

  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
    {(Object.keys(PETS) as PetType[]).map((type) => {
      const pet = PETS[type];
      const isAvailable = type === 'dog';
      const isSelected = selectedPet === type;

      return (
        <button
          key={type}
          type="button"
          id={`welcome-select-pet-${type}`}
          disabled={!isAvailable}
          onClick={() => handlePetChange(type)}
          className={`relative p-2.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-between overflow-hidden ${
            isAvailable
              ? isSelected
                ? 'border-pink-500 bg-pink-50/95 shadow-md scale-104 ring-2 ring-pink-300 cursor-pointer'
                : 'border-gray-200 bg-white hover:bg-pink-50/40 hover:border-pink-200 cursor-pointer'
              : 'border-slate-200 bg-slate-50 cursor-not-allowed'
          }`}
        >
          <div className="w-full flex justify-end min-h-[28px]">
            {isAvailable ? (
              <span className="text-[9px] bg-emerald-50 border border-emerald-200 rounded-full px-2 py-1 font-black text-emerald-700 uppercase tracking-wide">
                Available
              </span>
            ) : (
              <span className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-sm">
                <Lock className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div
            className={`flex justify-center my-1 ${
              !isAvailable ? 'opacity-55 grayscale' : ''
            }`}
          >
            <PetAvatar
              type={type}
              mood={isSelected ? 'happy' : 'idle'}
              size="sm"
            />
          </div>

          <div className="w-full pb-1">
            <p className="font-['Outfit'] font-extrabold text-xs text-purple-950 truncate">
              {pet.defaultName}
            </p>

            <p className="text-[10px] text-purple-600 font-medium truncate">
              {pet.species}
            </p>
          </div>

          {!isAvailable && (
            <div className="mt-1 w-full rounded-lg bg-slate-800 text-white py-1 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />

              <span className="text-[8px] font-black uppercase tracking-wider">
                Coming Soon
              </span>
            </div>
          )}
        </button>
      );
    })}
  </div>
            {/* Elected Pet Spotlight Showcase - Big Cute Animated Face with Personality Actions */}
            <div className="mt-3.5 p-3.5 bg-gradient-to-tr from-pink-50/90 via-purple-50/80 to-sky-50/90 rounded-2xl border-2 border-pink-200 shadow-sm flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Prominent Pet Face Avatar */}
              <div className="shrink-0 flex flex-col items-center justify-center bg-white/90 rounded-2xl p-2.5 border border-pink-100 shadow-2xs">
                <PetAvatar type={selectedPet} mood={selectedPetMood} size="lg" />
                {/* Personality Action Mood Toggles */}
                <div className="mt-2 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setSelectedPetMood('eating')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                      selectedPetMood === 'eating'
                        ? 'bg-pink-500 text-white shadow-2xs'
                        : 'bg-white text-purple-700 hover:bg-pink-100/70 border border-purple-100'
                    }`}
                    title={`Eat ${PETS[selectedPet].favoriteTreat}`}
                  >
                    Eat {PETS[selectedPet].favoriteTreat.split(' ').pop()}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPetMood('sleeping')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                      selectedPetMood === 'sleeping'
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'bg-white text-purple-700 hover:bg-purple-100/70 border border-purple-100'
                    }`}
                    title="Cozy bed nap"
                  >
                    Sleep 💤
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPetMood('happy')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                      selectedPetMood === 'happy'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-white text-purple-700 hover:bg-amber-100/70 border border-purple-100'
                    }`}
                    title="Cute & sparkling with hearts"
                  >
                    Cute 💖
                  </button>
                </div>
              </div>

              {/* Pet Personality Details */}
              <div className="flex-1 text-left">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div>
                    <h4 className="font-['Outfit'] font-extrabold text-base text-purple-950">
                      {PETS[selectedPet].defaultName} the {PETS[selectedPet].species}
                    </h4>
                    <p className="text-xs font-semibold text-pink-600">
                      {PETS[selectedPet].personality}
                    </p>
                  </div>
                  <span className="text-xs bg-white/95 border border-pink-200 text-purple-800 font-bold px-2 py-1 rounded-full shadow-2xs">
                    Loves {PETS[selectedPet].favoriteTreat}
                  </span>
                </div>

                {/* Personality Traits Chips */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PETS[selectedPet].traits?.map((trait, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white/90 border border-purple-200/90 rounded-md text-[10px] font-bold text-purple-900 shadow-2xs"
                    >
                      {trait}
                    </span>
                  ))}
                </div>

                {/* Personality Tagline */}
                <p className="mt-2 text-xs text-purple-900 leading-relaxed font-medium bg-white/70 p-2.5 rounded-xl border border-purple-100/80 shadow-2xs">
                  {PETS[selectedPet].tagline}
                </p>
              </div>
            </div>
          </div>

          {/* Pet Custom Name */}
          <div>
            <label htmlFor="pet-custom-name-input" className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
              Give your {PETS[selectedPet]?.species} a nickname:
            </label>
            <input
              ref={petNameInputRef}
              id="pet-custom-name-input"
              type="text"
              value={petCustomName}
              onChange={handlePetNameChange}
              placeholder="e.g. Luna, Manchu, Wendy, Tokki..."
              className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all font-semibold text-sm focus:outline-none ${
                petNameError
                  ? 'border-rose-400 bg-rose-50/60 text-rose-950 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                  : 'border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-purple-950 bg-purple-50/40'
              }`}
            />
            {petNameError && (
              <div className="mt-1.5 flex items-center space-x-1.5 text-xs text-rose-600 font-semibold animate-bounce-short">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{petNameError}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            id="welcome-start-adventure-btn"
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl font-['Outfit'] font-bold text-base shadow-md transition-all flex items-center justify-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer active:scale-[0.99]"
          >
            <span>Start Coding Game Adventure</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        
      </div>
    </div>
  );
};
