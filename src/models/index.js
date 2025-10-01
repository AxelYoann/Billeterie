const memoryDB = require('../services/memoryDatabase');

// Wrapper pour le modèle User avec fallback sur la base de données mémoire
class UserModel {
  static async findOne(query) {
    return await memoryDB.findUser(query);
  }

  static async findById(id) {
    return await memoryDB.findUserById(id);
  }

  static async create(userData) {
    return await memoryDB.createUser(userData);
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    await memoryDB.initialize();
    const userIndex = memoryDB.users.findIndex(user => user._id === id);
    if (userIndex === -1) return null;

    Object.assign(memoryDB.users[userIndex], updateData);
    return memoryDB.users[userIndex];
  }

  // Méthodes utiles
  static select(fields) {
    return this;
  }
}

// Wrapper pour le modèle Event
class EventModel {
  static async find(query = {}) {
    const events = await memoryDB.findEvents(query);
    return {
      sort: (sortQuery) => ({
        skip: (skipCount) => ({
          limit: (limitCount) => {
            return events.exec().then(allEvents => {
              if (sortQuery.createdAt === -1) {
                allEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
              }
              return allEvents.slice(skipCount, skipCount + limitCount);
            });
          },
          exec: () => {
            return events.exec().then(allEvents => {
              if (sortQuery.createdAt === -1) {
                allEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
              }
              return allEvents.slice(skipCount);
            });
          }
        }),
        exec: () => {
          return events.exec().then(allEvents => {
            if (sortQuery.createdAt === -1) {
              allEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            }
            return allEvents;
          });
        }
      }),
      exec: () => events.exec()
    };
  }

  static async findById(id) {
    return await memoryDB.findEventById(id);
  }

  static async findOne(query) {
    const events = await memoryDB.findEvents(query);
    const allEvents = await events.exec();
    return allEvents[0] || null;
  }

  static async countDocuments(query = {}) {
    const events = await memoryDB.findEvents(query);
    const allEvents = await events.exec();
    return allEvents.length;
  }

  static async create(eventData) {
    await memoryDB.initialize();
    const newEvent = {
      _id: 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      ...eventData,
      createdAt: new Date()
    };
    memoryDB.events.push(newEvent);
    return newEvent;
  }

  static async findByIdAndDelete(id) {
    await memoryDB.initialize();
    const eventIndex = memoryDB.events.findIndex(event => event._id === id);
    if (eventIndex === -1) return null;
    
    const deletedEvent = memoryDB.events[eventIndex];
    memoryDB.events.splice(eventIndex, 1);
    return deletedEvent;
  }
}

// Wrapper pour le modèle Ticket
class TicketModel {
  static async find(query = {}) {
    return await memoryDB.findTickets(query);
  }

  static async countDocuments(query = {}) {
    return await memoryDB.countTickets(query);
  }

  static async create(ticketData) {
    await memoryDB.initialize();
    const newTicket = {
      _id: 'ticket_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      ...ticketData,
      createdAt: new Date()
    };
    memoryDB.tickets.push(newTicket);
    return newTicket;
  }
}

// Mock pour les autres modèles
class ProviderModel {
  static async find(query = {}) {
    // Retourner les utilisateurs prestataires comme providers
    await memoryDB.initialize();
    const providers = memoryDB.users.filter(user => user.role === 'provider');
    return {
      populate: () => ({
        select: () => ({
          sort: () => ({
            limit: () => ({
              skip: () => Promise.resolve(providers)
            })
          })
        })
      })
    };
  }

  static async findById(id) {
    await memoryDB.initialize();
    return memoryDB.users.find(user => user._id === id && user.role === 'provider');
  }

  static async countDocuments(query = {}) {
    await memoryDB.initialize();
    return memoryDB.users.filter(user => user.role === 'provider').length;
  }

  static async create(providerData) {
    return await memoryDB.createUser({ ...providerData, role: 'provider' });
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    return await UserModel.findByIdAndUpdate(id, updateData, options);
  }

  static async findByIdAndDelete(id) {
    await memoryDB.initialize();
    const userIndex = memoryDB.users.findIndex(user => user._id === id && user.role === 'provider');
    if (userIndex === -1) return null;
    
    const deletedUser = memoryDB.users[userIndex];
    memoryDB.users.splice(userIndex, 1);
    return deletedUser;
  }
}

module.exports = {
  User: UserModel,
  Event: EventModel,
  Ticket: TicketModel,
  Provider: ProviderModel
};