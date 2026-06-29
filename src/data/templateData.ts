import { techTemplates } from './templates/tech';
import { businessTemplates } from './templates/business';
import { fashionTemplates } from './templates/fashion';
import { fitnessTemplates } from './templates/fitness';

export interface Template {
  caption: string;
  hashtags: string[];
  type: string;
}

export const initialDomainTemplates: Record<string, Template[]> = {
  tech: techTemplates,
  business: businessTemplates,
  fashion: fashionTemplates,
  fitness: fitnessTemplates,
  food: [
    { caption: "First we eat, then we do everything else. 🍕 This recipe is basically a hug in a bowl.", hashtags: ["Foodie", "HomeCooking", "Delicious", "ComfortFood", "RecipeIdeas"], type: "Standard" },
    { caption: "You don't need a silver fork to eat good food. 🍲 Simple ingredients, maximum flavor.", hashtags: ["HealthyEating", "ChefLife", "FoodPorn", "EasyRecipes", "Gourmet"], type: "Direct" },
    { caption: "POV: You finally perfected that sourdough starter. 🥖 It's a journey, not a destination.", hashtags: ["Baking", "Sourdough", "FoodJourney", "KitchenVibes", "Homemade"], type: "Narrative" },
    { caption: "Brunch is a state of mind. 🥞☕ Sundays were made for slow mornings and maple syrup.", hashtags: ["BrunchLover", "CoffeeTalk", "SundayVibes", "BreakfastInspo", "FoodAesthetic"], type: "Lifestyle" },
    { caption: "If it tastes half as good as it looks, we're in trouble. 🍰✨ Sweet treats for sweet days.", hashtags: ["DessertLover", "BakingDay", "SweetTooth", "PastryChef", "FoodArt"], type: "Whimsical" },
  ],
  gaming: [
    { caption: "Just one more level... 🎮 Famous last words before the sun comes up.", hashtags: ["Gamer", "GamingLife", "RetroGaming", "NextGen", "SetupInspo"], type: "Relatable" },
    { caption: "A world without lag is the only world I want to live in. 🌐🔥", hashtags: ["PCMasterRace", "TwitchStreamer", "CompetitiveGaming", "Tech", "Esports"], type: "Witty" },
    { caption: "Leveling up IRL while I level up in-game. ⚔️ The grind never stops.", hashtags: ["GamingCommunity", "GamerGoals", "AchievementUnlocked", "Streamer", "Action"], type: "Active" },
    { caption: "It's not just a game, it's an escape. 🌌 Exploring new worlds from the comfort of my chair.", hashtags: ["OpenWorld", "RPGGamer", "GamingAesthetic", "VirtualReality", "GamerThoughts"], type: "Narrative" },
    { caption: "Strategy is everything. 🗺️ Thinking three moves ahead while they're still on move one.", hashtags: ["StrategyGames", "IndieGames", "GameDev", "ThinkTank", "Tactical"], type: "Professional" },
  ],
  travel: [
    { caption: "Collect moments, not things. ✈️ There's a whole world out there waiting to be explored, and I'm just getting started.", hashtags: ["TravelGram", "Wanderlust", "ExploreMore", "TravelPhotography", "Adventure"], type: "Inspirational" },
    { caption: "Travel is the only thing you buy that makes you richer. 🌍 Where should my next destination be?", hashtags: ["BucketList", "TravelBlogger", "NatureLover", "SoloTravel", "HiddenGems"], type: "Engaging" },
    { caption: "Lost in the right direction. 🏔️ Sometimes you have to go off the grid to find yourself.", hashtags: ["HikingLife", "MountainView", "OffGrid", "Wilderness", "NaturePhotography"], type: "Adventurous" },
  ],
  pets: [
    { caption: "My therapist has paws and a cold nose. 🐾 Sometimes the best company is the one that doesn't say a word.", hashtags: ["DogLovers", "CatLife", "PetParents", "AnimalLovers", "FurryFriends"], type: "Witty" },
    { caption: "Home is where the heart (and the pet hair) is. 🏠🐕‍🦺", hashtags: ["PetVibes", "AnimalPhotography", "CutePets", "WeekendVibes", "Pawsome"], type: "Minimalist" },
    { caption: "Adopt, don't shop. 🐕 Saving one dog will not change the world, but surely for that one dog, the world will change forever.", hashtags: ["RescueDog", "ShelterPet", "AdoptDontShop", "RescueStory", "AnimalWelfare"], type: "Impactful" },
  ],
  education: [
    { caption: "Knowledge is the only treasure you can give away without losing. 📚 Keep learning, keep growing.", hashtags: ["Education", "LifelongLearning", "BookTok", "StudyGram", "GrowEveryday"], type: "Inspirational" },
    { caption: "Between the pages of a book is a lovely place to be. ✨ What are you currently reading?", hashtags: ["BookLover", "ReadingList", "EducationMatters", "KnowledgeIsPower", "Library"], type: "Engaging" },
  ],
  diy: [
    { caption: "Made with love and a lot of patience. 🎨 There's something magical about creating something from scratch.", hashtags: ["DIYProjects", "Handmade", "Crafty", "CreativeLife", "HomeDecor"], type: "Warm" },
  ],
  automotive: [
    { caption: "Life is too short to drive boring cars. 🏎️💨 Feeling the power and the precision today.", hashtags: ["CarEnthusiast", "SuperCars", "PetrolHead", "DrivingExperience", "AutoStyle"], type: "Energetic" },
  ]
};
