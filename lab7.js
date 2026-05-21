class EventEmitter {
  constructor() {
    this.events = {};
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(data));
  }

  subscribe(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return () => this.unsubscribe(event, listener);
  }

  unsubscribe(event, listenerToRemove) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(
      listener => listener !== listenerToRemove
    );
  }
}

const bus = new EventEmitter();
const logger = (msg) => console.log(`[Logger]: ${msg}`);
const UI = (msg) => console.log(`[UI Render]:"${msg}"`);

const unsubLogger = bus.subscribe('update', logger);
bus.subscribe('update', UI);

console.log("First emit:");
bus.emit('update', 'change state');

unsubLogger();

console.log("\nSecond emit:");
bus.emit('update', 'change state again');
