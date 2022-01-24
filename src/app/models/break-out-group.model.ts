export class BreakoutGroup {
  tagDisplay = '';
  breakoutGroupID = 0;
  breakoutRoomID = 0;
  breakoutRoom = '';
  characterTheme = '';
  characters = 0;
  spacesAvailable = 0;
  member = false;
  characterName = '';
}

export class CharacterTheme {
  characterThemeID = 0;
  characterTheme = '';
  characters = 0;
  isThemeOwner = false;
  allCharactersAdded = true;
  publicTheme = true;
}

export class Character {
  characterID = 0;
  characterName = '';
  inUse = false;
}
