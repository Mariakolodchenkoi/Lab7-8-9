class EventEmitter {
  constructor() {
    this.events = {};
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(data));
  }
}

module.exports = EventEmitter;