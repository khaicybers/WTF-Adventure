import _ from 'underscore';
import log from '../../../../../util/log.js';
import Slot from './slot.js';
import Items from '../../../../../util/items.js';
import Constants from '../../../../../util/constants.js';

export default class Container {
  constructor(type, owner, size) {
    this.type = type;
    this.owner = owner;
    this.size = size;
    this.slots = [];

    for (let i = 0; i < this.size; i += 1) {
      this.slots.push(new Slot(i));
    }
  }

  /**
   * Fill each slot with manual data or the database
   */
  loadContainer(ids, counts, abilities, abilityLevels) {
    if (ids.length !== this.slots.length) {
      log.error(`[${this.type}] Mismatch in container size.`);
    }

    for (let i = 0; i < this.slots.length; i += 1) {
      this.slots[i].loadSlot(ids[i], counts[i], abilities[i], abilityLevels[i]);
    }
  }

  loadEmpty() {
    const
      data = [];

    /**
     * Better to have it condensed into one.
     */

    for (let i = 0; i < this.size; i += 1) data.push(-1);

    this.loadContainer(data, data, data, data);
  }

  add(id, count, ability, abilityLevel) {
    const maxStackSize = Items.maxStackSize(id) === -1
      ? Constants.MAX_STACK
      : Items.maxStackSize(id);

    if (!id || count < 0 || count > maxStackSize) {
      return null;
    }

    if (!Items.isStackable(id)) {
      if (this.hasSpace()) {
        const nsSlot = this.slots[this.getEmptySlot()]; // non-stackable slot

        nsSlot.loadSlot(id, count, ability, abilityLevel);

        return nsSlot;
      }
    } else if (maxStackSize === -1 || this.type === 'Bank') {
      const sSlot = this.getSlot(id);

      if (sSlot) {
        sSlot.increment(count);
        return sSlot;
      }
      if (this.hasSpace()) {
        const slot = this.slots[this.getEmptySlot()];

        slot.loadSlot(id, count, ability, abilityLevel);

        return slot;
      }
    } else {
      let remainingItems = count;

      for (let i = 0; i < this.slots.length; i += 1) {
        if (this.slots[i].id === id) {
          const rSlot = this.slots[i];

          const available = maxStackSize - rSlot.count;

          if (available >= remainingItems) {
            rSlot.increment(remainingItems);

            return rSlot;
          }
          if (available > 0) {
            rSlot.increment(available);
            remainingItems -= available;
          }
        }
      }

      if (remainingItems > 0 && this.hasSpace()) {
        const rrSlot = this.slots[this.getEmptySlot()];

        rrSlot.loadSlot(id, remainingItems, ability, abilityLevel);

        return rrSlot;
      }
    }

    return null;
  }

  canHold(id, count) {
    if (!Items.isStackable(id)) {
      return this.hasSpace();
    }

    if (this.hasSpace()) {
      return true;
    }

    const maxStackSize = Items.maxStackSize(id);

    if ((this.type === 'Bank' || maxStackSize === -1) && this.contains(id)) {
      return true;
    }

    if (maxStackSize !== -1 && count > maxStackSize) {
      return false;
    }

    let remainingSpace = 0;

    for (let i = 0; i < this.slots.length; i += 1) {
      if (this.slots[i].id === id) {
        remainingSpace += maxStackSize - this.slots[i].count;
      }
    }

    return remainingSpace >= count;
  }

  remove(index, id, count) {
    if (
      !id
      || count < 0
      || !this.contains(id)
      || !this.slots[index]
      || this.slots[index].id === -1
      || this.slots[index].id !== id
    ) return false;

    const slot = this.slots[index];

    if (Items.isStackable(id)) {
      if (count >= slot.count) slot.empty();
      else slot.decrement(count);
    } else slot.empty();

    return true;
  }

  getSlot(id) {
    for (let i = 0; i < this.slots.length; i += 1) {
      if (this.slots[i].id === id) {
        return this.slots[i];
      }
    }

    return null;
  }

  contains(id) {
    for (let i = 0; i < this.slots.length; i += 1) {
      if (this.slots[i].id === id) {
        return true;
      }
    }

    return false;
  }

  containsSpaces(count) {
    const emptySpaces = [];

    for (let i = 0; i < this.slots.length; i += 1) {
      if (this.slots[i].id === -1) {
        emptySpaces.push(this.slots[i]);
      }
    }

    return emptySpaces.length === count;
  }

  hasSpace() {
    return this.getEmptySlot() > -1;
  }

  getEmptySlot() {
    for (let i = 0; i < this.slots.length; i += 1) if (this.slots[i].id === -1) return i;

    return -1;
  }

  getIndex(id) {
    /**
     * Used when the index is not determined,
     * returns the first item found based on the id.
     */

    for (let i = 0; i < this.slots.length; i += 1) {
      if (this.slots[i].id === id) {
        return i;
      }
    }

    return -1;
  }

  check() {
    _.each(this.slots, (slot) => {
      if (isNaN(slot.id)) {
        slot.empty();
      }
    });
  }

  getArray() {
    let
      ids = '';


    let counts = '';


    let abilities = '';


    let abilityLevels = '';

    for (let i = 0; i < this.slots.length; i += 1) {
      ids += `${this.slots[i].id} `;
      counts += `${this.slots[i].count} `;
      abilities += `${this.slots[i].ability} `;
      abilityLevels += `${this.slots[i].abilityLevel} `;
    }

    return {
      username: this.owner.username,
      ids: ids.slice(0, -1),
      counts: counts.slice(0, -1),
      abilities: abilities.slice(0, -1),
      abilityLevels: abilityLevels.slice(0, -1),
    };
  }
}
