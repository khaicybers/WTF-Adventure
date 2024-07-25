import Combat from '../../js/game/entity/character/combat/combat';
import Utils from '../../js/util/utils';
import Messages from '../../js/network/messages';

export default class PirateCaptain extends Combat {
  constructor(character) {
    super(character);
    this.character = Object.assign(character, {
      spawnDistance: 20,
    });

    this.teleportLocations = [];

    this.lastTeleportIndex = 0;
    this.lastTeleport = 0;

    this.location = {
      x: this.character.x,
      y: this.character.y,
    };

    this.load();
  }

  load() {
    const
      south = {
        x: 251,
        y: 574,
      };
    const west = {
      x: 243,
      y: 569,
    };
    const east = {
      x: 258,
      y: 568,
    };
    const north = {
      x: 251,
      y: 563,
    };

    this.teleportLocations.push(north, south, west, east);
  }

  hit(character, target, hitInfo) {
    if (this.canTeleport()) {
      this.teleport();
    } else {
      super.hit(character, target, hitInfo);
    }
  }

  teleport() {
    const position = this.getRandomPosition();

    if (!position) {
      return;
    }

    this.stop();

    this.lastTeleport = new Date().getTime();
    this.lastTeleportIndex = position.index;

    this.character.setPosition(position.x, position.y);

    if (this.world) {
      this.world.pushToGroup(
        this.character.group,
        new Messages.Teleport(
          this.character.instance,
          this.character.x,
          this.character.y,
          true,
        ),
      );
    }

    this.forEachAttacker((attacker) => {
      attacker.removeTarget();
    });

    if (this.character.hasTarget()) {
      this.begin(this.character.target);
    }
  }

  getRandomPosition() {
    const random = Utils.randomInt(0, this.teleportLocations.length - 1);
    const position = this.teleportLocations[random];

    if (!position || random === this.lastTeleportIndex) {
      return null;
    }

    return {
      x: position.x,
      y: position.y,
      index: random,
    };
  }

  canTeleport() {
    // Just randomize the teleportation for shits and giggles.
    return (
      new Date().getTime() - this.lastTeleport > 10000
      && Utils.randomInt(0, 4) === 2
    );
  }

  getHealthPercentage() {
    // Floor it to avoid random floats
    return Math.floor(
      (this.character.hitPoints / this.character.maxHitPoints) * 100,
    );
  }
}
