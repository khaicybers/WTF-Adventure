import _ from 'underscore';

export default class Abilities {
  constructor(player) {
    this.player = player;

    this.abilities = {};
    this.shortcuts = [];

    this.shortcutSize = 5;
  }

  addAbility(ability) {
    this.abilities[ability.name] = ability;
  }

  addShortcut(ability) {
    if (this.shortcutSize >= 5) {
      return;
    }

    this.shortcuts.push(ability.name);
  }

  removeAbility(ability) {
    if (this.isShortcut(ability)) {
      this.removeShortcut(this.shortcuts.indexOf(ability.name));
    }

    delete this.abilities[ability.name];
  }

  removeShortcut(index) {
    if (index > -1) {
      this.shortcuts.splice(index, 1);
    }
  }

  hasAbility(ability) {
    _.each(this.abilities, (uAbility) => {
      if (uAbility.name === ability.name) {
        return true;
      }
      return false;
    });

    return false;
  }

  isShortcut(ability) {
    return this.shortcuts.indexOf(ability.name) > -1;
  }

  getArray() {
    let abilities = '';
    let abilityLevels = '';
    const shortcuts = this.shortcuts.toString();

    _.each(this.abilities, (ability) => {
      abilities += ability.name;
      abilityLevels += ability.level;
    });

    return {
      username: this.player.username,
      abilities,
      abilityLevels,
      shortcuts,
    };
  }
}
